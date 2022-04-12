// Note that there is no global objects like Game or Memory. All methods, prototypes and constants are imported built-in modules
// import {
//   ATTACK,
//   CostMatrix,
//   HEAL,
//   RANGED_ATTACK,
//   RoomPosition,
//   getDirection,
//   getRange,
//   getObjectById,
//   getObjectsByPrototype,
//   getTime
// } from "game";

// Everything can be imported either from the root /game module or corresponding submodules
// import { pathFinder } from "game";
// pathFinder.searchPath();
// import { prototypes } from "game";
// prototypes.Creep
// prototypes.RoomObject

// import {searchPath } from '/game/path-finder';
// import {Creep} from '/game/prototypes';

// This would work too:
// import * as PathFinder from '/game/path-finder'; --> PathFinder.searchPath
// import {Creep} from '/game/prototypes/creep';
// import * as prototypes from '/game/prototypes'; --> prototypes.Creep

// This stuff is arena-specific
import { ATTACK, HEAL, RANGED_ATTACK, TOWER_CAPACITY, TOWER_RANGE } from "game/constants";
import { BodyPart, Flag } from "arena";
import { Creep, GameObject, StructureTower } from "game/prototypes";
import { getDirection, getObjectsByPrototype, getRange, getTicks } from "game/utils";
import { searchPath } from "game/path-finder";
import GameManager from "../utils/GameManager";

// We can define global objects that will be valid for the entire match.
// The game guarantees there will be no global reset during the match.
// Note that you cannot assign any game objects here, since they are populated on the first tick, not when the script is initialized.
// let myCreeps: Creep[];
// let enemyCreeps: Creep[];
// let myTower: StructureTower[];
let enemyFlag: Flag | undefined;

// This is the only exported function from the main module. It is called every tick.
export function loop(): void {
  // We assign global variables here. They will be accessible throughout the tick, and even on the following ticks too.
  // getObjectsByPrototype function is the alternative to Room.find from Screeps World.
  // There is no Game.creeps or Game.structures, you can manage game objects in your own way.

  // allCreeps = CreepManager.getCreeps().all;

  // myCreeps = CreepManager.getCreeps().my;
  // enemyCreeps = CreepManager.getCreeps().enemy;
  // myCreeps = getObjectsByPrototype(Creep).filter(i => i.my);
  // enemyCreeps = getObjectsByPrototype(Creep).filter(i => !i.my);
  // enemyFlag = getObjectsByPrototype(Flag).find(i => !i.my);
  enemyFlag = GameManager.flags.enemy[0];

  // Run all my creeps according to their bodies
  const myCreeps = GameManager.creeps.my;

  // console.log(GameManager);

  myCreeps.forEach(creep => {
    if (creep.role == null) {
      assignRole(creep);
    }
    creep.act?.();
  });

  const myTower = GameManager.towers.my;
  myTower.forEach(t => tower(t));
}

function init() {}

function assignRole(creep: Creep) {
  if (creep.body.some(i => i.hits > 0 && i.type === ATTACK)) {
    creep.role = "melee";
    creep.act = meleeAttacker.bind(null, creep);
  } else if (creep.body.some(i => i.hits > 0 && i.type === RANGED_ATTACK)) {
    creep.role = "ranged";
    creep.act = rangedAttacker.bind(null, creep);
  } else if (creep.body.some(i => i.hits > 0 && i.type === HEAL)) {
    creep.role = "heal";
    creep.act = healer.bind(null, creep);
  }

  // if (creep.role != null) {
  //   creep.act = act[creep.role].bind(null, creep);
  // }
}

const act: Record<string, (creep: Creep) => void> = {
  melee: meleeAttacker,
  ranged: rangedAttacker,
  heal: healer
};

function meleeAttacker(creep: Creep) {
  // Here is the alternative to the creep "memory" from Screeps World. All game objects are persistent. You can assign any property to it once, and it will be available during the entire match.
  if (!creep.initialPos) {
    creep.initialPos = { x: creep.x, y: creep.y };
  }

  const targets = GameManager.creeps.enemy
    // .filter(i => getRange(i, creep.initialPos) < 10)
    .sort((a, b) => getRange(a, creep) - getRange(b, creep));

  if (targets.length > 0) {
    creep.moveTo(targets[0]);
    creep.attack(targets[0]);
  } else {
    creep.moveTo(creep.initialPos);
  }
}

function rangedAttacker(creep: Creep) {
  const enemyCreeps = GameManager.creeps.enemy;
  const targets = enemyCreeps.sort((a, b) => getRange(a, creep) - getRange(b, creep));

  if (targets.length > 0) {
    creep.rangedAttack(targets[0]);
  }

  if (enemyFlag) {
    creep.moveTo(enemyFlag);
  }

  const range = 3;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
  if (enemiesInRange.length > 0) {
    flee(creep, enemiesInRange, range);
  }
}

function healer(creep: Creep) {
  const myCreeps = GameManager.creeps.my;
  const targets = myCreeps.filter(i => i !== creep && i.hits < i.hitsMax).sort((a, b) => a.hits - b.hits);

  if (targets.length) {
    creep.moveTo(targets[0]);
  } else {
    if (enemyFlag) {
      creep.moveTo(enemyFlag);
    }
  }

  const healTargets = myCreeps.filter(i => getRange(i, creep) <= 3).sort((a, b) => a.hits - b.hits);

  if (healTargets.length > 0) {
    if (getRange(healTargets[0], creep) === 1) {
      creep.heal(healTargets[0]);
    } else {
      creep.rangedHeal(healTargets[0]);
    }
  }

  const range = 7;
  const enemyCreeps = GameManager.creeps.enemy;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
  if (enemiesInRange.length > 0) {
    flee(creep, enemiesInRange, range);
  }

  if (enemyFlag) {
    creep.moveTo(enemyFlag);
  }
}

function flee(creep: Creep, targets: GameObject[], range: number) {
  const result = searchPath(
    creep,
    targets.map(i => ({ pos: i, range })),
    { flee: true }
  );
  if (result.path.length > 0) {
    const direction = getDirection(result.path[0].x - creep.x, result.path[0].y - creep.y);
    creep.move(direction);
  }
}

function tower(tower: StructureTower) {
  const enemyCreeps = GameManager.creeps.enemy;
  const attackRange = 10;
  const attackTargets = enemyCreeps.filter(c => getRange(c, tower) < attackRange).sort((a, b) => a.hits - b.hits);

  if (attackTargets.length > 0) {
    tower.attack(attackTargets[0]);
    return;
  }

  if (tower.store.energy < TOWER_CAPACITY) return;

  const farTargets = enemyCreeps.filter(c => getRange(c, tower) <= TOWER_RANGE).sort((a, b) => a.hits - b.hits);
  if (farTargets.length > 0) {
    tower.attack(farTargets[0]);
    return;
  }
}

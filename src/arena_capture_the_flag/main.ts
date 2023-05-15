// This stuff is arena-specific
import { ATTACK, HEAL, RANGED_ATTACK, TOWER_CAPACITY, TOWER_RANGE } from "game/constants";
import { Creep, StructureTower } from "game/prototypes";
import { getRange } from "game/utils";
import GameManager from "../utils/GameManager";
import "../roles/RoleCreep";

// We can define global objects that will be valid for the entire match.
// The game guarantees there will be no global reset during the match.
// Note that you cannot assign any game objects here, since they are populated on the first tick, not when the script is initialized.

// This is the only exported function from the main module. It is called every tick.
export function loop(): void {
  // Run all my creeps according to their bodies
  const myCreeps = GameManager.creeps.my;

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
  } else if (creep.body.some(i => i.hits > 0 && i.type === RANGED_ATTACK)) {
    creep.role = "ranged";
  } else if (creep.body.some(i => i.hits > 0 && i.type === HEAL)) {
    creep.role = "heal";
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

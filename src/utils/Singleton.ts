import { Flag } from "arena/prototypes";
import { Creep, GameObject, StructureTower, _Constructor } from "game/prototypes";
import { getObjectsByPrototype, getTicks } from "game/utils";

type Group<T> = {
  all: T[];
  my: T[];
  enemy: T[];
};

const getCreepsInternal = () => {
  const creeps = getObjectsByPrototype(Creep);
  const my: Creep[] = [];
  const enemy: Creep[] = [];

  creeps.reduce(
    (acc, cur) => {
      acc[cur.my ? "my" : "enemy"].push(cur);
      return acc;
    },
    { my, enemy }
  );

  return { all: creeps, my, enemy };
};

export const CreepManager = (function () {
  let lastTick = -1;
  let creeps: {
    all: Creep[];
    my: Creep[];
    enemy: Creep[];
  } = getCreeps();

  function getCreeps() {
    if (getTicks() === lastTick) {
      return creeps;
    }
    lastTick = getTicks();
    return getCreepsInternal();
  }

  return { getCreeps };
})();

type Ownable<T> = {
  my: boolean;
} & T;

function isOwnable<T>(prototype: _Constructor<T>): prototype is _Constructor<Ownable<T>> {
  return "my" in prototype;
}

// const getOwnableGameObjects = <T>(prototype: _Constructor<T>): Group<T> {}

const getGameObjectsInternal = <T>(prototype: _Constructor<T>): Group<T> => {
  const all = getObjectsByPrototype(prototype);
  const my: T[] = [];
  const enemy: T[] = [];

  if ("my" in prototype.prototype) {
    (all as Ownable<T>[]).reduce(
      (acc, cur) => {
        acc[cur.my ? "my" : "enemy"].push(cur);
        return acc;
      },
      { my, enemy }
    );
  }

  return { all, my, enemy };
};

export class GameManager {
  lastTick = -1;

  creeps = this.emptyGroup<Creep>();
  towers = this.emptyGroup<StructureTower>();
  flags = this.emptyGroup<Flag>();

  emptyGroup<T>(): Group<T> {
    return {
      all: [],
      my: [],
      enemy: []
    };
  }

  reload() {
    if (getTicks() === this.lastTick) return;
    this.lastTick = getTicks();

    this.creeps = getGameObjectsInternal(Creep);
    this.towers = getGameObjectsInternal(StructureTower);
    this.flags = getGameObjectsInternal(Flag);
    // console.log(this.creeps);
  }
}

// export const GameManager = (function () {
//   let lastTick = -1;

//   function emptyGroup<T>(): Group<T> {
//     return {
//       all: [],
//       my: [],
//       enemy: []
//     };
//   }

//   let creeps = emptyGroup<Creep>();
//   let towers = emptyGroup<StructureTower>();
//   let flags = emptyGroup<Flag>();

//   function reload() {
//     console.log(lastTick);
//     console.log(getTicks());
//     if (getTicks() === lastTick) return;
//     lastTick = getTicks();

//     creeps = getGameObjectsInternal(Creep);
//     towers = getGameObjectsInternal(StructureTower);
//     flags = getGameObjectsInternal(Flag);
//     console.log(creeps);
//   }

//   return { reload, creeps, towers, flags };
// })();

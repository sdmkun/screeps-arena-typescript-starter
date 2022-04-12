import { Flag } from "arena/prototypes";
import { Creep, StructureTower, _Constructor } from "game/prototypes";
import { getObjectsByPrototype, getTicks } from "game/utils";

type Group<T> = {
  all: T[];
  my: T[];
  enemy: T[];
};

type Ownable<T> = {
  my: boolean;
} & T;

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

function emptyGroup<T>(): Group<T> {
  return {
    all: [],
    my: [],
    enemy: []
  };
}

let _lastTicks: Record<string, number> = {};

let _creeps = emptyGroup<Creep>();
let _towers = emptyGroup<StructureTower>();
let _flags = emptyGroup<Flag>();

class GameManager {
  static get creeps(): Group<Creep> {
    if (_lastTicks["creep"] !== getTicks()) {
      _lastTicks["creep"] = getTicks();
      _creeps = getGameObjectsInternal(Creep);
    }
    return _creeps;
  }

  static get towers(): Group<StructureTower> {
    if (_lastTicks["tower"] !== getTicks()) {
      _lastTicks["tower"] = getTicks();
      _towers = getGameObjectsInternal(StructureTower);
    }
    return _towers;
  }

  static get flags(): Group<Flag> {
    if (_lastTicks["flag"] !== getTicks()) {
      _lastTicks["flag"] = getTicks();
      _flags = getGameObjectsInternal(Flag);
    }
    return _flags;
  }
}

export default GameManager;

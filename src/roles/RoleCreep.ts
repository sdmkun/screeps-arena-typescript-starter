import { Creep } from "game/prototypes";
import meleeAttacker from "./meleeAttacker";
import rangedAttacker from "./RangedAttacker";
import healer from "./healer";

Creep.prototype.act = function (this: Creep) {
  const role = this.role;
  if (typeof role === "string" && role in actions) {
    actions[role].bind(this)();
  }
};

const actions = {
  melee: meleeAttacker,
  ranged: rangedAttacker,
  heal: healer
};

import { Creep } from "game/prototypes";
import { getRange } from "game/utils";
import GameManager from "utils/GameManager";

export default function meleeAttacker(this: Creep) {
  // Here is the alternative to the creep "memory" from Screeps World. All game objects are persistent. You can assign any property to it once, and it will be available during the entire match.
  if (!this.initialPos) {
    this.initialPos = { x: this.x, y: this.y };
  }

  const targets = GameManager.creeps.enemy
    // .filter(i => getRange(i, creep.initialPos) < 10)
    .sort((a, b) => getRange(a, this) - getRange(b, this));

  if (targets.length > 0) {
    this.moveTo(targets[0]);
    this.attack(targets[0]);
  } else {
    this.moveTo(this.initialPos);
  }
}

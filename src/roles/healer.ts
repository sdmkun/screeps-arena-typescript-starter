import { Creep } from "game/prototypes";
import { getRange } from "game/utils";
import GameManager from "utils/GameManager";
import flee from "./Flee";

export default function healer(this: Creep) {
  const enemyFlag = GameManager.flags.enemy[0];
  const myCreeps = GameManager.creeps.my;
  const targets = myCreeps.filter(i => i !== this && i.hits < i.hitsMax).sort((a, b) => a.hits - b.hits);

  if (targets.length) {
    this.moveTo(targets[0]);
  } else {
    if (enemyFlag) {
      this.moveTo(enemyFlag);
    }
  }

  const healTargets = myCreeps.filter(i => getRange(i, this) <= 3).sort((a, b) => a.hits - b.hits);

  if (healTargets.length > 0) {
    if (getRange(healTargets[0], this) === 1) {
      this.heal(healTargets[0]);
    } else {
      this.rangedHeal(healTargets[0]);
    }
  }

  const range = 7;
  const enemyCreeps = GameManager.creeps.enemy;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, this) < range);
  if (enemiesInRange.length > 0) {
    flee(this, enemiesInRange, range);
  }

  if (enemyFlag) {
    this.moveTo(enemyFlag);
  }
}

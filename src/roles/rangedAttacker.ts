import { Creep } from "game/prototypes";
import { getRange } from "game/utils";
import GameManager from "utils/GameManager";
import flee from "./Flee";

export default function rangedAttacker(this: Creep) {
  const enemyFlag = GameManager.flags.enemy[0];
  const enemyCreeps = GameManager.creeps.enemy;
  const range = 3;
  const targets = enemyCreeps
    .filter(c => getRange(c, this) <= range)
    .sort((a, b) => getRange(a, this) - getRange(b, this))
    .sort((a, b) => a.hits - b.hits);

  if (targets.length > 0) {
    this.rangedAttack(targets[0]);
  }

  const fleeRange = 2;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, this) <= fleeRange);
  if (enemiesInRange.length > 0) {
    flee(this, enemiesInRange, range);
  } else if (enemyFlag) {
    this.moveTo(enemyFlag);
  }
}

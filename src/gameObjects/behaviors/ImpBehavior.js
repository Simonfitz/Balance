import { UnitBehavior } from './UnitBehavior.js';

export class ImpBehavior extends UnitBehavior {
  calculateDamage(unit) {
    const impCount = unit.currentScene.monsterArray.filter(
      (monster) => monster._unitName === 'imp' && monster._isActive
    ).length;
    // Each imp beyond the first adds 20% damage
    const damageBonus = 1.0 + (impCount - 1) * 0.2;
    return unit._baseDamage * damageBonus;
  }
}

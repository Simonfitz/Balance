import { UnitBehavior } from './UnitBehavior.js';
import { Projectile } from '../projectile.js';

export class ImpBehavior extends UnitBehavior {
  calculateDamage(unit) {
    if (!unit || !unit.currentScene || !unit.currentScene.monsterArray) {
      return unit?._baseDamage || 0;
    }

    const impCount = unit.currentScene.monsterArray.filter(
      (monster) => monster?._unitName === 'imp' && monster?._isActive
    ).length;
    // Each imp beyond the first adds 20% damage
    const damageBonus = 1.0 + (impCount - 1) * 0.2;
    return (unit._baseDamage || 0) * damageBonus;
  }

  onAttack(unit, target) {
    if (!unit || !unit.currentScene || !target) return;

    // Create a projectile with the calculated damage
    const damage = this.calculateDamage(unit);
    new Projectile(unit.currentScene, unit, target, damage, {
      texture: 'flare',
      speed: 500,
      scale: 0.3,
      tint: 0xff0000, // Red for monsters
      lifespan: 2000,
    });
  }
}

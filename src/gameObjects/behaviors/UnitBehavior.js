import { Projectile } from '../projectile.js';

export class UnitBehavior {
  constructor() {
    this.name = 'DefaultBehavior';
  }

  calculateDamage(unit) {
    return unit._baseDamage;
  }

  onAttack(unit, target) {
    if (!unit || !unit.currentScene || !target) return;

    // Create a basic projectile (blue for heroes, red for monsters)
    const isHero = unit.bench === unit.currentScene.heroBench;
    const damage = this.calculateDamage(unit);
    new Projectile(unit.currentScene, unit, target, damage, {
      texture: 'flare',
      speed: 500,
      scale: 0.3,
      tint: isHero ? 0x00aaff : 0xff0000,
      lifespan: 2000,
    });
  }
}

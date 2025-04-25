import { UnitBehavior } from './UnitBehavior.js';
import { Projectile } from '../projectile.js';
import Monster from '../monster.js';

export class MageBehavior extends UnitBehavior {
  constructor() {
    super();
    this.name = 'MageBehavior';
    this.chainDamageMultiplier = 0.5; // Chain targets take 50% damage
  }

  calculateDamage(unit) {
    return unit._baseDamage;
  }

  onAttack(unit, target) {
    console.log(
      `[MageBehavior] Chain attack triggered by ${unit._unitName} on target ${target._unitName}`
    );

    // Create main projectile (blue for heroes, red for monsters)
    const isHero = !(unit instanceof Monster);
    const mainProjectile = new Projectile(unit.currentScene, unit, target, unit._baseDamage, {
      texture: 'flare',
      speed: 500,
      scale: 0.4,
      tint: isHero ? 0x00aaff : 0xff0000,
      lifespan: 3000,
      onHit: () => this.triggerChainAttack(unit, target, isHero), // Add callback for chain attack
    });
  }

  triggerChainAttack(unit, target, isHero) {
    // Get the target's adjacent units
    const targetAdjacent = unit.currentScene.gameState.getRowAdjacentUnits(target) || new Set();
    console.log(`[MageBehavior] Found ${targetAdjacent.size} adjacent units`);

    // Store chain targets and create projectiles
    const chainTargets = [];
    targetAdjacent.forEach((adjacentUnit) => {
      // Only damage enemy units (monsters for heroes, heroes for monsters)
      if (
        !adjacentUnit._isDead &&
        ((unit instanceof Monster && !(adjacentUnit instanceof Monster)) ||
          (!(unit instanceof Monster) && adjacentUnit instanceof Monster))
      ) {
        chainTargets.push(adjacentUnit);
      }
    });

    // Create chain projectiles with staggered timing
    chainTargets.forEach((chainTarget, index) => {
      const chainDamage = unit._baseDamage * this.chainDamageMultiplier;
      console.log(`[MageBehavior] Chaining ${chainDamage} damage to ${chainTarget._unitName}`);

      // Create chain projectile after a delay based on index
      unit.currentScene.time.delayedCall(200 + index * 100, () => {
        // Check if target is still alive before creating projectile
        if (!chainTarget._isDead) {
          new Projectile(unit.currentScene, target, chainTarget, chainDamage, {
            texture: 'flare',
            speed: 400,
            scale: 0.3,
            tint: isHero ? 0x00ffff : 0xff5555,
            lifespan: 2000,
            isChain: true,
          });
        }
      });
    });
  }
}

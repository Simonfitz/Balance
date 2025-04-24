import { UnitBehavior } from './UnitBehavior.js';

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

    // Get the target's adjacent monsters
    const targetAdjacent = unit.currentScene.gameState.getRowAdjacentUnits(target) || new Set();
    console.log(`[MageBehavior] Found ${targetAdjacent.size} adjacent monsters`);

    // Apply chain damage to adjacent monsters
    targetAdjacent.forEach((adjacentUnit) => {
      if (!adjacentUnit._isDead) {
        const chainDamage = unit._baseDamage * this.chainDamageMultiplier;
        console.log(`[MageBehavior] Chaining ${chainDamage} damage to ${adjacentUnit._unitName}`);
        adjacentUnit.takeDamage(chainDamage);

        // Create chain effect particles
        this.createChainEffect(unit, target, adjacentUnit);
      } else {
        console.log(`[MageBehavior] Skipping dead adjacent unit ${adjacentUnit._unitName}`);
      }
    });

    // Create initial attack particles using the unit's emitter
    if (!target._isDead) {
      const sourcePos = { x: unit.x, y: unit.y };
      const targetPos = { x: target.x, y: target.y };
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;

      unit.emitter.setPosition(sourcePos.x, sourcePos.y);
      unit.emitter.setConfig({
        moveToX: dx,
        moveToY: dy,
        speed: 200,
        lifespan: 200,
        gravity: 0,
        blendMode: 'ADD',
      });

      unit.emitter.start();
      unit.currentScene.time.delayedCall(200, () => unit.emitter.stop());
    }
  }

  createChainEffect(unit, target, adjacentUnit) {
    console.log(
      `[MageBehavior] Creating chain effect from ${target._unitName} to ${adjacentUnit._unitName}`
    );

    // Create a separate particle effect for the chain
    const particles = unit.currentScene.add.particles(0, 0, 'flare', {
      lifespan: 200,
      speed: 200,
      blendMode: 'ADD',
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      color: [0x00aaff, 0x00ffff], // Blue to cyan gradient
      emitting: false, // Don't start emitting until we're ready
    });

    // Position particles along the chain path
    const startX = target.x;
    const startY = target.y;
    const endX = adjacentUnit.x;
    const endY = adjacentUnit.y;

    // Create a curved path for the chain effect
    const path = new Phaser.Curves.Path();
    path.moveTo(startX, startY);
    path.quadraticBezierTo(
      (startX + endX) / 2,
      Math.min(startY, endY) - 50, // Create an arc above the units
      endX,
      endY
    );

    // Emit particles along the path
    particles.startFollow(path);
    particles.start();

    // Clean up after effect
    unit.currentScene.time.delayedCall(200, () => {
      particles.stop();
      particles.destroy();
    });
  }
}

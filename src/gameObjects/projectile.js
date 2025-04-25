export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, source, target, damage, config = {}) {
    // Default config
    const defaultConfig = {
      texture: 'flare',
      speed: 300,
      scale: 0.3,
      trailColor: 0x00aaff,
      impactColor: 0x00ffff,
      lifespan: 2000, // Max time before auto-destroy
      isChain: false,
      onHit: null, // Callback function for when projectile hits
    };

    // Merge config with defaults
    const finalConfig = { ...defaultConfig, ...config };

    // Initialize sprite
    super(scene, source.x, source.y, finalConfig.texture);
    this.damage = damage;
    this.target = target;
    this.config = finalConfig;

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.body.enable = true;
    this.body.setCircle(8); // Set a small collision circle
    this.body.setCollideWorldBounds(false);
    this.body.setBounce(0);
    this.body.setImmovable(true);

    // Set up collision
    scene.physics.add.overlap(this, target, this.onHit, null, this);

    // Set up trail effect
    this.trail = scene.add.particles(this.x, this.y, 'flare', {
      follow: this,
      scale: { start: finalConfig.scale, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 2,
      color: finalConfig.trailColor,
      blendMode: 'ADD',
    });

    // Launch projectile at target
    const angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
    scene.physics.velocityFromRotation(angle, finalConfig.speed, this.body.velocity);

    // Set up auto-destroy timer
    this.lifespanTimer = scene.time.delayedCall(finalConfig.lifespan, () => this.destroy());

    // Set depth to appear above units
    this.setDepth(10);
  }

  onHit(projectile, target) {
    // Apply damage
    target.takeDamage(this.damage);

    // Create impact effect
    const impact = this.scene.add.particles(target.x, target.y, 'flare', {
      scale: { start: this.config.scale * 2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 10,
      color: this.config.impactColor,
      blendMode: 'ADD',
    });

    // Clean up impact effect
    this.scene.time.delayedCall(200, () => {
      impact.destroy();
    });

    // Call the onHit callback if provided
    if (this.config.onHit) {
      this.config.onHit();
    }

    // Clean up projectile
    this.destroy();
  }

  destroy() {
    // Clean up trail
    if (this.trail) {
      this.trail.destroy();
    }

    // Clean up lifespan timer
    if (this.lifespanTimer) {
      this.lifespanTimer.destroy();
    }

    // Call parent destroy
    super.destroy();
  }
}

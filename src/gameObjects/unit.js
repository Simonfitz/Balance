import ASSETS from '../assets.js';
import HealthBar from './healthBar.js';

export default class Unit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.currentScene = scene;
    this.emitter = this.scene.add.particles(0, 0, 'flare', {
      lifespan: 200,
      gravity: 500,
      blendMode: 'ADD',
      moveToX: 50,
      moveToY: 50,
    });
    this.emitter.stop();

    // Initial default stats
    this._unitBaseStats = {};
    this._unitName = unitName;
    this._health = 100;
    this._maxHealth = 100;
    this._baseDamage = 1;
    this._attackTime = 3.0;
    this._respawnTime = 3.0;
    this._attackCharge = 0.0;
    this._attackSpeed = 1.0;
    this._isDead = false;
    this._isActive = true;

    // Store initial spawn position
    this._spawnX = x;
    this._spawnY = y;
    this._mostRecentValidPosition = { x: x, y: y };

    // Relevent UI locations
    this.bench = scene.heroBench;
    this.slots = scene.heroSlots;

    // Create health bar
    this.healthBar = new HealthBar(scene, x, y - 50, 40, 5);
    this.healthBar.setDepth(1); // Make sure health bar is above the unit

    this.setInteractive({ useHandCursor: true, draggable: true });
    this.on('drag', (pointer, dragX, dragY) => this.setPosition(dragX, dragY));

    // Add hover and press effects
    this.on('pointerover', () => {
      this.setTint(0xcccccc); // Lighten the sprite on hover
    });

    this.on('pointerout', () => {
      this.clearTint(); // Remove tint when not hovering
    });

    this.on('pointerdown', () => {
      this.setTint(0x999999); // Darken the sprite when pressed
    });

    this.on('pointerup', () => {
      this.updatePosition();
    });
  }

  // Getters & Setters
  get health() {
    return this._health;
  }

  set health(value) {
    this._health = Math.max(0, value);
    // Update health bar
    this.healthBar.setHealth(this._health / this._maxHealth);
    if (this._health === 0 && !this._isDead) {
      this.die();
    }
  }

  get attackSpeed() {
    return this._attackSpeed;
  }

  set attackSpeed(value) {
    this._attackSpeed = value;
  }

  get respawnTime() {
    return this._respawnTime;
  }

  set respawnTime(value) {
    this._respawnTime = value;
  }

  // Damage method
  takeDamage(amount) {
    if (this._isDead) return;
    this.health -= amount;
  }

  // Die method
  die() {
    this._isDead = true;
    this._isActive = false;
    this.setVisible(false);
    this.setActive(false);
    this.healthBar.setVisible(false);
    this.deathAffects();

    // Schedule respawn
    this.scene.time.delayedCall(this._respawnTime * 1000, () => {
      this.respawn();
    });
  }

  deathAffects() {
    // See Hero Monster classes
  }

  // Respawn method
  respawn() {
    this._isDead = false;
    this._isActive = true;
    this._health = this._maxHealth;
    this.setPosition(this._mostRecentValidPosition.x, this._mostRecentValidPosition.y);
    this.setVisible(true);
    this.setActive(true);
    this.healthBar.setVisible(true);
    this.healthBar.setHealth(1);
    // this.play('mageIdle');
  }

  /**
   * Updates the unit's state each frame
   * @param {number} time - The current time
   * @param {number} delta - The time elapsed since last frame in milliseconds
   */
  update(time, delta) {
    if (this.healthBar) {
      this.healthBar.setPosition(this.x, this.y - 50);
    }
    if (this._attackCharge < this._attackTime && this._isActive) {
      this._attackCharge += delta / 1000.0;
    }
  }

  /**
   * Checks if the unit can attack and returns the damage amount
   * @returns {number} The damage amount if the unit can attack, 0 otherwise
   */
  canAttack() {
    if (this._attackCharge >= this._attackTime) {
      this._attackCharge = 0;
      return this._baseDamage;
    }
    return 0;
  }

  // Override destroy method to clean up health bar
  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy();
  }

  updatePosition() {
    const newPosition = this.snapToPosition();
    if (this.isPositionValid(newPosition)) {
      this._mostRecentValidPosition.x = this.x;
      this._mostRecentValidPosition.y = this.y;
    } else {
      this.setPosition(this._mostRecentValidPosition.x, this._mostRecentValidPosition.y);
    }
  }

  isPositionValid(newPosition) {
    if (newPosition === this.bench && !this.isBenchFull()) {
      this.sendToBench();
      return true;
    }
    if (this.slots.some((obj) => obj === newPosition) && newPosition._isEmpty === true) {
      this.sendToField(newPosition);
      return true;
    } else {
      return false;
    }
  }

  toggleActive(state) {
    if (state === false) {
      this._isActive = false;
      this.healthBar.destroy();
    } else {
      if (this._isActive === false) {
        this.healthBar = new HealthBar(this.currentScene, this.x, this.y - 50, 40, 5);
        this.healthBar.setDepth(1); // Make sure health bar is above the unit
      }
      this._isActive = true;
    }
  }

  snapToPosition() {
    // Return the closest object
    if (
      this.x <= this.bench.width ||
      this.x >= this.currentScene.cameras.main.width - this.bench.width
    ) {
      return this.bench;
    } else {
      let closestDistance = Infinity;
      let closestSlot = null;

      this.slots.forEach((element) => {
        const dist = this.getDistance(this.x, this.y, element.x, element.y);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestSlot = element;
        }
      });

      return closestSlot;
    }
  }

  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  loadBaseStats() {
    this._maxHealth = this._unitBaseStats.maxHealth;
    this._health = this._maxHealth;
    this._attackTime = this._unitBaseStats.attackTime;
    this._respawnTime = this._unitBaseStats.respawnTime;
    this._baseDamage = this._unitBaseStats.baseDamage;
    this._value = this._unitBaseStats.maxHealth / 20.0;
  }
}

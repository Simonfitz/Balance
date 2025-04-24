import ASSETS from '../assets.js';
import HealthBar from './healthBar.js';

export default class Unit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.currentScene = scene;

    // Initialise particle emitter for attack effects
    this.emitter = this.scene.add.particles(0, 0, 'flare', {
      lifespan: 200,
      gravity: 500,
      blendMode: 'ADD',
      moveToX: 50,
      moveToY: 50,
    });
    this.emitter.stop();

    // Initialise unit stats
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

    // Store position data
    this._spawnX = x;
    this._spawnY = y;
    this._mostRecentValidPosition = { x: x, y: y };

    // Set UI references
    this.bench = scene.heroBench;
    this.slots = scene.heroSlots;

    // Initialise health bar
    this.healthBar = new HealthBar(scene, x, y - 50, 40, 5);
    this.healthBar.setDepth(1);

    // Setup drag and drop functionality
    this.setInteractive({ useHandCursor: true, draggable: true });
    this.on('drag', (pointer, dragX, dragY) => this.setPosition(dragX, dragY));

    // Setup hover and click effects
    this.on('pointerover', () => this.setTint(0xcccccc));
    this.on('pointerout', () => this.clearTint());
    this.on('pointerdown', () => this.setTint(0x999999));
    this.on('pointerup', () => this.updatePosition());
  }

  // Getters & Setters
  get health() {
    return this._health;
  }

  set health(value) {
    this._health = Math.max(0, value);
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

  /**
   * Applies damage to the unit and triggers death if health reaches zero
   */
  takeDamage(amount) {
    if (this._isDead) return;
    this.health -= amount;
  }

  /**
   * Handles unit death - hides the unit and schedules respawn
   */
  die() {
    this._isDead = true;
    this._isActive = false;
    this.setVisible(false);
    this.setActive(false);
    this.healthBar.setVisible(false);
    this.deathAffects();

    this.scene.time.delayedCall(this._respawnTime * 1000, () => this.respawn());
  }

  /**
   * Override in child classes to handle unit-specific death effects
   */
  deathAffects() {
    // Implemented in Hero and Monster classes
  }

  /**
   * Respawns the unit with full health at its last valid position
   */
  respawn() {
    this._isDead = false;
    this._isActive = true;
    this._health = this._maxHealth;
    this.setPosition(this._mostRecentValidPosition.x, this._mostRecentValidPosition.y);
    this.setVisible(true);
    this.setActive(true);
    this.healthBar.setVisible(true);
    this.healthBar.setHealth(1);
  }

  /**
   * Updates unit state each frame
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
   * Checks if the unit can attack and returns damage if ready
   */
  canAttack() {
    if (this._attackCharge >= this._attackTime) {
      this._attackCharge = 0;
      return this._baseDamage;
    }
    return 0;
  }

  /**
   * Updates the unit's position based on drag and drop
   */
  updatePosition() {
    const newPosition = this.snapToPosition();
    if (this.isPositionValid(newPosition)) {
      this._mostRecentValidPosition.x = this.x;
      this._mostRecentValidPosition.y = this.y;
    } else {
      this.setPosition(this._mostRecentValidPosition.x, this._mostRecentValidPosition.y);
    }
  }

  /**
   * Validates if a position is a valid placement for the unit
   */
  isPositionValid(newPosition) {
    if (newPosition === this.bench && !this.isBenchFull()) {
      this.moveToBench();
      return true;
    }
    if (this.slots.some((obj) => obj === newPosition) && newPosition._isEmpty === true) {
      this.moveToField(newPosition);
      return true;
    }
    return false;
  }

  /**
   * Toggles the unit's active state and manages its health bar
   */
  toggleActive(state) {
    if (state === false) {
      this._isActive = false;
      this.healthBar.destroy();
    } else {
      if (this._isActive === false) {
        this.healthBar = new HealthBar(this.currentScene, this.x, this.y - 50, 40, 5);
        this.healthBar.setDepth(1);
      }
      this._isActive = true;
    }
  }

  /**
   * Finds the closest valid position for the unit
   */
  snapToPosition() {
    if (
      this.x <= this.bench.width ||
      this.x >= this.currentScene.cameras.main.width - this.bench.width
    ) {
      return this.bench;
    }

    let closestDistance = Infinity;
    let closestSlot = null;

    this.slots.forEach((slot) => {
      const dist = this.getDistance(this.x, this.y, slot.x, slot.y);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestSlot = slot;
      }
    });

    return closestSlot;
  }

  /**
   * Calculates the distance between two points
   */
  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Loads unit stats from the base stats configuration
   */
  loadBaseStats() {
    this._maxHealth = this._unitBaseStats.maxHealth;
    this._health = this._maxHealth;
    this._attackTime = this._unitBaseStats.attackTime;
    this._respawnTime = this._unitBaseStats.respawnTime;
    this._baseDamage = this._unitBaseStats.baseDamage;
    this._value = this._unitBaseStats.maxHealth / 20.0;
  }

  /**
   * Cleans up resources when the unit is destroyed
   */
  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy();
  }
}

import ASSETS from '../assets.js';

export default class Unit extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);

    // Initial stats
    this._health = 100;
    this._attackSpeed = 1.0;
    this._respawnTime = 3.0;
    this._isDead = false;

    // Store initial spawn position
    this._spawnX = x;
    this._spawnY = y;

    this.setInteractive({ useHandCursor: true });

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
        this.destroy();
    });

  }

  // Getters & Setters
  get health() { return this._health; }
  set health(value) {
    this._health = Math.max(0, value);
    if (this._health === 0 && !this._isDead) {
      this.die();
    }
  }

  get attackSpeed() { return this._attackSpeed; }
  set attackSpeed(value) { this._attackSpeed = value; }

  get respawnTime() { return this._respawnTime; }
  set respawnTime(value) { this._respawnTime = value; }

  // Damage method
  takeDamage(amount) {
    if (this._isDead) return;
    this.health -= amount;
  }

  // Die method
  die() {
    this._isDead = true;
    this.setVisible(false);
    this.setActive(false);

    // Schedule respawn
    this.scene.time.delayedCall(this._respawnTime * 1000, () => {this.respawn();});
    }

  // Respawn method
  respawn() {
    this._isDead = false;
    this._health = 100;
    this.setPosition(this._spawnX, this._spawnY);
    this.setVisible(true);
    this.setActive(true);
    }
}

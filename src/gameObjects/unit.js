import ASSETS from '../assets.js';
import HealthBar from './healthBar.js';

export default class Unit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.emitter = this.scene.add.particles(0, 0, 'flare', {
      lifespan: 200,
      gravity: 500,
      blendMode: 'ADD',
      moveToX: 50,
      moveToY: 50
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
    
    this._isDead = false;

    this._isActive = true;
    this._mostRecentValidPosition = {x:x, y:y}
    this._attackCharge = 0.0;
    this._attackSpeed = 1.0;


    // Store initial spawn position
    this._spawnX = x;
    this._spawnY = y;

    // Create health bar
    this.healthBar = new HealthBar(scene, x, y - 50, 40, 5);
    this.healthBar.setDepth(1); // Make sure health bar is above the unit

    // Create idle animation if it doesn't exist
    // if (!scene.anims.exists('mageIdle')) {
    //   scene.anims.create({
    //     key: 'mageIdle',
    //     frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: -1 }),
    //     frameRate: 10,
    //     repeat: -1,
    //   });
    // }

    // Play the idle animation
    // this.play('mageIdle');

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
      //this.destroy();
      this.updateState()
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

    // Schedule respawn
    this.scene.time.delayedCall(this._respawnTime * 1000, () => {
      this.respawn();
    });
  }

  // Respawn method
  respawn() {
    this._isDead = false;
    this._isActive = true;
    this._health = this._maxHealth;
    this.setPosition(this._spawnX, this._spawnY);
    this.setVisible(true);
    this.setActive(true);
    this.healthBar.setVisible(true);
    this.healthBar.setHealth(1);
    // this.play('mageIdle');
  }

  // Update method to keep health bar position in sync
  update(time, delta) {
    if (this.healthBar) {
      this.healthBar.setPosition(this.x, this.y - 50);
    }
    if (this._attackCharge<this._attackTime && this._isActive){
      this._attackCharge+=delta/1000.0;
    }
  }

  attackQuery() {
    if (this._attackCharge>=this._attackTime){
      this._attackCharge=0;
      return this._baseDamage;
    }
    return 0
  }

  // Override destroy method to clean up health bar
  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy();
  }

  updateState(){
    // check current position against positions of bench and placement tiles
    // update if moved near a valid zone, otherwise revert position and do not update any flags
    if (this.isPositionValid()){
      this.updatePosition(this.x, this.y)
      this.toggleActive()
    }
    else{
      this.setPosition(this._mostRecentValidPosition.x, this._mostRecentValidPosition.y)
    }
  }

  isPositionValid(){
    // if position has changed
    if (this.x != this._mostRecentValidPosition.x || this.y != this._mostRecentValidPosition.y){
      // if at the bench
      if (this.x <= 50){
        return true;
      }
    }
    else {
      return false;
      }
  }

  updatePosition(x, y){
    this._mostRecentValidPosition.x = x
    this._mostRecentValidPosition.y = y
  }

  toggleActive(){
    if (this._isActive === true) {
      this._isActive = false;
      this.healthBar.destroy()
      } 
    else {
      this._isActive = true;
      }
  }

  loadBaseStats() {
    this._maxHealth = this._unitBaseStats.maxHealth;
    this._health = this._maxHealth;
    this._attackTime = this._unitBaseStats.attackTime;
    this._respawnTime = this._unitBaseStats.respawnTime;
    this._baseDamage = this._unitBaseStats.baseDamage;
  }
}

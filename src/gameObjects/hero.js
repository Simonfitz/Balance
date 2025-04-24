import Unit from './unit.js';
import jsonData from '../../assets/resources/unit_specs/hero.json' with { type: 'json' };

export default class Hero extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    this._unitBaseStats = jsonData[unitName];
    super.loadBaseStats();
    scene.add.existing(this);

    // Set UI references
    this.bench = scene.heroBench;
    this.slots = scene.heroSlots;
    this.currentScene = scene;
  }

  /**
   * Moves the hero to a specific slot on the field
   * Updates bench size if the hero was previously on the bench
   */
  moveToField(slot) {
    this.setPosition(slot.x, slot.y);
    if (!this._isActive) {
      this.currentScene.heroBenchCurrentSize--;
    }
    this.toggleActive(true);
  }

  /**
   * Moves the hero to the bench
   * Updates bench size and calculates position based on current bench occupancy
   */
  moveToBench() {
    if (this._isActive) {
      this.currentScene.heroBenchCurrentSize++;
      this.toggleActive(false);
    }

    const benchPosition = this.calculateBenchPosition();
    this.setPosition(this.bench.x, benchPosition);
  }

  /**
   * Calculates the vertical position on the bench based on current bench occupancy
   */
  calculateBenchPosition() {
    const benchHeight = this.bench.height;
    const benchTop = this.bench.y - benchHeight / 2;
    const benchFillRatio =
      this.currentScene.heroBenchCurrentSize / this.currentScene.heroBenchMaxSize;
    return benchTop + benchFillRatio * benchHeight;
  }

  /**
   * Checks if the hero bench has reached its maximum capacity
   */
  isBenchFull() {
    return this.currentScene.heroBenchCurrentSize >= this.currentScene.heroBenchMaxSize;
  }

  /**
   * Handles death effects - adds blue currency to the bank based on the hero's value
   */
  deathAffects() {
    this.currentScene.currencyBank.addBlue(this._value);
  }
}

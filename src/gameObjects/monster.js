import Unit from './unit.js';
import jsonData from '../../assets/resources/unit_specs/monster.json' with { type: 'json' };

export default class Monster extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    this._unitBaseStats = jsonData[unitName];
    super.loadBaseStats();
    scene.add.existing(this);

    // Set UI references
    this.bench = scene.monsterBench;
    this.slots = scene.monsterSlots;
    this.currentScene = scene;
  }

  /**
   * Moves the monster to a specific slot on the field
   * Updates bench size if the monster was previously on the bench
   */
  moveToField(slot) {
    this.setPosition(slot.x, slot.y);
    slot._isEmpty = false;
    if (!this._isActive) {
      this.currentScene.monsterBenchCurrentSize--;
    }
    this.toggleActive(true);
  }

  /**
   * Moves the monster to the bench
   * Updates bench size and calculates position based on current bench occupancy
   */
  moveToBench() {
    this.currentScene.monsterBenchCurrentSize++;
    const benchPosition = this.calculateBenchPosition();
    this.setPosition(this.bench.x, benchPosition);
    this.toggleActive(false);
  }

  /**
   * Calculates the vertical position on the bench based on current bench occupancy
   */
  calculateBenchPosition() {
    const benchHeight = this.bench.height;
    const benchTop = this.bench.y - benchHeight / 2;
    const benchFillRatio =
      this.currentScene.monsterBenchCurrentSize / this.currentScene.monsterBenchMaxSize;
    return benchTop + benchFillRatio * benchHeight;
  }

  /**
   * Checks if the monster bench has reached its maximum capacity
   */
  isBenchFull() {
    return this.currentScene.monsterBenchCurrentSize >= this.currentScene.monsterBenchMaxSize;
  }

  /**
   * Handles death effects - adds red currency to the bank based on the monster's value
   */
  deathAffects() {
    this.currentScene.currencyBank.addRed(this._value);
  }
}

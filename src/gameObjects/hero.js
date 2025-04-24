import Unit from './unit.js';
import jsonData from '../../assets/resources/unit_specs/hero.json' with { type: 'json' };

export default class Hero extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame, unitName);

    // Set UI references first
    this.bench = scene.heroBench;
    this.slots = scene.heroSlots;
    this.currentScene = scene;

    // Then load stats
    this._unitBaseStats = jsonData[unitName];
    this.loadBaseStats();

    // Track bench position
    this._benchPositionIndex = -1;
  }

  /**
   * Moves the hero to a specific slot on the field
   * Updates bench size if the hero was previously on the bench
   */
  moveToField(slot) {
    const slotIndex = this.slots.indexOf(slot);
    if (slotIndex === -1) return;

    if (!this._isActive) {
      this.currentScene.heroBenchCurrentSize--;
      this.currentScene.updateHeroBenchPosition(this._benchPositionIndex, -1, this);
      this._benchPositionIndex = -1;
    }

    this.setPosition(slot.x, slot.y);
    this._mostRecentValidPosition = { x: slot.x, y: slot.y };
    slot._isEmpty = false;
    this.currentScene.updateHeroFieldState(slotIndex, this);
    this.toggleActive(true);
  }

  /**
   * Moves the hero to the bench
   * Updates bench size and calculates position based on current bench occupancy
   */
  moveToBench() {
    if (this._isActive) {
      const slotIndex = this.slots.findIndex((slot) => slot.x === this.x && slot.y === this.y);
      if (slotIndex !== -1) {
        // Mark the slot as empty and update field state
        this.slots[slotIndex]._isEmpty = true;
        this.currentScene.updateHeroFieldState(slotIndex, null);
      }
      this.currentScene.heroBenchCurrentSize++;
      this.toggleActive(false);
    }

    // Find first available bench position
    const newPositionIndex = this.currentScene.getFirstAvailableHeroBenchPosition();
    if (newPositionIndex === -1) return; // Bench is full

    // Update bench position state
    this.currentScene.updateHeroBenchPosition(this._benchPositionIndex, newPositionIndex, this);
    this._benchPositionIndex = newPositionIndex;

    const benchPosition = this.calculateBenchPosition();
    this.setPosition(this.bench.x, benchPosition);
    this._mostRecentValidPosition = { x: this.bench.x, y: benchPosition };
  }

  /**
   * Calculates the vertical position on the bench based on current bench occupancy
   */
  calculateBenchPosition() {
    const benchHeight = this.bench.height;
    const benchTop = this.bench.y - benchHeight / 2;
    const benchFillRatio = this._benchPositionIndex / this.currentScene.heroBenchMaxSize;
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

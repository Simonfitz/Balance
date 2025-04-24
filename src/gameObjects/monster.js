import Unit from './unit.js';
import jsonData from '../../assets/resources/unit_specs/monster.json' with { type: 'json' };
import { ImpBehavior } from './behaviors/ImpBehavior.js';

export default class Monster extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame, unitName);

    // Set UI references first
    this.bench = scene.monsterBench;
    this.slots = scene.monsterSlots;
    this.currentScene = scene;

    // Set unit-specific behavior
    switch (unitName) {
      case 'imp':
        this.setBehavior(new ImpBehavior());
        break;
      // Add other monster behaviors here
      default:
        // Keep default behavior
        break;
    }

    // Then load stats
    this._unitBaseStats = jsonData[unitName];
    this.loadBaseStats();

    // Track bench position
    this._benchPositionIndex = -1;
    scene.add.existing(this);
  }

  /**
   * Moves the monster to a specific slot on the field
   * Updates bench size if the monster was previously on the bench
   */
  moveToField(slot) {
    const slotIndex = this.slots.indexOf(slot);
    if (slotIndex === -1) return;

    // If already on the field, mark the current slot as empty
    if (this._isActive) {
      const currentSlotIndex = this.slots.findIndex((s) => s._isEmpty === false && s !== slot);
      if (currentSlotIndex !== -1) {
        this.slots[currentSlotIndex]._isEmpty = true;
        this.currentScene.updateMonsterFieldState(currentSlotIndex, null);
      }
    } else {
      // Coming from bench
      this.currentScene.monsterBenchCurrentSize--;
      this.currentScene.updateMonsterBenchPosition(this._benchPositionIndex, -1, this);
      this._benchPositionIndex = -1;
      // Update GameState - moving from bench to field
      this.currentScene.gameState.moveUnit(this, 'bench', 'field');
    }

    this.setPosition(slot.x, slot.y);
    this._mostRecentValidPosition = { x: slot.x, y: slot.y };
    slot._isEmpty = false;
    this.currentScene.updateMonsterFieldState(slotIndex, this);
    this.toggleActive(true);
  }

  /**
   * Moves the monster to the bench
   * Updates bench size and calculates position based on current bench occupancy
   */
  moveToBench() {
    if (this._isActive) {
      const slotIndex = this.slots.findIndex((slot) => slot.x === this.x && slot.y === this.y);
      if (slotIndex !== -1) {
        // Mark the slot as empty and update field state
        this.slots[slotIndex]._isEmpty = true;
        this.currentScene.updateMonsterFieldState(slotIndex, null);
      }
      this.currentScene.monsterBenchCurrentSize++;
      this.toggleActive(false);
      // Update GameState - moving from field to bench
      this.currentScene.gameState.moveUnit(this, 'field', 'bench');
    }

    // Find first available bench position
    const newPositionIndex = this.currentScene.getFirstAvailableMonsterBenchPosition();
    if (newPositionIndex === -1) return; // Bench is full

    // Update bench position state
    this.currentScene.updateMonsterBenchPosition(this._benchPositionIndex, newPositionIndex, this);
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
    const benchFillRatio = this._benchPositionIndex / this.currentScene.monsterBenchMaxSize;
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

  canAttack() {
    if (this._attackCharge >= this._attackTime) {
      this._attackCharge = 0;
      // Calculate imp damage bonus if this is an imp
      if (this._unitName === 'imp') {
        const impCount = this.currentScene.monsterArray.filter(
          (monster) => monster._unitName === 'imp' && monster._isActive
        ).length;
        // Each imp beyond the first adds 20% damage
        const damageBonus = 1.0 + (impCount - 1) * 0.2;
        return this._baseDamage * damageBonus;
      }
      return this._baseDamage;
    }
    return 0;
  }
}

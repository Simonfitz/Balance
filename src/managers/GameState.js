import Hero from '../gameObjects/hero.js';
import Monster from '../gameObjects/monster.js';

export class GameState {
  constructor(scene) {
    this.scene = scene;

    // Track units by type and location
    this.unitCounts = {
      heroes: {
        field: new Map(), // Map<unitType, count>
        bench: new Map(),
        total: new Map(),
      },
      monsters: {
        field: new Map(),
        bench: new Map(),
        total: new Map(),
      },
    };

    // Track unit positions
    this.positions = {
      heroes: new Map(), // Map<unit, {row, col}>
      monsters: new Map(),
    };

    // Track adjacency relationships
    this.adjacency = {
      heroes: {
        column: new Map(), // Map<unit, Set<adjacentUnits>> - same column
        row: new Map(), // Map<unit, Set<adjacentUnits>> - same row
      },
      monsters: {
        column: new Map(),
        row: new Map(),
      },
    };

    // Track buffs and debuffs
    this.effects = new Map(); // Map<unit, Array<effect>>

    // Track deaths this turn
    this.deathsThisTurn = new Set();

    console.log('[GameState] Initialized');
  }

  /**
   * Updates the state when a unit is added to the game
   * @param {Unit} unit - The unit being added
   * @param {string} location - 'field' or 'bench'
   */
  addUnit(unit, location) {
    const unitType = unit.constructor.name.toLowerCase();
    const side = unit instanceof Hero ? 'heroes' : 'monsters';

    // Update counts
    this._updateUnitCount(unitType, side, location, 1);
    // this._updateUnitCount(unitType, side, 'total', 1);

    // If on field, track position
    if (location === 'field') {
      this._updatePosition(unit);
      this._updateAdjacency(unit);
    }

    console.log(`[GameState] Added ${unitType} to ${location}. Current counts:`, {
      field: this.unitCounts[side].field.get(unitType) || 0,
      bench: this.unitCounts[side].bench.get(unitType) || 0,
      total: this.unitCounts[side].total.get(unitType) || 0,
    });
  }

  /**
   * Updates the state when a unit is removed from the game
   * @param {Unit} unit - The unit being removed
   * @param {string} location - 'field' or 'bench'
   */
  removeUnit(unit, location) {
    const unitType = unit.constructor.name.toLowerCase();
    const side = unit instanceof Hero ? 'heroes' : 'monsters';

    // Update counts
    this._updateUnitCount(unitType, side, location, -1);
    // this._updateUnitCount(unitType, side, 'total', -1);

    // If on field, remove position tracking
    if (location === 'field') {
      this.positions[side].delete(unit);
      this.adjacency[side].column.delete(unit);
      this.adjacency[side].row.delete(unit);
    }

    console.log(`[GameState] Removed ${unitType} from ${location}. Current counts:`, {
      field: this.unitCounts[side].field.get(unitType) || 0,
      bench: this.unitCounts[side].bench.get(unitType) || 0,
      total: this.unitCounts[side].total.get(unitType) || 0,
    });
  }

  /**
   * Updates the state when a unit moves between field and bench
   * @param {Unit} unit - The unit being moved
   * @param {string} fromLocation - 'field' or 'bench'
   * @param {string} toLocation - 'field' or 'bench'
   */
  moveUnit(unit, fromLocation, toLocation) {
    const unitType = unit.constructor.name.toLowerCase();
    const side = unit instanceof Hero ? 'heroes' : 'monsters';

    console.log(`[GameState] Moving ${unitType} from ${fromLocation} to ${toLocation}`);

    // Update counts directly instead of using remove/add
    this._updateUnitCount(unitType, side, fromLocation, -1);
    this._updateUnitCount(unitType, side, toLocation, 1);
    // Total count should remain the same since we're just moving the unit

    // Update position tracking if moving to/from field
    if (fromLocation === 'field') {
      this.positions[side].delete(unit);
      this.adjacency[side].column.delete(unit);
      this.adjacency[side].row.delete(unit);
    }
    if (toLocation === 'field') {
      this._updatePosition(unit);
      this._updateAdjacency(unit);
    }

    console.log(`[GameState] Moved ${unitType}. Current counts:`, {
      field: this.unitCounts[side].field.get(unitType) || 0,
      bench: this.unitCounts[side].bench.get(unitType) || 0,
      total: this.unitCounts[side].total.get(unitType) || 0,
    });
  }

  /**
   * Updates the state when a unit dies
   * @param {Unit} unit - The unit that died
   */
  unitDied(unit) {
    this.deathsThisTurn.add(unit);
    this.removeUnit(unit, 'field');
  }

  /**
   * Resets the deaths tracking at the start of a new turn
   */
  resetTurn() {
    this.deathsThisTurn.clear();
  }

  /**
   * Gets the count of a specific unit type in a specific location
   * @param {string} unitType - The type of unit
   * @param {string} side - 'heroes' or 'monsters'
   * @param {string} location - 'field', 'bench', or 'total'
   * @returns {number} The count of units
   */
  getUnitCount(unitType, side, location) {
    return this.unitCounts[side][location].get(unitType) || 0;
  }

  /**
   * Gets the position of a unit on the field
   * @param {Unit} unit - The unit to check
   * @returns {Object} The position {row, col} or null if not on field
   */
  getUnitPosition(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    return this.positions[side].get(unit) || null;
  }

  /**
   * Gets units in the same column as the given unit
   * @param {Unit} unit - The unit to check
   * @returns {Set} Set of adjacent units in the same column
   */
  getColumnAdjacentUnits(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    return this.adjacency[side].column.get(unit) || new Set();
  }

  /**
   * Gets units in the same row as the given unit
   * @param {Unit} unit - The unit to check
   * @returns {Set} Set of adjacent units in the same row
   */
  getRowAdjacentUnits(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    return this.adjacency[side].row.get(unit) || new Set();
  }

  /**
   * Gets the number of units that died this turn
   * @returns {number} Count of deaths
   */
  getDeathsThisTurn() {
    return this.deathsThisTurn.size;
  }

  // Private helper methods
  _updateUnitCount(unitType, side, location, change) {
    const current = this.unitCounts[side][location].get(unitType) || 0;
    const newCount = Math.max(0, current + change); // Prevent negative counts
    this.unitCounts[side][location].set(unitType, newCount);

    // Update total count
    const currentTotal = this.unitCounts[side].total.get(unitType) || 0;
    const newTotal = Math.max(0, currentTotal + change);
    this.unitCounts[side].total.set(unitType, newTotal);

    console.log(`[GameState] Updated ${unitType} count for ${location}:`, {
      previous: current,
      change,
      new: newCount,
      total: newTotal,
    });
  }

  _updatePosition(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    const position = this._calculatePosition(unit);

    if (!position) {
      console.log(
        `[GameState] No position found for unit ${unit._unitName} at (${unit.x}, ${unit.y})`
      );
      return;
    }

    this.positions[side].set(unit, position);
    console.log(`[GameState] Updated position for ${unit._unitName}:`, {
      position,
      unitPosition: { x: unit.x, y: unit.y },
      side,
    });
  }

  /**
   * Updates the adjacency relationships for a unit based on the V-pattern layout:
   *
   * Front Column (col 0)    Back Column (col 1)
   *
   *             [1]
   *            /
   *           /
   *        [0]
   *           \
   *            \
   *             [3]
   *            /
   *           /
   *        [2]
   *           \
   *            \
   *             [4]
   *
   * Adjacency Rules:
   * - Column adjacency: Units in the same column (vertical)
   * - Row adjacency (front/back relationships):
   *   * Position 0 (front) is in front of positions 1 and 3 (back)
   *   * Position 2 (front) is in front of positions 3 and 4 (back)
   *   * Position 1 (back) is behind position 0 (front)
   *   * Position 3 (back) is behind both positions 0 and 2 (front)
   *   * Position 4 (back) is behind position 2 (front)
   *
   * @param {Unit} unit - The unit to update adjacency for
   */
  _updateAdjacency(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    const position = this.getUnitPosition(unit);
    const columnAdjacent = new Set();
    const rowAdjacent = new Set();

    if (!position) {
      console.log(`[GameState] No position found for unit ${unit._unitName}`);
      return { columnAdjacent, rowAdjacent };
    }

    // Check all other units for adjacency
    for (const [otherUnit, otherPos] of this.positions[side].entries()) {
      if (unit === otherUnit) continue;

      // Check column adjacency (same column, different row)
      if (position.col === otherPos.col) {
        columnAdjacent.add(otherUnit);
      }

      // Check row adjacency based on overlapping V pattern
      if (position.col !== otherPos.col) {
        // If in front column (col 0)
        if (position.col === 0) {
          // Position 0 covers positions 1 and 3
          if (position.row === 0 && (otherPos.row === 0 || otherPos.row === 1)) {
            rowAdjacent.add(otherUnit);
          }
          // Position 2 covers positions 3 and 4
          else if (position.row === 1 && (otherPos.row === 1 || otherPos.row === 2)) {
            rowAdjacent.add(otherUnit);
          }
        }
        // If in back column (col 1)
        else {
          // Position 1 is covered by position 0
          if (position.row === 0 && otherPos.row === 0) {
            rowAdjacent.add(otherUnit);
          }
          // Position 3 is covered by both positions 0 and 2
          else if (position.row === 1 && (otherPos.row === 0 || otherPos.row === 1)) {
            rowAdjacent.add(otherUnit);
          }
          // Position 4 is covered by position 2
          else if (position.row === 2 && otherPos.row === 1) {
            rowAdjacent.add(otherUnit);
          }
        }
      }
    }

    console.log(`[GameState] Updated adjacency for ${unit._unitName}:`, {
      position,
      columnAdjacent: Array.from(columnAdjacent).map((u) => u._unitName),
      rowAdjacent: Array.from(rowAdjacent).map((u) => u._unitName),
    });

    return { columnAdjacent, rowAdjacent };
  }

  _calculatePosition(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';

    // Get the correct slots array from the scene
    const slots = side === 'heroes' ? this.scene.heroSlots : this.scene.monsterSlots;

    if (!slots || !Array.isArray(slots)) {
      console.log(`[GameState] No valid slots array found for ${side}`);
      return null;
    }

    console.log(`[GameState] Calculating position for ${unit._unitName}:`, {
      unitPosition: { x: unit.x, y: unit.y },
      slots: slots.map((s) => ({ x: s.x, y: s.y, isEmpty: s._isEmpty })),
    });

    // Find the slot that matches the unit's position
    const slotIndex = slots.findIndex((slot) => {
      // Use a small threshold for floating point comparison
      const xMatch = Math.abs(slot.x - unit.x) < 1;
      const yMatch = Math.abs(slot.y - unit.y) < 1;
      return xMatch && yMatch;
    });

    if (slotIndex === -1) {
      console.log(`[GameState] No slot found for unit at position (${unit.x}, ${unit.y})`);
      return null;
    }

    // Calculate row and column based on the V-pattern layout
    // Positions 0-4 in a 3x2 grid:
    // [0] [1]
    // [2] [3]
    //    [4]
    const row = Math.floor(slotIndex / 2);
    const col = slotIndex % 2;

    console.log(`[GameState] Calculated position for ${unit._unitName}:`, {
      slotIndex,
      row,
      col,
      unitPosition: { x: unit.x, y: unit.y },
      slotPosition: slots[slotIndex] ? { x: slots[slotIndex].x, y: slots[slotIndex].y } : null,
    });

    return { row, col };
  }
}

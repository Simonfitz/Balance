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

    // If on field, track position
    if (location === 'field') {
      this._updatePosition(unit);
      this._updateAdjacency(unit);
    }
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

    // If on field, remove position tracking
    if (location === 'field') {
      this.positions[side].delete(unit);
      this.adjacency[side].column.delete(unit);
      this.adjacency[side].row.delete(unit);
    }
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
  }

  _updatePosition(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    const newPosition = this._calculatePosition(unit);
    const oldPosition = this.positions[side].get(unit);

    if (!newPosition) {
      console.error(
        `[GameState] No position found for unit ${unit._unitName} at (${unit.x}, ${unit.y})`
      );
      return;
    }

    // Only update if position actually changed
    if (oldPosition && oldPosition.row === newPosition.row && oldPosition.col === newPosition.col) {
      return;
    }

    this.positions[side].set(unit, newPosition);

    // Update adjacency for affected units
    this._updateAdjacency(unit);
  }

  _updateAdjacency(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    const position = this.getUnitPosition(unit);

    if (!position) {
      console.error(`[GameState] No position found for unit ${unit._unitName}`);
      return;
    }

    // Get all units affected by this position change
    const affectedUnits = this._getAffectedUnits(side, position);
    affectedUnits.add(unit); // Include the unit itself

    // Update adjacency for all affected units
    for (const affectedUnit of affectedUnits) {
      const { columnAdjacent, rowAdjacent } = this._calculateAdjacency(affectedUnit);

      // Update the adjacency maps
      this.adjacency[side].column.set(affectedUnit, columnAdjacent);
      this.adjacency[side].row.set(affectedUnit, rowAdjacent);
    }
  }

  /**
   * Gets all units affected by a position change
   */
  _getAffectedUnits(side, position) {
    const affectedUnits = new Set();
    const affectedRows = new Set();

    // Get all units in positions that would be affected by a change at this position
    for (const [unit, pos] of this.positions[side].entries()) {
      // Check column adjacency
      if (pos.col === position.col && Math.abs(pos.row - position.row) <= 1) {
        affectedUnits.add(unit);
      }

      // Check row adjacency based on V-pattern
      if (pos.col !== position.col) {
        // Front column affects back column
        if (position.col === 1) {
          if (position.row === 0) {
            affectedRows.add(0);
            affectedRows.add(1);
          } else if (position.row === 1) {
            affectedRows.add(1);
            affectedRows.add(2);
          }
        }
        // Back column affected by front column
        else {
          if (pos.row === 0 && position.row === 0) {
            affectedUnits.add(unit);
          } else if (pos.row === 1 && (position.row === 0 || position.row === 1)) {
            affectedUnits.add(unit);
          } else if (pos.row === 2 && position.row === 1) {
            affectedUnits.add(unit);
          }
        }
      }
    }

    return affectedUnits;
  }

  /**
   * Calculates adjacency relationships for a unit with optimized checks
   */
  _calculateAdjacency(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';
    const position = this.getUnitPosition(unit);
    const columnAdjacent = new Set();
    const rowAdjacent = new Set();

    if (!position) {
      console.error(`[GameState] No position found for unit ${unit._unitName}`);
      return { columnAdjacent, rowAdjacent };
    }

    if (!this.positions[side]) {
      console.error(`[GameState] Invalid side: ${side}`);
      return { columnAdjacent, rowAdjacent };
    }

    // Pre-calculate position ranges for quick checks
    const rowRange = [Math.max(0, position.row - 1), Math.min(2, position.row + 1)];
    const affectedRows = new Set();

    // Determine affected rows based on V-pattern
    if (position.col === 1) {
      // Front column
      if (position.row === 0) {
        affectedRows.add(0);
        affectedRows.add(1);
      } else if (position.row === 1) {
        affectedRows.add(1);
        affectedRows.add(2);
      }
    } else {
      // Back column
      if (position.row === 0) {
        affectedRows.add(0);
      } else if (position.row === 1) {
        affectedRows.add(0);
        affectedRows.add(1);
      } else if (position.row === 2) {
        affectedRows.add(1);
      }
    }

    // Single pass through units with optimized checks
    for (const [otherUnit, otherPos] of this.positions[side].entries()) {
      if (unit === otherUnit) continue;

      // Quick column check
      if (
        position.col === otherPos.col &&
        otherPos.row >= rowRange[0] &&
        otherPos.row <= rowRange[1]
      ) {
        columnAdjacent.add(otherUnit);
      }

      // Quick row check
      if (position.col !== otherPos.col && affectedRows.has(otherPos.row)) {
        rowAdjacent.add(otherUnit);
      }
    }

    return { columnAdjacent, rowAdjacent };
  }

  _calculatePosition(unit) {
    const side = unit instanceof Hero ? 'heroes' : 'monsters';

    // Get the correct slots array from the scene
    const slots = side === 'heroes' ? this.scene.heroSlots : this.scene.monsterSlots;

    if (!slots || !Array.isArray(slots)) {
      console.error(`[GameState] No valid slots array found for ${side}`);
      return null;
    }

    // Find the slot that matches the unit's position
    const slotIndex = slots.findIndex((slot) => {
      // Use a small threshold for floating point comparison
      const xMatch = Math.abs(slot.x - unit.x) < 1;
      const yMatch = Math.abs(slot.y - unit.y) < 1;
      return xMatch && yMatch;
    });

    if (slotIndex === -1) {
      console.error(`[GameState] No slot found for unit at position (${unit.x}, ${unit.y})`);
      return null;
    }

    // Calculate row and column based on the V-pattern layout
    // Positions 0-4 in a 3x2 grid:
    // [0] [1]
    // [2] [3]
    //    [4]
    const row = Math.floor(slotIndex / 2);
    const col = slotIndex % 2;

    return { row, col };
  }
}

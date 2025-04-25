export class CombatManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Handles all combat-related updates
   */
  handleCombat() {
    this.processHeroAttacks();
    this.processMonsterAttacks();
  }

  /**
   * Processes attacks from all heroes
   */
  processHeroAttacks() {
    // Only process attacks from heroes that are active (on the field)
    this.scene.heroArray
      .filter((hero) => hero._isActive)
      .forEach((hero) => {
        const target = this.getRandomTarget(
          this.scene.monsterArray.filter((monster) => monster._isActive)
        );
        this.processAttack(hero, target);
      });
  }

  /**
   * Processes attacks from all monsters
   */
  processMonsterAttacks() {
    // Only process attacks from monsters that are active (on the field)
    this.scene.monsterArray
      .filter((monster) => monster._isActive)
      .forEach((monster) => {
        const target = this.getRandomTarget(this.scene.heroArray.filter((hero) => hero._isActive));
        this.processAttack(monster, target);
      });
  }

  /**
   * Gets a random target from the provided array
   * @param {Array} targets - Array of potential targets
   * @returns {Object|null} Random target or null if no valid targets
   */
  getRandomTarget(targets) {
    if (targets.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex];
  }

  /**
   * Processes an attack between two units
   * @param {Object} source - The attacking unit
   * @param {Object} target - The target unit
   */
  processAttack(source, target) {
    if (!source || !target) return;
    const damage = source.canAttack();
    if (damage > 0) {
      // Call behavior's onAttack if it exists - this will handle projectile creation
      if (source._behavior && source._behavior.onAttack) {
        source._behavior.onAttack(source, target);
      }
    }
  }
}

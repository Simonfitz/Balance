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
      // Get the actual positions of the units
      const sourcePos = { x: source.x, y: source.y };
      const targetPos = { x: target.x, y: target.y };

      // Calculate the direction vector
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;

      // Position emitter at source unit
      source.emitter.setPosition(sourcePos.x, sourcePos.y);

      // Update particle movement with proper direction
      source.emitter.setConfig({
        moveToX: dx,
        moveToY: dy,
        speed: 200, // Adjust speed as needed
        lifespan: 200,
        gravity: 0, // Remove gravity since we're using moveTo
        blendMode: 'ADD',
      });

      // Start the emitter
      source.emitter.start();
      // Stop after a short delay
      this.scene.time.delayedCall(200, () => source.emitter.stop());

      target.takeDamage(damage);
    }
  }
}

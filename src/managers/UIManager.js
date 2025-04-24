export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.currencyTexts = {};
    this.benchTexts = {};
  }

  /**
   * Initialises all UI elements
   * @param {number} screenCenterX - Center X coordinate of the screen
   * @param {number} screenCenterY - Center Y coordinate of the screen
   */
  initialiseUI(screenCenterX, screenCenterY) {
    this.createBar(screenCenterX);
    this.createCurrencyTexts(screenCenterX);
    this.createBenchTexts();
  }

  /**
   * Creates the top bar UI element
   * @param {number} screenCenterX - Center X coordinate of the screen
   */
  createBar(screenCenterX) {
    this.bar = this.scene.add.tileSprite(screenCenterX, 50, 0, 0, 'bar');
    this.bar.setScale(1.0, 0.75);
  }

  /**
   * Creates the currency text displays
   * @param {number} screenCenterX - Center X coordinate of the screen
   */
  createCurrencyTexts(screenCenterX) {
    // Create red currency text
    this.currencyTexts.red = this.createText(
      screenCenterX - this.bar.width / 2 - 76,
      this.bar.y - this.bar.height / 4,
      '0',
      {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#660000',
        stroke: '#AC7D0C',
        strokeThickness: 3,
      }
    );

    // Create blue currency text
    this.currencyTexts.blue = this.createText(
      screenCenterX + this.bar.width / 2 + 76,
      this.bar.y - this.bar.height / 4,
      '0',
      {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#000066',
        stroke: '#AC7D0C',
        strokeThickness: 3,
      }
    );
  }

  /**
   * Creates the bench size text displays
   */
  createBenchTexts() {
    // Create hero bench text
    this.benchTexts.hero = this.createText(
      this.scene.heroBench.x - 38,
      this.scene.heroBench.y + this.scene.heroBench.height / 2,
      '0/5',
      {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#AC7D0C',
        strokeThickness: 3,
      }
    );

    // Create monster bench text
    this.benchTexts.monster = this.createText(
      this.scene.monsterBench.x - 38,
      this.scene.monsterBench.y + this.scene.monsterBench.height / 2,
      '0/5',
      {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#AC7D0C',
        strokeThickness: 3,
      }
    );
  }

  /**
   * Updates the currency text displays
   * @param {number} redAmount - Current red currency amount
   * @param {number} blueAmount - Current blue currency amount
   */
  updateCurrencyTexts(redAmount, blueAmount) {
    this.currencyTexts.red.setText(redAmount);
    this.currencyTexts.blue.setText(blueAmount);
  }

  /**
   * Updates the bench size text displays
   * @param {number} heroCount - Current number of heroes
   * @param {number} monsterCount - Current number of monsters
   */
  updateBenchTexts(heroCount, monsterCount) {
    this.benchTexts.hero.setText(`${heroCount}/5`);
    this.benchTexts.monster.setText(`${monsterCount}/5`);
  }

  /**
   * Helper method to create text objects
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} text - Text content
   * @param {Object} style - Text style configuration
   * @returns {Phaser.GameObjects.Text} Created text object
   */
  createText(x, y, text, style) {
    return this.scene.add.text(x, y, text, style).setDepth(1);
  }
}

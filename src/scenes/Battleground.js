import PlacementTile from '../gameObjects/placementTile.js';
import Hero from '../gameObjects/hero.js';
import Monster from '../gameObjects/monster.js';
import CurrencyBank from '../gameObjects/currencyBank.js';
import GenerateUnitButton from '../gameObjects/generateUnitButton.js';
import { TILE } from '../constants.js';

export class Battleground extends Phaser.Scene {
  constructor() {
    super('Battleground');
    this.heroArray = [];
    this.monsterArray = [];
    this.heroSlots = [];
    this.monsterSlots = [];
  }

  /**
   * Loads all required assets for the scene
   */
  preload() {
    // Load UI assets
    this.load.image('emptySlot', 'assets/UI/slot.png');
    this.load.image('addButton', 'assets/UI/add.png');
    this.load.image('background_battleground', 'assets/backgrounds/background_battleground.png');
    this.load.image('heroBench', 'assets/UI/bench.png');
    this.load.image('monsterBench', 'assets/UI/bench.png');
    this.load.image('bar', 'assets/UI/bar.png');

    // Load particle textures
    this.load.image('flare', 'assets/misc/flare.png');
    this.load.image('circle', 'assets/misc/circle.png');

    // Load hero spritesheets
    this.load.spritesheet('cleric', 'assets/heroes/cleric/Idle.png', {
      frameWidth: 75,
      frameHeight: 70,
    });
    this.load.spritesheet('fighter', 'assets/heroes/fighter/Idle.png', {
      frameWidth: 75,
      frameHeight: 70,
    });
    this.load.spritesheet('mage', 'assets/heroes/mage/Idle.png', {
      frameWidth: 75,
      frameHeight: 70,
    });

    // Load monster sprites
    this.load.image('imp', 'assets/monsters/Imp/idle.png');
    this.load.image('dragon', 'assets/monsters/Dragon/idle.png');
    this.load.image('necromancer', 'assets/monsters/Necromancer/idle.png');
  }

  /**
   * Initialises the scene and sets up all game objects
   */
  create() {
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;

    this.initialiseBackground(screenCenterX, screenCenterY);
    this.initialiseUI(screenCenterX, screenCenterY);
    this.initialiseCurrencySystem(screenCenterX, screenCenterY);
    this.initialiseBenches(screenCenterX, screenCenterY);
    this.initialisePlacementTiles(screenCenterX, screenCenterY);
    this.initialiseUnitButtons(screenCenterX, screenCenterY);
  }

  /**
   * Initialises the background image
   */
  initialiseBackground(screenCenterX, screenCenterY) {
    this.background_battleground = this.add
      .tileSprite(0, 0, 0, 0, 'background_battleground')
      .setOrigin(0);
    this.resizeToWindow(this.background_battleground);
  }

  /**
   * Initialises the UI elements
   */
  initialiseUI(screenCenterX, screenCenterY) {
    this.bar = this.add.tileSprite(screenCenterX, 50, 0, 0, 'bar');
    this.bar.setScale(1.0, 0.75);
  }

  /**
   * Initialises the currency system
   */
  initialiseCurrencySystem(screenCenterX, screenCenterY) {
    this.bankBlue = 0;
    this.bankRed = 0;
    this.bankCap = 200;

    this.currencyRed = 0;
    this.textStyleRed = {
      fontFamily: 'Arial Black',
      fontSize: 38,
      color: '#660000',
      stroke: '#AC7D0C',
      strokeThickness: 3,
    };
    this.currencyRedTextPosition = {
      x: this.bar.x - this.bar.width / 2 - this.textStyleRed.fontSize * 2,
      y: this.bar.y - this.bar.height / 4,
    };
    this.currencyRedText = this.add
      .text(
        this.currencyRedTextPosition.x,
        this.currencyRedTextPosition.y,
        this.currencyRed,
        this.textStyleRed
      )
      .setDepth(1);

    this.currencyBlue = 0;
    this.textStyleBlue = {
      fontFamily: 'Arial Black',
      fontSize: 38,
      color: '#000066',
      stroke: '#AC7D0C',
      strokeThickness: 3,
    };
    this.currencyBlueTextPosition = {
      x: this.bar.x + this.bar.width / 2 + this.textStyleBlue.fontSize * 2,
      y: this.bar.y - this.bar.height / 4,
    };
    this.currencyBlueText = this.add
      .text(
        this.currencyBlueTextPosition.x,
        this.currencyBlueTextPosition.y,
        this.currencyBlue,
        this.textStyleBlue
      )
      .setDepth(1);

    this.currencyBank = new CurrencyBank(this, screenCenterX, screenCenterY * 0.5, 'flare');
  }

  /**
   * Initialises the hero and monster benches
   */
  initialiseBenches(screenCenterX, screenCenterY) {
    this.heroBench = this.add.tileSprite(50, screenCenterY, 0, 0, 'heroBench');
    this.monsterBench = this.add.tileSprite(
      screenCenterX * 2 - 50,
      screenCenterY,
      0,
      0,
      'monsterBench'
    );

    this.heroBenchMaxSize = 5;
    this.heroBenchCurrentSize = 0;
    this.textStyleHeroBench = {
      fontFamily: 'Arial Black',
      fontSize: 38,
      color: '#ffffff',
      stroke: '#AC7D0C',
      strokeThickness: 3,
    };
    this.heroBenchText = this.add
      .text(
        this.heroBench.x - this.textStyleHeroBench.fontSize,
        this.heroBench.y + this.heroBench.height / 2,
        `${this.heroBenchCurrentSize}/${this.heroBenchMaxSize}`,
        this.textStyleHeroBench
      )
      .setDepth(1);

    this.monsterBenchMaxSize = 5;
    this.monsterBenchCurrentSize = 0;
    this.textStyleMonsterBench = {
      fontFamily: 'Arial Black',
      fontSize: 38,
      color: '#ffffff',
      stroke: '#AC7D0C',
      strokeThickness: 3,
    };
    this.monsterBenchText = this.add
      .text(
        this.monsterBench.x - this.textStyleMonsterBench.fontSize,
        this.monsterBench.y + this.monsterBench.height / 2,
        `${this.monsterBenchCurrentSize}/${this.monsterBenchMaxSize}`,
        this.textStyleMonsterBench
      )
      .setDepth(1);
  }

  /**
   * Initialises the placement tiles for units
   */
  initialisePlacementTiles(screenCenterX, screenCenterY) {
    // Create left group (5 tiles)
    this.createTileGroup({
      startIndex: 0,
      endIndex: 5,
      baseX: 300,
      centerY: screenCenterY,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: false,
    });

    // Create right group (5 tiles)
    this.createTileGroup({
      startIndex: 5,
      endIndex: 10,
      baseX: this.cameras.main.width - 300,
      centerY: screenCenterY,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: true,
    });
  }

  /**
   * Initialises the unit generation buttons
   */
  initialiseUnitButtons(screenCenterX, screenCenterY) {
    this.generateHeroButton = new GenerateUnitButton(
      this,
      this.heroBench.x,
      this.heroBenchText.y + this.heroBenchText.height + 30,
      'addButton',
      0,
      () => {
        if (this.heroBenchCurrentSize < this.heroBenchMaxSize) {
          let newHero = this.initRandomHero(0, 0);
          newHero.moveToBench();
        }
      }
    );

    this.generateMonsterButton = new GenerateUnitButton(
      this,
      this.monsterBench.x,
      this.monsterBenchText.y + this.monsterBenchText.height + 30,
      'addButton',
      0,
      () => {
        if (this.monsterBenchCurrentSize < this.monsterBenchMaxSize) {
          let newMonster = this.initRandomMonster(0, 0);
          newMonster.moveToBench();
        }
      }
    );
  }

  /**
   * Updates the game state each frame
   * @param {number} time - The current time
   * @param {number} delta - The time elapsed since last frame in milliseconds
   */
  update(time, delta) {
    this.updateUnits(time, delta);
    this.handleCombat();
    this.updateUI();
  }

  /**
   * Updates all units in the game
   * @param {number} time - The current time
   * @param {number} delta - The time elapsed since last frame in milliseconds
   */
  updateUnits(time, delta) {
    this.heroArray.forEach((hero) => hero.update(time, delta));
    this.monsterArray.forEach((monster) => monster.update(time, delta));
  }

  /**
   * Handles combat between heroes and monsters
   */
  handleCombat() {
    this.heroArray.forEach((hero) => {
      const target = this.getRandomTarget(this.monsterArray);
      this.processAttack(hero, target);
    });

    this.monsterArray.forEach((monster) => {
      const target = this.getRandomTarget(this.heroArray);
      this.processAttack(monster, target);
    });
  }

  /**
   * Updates all UI elements
   */
  updateUI() {
    this.updateBenchText();
    this.updateCurrencyText();
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
      target.takeDamage(damage);
    }
  }

  /**
   * Creates a group of placement tiles
   * @param {Object} config - Configuration object for tile group
   */
  createTileGroup({
    startIndex,
    endIndex,
    baseX,
    centerY,
    tileSize,
    padding,
    verticalOffset,
    isRightGroup,
  }) {
    for (let i = startIndex; i < endIndex; i++) {
      const row = Math.floor((i - startIndex) / 2);
      const col = (i - startIndex) % 2;
      const x = baseX + col * (tileSize + padding);
      const y = centerY + row * (tileSize + verticalOffset);

      const tile = new PlacementTile(this, x, y, 'emptySlot');
      if (isRightGroup) {
        this.monsterSlots.push(tile);
      } else {
        this.heroSlots.push(tile);
      }
    }
  }

  /**
   * Initialises a random hero at the specified position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Hero} The created hero
   */
  initRandomHero(x, y) {
    const heroTypes = ['cleric', 'fighter', 'mage'];
    const randomType = heroTypes[Math.floor(Math.random() * heroTypes.length)];
    return this.initHero(x, y, randomType);
  }

  /**
   * Initialises a random monster at the specified position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Monster} The created monster
   */
  initRandomMonster(x, y) {
    const monsterTypes = ['imp', 'dragon', 'necromancer'];
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    return this.initMonster(x, y, randomType);
  }

  /**
   * Initialises a specific hero type
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} heroName - Type of hero to create
   * @returns {Hero} The created hero
   */
  initHero(x, y, heroName) {
    const hero = new Hero(this, x, y, heroName);
    this.heroArray.push(hero);
    return hero;
  }

  /**
   * Initialises a specific monster type
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} monsterName - Type of monster to create
   * @returns {Monster} The created monster
   */
  initMonster(x, y, monsterName) {
    const monster = new Monster(this, x, y, monsterName);
    this.monsterArray.push(monster);
    return monster;
  }

  /**
   * Resizes an image to fit the window
   * @param {Phaser.GameObjects.Image} image - Image to resize
   * @param {number} ratio - Scaling ratio
   */
  resizeToWindow(image, ratio = 1) {
    image.setDisplaySize(this.cameras.main.width * ratio, this.cameras.main.height * ratio);
  }

  /**
   * Updates the bench size text displays
   */
  updateBenchText() {
    this.heroBenchText.setText(`${this.heroBenchCurrentSize}/${this.heroBenchMaxSize}`);
    this.monsterBenchText.setText(`${this.monsterBenchCurrentSize}/${this.monsterBenchMaxSize}`);
  }

  /**
   * Updates the currency text displays
   */
  updateCurrencyText() {
    this.currencyRedText.setText(this.currencyRed);
    this.currencyBlueText.setText(this.currencyBlue);
  }
}

import PlacementTile from '../gameObjects/placementTile.js';
import Hero from '../gameObjects/hero.js';
import Monster from '../gameObjects/monster.js';
import CurrencyBank from '../gameObjects/currencyBank.js';
import GenerateUnitButton from '../gameObjects/generateUnitButton.js';
import MenuUpgrades from '../gameObjects/menuUpgrades.js'
import { TILE } from '../constants.js';
import { UIManager } from '../managers/UIManager.js';
import { CombatManager } from '../managers/CombatManager.js';

export class Battleground extends Phaser.Scene {
  constructor() {
    super('Battleground');
    this.heroArray = [];
    this.monsterArray = [];
    this.heroSlots = [];
    this.monsterSlots = [];

    // Track bench and field state
    this.heroBenchPositions = [];
    this.monsterBenchPositions = [];
    this.heroFieldState = new Map(); // Maps slot index to unit
    this.monsterFieldState = new Map(); // Maps slot index to unit
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
    this.load.image('menu', 'assets/UI/test.png');

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

    // Initialise managers
    this.uiManager = new UIManager(this);
    this.combatManager = new CombatManager(this);

    // Initialise game components in correct order
    this.initialiseBackground(screenCenterX, screenCenterY);
    this.initialiseCurrencySystem(screenCenterX, screenCenterY);

    // Create benches before UI that depends on them
    this.initialiseBenches(screenCenterX, screenCenterY);

    // Now initialise UI with benches available
    this.uiManager.initialiseUI(screenCenterX, screenCenterY);

    // Create the rest of the game components
    this.initialisePlacementTiles(screenCenterX, screenCenterY);
    this.initialiseUnitButtons(screenCenterX, screenCenterY);
    this.menuUpgrades = new MenuUpgrades(this, screenCenterX, screenCenterY, this.cameras.main.width*0.8, this.cameras.main.height*0.3, 'menu')
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
   * Initialises the currency system
   */
  initialiseCurrencySystem(screenCenterX, screenCenterY) {
    this.bankBlue = 0;
    this.bankRed = 0;
    this.bankCap = 200;

    this.currencyRed = 0;
    this.currencyBlue = 0;

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
    this.monsterBenchMaxSize = 5;
    this.monsterBenchCurrentSize = 0;

    // Initialize bench positions
    this.heroBenchPositions = Array(this.heroBenchMaxSize).fill(null);
    this.monsterBenchPositions = Array(this.monsterBenchMaxSize).fill(null);
  }

  /**
   * Gets the first available bench position for a hero
   * @returns {number} The index of the first available position, or -1 if full
   */
  getFirstAvailableHeroBenchPosition() {
    return this.heroBenchPositions.findIndex((pos) => pos === null);
  }

  /**
   * Gets the first available bench position for a monster
   * @returns {number} The index of the first available position, or -1 if full
   */
  getFirstAvailableMonsterBenchPosition() {
    return this.monsterBenchPositions.findIndex((pos) => pos === null);
  }

  /**
   * Updates the bench position state for a hero
   * @param {number} oldIndex - The previous position index
   * @param {number} newIndex - The new position index
   * @param {Hero} hero - The hero being moved
   */
  updateHeroBenchPosition(oldIndex, newIndex, hero) {
    if (oldIndex >= 0) this.heroBenchPositions[oldIndex] = null;
    if (newIndex >= 0) this.heroBenchPositions[newIndex] = hero;
  }

  /**
   * Updates the bench position state for a monster
   * @param {number} oldIndex - The previous position index
   * @param {number} newIndex - The new position index
   * @param {Monster} monster - The monster being moved
   */
  updateMonsterBenchPosition(oldIndex, newIndex, monster) {
    if (oldIndex >= 0) this.monsterBenchPositions[oldIndex] = null;
    if (newIndex >= 0) this.monsterBenchPositions[newIndex] = monster;
  }

  /**
   * Updates the field state for a hero
   * @param {number} slotIndex - The slot index
   * @param {Hero} hero - The hero being moved (null to clear)
   */
  updateHeroFieldState(slotIndex, hero) {
    if (hero === null) {
      this.heroFieldState.delete(slotIndex);
    } else {
      this.heroFieldState.set(slotIndex, hero);
    }
  }

  /**
   * Updates the field state for a monster
   * @param {number} slotIndex - The slot index
   * @param {Monster} monster - The monster being moved (null to clear)
   */
  updateMonsterFieldState(slotIndex, monster) {
    if (monster === null) {
      this.monsterFieldState.delete(slotIndex);
    } else {
      this.monsterFieldState.set(slotIndex, monster);
    }
  }

  /**
   * Initialises the placement tiles for units
   */
  initialisePlacementTiles(screenCenterX, screenCenterY) {
    // Add vertical offset to move tiles down
    const verticalOffset = 50; // Adjust this value to move tiles up or down

    // Calculate column width (tile size + padding)
    const columnWidth = TILE.SIZE + TILE.PADDING;

    // Create left group (5 tiles)
    this.createTileGroup({
      startIndex: 0,
      endIndex: 5,
      baseX: 250, // Base position for left column
      centerY: screenCenterY + verticalOffset,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: false,
    });

    // Create right group (5 tiles)
    this.createTileGroup({
      startIndex: 5,
      endIndex: 10,
      baseX: this.cameras.main.width - 250 - columnWidth, // Account for column width when positioning from right edge
      centerY: screenCenterY + verticalOffset,
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
    // Position hero button at the top of the hero bench
    this.generateHeroButton = new GenerateUnitButton(
      this,
      this.heroBench.x,
      this.heroBench.y - this.heroBench.height / 2 - 20, // 20 pixels above the bench
      'addButton',
      0,
      () => {
        if (this.heroBenchCurrentSize < this.heroBenchMaxSize) {
          const benchPosition =
            this.heroBench.y +
            (this.heroBenchCurrentSize / this.heroBenchMaxSize) * this.heroBench.height -
            this.heroBench.height / 2;
          let newHero = this.initRandomHero(this.heroBench.x, benchPosition);
          newHero.moveToBench();
        }
      }
    );

    // Position monster button at the top of the monster bench
    this.generateMonsterButton = new GenerateUnitButton(
      this,
      this.monsterBench.x,
      this.monsterBench.y - this.monsterBench.height / 2 - 20, // 20 pixels above the bench
      'addButton',
      0,
      () => {
        if (this.monsterBenchCurrentSize < this.monsterBenchMaxSize) {
          const benchPosition =
            this.monsterBench.y +
            (this.monsterBenchCurrentSize / this.monsterBenchMaxSize) * this.monsterBench.height -
            this.monsterBench.height / 2;
          let newMonster = this.initRandomMonster(this.monsterBench.x, benchPosition);
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
    this.combatManager.handleCombat();
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
   * Updates all UI elements
   */
  updateUI() {
    this.uiManager.updateBenchTexts(this.heroBenchCurrentSize, this.monsterBenchCurrentSize);
    this.uiManager.updateCurrencyTexts(this.currencyRed, this.currencyBlue);
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
    // Calculate total height needed for all tiles
    const totalHeight = (endIndex - startIndex) * (tileSize + verticalOffset);
    const startY = centerY - totalHeight / 2;

    for (let i = startIndex; i < endIndex; i++) {
      const relativeIndex = i - startIndex;
      const row = relativeIndex;

      // Calculate x position based on whether it's the left or right group
      // and whether it's an even or odd row
      let x;
      if (isRightGroup) {
        // Right group: even rows (0, 2, 4) go to the right column
        x = baseX + (row % 2 === 0 ? tileSize + padding : 0);
      } else {
        // Left group: even rows (0, 2, 4) go to the left column
        x = baseX + (row % 2 === 0 ? 0 : tileSize + padding);
      }

      const y = startY + row * (tileSize + verticalOffset);

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
    const hero = new Hero(this, x, y, heroName, 0, heroName);
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
    const monster = new Monster(this, x, y, monsterName, 0, monsterName);
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
}

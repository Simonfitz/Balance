import PlacementTile from '../gameObjects/placementTile.js';
import Unit from '../gameObjects/unit.js';
import { TILE } from '../constants.js';

export class Battleground extends Phaser.Scene {
  constructor() {
    super('Battleground');
    this.tileStates = []; // Array to track tile states
  }

  preload() {
    // Load the add button image
    this.load.image('addButton', 'assets/UI/add.png');
    // load the background image
    this.load.image('background_battleground', 'assets/backgrounds/background_battleground.png');
    // load the UI elememts
    this.load.image('bench_heroes', 'assets/UI/bench.png');
    this.load.image('bench_monsters', 'assets/UI/bench.png');
    this.load.image('bar', 'assets/backgrounds/bar.png');
  
    // Load the mage spritesheet
    this.load.spritesheet('mageIdle', 'assets/heroes/mage/Idle.png', {
      frameWidth: 64, // Adjust these values based on your actual spritesheet
      frameHeight: 70, // Adjust these values based on your actual spritesheet
    });
  }

  create() {
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;

    // Load Background image
    this.background_battleground = this.add
      .tileSprite(0, 0, 0, 0, 'background_battleground')
      .setOrigin(0);
    this.resizeToWindow(this.background_battleground);

    // Load UI
    this.bar = this.add.tileSprite(screenCenterX, 100, 0, 0, 'bar');
    this.bench_heroes = this.add.tileSprite(0, screenCenterY, 0, 0, 'bench_heroes');
    this.bench_monsters = this.add.tileSprite(screenCenterX*2, screenCenterY, 0, 0, 'bench_monsters');

    this.resizeToWindow(this.bar, 0.5);

    // Create left group (5 tiles)
    this.createTileGroup({
      startIndex: 0,
      endIndex: 5,
      baseX: 200, // Distance from left edge
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
      baseX: this.cameras.main.width - 200, // Distance from right edge
      centerY: screenCenterY,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: true,
    });
  }

  update() {}

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
      // Calculate position based on index within the group
      const groupIndex = i - startIndex;
      let x, y;

      if (groupIndex < 3) {
        // First column of 3 tiles
        // For right group, this is the right column
        // For left group, this is the left column
        x = isRightGroup ? baseX : baseX;
        y = centerY - tileSize - padding + (tileSize + padding) * groupIndex + verticalOffset;
      } else {
        // Second column of 2 tiles
        // For right group, this is the left column
        // For left group, this is the right column
        x = isRightGroup ? baseX - tileSize - padding : baseX + tileSize + padding;

        // Center the column of 2 with the column of 3
        const column3Height = 3 * (tileSize + padding) - padding;
        const column2Height = 2 * (tileSize + padding) - padding;
        const verticalOffsetFor2 = (column3Height - column2Height) / 2;
        y =
          centerY -
          tileSize +
          (tileSize + padding) * (groupIndex - 3) +
          verticalOffset +
          verticalOffsetFor2;
      }

      // Initialize tile state
      this.tileStates[i] = 'empty';

      const tile = new PlacementTile(this, x, y, 'addButton', 0, () => {
        console.log(`Tile ${i + 1} clicked!`);
        //this.toggleTileState(i);
        this.initUnit(x, y);
      });

      // Store the tile reference
      this[`tile${i}`] = tile;
    }
  }

  toggleTileState(tileIndex) {
    const currentState = this.tileStates[tileIndex];
    const tile = this[`tile${tileIndex}`];

    if (currentState === 'empty') {
      // Switch from add button to mage
      this.tileStates[tileIndex] = 'filled';
      //tile.updateTexture('mageIdle');
      tile.visible = false;
    } else {
      // Switch from mage back to add button
      this.tileStates[tileIndex] = 'empty';
      tile.updateTexture('addButton');
    }
  }

  initUnit(x, y) {
    this.unit = new Unit(this, x, y, 'mageIdle');
  }

  resizeToWindow(image, ratio = 1) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    let scale = { height: (height / image.height) * ratio, width: (width / image.width) * ratio };
    image.setScale(scale.width, scale.height);
  }
}

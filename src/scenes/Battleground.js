import PlacementTile from '../gameObjects/placementTile.js';
import Unit from '../gameObjects/unit.js'

export class Battleground extends Phaser.Scene {
  constructor() {
      super('Battleground');
      this.tileStates = []; // Array to track tile states
  }

  preload() {
      // Load the add button image
      this.load.image('addButton', 'assets/misc/add.png');
      this.load.image('background_battleground', 'assets/backgrounds/background_test2.png');
      this.load.image('bar', 'assets/backgrounds/bar.png');
      
      // Load the mage spritesheet
      this.load.spritesheet('mageIdle', 'assets/heroes/mage/Idle.png', {
          frameWidth: 64,  // Adjust these values based on your actual spritesheet
          frameHeight: 70  // Adjust these values based on your actual spritesheet
      });
  }

  create() {
      const tileSize = 50;
      const padding = 20;
      const verticalOffset = 200;
      const screenCenterX = this.cameras.main.width / 2;
      const screenCenterY = this.cameras.main.height / 2;

      // Load Background image
      this.background_battleground = this.add.tileSprite(0, 0, 0, 0, 'background_battleground').setOrigin(0);
      this.resizeToWindow(this.background_battleground);

      // Load UI
      this.bar = this.add.tileSprite(screenCenterX, 100, 0, 0, 'bar');
      this.resizeToWindow(this.bar, 0.5);
      
      // Create left group (5 tiles)
      this.createTileGroup(0, 5, 100, screenCenterY, tileSize, padding, verticalOffset, false);
      
      // Create right group (5 tiles)
      this.createTileGroup(5, 10, this.cameras.main.width - 100, screenCenterY, tileSize, padding, verticalOffset, true);
  }

  update() {
  }

  createTileGroup(startIndex, endIndex, centerX, centerY, tileSize, padding, verticalOffset, isRightGroup) {
      for (let i = startIndex; i < endIndex; i++) {
          // Calculate position based on index within the group
          const groupIndex = i - startIndex;
          let x, y;
          
          if (groupIndex < 3) {
              // First column of 3
              x = centerX + (isRightGroup ? tileSize + padding : 0);
              y = centerY - tileSize - padding + (tileSize + padding) * groupIndex + verticalOffset;
          } else {
              // Second column of 2, centered with the column of 3
              x = centerX + (isRightGroup ? 0 : tileSize + padding);
              y = centerY - (tileSize + padding) + (tileSize + padding) * (groupIndex - 3) + verticalOffset;
          }
          
          // Initialize tile state
          this.tileStates[i] = 'empty';
          
          const tile = new PlacementTile(
              this,
              x,
              y,
              'addButton',
              0,
              () => {
                  console.log(`Tile ${i + 1} clicked!`);
                  //this.toggleTileState(i);
                  this.initUnit(x, y);
              }
          );
          
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
    
resizeToWindow(image, ratio=1) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    let scale = {height: height/image.height * ratio, width: width/image.width * ratio};
    image.setScale(scale.width, scale.height);
  }
}
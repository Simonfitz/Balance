import PlacementTile from '../gameObjects/placementTile.js';

export class Battleground extends Phaser.Scene {
  constructor() {
      super('Battleground');
      this.tileStates = []; // Array to track tile states
  }

  preload() {
      // Load the add button image
      this.load.image('addButton', 'assets/misc/add.png');
      
      // Load the mage spritesheet
      this.load.spritesheet('mageIdle', 'assets/heroes/mage/Idle.png', {
          frameWidth: 128,  // Adjust these values based on your actual spritesheet
          frameHeight: 128  // Adjust these values based on your actual spritesheet
      });
  }

  create() {
      // Set the background color to white
      this.cameras.main.setBackgroundColor('#ffffff');
      
      const tileSize = 50;
      const padding = 20;
      const screenCenterX = this.cameras.main.width / 2;
      const screenCenterY = this.cameras.main.height / 2;
      
      // Create left group (5 tiles)
      this.createTileGroup(0, 5, 100, screenCenterY, tileSize, padding, false);
      
      // Create right group (5 tiles)
      this.createTileGroup(5, 10, this.cameras.main.width - 100, screenCenterY, tileSize, padding, true);
  }

  createTileGroup(startIndex, endIndex, centerX, centerY, tileSize, padding, isRightGroup) {
      for (let i = startIndex; i < endIndex; i++) {
          // Calculate position based on index within the group
          const groupIndex = i - startIndex;
          let x, y;
          
          if (groupIndex < 3) {
              // First column of 3
              x = centerX + (isRightGroup ? tileSize + padding : 0);
              y = centerY - tileSize - padding + (tileSize + padding) * groupIndex;
          } else {
              // Second column of 2, centered with the column of 3
              x = centerX + (isRightGroup ? 0 : tileSize + padding);
              y = centerY - (tileSize + padding) + (tileSize + padding) * (groupIndex - 3);
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
                  this.toggleTileState(i);
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
          tile.updateTexture('mageIdle');
      } else {
          // Switch from mage back to add button
          this.tileStates[tileIndex] = 'empty';
          tile.updateTexture('addButton');
      }
  }

  update() {
  }
}
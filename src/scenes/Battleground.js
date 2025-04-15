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
          frameWidth: 32,  // Adjust these values based on your actual spritesheet
          frameHeight: 32  // Adjust these values based on your actual spritesheet
      });
  }

  create() {
      // Set the background color to white
      this.cameras.main.setBackgroundColor('#ffffff');
      
      // Create a grid of 10 tiles
      const tileWidth = 100;
      const tileHeight = 100;
      const padding = 20;
      const startX = 100;
      const startY = 100;
      
      // Create 10 tiles in a 2x5 grid
      for (let i = 0; i < 10; i++) {
          const row = Math.floor(i / 5);
          const col = i % 5;
          
          const x = startX + (tileWidth + padding) * col;
          const y = startY + (tileHeight + padding) * row;
          
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

      // Example: Change tile 0's state every 2 seconds
      this.time.addEvent({
          delay: 2000,
          callback: () => {
              this.toggleTileState(0);
          },
          loop: true
      });
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
import { Start } from './scenes/Start.js';
import { Menu } from './scenes/Menu.js';
import { Battleground } from './scenes/Battleground.js';
import { GameOptions } from './gameConfig/gameOptions.js';

const config = {
  type: Phaser.AUTO,
  title: 'Balance',
  description: '',
  parent: 'game-container',
  width: GameOptions.gameSize.width,
  height: GameOptions.gameSize.height,
  backgroundColor: GameOptions.gameBackgroundColor,
  pixelArt: false,
  scene: [
    Start,
    Menu,
    Battleground
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
}

new Phaser.Game(config);

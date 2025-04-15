import { Start } from './scenes/Start.js';
import { Menu } from './scenes/Menu.js';
import { Battleground } from './scenes/Battleground.js';

const config = {
    type: Phaser.AUTO,
    title: 'Balance',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
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
            
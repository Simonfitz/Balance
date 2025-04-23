export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  preload() {
    this.load.image('background_start', 'assets/backgrounds/background_start.png');
  }

  create() {
    // Load Background image
    this.background_start = this.add
      .tileSprite(0, 0, 0, 0, 'background_start')
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    this.resizeToWindow(this.background_start);
    this.background_start.on('pointerup', () => {
      this.scene.start('Battleground');
    });
  }

  update() {}

  resizeToWindow(image, ratio = 1) {
    console.log(image);
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    let scale = { height: (height / image.height) * ratio, width: (width / image.width) * ratio };
    image.setScale(scale.width, scale.height);
  }
}

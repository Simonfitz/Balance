export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height) {
    super(scene, x, y);
    scene.add.existing(this);

    // Store dimensions
    this.width = width;
    this.height = height;

    // Create background (empty bar)
    this.background = scene.add.rectangle(0, 0, width, height, 0xff0000);
    this.background.setOrigin(0, 0.5);

    // Create foreground (filled bar)
    this.foreground = scene.add.rectangle(0, 0, width, height, 0x00ff00);
    this.foreground.setOrigin(0, 0.5);

    // Add both rectangles to the container
    this.add([this.background, this.foreground]);

    // Set initial health to full
    this.setHealth(1);
  }

  setHealth(ratio) {
    // Clamp ratio between 0 and 1
    ratio = Phaser.Math.Clamp(ratio, 0, 1);

    // Update foreground width based on health ratio
    this.foreground.width = this.width * ratio;
  }
}

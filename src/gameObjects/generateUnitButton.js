export default class GenerateUnitButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, frame, callback) {
    super(scene, x, y);

    // tile slot status
    this.empty = true;

    // Store the initial texture and frame
    this.currentTexture = texture;
    this.currentFrame = frame;

    // Create the tile sprite
    this.tileSprite = scene.add.sprite(0, 0, texture);
    this.add(this.tileSprite);

    // Scale the sprite to fit within the tile bounds
    const scale = Math.min(50 / this.tileSprite.width, 50 / this.tileSprite.height);
    this.tileSprite.setScale(scale);

    // Store the callback
    this.callback = callback;

    // Make the container interactive
    this.setSize(100, 100); // Fixed size for the container
    this.setInteractive({ useHandCursor: true });

    // Add hover and press effects
    this.on('pointerover', () => {
      this.tileSprite.setTint(0xcccccc); // Lighten the sprite on hover
    });

    this.on('pointerout', () => {
      this.tileSprite.clearTint(); // Remove tint when not hovering
    });

    this.on('pointerdown', () => {
      this.tileSprite.setTint(0x999999); // Darken the sprite when pressed
    });

    this.on('pointerup', () => {
      this.tileSprite.clearTint(); // Remove tint when released
      if (this.callback) {
        this.callback();
      }
    });

    // Add to scene
    scene.add.existing(this);
  }
}

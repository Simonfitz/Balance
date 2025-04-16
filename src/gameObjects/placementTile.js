export default class PlacementTile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, frame, callback) {
    super(scene, x, y);

    // Store the initial texture and frame
    this.currentTexture = texture;
    this.currentFrame = frame;

    // Create the tile sprite
    this.tileSprite = scene.add.sprite(0, 0, texture);
    this.add(this.tileSprite);

    // Scale the sprite to fit within the tile bounds (50x50)
    const scale = Math.min(50 / this.tileSprite.width, 50 / this.tileSprite.height);
    this.tileSprite.setScale(scale);

    // Store the callback
    this.callback = callback;

    // Make the container interactive
    this.setSize(50, 50); // Fixed size for the container
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

  // Method to update the tile's appearance
  updateTexture(texture, frame = 0) {
    this.currentTexture = texture;
    this.currentFrame = frame;

    // Stop any existing animation
    this.tileSprite.stop();

    // Set the new texture
    this.tileSprite.setTexture(texture);

    // Scale the sprite to fit within the tile bounds
    const scale = Math.min(50 / this.tileSprite.width, 50 / this.tileSprite.height);
    this.tileSprite.setScale(scale);

    // If this is a spritesheet (like mageIdle), create and play the animation
    if (texture === 'mageIdle') {
      if (!this.scene.anims.exists('mageIdle')) {
        this.scene.anims.create({
          key: 'mageIdle',
          frames: this.scene.anims.generateFrameNumbers(texture, {
            start: 0,
            end: -1,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }
      this.tileSprite.play('mageIdle');
    }
  }

  // Method to get current texture and frame
  getCurrentTexture() {
    return {
      texture: this.currentTexture,
      frame: this.currentFrame,
    };
  }
}

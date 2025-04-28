export default class ButtonUpgrade extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setInteractive({ useHandCursor: true });
    this.emitter = this.scene.add.particles(x, y, 'circle', {
      lifespan: 2000,
      speed: 50,
      angle: { min: -115, max: -65 },
      scale: { start: 1, end: 0, ease: 'sine.out' },
      blendMode: 'ADD',
      emitting: true,
    });
  }
}

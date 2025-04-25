export default class MenuUpgrades extends Phaser.GameObjects.Container {
  constructor(scene, menuCentreX, menuCentreY, menuWidth, menuHeight, texture) {
    super(scene, menuCentreX, menuCentreY);

    this._opened = false;

    // Scale the container
    this.setSize(menuWidth, menuHeight); // Fixed size for the container

    // Create menu background
    this.menuBackground = scene.add.sprite(0, 0, texture);
    this.add(this.menuBackground);
    const scaleX = Math.min(this.width / this.menuBackground.width);
    const scaleY = Math.min(this.height / this.menuBackground.height);
    this.menuBackground.setScale(scaleX, scaleY);

    // Create open/close button
    this.buttonOpenClose = scene.add.sprite(0, -menuHeight*0.5, texture);
    this.buttonOpenClose.setInteractive({ useHandCursor: true})
    this.add(this.buttonOpenClose);

    // Create upgrade button orb size
    this.buttonOrbCapacity = scene.add.sprite(-menuWidth*0.4, 0, texture);
    this.buttonOrbCapacity.setInteractive({ useHandCursor: true})
    this.add(this.buttonOrbCapacity);

    // Create upgrade button bench size
    this.buttonBenchSize = scene.add.sprite(-menuWidth*0.2, 0, texture);
    this.buttonBenchSize.setInteractive({ useHandCursor: true})
    this.add(this.buttonBenchSize);

    // Create upgrade button field size
    this.buttonFieldSize = scene.add.sprite(menuWidth*0.2, 0, texture);
    this.buttonFieldSize.setInteractive({ useHandCursor: true})
    this.add(this.buttonFieldSize);

    // Create upgrade button auto-cache efficiency
    this.buttonOrbEfficiency = scene.add.sprite(menuWidth*0.4, 0, texture);
    this.buttonOrbEfficiency.setInteractive({ useHandCursor: true})
    this.add(this.buttonOrbEfficiency);

    // Add to scene
    scene.add.existing(this);
  }
}

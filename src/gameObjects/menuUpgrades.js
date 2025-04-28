import UpgradeButton from '../gameObjects/buttonUpgrade.js';

export default class MenuUpgrades extends Phaser.GameObjects.Container {
  constructor(scene, menuCentreX, menuCentreY, menuWidth, menuHeight, menuTexture, buttonTexture) {
    super(scene, menuCentreX, menuCentreY);
    this.currentScene = scene;
    this._opened = false;

    // Scale the container
    this.setSize(menuWidth, menuHeight); // Fixed size for the container

    // Create menu background
    this.menuBackground = scene.add.sprite(0, 0, menuTexture);
    this.menuBackground.setInteractive({ useHandCursor: true})
    this.add(this.menuBackground);
    const scaleX = Math.min(this.width / this.menuBackground.width);
    const scaleY = Math.min(this.height / this.menuBackground.height);
    this.menuBackground.setScale(scaleX, scaleY);
    this.menuBackground.on('pointerup', () => {
      if(this._opened){
        this._opened = false;
        //this.setPosition(menuCentreX, menuCentreY)
        this.moveWindow(menuCentreX, menuCentreY);
      }
      else{
        this._opened = true;
        //this.setPosition(menuCentreX, menuCentreY-this.menuBackground.height/4);
        this.moveWindow(menuCentreX, menuCentreY-this.menuBackground.height/4);
      }
      });

    // Create Gacha button
    this.buttonGacha = new UpgradeButton(scene, 0, 0, buttonTexture, 0);
    this.add(this.buttonGacha);

    // Create upgrade button orb size
    this.buttonOrbCapacity = scene.add.sprite(-menuWidth*0.4, 0, buttonTexture);
    this.buttonOrbCapacity.setInteractive({ useHandCursor: true})
    this.add(this.buttonOrbCapacity);

    // Create upgrade button bench size
    this.buttonBenchSize = scene.add.sprite(-menuWidth*0.2, 0, buttonTexture);
    this.buttonBenchSize.setInteractive({ useHandCursor: true})
    this.add(this.buttonBenchSize);

    // Create upgrade button field size
    this.buttonFieldSize = scene.add.sprite(menuWidth*0.2, 0, buttonTexture);
    this.buttonFieldSize.setInteractive({ useHandCursor: true})
    this.add(this.buttonFieldSize);

    // Create upgrade button auto-cache efficiency
    this.buttonOrbEfficiency = scene.add.sprite(menuWidth*0.4, 0, buttonTexture);
    this.buttonOrbEfficiency.setInteractive({ useHandCursor: true})
    this.add(this.buttonOrbEfficiency);

    // Add to scene
    scene.add.existing(this);
  }

  moveWindow(x, y, duration=1000){
    this.currentScene.tweens.add({
      targets: this,         // what to move
      x: x,                    // destination x
      y: y,                    // destination y
      duration: duration,            // time in milliseconds (1000ms = 1 second)
      ease: 'Linear'             // easing function (you can use others too)
    });
  }
}

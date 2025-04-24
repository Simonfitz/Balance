export default class CurrencyBank extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setInteractive({useHandCursor: true});
    this.on('pointerup', () => {
      this.cashOutBank()
    });
    this.currentScene = scene;
    this.emitter = this.scene.add.particles(x, y, 'circle', {
      lifespan: 2000,
      speed: 50,
      angle: { min: -115, max: -65 },
      scale: { start: 1, end: 0, ease: 'sine.out' },
      blendMode: 'ADD',
      emitting: true
    });
    
    this.bankLimit = 100.0;
    this.blueBank = 0;
    this.redBank = 0;
    this.updateBankTint();
  }

  updateBankTint(){
    if (this.redBank+this.blueBank>=this.bankLimit){
      this.emitter.lifespan = 4000;
    }
    else {
      this.emitter.lifespan = 2000;
    } 
    //let fullness = Math.min((this.redBank+this.blueBank)/this.bankLimit, .5)
    let red = Math.min(Math.floor(150*this.redBank/this.bankLimit), 50);
    let blue = Math.min(Math.floor(150*this.blueBank/this.bankLimit), 50);
    let green = Math.floor(Math.min(5.0, blue/2.0+red/5.0))
    console.log("RGB: "+ red+", " + green + ", " + blue)
    console.log(this.redBank+":"+this.blueBank)
    //let tint = 65536*red+blue+256*Math.max(Math.floor((blue)/(red+4)),0)
    //let ratio = .3;
    //let red = Math.floor(ratio*ratio*50);
    //let blue = Math.floor((1-ratio)*(1-ratio)*50);
    //console.log((65536*red+blue).toString(16))
    this.emitter.particleTint = 65536*red+blue+256*green;
  }

  cashOutBank(){
    if (this.redBank===0 || this.blueBank===0){
      return;
    }
    let balanceMult = Math.min(this.blueBank/this.redBank, this.redBank/this.blueBank);
    let fullnessMult = Math.sqrt((this.redBank+this.blueBank)/100);
    console.log("R: "+this.redBank+" x "+balanceMult+" x "+fullnessMult)
    console.log("B: "+this.blueBank+" x "+balanceMult+" x "+fullnessMult)

    balanceMult*=fullnessMult;
    this.scene.currencyRed+=Math.floor(this.redBank*balanceMult);
    this.scene.currencyBlue+=Math.floor(this.blueBank*balanceMult);
    this.blueBank = 0;
    this.redBank = 0;
    this.updateBankTint();
  }

  addBlue(value){
    if(this.blueBank+this.redBank<this.bankLimit){
      this.blueBank+=value;
    }
  }
  addRed(value){
    if(this.blueBank+this.redBank<this.bankLimit){
      this.redBank+=value;
    }
  }
}
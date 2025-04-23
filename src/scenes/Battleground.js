import PlacementTile from '../gameObjects/placementTile.js';
import Hero from '../gameObjects/hero.js';
import Monster from '../gameObjects/monster.js';
import { TILE } from '../constants.js';

export class Battleground extends Phaser.Scene {
  constructor() {
    super('Battleground');
    this.heroArray = [];
    this.monsterArray = [];
    this.heroSlots = [];
    this.monsterSlots = [];
  }

  preload() {
    // Load the add button image
    this.load.image('addButton', 'assets/UI/slot.png');
    // load the background image
    this.load.image('background_battleground', 'assets/backgrounds/background_battleground.png');
    // load the UI elememts
    this.load.image('heroBench', 'assets/UI/bench.png');
    this.load.image('monsterBench', 'assets/UI/bench.png');
    this.load.image('bar', 'assets/UI/bar.png');

    this.load.image('flare', 'assets/misc/flare.png');
  
    // load the hero sprite
    this.load.spritesheet('mageIdle', 'assets/heroes/mage/Idle.png', {
      frameWidth: 64, // Adjust these values based on your actual spritesheet
      frameHeight: 70, // Adjust these values based on your actual spritesheet
    });

    // load the monster sprite
    this.load.image('demon', 'assets/monsters/Demon/idle.png');
  }

  create() {
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;

    // Load Background image
    this.background_battleground = this.add
      .tileSprite(0, 0, 0, 0, 'background_battleground')
      .setOrigin(0);
    this.resizeToWindow(this.background_battleground);

    // Load UI
    this.bar = this.add.tileSprite(screenCenterX, 50, 0, 0, 'bar');
    this.bar.setScale(1.00, 0.75);

    this.heroBench = this.add.tileSprite(50, screenCenterY, 0, 0, 'heroBench');
    this.heroBench.setScale(0.75, 1.2);

    this.monsterBench = this.add.tileSprite((screenCenterX*2)-50, screenCenterY, 0, 0, 'monsterBench');
    this.monsterBench.setScale(0.75, 1.2);

    this.currencyRed = 0;
    this.textStyleRed = { fontFamily: 'Arial Black', fontSize: 38, color: '#660000', stroke: '#AC7D0C', strokeThickness: 3 };
    this.currencyRedTextPosition = {x: this.bar.x - this.bar.width/2 - this.textStyleRed.fontSize*2, y: this.bar.y - this.bar.height/4}
    this.currencyRedText = this.add.text(this.currencyRedTextPosition.x, this.currencyRedTextPosition.y, this.currencyRed, this.textStyleRed).setDepth(1);

    this.currencyBlue = 0;
    this.textStyleBlue = { fontFamily: 'Arial Black', fontSize: 38, color: '#000066', stroke: '#AC7D0C', strokeThickness: 3 };
    this.currencyBlueTextPosition = {x: this.bar.x + this.bar.width/2 + this.textStyleBlue.fontSize*2, y: this.bar.y - this.bar.height/4}
    this.currencyBlueText = this.add.text(this.currencyBlueTextPosition.x, this.currencyBlueTextPosition.y, this.currencyBlue, this.textStyleBlue).setDepth(1);

    this.heroBenchMaxSize = 5
    this.heroBenchCurrentSize = 0
    this.textStyleHeroBench = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#AC7D0C', strokeThickness: 3 };
    this.heroBenchText = this.add.text(this.heroBench.x - this.textStyleHeroBench.fontSize, this.heroBench.y + this.heroBench.height/2, `${this.heroBenchCurrentSize}/${this.heroBenchMaxSize}`, this.textStyleHeroBench).setDepth(1);

    this.monsterBenchMaxSize = 5
    this.monsterBenchCurrentSize = 0
    this.textStyleMonsterBench = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#AC7D0C', strokeThickness: 3 };
    this.monsterBenchText = this.add.text(this.monsterBench.x - this.textStyleMonsterBench.fontSize, this.monsterBench.y + this.monsterBench.height/2, `${this.monsterBenchCurrentSize}/${this.monsterBenchMaxSize}`, this.textStyleMonsterBench).setDepth(1);

    // Create left group (5 tiles)
    this.createTileGroup({
      startIndex: 0,
      endIndex: 5,
      baseX: 300, // Distance from left edge
      centerY: screenCenterY,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: false,
    });

    // Create right group (5 tiles)
    this.createTileGroup({
      startIndex: 5,
      endIndex: 10,
      baseX: this.cameras.main.width - 300, // Distance from right edge
      centerY: screenCenterY,
      tileSize: TILE.SIZE,
      padding: TILE.PADDING,
      verticalOffset: TILE.VERTICAL_OFFSET,
      isRightGroup: true,
    });
    this.emitter = this.add.particles(0, 0, 'flare', {
      lifespan: 500,
      //gravity: 500,
      blendMode: 'ADD',
      moveToX: 50,
      moveToY: 50
    });
    this.emitter.stop();
  }

  update(time, delta) {
    // update heroes
    this.heroArray.forEach((element) => element.update(time, delta));
    this.heroArray.forEach(
      (element) => this.attackTarget(
        element, this.monsterArray[Math.floor(Math.random()*this.monsterArray.length)]
      )
    );

    // update monsters
    this.monsterArray.forEach((element) => element.update(time, delta));
    this.monsterArray.forEach(
      (element) => this.attackTarget(
        element, this.heroArray[Math.floor(Math.random()*this.heroArray.length)]
      )
    );

    // update UI
    console.log(this.heroBenchCurrentSize)
    this.updateBenchText();
    this.updateCurrencyText();
  }

  attackTarget(source, target) {
    if(target){
      if(target._isActive){
        let damage = source.attackQuery();
        if (damage>0){
          target.emitter.moveToX = target.x;
          target.emitter.moveToY = target.y;
          target.emitter.explode(10, source.x, source.y);
          target.takeDamage(damage)
        }
      }
    }
  }

  createTileGroup({
    startIndex,
    endIndex,
    baseX,
    centerY,
    tileSize,
    padding,
    verticalOffset,
    isRightGroup,
  }) {
    for (let i = startIndex; i < endIndex; i++) {
      // Calculate position based on index within the group
      const groupIndex = i - startIndex;
      let x, y;

      if (groupIndex < 3) {
        // First column of 3 tiles
        // For right group, this is the right column
        // For left group, this is the left column
        x = isRightGroup ? baseX + (groupIndex*padding): baseX - (groupIndex*padding);
        y = centerY - tileSize + (tileSize) * groupIndex + verticalOffset;
      } else {
        // Second column of 2 tiles
        // For right group, this is the left column
        // For left group, this is the right column
        x = isRightGroup ? baseX - tileSize - ((groupIndex-3)*padding)  : baseX + tileSize + ((groupIndex-3)*padding);

        // Center the column of 2 with the column of 3
        const column3Height = 3 * (tileSize);
        const column2Height = 2 * (tileSize);
        const verticalOffsetFor2 = (column3Height - column2Height) / 2;
        y =
          centerY -
          tileSize -
          (tileSize) * (groupIndex - 3) +
          verticalOffset +
          verticalOffsetFor2*3;
      }
      
      if(isRightGroup){
        this.monsterSlots.push(new PlacementTile(this, x, y, 'addButton', 0, () => {
        this.initMonster(x, y)
        }))
      }
      else{
        this.heroSlots.push(new PlacementTile(this, x, y, 'addButton', 0, () => {
        this.initHero(x, y)
      }))
      }
    }
  }

  initHero(x, y) {
    this.heroArray.push(new Hero(this, x, y, 'mageIdle', 0, 'mage'));
  }

  initMonster(x, y) {
    this.monsterArray.push(new Monster(this, x, y, 'demon', 0, 'demon'));
  }

  resizeToWindow(image, ratio = 1) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    let scale = { height: (height / image.height) * ratio, width: (width / image.width) * ratio };
    image.setScale(scale.width, scale.height);
  }

  updateBenchText() {
    let newText = ''
    let textWidth = 0
    // Hero Bench
    newText = `${this.heroBenchCurrentSize}/${this.heroBenchMaxSize}`;
    this.heroBenchText.setText(newText);
    textWidth = this.heroBenchText.width;
    this.heroBenchText.setX(this.heroBench.x - textWidth/2);
    // Monster Bench
    newText = `${this.monsterBenchCurrentSize}/${this.monsterBenchMaxSize}`;
    this.monsterBenchText.setText(newText);
    textWidth = this.monsterBenchText.width;
    this.monsterBenchText.setX(this.monsterBench.x - textWidth/2);
  }

  updateCurrencyText() {
    let newText = ''
    let textWidth = 0
    // Blue Currency
    newText = `${this.currencyBlue}`;
    this.currencyBlueText.setText(newText);
    textWidth = this.currencyBlueText.width;
    this.currencyBlueText.setX(this.currencyBlueTextPosition.x - textWidth/2);
    // Red Currency
    newText = `${this.currencyRed}`;
    this.currencyRedText.setText(newText);
    textWidth = this.currencyRedText.width;
    this.currencyRedText.setX(this.currencyRedTextPosition.x - textWidth/2);
  }
}

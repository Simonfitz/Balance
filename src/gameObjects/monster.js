import Unit from './unit.js'
import jsonData from '../../assets/resources/unit_specs/monster.json' with { type: 'json' };

export default class Monster extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    this._unitBaseStats = jsonData[unitName]
    super.loadBaseStats();
    scene.add.existing(this);
    // Relevent UI locations
    this.bench = scene.monsterBench
    this.slots = scene.monsterSlots
    this.currentScene = scene
  }

  sendToField(slot){
    this.setPosition(slot.x, slot.y);
    slot._isEmpty = false; //todo fix
    if(!this._isActive){
      this.currentScene.monsterBenchCurrentSize--;
    }
    this.toggleActive(true);
  }

  sendToBench(){
    this.currentScene.monsterBenchCurrentSize++;
    let benchPosition = (this.bench.y - (this.bench.height/2)) + ((this.currentScene.monsterBenchCurrentSize)/(this.currentScene.monsterBenchMaxSize) * this.bench.height)
    this.setPosition(this.bench.x, benchPosition);
    this.toggleActive(false);
  }

  isBenchFull(){
    if(this.currentScene.monsterBenchCurrentSize < this.currentScene.monsterBenchMaxSize){
      return false;
    }
    return true;
  }

  deathAffects(){
    this.currentScene.currencyBank.addRed(this._value);
  }
}
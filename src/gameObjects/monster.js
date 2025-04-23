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

  deathAffects(){
    this.currentScene.currencyBank.addRed(this._value);
  }
}
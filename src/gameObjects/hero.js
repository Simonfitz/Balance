import Unit from './unit.js';
import jsonData from '../../assets/resources/unit_specs/hero.json' with { type: 'json' };

export default class Hero extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    this._unitBaseStats = jsonData[unitName];
    super.loadBaseStats();
    scene.add.existing(this);
    // Relevent UI locations
    this.bench = scene.heroBench;
    this.slots = scene.heroSlots;
    this.currentScene = scene;
  }

  sendToField(slot) {
    this.setPosition(slot.x, slot.y);
    if (!this._isActive) {
      this.currentScene.heroBenchCurrentSize--;
    }
    this.toggleActive(true);
  }

  sendToBench() {
    if (this._isActive) {
      this.currentScene.heroBenchCurrentSize++;
      this.toggleActive(false);
    }
    let benchPosition =
      this.bench.y -
      this.bench.height / 2 +
      (this.currentScene.heroBenchCurrentSize / this.currentScene.heroBenchMaxSize) *
        this.bench.height;
    this.setPosition(this.bench.x, benchPosition);
  }

  isBenchFull() {
    if (this.currentScene.heroBenchCurrentSize < this.currentScene.heroBenchMaxSize) {
      return false;
    }
    return true;
  }

  deathAffects() {
    this.currentScene.currencyBank.addBlue(this._value);
  }
}

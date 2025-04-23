import Unit from './unit.js'
import jsonData from '../../assets/resources/unit_specs/hero.json' with { type: 'json' };

export default class Hero extends Unit {
  constructor(scene, x, y, texture, frame, unitName) {
    super(scene, x, y, texture, frame);
    this._unitBaseStats = jsonData[unitName]
    super.loadBaseStats();
    scene.add.existing(this);
    // Relevent UI locations
    this.bench = scene.heroBench
    this.slots = scene.heroSlots
  }
}

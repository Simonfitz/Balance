export class UnitBehavior {
  constructor() {
    this.name = 'DefaultBehavior';
  }

  calculateDamage(unit) {
    return unit._baseDamage;
  }
}

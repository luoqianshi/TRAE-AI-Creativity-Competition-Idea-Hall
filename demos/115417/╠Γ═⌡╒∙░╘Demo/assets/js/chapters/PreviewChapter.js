class PreviewChapter {
  constructor(id, name, icon, color) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.color = color;
    this.units = [];
  }

  getUnit(unitNumber) {
    return this.units.find(u => u.unitNumber === unitNumber);
  }

  getUnitQuestions(unitNumber) {
    const unit = this.getUnit(unitNumber);
    return unit ? unit.questions : [];
  }

  getAllUnits() {
    return this.units;
  }
}
export class AntiqueTreasure extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quantity: new fields.NumberField({ initial: 1, integer: true }),
      price: new fields.StringField({ initial: "", blank: true }),
      poids: new fields.NumberField({ initial: 0, min: 0 }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

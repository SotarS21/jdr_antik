export class AntiqueAdvantage extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cout: new fields.NumberField({ initial: -1, integer: true }),
      effect: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

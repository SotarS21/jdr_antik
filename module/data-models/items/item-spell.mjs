export class AntiqueSpell extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      effect: new fields.StringField({ initial: "" }),
      cost: new fields.NumberField({ initial: 0, integer: true }),
      ritual: new fields.BooleanField({ initial: false }),
      costText: new fields.StringField({ initial: "" }),
      limitation: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      limitationValue: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      range: new fields.StringField({ initial: "" }),
      duration: new fields.StringField({ initial: "" }),
      components: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

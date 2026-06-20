export class AntiqueBlessing extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      effect: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

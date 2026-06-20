export class AntiqueEffect extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      duration: new fields.StringField({ initial: "" }),
      active: new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

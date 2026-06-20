export class AntiqueEquipment extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quantity: new fields.NumberField({ initial: 1, integer: true }),
      consumable: new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

export class AntiqueEquipment extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quantity: new fields.NumberField({ initial: 1, integer: true }),
      consumable: new fields.BooleanField({ initial: false }),
      caBonus: new fields.NumberField({ initial: 0, integer: true }),
      linkedSkill: new fields.StringField({ initial: "", blank: true }),
      skillBonus: new fields.NumberField({ initial: 0, integer: true }),
      slot: new fields.StringField({ initial: "", blank: true }),
      equipped: new fields.BooleanField({ initial: false }),
      price: new fields.StringField({ initial: "", blank: true }),
      apothCategory: new fields.StringField({ initial: "", blank: true }),
      apothType: new fields.StringField({ initial: "", blank: true }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

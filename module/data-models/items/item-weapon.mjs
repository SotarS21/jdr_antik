export class AntiqueWeapon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attBonus: new fields.NumberField({ initial: 0, integer: true }),
      attBonusDistance: new fields.NumberField({ initial: 0, integer: true }),
      category: new fields.StringField({ initial: "armeBlanche", blank: true }),
      categoryDistance: new fields.StringField({ initial: "armeADistance", blank: true }),
      damage: new fields.StringField({ initial: "1d6" }),
      critical: new fields.StringField({ initial: "20/x2" }),
      typeDamage: new fields.StringField({ initial: "" }),
      portee: new fields.NumberField({ initial: 0 }),
      hasPortee: new fields.BooleanField({ initial: false }),
      consumable: new fields.BooleanField({ initial: false }),
      linkedAmmoId: new fields.StringField({ initial: "" }),
      slot: new fields.StringField({ initial: "", blank: true }),
      equipped: new fields.BooleanField({ initial: false }),
      price: new fields.StringField({ initial: "", blank: true }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

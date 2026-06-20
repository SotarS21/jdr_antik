export class AntiqueWeapon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attBonus: new fields.NumberField({ initial: 0, integer: true }),
      damage: new fields.StringField({ initial: "1d6" }),
      critical: new fields.StringField({ initial: "20/x2" }),
      typeDamage: new fields.StringField({ initial: "" }),
      portee: new fields.NumberField({ initial: 0 }),
      hasPortee: new fields.BooleanField({ initial: false }),
      consumable: new fields.BooleanField({ initial: false }),
      linkedAmmoId: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

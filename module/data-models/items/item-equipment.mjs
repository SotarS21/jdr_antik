export class AntiqueEquipment extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      quantity: new fields.NumberField({ initial: 1, integer: true }),
      consumable: new fields.BooleanField({ initial: false }),
      caBonus: new fields.NumberField({ initial: 0, integer: true }),
      // Non-zero on a consumable (ex. "Rations régénératrices de Déméter") adds a
      // chat button to heal the consumer by this amount — same idiom as caBonus's
      // "apply-effect" button (see AntiqueItem#postToChat()), but for HP instead of CA.
      healAmount: new fields.NumberField({ initial: 0, integer: true }),
      linkedSkill: new fields.StringField({ initial: "", blank: true }),
      skillBonus: new fields.NumberField({ initial: 0, integer: true }),
      slot: new fields.StringField({ initial: "", blank: true }),
      equipped: new fields.BooleanField({ initial: false }),
      price: new fields.StringField({ initial: "", blank: true }),
      poids: new fields.NumberField({ initial: 0, min: 0 }),
      apothCategory: new fields.StringField({ initial: "", blank: true }),
      apothType: new fields.StringField({ initial: "", blank: true }),
      isIngredientBag: new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

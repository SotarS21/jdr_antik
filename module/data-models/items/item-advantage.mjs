export class AntiqueAdvantage extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cout: new fields.NumberField({ initial: -1, integer: true }),
      effect: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" }),
      // Optional limited-use charge counter (0 = illimité) — same shape as item-spell.mjs's
      // limitation/limitationValue, for advantages like Faveur de la Dame that grant a
      // decrementing resource with a manual reset action rather than a passive effect.
      limitation: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      limitationValue: new fields.NumberField({ initial: 0, integer: true, min: 0 })
    };
  }
}

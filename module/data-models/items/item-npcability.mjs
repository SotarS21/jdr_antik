export class AntiqueNpcAbility extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" }),
      // Optional saving throw button on the chat card (see AntiqueItem#postToChat) — blank
      // saveAbility = no button, matches abilities with no save (ex. Charge furieuse).
      saveAbility: new fields.StringField({ initial: "", blank: true }),
      saveDC: new fields.NumberField({ initial: 0, integer: true, min: 0 })
    };
  }
}

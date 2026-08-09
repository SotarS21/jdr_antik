// A curse is imposed on the character, not a build choice — unlike Avantage/
// Désavantage it has no `cout` field: it never weighs into context.traitBalance.
export class AntiqueCurse extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      effect: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

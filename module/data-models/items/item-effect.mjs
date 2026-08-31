export class AntiqueEffect extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      duration: new fields.StringField({ initial: "" }),
      active: new fields.BooleanField({ initial: false }),
      // Targeted CA bonus/malus (negative for a malus, ex. Connaissance d'Héphaistos: -2)
      // applied on demand via a chat button — same mechanism/button as a buff spell's
      // caBonus (AntiqueActor#applyCaBonus, postToChat() below). 0 = no button shown.
      // Distinct from a passive bonus embedded as a real ActiveEffect on this same
      // item (ex. Cuir de Héros: +2 Robustesse, Athlète: ×2 Déplacement) — those apply
      // automatically for as long as the effect is owned/active, no button needed.
      caBonus: new fields.NumberField({ initial: 0, integer: true }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

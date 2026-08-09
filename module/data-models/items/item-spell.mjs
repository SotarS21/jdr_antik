export class AntiqueSpell extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const ingredientSchema = () => new fields.SchemaField({
      id:       new fields.StringField({ required: true }),
      name:     new fields.StringField({ initial: "" }),
      quantity: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      possede:  new fields.BooleanField({ initial: false })
    });

    return {
      effect: new fields.StringField({ initial: "" }),
      cost: new fields.NumberField({ initial: 0, integer: true }),
      ritual: new fields.BooleanField({ initial: false }),
      costText: new fields.StringField({ initial: "" }),
      limitation: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      limitationValue: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      range: new fields.StringField({ initial: "" }),
      duration: new fields.StringField({ initial: "" }),
      components: new fields.StringField({ initial: "" }),
      // Bonus de CA temporaire proposé au lanceur via un bouton "Appliquer l'effet" dans
      // le message de chat du sort (0 = aucun bouton) — même principe que le bouton
      // "Appliquer les dégâts" déjà existant pour rollDamage(). Ex. Peau d'écorce : +2.
      caBonus: new fields.NumberField({ initial: 0, integer: true }),
      // Sorts à zone (ex. Brouillard) : propose un bouton "Placer un gabarit" dans le
      // message de chat, qui laisse le joueur faire glisser un gabarit circulaire sur la
      // scène (même principe que caBonus/apply-effect) — voir Hooks "renderChatMessageHTML"
      // dans antique.mjs pour le placement interactif.
      hasTemplate: new fields.BooleanField({ initial: false }),
      templateRadius: new fields.NumberField({ initial: 25, integer: true, min: 1 }),
      templateTexture: new fields.StringField({ initial: "icons/magic/air/fog-gas-smoke-green.webp", blank: true }),
      templateColor: new fields.StringField({ initial: "#808080", blank: true }),
      // Liste déclarative des ingrédients requis pour lancer le sort (checklist libre,
      // pas reliée à costText/castSpell() qui consomme déjà un ingrédient texte-libre par nom
      // depuis l'inventaire — les deux mécanismes coexistent sans se remplacer).
      ingredients: new fields.ArrayField(ingredientSchema(), { initial: [] }),
      description: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" })
    };
  }
}

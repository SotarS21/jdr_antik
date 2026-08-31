import { ANTIQUE } from "../helpers/config.mjs";

export class AntiqueNpc extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      // --- Identity ---
      description: new fields.HTMLField({ initial: "" }),
      taille: new fields.StringField({ initial: "" }),
      type: new fields.StringField({ initial: "" }),

      // --- PV ---
      pv: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, integer: true }),
        max: new fields.NumberField({ initial: 10, integer: true })
      }),

      // --- Abilities ---
      abilities: new fields.SchemaField({
        for: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        }),
        dex: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        }),
        con: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        }),
        int: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        }),
        ast: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        }),
        cha: new fields.SchemaField({
          value: new fields.NumberField({ initial: 10, integer: true }),
          mod: new fields.NumberField({ initial: 0, integer: true })
        })
      }),

      // --- Combat (simplified) ---
      ca: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, integer: true })
      }),
      initiative: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      attaque: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      deplacement: new fields.NumberField({ initial: 9, integer: true }),
      // Per-category attack bonus table (mirrors AntiqueActor#rollAttackCategory(), shared
      // with the character sheet — reads system.attackBonuses[cat].total, so the same
      // {total} shape is used here). No ability-mod/skill breakdown like the character
      // sheet (NPCs have no skill system) — each category is just a flat number the GM
      // sets directly, GM-only tab (see npc-sheet.hbs, isGM-gated Combat tab).
      attackBonuses: new fields.SchemaField({
        mainNue: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) }),
        armeBlanche: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) }),
        armeDeJet: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) }),
        armeExotique: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) }),
        combatDeuxMains: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) }),
        armeADistance: new fields.SchemaField({ total: new fields.NumberField({ initial: 0, integer: true }) })
      }),
      // Esquive/Parade reactions (see AntiqueActor#rollDodgeSkill): `value` is the flat
      // bonus the GM sets directly (no skill system for NPCs), `tempPenalty` stacks -1
      // per use regardless of success and is reset to 0 by the combat turn tracker at
      // the start of this actor's next turn (registerDodgeResetHook,
      // module/helpers/dodge-reset.mjs). `total` (derived) is what actually gets rolled.
      esquive: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true }),
        tempPenalty: new fields.NumberField({ initial: 0, integer: true })
      }),
      parade: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true }),
        tempPenalty: new fields.NumberField({ initial: 0, integer: true })
      }),

      // --- Currency ---
      or: new fields.NumberField({ initial: 0 }),

      // --- Notes ---
      notes: new fields.HTMLField({ initial: "" }),
      gmNotes: new fields.HTMLField({ initial: "" }),

      // --- Magic ---
      isMagicPractitioner: new fields.BooleanField({ initial: false }),
      pm: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true }),
        max: new fields.NumberField({ initial: 0, integer: true })
      })
    };
  }

  prepareDerivedData() {
    for (const ab of Object.values(this.abilities)) {
      ab.mod = Math.floor((ab.value - 10) / 2);
    }
    this.esquive.total = this.esquive.value + this.esquive.tempPenalty;
    this.parade.total = this.parade.value + this.parade.tempPenalty;
  }
}

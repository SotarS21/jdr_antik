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
  }
}

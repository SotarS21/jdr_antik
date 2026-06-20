import { ANTIQUE } from "../helpers/config.mjs";

export class AntiqueCharacter extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;

    // --- Identity ---
    const identityFields = {
      cite: new fields.StringField({ initial: "" }),
      devotion: new fields.StringField({ initial: "" }),
      joueur: new fields.StringField({ initial: "" }),
      age: new fields.NumberField({ initial: 20, integer: true }),
      yeux: new fields.StringField({ initial: "" }),
      peaux: new fields.StringField({ initial: "" }),
      cheveux: new fields.StringField({ initial: "" }),
      pilosite: new fields.StringField({ initial: "" }),
      taille: new fields.StringField({ initial: "" }),
      poid: new fields.StringField({ initial: "" }),
      sexe: new fields.StringField({ initial: "" }),
      historique: new fields.StringField({ initial: "" }),
      avantageTemporaire: new fields.BooleanField({ initial: false })
    };

    // --- PV ---
    const pvFields = {
      pv: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, integer: true }),
        max: new fields.NumberField({ initial: 10, integer: true })
      })
    };

    // --- Abilities ---
    const abilitySchema = () => new fields.SchemaField({
      value: new fields.NumberField({ initial: 10, integer: true }),
      mod: new fields.NumberField({ initial: 0, integer: true })
    });

    const abilitiesFields = {
      abilities: new fields.SchemaField({
        for: abilitySchema(),
        dex: abilitySchema(),
        con: abilitySchema(),
        int: abilitySchema(),
        ast: abilitySchema(),
        cha: abilitySchema()
      })
    };

    // --- Skills ---
    const skillSchema = () => new fields.SchemaField({
      trained: new fields.BooleanField({ initial: false }),
      bonus: new fields.NumberField({ initial: 0, integer: true })
    });

    const skillsObj = {};
    for (const key of Object.keys(ANTIQUE.skills)) {
      skillsObj[key] = skillSchema();
    }
    const skillsFields = {
      skills: new fields.SchemaField(skillsObj)
    };

    // --- Saves ---
    const saveSchema = () => new fields.SchemaField({
      base: new fields.NumberField({ initial: 0, integer: true }),
      temp: new fields.NumberField({ initial: 0, integer: true })
    });

    const savesFields = {
      saves: new fields.SchemaField({
        reflexes: saveSchema(),
        robustesse: saveSchema(),
        volonte: saveSchema()
      })
    };

    // --- Combat ---
    const attackCatSchema = () => new fields.SchemaField({
      bonus: new fields.NumberField({ initial: 0, integer: true })
    });

    const combatFields = {
      ca: new fields.SchemaField({
        base: new fields.NumberField({ initial: 10, integer: true }),
        armure: new fields.NumberField({ initial: 0, integer: true }),
        bouclier: new fields.NumberField({ initial: 0, integer: true }),
        bonusVigueur: new fields.NumberField({ initial: 0, integer: true }),
        temp: new fields.NumberField({ initial: 0, integer: true })
      }),
      attackBonuses: new fields.SchemaField({
        mainNue: attackCatSchema(),
        armeBlanche: attackCatSchema(),
        armeDeJet: attackCatSchema(),
        armeExotique: attackCatSchema(),
        armeADistance: attackCatSchema()
      })
    };

    // --- Currency ---
    const currencyFields = {
      or: new fields.NumberField({ initial: 0 })
    };

    // --- Background ---
    const actorRefSchema = () => new fields.SchemaField({
      uuid: new fields.StringField({ required: true }),
      name: new fields.StringField({ initial: "" }),
      comment: new fields.StringField({ initial: "" }),
      groupId: new fields.StringField({ initial: "" })
    });

    const groupSchema = () => new fields.SchemaField({
      id: new fields.StringField({ required: true }),
      name: new fields.StringField({ initial: "Nouveau groupe" }),
      color: new fields.StringField({ initial: "#c9a227" })
    });

    const backgroundFields = {
      background: new fields.SchemaField({
        histoire: new fields.HTMLField({ initial: "" }),
        allies: new fields.HTMLField({ initial: "" }),
        ennemis: new fields.HTMLField({ initial: "" }),
        alliesList: new fields.ArrayField(actorRefSchema()),
        ennemisList: new fields.ArrayField(actorRefSchema()),
        alliesGroups: new fields.ArrayField(groupSchema()),
        ennemisGroups: new fields.ArrayField(groupSchema()),
        croyance: new fields.HTMLField({ initial: "" }),
        aime: new fields.HTMLField({ initial: "" }),
        naimePas: new fields.HTMLField({ initial: "" }),
        expressions: new fields.HTMLField({ initial: "" })
      })
    };

    // --- Favorite Skills ---
    const favoriteFields = {
      favoriteSkills: new fields.ArrayField(
        new fields.StringField({ blank: false }),
        { initial: [] }
      )
    };

    // --- Magic ---
    const magicFields = {
      isMagicPractitioner: new fields.BooleanField({ initial: false }),
      pm: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true }),
        max: new fields.NumberField({ initial: 0, integer: true })
      })
    };

    return {
      ...identityFields,
      ...pvFields,
      ...abilitiesFields,
      ...skillsFields,
      ...savesFields,
      ...combatFields,
      ...currencyFields,
      ...backgroundFields,
      ...favoriteFields,
      ...magicFields
    };
  }

  /**
   * Prepare derived data: skill totals, save totals, CA total, initiative.
   */
  prepareDerivedData() {
    const abilities = this.abilities;

    // --- Ability modifiers (auto-computed from score) ---
    for (const ab of Object.values(abilities)) {
      ab.mod = Math.floor((ab.value - 10) / 2);
    }

    // --- Skill totals ---
    for (const [key, skillCfg] of Object.entries(ANTIQUE.skills)) {
      const skill = this.skills[key];
      if (!skill) continue;
      const abilityMod = abilities[skillCfg.ability]?.mod ?? 0;
      const trainedPenalty = skill.trained ? 0 : -4;
      skill.mod = abilityMod;
      skill.total = abilityMod + skill.bonus + trainedPenalty;
    }

    // --- Save totals ---
    for (const [key, saveCfg] of Object.entries(ANTIQUE.saves)) {
      const save = this.saves[key];
      if (!save) continue;
      let modSum = 0;
      for (const ab of saveCfg.abilities) {
        modSum += abilities[ab]?.mod ?? 0;
      }
      save.modSum = modSum;
      save.total = save.base + modSum + save.temp;
    }

    // --- CA total ---
    const ca = this.ca;
    const conMod = abilities.con?.mod ?? 0;
    ca.conMod = conMod;
    ca.total = ca.base + ca.armure + ca.bouclier + conMod + ca.bonusVigueur + ca.temp;

    // --- Initiative ---
    const dexMod = abilities.dex?.mod ?? 0;
    const vigilanceTotal = this.skills.vigilance?.total ?? 0;
    this.initiative = dexMod + vigilanceTotal;

    // --- Attack bonus totals ---
    for (const [key, catCfg] of Object.entries(ANTIQUE.weaponCategories)) {
      const atk = this.attackBonuses[key];
      if (!atk) continue;
      const abilityMod = abilities[catCfg.ability]?.mod ?? 0;
      atk.abilityMod = abilityMod;
      atk.total = atk.bonus + abilityMod;
    }
  }
}

import { ANTIQUE } from "../helpers/config.mjs";
import { modificateursField } from "./modificateurs.mjs";

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
      avantageTemporaire: new fields.BooleanField({ initial: false }),
      deplacement: new fields.NumberField({ initial: 9, integer: true }),
      // No rules attached yet (user hasn't settled on them) — plain editable counter,
      // same pattern as deplacement: never touched by prepareDerivedData().
      pointsChance: new fields.NumberField({ initial: 0, integer: true }),
      // Directly editable, like deplacement — never overwritten in prepareDerivedData(),
      // so Mule's MULTIPLY ActiveEffect can double it the same way Athlète doubles
      // deplacement. Default 70 (plausible human weight) rather than 0.
      capacitePort: new fields.NumberField({ initial: 70, integer: true })
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
      bonus: new fields.NumberField({ initial: 0, integer: true }),
      // Reaction cost for Esquive/Parade (see AntiqueActor#rollDodgeSkill): each use
      // stacks a further -1 here regardless of success, reset to 0 by the combat
      // turn tracker at the start of this actor's next turn (registerDodgeResetHook,
      // module/helpers/dodge-reset.mjs). Present on every skill for schema
      // consistency, but only ever written to for these two.
      tempPenalty: new fields.NumberField({ initial: 0, integer: true })
    });

    const skillsObj = {};
    for (const key of Object.keys(ANTIQUE.skills)) {
      skillsObj[key] = skillSchema();
    }
    const skillsFields = {
      skills: new fields.SchemaField(skillsObj)
    };

    // --- Saves ---
    // Base is always a fixed +1 (see prepareDerivedData) — not user-editable.
    const saveSchema = () => new fields.SchemaField({
      // Permanent modifier from traits (ex. Dépressif : Volonté -1), driven by an
      // ActiveEffect on an Avantage/Désavantage item — distinct from `temp`, which
      // is the player's own manual scratch field for short-lived situational mods.
      bonus: new fields.NumberField({ initial: 0, integer: true }),
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
      bonus: new fields.NumberField({ initial: 0, integer: true }),
      // Bonus de DÉGÂTS (pas de précision) pour cette catégorie d'arme — distinct de
      // `bonus` ci-dessus, qui n'affecte que le jet d'attaque (to-hit). Alimenté par
      // des ActiveEffect d'avantages (ex. Colère de Zeus), lu par AntiqueItem#rollDamage().
      damageBonus: new fields.NumberField({ initial: 0, integer: true })
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
        combatDeuxMains: attackCatSchema(),
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

    // --- Apothicaire: gates the whole "Ingrédients" tab, same pattern as isMagicPractitioner ---
    const apothicaireFields = {
      hasIngredientBag: new fields.BooleanField({ initial: false })
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
      ...magicFields,
      ...apothicaireFields,
      modificateurs: modificateursField()
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

    // Apply any effect targeting an ability modifier directly (ex. "Bénédiction des
    // Titans") now, before anything below reads it — see the "abilities" phase
    // registration in antique.mjs for why this can't just use Foundry's built-in "final".
    this.parent?.applyActiveEffects("abilities");

    // --- Equipment-granted bonuses (CA and/or a linked skill) ---
    // Only items actually equipped (worn in a body slot) contribute — gear sitting
    // unequipped in the inventory should not affect totals. An equipped item's CA
    // bonus feeds the Armure/Bouclier line specifically when worn in that slot
    // (so it reads as actual armor/shield, not a vague catch-all bonus); any other
    // slot's CA bonus (rings, amulets, etc.) still goes to the generic bucket.
    let equipmentCaBonus = 0;
    let armureBonus = 0;
    let bouclierBonus = 0;
    const equipmentSkillBonuses = {};
    const equippedSlots = {};
    // Poids porté : la totalité de l'inventaire (pas seulement l'équipé), unité × quantité
    // (les armes n'ont pas de quantity — toujours comptées comme 1 exemplaire ; equipment
    // et treasure en ont une).
    let poidsPorteTotal = 0;
    for (const item of this.parent?.items ?? []) {
      if (item.type !== "equipment" && item.type !== "weapon" && item.type !== "treasure") continue;
      const qty = item.type === "weapon" ? 1 : (item.system.quantity ?? 1);
      poidsPorteTotal += (item.system.poids ?? 0) * qty;
      if (item.system.slot && item.system.equipped) {
        equippedSlots[item.system.slot] = item;
      }
      if (item.type !== "equipment" || !item.system.equipped) continue;
      const caBonus = item.system.caBonus ?? 0;
      if (item.system.slot === "torse") armureBonus += caBonus;
      else if (item.system.slot === "bouclier") bouclierBonus += caBonus;
      else equipmentCaBonus += caBonus;
      if (item.system.linkedSkill) {
        const key = item.system.linkedSkill;
        equipmentSkillBonuses[key] = (equipmentSkillBonuses[key] ?? 0) + (item.system.skillBonus ?? 0);
      }
    }
    this.equippedSlots = equippedSlots;
    this.poidsPorteTotal = poidsPorteTotal;

    // --- Skill totals ---
    for (const [key, skillCfg] of Object.entries(ANTIQUE.skills)) {
      const skill = this.skills[key];
      if (!skill) continue;
      const abilityMod = abilities[skillCfg.ability]?.mod ?? 0;
      const trainedPenalty = skill.trained ? 0 : -4;
      const equipmentBonus = equipmentSkillBonuses[key] ?? 0;
      skill.mod = abilityMod;
      skill.equipmentBonus = equipmentBonus;
      skill.total = abilityMod + skill.bonus + trainedPenalty + equipmentBonus + (skill.tempPenalty ?? 0);
    }

    // Statuts (point 80) : bonus / malus d'Esquive.
    if (this.skills.esquive) this.skills.esquive.total += this.modificateurs?.esquive ?? 0;

    // --- Save totals ---
    const SAVE_BASE = 1;
    for (const [key, saveCfg] of Object.entries(ANTIQUE.saves)) {
      const save = this.saves[key];
      if (!save) continue;
      const mod1 = abilities[saveCfg.abilities[0]]?.mod ?? 0;
      const mod2 = abilities[saveCfg.abilities[1]]?.mod ?? 0;
      save.base = SAVE_BASE;
      save.mod1 = mod1;
      save.mod2 = mod2;
      save.modSum = mod1 + mod2;
      save.total = SAVE_BASE + mod1 + mod2 + save.bonus + save.temp;
    }

    // --- CA total ---
    // bonusVigueur always mirrors the Vigueur skill's own total, the same way
    // attack bonuses mirror their linked skill — never computed independently.
    // Armure/Bouclier always mirror whatever is equipped in those slots.
    const ca = this.ca;
    const conMod = abilities.con?.mod ?? 0;
    ca.conMod = conMod;
    ca.armure = armureBonus;
    ca.bouclier = bouclierBonus;
    ca.equipmentBonus = equipmentCaBonus;
    ca.bonusVigueur = this.skills.vigueur?.total ?? 0;
    ca.total = ca.base + ca.armure + ca.bouclier + conMod + ca.bonusVigueur + ca.temp + equipmentCaBonus
      + (this.modificateurs?.ca ?? 0);   // statuts (point 80)

    // --- Initiative ---
    const dexMod = abilities.dex?.mod ?? 0;
    const vigilanceTotal = this.skills.vigilance?.total ?? 0;
    this.initiative = dexMod + vigilanceTotal;

    // --- Attack bonus totals ---
    // Total = skill bonus, plus the ability modifier only if the linked skill is
    // trained (an untrained skill contributes no ability mod — not even a penalty,
    // unlike the skill's own total elsewhere which applies a -4 untrained penalty).
    for (const [key, catCfg] of Object.entries(ANTIQUE.weaponCategories)) {
      const atk = this.attackBonuses[key];
      if (!atk) continue;
      const linkedSkill = this.skills[catCfg.skill];
      const trained = linkedSkill?.trained ?? false;
      const abilityMod = abilities[catCfg.ability]?.mod ?? 0;
      const skillBonus = linkedSkill?.bonus ?? 0;
      atk.abilityMod = abilityMod;
      atk.skillBonus = skillBonus;
      atk.trained = trained;
      atk.total = atk.bonus + skillBonus + (trained ? abilityMod : 0);
    }
  }
}

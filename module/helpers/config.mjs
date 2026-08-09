export const ANTIQUE = {};

ANTIQUE.abilities = {
  for: "ANTIQUE.Ability.For",
  dex: "ANTIQUE.Ability.Dex",
  con: "ANTIQUE.Ability.Con",
  int: "ANTIQUE.Ability.Int",
  ast: "ANTIQUE.Ability.Ast",
  cha: "ANTIQUE.Ability.Cha"
};

ANTIQUE.skills = {
  // FOR-based
  combatMainNue:   { label: "ANTIQUE.Skill.CombatMainNue",   ability: "for", icon: "fas fa-fist-raised" },
  armeBlanche:     { label: "ANTIQUE.Skill.ArmeBlanche",     ability: "for", icon: "fas fa-khanda" },
  armeDeJet:       { label: "ANTIQUE.Skill.ArmeDeJet",       ability: "for", icon: "fas fa-meteor" },
  levage:          { label: "ANTIQUE.Skill.Levage",           ability: "for", icon: "fas fa-dumbbell" },
  parade:          { label: "ANTIQUE.Skill.Parade",           ability: "for", icon: "fas fa-shield-alt" },
  armeExotique:    { label: "ANTIQUE.Skill.ArmeExotique",     ability: "for", icon: "fas fa-gavel" },
  combatDeuxMains: { label: "ANTIQUE.Skill.CombatDeuxMains", ability: "for", icon: "fas fa-hands" },
  artisanatFor:    { label: "ANTIQUE.Skill.ArtisanatFor",    ability: "for", icon: "fas fa-hammer" },

  // DEX-based
  esquive:      { label: "ANTIQUE.Skill.Esquive",      ability: "dex", icon: "fas fa-running" },
  armeADistance: { label: "ANTIQUE.Skill.ArmeADistance", ability: "dex", icon: "fas fa-bullseye" },
  escamotage:   { label: "ANTIQUE.Skill.Escamotage",   ability: "dex", icon: "fas fa-hand-sparkles" },
  acrobatie:    { label: "ANTIQUE.Skill.Acrobatie",    ability: "dex", icon: "fas fa-child" },
  discretion:   { label: "ANTIQUE.Skill.Discretion",   ability: "dex", icon: "fas fa-user-secret" },
  dressage:     { label: "ANTIQUE.Skill.Dressage",     ability: "dex", icon: "fas fa-horse" },
  jeux:         { label: "ANTIQUE.Skill.Jeux",         ability: "dex", icon: "fas fa-dice" },
  artisanatDex: { label: "ANTIQUE.Skill.ArtisanatDex", ability: "dex", icon: "fas fa-tools" },

  // CON-based
  resistancePoisons:  { label: "ANTIQUE.Skill.ResistancePoisons",  ability: "con", icon: "fas fa-skull-crossbones" },
  resistanceDouleur:  { label: "ANTIQUE.Skill.ResistanceDouleur",  ability: "con", icon: "fas fa-bolt" },
  athletisme:         { label: "ANTIQUE.Skill.Athletisme",         ability: "con", icon: "fas fa-walking" },
  equitation:         { label: "ANTIQUE.Skill.Equitation",         ability: "con", icon: "fas fa-horse-head" },
  natation:           { label: "ANTIQUE.Skill.Natation",           ability: "con", icon: "fas fa-water" },
  escalade:           { label: "ANTIQUE.Skill.Escalade",           ability: "con", icon: "fas fa-mountain" },
  vigueur:            { label: "ANTIQUE.Skill.Vigueur",            ability: "con", icon: "fas fa-heartbeat" },
  survie:             { label: "ANTIQUE.Skill.Survie",             ability: "con", icon: "fas fa-campground" },

  // INT-based
  culture:    { label: "ANTIQUE.Skill.Culture",    ability: "int", icon: "fas fa-theater-masks" },
  politique:  { label: "ANTIQUE.Skill.Politique",  ability: "int", icon: "fas fa-landmark" },
  nature:     { label: "ANTIQUE.Skill.Nature",     ability: "int", icon: "fas fa-leaf" },
  histoire:   { label: "ANTIQUE.Skill.Histoire",   ability: "int", icon: "fas fa-book" },
  mythologie: { label: "ANTIQUE.Skill.Mythologie", ability: "int", icon: "fas fa-scroll" },
  tactique:   { label: "ANTIQUE.Skill.Tactique",   ability: "int", icon: "fas fa-chess" },
  geographie: { label: "ANTIQUE.Skill.Geographie", ability: "int", icon: "fas fa-globe-europe" },
  etiquette:  { label: "ANTIQUE.Skill.Etiquette",  ability: "int", icon: "fas fa-crown" },

  // AST-based
  premierSoin:  { label: "ANTIQUE.Skill.PremierSoin",  ability: "ast", icon: "fas fa-first-aid" },
  investigation:{ label: "ANTIQUE.Skill.Investigation", ability: "ast", icon: "fas fa-search" },
  mysticisme:   { label: "ANTIQUE.Skill.Mysticisme",   ability: "ast", icon: "fas fa-moon" },
  navigation:   { label: "ANTIQUE.Skill.Navigation",   ability: "ast", icon: "fas fa-compass" },
  linguistique: { label: "ANTIQUE.Skill.Linguistique", ability: "ast", icon: "fas fa-language" },
  vigilance:    { label: "ANTIQUE.Skill.Vigilance",    ability: "ast", icon: "fas fa-eye" },
  empathie:     { label: "ANTIQUE.Skill.Empathie",     ability: "ast", icon: "fas fa-hand-holding-heart" },
  perception:   { label: "ANTIQUE.Skill.Perception",   ability: "ast", icon: "fas fa-binoculars" },

  // CHA-based
  intimidation:   { label: "ANTIQUE.Skill.Intimidation",   ability: "cha", icon: "fas fa-angry" },
  dissimulation:  { label: "ANTIQUE.Skill.Dissimulation",  ability: "cha", icon: "fas fa-mask" },
  commandement:   { label: "ANTIQUE.Skill.Commandement",   ability: "cha", icon: "fas fa-flag" },
  seduction:      { label: "ANTIQUE.Skill.Seduction",      ability: "cha", icon: "fas fa-heart" },
  baratin:        { label: "ANTIQUE.Skill.Baratin",        ability: "cha", icon: "fas fa-comments" },
  psychologie:    { label: "ANTIQUE.Skill.Psychologie",    ability: "cha", icon: "fas fa-brain" },
  marchandage:    { label: "ANTIQUE.Skill.Marchandage",    ability: "cha", icon: "fas fa-coins" },
  representation: { label: "ANTIQUE.Skill.Representation", ability: "cha", icon: "fas fa-music" }
};

ANTIQUE.skillsByAbility = {};
for (const [key, skill] of Object.entries(ANTIQUE.skills)) {
  const ab = skill.ability;
  if (!ANTIQUE.skillsByAbility[ab]) ANTIQUE.skillsByAbility[ab] = {};
  ANTIQUE.skillsByAbility[ab][key] = skill;
}

ANTIQUE.saves = {
  reflexes:   { label: "ANTIQUE.Save.Reflexes",   abilities: ["dex", "ast"] },
  robustesse: { label: "ANTIQUE.Save.Robustesse", abilities: ["con", "for"] },
  volonte:    { label: "ANTIQUE.Save.Volonte",     abilities: ["int", "cha"] }
};

ANTIQUE.weaponCategories = {
  mainNue:      { label: "ANTIQUE.WeaponCat.MainNue",      ability: "for", icon: "fas fa-fist-raised", skill: "combatMainNue" },
  armeBlanche:  { label: "ANTIQUE.WeaponCat.ArmeBlanche",  ability: "for", icon: "fas fa-khanda", skill: "armeBlanche" },
  armeDeJet:    { label: "ANTIQUE.WeaponCat.ArmeDeJet",    ability: "for", icon: "fas fa-meteor", skill: "armeDeJet" },
  armeExotique: { label: "ANTIQUE.WeaponCat.ArmeExotique",  ability: "for", icon: "fas fa-gavel", skill: "armeExotique" },
  combatDeuxMains: { label: "ANTIQUE.WeaponCat.CombatDeuxMains", ability: "for", icon: "fas fa-hands", skill: "combatDeuxMains" },
  armeADistance: { label: "ANTIQUE.WeaponCat.ArmeADistance", ability: "dex", icon: "fas fa-bullseye", skill: "armeADistance" }
};

/**
 * Body/equipment slots shown around the silhouette in the Inventory tab.
 * `types` restricts which item types may be assigned to that slot (used to build
 * the slot <select> on each item sheet).
 */
ANTIQUE.equipmentSlots = {
  tete:            { label: "ANTIQUE.Slot.Tete",           icon: "fas fa-hat-wizard",     types: ["equipment"] },
  torse:           { label: "ANTIQUE.Slot.Torse",          icon: "fas fa-vest",           types: ["equipment"] },
  jambes:          { label: "ANTIQUE.Slot.Jambes",         icon: "fas fa-socks",          types: ["equipment"] },
  mains:           { label: "ANTIQUE.Slot.Mains",          icon: "fas fa-mitten",         types: ["equipment"] },
  bouclier:        { label: "ANTIQUE.Slot.Bouclier",       icon: "fas fa-shield-alt",     types: ["equipment"] },
  armePrincipale:  { label: "ANTIQUE.Slot.ArmePrincipale", icon: "fas fa-khanda",         types: ["weapon"] },
  armeSecondaire:  { label: "ANTIQUE.Slot.ArmeSecondaire", icon: "fas fa-meteor",         types: ["weapon"] },
  accessoire1:     { label: "ANTIQUE.Slot.Accessoire1",    icon: "fas fa-ring",           types: ["equipment"] },
  accessoire2:     { label: "ANTIQUE.Slot.Accessoire2",    icon: "fas fa-gem",            types: ["equipment"] }
};

/**
 * Categories shown in the character sheet's Apothicaire tab (sac d'apothicaire).
 * Any "equipment" item tagged with one of these keys (system.apothCategory)
 * appears grouped there instead of only in the generic Inventory list.
 */
ANTIQUE.apothCategories = {
  ingredientCommun:    { label: "ANTIQUE.Apoth.IngredientCommun" },
  ingredientPeuCommun: { label: "ANTIQUE.Apoth.IngredientPeuCommun" },
  ingredientRare:      { label: "ANTIQUE.Apoth.IngredientRare" },
  potion:              { label: "ANTIQUE.Apoth.Potion" }
};

/**
 * Translate an Active Effect change into a human-readable label.
 * Must be called after game.i18n is available (i.e. after init).
 * @param {object} change - {key, mode, value}
 * @returns {string}
 */
ANTIQUE.getEffectChangeLabel = function(change) {
  const key = change.key;
  const value = Number(change.value);
  const sign = value >= 0 ? "+" : "";

  // Abilities
  const abilityMatch = key.match(/^system\.abilities\.(\w+)\.(\w+)$/);
  if (abilityMatch) {
    const [, ab, prop] = abilityMatch;
    const label = game.i18n.localize(ANTIQUE.abilities[ab] ?? ab);
    if (prop === "mod") return `${sign}${value} ${label}`;
    if (prop === "value") return `${sign}${value} ${label} (score)`;
  }

  // Skills
  const skillMatch = key.match(/^system\.skills\.(\w+)\.(\w+)$/);
  if (skillMatch) {
    const [, sk] = skillMatch;
    const label = game.i18n.localize(ANTIQUE.skills[sk]?.label ?? sk);
    return `${sign}${value} ${label}`;
  }

  // Saves
  const saveMatch = key.match(/^system\.saves\.(\w+)\.(\w+)$/);
  if (saveMatch) {
    const [, sv] = saveMatch;
    const label = game.i18n.localize(ANTIQUE.saves[sv]?.label ?? sv);
    return `${sign}${value} ${label}`;
  }

  // PV
  if (key === "system.pv.max") return `${sign}${value} PV Max`;
  if (key === "system.pv.value") return `${sign}${value} PV`;

  // CA
  const caMatch = key.match(/^system\.ca\.(\w+)$/);
  if (caMatch) {
    const prop = caMatch[1];
    if (prop === "total") return `${sign}${value} CA`;
    return `${sign}${value} CA (${prop})`;
  }

  // Attack bonuses
  const atkMatch = key.match(/^system\.attackBonuses\.(\w+)\.bonus$/);
  if (atkMatch) {
    const [, cat] = atkMatch;
    const label = game.i18n.localize(ANTIQUE.weaponCategories[cat]?.label ?? cat);
    return `${sign}${value} ${label}`;
  }

  // Default
  return `${sign}${value} ${key}`;
};

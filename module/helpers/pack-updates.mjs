/**
 * Registre des correctifs de contenu de compendium en attente de propagation vers un
 * monde déjà déployé — remplace, pour les futures sessions, l'écriture d'un script
 * `packs/_fix-*-live.js` à coller dans une macro GM. Chaque entrée est proposée au GM
 * via un écran à cocher (module/apps/pack-update-picker.mjs), par compendium, et ne
 * touche le monde que si elle est cochée : jamais d'écrasement en bloc d'un document
 * existant, uniquement des créations de documents manquants et des corrections de champs
 * ciblées — même patron que les anciens scripts (game.packs.get, getIndex/getDocument,
 * createDocuments/createEmbeddedDocuments, verrouillage/déverrouillage du pack).
 *
 * `pack` doit correspondre à un `name` de `system.json` → `packs[]`. Les anciens scripts
 * déjà exécutés et confirmés ne sont pas rétro-portés ici — seuls les correctifs écrits
 * à partir de ce mécanisme y figurent.
 */
export const PACK_UPDATES = [
  {
    id: "0.6.55-embed-effets-simple",
    pack: "avantages",
    version: "0.6.55",
    label: "Effets simples embarqués sur les avantages",
    description:
      "Ajoute l'effet manquant dans l'onglet \"Effets\" des 24 avantages \"effet simple\" " +
      "(Guerrier Aguerri, Equilibre félin, Bon sens, etc.) — jusqu'ici seul un lien dans la " +
      "description existait, l'effet n'était pas réellement attaché à l'avantage.",
    apply: applyEmbedEffetsSimple
  },
  {
    id: "0.6.57-create-effets-batch2",
    pack: "effets",
    version: "0.6.57",
    label: "32 nouveaux effets narratifs (2e vague)",
    description:
      "Crée les 32 documents Effet manquants (Orientation, Etincelle de Zeus, les Auras, " +
      "Faveur de la Dame et le reste de la 2e vague d'avantages -2/-3/-5) — à appliquer " +
      "avant ou avec le correctif \"Avantages\" ci-dessous.",
    apply: applyCreateEffetsBatch2
  },
  {
    id: "0.6.57-embed-effets-batch2",
    pack: "avantages",
    version: "0.6.57",
    label: "32 nouveaux effets simples liés + embarqués sur les avantages",
    description:
      "Ajoute le lien vers l'effet et l'effet embarqué (onglet \"Effets\") sur les 32 " +
      "avantages -2/-3/-5 de la 2e vague.",
    apply: applyEmbedEffetsBatch2
  },
  {
    id: "0.6.58-create-effets-batch3",
    pack: "effets",
    version: "0.6.58",
    label: "18 nouveaux effets mécaniques (étape 2/3)",
    description:
      "Crée les 18 documents Effet manquants : les 15 Auras (bonus de caractéristique) + " +
      "Mire d'Artèmis, Talent d'Héphaistos, Pieds d'Hermes.",
    apply: applyCreateEffetsBatch3
  },
  {
    id: "0.6.58-link-embed-effets-batch3",
    pack: "avantages",
    version: "0.6.58",
    label: "18 effets mécaniques liés (+ 3 embarqués) sur les avantages",
    description:
      "Ajoute le lien vers l'effet sur les 18 avantages concernés, et embarque l'effet " +
      "directement pour Mire d'Artèmis, Talent d'Héphaistos et Pieds d'Hermes (bonus sur " +
      "le porteur lui-même) — pour les 15 Auras, voir le correctif de suivi ci-dessous.",
    apply: applyLinkEmbedEffetsBatch3
  },
  {
    id: "0.6.59-embed-auras",
    pack: "avantages",
    version: "0.6.59",
    label: "Les 15 Auras s'appliquent maintenant aussi au porteur",
    description:
      "Décision revue : les 15 avantages \"Aura d'X\" ne sont plus seulement à glisser sur " +
      "un allié, ils doivent aussi s'appliquer automatiquement au PJ qui possède l'avantage " +
      "— ajoute l'effet embarqué manquant dans leur onglet \"Effets\" (le lien de " +
      "description reste inchangé).",
    apply: applyEmbedAuras
  },
  {
    id: "0.6.60-faveur-de-la-dame-limitation",
    pack: "avantages",
    version: "0.6.60",
    label: "Faveur de la Dame — compteur d'utilisations (3)",
    description:
      "Configure le nouveau compteur d'utilisations limitées (3, rechargeable via le " +
      "bouton \"Réinitialiser\" sur la fiche du personnage) sur l'avantage Faveur de la " +
      "Dame — pas un ActiveEffect, une simple correction de champ.",
    apply: applySetFaveurDeLaDameLimitation
  },
  {
    id: "0.6.61-fix-athlete-effect",
    pack: "avantages",
    version: "0.6.61",
    label: "Athlète — effet manquant ou en double",
    description:
      "Athlète (l'un des 3 tout premiers exemples, construit avant tous les mécanismes de " +
      "propagation ultérieurs) n'a jamais eu de correctif dédié pour les copies déjà " +
      "possédées par un personnage — si un joueur a récupéré Athlète avant l'ajout de son " +
      "effet, sa copie n'en a jamais reçu. Corrige l'absence d'effet ET les doublons " +
      "éventuels (garde une seule copie correcte : Déplacement ×2), sur le compendium et " +
      "les copies déjà possédées.",
    apply: applyFixAthleteEffect
  },
  {
    id: "0.6.63-cleanup-effect-field-avantages",
    pack: "avantages",
    version: "0.6.63",
    label: "Nettoyage : champ \"Effet\" retiré, dédoublonnage",
    description:
      "Le champ texte \"Effet\" (redondant avec la description) est retiré du schéma — son " +
      "contenu est repris dans la description de l'effet actif existant à la place. " +
      "Corrige au passage tout avantage qui se serait retrouvé avec plusieurs effets " +
      "embarqués (probablement causé par le bug .effects.length de la 0.6.62), sur le " +
      "compendium et toutes les copies déjà possédées.",
    apply: applyCleanupEffectFieldAvantages
  },
  {
    id: "0.6.63-cleanup-effect-field-desavantages",
    pack: "desavantages",
    version: "0.6.63",
    label: "Nettoyage : champ \"Effet\" retiré, dédoublonnage",
    description:
      "Même correctif que pour les Avantages, côté Désavantages : retire le champ " +
      "\"Effet\", reprend son contenu dans la description de l'effet actif existant (5 " +
      "désavantages seulement en ont un), et dédoublonne si besoin.",
    apply: applyCleanupEffectFieldDesavantages
  },
  {
    id: "0.6.64-backfill-effect-descriptions-avantages",
    pack: "avantages",
    version: "0.6.64",
    label: "Descriptions des effets actifs — vraiment cette fois",
    description:
      "Les correctifs \"Nettoyage : champ Effet\" (0.6.63) ne recopiaient rien : ils " +
      "lisaient system.effect en direct sur le monde, mais ce champ n'est plus lisible " +
      "une fois retiré du schéma. Ce correctif recopie les bons textes (codés en dur, " +
      "extraits d'avantages.db) dans la description de chaque effet actif existant.",
    apply: applyCleanupEffectFieldAvantages
  },
  {
    id: "0.6.64-backfill-effect-descriptions-desavantages",
    pack: "desavantages",
    version: "0.6.64",
    label: "Descriptions des effets actifs — vraiment cette fois",
    description:
      "Même correctif que pour les Avantages, côté Désavantages (5 désavantages ont un " +
      "effet actif).",
    apply: applyCleanupEffectFieldDesavantages
  },
  {
    id: "0.6.65-create-effet-mule",
    pack: "effets",
    version: "0.6.65",
    label: "Effet de Mule",
    description: "Crée le document Effet manquant (×2 sur la capacité de port).",
    apply: applyCreateEffetMule
  },
  {
    id: "0.6.65-embed-effet-mule",
    pack: "avantages",
    version: "0.6.65",
    label: "Effet de Mule lié + embarqué",
    description:
      "Ajoute le lien et l'effet embarqué (×2 sur la capacité de port) sur l'avantage Mule.",
    apply: applyEmbedEffetMule
  },
  {
    id: "0.6.65-item-weights-armes",
    pack: "armes",
    version: "0.6.65",
    label: "Poids des armes/armures (estimation)",
    description:
      "Ajoute une estimation de poids (kg) aux armes et armures déjà déployées, pour la " +
      "nouvelle capacité de port — approximatif, à corriger au cas par cas.",
    apply: applyItemWeightsArmes
  },
  {
    id: "0.6.65-item-weights-equipement",
    pack: "equipement",
    version: "0.6.65",
    label: "Poids de l'équipement (estimation)",
    description:
      "Même correctif que pour les Armes, côté compendium Équipement.",
    apply: applyItemWeightsEquipement
  }
];

const SIMPLE_NAMES = [
  "Guerrier Aguerri", "Equilibre félin", "Fetard", "Bon sens", "Commercant",
  "Visage passe partout", "Sommeil leger", "Faveur", "Respect d'Héra",
  "Branchies de Poséidon", "Rage d'Arès", "Soin d'Apollon", "Chasse d'Artèmis",
  "Beauté d'Aphrodite", "Mains d'Hèrmès", "Ivresse de Dionysos", "Chaleur d'Hestia",
  "Vue d'Hécate", "Don d'Hadès", "Chrono sens", "Ami des animaux", "Ambidextrie",
  "Charme d'Aphrodite", "Casque d'Hadès"
];

function cleanName(name) {
  return name.replace(/^\(-?\d+\)\s*/, "");
}

async function embedMissingEffect(doc) {
  const name = cleanName(doc.name);
  if (!SIMPLE_NAMES.includes(name)) return false;
  if (doc.effects.size) return false;

  await doc.createEmbeddedDocuments("ActiveEffect", [{
    name,
    img: doc.img,
    "system.changes": [],
    disabled: false,
    transfer: true
  }]);
  return true;
}

/** Voir packs/_fix-embed-effets-simple-live.js, dont cette fonction reprend la logique. */
async function applyEmbedEffetsSimple() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const entry of index) {
      if (entry.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(entry.name))) continue;
      const doc = await pack.getDocument(entry._id);
      if (await embedMissingEffect(doc)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(item.name))) continue;
      if (await embedMissingEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-effets-batch2.js, dont ces données/fonctions reprennent la logique. */
const EFFETS_BATCH2 = [
  { id: "eEft000000000029", name: "Orientation", img: "icons/svg/upgrade.svg", description: "<p>Vous savez toujours vous reperer dans l'espace</p>" },
  { id: "eEft000000000030", name: "Porte bouclier", img: "icons/svg/upgrade.svg", description: "<p>Vous avez un avantage lorsque vous étes le bouclier d'un autre</p>" },
  { id: "eEft000000000031", name: "Don des langues", img: "icons/svg/upgrade.svg", description: "<p>Polyglotte</p>" },
  { id: "eEft000000000032", name: "Volonté de fer", img: "icons/svg/upgrade.svg", description: "<p>vous n'avez peur de rien et vous etes rarement prit au dépourvu</p>" },
  { id: "eEft000000000033", name: "Maitre d'Arme", img: "icons/svg/upgrade.svg", description: "<p>Vous etes un maitre du maniement d'une arme +2 si vous l'utilisez</p>" },
  { id: "eEft000000000034", name: "Maitre des forges", img: "icons/svg/upgrade.svg", description: "<p>Votre talent en forgeronerie vous permet de construire ou reparer en toute circonstance</p>" },
  { id: "eEft000000000035", name: "Faveur +", img: "icons/svg/upgrade.svg", description: "<p>Un membre respecté vous dois une faveur (au choix)</p>" },
  { id: "eEft000000000036", name: "Etincelle de Zeus", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Zeus</p><p>1/4 chance de Stun 1 tour avec une arme</p>" },
  { id: "eEft000000000037", name: "Vision d'Héra", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hera</p><p>1 fois par jour: permet d'avoir des Info sur une personne connu</p>" },
  { id: "eEft000000000038", name: "Voix d'Athéna", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Athéna</p><p>Peut forcer quelqu'un a obeir a un ordre 1/j</p>" },
  { id: "eEft000000000039", name: "Moisson de Déméter", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Demeter</p><p>Permet de trouver de la nourriture (végétaux)</p>" },
  { id: "eEft000000000040", name: "Talent de Dionysos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Resistance à la drogue et l'alcool</p>" },
  { id: "eEft000000000041", name: "Flamme d'Hestia", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hestia</p><p>Votre corps est plus chaud que la moyenne pas de pénalité froid/humide</p>" },
  { id: "eEft000000000042", name: "Lanterne d'Hécate", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hécate</p><p>Permet de voir dans le noir</p>" },
  { id: "eEft000000000043", name: "Dieu de l'esquive", img: "icons/svg/upgrade.svg", description: "<p>L'esquive est un art que vous maitrisez, vous n'etes pas limité dans votre nombre d'esquive</p>" },
  { id: "eEft000000000044", name: "Dieu du stade", img: "icons/svg/upgrade.svg", description: "<p>Vos capacités athétiques sont un atout majeur, vous ne fatiguez pas si facilement</p>" },
  { id: "eEft000000000045", name: "Dieu de la guerre", img: "icons/svg/upgrade.svg", description: "<p>Si vous choisissez d'attaquer une seconde fois, aucun malus ne vous sera ajouter</p>" },
  { id: "eEft000000000046", name: "Rageux", img: "icons/svg/upgrade.svg", description: "<p>Sous l'effet de la rage, vos coups font plus mal mais vous avez tendance a voir rouge</p>" },
  { id: "eEft000000000047", name: "Faveur ++", img: "icons/svg/upgrade.svg", description: "<p>Un haut membre vous dois une faveur (au choix)</p>" },
  { id: "eEft000000000048", name: "Sang de Zeus", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Zeus</p><p>Extra Life</p>" },
  { id: "eEft000000000049", name: "Paume de Poséidon", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Offre un Bateau Magique</p>" },
  { id: "eEft000000000050", name: "Esprit d'Athéna", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Athéna</p><p>Athéna elle même vous préviens lorsque vous faite le mauvais choix</p>" },
  { id: "eEft000000000051", name: "Armure d'Arès", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Arès</p><p>Frénesie apres deux kills qui double les PV temporaire</p>" },
  { id: "eEft000000000052", name: "Blé de Déméter", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Demeter</p><p>Permet de régénerer 3 fois plus de Pv en mangeant.</p>" },
  { id: "eEft000000000053", name: "Oeil d'Apollon", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Apollon</p><p>Oracle (vision dans le sommeil)</p>" },
  { id: "eEft000000000054", name: "Compagnon d'Artèmis", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Animal magique</p>" },
  { id: "eEft000000000055", name: "Yeux d'Héphaistos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Permet de détécter la magie et les enchantements</p>" },
  { id: "eEft000000000056", name: "Murmure d'Aphrodite", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Permet d'Obtenir de sombre secrets sur une personne connus</p>" },
  { id: "eEft000000000057", name: "Message d'Hermes", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hermes</p><p>Permet de transmettre des messages court et simple à des alliés</p>" },
  { id: "eEft000000000058", name: "Amphore de Dionysos", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Permet de récuperer tout ces PV avec de l'alcool/ 1j</p>" },
  { id: "eEft000000000059", name: "Bucher d'Héstia", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hestia</p><p>Permet de creer un feu qui apporte protection et comfort</p>" },
  { id: "eEft000000000060", name: "Lune d'Hécate", img: "icons/svg/sun.svg", description: "<p><strong>Dévotion :</strong> Hécate</p><p>Permet un rituel par nuit</p>" }
];

function effetDocData(entry) {
  return {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
    type: "base",
    system: { changes: [] },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsBatch2() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_BATCH2.filter(e => !existingIds.has(e.id)).map(effetDocData);
  if (!missing.length) return 0;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  if (wasLocked) await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndEmbedBatch2(doc, entry) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${entry.id}]{${entry.name}}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: entry.name,
      img: entry.img,
      "system.changes": [],
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyEmbedEffetsBatch2() {
  const byName = new Map(EFFETS_BATCH2.map(e => [e.name, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndEmbedBatch2(doc, entry)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndEmbedBatch2(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-effets-batch3-mechaniques.js, dont ces données/fonctions reprennent la logique. */
const EFFETS_BATCH3 = [
  { id: "eEft000000000061", advName: "Mire d'Artèmis", effetName: "Mire d'Artèmis", selfEmbed: true, changes: [{ key: "system.attackBonuses.armeADistance.damageBonus", type: "add", value: "3" }], description: "<p>+3 aux dégâts de toutes les armes à distance, tant que cet effet est actif.</p>" },
  { id: "eEft000000000062", advName: "Talent d'Héphaistos", effetName: "Talent d'Héphaistos", selfEmbed: true, changes: [{ key: "system.attackBonuses.armeBlanche.damageBonus", type: "add", value: "3" }], description: "<p>+3 aux dégâts de toutes les armes au corps à corps, tant que cet effet est actif.</p>" },
  { id: "eEft000000000063", advName: "Pieds d'Hermes", effetName: "Pieds d'Hermes", selfEmbed: true, changes: [{ key: "system.deplacement", type: "add", value: "6" }], description: "<p>+6m de déplacement, tant que cet effet est actif.</p>" },
  { id: "eEft000000000064", advName: "Aura de Zeus", effetName: "Allié de l'aura de Zeus", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000065", advName: "Aura d'Héra", effetName: "Allié de l'aura d'Héra", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000066", advName: "Aura de Poséidon", effetName: "Allié de l'aura de Poséidon", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000067", advName: "Aura d'Athéna", effetName: "Allié de l'aura d'Athéna", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000068", advName: "Aura d'Arès", effetName: "Allié de l'aura d'Arès", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000069", advName: "Aura de Demeter", effetName: "Allié de l'aura de Demeter", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000070", advName: "Aura d'Apollon", effetName: "Allié de l'aura d'Apollon", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000071", advName: "Aura d'Artèmis", effetName: "Allié de l'aura d'Artèmis", selfEmbed: true, changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Dextérité tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000072", advName: "Aura d'Héphaïstos", effetName: "Allié de l'aura d'Héphaïstos", selfEmbed: true, changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Force tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000073", advName: "Aura d'Aphrodite", effetName: "Allié de l'aura d'Aphrodite", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000074", advName: "Aura d'Hermes", effetName: "Allié de l'aura d'Hermes", selfEmbed: true, changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Dextérité tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000075", advName: "Aura de Dionysos", effetName: "Allié de l'aura de Dionysos", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000076", advName: "Aura d'Hestia", effetName: "Allié de l'aura d'Hestia", selfEmbed: true, changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Charisme tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000077", advName: "Aura d'Hécate", effetName: "Allié de l'aura d'Hécate", selfEmbed: true, changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Astuce tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" },
  { id: "eEft000000000078", advName: "Aura d'Hadès", effetName: "Allié de l'aura d'Hadès", selfEmbed: true, changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }], description: "<p>Bonus divin de +2 sur la caractéristique Constitution tant que cet effet est actif.</p><p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>" }
];

function effetDocDataBatch3(entry) {
  return {
    _id: entry.id,
    name: entry.effetName,
    img: "icons/svg/sun.svg",
    type: "base",
    system: { changes: entry.changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
}

async function applyCreateEffetsBatch3() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_BATCH3.filter(e => !existingIds.has(e.id)).map(effetDocDataBatch3);
  if (!missing.length) return 0;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  if (wasLocked) await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndMaybeEmbedBatch3(doc, entry) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${entry.id}]{${entry.effetName}}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (entry.selfEmbed && !doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: entry.effetName,
      img: doc.img,
      "system.changes": entry.changes,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEmbedEffetsBatch3() {
  const byName = new Map(EFFETS_BATCH3.map(e => [e.advName, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndMaybeEmbedBatch3(doc, entry)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndMaybeEmbedBatch3(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_embed-auras-on-advantages.js, dont cette fonction reprend la logique. */
async function embedAuraEffect(doc, entry) {
  if (doc.effects.size) return false;

  await doc.createEmbeddedDocuments("ActiveEffect", [{
    name: entry.effetName,
    img: doc.img,
    "system.changes": entry.changes,
    disabled: false,
    transfer: true
  }]);
  return true;
}

async function applyEmbedAuras() {
  const auras = EFFETS_BATCH3.filter(e => !e.selfEmbed);
  const byName = new Map(auras.map(e => [e.advName, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedAuraEffect(doc, entry)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await embedAuraEffect(item, entry)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/avantages.db (champ Faveur de la Dame) — simple correction de champ, pas
 *  d'ActiveEffect impliqué. Idempotent : ne touche pas une copie déjà configurée ou dont
 *  le compteur a déjà été entamé par le joueur (ne réinitialise jamais une valeur en cours). */
async function setFaveurDeLaDameLimitation(doc) {
  if (doc.system.limitation === 3) return false;
  await doc.update({ "system.limitation": 3, "system.limitationValue": 3 });
  return true;
}

async function applySetFaveurDeLaDameLimitation() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Faveur de la Dame") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setFaveurDeLaDameLimitation(doc)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Faveur de la Dame") continue;
      if (await setFaveurDeLaDameLimitation(item)) fixed++;
    }
  }

  return fixed;
}

const ATHLETE_CHANGES = [{ key: "system.deplacement", type: "multiply", value: "2" }];

/**
 * Ensures exactly one correctly-shaped embedded effect on an Athlète doc (compendium or
 * owned copy) — adds it if missing, trims duplicates down to one if there are several,
 * fixes the changes if the surviving one is wrong. Idempotent, safe to rerun.
 */
async function fixAthleteEffect(doc) {
  if (doc.effects.size === 0) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Athléte",
      img: doc.img,
      "system.changes": ATHLETE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    return true;
  }

  let changed = false;

  if (doc.effects.size > 1) {
    const [, ...extraIds] = Array.from(doc.effects.keys());
    await doc.deleteEmbeddedDocuments("ActiveEffect", extraIds);
    changed = true;
  }

  const kept = doc.effects.contents[0];
  const keptChanges = (kept.system.changes ?? []).map(c => ({ key: c.key, type: c.type, value: c.value }));
  if (JSON.stringify(keptChanges) !== JSON.stringify(ATHLETE_CHANGES)) {
    await kept.update({ "system.changes": ATHLETE_CHANGES });
    changed = true;
  }

  return changed;
}

async function applyFixAthleteEffect() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Athléte") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixAthleteEffect(doc)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Athléte") continue;
      if (await fixAthleteEffect(item)) fixed++;
    }
  }

  return fixed;
}

/**
 * Textes de description repris depuis packs/avantages.db / packs/desavantages.db après
 * le passage de packs/_remove-effect-field.js (l'ancien contenu de system.effect). Codés
 * en dur plutôt que lus depuis doc.system.effect : Foundry construit .system depuis le
 * schéma DataModel actuel, donc dès que ce déploiement (schéma sans le champ effect) est
 * actif, une valeur déjà stockée pour un champ retiré du schéma n'est plus lisible via
 * .system — corrige le premier essai de ce correctif, qui lisait system.effect en live et
 * ne trouvait donc plus rien à recopier.
 */
const EFFECT_DESCRIPTIONS_AVANTAGES = {
  "Guerrier Aguerri": "Offre une deuxieme action de combat",
  "Sens aiguisé": "Choisir un sens qui sera aiguisé (+2 bonus perception sens)",
  "Equilibre félin": "Pas de malus sur terrain difficile",
  "Fetard": "Pas de malus du à l'alcool/ manque de sommeil",
  "Bon sens": "Une petite voix dans votre tête vous conseil parfois",
  "Sens artistique": "Vous maitrisez un art ce qui vous donne +2 en representation/ art",
  "Athléte": "Capacité de deplacement x2",
  "Sang froid": "Vous resistez à la peur +2 en volonté",
  "Commercant": "Augmente vos possibilité de commerce (vente et achat)",
  "Visage passe partout": "Votre visage n'as rien de particulier, on vous oublie facilement",
  "Peau dense": "Augmente la CA de Base de 2",
  "Vif": "Réflexe base+2",
  "Cuir de Hero": "Robustesse base+2",
  "Pisteur": "La chasse n'as pas de secret pour vous +2 vig et nature/ dans la nature",
  "Sommeil leger": "Vous dormez d'une oreille, avantage en cas de reveil soudain",
  "Faveur": "Un lambda vous dois une faveur (au choix)",
  "Colère de Zeus": "Dégats aux corps à corps +3",
  "Respect d'Héra": "Tu peux percevoir la trahison dans ton entourage",
  "Branchies de Poséidon": "Permet 1d6/lvl de régéneration avec de l'eau",
  "Protection d'Athéna": "Augmente la CA de +2",
  "Rage d'Arès": "Permet de faire deux attaques/ tour",
  "Soin d'Apollon": "Permet de stabiliser un allié 2/j",
  "Chasse d'Artèmis": "Chasse assuré",
  "Beauté d'Aphrodite": "Permet de capter l'attention ou la rejeter au combat",
  "Mains d'Hèrmès": "Permet de voler un petit objet avec 1 chance sur 6 d'etre reperer",
  "Ivresse de Dionysos": "Permet de renforcer les effets de l'alcool",
  "Chaleur d'Hestia": "Vous inspirez confiance",
  "Vue d'Hécate": "Permet de toujours connaitre la voie à prendre",
  "Don d'Hadès": "Permet de voir et de communiquer avec les morts reçents",
  "Orientation": "Vous savez toujours vous reperer dans l'espace",
  "Porte bouclier": "Vous avez un avantage lorsque vous étes le bouclier d'un autre",
  "Chrono sens": "Vous savez toujours quand vous etes",
  "Don des langues": "Polyglotte",
  "Voix enchanteresse": "Auriez vous du sang de sirène, car votre voix est hypnotique (+2 certaines comp Char)",
  "Volonté de fer": "vous n'avez peur de rien et vous etes rarement prit au dépourvu",
  "Ami des animaux": "Vous avez grandis avec des animaux ce qui augmente leurs confiance en vous",
  "Maitre d'Arme": "Vous etes un maitre du maniement d'une arme +2 si vous l'utilisez",
  "Maitre des forges": "Votre talent en forgeronerie vous permet de construire ou reparer en toute circonstance",
  "Ambidextrie": "Vos deux mains sont majeure, vous n'avez pas de faiblesse ni d'un coté ni de l'autre",
  "Faveur +": "Un membre respecté vous dois une faveur (au choix)",
  "Etincelle de Zeus": "1/4 chance de Stun 1 tour avec une arme",
  "Vision d'Héra": "1 fois par jour: permet d'avoir des Info sur une personne connu",
  "Force de Poséidon": "Augmente la CA de +1 de l'équipe (+2 si proche de la mer)",
  "Voix d'Athéna": "Peut forcer quelqu'un a obeir a un ordre 1/j",
  "Corps d'Arès": "Renforce la CA de +2",
  "Moisson de Déméter": "Permet de trouver de la nourriture (végétaux)",
  "Visée d'Apollon": "Permet d'ajouter un bonus de 2 au arme a distance",
  "Mire d'Artèmis": "Dégats à distance +3",
  "Talent d'Héphaistos": "Augmente les dégats de corps a corps +3",
  "Charme d'Aphrodite": "Réduit le jet de touche de l'adversaire de 2",
  "Pieds d'Hermes": "Augmente la distance de marche de 4 cases",
  "Talent de Dionysos": "Resistance à la drogue et l'alcool",
  "Flamme d'Hestia": "Votre corps est plus chaud que la moyenne pas de pénalité froid/humide",
  "Lanterne d'Hécate": "Permet de voir dans le noir",
  "Casque d'Hadès": "Permet de disparaitre dans les ombres 2/J",
  "Taille imposante": "Mesure dans les 2M, point de vie augmenter de 10",
  "Dieu de l'esquive": "L'esquive est un art que vous maitrisez, vous n'etes pas limité dans votre nombre d'esquive",
  "Dieu du stade": "Vos capacités athétiques sont un atout majeur, vous ne fatiguez pas si facilement",
  "Dieu de la guerre": "Si vous choisissez d'attaquer une seconde fois, aucun malus ne vous sera ajouter",
  "Rageux": "Sous l'effet de la rage, vos coups font plus mal mais vous avez tendance a voir rouge",
  "Faveur ++": "Un haut membre vous dois une faveur (au choix)",
  "Aura de Zeus": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Héra": "Renforce les jets d'Astuce de l'équipe avec +2",
  "Aura de Poséidon": "Renforce les jets de Constitution de l'équipe avec +2",
  "Aura d'Athéna": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Arès": "Renforce les jets de Force de l'équipe avec +2",
  "Aura de Demeter": "Renforce les jets de Constitution de l'équipe avec +2",
  "Aura d'Apollon": "Renforce les jets de Astuce de l'équipe avec +2",
  "Aura d'Artèmis": "Renforce les jets de Dexterité de l'équipe avec +2",
  "Aura d'Héphaïstos": "Renforce les jets de Force de l'équipe avec +2",
  "Aura d'Aphrodite": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hermes": "Renforce les jets de Dextérité de l'équipe avec +2",
  "Aura de Dionysos": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hestia": "Renforce les jets de Charisme de l'équipe avec +2",
  "Aura d'Hécate": "Renforce les jets de Astuce de l'équipe avec +2",
  "Aura d'Hadès": "Renforce les jets de Constitution de l'équipe avec +2",
  "Sang de Zeus": "Extra Life",
  "Paume de Poséidon": "Offre un Bateau Magique",
  "Esprit d'Athéna": "Athéna elle même vous préviens lorsque vous faite le mauvais choix",
  "Armure d'Arès": "Frénesie apres deux kills qui double les PV temporaire",
  "Blé de Déméter": "Permet de régénerer 3 fois plus de Pv en mangeant.",
  "Oeil d'Apollon": "Oracle (vision dans le sommeil)",
  "Compagnon d'Artèmis": "Animal magique",
  "Yeux d'Héphaistos": "Permet de détécter la magie et les enchantements",
  "Murmure d'Aphrodite": "Permet d'Obtenir de sombre secrets sur une personne connus",
  "Message d'Hermes": "Permet de transmettre des messages court et simple à des alliés",
  "Amphore de Dionysos": "Permet de récuperer tout ces PV avec de l'alcool/ 1j",
  "Bucher d'Héstia": "Permet de creer un feu qui apporte protection et comfort",
  "Lune d'Hécate": "Permet un rituel par nuit",
  "Peau d'Hadès": "Multiplie les PV par deux"
};

const EFFECT_DESCRIPTIONS_DESAVANTAGES = {
  "Sens défaïllant": "Choisir un sens qui sera défaïllant (-2 bonus perception sens)",
  "Frêle": "Robustesse de base -1",
  "Distrait": "Vous avez un désavantage en vigilance -2",
  "Dépressif": "Volonté de base -1",
  "Maladroit": "Reflexe de base -1"
};

/**
 * Dédoublonne (garde le premier, supprime le reste) et reprend la description attendue
 * (EFFECT_DESCRIPTIONS_AVANTAGES/DESAVANTAGES ci-dessus) dans l'effet conservé, s'il n'en
 * a pas déjà une. N'ajoute jamais d'effet à un document qui n'en a aucun (Mule, Cuisine de
 * Déméter, Connaissance d'Héphaistos, la plupart des désavantages) — la tooltip retombe
 * sur la description complète dans ce cas (actor-sheet.mjs, _prepareTraitItems).
 */
async function cleanupEffectField(doc, descriptions) {
  if (doc.effects.size === 0) return false;

  let changed = false;

  if (doc.effects.size > 1) {
    const [, ...extraIds] = Array.from(doc.effects.keys());
    await doc.deleteEmbeddedDocuments("ActiveEffect", extraIds);
    changed = true;
  }

  const kept = doc.effects.contents[0];
  const expected = descriptions[cleanName(doc.name)];
  if (expected && kept.description !== expected) {
    await kept.update({ description: expected });
    changed = true;
  }

  return changed;
}

async function applyCleanupEffectFieldForPack(packName, itemType, descriptions) {
  let fixed = 0;

  const pack = game.packs.get(`antique.${packName}`);
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await cleanupEffectField(doc, descriptions)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== itemType) continue;
      if (await cleanupEffectField(item, descriptions)) fixed++;
    }
  }

  return fixed;
}

async function applyCleanupEffectFieldAvantages() {
  return applyCleanupEffectFieldForPack("avantages", "advantage", EFFECT_DESCRIPTIONS_AVANTAGES);
}

async function applyCleanupEffectFieldDesavantages() {
  return applyCleanupEffectFieldForPack("desavantages", "disadvantage", EFFECT_DESCRIPTIONS_DESAVANTAGES);
}

/** Voir packs/_build-effet-mule.js, dont ces données/fonctions reprennent la logique. */
const MULE_EFFET_ID = "eEft000000000079";
const MULE_CHANGES = [{ key: "system.capacitePort", type: "multiply", value: "2" }];
const MULE_EFFET_DESCRIPTION = "<p>Multiplie la capacité de port par deux, tant que cet effet est actif.</p>";

async function applyCreateEffetMule() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === MULE_EFFET_ID)) return 0;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: MULE_EFFET_ID,
    name: "Mule",
    img: "icons/svg/upgrade.svg",
    type: "base",
    system: { changes: MULE_CHANGES },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: MULE_EFFET_DESCRIPTION,
    transfer: true
  }], { pack: pack.collection, keepId: true });
  if (wasLocked) await pack.configure({ locked: true });
  return 1;
}

async function embedMuleEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${MULE_EFFET_ID}]{Mule}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Mule",
      img: doc.img,
      "system.changes": MULE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyEmbedEffetMule() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Mule") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedMuleEffect(doc)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Mule") continue;
      if (await embedMuleEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_add-item-weights.js, dont ces données/fonctions reprennent la logique. */
const WEAPON_WEIGHTS = {
  "Couteau": 0.3, "Dague": 0.5, "Glaive": 1.2, "Épée courte": 1.3, "Lance": 2.5,
  "Hache": 1.8, "Javeline": 1.0, "Hache de lancer": 0.9, "Bolas": 0.7,
  "Bouclier de lancer": 1.5, "Filet": 1.5, "Couteau de lancer": 0.3, "Chakram": 0.6,
  "Serpe": 1.0, "Bâton": 1.5, "Gourdin": 1.2, "Marteau": 2.0, "Trident": 2.5,
  "Cimeterre": 1.4, "Double hache": 3.0, "Marteau de guerre": 3.5, "Sarisse": 4.5,
  "Arc court": 1.0, "Arc long": 1.5, "Fronde": 0.2, "Fouet": 0.5
};

const ARMOR_WEIGHTS = {
  "Vêtement en Lin": 0.5, "Armure de cuir": 6, "Armure de cuir cloutée": 8,
  "Armure en peau": 5, "Armure de cuivre": 12, "Armure en plaque": 20, "Maille": 11,
  "Cuirasse": 9, "Bouclier de bois": 3, "Bouclier en cuir": 3.5, "Bouclier cuivre": 6,
  "Bouclier renforcé": 7
};

const EQUIPEMENT_WEIGHTS = {
  "Linothorax": 4, "Thorax de cuir": 6, "Cuirasse de bronze": 9,
  "Armure d'hoplite complète": 22, "Casque corinthien": 1.2, "Casque chalcidien": 1,
  "Cnémides de bronze": 1.5, "Aspis (bouclier rond)": 7, "Peltè (bouclier léger)": 3,
  "Potion de soin": 0.3, "Potion de soin majeure": 0.4, "Nectar des dieux": 0.3,
  "Ambroisie": 0.2, "Élixir de Force d'Héraclès": 0.3, "Huile de sagesse d'Athéna": 0.3,
  "Philtre d'amour d'Aphrodite": 0.2, "Vin de Dionysos": 1.0, "Onguent d'Asclépios": 0.2,
  "Eau du Styx": 0.3, "Larmes de Niobé": 0.1, "Sang de Méduse": 0.2,
  "Poudre de sommeil d'Hypnos": 0.1, "Antidote universel": 0.3,
  "Corde de chanvre (30m)": 3, "Torche": 0.5, "Rations de voyage": 1.0,
  "Sacoche de guérisseur": 2.0, "Outils d'artisan": 3.0, "Outre à eau (2L)": 2.0,
  "Tente de campagne": 8.0, "Breuvage du Colosse": 0.3, "Essence d'Acrobate": 0.2,
  "Philtre de l'Ours": 0.3, "Liqueur du Vent": 0.3, "Elixir de l'Orateur": 0.3,
  "Breuvage de l'Astre": 0.3, "Antidote Commun": 0.3, "Potion Simple": 0.3,
  "Onguent de cicatrisation": 0.2, "Antidouleur": 0.2, "Onguent anti infection": 0.2,
  "Tisane de langueur": 0.3, "Thé d'Asclépsios": 0.3, "Essence du Brisé": 0.2,
  "Elixir du Frêle": 0.2, "Breuvage de la Tortue": 0.3, "Sève du Boiteux": 0.2,
  "Sirop de Frêne": 0.2, "Morsure du Serpent": 0.2, "Plaie Ouverte": 0.2,
  "Rations régénératrices de Déméter": 0.5
};

function baseWeaponName(name) {
  const idx = name.indexOf(" (");
  return idx === -1 ? name : name.slice(0, idx);
}

async function setItemWeight(doc, weightTable, lookupKey) {
  const weight = weightTable[lookupKey];
  if (weight === undefined || doc.system.poids === weight) return false;
  await doc.update({ "system.poids": weight });
  return true;
}

async function applyItemWeightsArmes() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type === "Item") continue;
      const doc = await pack.getDocument(indexEntry._id);
      const table = doc.type === "weapon" ? WEAPON_WEIGHTS : ARMOR_WEIGHTS;
      const key = doc.type === "weapon" ? baseWeaponName(doc.name) : doc.name;
      if (await setItemWeight(doc, table, key)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "weapon" && item.type !== "equipment") continue;
      const table = item.type === "weapon" ? WEAPON_WEIGHTS : ARMOR_WEIGHTS;
      const key = item.type === "weapon" ? baseWeaponName(item.name) : item.name;
      if (key in table && (await setItemWeight(item, table, key))) fixed++;
    }
  }

  return fixed;
}

async function applyItemWeightsEquipement() {
  let fixed = 0;

  const pack = game.packs.get("antique.equipement");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await setItemWeight(doc, EQUIPEMENT_WEIGHTS, doc.name)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "equipment" || !(item.name in EQUIPEMENT_WEIGHTS)) continue;
      if (await setItemWeight(item, EQUIPEMENT_WEIGHTS, item.name)) fixed++;
    }
  }

  return fixed;
}

const SETTING_KEY = "appliedPackFixes";

/**
 * Réglage monde caché mémorisant les `id` de PACK_UPDATES déjà appliqués — un correctif
 * absent de cette liste reste "en attente" et sera reproposé à chaque login GM, même sans
 * changement de version (contrairement à checkSystemVersionUpdate()). Appeler depuis le
 * hook "init", à côté de registerVersionCheckSettings()/registerMigrationSettings().
 */
export function registerPackUpdateSettings() {
  game.settings.register("antique", SETTING_KEY, {
    name: "Correctifs de compendium déjà appliqués à ce monde",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
}

function getAppliedIds() {
  return game.settings.get("antique", SETTING_KEY) ?? [];
}

export async function markPackUpdatesApplied(ids) {
  if (!ids.length) return;
  const applied = new Set(getAppliedIds());
  for (const id of ids) applied.add(id);
  await game.settings.set("antique", SETTING_KEY, Array.from(applied));
}

export function getPendingPackUpdates() {
  const applied = new Set(getAppliedIds());
  return PACK_UPDATES.filter(update => !applied.has(update.id));
}

/**
 * GM-only. Ouvre l'écran de choix par compendium s'il reste des correctifs en attente —
 * aucun lien avec checkSystemVersionUpdate() : se redéclenche à chaque login GM tant que
 * des entrées de PACK_UPDATES n'ont pas été explicitement appliquées, changement de
 * version ou pas. Call from the "ready" hook, GM only.
 */
export async function checkPendingPackUpdates() {
  if (!game.user.isGM) return;

  const pending = getPendingPackUpdates();
  if (!pending.length) return;

  const { AntiquePackUpdatePicker } = await import("../apps/pack-update-picker.mjs");
  AntiquePackUpdatePicker.open();
}

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
  if (doc.effects.length) return false;

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

  if (!doc.effects.length) {
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

  if (entry.selfEmbed && !doc.effects.length) {
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
  if (doc.effects.length) return false;

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

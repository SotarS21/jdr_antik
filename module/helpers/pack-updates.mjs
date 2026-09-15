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
  },
  {
    id: "0.6.67-create-effets-desavantages",
    pack: "effets",
    version: "0.6.67",
    label: "90 nouveaux effets pour les désavantages",
    description:
      "Crée les 90 documents Effet manquants pour les désavantages (Phobie, les Dévotion, " +
      "etc.) — à appliquer avant ou avec le correctif \"Désavantages\" ci-dessous.",
    apply: applyCreateEffetsDesavantages
  },
  {
    id: "0.6.67-embed-effets-desavantages",
    pack: "desavantages",
    version: "0.6.67",
    label: "90 effets liés + embarqués sur les désavantages",
    description:
      "Ajoute le lien vers l'effet et l'effet embarqué (onglet \"Effets\") sur les 90 " +
      "désavantages qui n'en avaient pas encore. Narratif pour la plupart (la majorité " +
      "des désavantages décrivent une conséquence conditionnelle/de jeu de rôle, pas un " +
      "malus chiffré permanent) ; 3 cas ont un vrai malus de compétence (Petite nature, " +
      "Enfant, Introverti).",
    apply: applyEmbedEffetsDesavantages
  },
  {
    id: "0.6.70-backfill-ingredient-bag",
    pack: "acteurs",
    version: "0.6.70",
    label: "Sac à ingrédient — activation rétroactive",
    description:
      "Le nouvel onglet \"Ingrédients\" n'est plus visible que si la case \"Sac à ingrédient\" " +
      "(onglet Background) est cochée. Coche-la automatiquement sur tout personnage qui " +
      "possède déjà au moins un objet d'inventaire catégorisé apothicaire, pour ne pas lui " +
      "faire perdre l'accès à son propre inventaire.",
    apply: applyBackfillIngredientBag
  },
  {
    id: "0.6.72-create-effet-charge-furieuse",
    pack: "effets",
    version: "0.6.72",
    label: "Effet \"Charge furieuse\" (Capacités de combat)",
    description:
      "Crée le document Effet autonome \"Charge furieuse\" (+2 attaque, armes de corps à corps) " +
      "dans le compendium Effets — même patron que les avantages, à appliquer avant ou avec le " +
      "correctif ci-dessous.",
    apply: applyCreateEffetChargeFurieuse
  },
  {
    id: "0.6.72-link-effet-charge-furieuse",
    pack: "capacites-combat",
    version: "0.6.72",
    label: "Charge furieuse — lien vers l'effet + fiche corrigée",
    description:
      "Ajoute le lien vers l'effet dans la description de la capacité \"Charge furieuse\" " +
      "(compendium et copies déjà glissées sur un PNJ) — la première version n'avait ni le " +
      "lien, ni la bonne fiche d'objet (le type \"npcability\" n'était pas encore reconnu par " +
      "le système, corrigé dans ce même déploiement).",
    apply: applyLinkEffetChargeFurieuse
  },
  {
    id: "0.6.73-enable-effet-charge-furieuse",
    pack: "capacites-combat",
    version: "0.6.73",
    label: "Charge furieuse — bonus actif en permanence",
    description:
      "Retour utilisateur : le bonus d'attaque de \"Charge furieuse\" doit être actif en " +
      "permanence, pas désactivé par défaut. Active l'effet déjà présent (compendium et copies " +
      "déjà glissées sur un PNJ) et corrige le texte de la description en conséquence.",
    apply: applyEnableEffetChargeFurieuse
  },
  {
    id: "0.6.74-create-effet-petrifie",
    pack: "effets",
    version: "0.6.74",
    label: "Effet \"Pétrifié (Regard de Méduse)\" (Capacités de combat)",
    description:
      "Crée le document Effet autonome \"Pétrifié (Regard de Méduse)\" dans le compendium " +
      "Effets — marqueur narratif à glisser par le MJ sur la victime après un échec de jet de " +
      "sauvegarde (jamais embarqué sur la capacité elle-même). À appliquer avant ou avec le " +
      "correctif ci-dessous.",
    apply: applyCreateEffetPetrifie
  },
  {
    id: "0.6.74-link-effet-petrifie",
    pack: "capacites-combat",
    version: "0.6.74",
    label: "Regard pétrifiant — lien vers l'effet",
    description:
      "Ajoute le lien vers l'effet \"Pétrifié\" dans la description de la capacité \"Regard " +
      "pétrifiant\" (compendium et copies déjà glissées sur un PNJ).",
    apply: applyLinkEffetPetrifie
  },
  {
    id: "0.6.75-embed-effet-petrifie",
    pack: "capacites-combat",
    version: "0.6.75",
    label: "Regard pétrifiant — effet visible dans l'onglet Effets",
    description:
      "Retour utilisateur : l'onglet Effets de \"Regard pétrifiant\" restait vide (le lien " +
      "dans la description ne suffisait pas). Embarque maintenant aussi une copie de l'effet " +
      "\"Pétrifié\" directement sur la capacité, en `transfer:false` — visible dans l'onglet " +
      "Effets comme pour Charge furieuse, mais ne s'applique jamais à la créature qui possède " +
      "la capacité (compendium et copies déjà glissées sur un PNJ).",
    apply: applyLinkEffetPetrifie
  },
  {
    id: "0.6.76-add-save-to-petrifiant",
    pack: "capacites-combat",
    version: "0.6.76",
    label: "Regard pétrifiant — bouton de jet de sauvegarde",
    description:
      "Ajoute un bouton \"Jet de sauvegarde\" (Robustesse DC 18) sur la carte de chat de " +
      "\"Regard pétrifiant\" — la victime clique elle-même, sur son propre client, avec les " +
      "stats de son personnage assigné. Met aussi à jour le paragraphe de description qui " +
      "l'explique (compendium et copies déjà glissées sur un PNJ).",
    apply: applyAddSaveToPetrifiant
  },
  {
    id: "0.6.79-create-capacites-bestiaire",
    pack: "capacites-combat",
    version: "0.6.79",
    label: "51 nouvelles capacités de combat (bestiaire complet)",
    description:
      "Généralise Charge furieuse/Regard pétrifiant à tout le bestiaire : crée les 51 " +
      "documents manquants (une ou plusieurs capacités par créature de \"Créatures " +
      "Mythologiques\", sauf Pégase/Hippocampe/Cyclope qui n'ont rien à ajouter) — 6 " +
      "mécaniques (bonus d'attaque/CA embarqué), le reste narratif, comme pour les " +
      "désavantages. À appliquer avant ou avec le correctif ci-dessous.",
    apply: applyCreateCapacitesBestiaire
  },
  {
    id: "0.6.79-embed-capacites-bestiaire",
    pack: "creatures",
    version: "0.6.79",
    label: "Capacités embarquées sur chaque créature du bestiaire",
    description:
      "Embarque chaque nouvelle capacité directement sur la créature correspondante dans " +
      "\"Créatures Mythologiques\", et sur toute copie déjà glissée sur un PNJ du monde — " +
      "glisser une créature du compendium sur une scène l'amène déjà équipée. Retrofit " +
      "inclus : Minotaure/Méduse eux-mêmes n'avaient jamais reçu Charge furieuse/Regard " +
      "pétrifiant sur leur propre fiche (seulement glissés sur une copie PNJ de test).",
    apply: applyEmbedCapacitesBestiaire
  },
  {
    id: "0.6.91-fix-weapon-categories",
    pack: "armes",
    version: "0.6.91",
    label: "Catégorie d'attaque des armes corrigée",
    description:
      "Aucune arme n'a jamais eu system.category/categoryDistance explicitement défini — " +
      "toutes retombaient donc sur la valeur par défaut du schéma (\"Arme blanche\" en " +
      "mêlée, \"Arme à distance\" à distance), correcte par coïncidence seulement pour les " +
      "armes réellement \"Arme blanche\". Corrige les 100 armes du compendium et toute " +
      "copie déjà possédée par un acteur pour qu'elles pointent vers leur vraie catégorie " +
      "(Arme de jet/Arme exotique/Arme à deux mains/Arme à distance).",
    apply: applyFixWeaponCategories
  },
  {
    id: "0.6.91-create-arbalete-munitions",
    pack: "armes",
    version: "0.6.91",
    label: "Arbalète + munitions (Flèches, Carreaux, Pierres de fronde)",
    description:
      "Crée la nouvelle Arbalète (3 paliers de qualité) et un nouveau dossier \"Munition\" " +
      "avec 3 objets (Flèches, Carreaux d'arbalète, Pierres de fronde) — à lier depuis la " +
      "fiche d'une arme à distance consommable (menu \"Munition liée\") pour un vrai suivi " +
      "de stock, même mécanisme que les ingrédients d'alchimie.",
    apply: applyCreateArbaleteMunitions
  },
  {
    id: "0.6.95-fix-munition-consumable",
    pack: "armes",
    version: "0.6.95",
    label: "Munitions liables aux armes à distance",
    description:
      "Les 3 munitions (Flèches, Carreaux d'arbalète, Pierres de fronde) avaient " +
      "system.consumable à false — invisibles dans le menu \"Munition liée\" d'une arme " +
      "(qui ne liste que les objets marqués consommables). Corrigé sur le compendium et " +
      "toute copie déjà possédée par un acteur.",
    apply: applyFixMunitionConsumable
  },
  {
    id: "0.6.96-create-fleche-empoisonnee",
    pack: "armes",
    version: "0.6.96",
    label: "Flèches empoisonnées",
    description:
      "Ajoute une 4e munition dans le dossier \"Munition\" — pas d'effet de poison " +
      "automatisé (aucune arme de ce système ne déclenche de jet de sauvegarde ou de " +
      "dégâts additionnels au toucher), à résoudre manuellement par le MJ (voir sa note " +
      "MJ dédiée sur l'objet).",
    apply: applyCreateFlecheEmpoisonnee
  },
  {
    id: "0.6.93-create-tresors",
    pack: "tresors",
    version: "0.6.93",
    label: "7 premiers objets de trésor",
    description:
      "Peuple le nouveau compendium \"Trésors\" (nouveau type d'objet dédié) avec un premier " +
      "lot : Bijou orné, Parchemin scellé, Lettre cachetée, Statuette à l'effigie d'un dieu, " +
      "Flacon de parfum, Pierre précieuse, Caillou.",
    apply: applyCreateTresors
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const entry of index) {
      if (entry.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(entry.name))) continue;
      const doc = await pack.getDocument(entry._id);
      if (await embedMissingEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
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

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndEmbedBatch2(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
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

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndMaybeEmbedBatch3(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedAuraEffect(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Faveur de la Dame") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setFaveurDeLaDameLimitation(doc)) fixed++;
    }
    await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Athléte") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await fixAthleteEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || cleanName(item.name) !== "Athléte") continue;
      if (await fixAthleteEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Backfills system.hasIngredientBag on any character who already has at least one
 *  apothCategory item, so the new tab-visibility toggle doesn't hide an inventory
 *  the player already built (see character-sheet.hbs's nav guard on this field). */
async function applyBackfillIngredientBag() {
  let fixed = 0;

  for (const actor of game.actors ?? []) {
    if (actor.type !== "character" || actor.system.hasIngredientBag) continue;
    const hasIngredients = actor.items.some(i => i.type === "equipment" && i.system.apothCategory);
    if (!hasIngredients) continue;
    await actor.update({ "system.hasIngredientBag": true });
    fixed++;
  }

  return fixed;
}

/** Voir packs/_build-capacites-combat.js, dont ces données/fonctions reprennent la logique.
 *  Même patron que Mule (MULE_EFFET_ID et consorts, plus haut) : un document Effet
 *  autonome dans le compendium "effets" (bibliothèque générale, réutilisable/glissable
 *  sur n'importe quel token) + un lien vers ce document dans la description de la
 *  capacité, en plus de la copie déjà embarquée sur l'objet lui-même. */
const CHARGE_FURIEUSE_EFFET_ID = "eEft000000000170";
const CHARGE_FURIEUSE_CHANGES = [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }];
const CHARGE_FURIEUSE_EFFET_DESCRIPTION = "<p>+2 à l'attaque (armes de corps à corps), tant que cet effet est actif.</p>";

async function applyCreateEffetChargeFurieuse() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === CHARGE_FURIEUSE_EFFET_ID)) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: CHARGE_FURIEUSE_EFFET_ID,
    name: "Charge furieuse",
    img: "icons/svg/sword.svg",
    type: "base",
    system: { changes: CHARGE_FURIEUSE_CHANGES },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: CHARGE_FURIEUSE_EFFET_DESCRIPTION,
    transfer: true
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

async function linkChargeFurieuseEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${CHARGE_FURIEUSE_EFFET_ID}]{Charge furieuse}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
  }

  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Charge furieuse",
      img: doc.img,
      "system.changes": CHARGE_FURIEUSE_CHANGES,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEffetChargeFurieuse() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Charge furieuse") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkChargeFurieuseEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Charge furieuse") continue;
      if (await linkChargeFurieuseEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Retour utilisateur après test de la 0.6.72 : le bonus doit être actif en permanence, pas
 *  désactivé par défaut (revirement par rapport au choix initial de "conditionnel, à activer
 *  pendant la charge") — corrige l'effet embarqué déjà créé désactivé par le correctif
 *  ci-dessus, sur le compendium et toute copie déjà glissée sur un PNJ. */
async function enableChargeFurieuseEffect(doc) {
  let changed = false;

  const effect = doc.effects.find(e => e.name === "Charge furieuse");
  if (effect?.disabled) {
    await effect.update({ disabled: false });
    changed = true;
  }

  const oldText = "(effet ci-dessous, désactivé par défaut — à activer pendant la charge, désactiver ensuite)";
  if (doc.system.description?.includes(oldText)) {
    await doc.update({
      "system.description": doc.system.description.replace(oldText, "(effet ci-dessous, actif en permanence)")
    });
    changed = true;
  }

  return changed;
}

async function applyEnableEffetChargeFurieuse() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Charge furieuse") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await enableChargeFurieuseEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Charge furieuse") continue;
      if (await enableChargeFurieuseEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Voir packs/_build-capacites-combat.js. Contrairement à Charge furieuse, cet effet n'est
 *  JAMAIS embarqué sur la capacité "Regard pétrifiant" elle-même (transfer:true
 *  l'appliquerait à la créature qui possède la capacité, pas à sa victime) — juste un lien
 *  dans la description, à glisser manuellement par le MJ sur le token de la victime après un
 *  échec de jet de sauvegarde. Marqueur narratif (aucun `changes`), même principe que la
 *  majorité des effets de désavantages. */
const PETRIFIE_EFFET_ID = "eEft000000000171";
const PETRIFIE_EFFET_DESCRIPTION =
  "<p>Changée en statue de pierre : immobilisée, incapable d'agir. Marqueur narratif — à " +
  "retirer manuellement par le MJ quand la situation le justifie.</p>";

async function applyCreateEffetPetrifie() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  if (index.some(e => e._id === PETRIFIE_EFFET_ID)) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: PETRIFIE_EFFET_ID,
    name: "Pétrifié (Regard de Méduse)",
    img: "icons/svg/downgrade.svg",
    type: "base",
    system: { changes: [] },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: PETRIFIE_EFFET_DESCRIPTION,
    transfer: false
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

async function linkPetrifieEffect(doc) {
  let changed = false;

  const uuidLink = `@UUID[Compendium.antique.effets.${PETRIFIE_EFFET_ID}]{Pétrifié (Regard de Méduse)}`;
  if (!doc.system.description?.includes(uuidLink)) {
    await doc.update({
      "system.description": doc.system.description +
        "<p><em>Le jet de sauvegarde reste géré manuellement par le MJ. En cas d'échec, glisser " +
        "l'effet ci-dessous directement sur le token de la victime :</em></p>" +
        `<p>${uuidLink}</p>`
    });
    changed = true;
  }

  // transfer:false : reste visible dans l'onglet Effets de la capacité (même patron visuel
  // que Charge furieuse), retour utilisateur du 10 septembre 2026 — mais ne s'applique
  // jamais à la créature qui possède la capacité (contrairement à un effet transfer:true).
  if (!doc.effects.size) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Pétrifié (Regard de Méduse)",
      img: "icons/svg/downgrade.svg",
      "system.changes": [],
      disabled: false,
      transfer: false,
      description: "Changée en statue de pierre : immobilisée, incapable d'agir."
    }]);
    changed = true;
  }

  return changed;
}

async function applyLinkEffetPetrifie() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Regard pétrifiant") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkPetrifieEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Regard pétrifiant") continue;
      if (await linkPetrifieEffect(item)) fixed++;
    }
  }

  return fixed;
}

/** Retour utilisateur : bouton "Jet de sauvegarde" (Robustesse DC 18) sur la carte de chat
 *  de "Regard pétrifiant", pour que la victime lance elle-même son jet — voir
 *  packs/_build-capacites-combat.js et AntiqueItem#postToChat. Backfill des champs
 *  saveAbility/saveDC (absents des versions précédentes) + remplacement du paragraphe
 *  de description devenu obsolète ("le jet de sauvegarde reste géré manuellement par le
 *  MJ", qui ne mentionnait pas encore le bouton). */
async function addSaveToPetrifiant(doc) {
  let changed = false;

  if (!doc.system.saveAbility || !doc.system.saveDC) {
    await doc.update({ "system.saveAbility": "robustesse", "system.saveDC": 18 });
    changed = true;
  }

  const oldText =
    "<p><em>Le jet de sauvegarde reste géré manuellement par le MJ. En cas d'échec, glisser " +
    "l'effet ci-dessous directement sur le token de la victime :</em></p>";
  const newText =
    "<p><em>Poster cette capacité dans le chat (clic sur son nom ou son icône) fait " +
    "apparaître un bouton pour que la victime lance elle-même son jet de sauvegarde. En cas " +
    "d'échec, glisser l'effet ci-dessous directement sur le token de la victime :</em></p>";
  if (doc.system.description?.includes(oldText)) {
    await doc.update({ "system.description": doc.system.description.replace(oldText, newText) });
    changed = true;
  }

  return changed;
}

async function applyAddSaveToPetrifiant() {
  let fixed = 0;

  const pack = game.packs.get("antique.capacites-combat");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Regard pétrifiant") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await addSaveToPetrifiant(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "npcability" || cleanName(item.name) !== "Regard pétrifiant") continue;
      if (await addSaveToPetrifiant(item)) fixed++;
    }
  }

  return fixed;
}

/**
 * Voir packs/_build-capacites-bestiaire.js, dont ces données reprennent la sortie
 * exacte — généralisation du point 20 de TODO_BUG_ANTIQUE.md à tout le bestiaire
 * (26 créatures en plus de Minotaure/Méduse, déjà propagées via les correctifs
 * 0.6.72-0.6.76 ci-dessus). `changes`/`transfer` présents = capacité mécanique
 * (ActiveEffect embarqué, transfer:true, actif en permanence) ; sinon narrative
 * (saveAbility/saveDC quand le texte d'origine précise un jet de sauvegarde).
 */
const CAPACITES_BESTIAIRE = [
  { id: "aNca000000000003", creature: "Hydre de Lerne", name: "Régénération", img: "icons/svg/regen.svg", description: "<p>Récupère <strong>5 PV par tour</strong>. Si une tête est tranchée, deux repoussent au tour suivant (+2 à l'attaque tant qu'elles ne sont pas retranchées). Le feu empêche la régénération.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000004", creature: "Hydre de Lerne", name: "Souffle venimeux", img: "icons/svg/poison.svg", description: "<p>Son haleine est mortelle dans un rayon de 3m (1d8 poison).</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000005", creature: "Cerbère", name: "Trois têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer trois cibles différentes par tour. Avantage aux jets de perception (ne peut être surpris).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000006", creature: "Cerbère", name: "Queue serpent", img: "icons/svg/poison.svg", description: "<p>Attaque supplémentaire de queue, indépendante des trois têtes (1d6+2 poison).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000007", creature: "Chimère", name: "Souffle de feu (jet de sauvegarde)", img: "icons/svg/fire.svg", description: "<p>Cône de 5m, 3d6 dégâts de feu (moitié en cas de réussite). Utilisable tous les 2 tours. Complète l'attaque déjà représentée par l'arme \"Souffle de feu\" — donne le bouton de jet de sauvegarde.</p>", saveAbility: "reflexes", saveDC: 15, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000008", creature: "Chimère", name: "Triple menace", img: "icons/svg/combat.svg", description: "<p>Tête de lion (morsure), corps de chèvre (charge), queue serpent (poison) : trois modes d'attaque distincts au choix du MJ.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000009", creature: "Sphinx", name: "Énigme mortelle", img: "icons/svg/daze.svg", description: "<p>Pose une énigme (Intelligence diff 20 ou Astuce diff 18). Échec = la proie se fige de terreur (paralysée 1 tour) puis est dévorée.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000010", creature: "Sphinx", name: "Attaque en piqué", img: "icons/svg/wing.svg", description: "<p><strong>+2 à l'attaque</strong> (effet ci-dessous, actif en permanence) lors d'une attaque menée depuis les airs.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }], transfer: true, effectDesc: "+2 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000011", creature: "Griffon", name: "Attaque en piqué (Griffon)", img: "icons/svg/wing.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +2 aux dégâts (à ajouter manuellement, aucun champ de bonus de dégâts séparé n'existe pour les armes de PNJ) lors d'une attaque en piqué.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000012", creature: "Scylla", name: "Six têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer jusqu'à 6 cibles différentes par tour.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000013", creature: "Scylla", name: "Attaque éclair", img: "icons/svg/lightning.svg", description: "<p>Ses cous s'allongent à une vitesse fulgurante — la victime n'a droit qu'à un jet de Réflexes pour esquiver.</p>", saveAbility: "reflexes", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000014", creature: "Charybde", name: "Maelström", img: "icons/svg/hazard.svg", description: "<p>Trois fois par jour, aspire tout dans un rayon de 30m (Navigation diff 22 pour y échapper). Un navire pris dans le tourbillon est détruit en 3 tours.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000015", creature: "Sirène", name: "Chant envoûtant", img: "icons/svg/sound.svg", description: "<p>Échec = la victime est charmée et se dirige vers la Sirène. Portée 200m. Se boucher les oreilles avec de la cire annule l'effet.</p>", saveAbility: "volonte", saveDC: 20, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000016", creature: "Triton", name: "Combattant aquatique", img: "icons/svg/water.svg", description: "<p><strong>+3 à l'attaque et +2 à la CA</strong> (effet ci-dessous, actif en permanence) quand il combat dans l'eau.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }, { key: "system.ca.value", type: "add", value: "2" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps) et +2 à la CA, tant que cet effet est actif." },
  { id: "aNca000000000017", creature: "Centaure guerrier", name: "Charge de cavalerie", img: "icons/svg/sword.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +4 aux dégâts (à ajouter manuellement) en charge directe (5m minimum en ligne droite).</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000018", creature: "Centaure guerrier", name: "Piétinement", img: "icons/svg/combat.svg", description: "<p>Peut piétiner un adversaire au sol (1d8+4 contondant).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000019", creature: "Satyre", name: "Musique de Pan", img: "icons/svg/sound.svg", description: "<p>Joue de la flûte (syrinx) : peut charmer, effrayer ou endormir, au choix du MJ.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000020", creature: "Satyre", name: "Agilité forestière", img: "icons/svg/wing.svg", description: "<p>Se déplace sans bruit en forêt. Avantage en discrétion en milieu naturel.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000021", creature: "Harpie", name: "Vol rapide", img: "icons/svg/wing.svg", description: "<p>Extrêmement rapide en vol, très difficile à attraper.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000022", creature: "Harpie", name: "Puanteur", img: "icons/svg/poison.svg", description: "<p>Aura nauséabonde dans un rayon de 3m. Échec = -2 à toutes les actions tant que la cible reste dans le rayon.</p>", saveAbility: "robustesse", saveDC: 12, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000023", creature: "Harpie", name: "Larcin aérien", img: "icons/svg/hazard.svg", description: "<p>Peut voler un objet en vol — la victime peut tenter d'en empêcher le vol.</p>", saveAbility: "reflexes", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000024", creature: "Empusa", name: "Métamorphose (Empusa)", img: "icons/svg/mystery-man.svg", description: "<p>Prend l'apparence d'une belle femme (Perception diff 18 pour voir à travers l'illusion).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000025", creature: "Empusa", name: "Drain vital", img: "icons/svg/blood.svg", description: "<p>Sa morsure draine 1d6 PV supplémentaires qu'elle absorbe.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000026", creature: "Lamie", name: "Métamorphose (Lamie)", img: "icons/svg/mystery-man.svg", description: "<p>Peut prendre forme humaine (Perception diff 16 pour la détecter).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000027", creature: "Lamie", name: "Constriction (Lamie)", img: "icons/svg/net.svg", description: "<p>En forme serpentine, peut enserrer une cible (1d6+2 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000028", creature: "Lamie", name: "Yeux amovibles", img: "icons/svg/eye.svg", description: "<p>Peut retirer ses yeux pour les cacher. Sans yeux : immunisée aux effets visuels mais aveugle.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000029", creature: "Python", name: "Constriction (Python)", img: "icons/svg/net.svg", description: "<p>Enserre sa proie (2d6+5 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 20, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000030", creature: "Python", name: "Venin (Python)", img: "icons/svg/poison.svg", description: "<p>Morsure empoisonnée (2d6 poison et affaibli en cas d'échec).</p>", saveAbility: "robustesse", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000031", creature: "Python", name: "Gardien de l'Oracle", img: "icons/svg/mage-shield.svg", description: "<p>Résistance à la magie (avantage aux jets contre les sorts).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000032", creature: "Spectre du Styx", name: "Incorporel", img: "icons/svg/frozen.svg", description: "<p>Les armes normales passent à travers (demi-dégâts). Les armes de bronze béni ou divines infligent des dégâts pleins.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000033", creature: "Spectre du Styx", name: "Gémissement", img: "icons/svg/terror.svg", description: "<p>Pousse un cri terrifiant. Échec = effrayé pendant 1d4 tours.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000034", creature: "Érinye (Furie)", name: "Traque implacable", img: "icons/svg/eye.svg", description: "<p>Détecte automatiquement la culpabilité. Ne peut être semée ni trompée par un coupable.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000035", creature: "Érinye (Furie)", name: "Fouet enflammé (jet de sauvegarde)", img: "icons/svg/fire.svg", description: "<p>Inflige douleur et folie. Échec = la victime est prise de terreur et de remords paralysants. Complète l'attaque déjà représentée par l'arme \"Fouet enflammé\" — donne le bouton de jet de sauvegarde.</p>", saveAbility: "volonte", saveDC: 16, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000036", creature: "Érinye (Furie)", name: "Vol (Érinye)", img: "icons/svg/wing.svg", description: "<p>Ailes de chauve-souris, vol rapide.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000037", creature: "Carcinos", name: "Prise broyeuse (immobilisation)", img: "icons/svg/net.svg", description: "<p>Agrippe et broie (1d8+4 par tour). La victime peut tenter de se libérer.</p>", saveAbility: "robustesse", saveDC: 18, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000038", creature: "Géant (Gigante)", name: "Fils de Gaïa", img: "icons/svg/regen.svg", description: "<p>Régénère 5 PV par tour tant qu'il touche le sol. Perdre le contact avec la terre annule la régénération.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000039", creature: "Géant (Gigante)", name: "Lancer de rocher (Géant)", img: "icons/svg/hazard.svg", description: "<p>Peut lancer d'énormes rochers ou des arbres.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000040", creature: "Géant (Gigante)", name: "Jambes serpentines", img: "icons/svg/poison.svg", description: "<p>Ses jambes-serpents peuvent mordre les ennemis proches, en plus de son attaque principale.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000041", creature: "Typhon", name: "Cent têtes", img: "icons/svg/combat.svg", description: "<p>Peut attaquer tous les ennemis dans un rayon de 10m simultanément.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000042", creature: "Typhon", name: "Tempête", img: "icons/svg/hazard.svg", description: "<p>Génère des ouragans et des tremblements de terre autour de lui.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000043", creature: "Lion de Némée", name: "Peau impénétrable", img: "icons/svg/holy-shield.svg", description: "<p>Immunisé aux armes tranchantes et perforantes. Seuls les dégâts contondants ou l'étranglement fonctionnent.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000044", creature: "Lion de Némée", name: "Rugissement", img: "icons/svg/terror.svg", description: "<p>Échec = effrayé pendant 1d4 tours.</p>", saveAbility: "volonte", saveDC: 14, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000045", creature: "Lion de Némée", name: "Prédateur suprême", img: "icons/svg/eye.svg", description: "<p>Avantage aux jets de traque et de discrétion en terrain naturel.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000046", creature: "Aigle du Caucase", name: "Déchiquetage", img: "icons/svg/blood.svg", description: "<p>En combat prolongé, peut arracher des morceaux de chair (dégâts continus 1d4 par tour si la morsure initiale a touché).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000047", creature: "Aigle du Caucase", name: "Vol supérieur", img: "icons/svg/wing.svg", description: "<p>Vitesse et manœuvrabilité exceptionnelles en vol.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000048", creature: "Sanglier d'Érymanthe", name: "Charge dévastatrice", img: "icons/svg/sword.svg", description: "<p><strong>+4 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge (5m minimum). Renverse les cibles de taille humaine.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "4" }], transfer: true, effectDesc: "+4 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000049", creature: "Sanglier d'Érymanthe", name: "Défenses acérées", img: "icons/svg/sword.svg", description: "<p>Ses défenses sont capables de transpercer le bronze.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000050", creature: "Taureau de Crète", name: "Souffle de feu (Taureau)", img: "icons/svg/fire.svg", description: "<p>Peut cracher des flammes (2d6 feu, cône de 3m). Don de Poséidon.</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000051", creature: "Taureau de Crète", name: "Charge du Taureau", img: "icons/svg/sword.svg", description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge directe.</p>", saveAbility: "", saveDC: 0, changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }], transfer: true, effectDesc: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." },
  { id: "aNca000000000052", creature: "Stymphale", name: "Nuée", img: "icons/svg/combat.svg", description: "<p>En groupe de 5 individus ou plus, forment une nuée qui obscurcit le ciel (-2 en perception visuelle pour les ennemis).</p>", saveAbility: "", saveDC: 0, changes: null, transfer: null, effectDesc: null },
  { id: "aNca000000000053", creature: "Stymphale", name: "Fiente toxique", img: "icons/svg/poison.svg", description: "<p>Poison au contact. Échec = 1d4 dégâts de poison par tour.</p>", saveAbility: "robustesse", saveDC: 12, changes: null, transfer: null, effectDesc: null }
];

function capaciteBestiaireDocData(entry) {
  const doc = {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
    type: "npcability",
    system: {
      description: entry.description,
      gmNotes: "",
      saveAbility: entry.saveAbility,
      saveDC: entry.saveDC
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  };
  if (entry.changes) {
    // Nested inline here (raw creation data for the parent Item's own "effects" array,
    // same shape as packs/*.db), NOT the dotted "system.changes" key used elsewhere in
    // this file when calling createEmbeddedDocuments() as its own separate API call.
    doc.effects.push({
      name: entry.name,
      img: entry.img,
      type: "base",
      system: { changes: entry.changes },
      disabled: false,
      transfer: entry.transfer,
      description: entry.effectDesc
    });
  }
  return doc;
}

async function applyCreateCapacitesBestiaire() {
  const pack = game.packs.get("antique.capacites-combat");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = CAPACITES_BESTIAIRE.filter(e => !existingIds.has(e.id)).map(capaciteBestiaireDocData);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

/** Embarque, sur `creature` (un Actor — document du compendium "creatures" ou copie déjà
 *  glissée dans le monde), toute capacité de CAPACITES_BESTIAIRE qui lui appartient et n'y
 *  est pas déjà, plus le retrofit Charge furieuse/Regard pétrifiant sur Minotaure/Méduse
 *  (jamais embarquées sur elles-mêmes jusqu'ici — seulement glissées sur une copie PNJ de
 *  test). Idempotent : ne recrée jamais un item déjà présent (comparaison par _id).
 */
async function embedCapacitesOnCreature(creature) {
  const existingIds = new Set(creature.items.map(i => i._id));
  const toCreate = [];

  for (const entry of CAPACITES_BESTIAIRE) {
    if (entry.creature !== creature.name || existingIds.has(entry.id)) continue;
    toCreate.push(capaciteBestiaireDocData(entry));
  }

  if (creature.name === "Minotaure" && !existingIds.has("aNca000000000001")) {
    const chargeFurieuse = await game.packs.get("antique.capacites-combat")?.getDocument("aNca000000000001");
    if (chargeFurieuse) toCreate.push(chargeFurieuse.toObject());
  }
  if (creature.name === "Méduse" && !existingIds.has("aNca000000000002")) {
    const regardPetrifiant = await game.packs.get("antique.capacites-combat")?.getDocument("aNca000000000002");
    if (regardPetrifiant) toCreate.push(regardPetrifiant.toObject());
  }

  if (!toCreate.length) return false;
  await creature.createEmbeddedDocuments("Item", toCreate, { keepId: true });
  return true;
}

async function applyEmbedCapacitesBestiaire() {
  let fixed = 0;

  const pack = game.packs.get("antique.creatures");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedCapacitesOnCreature(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    if (actor.type !== "npc") continue;
    if (await embedCapacitesOnCreature(actor)) fixed++;
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await cleanupEffectField(doc, descriptions)) fixed++;
    }
    await pack.configure({ locked: true });
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

  await pack.configure({ locked: false });
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
  await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (cleanName(indexEntry.name) !== "Mule") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await embedMuleEffect(doc)) fixed++;
    }
    await pack.configure({ locked: true });
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
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type === "Item") continue;
      const doc = await pack.getDocument(indexEntry._id);
      const table = doc.type === "weapon" ? WEAPON_WEIGHTS : ARMOR_WEIGHTS;
      const key = doc.type === "weapon" ? baseWeaponName(doc.name) : doc.name;
      if (await setItemWeight(doc, table, key)) fixed++;
    }
    await pack.configure({ locked: true });
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

/**
 * Real category key (module/helpers/config.mjs ANTIQUE.weaponCategories) for every
 * weapon base name — see the "0.6.91-fix-weapon-categories" PACK_UPDATES entry.
 * No weapon has ever had system.category/categoryDistance explicitly set (neither
 * packs/_build-armes.js nor packs/_add-arbalete-munitions.js sets them for the
 * pre-Arbalète weapons), so every single one has silently been relying on the
 * schema defaults ("armeBlanche" / "armeADistance") — right by coincidence only
 * for actual "Arme blanche" weapons. Both fields are set to the same key: this
 * system has no separate "melee fallback" skill for an inherently ranged/thrown
 * weapon, so the melee-mode category may as well match the distance-mode one.
 */
const WEAPON_CATEGORIES = {
  "Couteau": "armeBlanche", "Dague": "armeBlanche", "Glaive": "armeBlanche",
  "Épée courte": "armeBlanche", "Lance": "armeBlanche", "Hache": "armeBlanche",
  "Javeline": "armeDeJet", "Hache de lancer": "armeDeJet", "Bolas": "armeDeJet",
  "Bouclier de lancer": "armeDeJet", "Filet": "armeDeJet", "Couteau de lancer": "armeDeJet",
  "Chakram": "armeDeJet",
  "Serpe": "armeExotique", "Bâton": "armeExotique", "Gourdin": "armeExotique",
  "Marteau": "armeExotique", "Trident": "armeExotique", "Cimeterre": "armeExotique",
  "Double hache": "combatDeuxMains", "Marteau de guerre": "combatDeuxMains", "Sarisse": "combatDeuxMains",
  "Arc court": "armeADistance", "Arc long": "armeADistance", "Fronde": "armeADistance",
  "Fouet": "armeADistance", "Arbalète": "armeADistance"
};

async function setWeaponCategory(doc) {
  const key = WEAPON_CATEGORIES[baseWeaponName(doc.name)];
  if (!key || (doc.system.category === key && doc.system.categoryDistance === key)) return false;
  await doc.update({ "system.category": key, "system.categoryDistance": key });
  return true;
}

async function applyFixWeaponCategories() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      if (indexEntry.type !== "weapon") continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await setWeaponCategory(doc)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "weapon") continue;
      if (await setWeaponCategory(item)) fixed++;
    }
  }

  return fixed;
}

/** Same 3 Arbalète tiers + Munition folder + 3 munition items as
 *  packs/_add-arbalete-munitions.js, same ids (keepId) — kept in sync by hand,
 *  see that script's header comment for why this isn't generated from shared data. */
const ARME_A_DISTANCE_FOLDER_ID = "fArm000000000005";

function arbaleteDocData(id, name, damage, critical, price) {
  return {
    _id: id, name, type: "weapon", img: "icons/svg/target.svg",
    system: {
      attBonus: 0, attBonusDistance: 0, category: "armeADistance", categoryDistance: "armeADistance",
      damage, critical, typeDamage: "Perçant", portee: 24, hasPortee: true, consumable: true,
      linkedAmmoId: "", slot: "", equipped: false, price: `${price} po`, poids: 2,
      description: [
        "<p><strong>Catégorie :</strong> Arme à distance</p>",
        `<p><strong>Qualité :</strong> ${name.match(/\((.+)\)/)[1]}</p>`,
        `<p><strong>Prix :</strong> ${price} po</p>`
      ].join("\n"),
      gmNotes: ""
    },
    effects: [], folder: ARME_A_DISTANCE_FOLDER_ID, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

const MUNITION_FOLDER_ID = "fArm000000000120";
const MUNITION_ITEMS = [
  { id: "aEqp000000000121", name: "Flèches", price: 0.1, poids: 0.02, img: "icons/weapons/ammunition/arrows-fletching.webp" },
  { id: "aEqp000000000122", name: "Carreaux d'arbalète", price: 0.2, poids: 0.05, img: "icons/weapons/crossbows/crossbow-golden-bolt.webp" },
  { id: "aEqp000000000123", name: "Pierres de fronde", price: 0.02, poids: 0.05, img: "icons/commodities/stone/stone-chunk-grey-white.webp" }
];

function munitionDocData(entry) {
  return {
    _id: entry.id, name: entry.name, type: "equipment", img: entry.img,
    system: {
      // Must be true: this is what makes the item selectable as "linked ammo" on a
      // weapon's sheet (context.ammoOptions) and the Combat tab's quick-select
      // (context.ammoCandidates) — both filter on system.consumable.
      quantity: 1, consumable: true, caBonus: 0, healAmount: 0, linkedSkill: "", skillBonus: 0,
      slot: "", equipped: false, price: `${entry.price} po`, poids: entry.poids,
      apothCategory: "", apothType: "", isIngredientBag: false,
      description: `<p><strong>Prix :</strong> ${entry.price} po</p>`, gmNotes: ""
    },
    effects: [], folder: MUNITION_FOLDER_ID, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

async function applyCreateArbaleteMunitions() {
  const pack = game.packs.get("antique.armes");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  let created = 0;

  await pack.configure({ locked: false });

  const missingWeapons = [
    arbaleteDocData("aWpn000000000117", "Arbalète (Simple facture)", "1d8", "x2", 12),
    arbaleteDocData("aWpn000000000118", "Arbalète (Moyenne facture)", "1d8+2", "x2", 28),
    arbaleteDocData("aWpn000000000119", "Arbalète (Bonne facture)", "1d10+2", "19/x2", 40)
  ].filter(d => !existingIds.has(d._id));
  if (missingWeapons.length) {
    await pack.documentClass.createDocuments(missingWeapons, { pack: pack.collection, keepId: true });
    created += missingWeapons.length;
  }

  if (!existingIds.has(MUNITION_FOLDER_ID)) {
    await Folder.create({
      _id: MUNITION_FOLDER_ID, name: "Munition", type: "Item", sort: 700000, sorting: "a",
      color: "#8B0000", folder: null
    }, { pack: pack.collection, keepId: true });
    created++;
  }

  const missingMunitions = MUNITION_ITEMS.map(munitionDocData).filter(d => !existingIds.has(d._id));
  if (missingMunitions.length) {
    await pack.documentClass.createDocuments(missingMunitions, { pack: pack.collection, keepId: true });
    created += missingMunitions.length;
  }

  await pack.configure({ locked: true });
  return created;
}

const MUNITION_NAMES = new Set(MUNITION_ITEMS.map(m => m.name));

/** Fixes system.consumable, wrongly false when the munitions were first created (see
 *  "0.6.91-create-arbalete-munitions" above) — without it, a munition never appears in
 *  a weapon's "Munition liée" dropdown (context.ammoOptions/ammoCandidates both filter
 *  on this flag). Actor-owned copies are matched by name, not id: a compendium drop
 *  (browser-shared.mjs's grantItemToActor) creates the embedded copy with a fresh
 *  random id, not the compendium's own. */
async function applyFixMunitionConsumable() {
  let fixed = 0;

  const pack = game.packs.get("antique.armes");
  if (pack) {
    await pack.configure({ locked: false });
    for (const entry of MUNITION_ITEMS) {
      const doc = await pack.getDocument(entry.id);
      if (doc && !doc.system.consumable) {
        await doc.update({ "system.consumable": true });
        fixed++;
      }
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "equipment" || !MUNITION_NAMES.has(item.name) || item.system.consumable) continue;
      await item.update({ "system.consumable": true });
      fixed++;
    }
  }

  return fixed;
}

/** Same document as packs/_add-fleche-empoisonnee.js, same id (keepId). */
async function applyCreateFlecheEmpoisonnee() {
  const pack = game.packs.get("antique.armes");
  if (!pack) return 0;

  const id = "aEqp000000000124";
  const existing = await pack.getDocument(id);
  if (existing) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments([{
    _id: id, name: "Flèches empoisonnées", type: "equipment",
    img: "icons/weapons/ammunition/arrow-broadhead-green.webp",
    system: {
      quantity: 1, consumable: true, caBonus: 0, healAmount: 0, linkedSkill: "", skillBonus: 0,
      slot: "", equipped: false, price: "3 po", poids: 0.02,
      apothCategory: "", apothType: "", isIngredientBag: false,
      description: "<p>Une flèche dont la pointe a été trempée dans un poison de contact.</p>",
      gmNotes: "<p>Effet du poison à définir par le MJ (dégâts et/ou jet de sauvegarde " +
        "Robustesse) — non automatisé, à appliquer manuellement quand le tir touche.</p>"
    },
    effects: [], folder: "fArm000000000120", sort: 0, ownership: { default: 0 }, flags: {}
  }], { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return 1;
}

/** Same 7 documents as packs/_build-tresors.js, same ids (keepId). */
const TRESORS = [
  { id: "aTrs000000000001", name: "Bijou orné", img: "icons/commodities/treasure/brooch-jewel-gold-blue.webp",
    price: "25 po", poids: 0.1,
    description: "<p>Une broche en or sertie d'une pierre bleue, travail délicat digne d'un atelier de cité.</p>", gmNotes: "" },
  { id: "aTrs000000000002", name: "Parchemin scellé", img: "icons/sundries/scrolls/scroll-bound-brown-tan.webp",
    price: "5 po", poids: 0.1,
    description: "<p>Un rouleau de parchemin fermé par un cordon, son contenu inconnu tant qu'il n'est pas ouvert.</p>",
    gmNotes: "<p>À définir par le MJ selon l'intrigue : une carte, un contrat, une prophétie...</p>" },
  { id: "aTrs000000000003", name: "Lettre cachetée", img: "icons/sundries/documents/document-letter-tan.webp",
    price: "0 po", poids: 0.05,
    description: "<p>Une lettre pliée, cachetée à la cire d'un sceau qu'on ne reconnaît pas.</p>",
    gmNotes: "<p>Auteur et contenu à définir par le MJ — un indice, un message codé, une correspondance privée.</p>" },
  { id: "aTrs000000000004", name: "Statuette à l'effigie d'un dieu", img: "icons/commodities/treasure/figurine-idol.webp",
    price: "15 po", poids: 0.5,
    description: "<p>Une petite statuette de marbre représentant une divinité de l'Olympe, offrande votive ou objet de culte domestique.</p>", gmNotes: "" },
  { id: "aTrs000000000005", name: "Flacon de parfum", img: "icons/consumables/potions/potion-vial-corked-labeled-purple.webp",
    price: "8 po", poids: 0.1,
    description: "<p>Un petit flacon de verre soufflé contenant une essence parfumée, importée de loin.</p>", gmNotes: "" },
  { id: "aTrs000000000006", name: "Pierre précieuse", img: "icons/commodities/gems/gem-faceted-diamond-blue.webp",
    price: "50 po", poids: 0.05,
    description: "<p>Une gemme taillée, dont la valeur dépend de sa pureté et de sa couleur.</p>", gmNotes: "" },
  { id: "aTrs000000000007", name: "Caillou", img: "icons/commodities/stone/stone-chunk-brown.webp",
    price: "0 po", poids: 0.05,
    description: "<p>Un simple caillou. Sans valeur marchande, sauf circonstance particulière.</p>",
    gmNotes: "<p>Objet narratif par défaut : à réserver aux cas où un \"trésor\" n'en est pas vraiment un.</p>" }
];

function tresorDocData(entry) {
  return {
    _id: entry.id, name: entry.name, type: "treasure", img: entry.img,
    system: { quantity: 1, price: entry.price, poids: entry.poids, description: entry.description, gmNotes: entry.gmNotes },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}
  };
}

async function applyCreateTresors() {
  const pack = game.packs.get("antique.tresors");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = TRESORS.filter(e => !existingIds.has(e.id)).map(tresorDocData);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function applyItemWeightsEquipement() {
  let fixed = 0;

  const pack = game.packs.get("antique.equipement");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const doc = await pack.getDocument(indexEntry._id);
      if (await setItemWeight(doc, EQUIPEMENT_WEIGHTS, doc.name)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "equipment" || !(item.name in EQUIPEMENT_WEIGHTS)) continue;
      if (await setItemWeight(item, EQUIPEMENT_WEIGHTS, item.name)) fixed++;
    }
  }

  return fixed;
}

const EFFETS_DESAVANTAGES = [
  { id: "eEft000000000080", name: "Phobie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Petite peur qui offre un malus de -1 si echec de volonté</p>" },
  { id: "eEft000000000081", name: "Dépendance légal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dépendance, vous devez vous y adonnez 1/2j sinon malus de -1/j</p>" },
  { id: "eEft000000000082", name: "Marmotte", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez besoin de dormir plus que les autres, un sommeil court n'est qu'a moitie efficace</p>" },
  { id: "eEft000000000083", name: "Cauchemards", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous faites des cauchemards, dormir vous fait peur. 1/3 chance de mauvais repos</p>" },
  { id: "eEft000000000084", name: "Coeur sensible", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous ne pouvez laisser une personne plus faibre souffrir</p>" },
  { id: "eEft000000000085", name: "Sosie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Quelqu'un qui vous ressemblent à tendance à vous attiré des ennuis</p>" },
  { id: "eEft000000000086", name: "Dette", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un lambda (au choix)</p>" },
  { id: "eEft000000000087", name: "Petite nature", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.resistancePoisons.bonus","type":"add","value":"-2"}], description: "<p>Vous etes plus sensible que le commun des mortels au froid, poison</p>" },
  { id: "eEft000000000088", name: "Enfant", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.commandement.bonus","type":"add","value":"-2"}], description: "<p>On ne vous prend pas au sérieux au vue de votre jeune age -2 dans certaines comp de Char</p>" },
  { id: "eEft000000000089", name: "Superstitieux", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes supertsitieux, ne pas vous proteger vous donne un malus de -1</p>" },
  { id: "eEft000000000090", name: "Introverti", img: "icons/svg/downgrade.svg", changes: [{"key":"system.skills.baratin.bonus","type":"add","value":"-2"}], description: "<p>Lorsqu'il y a plus de 3 inconnus votre voix se perd -2 comp Char</p>" },
  { id: "eEft000000000091", name: "Sinistre", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous n'avez pas l'air net (Baptiste?), on vous fais plus difficilement confiance</p>" },
  { id: "eEft000000000092", name: "Moquerie de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Votre confiance en vous et votre sang froid sont mis à rudes épreuves lorsque l'on se moque de vous</p>" },
  { id: "eEft000000000093", name: "Paranoïa d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Vous ne supportez pas que l'on parle sur vous, dans votre dos, et pourtant ça arrive sans cesse</p>" },
  { id: "eEft000000000094", name: "Tempête de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Vous avez le mal de mer, ce qui est embettant pour un grec</p>" },
  { id: "eEft000000000095", name: "Chouette d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous etes obnubilé par une vision de chouette en or que vous auriez vu, et que vous voyez encor</p>" },
  { id: "eEft000000000096", name: "Poigne d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vos membres s'endoloris apres chaque actions, +1 diff pour deuxieme attaque</p>" },
  { id: "eEft000000000097", name: "Carence de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez plus faim que la moyenne, vous devez plus manger et boire</p>" },
  { id: "eEft000000000098", name: "Arc d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous semblez rendre les arcs inefficaces lorsque vous les touchés, les cordes laches, le bois craque</p>" },
  { id: "eEft000000000099", name: "Proie d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Les animaux sauvages ont une forte tendance à vous charger et/ ou à vous sentir de loin</p>" },
  { id: "eEft000000000100", name: "Confiance d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Les forgerons ne vous font pas confiance, les tarifs sont plus cher pour vous</p>" },
  { id: "eEft000000000101", name: "Outrage d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Votre physique derange, vous n'étes pas moches mais pas attirants</p>" },
  { id: "eEft000000000102", name: "Geste d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Votre bourse a tendance à perdre quelques pieces</p>" },
  { id: "eEft000000000103", name: "Coupe de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous ne supportez pas l'alcool, vous avez l'alcool mauvais ou triste ça dépend</p>" },
  { id: "eEft000000000104", name: "Destin d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>On vous prend difficilement au serieux, vous faites presque trop figuration.</p>" },
  { id: "eEft000000000105", name: "Perte d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Votre sens de l'orientation vous joue des tours</p>" },
  { id: "eEft000000000106", name: "Horde d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Les morts vous pourchassent et chuchotent en permanences</p>" },
  { id: "eEft000000000107", name: "Gravement malade", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une maladie chronique qui peux venir et partir</p>" },
  { id: "eEft000000000108", name: "Hostilité animal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Les animaux ne vous font pas confiance</p>" },
  { id: "eEft000000000109", name: "Phobie majeur", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une peur handicapante qui vous donne un malus de -2 si echec volonté</p>" },
  { id: "eEft000000000110", name: "Loi d'Atrée", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes contraint de suivre la Loi d'Atrée, sur les liens qui unissent les voyageurs</p>" },
  { id: "eEft000000000111", name: "Dette +", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un membre respecté (au choix)</p>" },
  { id: "eEft000000000112", name: "Hanté", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Quelques chose vous suit, un ancetre peut être, et à tendance à jouer avec vos nerfs</p>" },
  { id: "eEft000000000113", name: "Culpabilité écrasante", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous vous en voulez facilement et vous devez vous racheter (Obole...)</p>" },
  { id: "eEft000000000114", name: "Amnésie", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous ne vous souvenez pas qui vous êtes mais votre passé pourrais revenir d'une façon ou d'une autre</p>" },
  { id: "eEft000000000115", name: "Blessure permanente", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Un de vos membres vous fait mal au vu d'une ancienne blessure (Avant j'étais aventurier)</p>" },
  { id: "eEft000000000116", name: "Impétueux", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez un caractere violent et impulsif</p>" },
  { id: "eEft000000000117", name: "Amoureux transit", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Votre moitié vous manque, vous n'avez d'yeux que pour elle.</p>" },
  { id: "eEft000000000118", name: "Présence de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Vous avez une peur phobique de l'orage -Kéraunophobie-</p>" },
  { id: "eEft000000000119", name: "Présence d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Vous avez une peur phobique des oiseaux -Ornitophobie-</p>" },
  { id: "eEft000000000120", name: "Présence de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Vous avez une peur phobique de l'eau -Aquaphobie-</p>" },
  { id: "eEft000000000121", name: "Présence d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous avez une peur phobique de l'échec -atichiphobie-</p>" },
  { id: "eEft000000000122", name: "Présence d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vous avez une peur phobique du sang -Hématophobie-</p>" },
  { id: "eEft000000000123", name: "Présence de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez une peur phobique des fruits -Carpophobie-</p>" },
  { id: "eEft000000000124", name: "Présence d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous avez une peur de prendre la parole en public -Glossophobie-</p>" },
  { id: "eEft000000000125", name: "Présence d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Vous avez une peur phobique des forets -Hylophobie-</p>" },
  { id: "eEft000000000126", name: "Présence d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Vous avez une peur phobique de la foule -Agoraphobie-</p>" },
  { id: "eEft000000000127", name: "Présence d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Vous avez une peur phobique de la solitude -Autophobie-</p>" },
  { id: "eEft000000000128", name: "Présence d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Vous avez une peur phobique des espaces confinés -Claustrophobie-</p>" },
  { id: "eEft000000000129", name: "Présence de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous avez une peur phobique des enfants -Pédophobie-</p>" },
  { id: "eEft000000000130", name: "Présence d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>Vous avez une peur phobique du feu -Pyrophobie-</p>" },
  { id: "eEft000000000131", name: "Présence d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous avez une peur phobique de l'obscurité -Kénophobie-</p>" },
  { id: "eEft000000000132", name: "Présence d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Vous avez une peur de la mort -Thanatophobie-</p>" },
  { id: "eEft000000000133", name: "Dépendance illégal", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dépendance illégale, vous devez vous y adonnez 1/2j sinon malus de -1/j</p>" },
  { id: "eEft000000000134", name: "Tache de naissance", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Une marque sur votre corps relativement visible qui vous rend sujet a des critiques, des messes basses</p>" },
  { id: "eEft000000000135", name: "Némésis", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous vous étes fait un énemi d'une personne qui vous est supérieur</p>" },
  { id: "eEft000000000136", name: "Recherché", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Votre tête est mise à prix dans diverses cités de la Gréces</p>" },
  { id: "eEft000000000137", name: "Chat Noir", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous jouer de malchance, si un événement facheux se produit, il y a fort à parier que ce soit pour vous</p>" },
  { id: "eEft000000000138", name: "Zélé", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous etes un croyant fanatique, seule la voix de votre dieu compte, les autres ne sont rien</p>" },
  { id: "eEft000000000139", name: "Dette ++", img: "icons/svg/downgrade.svg", changes: [], description: "<p>Vous avez une dette envers un haut membre (au choix)</p>" },
  { id: "eEft000000000140", name: "Syndrome de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Vous avez une forte tendance à vouloir tout contrôler, à prendre le leadership</p>" },
  { id: "eEft000000000141", name: "Jugement d'Héra", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>La malchance vous poursuit, parfois vous devrez retenter vos jets</p>" },
  { id: "eEft000000000142", name: "Maladie de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Les chevaux n'ont pas confiance en vous, ils sont tendus en votre presence</p>" },
  { id: "eEft000000000143", name: "Sens d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Vous avez tendance a ne pas faire le bon choix. Vous reflechissez longtemps aux choix</p>" },
  { id: "eEft000000000144", name: "Serment d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vos serments vous lie, Arès y veille</p>" },
  { id: "eEft000000000145", name: "Pollen de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous avez des allergies à plusieurs plantes.</p>" },
  { id: "eEft000000000146", name: "Diagnostique d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Les soins sont parfois moins efficaces sur vous.</p>" },
  { id: "eEft000000000147", name: "Marche d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Vous vous deplacer comme un boeuf, il vous faut beaucoup d'adresse pour ne pas faire de bruit</p>" },
  { id: "eEft000000000148", name: "Defaut d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Vous armes s'émoussent plus rapidement que la moyenne</p>" },
  { id: "eEft000000000149", name: "Ragot d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Votre réputation vous precede, enfin une mauvaise réputation</p>" },
  { id: "eEft000000000150", name: "Lubie d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>Parfois des petits malins s'amuse à mettre des affiches de recherche avec votre tête dessus</p>" },
  { id: "eEft000000000151", name: "Insertion de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous avez un vice, klépto? Parano? Nympho?</p>" },
  { id: "eEft000000000152", name: "Honte d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>En votre presence, les feux se font moins chaleureux, plus sombre, moins réconfortant</p>" },
  { id: "eEft000000000153", name: "Marque d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous etes un la cible de sortileges</p>" },
  { id: "eEft000000000154", name: "Prix d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>L'argent et l'or vous brûle les doigts, littéralement</p>" },
  { id: "eEft000000000155", name: "Danse de Zeus", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Zeus</p><p>Les Curêtes de Zeus suivent vos pas, le moindre éclair peut être le signe de leur arriver</p>" },
  { id: "eEft000000000156", name: "Jalousie d'Hera", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hera</p><p>Aucun doute, Héra à lacher Argos, le géant aux 100 yeux a vos trousses, vous sentez toujours son regard</p>" },
  { id: "eEft000000000157", name: "Lignée de Poséidon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Poseïdon</p><p>Un oeil unique qui luit dans la nuit, l'odeur du mouton, pas de doute un cyclope vous traque</p>" },
  { id: "eEft000000000158", name: "Défi d'Athéna", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Athéna</p><p>Gare aux descendants d'Arachné, si elle vous voient vous serez leurs proies</p>" },
  { id: "eEft000000000159", name: "Fureur d'Arès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Arès</p><p>Vous etes habité par une Makhaï, un esprit du combat</p>" },
  { id: "eEft000000000160", name: "Tristesse de Déméter", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Déméter</p><p>Vous semblez attirer la famine, si vous rester trop longtemps dans une ville sans demander pardon</p>" },
  { id: "eEft000000000161", name: "Maux d'Apollon", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Apollon</p><p>Vous semblez attirer la peste, si vous rester trop longtemps dans une ville.</p>" },
  { id: "eEft000000000162", name: "Chatiment d'Artèmis", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Artèmis</p><p>Des chasseresses Dryades vous pourchassent sans repos</p>" },
  { id: "eEft000000000163", name: "Poursuite d'Héphaïstos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Héphaïstos</p><p>Un automate d'Héphaïstos vous poursuit, mais il peut ressembler a n'importe qui!</p>" },
  { id: "eEft000000000164", name: "Déni d'Aphrodite", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Aphrodite</p><p>Vous avez un amour impossible, veritable creve coeur</p>" },
  { id: "eEft000000000165", name: "Bande d'Hermès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hermes</p><p>C'est vraiment pas de chance, vous semblez tomber continuellement sur des voleurs et bandits</p>" },
  { id: "eEft000000000166", name: "Folie de Dionysos", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Dionysos</p><p>Vous etes pourchassé par une Ménade, esprit de la folie, vous la sentez s'insinuer parfois, ou, toujours</p>" },
  { id: "eEft000000000167", name: "Déception d'Hestia", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hestia</p><p>Votre propre famille vous à renier, certains même vous pourchasse, mais pourquoi?</p>" },
  { id: "eEft000000000168", name: "Terreur d'Hécate", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hécate</p><p>Vous etes la proie d'une Empousa, sa jambe d'Ane et d'Or resonnent derriere vous.</p>" },
  { id: "eEft000000000169", name: "Jugement d'Hadès", img: "icons/svg/sun.svg", changes: [], description: "<p><strong>Dévotion :</strong> Hadès</p><p>Les Erinyes vous pourchassent! Elles sont partout, tout le temps!</p>" }
];

function effetDocDataDesavantage(entry) {
  return {
    _id: entry.id,
    name: entry.name,
    img: entry.img,
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

async function applyCreateEffetsDesavantages() {
  const pack = game.packs.get("antique.effets");
  if (!pack) return 0;

  const index = await pack.getIndex();
  const existingIds = new Set(index.map(e => e._id));
  const missing = EFFETS_DESAVANTAGES.filter(e => !existingIds.has(e.id)).map(effetDocDataDesavantage);
  if (!missing.length) return 0;

  await pack.configure({ locked: false });
  await pack.documentClass.createDocuments(missing, { pack: pack.collection, keepId: true });
  await pack.configure({ locked: true });
  return missing.length;
}

async function linkAndEmbedDesavantage(doc, entry) {
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
      "system.changes": entry.changes,
      description: entry.description,
      disabled: false,
      transfer: true
    }]);
    changed = true;
  } else {
    const kept = doc.effects.contents[0];
    if (kept.description !== entry.description) {
      await kept.update({ description: entry.description });
      changed = true;
    }
  }

  return changed;
}

async function applyEmbedEffetsDesavantages() {
  const byName = new Map(EFFETS_DESAVANTAGES.map(e => [e.name, e]));
  let fixed = 0;

  const pack = game.packs.get("antique.desavantages");
  if (pack) {
    await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const indexEntry of index) {
      const entry = byName.get(cleanName(indexEntry.name));
      if (!entry) continue;
      const doc = await pack.getDocument(indexEntry._id);
      if (await linkAndEmbedDesavantage(doc, entry)) fixed++;
    }
    await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "disadvantage") continue;
      const entry = byName.get(cleanName(item.name));
      if (!entry) continue;
      if (await linkAndEmbedDesavantage(item, entry)) fixed++;
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

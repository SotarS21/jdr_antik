/**
 * Build script : généralisation du point 20 de TODO_BUG_ANTIQUE.md — "Compendium de
 * compétences de combat PNJ façon bestiaire mythologique" à toutes les créatures de
 * packs/creatures.db (26 restantes, en plus de Minotaure/Méduse déjà faites en v0.6.71-76).
 *
 * Même discipline que le chantier des Désavantages (v0.6.67) : une capacité ne devient
 * mécanique (ActiveEffect embarqué, transfer:true, actif en permanence — décision
 * utilisateur du 10 septembre 2026, cohérente avec la décision finale prise pour Charge
 * furieuse) que si elle correspond à un champ déjà existant sur le NPC (attackBonuses.*,
 * ca.value, initiative.value, deplacement). Tout le reste (régénération, poison au fil du
 * temps, attaques multiples, peur/charme, résistances aux types de dégâts, incorporel...)
 * reste purement narratif — le système n'a pas de champ pour ça, comme pour 87/90
 * désavantages. Un saveAbility/saveDC est ajouté partout où le texte d'origine précise un
 * jet de sauvegarde avec une des 3 caractéristiques de sauvegarde du système (Réflexes,
 * Robustesse, Volonté) et une difficulté chiffrée.
 *
 * Chaque capacité générée est à la fois :
 *  - un nouveau document dans le compendium "Capacités de Combat (PNJ)"
 *    (packs/capacites-combat.db), consultable/glissable indépendamment ;
 *  - embarquée directement sur l'acteur PNJ correspondant dans packs/creatures.db, pour
 *    que glisser une créature du compendium sur une scène l'amène déjà équipée (décision
 *    utilisateur du 10 septembre 2026 — Minotaure/Méduse, jusqu'ici sans capacité
 *    embarquée sur eux-mêmes, sont donc aussi retouchés ici).
 *
 * Run:  node packs/_build-capacites-bestiaire.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const capacitesPath = path.join(__dirname, "capacites-combat.db");
const creaturesPath = path.join(__dirname, "creatures.db");

// --- Data: one entry per creature, in packs/creatures.db order. `mech` present = a real
// ActiveEffect (ADD on an existing NPC schema field) embedded, transfer:true, always on.
// `save` present = saveAbility/saveDC fields (chat "Jet de sauvegarde" button, see
// AntiqueItem#postToChat / the ".roll-save-button" hook in antique.mjs).
const CREATURES = [
  { creature: "Hydre de Lerne", abilities: [
    { name: "Régénération", icon: "icons/svg/regen.svg",
      description: "<p>Récupère <strong>5 PV par tour</strong>. Si une tête est tranchée, deux repoussent au tour suivant (+2 à l'attaque tant qu'elles ne sont pas retranchées). Le feu empêche la régénération.</p>" },
    { name: "Souffle venimeux", icon: "icons/svg/poison.svg", save: { ability: "robustesse", dc: 16 },
      description: "<p>Son haleine est mortelle dans un rayon de 3m (1d8 poison).</p>" }
  ]},
  { creature: "Cerbère", abilities: [
    { name: "Trois têtes", icon: "icons/svg/combat.svg",
      description: "<p>Peut attaquer trois cibles différentes par tour. Avantage aux jets de perception (ne peut être surpris).</p>" },
    { name: "Queue serpent", icon: "icons/svg/poison.svg",
      description: "<p>Attaque supplémentaire de queue, indépendante des trois têtes (1d6+2 poison).</p>" }
  ]},
  { creature: "Chimère", abilities: [
    { name: "Souffle de feu (jet de sauvegarde)", icon: "icons/svg/fire.svg", save: { ability: "reflexes", dc: 15 },
      description: "<p>Cône de 5m, 3d6 dégâts de feu (moitié en cas de réussite). Utilisable tous les 2 tours. Complète l'attaque déjà représentée par l'arme \"Souffle de feu\" — donne le bouton de jet de sauvegarde.</p>" },
    { name: "Triple menace", icon: "icons/svg/combat.svg",
      description: "<p>Tête de lion (morsure), corps de chèvre (charge), queue serpent (poison) : trois modes d'attaque distincts au choix du MJ.</p>" }
  ]},
  { creature: "Sphinx", abilities: [
    { name: "Énigme mortelle", icon: "icons/svg/daze.svg",
      description: "<p>Pose une énigme (Intelligence diff 20 ou Astuce diff 18). Échec = la proie se fige de terreur (paralysée 1 tour) puis est dévorée.</p>" },
    { name: "Attaque en piqué", icon: "icons/svg/wing.svg",
      description: "<p><strong>+2 à l'attaque</strong> (effet ci-dessous, actif en permanence) lors d'une attaque menée depuis les airs.</p>",
      mech: { changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }],
        effectDescription: "+2 à l'attaque (armes de corps à corps), tant que cet effet est actif." } }
  ]},
  // Cyclope : "Lancer de rocher" est déjà entièrement représenté par l'arme du même nom
  // (attBonus/damage/portée) — une capacité narrative dupliquerait sans rien ajouter.
  { creature: "Griffon", abilities: [
    { name: "Attaque en piqué (Griffon)", icon: "icons/svg/wing.svg",
      description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +2 aux dégâts (à ajouter manuellement, aucun champ de bonus de dégâts séparé n'existe pour les armes de PNJ) lors d'une attaque en piqué.</p>",
      mech: { changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }],
        effectDescription: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." } }
  ]},
  { creature: "Scylla", abilities: [
    { name: "Six têtes", icon: "icons/svg/combat.svg",
      description: "<p>Peut attaquer jusqu'à 6 cibles différentes par tour.</p>" },
    { name: "Attaque éclair", icon: "icons/svg/lightning.svg", save: { ability: "reflexes", dc: 16 },
      description: "<p>Ses cous s'allongent à une vitesse fulgurante — la victime n'a droit qu'à un jet de Réflexes pour esquiver.</p>" }
  ]},
  { creature: "Charybde", abilities: [
    { name: "Maelström", icon: "icons/svg/hazard.svg",
      description: "<p>Trois fois par jour, aspire tout dans un rayon de 30m (Navigation diff 22 pour y échapper). Un navire pris dans le tourbillon est détruit en 3 tours.</p>" }
  ]},
  { creature: "Sirène", abilities: [
    { name: "Chant envoûtant", icon: "icons/svg/sound.svg", save: { ability: "volonte", dc: 20 },
      description: "<p>Échec = la victime est charmée et se dirige vers la Sirène. Portée 200m. Se boucher les oreilles avec de la cire annule l'effet.</p>" }
  ]},
  { creature: "Triton", abilities: [
    { name: "Combattant aquatique", icon: "icons/svg/water.svg",
      description: "<p><strong>+3 à l'attaque et +2 à la CA</strong> (effet ci-dessous, actif en permanence) quand il combat dans l'eau.</p>",
      mech: { changes: [
        { key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" },
        { key: "system.ca.value", type: "add", value: "2" }
      ], effectDescription: "+3 à l'attaque (armes de corps à corps) et +2 à la CA, tant que cet effet est actif." } }
  ]},
  { creature: "Centaure guerrier", abilities: [
    { name: "Charge de cavalerie", icon: "icons/svg/sword.svg",
      description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +4 aux dégâts (à ajouter manuellement) en charge directe (5m minimum en ligne droite).</p>",
      mech: { changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }],
        effectDescription: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." } },
    { name: "Piétinement", icon: "icons/svg/combat.svg",
      description: "<p>Peut piétiner un adversaire au sol (1d8+4 contondant).</p>" }
  ]},
  { creature: "Satyre", abilities: [
    { name: "Musique de Pan", icon: "icons/svg/sound.svg", save: { ability: "volonte", dc: 14 },
      description: "<p>Joue de la flûte (syrinx) : peut charmer, effrayer ou endormir, au choix du MJ.</p>" },
    { name: "Agilité forestière", icon: "icons/svg/wing.svg",
      description: "<p>Se déplace sans bruit en forêt. Avantage en discrétion en milieu naturel.</p>" }
  ]},
  { creature: "Harpie", abilities: [
    { name: "Vol rapide", icon: "icons/svg/wing.svg",
      description: "<p>Extrêmement rapide en vol, très difficile à attraper.</p>" },
    { name: "Puanteur", icon: "icons/svg/poison.svg", save: { ability: "robustesse", dc: 12 },
      description: "<p>Aura nauséabonde dans un rayon de 3m. Échec = -2 à toutes les actions tant que la cible reste dans le rayon.</p>" },
    { name: "Larcin aérien", icon: "icons/svg/hazard.svg", save: { ability: "reflexes", dc: 16 },
      description: "<p>Peut voler un objet en vol — la victime peut tenter d'en empêcher le vol.</p>" }
  ]},
  { creature: "Empusa", abilities: [
    { name: "Métamorphose (Empusa)", icon: "icons/svg/mystery-man.svg",
      description: "<p>Prend l'apparence d'une belle femme (Perception diff 18 pour voir à travers l'illusion).</p>" },
    { name: "Drain vital", icon: "icons/svg/blood.svg",
      description: "<p>Sa morsure draine 1d6 PV supplémentaires qu'elle absorbe.</p>" }
  ]},
  { creature: "Lamie", abilities: [
    { name: "Métamorphose (Lamie)", icon: "icons/svg/mystery-man.svg",
      description: "<p>Peut prendre forme humaine (Perception diff 16 pour la détecter).</p>" },
    { name: "Constriction (Lamie)", icon: "icons/svg/net.svg", save: { ability: "robustesse", dc: 16 },
      description: "<p>En forme serpentine, peut enserrer une cible (1d6+2 par tour). La victime peut tenter de se libérer.</p>" },
    { name: "Yeux amovibles", icon: "icons/svg/eye.svg",
      description: "<p>Peut retirer ses yeux pour les cacher. Sans yeux : immunisée aux effets visuels mais aveugle.</p>" }
  ]},
  { creature: "Python", abilities: [
    { name: "Constriction (Python)", icon: "icons/svg/net.svg", save: { ability: "robustesse", dc: 20 },
      description: "<p>Enserre sa proie (2d6+5 par tour). La victime peut tenter de se libérer.</p>" },
    { name: "Venin (Python)", icon: "icons/svg/poison.svg", save: { ability: "robustesse", dc: 16 },
      description: "<p>Morsure empoisonnée (2d6 poison et affaibli en cas d'échec).</p>" },
    { name: "Gardien de l'Oracle", icon: "icons/svg/mage-shield.svg",
      description: "<p>Résistance à la magie (avantage aux jets contre les sorts).</p>" }
  ]},
  { creature: "Spectre du Styx", abilities: [
    { name: "Incorporel", icon: "icons/svg/frozen.svg",
      description: "<p>Les armes normales passent à travers (demi-dégâts). Les armes de bronze béni ou divines infligent des dégâts pleins.</p>" },
    // "Toucher glacial" est déjà l'arme du Spectre (même nom) — pas de capacité séparée,
    // le drain de Constitution reste une note narrative sur l'arme elle-même.
    { name: "Gémissement", icon: "icons/svg/terror.svg", save: { ability: "volonte", dc: 14 },
      description: "<p>Pousse un cri terrifiant. Échec = effrayé pendant 1d4 tours.</p>" }
  ]},
  { creature: "Érinye (Furie)", abilities: [
    { name: "Traque implacable", icon: "icons/svg/eye.svg",
      description: "<p>Détecte automatiquement la culpabilité. Ne peut être semée ni trompée par un coupable.</p>" },
    { name: "Fouet enflammé (jet de sauvegarde)", icon: "icons/svg/fire.svg", save: { ability: "volonte", dc: 16 },
      description: "<p>Inflige douleur et folie. Échec = la victime est prise de terreur et de remords paralysants. Complète l'attaque déjà représentée par l'arme \"Fouet enflammé\" — donne le bouton de jet de sauvegarde.</p>" },
    { name: "Vol (Érinye)", icon: "icons/svg/wing.svg",
      description: "<p>Ailes de chauve-souris, vol rapide.</p>" }
  ]},
  { creature: "Carcinos", abilities: [
    { name: "Prise broyeuse (immobilisation)", icon: "icons/svg/net.svg", save: { ability: "robustesse", dc: 18 },
      description: "<p>Agrippe et broie (1d8+4 par tour). La victime peut tenter de se libérer.</p>" }
  ]},
  { creature: "Géant (Gigante)", abilities: [
    { name: "Fils de Gaïa", icon: "icons/svg/regen.svg",
      description: "<p>Régénère 5 PV par tour tant qu'il touche le sol. Perdre le contact avec la terre annule la régénération.</p>" },
    { name: "Lancer de rocher (Géant)", icon: "icons/svg/hazard.svg",
      description: "<p>Peut lancer d'énormes rochers ou des arbres.</p>" },
    { name: "Jambes serpentines", icon: "icons/svg/poison.svg",
      description: "<p>Ses jambes-serpents peuvent mordre les ennemis proches, en plus de son attaque principale.</p>" }
  ]},
  { creature: "Typhon", abilities: [
    { name: "Cent têtes", icon: "icons/svg/combat.svg",
      description: "<p>Peut attaquer tous les ennemis dans un rayon de 10m simultanément.</p>" },
    { name: "Tempête", icon: "icons/svg/hazard.svg",
      description: "<p>Génère des ouragans et des tremblements de terre autour de lui.</p>" }
    // "Souffle de lave" est déjà l'arme de Typhon (même nom) — pas de capacité séparée.
  ]},
  { creature: "Lion de Némée", abilities: [
    { name: "Peau impénétrable", icon: "icons/svg/holy-shield.svg",
      description: "<p>Immunisé aux armes tranchantes et perforantes. Seuls les dégâts contondants ou l'étranglement fonctionnent.</p>" },
    { name: "Rugissement", icon: "icons/svg/terror.svg", save: { ability: "volonte", dc: 14 },
      description: "<p>Échec = effrayé pendant 1d4 tours.</p>" },
    { name: "Prédateur suprême", icon: "icons/svg/eye.svg",
      description: "<p>Avantage aux jets de traque et de discrétion en terrain naturel.</p>" }
  ]},
  { creature: "Aigle du Caucase", abilities: [
    { name: "Déchiquetage", icon: "icons/svg/blood.svg",
      description: "<p>En combat prolongé, peut arracher des morceaux de chair (dégâts continus 1d4 par tour si la morsure initiale a touché).</p>" },
    { name: "Vol supérieur", icon: "icons/svg/wing.svg",
      description: "<p>Vitesse et manœuvrabilité exceptionnelles en vol.</p>" }
  ]},
  { creature: "Sanglier d'Érymanthe", abilities: [
    { name: "Charge dévastatrice", icon: "icons/svg/sword.svg",
      description: "<p><strong>+4 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge (5m minimum). Renverse les cibles de taille humaine.</p>",
      mech: { changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "4" }],
        effectDescription: "+4 à l'attaque (armes de corps à corps), tant que cet effet est actif." } },
    { name: "Défenses acérées", icon: "icons/svg/sword.svg",
      description: "<p>Ses défenses sont capables de transpercer le bronze.</p>" }
  ]},
  { creature: "Taureau de Crète", abilities: [
    { name: "Souffle de feu (Taureau)", icon: "icons/svg/fire.svg",
      description: "<p>Peut cracher des flammes (2d6 feu, cône de 3m). Don de Poséidon.</p>" },
    { name: "Charge du Taureau", icon: "icons/svg/sword.svg",
      description: "<p><strong>+3 à l'attaque</strong> (effet ci-dessous, actif en permanence) et +6 aux dégâts (à ajouter manuellement) en charge directe.</p>",
      mech: { changes: [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "3" }],
        effectDescription: "+3 à l'attaque (armes de corps à corps), tant que cet effet est actif." } }
  ]},
  { creature: "Stymphale", abilities: [
    // "Plumes de bronze" est déjà l'arme de Stymphale (même nom) — pas de capacité séparée.
    { name: "Nuée", icon: "icons/svg/combat.svg",
      description: "<p>En groupe de 5 individus ou plus, forment une nuée qui obscurcit le ciel (-2 en perception visuelle pour les ennemis).</p>" },
    { name: "Fiente toxique", icon: "icons/svg/poison.svg", save: { ability: "robustesse", dc: 12 },
      description: "<p>Poison au contact. Échec = 1d4 dégâts de poison par tour.</p>" }
  ]}
];

// --- Load existing packs ---
const capacitesLines = fs.readFileSync(capacitesPath, "utf8").split("\n").filter(Boolean);
const capacitesDocs = capacitesLines.map(l => JSON.parse(l));
const creaturesLines = fs.readFileSync(creaturesPath, "utf8").split("\n").filter(Boolean);
const creaturesDocs = creaturesLines.map(l => JSON.parse(l));

let nextNum = capacitesDocs.length + 1; // aNca000000000001/2 already used (Minotaure/Méduse)

function buildAbilityDoc(creatureName, ability) {
  const id = `aNca${String(nextNum).padStart(12, "0")}`;
  nextNum++;
  const doc = {
    _id: id,
    name: ability.name,
    type: "npcability",
    img: ability.icon,
    system: {
      description: ability.description,
      gmNotes: "",
      saveAbility: ability.save?.ability ?? "",
      saveDC: ability.save?.dc ?? 0
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  };
  if (ability.mech) {
    doc.effects.push({
      _id: generateEmbeddedId(`${id}_embedded_effect`),
      name: ability.name,
      img: ability.icon,
      type: "base",
      system: { changes: ability.mech.changes },
      disabled: false,
      transfer: true,
      duration: { startTime: null, seconds: null, rounds: null, turns: null },
      flags: {},
      tint: null,
      origin: null,
      statuses: [],
      description: ability.mech.effectDescription
    });
  }
  return doc;
}

const newCapacitesDocs = [];
let embeddedOnCreatures = 0;
let mechanicalCount = 0;

for (const entry of CREATURES) {
  const creature = creaturesDocs.find(d => d.name === entry.creature);
  if (!creature) {
    console.error(`Créature introuvable dans creatures.db : ${entry.creature}`);
    continue;
  }
  creature.items = creature.items ?? [];
  for (const ability of entry.abilities) {
    const doc = buildAbilityDoc(entry.creature, ability);
    newCapacitesDocs.push(doc);
    if (ability.mech) mechanicalCount++;
    // Embed a copy (same _id, own effects array) directly on the creature.
    creature.items.push(JSON.parse(JSON.stringify(doc)));
    embeddedOnCreatures++;
  }
}

// Retrofit: Minotaure/Méduse don't have their existing ability embedded on themselves yet.
const minotaure = creaturesDocs.find(d => d.name === "Minotaure");
const meduse = creaturesDocs.find(d => d.name === "Méduse");
const chargeFurieuse = capacitesDocs.find(d => d.name === "Charge furieuse");
const regardPetrifiant = capacitesDocs.find(d => d.name === "Regard pétrifiant");
if (minotaure && chargeFurieuse && !minotaure.items.some(i => i._id === chargeFurieuse._id)) {
  minotaure.items.push(JSON.parse(JSON.stringify(chargeFurieuse)));
  embeddedOnCreatures++;
}
if (meduse && regardPetrifiant && !meduse.items.some(i => i._id === regardPetrifiant._id)) {
  meduse.items.push(JSON.parse(JSON.stringify(regardPetrifiant)));
  embeddedOnCreatures++;
}

// --- Write back ---
const allCapacitesDocs = [...capacitesDocs, ...newCapacitesDocs];
fs.writeFileSync(capacitesPath, allCapacitesDocs.map(d => JSON.stringify(d)).join("\n") + "\n");
fs.writeFileSync(creaturesPath, creaturesDocs.map(d => JSON.stringify(d)).join("\n") + "\n");

console.log(`${newCapacitesDocs.length} nouvelles capacités créées (${mechanicalCount} mécaniques, ${newCapacitesDocs.length - mechanicalCount} narratives).`);
console.log(`${embeddedOnCreatures} capacités embarquées sur des créatures (dont le retrofit Minotaure/Méduse).`);
console.log(`Total capacites-combat.db : ${allCapacitesDocs.length} documents.`);

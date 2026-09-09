/**
 * Build script : premier jet du compendium "Capacités de combat" pour PNJ/créatures
 * (point 20 de TODO_BUG_ANTIQUE.md — todo_foundry.txt : "sur les pnj, ajouter des
 * compétences de combat, avec un compendium associé, s'inspirer des descriptions des
 * créatures mythologiques"). Étape "architecture + 2-3 exemples", pas encore généralisé
 * à toutes les créatures.
 *
 * Contenu repris de packs/creatures.db (champ "notes") :
 * - Charge furieuse (Minotaure) : mécanique pour la partie chiffrable (+2 attaque, via un
 *   ActiveEffect embarqué, désactivé par défaut — le MJ l'active pendant la charge). Le
 *   bonus de dégâts (+4) reste narratif : les armes de PNJ n'ont pas de champ numérique de
 *   bonus de dégâts séparé (juste une formule de dégâts en texte libre), donc rien à
 *   sommer automatiquement dessus. Même patron que les avantages : un document Effet
 *   autonome dans packs/effets.db (bibliothèque générale) + un lien vers ce document dans
 *   la description, en plus de la copie embarquée sur l'objet lui-même. L'ID de l'effet
 *   doit rester en phase avec CHARGE_FURIEUSE_EFFET_ID dans module/helpers/pack-updates.mjs.
 * - Regard pétrifiant (Méduse) : entièrement narratif (jet de sauvegarde + conséquence
 *   gérés par le MJ), aucun effet embarqué — même principe que les désavantages
 *   narratifs du chantier Effets.
 *
 * Run:  node packs/_build-capacites-combat.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const outPath = path.join(__dirname, "capacites-combat.db");
const effetsPath = path.join(__dirname, "effets.db");

const CHARGE_FURIEUSE_EFFET_ID = "eEft000000000170";
const CHARGE_FURIEUSE_CHANGES = [{ key: "system.attackBonuses.armeBlanche.total", type: "add", value: "2" }];
const CHARGE_FURIEUSE_UUID_LINK = `@UUID[Compendium.antique.effets.${CHARGE_FURIEUSE_EFFET_ID}]{Charge furieuse}`;

const docs = [
  {
    _id: "aNca000000000001",
    name: "Charge furieuse",
    type: "npcability",
    img: "icons/svg/sword.svg",
    system: {
      description:
        "<p>En chargeant en ligne droite, la créature frappe avec une force dévastatrice.</p>" +
        "<p><strong>+2 à l'attaque</strong> (effet ci-dessous, désactivé par défaut — à activer " +
        "pendant la charge, désactiver ensuite) et <strong>+4 aux dégâts</strong>, à ajouter " +
        "manuellement au jet de dégâts (aucun champ de bonus de dégâts séparé n'existe pour les " +
        "armes de PNJ).</p>" +
        `<p>${CHARGE_FURIEUSE_UUID_LINK}</p>`,
      gmNotes: ""
    },
    effects: [{
      _id: generateEmbeddedId("aNca000000000001_embedded_effect"),
      name: "Charge furieuse",
      img: "icons/svg/sword.svg",
      type: "base",
      system: { changes: CHARGE_FURIEUSE_CHANGES },
      disabled: true,
      transfer: true,
      duration: { startTime: null, seconds: null, rounds: null, turns: null },
      flags: {},
      tint: null,
      origin: null,
      statuses: [],
      description: "+2 à l'attaque (armes de corps à corps), tant que cet effet est actif."
    }],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  },
  {
    _id: "aNca000000000002",
    name: "Regard pétrifiant",
    type: "npcability",
    img: "icons/svg/eye.svg",
    system: {
      description:
        "<p>Toute créature qui croise le regard de la créature doit réussir un jet de Robustesse " +
        "(difficulté 18) ou être pétrifiée. Les combattants avisés utilisent un miroir ou " +
        "combattent les yeux fermés (-4 à l'attaque).</p>" +
        "<p><em>Capacité narrative — aucun effet mécanique automatique : le jet de sauvegarde et " +
        "ses conséquences sont gérés manuellement par le MJ.</em></p>",
      gmNotes: ""
    },
    effects: [],
    folder: null,
    sort: 100000,
    ownership: { default: 0 },
    flags: {}
  }
];

fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");
console.log(`Écrit ${docs.length} documents dans ${outPath}.`);

const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);
if (effetsLines.some(l => JSON.parse(l)._id === CHARGE_FURIEUSE_EFFET_ID)) {
  console.log(`${CHARGE_FURIEUSE_EFFET_ID} déjà présent dans ${effetsPath}, rien à faire.`);
} else {
  const effetDoc = {
    _id: CHARGE_FURIEUSE_EFFET_ID,
    name: "Charge furieuse",
    img: "icons/svg/sword.svg",
    type: "base",
    system: { changes: CHARGE_FURIEUSE_CHANGES },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: "<p>+2 à l'attaque (armes de corps à corps), tant que cet effet est actif.</p>",
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
  fs.writeFileSync(effetsPath, effetsLines.concat([JSON.stringify(effetDoc)]).join("\n") + "\n", "utf-8");
  console.log(`Ajouté l'effet Charge furieuse (${CHARGE_FURIEUSE_EFFET_ID}) à ${effetsPath}.`);
}

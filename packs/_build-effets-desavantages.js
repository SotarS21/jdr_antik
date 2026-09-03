/**
 * Build script : effets actifs pour les 90 désavantages qui n'en avaient pas encore
 * (5 en avaient déjà : Sens défaillant, Frêle, Distrait, Dépressif, Maladroit — non
 * touchés). Contrairement aux avantages, la quasi-totalité des désavantages décrivent une
 * conséquence conditionnelle/de jeu de rôle (peur si échec de Volonté, malus situationnel,
 * poursuivi par une créature...) plutôt qu'un malus chiffré permanent — traités comme
 * "effet simple" narratif (aucun `changes`), même patron que les avantages narratifs.
 *
 * Seuls 4 cas ont un vrai malus chiffré automatisable (décision utilisateur, voir
 * JOURNAL.md) : Petite nature, Enfant, Introverti (malus de compétence) — Poigne d'Arès
 * reste narratif, aucun champ n'existe pour une pénalité de "deuxième attaque".
 *
 * Comme pour les avantages (leçon de la session), lien de description ET effet embarqué
 * sont posés dans le même passage.
 *
 * Run:  node packs/_build-effets-desavantages.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

function cleanName(name) {
  return name.replace(/^\(-?\d+\)\s*/, "");
}

// Les 4 cas avec un vrai malus chiffré — le reste (calculé plus bas) reste narratif.
const MECHANICAL = {
  "Petite nature": [{ key: "system.skills.resistancePoisons.bonus", type: "add", value: "-2" }],
  "Enfant": [{ key: "system.skills.commandement.bonus", type: "add", value: "-2" }],
  "Introverti": [{ key: "system.skills.baratin.bonus", type: "add", value: "-2" }]
};

const desavantagesPath = path.join(__dirname, "desavantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const desavantagesLines = fs.readFileSync(desavantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

let idCounter = effetsLines.length;
function genEffetId() {
  idCounter++;
  return "eEft" + String(idCounter).padStart(12, "0");
}

const newEffetsLines = [];
let done = 0;

const updatedDesavantagesLines = desavantagesLines.map(line => {
  const doc = JSON.parse(line);
  if (doc.effects.length) return line; // 5 déjà pourvus, on n'y touche pas

  const name = cleanName(doc.name);
  const changes = MECHANICAL[name] ?? [];

  const effetId = genEffetId();
  const effetDoc = {
    _id: effetId,
    name,
    img: doc.img,
    type: "base",
    system: { changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: doc.system.description,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
  newEffetsLines.push(JSON.stringify(effetDoc));

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{${name}}`;
  doc.system.description = doc.system.description + `<p>${uuidLink}</p>`;

  doc.effects = [{
    _id: generateEmbeddedId(doc._id + "_embedded_effect"),
    name,
    img: doc.img,
    type: "base",
    system: { changes },
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    origin: null,
    statuses: [],
    description: effetDoc.description
  }];

  done++;
  return JSON.stringify(doc);
});

if (done !== 90) {
  throw new Error(`Attendu 90 désavantages traités, obtenu ${done}.`);
}

fs.writeFileSync(effetsPath, effetsLines.concat(newEffetsLines).join("\n") + "\n", "utf-8");
fs.writeFileSync(desavantagesPath, updatedDesavantagesLines.join("\n") + "\n", "utf-8");
console.log(`Ajouté ${newEffetsLines.length} effets à ${effetsPath}, ${done} désavantages liés+embarqués dans ${desavantagesPath}.`);

/**
 * Build script : effet de l'avantage Mule (todo_foundry.txt ligne 354 — "ajout d'un effet
 * qui augmente la valeur de la capacité de port en kg en la multipliant par 2"). Bonus sur
 * le porteur lui-même, même patron que Colère de Zeus/Talent d'Héphaistos : document Effet
 * autonome + lien + effet embarqué directement sur l'avantage.
 *
 * Run:  node packs/_build-effet-mule.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const CHANGES = [{ key: "system.capacitePort", type: "multiply", value: "2" }];
const EFFET_DESCRIPTION = "<p>Multiplie la capacité de port par deux, tant que cet effet est actif.</p>";

const avantagesPath = path.join(__dirname, "avantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

const effetId = "eEft" + String(effetsLines.length + 1).padStart(12, "0");

let done = 0;
const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  if (doc.name.replace(/^\(-?\d+\)\s*/, "") !== "Mule") return line;
  if (doc.effects.length) throw new Error(`"${doc.name}" a déjà un effet embarqué — vérifier avant relancer.`);

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{Mule}`;
  doc.system.description = doc.system.description + `<p>${uuidLink}</p>`;

  doc.effects = [{
    _id: generateEmbeddedId(doc._id + "_embedded_effect"),
    name: "Mule",
    img: doc.img,
    type: "base",
    system: { changes: CHANGES },
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  }];

  done++;
  return JSON.stringify(doc);
});

if (done !== 1) throw new Error(`Attendu 1 avantage "Mule" traité, obtenu ${done}.`);

const effetDoc = {
  _id: effetId,
  name: "Mule",
  img: "icons/svg/upgrade.svg",
  type: "base",
  system: { changes: CHANGES },
  disabled: false,
  duration: { startTime: null, seconds: null, rounds: null, turns: null },
  description: EFFET_DESCRIPTION,
  origin: null,
  tint: "#ffffff",
  transfer: true,
  statuses: [],
  folder: null,
  sort: 0,
  flags: {}
};

fs.writeFileSync(effetsPath, effetsLines.concat([JSON.stringify(effetDoc)]).join("\n") + "\n", "utf-8");
fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
console.log(`Ajouté l'effet Mule (${effetId}) à ${effetsPath}, lié+embarqué dans ${avantagesPath}.`);

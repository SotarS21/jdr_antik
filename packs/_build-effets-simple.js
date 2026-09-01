/**
 * Build script: extends packs/effets.db with the 24 "effet simple" entries from
 * todo_foundry.txt's "Feature antique" section — narrative-only ActiveEffect
 * documents (name + description copied from the matching Avantage, no `changes`)
 * for advantages that don't warrant a game-mechanical modifier. Same architecture as
 * the first 3 examples (see _build-effets.js, JOURNAL.md 31 août 2026) : a real
 * top-level ActiveEffect document, droppable standalone on any actor.
 *
 * Also appends a @UUID[Compendium.antique.effets.<id>]{...} content link to each
 * matching advantage's own description in packs/avantages.db, same pattern as
 * packs/_fix-advantages-effect-links.js used for the first 3 — makes the effect
 * draggable directly from the advantage's description text.
 *
 * Run:  node packs/_build-effets-simple.js
 * Then apply the description-link half to the already-deployed compendium/actor
 * copies with the companion GM macro packs/_fix-effets-simple-links-live.js
 * (the effets.db pack itself needs a normal /deploy, not a live macro, since it's a
 * brand new set of documents rather than an edit to existing ones).
 */
const fs = require("fs");
const path = require("path");

const SIMPLE_NAMES = [
  "Beauté d'Aphrodite", "Bon sens", "Branchies de Poséidon", "Chaleur d'Hestia",
  "Chasse d'Artèmis", "Commercant", "Don d'Hadès", "Equilibre félin", "Faveur",
  "Fetard", "Guerrier Aguerri", "Ivresse de Dionysos", "Mains d'Hèrmès",
  "Rage d'Arès", "Respect d'Héra", "Soin d'Apollon", "Sommeil leger",
  "Visage passe partout", "Vue d'Hécate", "Ambidextrie", "Ami des animaux",
  "Casque d'Hadès", "Charme d'Aphrodite", "Chrono sens"
];

const avantagesPath = path.join(__dirname, "avantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

// Continue the existing eEft id sequence (3 already used by _build-effets.js).
let idCounter = effetsLines.length;
function genId(prefix) {
  idCounter++;
  return prefix + String(idCounter).padStart(16 - prefix.length, "0");
}

const newEffetsLines = [];
let linked = 0;

const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  const cleanName = doc.name.replace(/^\(-?\d+\)\s*/, "");
  if (!SIMPLE_NAMES.includes(cleanName)) return line;

  const effetId = genId("eEft");
  const effetDoc = {
    _id: effetId,
    name: cleanName,
    img: doc.img,
    type: "base",
    system: { changes: [] },
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

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{${cleanName}}`;
  doc.system.description = doc.system.description + `<p>${uuidLink}</p>`;
  linked++;

  return JSON.stringify(doc);
});

if (linked !== SIMPLE_NAMES.length) {
  throw new Error(`Expected to link ${SIMPLE_NAMES.length} advantages, linked ${linked} — check name spelling against avantages.db.`);
}

fs.writeFileSync(effetsPath, effetsLines.concat(newEffetsLines).join("\n") + "\n", "utf-8");
fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
console.log(`Added ${newEffetsLines.length} effects to ${effetsPath}, linked ${linked} advantages in ${avantagesPath}.`);

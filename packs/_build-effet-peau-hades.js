/**
 * Build script: "Peau d'Hadès" (aAdv000000000094) — MULTIPLY (system.pv.value ×2),
 * same mechanical family as "Athlète" (déplacement ×2, see _build-effets.js) : an
 * embedded ActiveEffect on the advantage itself (auto-applies while owned, modern
 * system.changes/type shape directly — no need for a live-migration pass since this
 * is new content) PLUS a standalone document in packs/effets.db, linked from the
 * advantage's description — same dual pattern as Athlète/Cuir de Hero.
 *
 * Doubles system.pv.value directly (current HP), not system.pv.max — matches the
 * todo_foundry.txt wording ("prendre les pv actuels et les multiplier par deux"),
 * distinct from "Taille imposante" which raises the max.
 *
 * Run:  node packs/_build-effet-peau-hades.js
 * Then apply to the already-deployed compendium/actor copies with the companion GM
 * macro packs/_fix-effet-peau-hades-live.js.
 */
const fs = require("fs");
const path = require("path");

const ADVANTAGE_ID = "aAdv000000000094";
const CHANGE = { key: "system.pv.value", type: "multiply", value: "2" };

const avantagesPath = path.join(__dirname, "avantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

const effetId = "eEft" + String(effetsLines.length + 1).padStart(12, "0");

let found = false;
const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  if (doc._id !== ADVANTAGE_ID) return line;
  found = true;

  doc.effects = [{
    _id: "pHad00000hades01",
    name: "Peau d'Hadès",
    img: doc.img,
    type: "base",
    system: { changes: [CHANGE] },
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  }];

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{Peau d'Hadès}`;
  doc.system.description = doc.system.description + `<p>${uuidLink}</p>`;

  return JSON.stringify(doc);
});

if (!found) throw new Error(`Advantage ${ADVANTAGE_ID} not found in ${avantagesPath}`);

const effetDoc = {
  _id: effetId,
  name: "Peau d'Hadès",
  img: "icons/svg/sun.svg",
  type: "base",
  system: { changes: [CHANGE] },
  disabled: false,
  duration: { startTime: null, seconds: null, rounds: null, turns: null },
  description: "<p>La peau du personnage prend la texture grise et coriace des Enfers, encaissant les coups au prix d'une vitalité changée. <strong>PV actuels ×2</strong>, tant que cet effet est actif.</p>",
  origin: null,
  tint: "#ffffff",
  transfer: true,
  statuses: [],
  folder: null,
  sort: 0,
  flags: {}
};

fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
fs.writeFileSync(effetsPath, effetsLines.concat([JSON.stringify(effetDoc)]).join("\n") + "\n", "utf-8");
console.log(`Added embedded effect to ${ADVANTAGE_ID} and standalone effect ${effetId} (Peau d'Hadès).`);

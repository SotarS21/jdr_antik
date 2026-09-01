/**
 * Follow-up fix to packs/_build-effets-simple.js: that script only added a @UUID
 * link to each advantage's description, but todo_foundry.txt's actual wording was
 * "ajouter cet effet sur l'aventage (dans les compendium d'avantage)" — the effect
 * should also be embedded directly on the advantage itself, showing up in its own
 * "Effets" tab (advantage-sheet.hbs), exactly like Cuir de Héros/Athlète/Peau
 * d'Hadès already do. User report (1er septembre 2026) : "les effets actifs
 * existe bien, mais il ne sont pas dans les aventages" — the compendium documents
 * were there, but nothing was attached to the advantage item itself.
 *
 * Adds a matching embedded ActiveEffect (same name/description, no `changes` —
 * narrative-only, consistent with the standalone compendium version) to each of
 * the 24 "effet simple" advantages. Connaissance d'Héphaistos is deliberately left
 * alone — it's a target-only effect (drag onto an enemy), embedding a self-copy on
 * the advantage itself would be wrong.
 *
 * Run:  node packs/_embed-effets-simple-on-advantages.js
 * Then apply to the already-deployed compendium/actor copies with the companion GM
 * macro packs/_fix-embed-effets-simple-live.js.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const EFFET_IDS = {
  "Guerrier Aguerri": "eEft000000000004",
  "Equilibre félin": "eEft000000000005",
  "Fetard": "eEft000000000006",
  "Bon sens": "eEft000000000007",
  "Commercant": "eEft000000000008",
  "Visage passe partout": "eEft000000000009",
  "Sommeil leger": "eEft000000000010",
  "Faveur": "eEft000000000011",
  "Respect d'Héra": "eEft000000000012",
  "Branchies de Poséidon": "eEft000000000013",
  "Rage d'Arès": "eEft000000000014",
  "Soin d'Apollon": "eEft000000000015",
  "Chasse d'Artèmis": "eEft000000000016",
  "Beauté d'Aphrodite": "eEft000000000017",
  "Mains d'Hèrmès": "eEft000000000018",
  "Ivresse de Dionysos": "eEft000000000019",
  "Chaleur d'Hestia": "eEft000000000020",
  "Vue d'Hécate": "eEft000000000021",
  "Don d'Hadès": "eEft000000000022",
  "Chrono sens": "eEft000000000023",
  "Ami des animaux": "eEft000000000024",
  "Ambidextrie": "eEft000000000025",
  "Charme d'Aphrodite": "eEft000000000026",
  "Casque d'Hadès": "eEft000000000027"
};

const avantagesPath = path.join(__dirname, "avantages.db");
const lines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);

let embedded = 0;
const out = lines.map(line => {
  const doc = JSON.parse(line);
  const cleanName = doc.name.replace(/^\(-?\d+\)\s*/, "");
  if (!EFFET_IDS[cleanName]) return line;
  if (doc.effects.length) return line; // already has an embedded effect, don't duplicate

  doc.effects = [{
    _id: generateId(doc._id + "_embedded_effect"),
    name: cleanName,
    img: doc.img,
    type: "base",
    system: { changes: [] },
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  }];
  embedded++;

  return JSON.stringify(doc);
});

if (embedded !== Object.keys(EFFET_IDS).length) {
  throw new Error(`Expected to embed ${Object.keys(EFFET_IDS).length}, embedded ${embedded} — check for advantages that already had an effect.`);
}

fs.writeFileSync(avantagesPath, out.join("\n") + "\n", "utf-8");
console.log(`Embedded ${embedded} narrative effect(s) on their matching advantage in ${avantagesPath}.`);

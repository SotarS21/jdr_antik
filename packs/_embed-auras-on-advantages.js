/**
 * Follow-up fix to packs/_build-effets-batch3-mechaniques.js : l'utilisateur est revenu sur
 * le choix initial ("Aura d'X" = effet à glisser sur un allié uniquement, comme Connaissance
 * d'Héphaistos) — les 15 effets doivent aussi s'appliquer automatiquement au PJ qui possède
 * l'avantage, en plus de rester présents (et glissables) dans la description. Même situation
 * que le suivi du 2 septembre pour les 24 premiers "effets simples"
 * (_embed-effets-simple-on-advantages.js) : le lien de description existait déjà, il ne
 * manquait que l'effet embarqué dans l'onglet "Effets" de l'avantage lui-même.
 *
 * Idempotent (ne touche pas un avantage qui a déjà un effet embarqué), aucune édition
 * LevelDB directe, uniquement l'API Document sur les fichiers sources NDJSON.
 *
 * Run:  node packs/_embed-auras-on-advantages.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const AURAS = [
  { advName: "Aura de Zeus", effetName: "Allié de l'aura de Zeus", changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }] },
  { advName: "Aura d'Héra", effetName: "Allié de l'aura d'Héra", changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }] },
  { advName: "Aura de Poséidon", effetName: "Allié de l'aura de Poséidon", changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }] },
  { advName: "Aura d'Athéna", effetName: "Allié de l'aura d'Athéna", changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }] },
  { advName: "Aura d'Arès", effetName: "Allié de l'aura d'Arès", changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }] },
  { advName: "Aura de Demeter", effetName: "Allié de l'aura de Demeter", changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }] },
  { advName: "Aura d'Apollon", effetName: "Allié de l'aura d'Apollon", changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }] },
  { advName: "Aura d'Artèmis", effetName: "Allié de l'aura d'Artèmis", changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }] },
  { advName: "Aura d'Héphaïstos", effetName: "Allié de l'aura d'Héphaïstos", changes: [{ key: "system.abilities.for.value", type: "add", value: "2" }] },
  { advName: "Aura d'Aphrodite", effetName: "Allié de l'aura d'Aphrodite", changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }] },
  { advName: "Aura d'Hermes", effetName: "Allié de l'aura d'Hermes", changes: [{ key: "system.abilities.dex.value", type: "add", value: "2" }] },
  { advName: "Aura de Dionysos", effetName: "Allié de l'aura de Dionysos", changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }] },
  { advName: "Aura d'Hestia", effetName: "Allié de l'aura d'Hestia", changes: [{ key: "system.abilities.cha.value", type: "add", value: "2" }] },
  { advName: "Aura d'Hécate", effetName: "Allié de l'aura d'Hécate", changes: [{ key: "system.abilities.ast.value", type: "add", value: "2" }] },
  { advName: "Aura d'Hadès", effetName: "Allié de l'aura d'Hadès", changes: [{ key: "system.abilities.con.value", type: "add", value: "2" }] }
];
const BY_ADV_NAME = new Map(AURAS.map(a => [a.advName, a]));

const OLD_DESC_SUFFIX = "<p><strong>Glisser directement sur un allié</strong> ; désactiver ou supprimer l'effet quand il doit cesser.</p>";
const NEW_DESC_SUFFIX = "<p>Actif automatiquement tant que l'avantage est possédé ; peut aussi être glissé directement sur un autre personnage.</p>";

// --- 1. Update the standalone effets.db description (auto-apply, not ally-only anymore) ---
const effetsPath = path.join(__dirname, "effets.db");
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);
let descUpdated = 0;
const updatedEffetsLines = effetsLines.map(line => {
  const doc = JSON.parse(line);
  const entry = AURAS.find(a => a.effetName === doc.name);
  if (!entry || !doc.description?.includes(OLD_DESC_SUFFIX)) return line;
  doc.description = doc.description.replace(OLD_DESC_SUFFIX, NEW_DESC_SUFFIX);
  descUpdated++;
  return JSON.stringify(doc);
});
fs.writeFileSync(effetsPath, updatedEffetsLines.join("\n") + "\n", "utf-8");

// --- 2. Embed the effect on each Aura advantage ---
const avantagesPath = path.join(__dirname, "avantages.db");
const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
let embedded = 0;
const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  const cleanName = doc.name.replace(/^\(-?\d+\)\s*/, "");
  const entry = BY_ADV_NAME.get(cleanName);
  if (!entry) return line;
  if (doc.effects.length) return line; // already embedded, don't duplicate

  doc.effects = [{
    _id: generateEmbeddedId(doc._id + "_embedded_effect"),
    name: entry.effetName,
    img: doc.img,
    type: "base",
    system: { changes: entry.changes },
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

if (embedded !== AURAS.length) {
  throw new Error(`Attendu ${AURAS.length} auras embarquées, obtenu ${embedded} — vérifier avant de relancer.`);
}

fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
console.log(`Embarqué ${embedded} effet(s) sur les avantages Aura, mis à jour ${descUpdated} description(s) dans ${effetsPath}.`);

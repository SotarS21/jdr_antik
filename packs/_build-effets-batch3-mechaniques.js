/**
 * Build script : étape 2/3 du complément au chantier Effets (todo_foundry.txt, avantages
 * -2/-3/-5 avec un vrai effet mécanique). Deux familles, traitées différemment :
 *
 * - Les 15 "Aura d'X" sont des effets à appliquer à un ALLIÉ, pas à soi-même — la
 *   description existante de chaque avantage dit "Renforce les jets de <carac> de
 *   l'équipe", et le nom demandé par todo_foundry.txt est "Allié de l'aura d'X" (pas
 *   "Aura d'X"). Même patron que Connaissance d'Héphaistos (session du 31 août) : un
 *   document Effet autonome avec un vrai `changes` (ADD system.abilities.<carac>.value
 *   +2), lié depuis la description de l'avantage, mais PAS embarqué sur l'avantage
 *   lui-même (rien à auto-appliquer au porteur).
 *
 * - Mire d'Artèmis, Talent d'Héphaistos et Pieds d'Hermes sont des bonus sur le porteur
 *   lui-même (comme Colère de Zeus/Visée d'Apollon déjà en place) : document Effet
 *   autonome + lien + effet embarqué directement sur l'avantage.
 *
 * Champs vérifiés avant écriture (voir JOURNAL.md) :
 *   - system.abilities.<carac>.value n'est jamais écrasé par prepareDerivedData() (seul
 *     .mod en est dérivé) — ADD dessus persiste, contrairement au piège saves.base.
 *   - system.attackBonuses.armeBlanche/armeADistance.damageBonus existent dans le schéma
 *     (attackCatSchema()), même famille que Colère de Zeus/Visée d'Apollon.
 *   - system.deplacement n'est pas recalculé par prepareDerivedData() ; Pieds d'Hermes
 *     "+4 cases" = +6m avec la grille du système (distance 1.5m/case, system.json).
 *
 * Run:  node packs/_build-effets-batch3-mechaniques.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateEmbeddedId(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

// Auras : ADD system.abilities.<key>.value +2, appliqué à un allié — pas d'embed.
const AURAS = [
  { advName: "Aura de Zeus", effetName: "Allié de l'aura de Zeus", key: "for", label: "Force" },
  { advName: "Aura d'Héra", effetName: "Allié de l'aura d'Héra", key: "ast", label: "Astuce" },
  { advName: "Aura de Poséidon", effetName: "Allié de l'aura de Poséidon", key: "con", label: "Constitution" },
  { advName: "Aura d'Athéna", effetName: "Allié de l'aura d'Athéna", key: "for", label: "Force" },
  { advName: "Aura d'Arès", effetName: "Allié de l'aura d'Arès", key: "for", label: "Force" },
  { advName: "Aura de Demeter", effetName: "Allié de l'aura de Demeter", key: "con", label: "Constitution" },
  { advName: "Aura d'Apollon", effetName: "Allié de l'aura d'Apollon", key: "ast", label: "Astuce" },
  { advName: "Aura d'Artèmis", effetName: "Allié de l'aura d'Artèmis", key: "dex", label: "Dextérité" },
  { advName: "Aura d'Héphaïstos", effetName: "Allié de l'aura d'Héphaïstos", key: "for", label: "Force" },
  { advName: "Aura d'Aphrodite", effetName: "Allié de l'aura d'Aphrodite", key: "cha", label: "Charisme" },
  { advName: "Aura d'Hermes", effetName: "Allié de l'aura d'Hermes", key: "dex", label: "Dextérité" },
  { advName: "Aura de Dionysos", effetName: "Allié de l'aura de Dionysos", key: "cha", label: "Charisme" },
  { advName: "Aura d'Hestia", effetName: "Allié de l'aura d'Hestia", key: "cha", label: "Charisme" },
  { advName: "Aura d'Hécate", effetName: "Allié de l'aura d'Hécate", key: "ast", label: "Astuce" },
  { advName: "Aura d'Hadès", effetName: "Allié de l'aura d'Hadès", key: "con", label: "Constitution" }
].map(a => ({
  ...a,
  selfEmbed: false,
  changes: [{ key: `system.abilities.${a.key}.value`, type: "add", value: "2" }],
  effetDescription:
    `<p>Bonus divin de +2 sur la caractéristique ${a.label} tant que cet effet est actif.</p>` +
    `<p><strong>Glisser directement sur un allié</strong> ; désactiver ou supprimer l'effet quand il doit cesser.</p>`
}));

// Bonus sur le porteur lui-même : embarqué comme Colère de Zeus/Visée d'Apollon.
const SELF_BUFFS = [
  {
    advName: "Mire d'Artèmis",
    effetName: "Mire d'Artèmis",
    selfEmbed: true,
    changes: [{ key: "system.attackBonuses.armeADistance.damageBonus", type: "add", value: "3" }],
    effetDescription: "<p>+3 aux dégâts de toutes les armes à distance, tant que cet effet est actif.</p>"
  },
  {
    advName: "Talent d'Héphaistos",
    effetName: "Talent d'Héphaistos",
    selfEmbed: true,
    changes: [{ key: "system.attackBonuses.armeBlanche.damageBonus", type: "add", value: "3" }],
    effetDescription: "<p>+3 aux dégâts de toutes les armes au corps à corps, tant que cet effet est actif.</p>"
  },
  {
    advName: "Pieds d'Hermes",
    effetName: "Pieds d'Hermes",
    selfEmbed: true,
    changes: [{ key: "system.deplacement", type: "add", value: "6" }],
    effetDescription: "<p>+6m de déplacement, tant que cet effet est actif.</p>"
  }
];

const ENTRIES = [...AURAS, ...SELF_BUFFS];

const avantagesPath = path.join(__dirname, "avantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

let idCounter = effetsLines.length;
function genEffetId() {
  idCounter++;
  return "eEft" + String(idCounter).padStart(12, "0");
}

const newEffetsLines = [];
let done = 0;

const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  const cleanName = doc.name.replace(/^\(-?\d+\)\s*/, "");
  const entry = ENTRIES.find(e => e.advName === cleanName);
  if (!entry) return line;
  if (entry.selfEmbed && doc.effects.length) {
    throw new Error(`"${doc.name}" a déjà un effet embarqué — vérifier avant relancer.`);
  }

  const effetId = genEffetId();
  const effetDoc = {
    _id: effetId,
    name: entry.effetName,
    img: doc.img,
    type: "base",
    system: { changes: entry.changes },
    disabled: false,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    description: entry.effetDescription,
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    folder: null,
    sort: 0,
    flags: {}
  };
  newEffetsLines.push(JSON.stringify(effetDoc));

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{${entry.effetName}}`;
  doc.system.description = doc.system.description + `<p>${uuidLink}</p>`;

  if (entry.selfEmbed) {
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
  }

  done++;
  return JSON.stringify(doc);
});

if (done !== ENTRIES.length) {
  throw new Error(`Attendu ${ENTRIES.length} avantages traités, obtenu ${done} — vérifier l'orthographe contre avantages.db.`);
}

fs.writeFileSync(effetsPath, effetsLines.concat(newEffetsLines).join("\n") + "\n", "utf-8");
fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
console.log(`Ajouté ${newEffetsLines.length} effets à ${effetsPath}, ${done} avantages liés (dont ${SELF_BUFFS.length} embarqués) dans ${avantagesPath}.`);

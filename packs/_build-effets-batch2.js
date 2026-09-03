/**
 * Build script : deuxième vague d'"effets simples" (todo_foundry.txt, section "Feature
 * antique", paliers -2/-3/-5 non couverts par _build-effets-simple.js le 1er septembre).
 * Même architecture que la première vague, mais embarque l'effet directement dès la
 * construction (au lieu d'un correctif de suivi séparé comme _embed-effets-simple-on-
 * advantages.js a dû le faire après coup) — ajoute pour chacun des 32 avantages :
 *   1. Un document ActiveEffect autonome dans packs/effets.db (narratif, sans `changes`,
 *      nom/description repris de l'avantage).
 *   2. Un lien @UUID[...] glissable à la fin de la description de l'avantage.
 *   3. L'effet embarqué directement sur l'avantage (onglet "Effets"), pour qu'il
 *      s'applique automatiquement tant que l'avantage est possédé.
 *
 * Run:  node packs/_build-effets-batch2.js
 * Propagation vers le monde déjà déployé : via le nouvel écran GM (module/apps/
 * pack-update-picker.mjs), pas une macro à coller — voir les entrées correspondantes
 * dans module/helpers/pack-updates.mjs.
 */
const fs = require("fs");
const path = require("path");

const SIMPLE_NAMES = [
  "Orientation", "Porte bouclier", "Don des langues", "Volonté de fer", "Maitre d'Arme",
  "Maitre des forges", "Faveur +", "Etincelle de Zeus", "Vision d'Héra", "Voix d'Athéna",
  "Moisson de Déméter", "Talent de Dionysos", "Flamme d'Hestia", "Lanterne d'Hécate",
  "Dieu de l'esquive", "Dieu du stade", "Dieu de la guerre", "Rageux", "Faveur ++",
  "Sang de Zeus", "Paume de Poséidon", "Esprit d'Athéna", "Armure d'Arès", "Blé de Déméter",
  "Oeil d'Apollon", "Compagnon d'Artèmis", "Yeux d'Héphaistos", "Murmure d'Aphrodite",
  "Message d'Hermes", "Amphore de Dionysos", "Bucher d'Héstia", "Lune d'Hécate"
];

const avantagesPath = path.join(__dirname, "avantages.db");
const effetsPath = path.join(__dirname, "effets.db");

const avantagesLines = fs.readFileSync(avantagesPath, "utf-8").split("\n").filter(Boolean);
const effetsLines = fs.readFileSync(effetsPath, "utf-8").split("\n").filter(Boolean);

let idCounter = effetsLines.length;
function genEffetId() {
  idCounter++;
  return "eEft" + String(idCounter).padStart(12, "0");
}

function generateEmbeddedId(seed) {
  return require("crypto").createHash("sha256").update(seed).digest("hex").substring(0, 16);
}

const newEffetsLines = [];
let done = 0;

const updatedAvantagesLines = avantagesLines.map(line => {
  const doc = JSON.parse(line);
  const cleanName = doc.name.replace(/^\(-?\d+\)\s*/, "");
  if (!SIMPLE_NAMES.includes(cleanName)) return line;
  if (doc.effects.length) throw new Error(`"${doc.name}" a déjà un effet embarqué — vérifier avant relancer.`);

  const effetId = genEffetId();
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

  doc.effects = [{
    _id: generateEmbeddedId(doc._id + "_embedded_effect"),
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

  done++;
  return JSON.stringify(doc);
});

if (done !== SIMPLE_NAMES.length) {
  throw new Error(`Attendu ${SIMPLE_NAMES.length} avantages traités, obtenu ${done} — vérifier l'orthographe contre avantages.db.`);
}

fs.writeFileSync(effetsPath, effetsLines.concat(newEffetsLines).join("\n") + "\n", "utf-8");
fs.writeFileSync(avantagesPath, updatedAvantagesLines.join("\n") + "\n", "utf-8");
console.log(`Ajouté ${newEffetsLines.length} effets à ${effetsPath}, ${done} avantages liés+embarqués dans ${avantagesPath}.`);

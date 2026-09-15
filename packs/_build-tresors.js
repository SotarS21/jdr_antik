/**
 * Build script: generates packs/tresors.db — a first batch of "treasure" items
 * (see module/data-models/items/item-treasure.mjs) representing loot a GM can hand
 * out: jewelry, scrolls, letters, statuettes, perfume, gems, plain pebbles, etc.
 *
 * Run:  node packs/_build-tresors.js
 */
const fs = require("fs");
const path = require("path");

let idCounter = 0;
function genId() {
  idCounter++;
  return "aTrs" + String(idCounter).padStart(12, "0");
}

// Each entry may set `gmNotes` — a hidden note only the GM sees on the item's own
// sheet (system.gmNotes, see item-treasure.mjs), e.g. a hook or true origin of the
// object that the players' visible description doesn't reveal.
const TREASURES = [
  {
    name: "Bijou orné",
    img: "icons/commodities/treasure/brooch-jewel-gold-blue.webp",
    price: "25 po", poids: 0.1,
    description: "<p>Une broche en or sertie d'une pierre bleue, travail délicat digne d'un atelier de cité.</p>"
  },
  {
    name: "Parchemin scellé",
    img: "icons/sundries/scrolls/scroll-bound-brown-tan.webp",
    price: "5 po", poids: 0.1,
    description: "<p>Un rouleau de parchemin fermé par un cordon, son contenu inconnu tant qu'il n'est pas ouvert.</p>",
    gmNotes: "<p>À définir par le MJ selon l'intrigue : une carte, un contrat, une prophétie...</p>"
  },
  {
    name: "Lettre cachetée",
    img: "icons/sundries/documents/document-letter-tan.webp",
    // Non-vide délibérément ("0 po", pas ""): l'onglet Équipement du Navigateur de
    // Compendium n'affiche que les objets avec un system.price non-vide (voir
    // compendium-browser.mjs, `priced = documents.filter(d => d.system?.price)`) —
    // une chaîne vide masquerait cet objet, purement narratif, du Navigateur.
    price: "0 po", poids: 0.05,
    description: "<p>Une lettre pliée, cachetée à la cire d'un sceau qu'on ne reconnaît pas.</p>",
    gmNotes: "<p>Auteur et contenu à définir par le MJ — un indice, un message codé, une correspondance privée.</p>"
  },
  {
    name: "Statuette à l'effigie d'un dieu",
    img: "icons/commodities/treasure/figurine-idol.webp",
    price: "15 po", poids: 0.5,
    description: "<p>Une petite statuette de marbre représentant une divinité de l'Olympe, offrande votive ou objet de culte domestique.</p>"
  },
  {
    name: "Flacon de parfum",
    img: "icons/consumables/potions/potion-vial-corked-labeled-purple.webp",
    price: "8 po", poids: 0.1,
    description: "<p>Un petit flacon de verre soufflé contenant une essence parfumée, importée de loin.</p>"
  },
  {
    name: "Pierre précieuse",
    img: "icons/commodities/gems/gem-faceted-diamond-blue.webp",
    price: "50 po", poids: 0.05,
    description: "<p>Une gemme taillée, dont la valeur dépend de sa pureté et de sa couleur.</p>"
  },
  {
    name: "Caillou",
    img: "icons/commodities/stone/stone-chunk-brown.webp",
    price: "0 po", poids: 0.05,
    description: "<p>Un simple caillou. Sans valeur marchande, sauf circonstance particulière.</p>",
    gmNotes: "<p>Objet narratif par défaut : à réserver aux cas où un \"trésor\" n'en est pas vraiment un.</p>"
  }
];

const docs = TREASURES.map(t => ({
  _id: genId(),
  name: t.name,
  type: "treasure",
  img: t.img,
  system: {
    quantity: 1,
    price: t.price,
    poids: t.poids,
    description: t.description,
    gmNotes: t.gmNotes ?? ""
  },
  effects: [],
  folder: null,
  sort: 0,
  ownership: { default: 0 },
  flags: {}
}));

const outPath = path.join(__dirname, "tresors.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");
console.log(`Wrote ${docs.length} treasure documents to ${outPath}`);

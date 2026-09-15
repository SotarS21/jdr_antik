/**
 * Build script: appends "Flèches empoisonnées" to the "Munition" folder of packs/armes.db —
 * same idiom as packs/_add-arbalete-munitions.js (pure append, no existing line touched).
 *
 * Run:  node packs/_add-fleche-empoisonnee.js
 * Companion live fix (already-deployed worlds): "0.6.96-create-fleche-empoisonnee" in
 * module/helpers/pack-updates.mjs.
 */
const fs = require("fs");
const path = require("path");

const MUNITION_FOLDER_ID = "fArm000000000120";
const NEW_ID = "aEqp000000000124"; // 1 past the highest id already used in armes.db (123)

const doc = {
  _id: NEW_ID,
  name: "Flèches empoisonnées",
  type: "equipment",
  img: "icons/weapons/ammunition/arrow-broadhead-green.webp",
  system: {
    quantity: 1,
    // Same reasoning as the other 3 munitions (see _add-arbalete-munitions.js): must be
    // true, or this item never appears in a weapon's "Munition liée" dropdown.
    consumable: true,
    caBonus: 0,
    healAmount: 0,
    linkedSkill: "",
    skillBonus: 0,
    slot: "",
    equipped: false,
    price: "3 po",
    poids: 0.02,
    apothCategory: "",
    apothType: "",
    isIngredientBag: false,
    description: "<p>Une flèche dont la pointe a été trempée dans un poison de contact.</p>",
    // No automated poison mechanic in this system yet (damage/save on hit isn't rolled
    // automatically for any weapon) — left as a GM-facing hook to resolve manually at
    // the table, same convention as the narrative Trésors (Parchemin scellé, Lettre
    // cachetée).
    gmNotes: "<p>Effet du poison à définir par le MJ (dégâts et/ou jet de sauvegarde " +
      "Robustesse) — non automatisé, à appliquer manuellement quand le tir touche.</p>"
  },
  effects: [],
  folder: MUNITION_FOLDER_ID,
  sort: 0,
  ownership: { default: 0 },
  flags: {}
};

const filePath = path.join(__dirname, "armes.db");
const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
fs.writeFileSync(filePath, [...lines, JSON.stringify(doc)].join("\n") + "\n", "utf-8");
console.log(`armes.db : ${lines.length} lignes existantes conservées, 1 nouvelle ajoutée (Flèches empoisonnées).`);

/**
 * Build script: generates packs/alchimie.db
 * from the "Consommable" sheet in "jonas antik.xlsx".
 *
 * Run:  node packs/_build-alchimie.js
 *
 * Creates equipment-type items organised in folders:
 *   - Ingrédients Communs
 *   - Ingrédients Peu Communs
 *   - Ingrédients Rares
 *   - Potions Bénéfiques
 *   - Potions Négatives
 */

const XLSX = require("./node_modules/xlsx");
const fs   = require("fs");
const path = require("path");

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let idCounter = 0;
function genId(prefix) {
  idCounter++;
  return prefix + String(idCounter).padStart(16 - prefix.length, "0");
}

function val(v) {
  return (v !== undefined && v !== null && String(v).trim() !== "") ? String(v).trim() : null;
}

/**
 * Parse price strings like "1 po/ 3", "10po/ 1", "5 po/5" → unit price in po.
 * Format: "{total} po/{quantity}" → totalPo / quantity
 * Returns a number (rounded to 2 decimals) or null if unparseable.
 */
function parseIngredientPrice(raw) {
  if (!raw || raw === "-") return null;
  const s = String(raw).replace(/\s+/g, "");
  // Match patterns like "1po/3", "10po/5", "3po/3"
  const m = s.match(/^(\d+)po\/(\d+)$/);
  if (!m) return null;
  const total = Number(m[1]);
  const qty   = Number(m[2]);
  if (qty === 0) return null;
  return Math.round((total / qty) * 100) / 100;
}

/**
 * Format a price as a nice string: "0.1 po", "1 po", "3.33 po"
 */
function fmtPrice(po) {
  if (po === null || po === undefined) return "—";
  if (Number.isInteger(po)) return `${po} po`;
  return `${po} po`;
}

/* ------------------------------------------------------------------ */
/*  Read Excel                                                         */
/* ------------------------------------------------------------------ */

const xlsxPath = path.resolve(__dirname, "../../jonas antik.xlsx");
if (!fs.existsSync(xlsxPath)) {
  console.error("File not found:", xlsxPath);
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["Consommable"];
if (!ws) {
  console.error("Sheet 'Consommable' not found. Available:", wb.SheetNames);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

/* ------------------------------------------------------------------ */
/*  Parse ingredients                                                  */
/* ------------------------------------------------------------------ */

const RARITY_MAP = {
  commun:     "Commun",
  peu:        "Peu commun",
  rare:       "Rare"
};

const ingredients = {
  "Commun":     [],
  "Peu commun": [],
  "Rare":       []
};

let currentRarity = null;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const c0 = val(row[0]);

  // Detect rarity header
  if (c0) {
    const lower = c0.toLowerCase();
    if (lower.startsWith("commun"))     currentRarity = "Commun";
    else if (lower.startsWith("peu"))   currentRarity = "Peu commun";
    else if (lower.startsWith("rare"))  currentRarity = "Rare";
    else if (lower === "potions")       break; // End of ingredients section
  }

  if (!currentRarity) continue;

  // Three columns of ingredients: [1,2,3], [4,5,6], [7,8,9]
  for (const offset of [1, 4, 7]) {
    const name = val(row[offset]);
    const desc = val(row[offset + 1]);
    const rawPrice = val(row[offset + 2]);
    if (!name) continue;

    const unitPrice = parseIngredientPrice(rawPrice);

    ingredients[currentRarity].push({
      name,
      type: desc || "",
      rawPrice: rawPrice || "",
      unitPrice
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Parse potions                                                      */
/* ------------------------------------------------------------------ */

const potions = {
  "Bénéfique": [],
  "Négative":  []
};

let currentPotionType = null;
let inPotions = false;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const c0 = val(row[0]);

  if (c0 === "Potions") { inPotions = true; continue; }
  if (!inPotions) continue;

  // Skip header row (Nom, Cout, ...)
  if (val(row[1]) === "Nom") continue;

  if (c0 === "Bénéfique")  currentPotionType = "Bénéfique";
  if (c0 === "Négative")   currentPotionType = "Négative";

  const name = val(row[1]);
  if (!name || !currentPotionType) continue;

  const ingredientList = val(row[2]) || "";
  const price = row[5] !== undefined ? Number(row[5]) : null;
  const effect = val(row[6]) || "";
  const quantity = row[11] !== undefined ? Number(row[11]) : 0;

  potions[currentPotionType].push({
    name,
    ingredients: ingredientList,
    price: (price !== null && !isNaN(price)) ? price : null,
    effect,
    quantity
  });
}

/* ------------------------------------------------------------------ */
/*  Log parsed data                                                    */
/* ------------------------------------------------------------------ */

console.log("Parsed ingredients:");
for (const [rarity, items] of Object.entries(ingredients)) {
  console.log(`  ${rarity}: ${items.length} items`);
}
console.log("Parsed potions:");
for (const [type, items] of Object.entries(potions)) {
  console.log(`  ${type}: ${items.length} items`);
}

/* ------------------------------------------------------------------ */
/*  HTML builders                                                      */
/* ------------------------------------------------------------------ */

function buildIngredientHtml(ing, rarity) {
  const lines = [];
  lines.push(`<h3>${ing.name}</h3>`);
  lines.push("<ul>");
  lines.push(`<li><strong>Type :</strong> ${ing.type}</li>`);
  lines.push(`<li><strong>Rareté :</strong> ${rarity}</li>`);
  if (ing.unitPrice !== null) {
    lines.push(`<li><strong>Prix :</strong> ${fmtPrice(ing.unitPrice)} (${ing.rawPrice})</li>`);
  }
  lines.push("</ul>");
  return lines.join("\n");
}

function buildPotionHtml(pot, type) {
  const lines = [];
  lines.push(`<h3>${pot.name}</h3>`);
  lines.push("<ul>");
  lines.push(`<li><strong>Type :</strong> Potion ${type}</li>`);
  if (pot.price !== null) lines.push(`<li><strong>Prix :</strong> ${pot.price} po</li>`);
  if (pot.ingredients) lines.push(`<li><strong>Ingrédients :</strong> ${pot.ingredients}</li>`);
  if (pot.effect) lines.push(`<li><strong>Effet :</strong> ${pot.effect}</li>`);
  if (pot.quantity > 0) lines.push(`<li><strong>Nombre de doses :</strong> ${pot.quantity}</li>`);
  lines.push("</ul>");
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Build NeDB documents                                               */
/* ------------------------------------------------------------------ */

const docs = [];

// --- Folder colors ---
const FOLDER_COLORS = {
  "Ingrédients Communs":     "#8B7355",
  "Ingrédients Peu Communs": "#6A5ACD",
  "Ingrédients Rares":       "#B22222",
  "Potions Bénéfiques":      "#2E8B57",
  "Potions Négatives":       "#8B0000"
};

// --- Ingredient folders & items ---
const rarityFolderNames = {
  "Commun":     "Ingrédients Communs",
  "Peu commun": "Ingrédients Peu Communs",
  "Rare":       "Ingrédients Rares"
};

const INGREDIENT_ICONS = {
  "Plante":          "icons/svg/oak.svg",
  "Herbe":           "icons/svg/oak.svg",
  "Fleur":           "icons/svg/oak.svg",
  "Champignon":      "icons/svg/oak.svg",
  "Arbre":           "icons/svg/oak.svg",
  "Baie":            "icons/svg/oak.svg",
  "Fruit":           "icons/svg/oak.svg",
  "Fruit exotique":  "icons/svg/oak.svg",
  "Extrait animal":  "icons/svg/pawprint.svg",
  "Liquide":         "icons/svg/waterfall.svg",
  "Artisanat":       "icons/svg/barrel.svg",
  "Minéral":         "icons/svg/mountain.svg",
  "Poison":          "icons/svg/skull.svg"
};

let itemCount = 0;

for (const [rarity, items] of Object.entries(ingredients)) {
  const folderName = rarityFolderNames[rarity];
  const folderId = genId("fAlc");

  docs.push({
    _id:     folderId,
    name:    folderName,
    type:    "Item",
    sort:    docs.length * 100000,
    sorting: "a",
    color:   FOLDER_COLORS[folderName] || "#666666",
    flags:   {},
    folder:  null
  });

  for (const ing of items) {
    const icon = INGREDIENT_ICONS[ing.type] || "icons/svg/item-bag.svg";
    const description = buildIngredientHtml(ing, rarity);

    docs.push({
      _id:       genId("iAlc"),
      name:      ing.name,
      type:      "equipment",
      img:       icon,
      system: {
        quantity:    1,
        consumable:  true,
        description: description,
        gmNotes:     ""
      },
      effects:   [],
      folder:    folderId,
      sort:      0,
      ownership: { default: 0 },
      flags:     {}
    });
    itemCount++;
  }
}

// --- Potion folders & items ---
const potionFolderNames = {
  "Bénéfique": "Potions Bénéfiques",
  "Négative":  "Potions Négatives"
};

for (const [type, items] of Object.entries(potions)) {
  const folderName = potionFolderNames[type];
  const folderId = genId("fAlc");

  docs.push({
    _id:     folderId,
    name:    folderName,
    type:    "Item",
    sort:    docs.length * 100000,
    sorting: "a",
    color:   FOLDER_COLORS[folderName] || "#666666",
    flags:   {},
    folder:  null
  });

  for (const pot of items) {
    const icon = type === "Bénéfique"
      ? "icons/svg/potion.svg"
      : "icons/svg/skull.svg";
    const description = buildPotionHtml(pot, type);

    docs.push({
      _id:       genId("iAlc"),
      name:      pot.name,
      type:      "equipment",
      img:       icon,
      system: {
        quantity:    pot.quantity || 1,
        consumable:  true,
        description: description,
        gmNotes:     ""
      },
      effects:   [],
      folder:    folderId,
      sort:      0,
      ownership: { default: 0 },
      flags:     {}
    });
    itemCount++;
  }
}

/* ------------------------------------------------------------------ */
/*  Write .db                                                          */
/* ------------------------------------------------------------------ */

const outPath = path.join(__dirname, "alchimie.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");

const folders = docs.filter(d => d.sorting);
console.log(`\nWrote ${docs.length} documents to ${outPath}`);
console.log(`  - ${folders.length} folders`);
console.log(`  - ${itemCount} equipment items`);

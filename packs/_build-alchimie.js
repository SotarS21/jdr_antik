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

// Per-item icon overrides, keyed by exact ingredient/potion name, picked from Foundry's
// bundled commodities/consumables/magic/tools/sundries art (verified to exist on disk under
// resources/app/public/icons/ in the local Foundry install — never guessed). Falls back to
// INGREDIENT_ICONS by "type" (or the potion defaults below) when a name has no entry here.
const SPECIFIC_ICONS = {
  // Communs
  "Absinthe":            "icons/consumables/drinks/wine-bottle-glass-white.webp",
  "Eau croupi":          "icons/consumables/drinks/water-jug-clay-brown.webp",
  "Orange":              "icons/consumables/fruit/orange-citrus-ripe.webp",
  "Anis":                "icons/consumables/plants/dill-herb-bundle-green.webp",
  "Eau de Rose":         "icons/commodities/flowers/rosaecia-red.webp",
  "Orties":              "icons/consumables/plants/leaf-serrated-pink.webp",
  "Argile Grise":        "icons/commodities/stone/clay-grey.webp",
  "Eau Stagnante":       "icons/consumables/drinks/water-jug-clay-brown.webp",
  "Os":                  "icons/commodities/bones/bone-simple-white.webp",
  "Armoise":             "icons/consumables/plants/dried-herb-bundle-brown.webp",
  "Estragon":            "icons/consumables/plants/herb-tied-bundle-green.webp",
  "Pissenlit":           "icons/commodities/flowers/dandelion-pod-white.webp",
  "Baie":                "icons/consumables/fruit/berries-hanging-red.webp",
  "Feuille de chêne":    "icons/consumables/plants/leaf-stem-bush-branch-green-brown.webp",
  "Plume d'oiseau":      "icons/commodities/materials/feather-white.webp",
  "Bardane":             "icons/consumables/plants/thorned-stem-vine-green.webp",
  "Fougère Flétrie":     "icons/consumables/plants/fern-broad-leaf-damaged-green.webp",
  "Poussière de roche":  "icons/commodities/stone/rock-pile-grey.webp",
  "Bougie":              "icons/sundries/lights/candle-unlit-tan.webp",
  "Grenade":             "icons/consumables/fruit/pomegranate-ripe-red.webp",
  "Raisin":              "icons/consumables/fruit/grapes-bunch-purple.webp",
  "Calendula":           "icons/commodities/flowers/flower-grey-orange.webp",
  "Gui":                 "icons/consumables/plants/holly-pointy-leaf-green.webp",
  "Rose":                "icons/commodities/flowers/rosaecia-red.webp",
  "Lavande":             "icons/commodities/flowers/blooms-purple.webp",
  "Rosée du Matin":      "icons/magic/water/orb-water-bubbles-teal.webp",
  "Champignon Comestible": "icons/consumables/mushrooms/crimini-button-brown.webp",
  "Lierre Vénéneux":     "icons/magic/nature/root-vine-thorns-poison-green.webp",
  "Sable":               "icons/commodities/stone/stone-chunk-tan.webp",
  "Menthe":              "icons/consumables/plants/mint-dried-green.webp",
  "Sauge":               "icons/consumables/plants/herb-marjoram-basil-oregano-leaf-bunch-green.webp",
  "Citron":              "icons/consumables/fruit/lemon-citrus-yellow.webp",
  "Miel":                "icons/consumables/food/honey-beehive-brown.webp",
  "Sel":                 "icons/consumables/food/salt-seasoning-spice-pink.webp",
  "Coton":               "icons/commodities/flowers/daisy-white.webp",
  "Mousse de Chêne":     "icons/commodities/stone/stone-chunk-moss-grey.webp",
  "Thym":                "icons/consumables/plants/herb-tied-bundle-yellow-green.webp",
  "Eau":                 "icons/magic/water/water-drop-swirl-blue.webp",
  "Mue":                 "icons/commodities/leather/scales-white.webp",
  "Vin":                 "icons/consumables/drinks/wine-amphora-clay-red.webp",
  "Eau claire":          "icons/magic/water/water-drop-swirl-blue.webp",
  "Olive":               "icons/consumables/fruit/olive-pitted-green.webp",
  // Peu communs
  "Acerola":             "icons/consumables/fruit/cherry-stemmed-red.webp",
  "Champignon Blanc":    "icons/consumables/mushrooms/convex-tan.webp",
  "Sureau":              "icons/consumables/fruit/berry-bunch-red-green.webp",
  "Bave d'escargot":     "icons/creatures/invertebrates/snail-movement-green.webp",
  "Lait de Pavot":       "icons/consumables/potions/vial-cork-empty.webp",
  "Valériane":           "icons/consumables/vegetable/root-brown-orange.webp",
  "Champignons Vénéneux": "icons/consumables/potions/conical-mushroom-poison-red.webp",
  "Larve d'insecte":     "icons/environment/creatures/bug-larva-orange.webp",
  "Vin Sucré":           "icons/consumables/drinks/wine-amphora-clay-pink.webp",
  "Clou de Girofle":     "icons/consumables/plants/dried-bay-leaf-yellow.webp",
  "Miel Frelaté":        "icons/consumables/food/honey-beehive-brown.webp",
  "Herbe à puce":        "icons/consumables/plants/leaf-eaten-holes-green.webp",
  "Echinacée":           "icons/commodities/flowers/daisies-pink.webp",
  "Parchemin":           "icons/sundries/documents/parchment-plain-tan.webp",
  "Eclat de corne":      "icons/commodities/bones/horn-jagged-grey.webp",
  "Poudre de Quartz":    "icons/commodities/gems/powder-raw-white.webp",
  "Écorce de Bouleau":   "icons/commodities/wood/bark-beige.webp",
  "Poussière d'os":      "icons/commodities/bones/bone-fragments-white.webp",
  "Epine de Ronce":      "icons/consumables/plants/thorned-stem-brown.webp",
  "Propolis":            "icons/consumables/food/honey-beehive-brown.webp",
  "Fleur Fanée":         "icons/commodities/flowers/buds-black.webp",
  "Racine de Pavot":     "icons/consumables/vegetable/root-alien-green.webp",
  "Ginseng":             "icons/consumables/vegetable/root-ginger-brown.webp",
  "Sel de Mer":          "icons/consumables/food/salt-seasoning-spice-pink.webp",
  // Rares
  "Amarantine":          "icons/commodities/flowers/blooms-pink.webp",
  "Plume de Paon":       "icons/commodities/materials/feather-colored-blue.webp",
  "Venin d'Insecte":     "icons/creatures/abilities/fang-tooth-poison-green.webp",
  "Belladone":           "icons/consumables/fruit/eggplant-ripe-purple.webp",
  "Poisson Pourri":      "icons/commodities/bones/bones-fish-brown.webp",
  "Venin de Serpent":    "icons/creatures/reptiles/snake-fangs-bite-green.webp",
  "Bezoar":              "icons/commodities/biological/organ-stomach.webp",
  "Poudre de Cristal":   "icons/commodities/treasure/glass-crystal-green.webp",
  "Buis":                "icons/consumables/plants/leaf-broad-blue.webp",
  "Poudre de verre":     "icons/commodities/materials/glass-cube.webp",
  "Champignon Narco":    "icons/consumables/mushrooms/helm-purple-shiny.webp",
  "Racine de Mandragore": "icons/consumables/vegetable/root-alien-purple.webp",
  "Champignon Noir":     "icons/consumables/mushrooms/umbontae-blue.webp",
  "Ricin":               "icons/consumables/nuts/nut-spiked-shell.webp",
  "Écaille de poisson":  "icons/commodities/leather/scales-blue.webp",
  "Sang de Taureau":     "icons/commodities/biological/organ-heart-red.webp",
  "Sève de Frêne":       "icons/commodities/wood/log-cut-ash-brown.webp",
  "Sève de Pin":         "icons/consumables/nuts/pine-cone-brown.webp",
  "Graine de Pavot":     "icons/commodities/materials/plant-seed-pod.webp",
  "Trêfle à 4 Feuille":  "icons/commodities/flowers/clover.webp",
  "Extrait du Poison":   "icons/creatures/abilities/fang-tooth-venomous.webp"
};

const POTION_ICONS = {
  "Breuvage du Colosse":       "icons/consumables/potions/vial-cork-red.webp",
  "Essence d'Acrobate":        "icons/consumables/potions/potion-vial-tube-yellow.webp",
  "Philtre de l'Ours":         "icons/consumables/potions/vial-cork-green.webp",
  "Liqueur du Vent":           "icons/consumables/potions/potion-flash-open-blue.webp",
  "Elixir de l'Orateur":       "icons/consumables/potions/potion-vial-corked-purple.webp",
  "Breuvage de l'Astre":       "icons/consumables/potions/vial-ornet-silver-black.webp",
  "Antidote Commun":           "icons/consumables/potions/vial-cork-empty.webp",
  "Potion Simple":             "icons/consumables/potions/bottle-round-empty-glass.webp",
  "Onguent de cicatrisation":  "icons/tools/laboratory/mortar-liquid-pink.webp",
  "Antidouleur":               "icons/consumables/potions/bottle-bulb-empty-glass.webp",
  "Onguent anti infection":    "icons/tools/laboratory/mortar-powder-green.webp",
  "Tisane de langueur":        "icons/tools/cooking/mortar-herbs-yellow.webp",
  "Thé d'Asclépsios":          "icons/tools/cooking/mortar-yellow.webp",
  "Essence du Brisé":          "icons/consumables/potions/potion-vial-corked-labeled-purple.webp",
  "Elixir du Frêle":           "icons/tools/laboratory/canister-glass-eyes-steel-green.webp",
  "Breuvage de la Tortue":     "icons/consumables/potions/vial-cork-green.webp",
  "Sève du Boiteux":           "icons/consumables/drinks/clay-jar-glowing-orange-blue.webp",
  "Sirop de Frêne":            "icons/commodities/wood/log-cut-ash-brown.webp",
  "Morsure du Serpent":        "icons/consumables/potions/round-decorated-snake-green.webp",
  "Plaie Ouverte":             "icons/tools/laboratory/mortar-liquid-pink.webp"
};

// Maps this script's rarity labels to system.apothCategory keys (CONFIG.ANTIQUE.apothCategories
// in config.mjs) so items land correctly in the Ingrédients tab and are purchasable from the
// Navigateur de Compendium (module/apps/compendium-browser.mjs) as soon as they're imported.
const RARITY_TO_APOTH_CATEGORY = {
  "Commun":     "ingredientCommun",
  "Peu commun": "ingredientPeuCommun",
  "Rare":       "ingredientRare"
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
    const icon = SPECIFIC_ICONS[ing.name] || INGREDIENT_ICONS[ing.type] || "icons/svg/item-bag.svg";
    const description = buildIngredientHtml(ing, rarity);

    docs.push({
      _id:       genId("iAlc"),
      name:      ing.name,
      type:      "equipment",
      img:       icon,
      system: {
        quantity:      1,
        consumable:    true,
        price:         ing.unitPrice !== null ? fmtPrice(ing.unitPrice) : "",
        apothCategory: RARITY_TO_APOTH_CATEGORY[rarity] || "",
        apothType:     ing.type || "",
        description:   description,
        gmNotes:       ""
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
    const icon = POTION_ICONS[pot.name] || (type === "Bénéfique"
      ? "icons/svg/potion.svg"
      : "icons/svg/skull.svg");
    const description = buildPotionHtml(pot, type);

    docs.push({
      _id:       genId("iAlc"),
      name:      pot.name,
      type:      "equipment",
      img:       icon,
      system: {
        quantity:      pot.quantity || 1,
        consumable:    true,
        price:         pot.price !== null ? `${pot.price} po` : "",
        apothCategory: "potion",
        apothType:     "",
        description:   description,
        gmNotes:       ""
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

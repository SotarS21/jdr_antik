/**
 * Build script: generates packs/sorts.db
 * from the "Magie magie" sheet in "jonas antik.xlsx".
 *
 * Run:  node packs/_build-sorts.js
 *
 * Creates spell-type items organised by 4 category folders:
 *  - Sorts de Druide (10 spells)
 *  - Rituels d'Hécate (8 rituals)
 *  - Sorts de Berserk — Camulos (7 spells)
 *  - Sorts de Morrigan (7 spells)
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
 * Parse a limitation string like "3 fois par jour" → 3, "Illimité" → 0, null → 0
 */
function parseLimitation(raw) {
  if (!raw) return 0;
  const s = String(raw).trim().toLowerCase();
  if (s === "illimité" || s === "illimite") return 0;
  const m = s.match(/^(\d+)/);
  if (m) return parseInt(m[1], 10);
  // Special case: "1 fois doit être récuperé..." → 1
  return 0;
}

/**
 * Parse a cost string to extract numeric PM cost.
 * "Rage + 2 P M" → 2, "5 P M" → 5, "2 P M et Sang" → 2, null → 0
 */
function parsePMCost(raw) {
  if (!raw) return 0;
  const s = String(raw).trim();
  const m = s.match(/(\d+)\s*P\s*M/i);
  if (m) return parseInt(m[1], 10);
  return 0;
}

/* ------------------------------------------------------------------ */
/*  Read Excel                                                         */
/* ------------------------------------------------------------------ */

const xlsxPath = path.resolve(__dirname, "../../jonas antik.xlsx");
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["Magie magie"];
if (!ws) {
  console.error("Sheet 'Magie magie' not found!");
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });

/* ------------------------------------------------------------------ */
/*  Parse spells by category                                           */
/* ------------------------------------------------------------------ */

const categories = [];
let current = null;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const c0 = val(row[0]);

  // Detect category headers
  if (c0 && /^Sort de druide$/i.test(c0)) {
    current = { name: "Sorts de Druide", type: "druide", spells: [] };
    categories.push(current);
    continue;
  }
  if (c0 && /^Rituel d'Hécate/i.test(c0)) {
    current = { name: "Rituels d'Hécate", type: "hecate", spells: [] };
    categories.push(current);
    continue;
  }
  if (c0 && /^Sort de Berserk/i.test(c0)) {
    current = { name: "Sorts de Berserk — Camulos", type: "berserk", spells: [] };
    categories.push(current);
    continue;
  }
  if (c0 && /^Sort de Morrigan/i.test(c0)) {
    current = { name: "Sorts de Morrigan", type: "morrigan", spells: [] };
    categories.push(current);
    continue;
  }

  // Skip header rows
  if (!current || !c0 || c0 === "Nom") continue;

  // Parse spell depending on category type
  if (current.type === "druide") {
    // Columns: A=Name, B=Cost(number), C=Description
    const cost = row[1] ? Number(row[1]) : 0;
    current.spells.push({
      name: c0,
      cost: cost,
      costText: "",
      ritual: false,
      description: val(row[2]) || "",
      effect: val(row[2]) || "",
      duration: "",
      limitation: 0
    });
  } else if (current.type === "hecate") {
    // Columns: A=Name, B=null, C=Cost(ingredients text), D=Description
    current.spells.push({
      name: c0,
      cost: 0,
      costText: val(row[2]) || "",
      ritual: true,
      description: val(row[3]) || "",
      effect: val(row[3]) || "",
      duration: "",
      limitation: 0
    });
  } else if (current.type === "berserk") {
    // Columns: A=Name, C=Cost, D=Description, I(8)=Duration, J(9)=Effect, P(15)=Limitation
    const rawCost = val(row[2]);
    current.spells.push({
      name: c0,
      cost: parsePMCost(rawCost),
      costText: rawCost || "",
      ritual: false,
      description: val(row[3]) || "",
      effect: val(row[9]) || val(row[3]) || "",
      duration: val(row[8]) || "",
      limitation: parseLimitation(val(row[15]))
    });
  } else if (current.type === "morrigan") {
    // Same wide layout: A=Name, C=Cost, D=Description, J(9)=Effect, P(15)=Limitation
    const rawCost = val(row[2]);
    current.spells.push({
      name: c0,
      cost: parsePMCost(rawCost),
      costText: rawCost && !/P\s*M/i.test(rawCost) ? rawCost : "",
      ritual: false,
      description: val(row[3]) || "",
      effect: val(row[9]) || val(row[3]) || "",
      duration: val(row[8]) || "",
      limitation: parseLimitation(val(row[15]))
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Build NeDB documents                                               */
/* ------------------------------------------------------------------ */

const FOLDER_COLORS = {
  "Sorts de Druide": "#2E8B57",
  "Rituels d'Hécate": "#8B008B",
  "Rituels": "#6A0DAD",
  "Sorts de Berserk — Camulos": "#B22222",
  "Sorts de Morrigan": "#1C1C1C"
};

const FOLDER_ICONS = {
  "druide": "icons/svg/oak.svg",
  "hecate": "icons/svg/fire.svg",
  "berserk": "icons/svg/sword.svg",
  "morrigan": "icons/svg/skull.svg"
};

const docs = [];
let itemCount = 0;

// Create top-level "Rituels" folder first
const rituelsFolderId = genId("fSrt");
docs.push({
  _id:     rituelsFolderId,
  name:    "Rituels",
  type:    "Item",
  sort:    0,
  sorting: "a",
  color:   FOLDER_COLORS["Rituels"] || "#6A0DAD",
  flags:   {},
  folder:  null
});

for (const cat of categories) {
  // Ritual categories go inside the "Rituels" parent folder
  const isRitualCategory = (cat.type === "hecate");
  const parentFolder = isRitualCategory ? rituelsFolderId : null;

  // Create category folder
  const folderId = genId("fSrt");
  docs.push({
    _id:     folderId,
    name:    cat.name,
    type:    "Item",
    sort:    docs.length * 100000,
    sorting: "a",
    color:   FOLDER_COLORS[cat.name] || "#666666",
    flags:   {},
    folder:  parentFolder
  });

  for (const spell of cat.spells) {
    const lim = spell.limitation;

    // Build HTML description
    const descParts = [];
    descParts.push(`<p>${spell.description}</p>`);
    if (spell.duration) descParts.push(`<p><strong>Durée :</strong> ${spell.duration}</p>`);
    if (spell.effect && spell.effect !== spell.description) {
      descParts.push(`<p><strong>Effet :</strong> ${spell.effect}</p>`);
    }

    docs.push({
      _id:       genId("sSrt"),
      name:      spell.name,
      type:      "spell",
      img:       FOLDER_ICONS[cat.type] || "icons/svg/mystery-man.svg",
      system: {
        effect:          spell.effect.length > 120 ? spell.effect.substring(0, 120) + "…" : spell.effect,
        cost:            spell.cost,
        ritual:          spell.ritual,
        costText:        spell.costText,
        limitation:      lim,
        limitationValue: lim,
        range:           "",
        duration:        spell.duration,
        components:      spell.ritual ? spell.costText : "",
        description:     descParts.join("\n"),
        gmNotes:         ""
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

const outPath = path.join(__dirname, "sorts.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");

const folders = docs.filter(d => d.sorting);
console.log(`Wrote ${docs.length} documents to ${outPath}`);
console.log(`  - ${folders.length} category folders`);
console.log(`  - ${itemCount} spell items`);
for (const cat of categories) {
  console.log(`  - ${cat.name}: ${cat.spells.length} sorts`);
}

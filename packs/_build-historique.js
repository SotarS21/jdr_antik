/**
 * Build script: generates packs/historique.db from "jonas antik.xlsx"
 *
 * Run:  node packs/_build-historique.js
 * Requires: the xlsx module already installed in packs/node_modules
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

/* ------------------------------------------------------------------ */
/*  Read the Excel file                                                */
/* ------------------------------------------------------------------ */

const xlsxPath = path.resolve(__dirname, "../../jonas antik.xlsx");
if (!fs.existsSync(xlsxPath)) {
  console.error("File not found:", xlsxPath);
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["historique jet\u00e9"]; // "historique jeté"
if (!ws) {
  console.error("Sheet 'historique jeté' not found. Available:", wb.SheetNames);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

/* ------------------------------------------------------------------ */
/*  Parse data                                                         */
/* ------------------------------------------------------------------ */

const origins = [];
const bonusCols = [[], [], [], []];

for (const row of rows) {
  const rollOrigin = Number(row[0]);
  const origin     = (row[1] || "").toString().trim();
  const rollBonus  = Number(row[3]);
  const bm         = [row[4], row[5], row[6], row[7]].map(v =>
    (v || "").toString().trim()
  );

  if (!isNaN(rollOrigin) && rollOrigin >= 1 && rollOrigin <= 100 && origin) {
    origins.push({ roll: rollOrigin, text: origin });
  }

  if (!isNaN(rollBonus) && rollBonus >= 1 && rollBonus <= 100) {
    for (let i = 0; i < 4; i++) {
      if (bm[i]) bonusCols[i].push({ roll: rollBonus, text: bm[i] });
    }
  }
}

console.log(`Parsed ${origins.length} origins`);
for (let i = 0; i < 4; i++) {
  console.log(`Parsed ${bonusCols[i].length} entries for bonus/malus column ${i + 1}`);
}

/* ------------------------------------------------------------------ */
/*  Build NeDB documents                                               */
/* ------------------------------------------------------------------ */

const docs = [];

// --- Folders ---
const folderOrigine = {
  _id:      genId("fHist"),
  name:     "Origine",
  type:     "RollTable",
  sort:     100000,
  sorting:  "a",
  color:    "#8B4513",
  flags:    {},
  folder:   null
};

const folderBonus = {
  _id:      genId("fHist"),
  name:     "Bonus/Malus al\u00e9atoire",
  type:     "RollTable",
  sort:     200000,
  sorting:  "a",
  color:    "#4169E1",
  flags:    {},
  folder:   null
};

docs.push(folderOrigine, folderBonus);

// --- Helper: build a RollTable document ---
function makeTable(name, description, entries, folderId, sortOrder) {
  const results = entries.map((e, idx) => ({
    _id:                 genId("rHist"),
    type:                0,          // 0 = text result
    text:                e.text,
    img:                 "icons/svg/d20-black.svg",
    range:               [e.roll, e.roll],
    drawn:               false,
    weight:              1,
    documentCollection:  "",
    documentId:          "",
    flags:               {}
  }));

  return {
    _id:          genId("tHist"),
    name:         name,
    img:          "icons/svg/d20-black.svg",
    description:  `<p>${description}</p>`,
    results:      results,
    formula:      "1d100",
    replacement:  true,
    displayRoll:  true,
    folder:       folderId,
    sort:         sortOrder,
    ownership:    { default: 0 },
    flags:        {},
    _stats:       {
      systemId:       "antique",
      systemVersion:  "0.5.0",
      coreVersion:    "12.331",
      createdTime:    Date.now(),
      modifiedTime:   Date.now(),
      lastModifiedBy: "buildScript"
    }
  };
}

// --- Origine table ---
docs.push(makeTable(
  "Origine du personnage",
  "Table al\u00e9atoire d\u2019origine \u00e0 la cr\u00e9ation du personnage (1d100).",
  origins,
  folderOrigine._id,
  0
));

// --- 4 Bonus/Malus tables ---
const bmLabels = [
  "Bonus/Malus al\u00e9atoire 1",
  "Bonus/Malus al\u00e9atoire 2",
  "Bonus/Malus al\u00e9atoire 3",
  "Bonus/Malus al\u00e9atoire 4"
];

for (let i = 0; i < 4; i++) {
  docs.push(makeTable(
    bmLabels[i],
    `Table al\u00e9atoire de bonus ou malus n\u00b0${i + 1} \u00e0 la cr\u00e9ation du personnage (1d100).`,
    bonusCols[i],
    folderBonus._id,
    i
  ));
}

/* ------------------------------------------------------------------ */
/*  Write the .db file                                                 */
/* ------------------------------------------------------------------ */

const outPath = path.join(__dirname, "historique.db");
const content = docs.map(d => JSON.stringify(d)).join("\n") + "\n";
fs.writeFileSync(outPath, content, "utf-8");

console.log(`\nWrote ${docs.length} documents to ${outPath}`);
console.log("  - 2 folders");
console.log("  - 1 table Origine");
console.log("  - 4 tables Bonus/Malus");

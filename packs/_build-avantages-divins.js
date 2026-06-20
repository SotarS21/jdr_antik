/**
 * Build script: generates packs/avantages-divins.db
 * from the "Avantage divin" sheet in "jonas antik.xlsx".
 *
 * Run:  node packs/_build-avantages-divins.js
 *
 * Creates blessing-type items organised by pantheon folder,
 * one item per god per available relationship type
 * (Demi-dieu, Héraut, Dévot, Aimé, Haï).
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

function yes(v) {
  return v && /^oui$/i.test(String(v).trim());
}

function val(v) {
  return (v !== undefined && v !== null && String(v).trim() !== "") ? String(v).trim() : null;
}

/* ------------------------------------------------------------------ */
/*  Read Excel                                                         */
/* ------------------------------------------------------------------ */

const xlsxPath = path.resolve(__dirname, "../../jonas antik.xlsx");
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["Avantage divin"];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

/* ------------------------------------------------------------------ */
/*  Parse gods by pantheon                                             */
/* ------------------------------------------------------------------ */

const pantheons = [];
let currentPantheon = null;

for (const row of rows) {
  const c0 = val(row[0]);
  const c1 = val(row[1]);

  // Detect pantheon header rows (no god name in col 1)
  if (c0 && !c1 && /dieux/i.test(c0)) {
    currentPantheon = { name: c0, gods: [] };
    pantheons.push(currentPantheon);
    continue;
  }

  // Skip header rows
  if (!currentPantheon || !c1 || c1 === "Noms") continue;

  const god = {
    jet:  c0 || "/",
    name: c1,
    // --- Demi-dieu ---
    demiDieu: yes(row[2]),
    dd: {
      carac2: val(row[3]),  carac1a: val(row[4]), carac1b: val(row[5]),
      comp2:  val(row[6]),  comp1a:  val(row[7]), comp1b:  val(row[8]),
      coche1: val(row[9]),  coche2:  val(row[10]), coche3: val(row[11]),
      bene: val(row[12])
    },
    // --- Héraut ---
    heraut: yes(row[13]),
    he: {
      carac2: val(row[14]), carac1: val(row[15]),
      comp2:  val(row[16]), comp1:  val(row[17]),
      coche1: val(row[18]), coche2: val(row[19]),
      bene: val(row[20])
    },
    // --- Dévot ---
    devot: yes(row[21]),
    dv: {
      sexe:   val(row[22]),
      metier: val(row[23]),
      carac1a: val(row[24]), carac1b: val(row[25]),
      comp1a:  val(row[26]), comp1b:  val(row[27]),
      coche1:  val(row[28]), coche2:  val(row[29]),
      bene: val(row[30])
    },
    // --- Aimé ---
    aime: yes(row[31]),
    ai: {
      carac1: val(row[32]),
      comp1:  val(row[33]),
      coche1: val(row[34]), coche2: val(row[35]),
      bene: val(row[36])
    },
    // --- Haï ---
    hai: yes(row[37]),
    ha: {
      carac1: val(row[38]),
      comp1:  val(row[39]),
      male: val(row[40])
    }
  };

  currentPantheon.gods.push(god);
}

/* ------------------------------------------------------------------ */
/*  HTML builders                                                      */
/* ------------------------------------------------------------------ */

function li(label, value) {
  return value ? `<li><strong>${label} :</strong> ${value}</li>` : "";
}

function buildDemiDieuHtml(g) {
  const d = g.dd;
  const lines = [];
  lines.push(`<h3>Demi-dieu de ${g.name}</h3>`);
  lines.push("<ul>");
  lines.push(li("Caractéristique +2", d.carac2));
  if (d.carac1a || d.carac1b) {
    const parts = [d.carac1a, d.carac1b].filter(Boolean);
    lines.push(li("Caractéristique +1", parts.join(", ")));
  }
  lines.push(li("Compétence +2", d.comp2));
  if (d.comp1a || d.comp1b) {
    const parts = [d.comp1a, d.comp1b].filter(Boolean);
    lines.push(li("Compétence +1", parts.join(", ")));
  }
  const coches = [d.coche1, d.coche2, d.coche3].filter(Boolean);
  if (coches.length) lines.push(li("Compétences cochées", coches.join(", ")));
  lines.push(li("Bénédictions", d.bene));
  lines.push("</ul>");
  return lines.join("\n");
}

function buildHerautHtml(g) {
  const h = g.he;
  const lines = [];
  lines.push(`<h3>Héraut de ${g.name}</h3>`);
  lines.push("<ul>");
  lines.push(li("Caractéristique +2", h.carac2));
  lines.push(li("Caractéristique +1", h.carac1));
  lines.push(li("Compétence +2", h.comp2));
  lines.push(li("Compétence +1", h.comp1));
  const coches = [h.coche1, h.coche2].filter(Boolean);
  if (coches.length) lines.push(li("Compétences cochées", coches.join(", ")));
  lines.push(li("Bénédictions", h.bene));
  lines.push("</ul>");
  return lines.join("\n");
}

function buildDevotHtml(g) {
  const d = g.dv;
  const lines = [];
  lines.push(`<h3>Dévot de ${g.name}</h3>`);
  lines.push("<ul>");
  if (d.sexe) lines.push(li("Sexe requis", d.sexe));
  if (d.metier) lines.push(li("Condition", d.metier));
  if (d.carac1a || d.carac1b) {
    const parts = [d.carac1a, d.carac1b].filter(Boolean);
    lines.push(li("Caractéristique +1", parts.join(", ")));
  }
  if (d.comp1a || d.comp1b) {
    const parts = [d.comp1a, d.comp1b].filter(Boolean);
    lines.push(li("Compétence +1", parts.join(", ")));
  }
  const coches = [d.coche1, d.coche2].filter(Boolean);
  if (coches.length) lines.push(li("Compétences cochées", coches.join(", ")));
  lines.push(li("Bénédictions", d.bene));
  lines.push("</ul>");
  return lines.join("\n");
}

function buildAimeHtml(g) {
  const a = g.ai;
  const lines = [];
  lines.push(`<h3>Aimé de ${g.name}</h3>`);
  lines.push("<ul>");
  lines.push(li("Caractéristique +1", a.carac1));
  lines.push(li("Compétence +1", a.comp1));
  const coches = [a.coche1, a.coche2].filter(Boolean);
  if (coches.length) lines.push(li("Compétences cochées", coches.join(", ")));
  lines.push(li("Bénédictions", a.bene));
  lines.push("</ul>");
  return lines.join("\n");
}

function buildHaiHtml(g) {
  const h = g.ha;
  const lines = [];
  lines.push(`<h3>Haï de ${g.name}</h3>`);
  lines.push("<ul>");
  lines.push(li("Caractéristique −1", h.carac1));
  lines.push(li("Compétence −1", h.comp1));
  lines.push(li("Malédictions", h.male));
  lines.push("</ul>");
  return lines.join("\n");
}

function buildEffectSummary(type, g) {
  switch (type) {
    case "demiDieu": {
      const d = g.dd;
      const parts = [];
      if (d.carac2) parts.push(`${d.carac2} +2`);
      [d.carac1a, d.carac1b].filter(Boolean).forEach(c => parts.push(`${c} +1`));
      if (d.comp2) parts.push(`${d.comp2} +2`);
      [d.comp1a, d.comp1b].filter(Boolean).forEach(c => parts.push(`${c} +1`));
      const coches = [d.coche1, d.coche2, d.coche3].filter(Boolean);
      if (coches.length) parts.push(`Coches : ${coches.join(", ")}`);
      if (d.bene) parts.push(`${d.bene} bénédiction(s)`);
      return parts.join(" | ");
    }
    case "heraut": {
      const h = g.he;
      const parts = [];
      if (h.carac2) parts.push(`${h.carac2} +2`);
      if (h.carac1) parts.push(`${h.carac1} +1`);
      if (h.comp2) parts.push(`${h.comp2} +2`);
      if (h.comp1) parts.push(`${h.comp1} +1`);
      const coches = [h.coche1, h.coche2].filter(Boolean);
      if (coches.length) parts.push(`Coches : ${coches.join(", ")}`);
      if (h.bene) parts.push(`${h.bene} bénédiction(s)`);
      return parts.join(" | ");
    }
    case "devot": {
      const d = g.dv;
      const parts = [];
      [d.carac1a, d.carac1b].filter(Boolean).forEach(c => parts.push(`${c} +1`));
      [d.comp1a, d.comp1b].filter(Boolean).forEach(c => parts.push(`${c} +1`));
      const coches = [d.coche1, d.coche2].filter(Boolean);
      if (coches.length) parts.push(`Coches : ${coches.join(", ")}`);
      if (d.bene) parts.push(`${d.bene} bénédiction(s)`);
      if (d.sexe) parts.push(`Sexe : ${d.sexe}`);
      if (d.metier) parts.push(`Condition : ${d.metier}`);
      return parts.join(" | ");
    }
    case "aime": {
      const a = g.ai;
      const parts = [];
      if (a.carac1) parts.push(`${a.carac1} +1`);
      if (a.comp1) parts.push(`${a.comp1} +1`);
      const coches = [a.coche1, a.coche2].filter(Boolean);
      if (coches.length) parts.push(`Coches : ${coches.join(", ")}`);
      if (a.bene) parts.push(`${a.bene} bénédiction(s)`);
      return parts.join(" | ");
    }
    case "hai": {
      const h = g.ha;
      const parts = [];
      if (h.carac1) parts.push(`${h.carac1} −1`);
      if (h.comp1) parts.push(`${h.comp1} −1`);
      if (h.male) parts.push(`${h.male} malédiction(s)`);
      return parts.join(" | ");
    }
  }
  return "";
}

/* ------------------------------------------------------------------ */
/*  Build NeDB documents                                               */
/* ------------------------------------------------------------------ */

const docs = [];
const RELATION_TYPES = [
  { key: "demiDieu", label: "Demi-dieu",  icon: "icons/svg/angel.svg",    html: buildDemiDieuHtml },
  { key: "heraut",   label: "Héraut",     icon: "icons/svg/eye.svg",      html: buildHerautHtml },
  { key: "devot",    label: "Dévot",      icon: "icons/svg/holy-shield.svg", html: buildDevotHtml },
  { key: "aime",     label: "Aimé",       icon: "icons/svg/sun.svg",      html: buildAimeHtml },
  { key: "hai",      label: "Haï",        icon: "icons/svg/skull.svg",    html: buildHaiHtml },
];

const PANTHEON_COLORS = {
  "Dieux Majeurs Grecs":     "#DAA520",
  "Dieux Majeurs Egyptiens": "#CD853F",
  "Dieux Majeurs Celtes":    "#2E8B57",
  "Dieux Majeurs Nordique":  "#4682B4",
};

let itemCount = 0;

for (const pantheon of pantheons) {
  // Create pantheon folder
  const pantheonFolderId = genId("fDiv");
  docs.push({
    _id:     pantheonFolderId,
    name:    pantheon.name,
    type:    "Item",
    sort:    docs.length * 100000,
    sorting: "a",
    color:   PANTHEON_COLORS[pantheon.name] || "#666666",
    flags:   {},
    folder:  null
  });

  for (const god of pantheon.gods) {
    // Check which relationship types have real data
    for (const rel of RELATION_TYPES) {
      let available = false;
      let hasData = false;

      if (rel.key === "demiDieu") {
        available = god.demiDieu;
        hasData = !!god.dd.carac2;
      } else if (rel.key === "heraut") {
        available = god.heraut;
        hasData = !!god.he.carac2 || !!god.he.comp2;
      } else if (rel.key === "devot") {
        available = god.devot;
        hasData = !!god.dv.carac1a || !!god.dv.comp1a;
      } else if (rel.key === "aime") {
        available = god.aime;
        hasData = !!god.ai.carac1 || !!god.ai.comp1;
      } else if (rel.key === "hai") {
        available = god.hai;
        hasData = !!god.ha.carac1 || !!god.ha.comp1;
      }

      if (!available || !hasData) continue;

      const itemName = `${god.name} — ${rel.label}`;
      const description = rel.html(god);
      const effect = buildEffectSummary(rel.key, god);

      docs.push({
        _id:       genId("aDvn"),
        name:      itemName,
        type:      "blessing",
        img:       rel.icon,
        system: {
          effect:      effect,
          description: description,
          gmNotes:     ""
        },
        effects:   [],
        folder:    pantheonFolderId,
        sort:      0,
        ownership: { default: 0 },
        flags:     {}
      });
      itemCount++;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Write .db                                                          */
/* ------------------------------------------------------------------ */

const outPath = path.join(__dirname, "avantages-divins.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");

const folders = docs.filter(d => d.sorting);
console.log(`Wrote ${docs.length} documents to ${outPath}`);
console.log(`  - ${folders.length} pantheon folders`);
console.log(`  - ${itemCount} blessing items`);
for (const p of pantheons) {
  console.log(`  - ${p.name}: ${p.gods.length} dieux`);
}

/**
 * One-off patch (source-only, like _fix-equipement-armor-price.js): populates
 * `system.ingredients` on the 8 ritual spells in packs/sorts.db by parsing their
 * existing `system.costText` (e.g. "Anis/ Bougie" -> 2 ingredient entries), so the
 * "Ingrédients" tab becomes the real source of truth instead of the free-text
 * costText match in AntiqueItem#castSpell() (see JOURNAL.md, 31 août 2026).
 *
 * Does NOT touch any other field, and never regenerates the whole file from the
 * Excel source (not available locally) — ids/ordering of every document stay
 * exactly as they are, only `system.ingredients` is added where currently empty.
 *
 * Run:  node packs/_fix-sorts-ritual-ingredients.js
 */
const fs = require("fs");
const path = require("path");

function parseIngredients(costText) {
  if (!costText) return [];
  return costText.split("/")
    .map(name => name.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `ing${i + 1}`, name, quantity: 1, possede: false }));
}

const dbPath = path.join(__dirname, "sorts.db");
const lines = fs.readFileSync(dbPath, "utf-8").split("\n");

let patched = 0;
const out = lines.map(line => {
  if (!line.trim()) return line;
  const doc = JSON.parse(line);
  if (doc.type === "spell" && doc.system?.ritual && doc.system?.costText
      && (!doc.system.ingredients || doc.system.ingredients.length === 0)) {
    doc.system.ingredients = parseIngredients(doc.system.costText);
    patched++;
    console.log(`Patched "${doc.name}": ${doc.system.ingredients.map(i => i.name).join(", ")}`);
  }
  return JSON.stringify(doc);
});

fs.writeFileSync(dbPath, out.join("\n"), "utf-8");
console.log(`\n${patched} rituel(s) patché(s) dans ${dbPath}.`);

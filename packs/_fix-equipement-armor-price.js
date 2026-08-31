/**
 * One-off migration: packs/equipement.db has no system.price data anywhere (unlike armes.db,
 * which had it in the source Excel but just never wired to system.price — see _build-armes.js).
 * For the 9 genuine Greek-named armor/shield pieces below there is no price source at all
 * (not in the Excel, not in the description) — per explicit instruction, set price to "0 po"
 * as a placeholder so they can show up (and be taken for free) in the Compendium Browser
 * until real prices exist. Everything else in equipement.db (20 items duplicating Alchimie's
 * own potions by name, 21 other unpriced consumables/gear) is deliberately left untouched:
 * no price means it stays out of the browser's "only items with a price" filter, avoiding
 * both fabricated numbers and duplicate entries against Alchimie.
 *
 * Run:  node packs/_fix-equipement-armor-price.js
 */

const fs = require("fs");
const path = require("path");

const ARMOR_NAMES = new Set([
  "Linothorax",
  "Thorax de cuir",
  "Cuirasse de bronze",
  "Armure d'hoplite complète",
  "Casque corinthien",
  "Casque chalcidien",
  "Cnémides de bronze",
  "Aspis (bouclier rond)",
  "Peltè (bouclier léger)"
]);

const dbPath = path.join(__dirname, "equipement.db");
const lines = fs.readFileSync(dbPath, "utf-8").split("\n").filter(Boolean);

let updated = 0;
const out = lines.map(line => {
  const doc = JSON.parse(line);
  if (doc.type === "equipment" && ARMOR_NAMES.has(doc.name)) {
    doc.system.price = "0 po";
    updated++;
  }
  return JSON.stringify(doc);
});

fs.writeFileSync(dbPath, out.join("\n") + "\n", "utf-8");
console.log(`Updated ${updated} / ${ARMOR_NAMES.size} armor items with a placeholder price.`);
if (updated !== ARMOR_NAMES.size) {
  console.warn("Some expected armor names were not found — check for a name mismatch.");
}

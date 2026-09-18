/**
 * One-off fixes from the 2026-09-18 full-codebase audit — corrects the NDJSON `.db`
 * source files directly (plain text, one JSON document per line; see JOURNAL.md for
 * why this is safe to hand-edit, unlike the compiled LevelDB folders).
 *
 * - equipement.db: 8 potions used the non-existent `icons/svg/flask.svg` (404 in game,
 *   same class of bug as the historical potion.svg fix) — reassigned to real, already
 *   in-production potion icons (verified present in the local Foundry v14 install).
 * - capacites-combat.db / creatures.db: "Combattant aquatique" / "Triton" used the
 *   non-existent `icons/svg/water.svg` — reassigned to `icons/svg/waterfall.svg`
 *   (verified present).
 * - pnj.db: Éphise carries a stray `system.bonusSexe` field left over from an
 *   abandoned mechanic, absent from the current AntiqueCharacter schema — removed.
 *
 * Run once: `node packs/_fix-audit-2026-09-18.js`, then `node packs/_build-leveldb-*.js`
 * equivalents are NOT needed here (no structural/folder change, single field edits only)
 * — the already-deployed compendium copies are fixed separately via a new PACK_UPDATES
 * entry (module/helpers/pack-updates.mjs), same mechanism as every prior "already
 * deployed" content fix.
 */
const fs = require("fs");
const path = require("path");

function editLines(file, edits) {
  const full = path.join(__dirname, file);
  const lines = fs.readFileSync(full, "utf8").split("\n");
  let changed = 0;
  const out = lines.map(line => {
    if (!line.trim()) return line;
    const doc = JSON.parse(line);
    const edit = edits[doc._id];
    if (!edit) return line;
    edit(doc);
    changed++;
    return JSON.stringify(doc);
  });
  fs.writeFileSync(full, out.join("\n"));
  console.log(`${file}: ${changed} document(s) modifié(s).`);
}

editLines("equipement.db", {
  aEqp000000000031: d => { d.img = "icons/consumables/potions/bottle-bulb-empty-glass.webp"; },
  aEqp000000000032: d => { d.img = "icons/consumables/potions/potion-vial-tube-yellow.webp"; },
  aEqp000000000033: d => { d.img = "icons/consumables/potions/vial-cork-red.webp"; },
  aEqp000000000034: d => { d.img = "icons/consumables/potions/potion-flash-open-blue.webp"; },
  aEqp000000000035: d => { d.img = "icons/consumables/potions/vial-ornet-silver-black.webp"; },
  aEqp000000000036: d => { d.img = "icons/consumables/potions/round-decorated-snake-green.webp"; },
  aEqp000000000038: d => { d.img = "icons/consumables/potions/potion-vial-corked-labeled-purple.webp"; },
  aEqp000000000040: d => { d.img = "icons/consumables/potions/vial-cork-green.webp"; },
});

editLines("capacites-combat.db", {
  aNca000000000016: d => { d.img = "icons/svg/waterfall.svg"; },
});

editLines("creatures.db", {
  aCrt000000000014: d => { d.img = "icons/svg/waterfall.svg"; },
});

editLines("pnj.db", {
  aPnj000000000001: d => { delete d.system.bonusSexe; },
});

/**
 * Regenerates a `packs/_json-mirrors/<name>.json` mirror of every `packs/<name>.db`
 * source file — byte-identical NDJSON content, just a different extension, in a
 * dedicated subfolder (deliberately NOT alongside the .db files: this `packs/` folder
 * already has several pre-existing, unrelated bare-named `.json` files from older
 * one-off inspection/import scripts — first version of this script collided with two
 * of them, one of which was a tracked file with real content that had to be restored
 * from git; never reuse a bare `packs/<name>.json` path here again).
 *
 * Needed because current Foundry versions return HTTP 403 on a direct static-file
 * fetch of `.db`/LevelDB-family extensions (an anti-leak measure for compendium data),
 * which broke `overwriteSystemCompendiums()` in module/helpers/version-check.mjs (the
 * "Écraser mes compendiums" button on the version-update dialog) — it fetches these
 * files over HTTP to reseed a world's compendiums with the shipped content. `.json`
 * isn't on that blocklist, so version-check.mjs fetches the mirror instead.
 *
 * Run automatically by the `deploy` skill before every Copy-Item, so the mirrors can
 * never go stale relative to whatever `.db` sources a session just edited/rebuilt — no
 * manual step to remember. Safe to also run by hand: `node packs/_sync-json-mirrors.js`.
 */
const fs = require("fs");
const path = require("path");

const packsDir = __dirname;
const mirrorDir = path.join(packsDir, "_json-mirrors");
if (!fs.existsSync(mirrorDir)) fs.mkdirSync(mirrorDir);

const dbFiles = fs.readdirSync(packsDir).filter(f => f.endsWith(".db"));

let count = 0;
for (const dbFile of dbFiles) {
  const jsonFile = dbFile.replace(/\.db$/, ".json");
  fs.copyFileSync(path.join(packsDir, dbFile), path.join(mirrorDir, jsonFile));
  count++;
}

console.log(`${count} mirror(s) .json régénéré(s) dans packs/_json-mirrors/ depuis packs/*.db.`);

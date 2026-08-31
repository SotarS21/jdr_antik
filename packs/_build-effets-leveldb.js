/**
 * Builds the live LevelDB compendium folder packs/effets/ from the flat NDJSON
 * source packs/effets.db — same convention as every other compendium in this repo
 * (packs/*.db is a readable build source, never loaded directly by Foundry; the
 * real live compendium is the LevelDB folder deployed alongside it, see
 * JOURNAL.md). No folder grouping needed for this small starter batch (unlike
 * avantages/_build-leveldb.js, which groups by cost) — flat list of documents.
 *
 * Key prefix "!effects!" — this pack holds top-level ActiveEffect documents (system
 * type "ActiveEffect" in system.json), not Item. Foundry keys every compendium
 * document by its document type's `metadata.collection` name (confirmed in
 * common/documents/active-effect.mjs: `collection: "effects"`), the same way an
 * Item pack uses "!items!" and a RollTable pack uses "!tables!".
 *
 * Run:  node packs/_build-effets-leveldb.js
 */
const { ClassicLevel } = require("classic-level");
const fs = require("fs");
const path = require("path");

(async () => {
  const dbFile = path.join(__dirname, "effets.db");
  const outputDir = path.join(__dirname, "effets");

  const lines = fs.readFileSync(dbFile, "utf-8").split("\n").filter(l => l.trim().startsWith("{"));
  const effects = lines.map(l => JSON.parse(l));

  if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });

  const db = new ClassicLevel(outputDir, { keyEncoding: "utf8", valueEncoding: "utf8" });
  for (const effect of effects) {
    await db.put("!effects!" + effect._id, JSON.stringify(effect));
  }
  await db.close();

  console.log(`${effects.length} effects written to ${outputDir}`);
})();

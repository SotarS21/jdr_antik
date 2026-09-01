/**
 * One-off source migration: rewrites every embedded ActiveEffect still using the
 * deprecated shape (top-level `changes` + numeric `mode`) in packs/avantages.db to
 * the modern shape (`system.changes` + string `type`) — same migration already done
 * for the standalone Effets compendium in _build-effets.js (see JOURNAL.md, 31 août
 * 2026 suite 14/15). Purely a storage-format cleanup: Foundry's own migrateData()
 * already normalizes the old shape transparently on every read (confirmed by the
 * comment in ANTIQUE.getEffectChangeLabel(), config.mjs), so this changes no in-game
 * behavior — it only stops the deprecation warning logged on each such read.
 *
 * Also fixes two real bugs found during the same audit, same root cause as the
 * "Cuir de Hero" bug fixed in suite 15: "Sang froid" and "Vif" target
 * system.saves.<key>.base, a field removed from the saves schema in July (silently
 * overwritten by the hardcoded SAVE_BASE constant in prepareDerivedData() — never
 * even read) — retargeted to .bonus, the real field (same one "Dépressif" already
 * uses correctly).
 *
 * Run:  node packs/_migrate-advantage-effects-format.js
 * Then apply the same fixes to the already-deployed compendium/actor copies with the
 * companion GM macro packs/_fix-migrate-advantage-effects-live.js.
 */
const fs = require("fs");
const path = require("path");

const MODE_TO_TYPE = { 0: "custom", 1: "multiply", 2: "add", 3: "downgrade", 4: "upgrade", 5: "override" };

const KEY_FIXES = {
  "system.saves.volonte.base": "system.saves.volonte.bonus",
  "system.saves.reflexes.base": "system.saves.reflexes.bonus"
};

const dbPath = path.join(__dirname, "avantages.db");
const lines = fs.readFileSync(dbPath, "utf-8").split("\n").filter(Boolean);

let migratedEffects = 0;
let fixedKeys = 0;

const outLines = lines.map(line => {
  const doc = JSON.parse(line);
  if (!Array.isArray(doc.effects)) return line;

  doc.effects = doc.effects.map(effect => {
    if (!Array.isArray(effect.changes)) return effect;

    const changes = effect.changes.map(c => {
      const key = KEY_FIXES[c.key] ?? c.key;
      if (key !== c.key) fixedKeys++;
      return { key, type: MODE_TO_TYPE[c.mode] ?? "add", value: c.value, ...(c.priority != null ? { priority: c.priority } : {}) };
    });

    const { changes: _old, ...rest } = effect;
    migratedEffects++;
    return { ...rest, system: { ...(effect.system ?? {}), changes } };
  });

  return JSON.stringify(doc);
});

fs.writeFileSync(dbPath, outLines.join("\n") + "\n", "utf-8");
console.log(`Migrated ${migratedEffects} embedded effect(s), fixed ${fixedKeys} stale key(s), in ${dbPath}`);

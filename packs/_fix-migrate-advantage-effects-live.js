/**
 * Macro GM : applique au compendium Avantages déjà déployé (+ copies déjà possédées
 * par un acteur) la même migration que packs/_migrate-advantage-effects-format.js a
 * faite sur la source packs/avantages.db :
 *
 * 1. Migre le format déprécié (changes + mode numérique) vers le format moderne
 *    (system.changes + type string) sur les 15 avantages qui avaient déjà un effet
 *    embarqué de la première mécanique (avant le chantier "compendium Effets") —
 *    pure cosmétique, arrête l'avertissement de dépréciation loggué à chaque lecture,
 *    aucun changement de comportement en jeu (Foundry migrait déjà l'ancien format à
 *    la volée en mémoire).
 * 2. Corrige deux vrais bugs, même cause que "Cuir de Hero" (suite 15) : "Sang froid"
 *    et "Vif" ciblaient system.saves.<clé>.base, un champ retiré du schéma des
 *    sauvegardes en juillet (écrasé sans condition par la constante SAVE_BASE dans
 *    prepareDerivedData(), jamais lu) — donc no-op silencieux depuis toujours.
 *    Corrigé vers .bonus, le vrai champ.
 *
 * Idempotent, sûr à relancer ; jamais d'édition LevelDB directe, uniquement l'API
 * Document Foundry.
 */
const MODE_TO_TYPE = { 0: "custom", 1: "multiply", 2: "add", 3: "downgrade", 4: "upgrade", 5: "override" };

const KEY_FIXES = {
  "system.saves.volonte.base": "system.saves.volonte.bonus",
  "system.saves.reflexes.base": "system.saves.reflexes.bonus"
};

async function migrateItem(item) {
  if (item.type !== "advantage") return false;
  let changed = false;

  for (const effect of item.effects ?? []) {
    const rawChanges = effect.changes ?? [];
    if (!rawChanges.length) continue;

    const needsKeyFix = rawChanges.some(c => KEY_FIXES[c.key]);
    const needsFormatMigration = rawChanges.some(c => c.mode !== undefined || c.type === undefined);
    if (!needsKeyFix && !needsFormatMigration) continue;

    const newChanges = rawChanges.map(c => ({
      key: KEY_FIXES[c.key] ?? c.key,
      type: c.type ?? MODE_TO_TYPE[c.mode] ?? "add",
      value: c.value,
      ...(c.priority != null ? { priority: c.priority } : {})
    }));

    await effect.update({ "system.changes": newChanges, changes: [] });
    changed = true;
    console.log(`[fix-migrate-effects] "${item.name}" > "${effect.name}": migré vers le format moderne${needsKeyFix ? " + clé corrigée" : ""}.`);
  }

  return changed;
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage") continue;
    const doc = await pack.getDocument(entry._id);
    if (await migrateItem(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (await migrateItem(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) migré(s)/corrigé(s) — voir la console pour le détail.`);

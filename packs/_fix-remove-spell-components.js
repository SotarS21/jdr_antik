/**
 * Macro : retire le champ system.components (retiré du schéma AntiqueSpell — pure
 * duplication de system.costText pour les rituels, jamais lue par la logique de
 * jeu, voir JOURNAL.md 31 août 2026) sur les documents déjà déployés :
 * compendium Sorts + copies déjà possédées par un acteur.
 *
 * Utilise la syntaxe de suppression de clé de Foundry ("system.-=components")
 * plutôt qu'une valeur vide, pour vraiment retirer la clé de la donnée stockée.
 * Passe uniquement par l'API Document (update()), jamais d'édition LevelDB directe.
 */
let cleaned = 0;

const pack = game.packs.get("antique.sorts");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "spell") continue;
    const doc = await pack.getDocument(entry._id);
    if (!("components" in (doc.system._source ?? doc.system))) continue;
    await doc.update({ "system.-=components": null });
    cleaned++;
    console.log(`[fix-remove-components] Compendium: "${doc.name}" nettoyé.`);
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "spell") continue;
    if (!("components" in (item.system._source ?? item.system))) continue;
    await item.update({ "system.-=components": null });
    cleaned++;
    console.log(`[fix-remove-components] "${actor.name}" > "${item.name}" nettoyé.`);
  }
}

ui.notifications.info(`Champ "composant" retiré sur ${cleaned} sort(s) — voir la console pour le détail.`);

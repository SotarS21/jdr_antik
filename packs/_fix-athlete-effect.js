/**
 * Macro : ajoute l'ActiveEffect manquant sur l'avantage "Athléte" — sa description
 * dit "Capacité de déplacement x2" mais l'effet mécanique n'a jamais été posé
 * (packs/avantages.db le portait déjà avec un tableau `effects` vide). Corrigé côté
 * source ; ce script applique le même correctif au compendium Avantages déjà déployé
 * et aux copies déjà possédées par un acteur, via l'API Document Foundry uniquement
 * (jamais d'édition LevelDB directe).
 */
const EFFECT_DATA = {
  name: "Athléte",
  img: "icons/svg/upgrade.svg",
  changes: [{ key: "system.deplacement", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: "2" }],
  disabled: false,
  transfer: true
};

function needsFix(doc) {
  return doc.type === "advantage" && /Athl.te/i.test(doc.name)
    && !doc.effects.some(e => e.name === EFFECT_DATA.name);
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage" || !/Athl.te/i.test(entry.name)) continue;
    const doc = await pack.getDocument(entry._id);
    if (!needsFix(doc)) continue;
    await doc.createEmbeddedDocuments("ActiveEffect", [EFFECT_DATA]);
    fixed++;
    console.log(`[fix-athlete] Compendium: "${doc.name}" corrigé.`);
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (!needsFix(item)) continue;
    await item.createEmbeddedDocuments("ActiveEffect", [EFFECT_DATA]);
    fixed++;
    console.log(`[fix-athlete] "${actor.name}" > "${item.name}" corrigé.`);
  }
}

ui.notifications.info(`Effet "Déplacement x2" ajouté sur ${fixed} exemplaire(s) d'Athléte — voir la console.`);

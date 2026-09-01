/**
 * Macro GM : applique au compendium Avantages déjà déployé (+ copies déjà possédées
 * par un acteur) le correctif de packs/_build-effet-peau-hades.js — crée l'effet
 * embarqué manquant (system.pv.value ×2) sur "Peau d'Hadès" et ajoute le lien
 * @UUID vers le nouveau document standalone du compendium Effets. À exécuter APRÈS
 * avoir redéployé le compendium Effets mis à jour (sans quoi le lien pointera vers
 * un document qui n'existe pas encore côté monde) — voir la skill "deploy".
 *
 * Idempotent, sûr à relancer ; jamais d'édition LevelDB directe, uniquement l'API
 * Document Foundry.
 */
const EFFET_ID = "eEft000000000028";
const CHANGE_KEY = "system.pv.value";

async function applyFix(doc) {
  if (!doc.name.includes("Peau d'Hadès")) return false;
  let changed = false;

  if (!doc.effects.some(e => e.changes?.some(c => c.key === CHANGE_KEY))) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: "Peau d'Hadès",
      img: doc.img,
      "system.changes": [{ key: CHANGE_KEY, type: "multiply", value: "2" }],
      disabled: false,
      transfer: true
    }]);
    changed = true;
    console.log(`[fix-peau-hades] "${doc.name}": effet embarqué créé.`);
  }

  const uuidLink = `@UUID[Compendium.antique.effets.${EFFET_ID}]{Peau d'Hadès}`;
  if (!doc.system.description.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
    console.log(`[fix-peau-hades] "${doc.name}": lien vers l'Effet ajouté à la description.`);
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
    if (entry.type !== "advantage" || !entry.name.includes("Peau d'Hadès")) continue;
    const doc = await pack.getDocument(entry._id);
    if (await applyFix(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "advantage" || !item.name.includes("Peau d'Hadès")) continue;
    if (await applyFix(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) corrigé(s) — voir la console pour le détail.`);

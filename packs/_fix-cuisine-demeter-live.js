/**
 * Macro GM : ajoute le lien "Générer une ration de Déméter" à la fin de la
 * description de l'avantage "Cuisine de Déméter" déjà déployé (compendium Avantages
 * + copies déjà possédées par un acteur). Cliquer ce lien (géré par
 * actor-sheet.mjs, sélecteur .generate-item-link) poste un message de chat avec un
 * lien @UUID enrichi vers "Rations régénératrices de Déméter" (packs/equipement.db,
 * aEqp000000000051) — natif Foundry, glissable directement depuis le chat par
 * n'importe quel joueur, aucune plomberie de "don de copie" à écrire.
 *
 * À exécuter APRÈS avoir redéployé le compendium Équipement mis à jour (sans quoi le
 * lien pointera vers un objet qui n'existe pas encore côté monde) — voir la skill
 * "deploy".
 *
 * Idempotent, sûr à relancer ; jamais d'édition LevelDB directe, uniquement l'API
 * Document Foundry.
 */
const RATION_UUID = "Compendium.antique.equipement.aEqp000000000051";
const LINK_HTML = `<p><a class="generate-item-link" data-item-uuid="${RATION_UUID}" data-chat-text="Une ration de Déméter a été créée, prenez-la :">🍞 Générer une ration de Déméter</a></p>`;

async function applyFix(doc) {
  if (!doc.name.includes("Cuisine de Déméter")) return false;
  if (doc.system.description.includes("generate-item-link")) return false;

  await doc.update({ "system.description": doc.system.description + LINK_HTML });
  console.log(`[fix-cuisine-demeter] "${doc.name}": lien de génération ajouté à la description.`);
  return true;
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage" || !entry.name.includes("Cuisine de Déméter")) continue;
    const doc = await pack.getDocument(entry._id);
    if (await applyFix(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "advantage" || !item.name.includes("Cuisine de Déméter")) continue;
    if (await applyFix(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) corrigé(s) — voir la console pour le détail.`);

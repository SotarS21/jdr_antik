/**
 * Macro : applique aux compendiums déjà déployés + aux acteurs le même correctif
 * que packs/_fix-sorts-ritual-ingredients.js (source) — remplit system.ingredients
 * sur les rituels à partir de leur costText (ex. "Anis/ Bougie" -> 2 ingrédients),
 * pour que l'onglet "Ingrédients" devienne la vraie source de vérité (voir
 * JOURNAL.md, 31 août 2026, et castSpell() dans module/documents/item.mjs).
 *
 * Ne touche jamais un fichier LevelDB brut — passe uniquement par l'API Document
 * de Foundry (update()), comme toute macro de ce dossier. Ne modifie que les
 * rituels dont system.ingredients est encore vide (n'écrase jamais une liste déjà
 * personnalisée par l'utilisateur en jeu).
 */
function parseIngredients(costText) {
  if (!costText) return [];
  return costText.split("/")
    .map(name => name.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `ing${i + 1}`, name, quantity: 1, possede: false }));
}

function needsPatch(doc) {
  return doc.type === "spell" && doc.system?.ritual && doc.system?.costText
    && (!doc.system.ingredients || doc.system.ingredients.length === 0);
}

let patched = 0;

// 1) Compendium Sorts
const pack = game.packs.get("antique.sorts");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex({ fields: ["system.ritual", "system.costText", "system.ingredients"] });
  for (const entry of index) {
    if (!needsPatch(entry)) continue;
    const doc = await pack.getDocument(entry._id);
    await doc.update({ "system.ingredients": parseIngredients(doc.system.costText) });
    patched++;
    console.log(`[fix-sorts-ingredients] Compendium: "${doc.name}" -> ${doc.system.costText}`);
  }
  if (wasLocked) await pack.configure({ locked: true });
}

// 2) Copies déjà possédées par un acteur (ne se resynchronisent jamais toutes
// seules depuis le compendium — piège déjà documenté dans JOURNAL.md)
for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (!needsPatch(item)) continue;
    await item.update({ "system.ingredients": parseIngredients(item.system.costText) });
    patched++;
    console.log(`[fix-sorts-ingredients] "${actor.name}" > "${item.name}" -> ${item.system.costText}`);
  }
}

ui.notifications.info(`Ingrédients de rituel remplis sur ${patched} sort(s) — voir la console pour le détail.`);

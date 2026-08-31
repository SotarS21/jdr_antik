/**
 * Macro : corrige l'icône cassée `icons/svg/potion.svg` (n'existe pas dans les assets
 * Foundry — d'où un 404 en console à l'ouverture de la fiche de tout objet qui la
 * porte encore, ex. "erreur à l'édition d'un ingrédient" avec 404 potion.svg).
 *
 * `_build-alchimie.js` l'utilisait comme icône par défaut des potions "Bénéfique"
 * sans entrée explicite dans POTION_ICONS — corrigé côté source vers une vraie icône
 * (icons/consumables/potions/potion-bottle-corked-labeled-green.webp), mais un objet
 * déjà créé avant ce correctif (compendium déjà déployé, ou copie sur un acteur) garde
 * l'ancien chemin cassé tant qu'il n'est pas mis à jour explicitement — ne se
 * resynchronise jamais tout seul depuis le compendium (piège déjà documenté dans
 * JOURNAL.md). Ce script répare partout où un tel objet peut vivre : compendium
 * Alchimie, objets du monde, objets possédés par un acteur.
 *
 * Ne touche jamais un fichier LevelDB brut — passe uniquement par l'API Document
 * de Foundry (update()), comme toute macro de ce dossier.
 */
const BROKEN_ICON = "icons/svg/potion.svg";
const FIXED_ICON = "icons/consumables/potions/potion-bottle-corked-labeled-green.webp";

let fixed = 0;

// 1) Compendium Alchimie
const pack = game.packs.get("antique.alchimie");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex({ fields: ["img"] });
  for (const entry of index) {
    if (entry.img !== BROKEN_ICON) continue;
    const doc = await pack.getDocument(entry._id);
    await doc.update({ img: FIXED_ICON });
    fixed++;
    console.log(`[fix-potion-svg] Compendium: "${doc.name}" corrigé.`);
  }
  if (wasLocked) await pack.configure({ locked: true });
}

// 2) Objets du monde (non embarqués dans un acteur)
for (const item of game.items ?? []) {
  if (item.img !== BROKEN_ICON) continue;
  await item.update({ img: FIXED_ICON });
  fixed++;
  console.log(`[fix-potion-svg] Objet du monde: "${item.name}" corrigé.`);
}

// 3) Objets possédés par un acteur
for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.img !== BROKEN_ICON) continue;
    await item.update({ img: FIXED_ICON });
    fixed++;
    console.log(`[fix-potion-svg] "${actor.name}" > "${item.name}" corrigé.`);
  }
}

ui.notifications.info(`Icône potion.svg cassée corrigée sur ${fixed} objet(s) — voir la console pour le détail.`);

// Macro : le compendium Historique déployé en jeu a été construit AVANT que la source
// (packs/historique.db) ne soit restructurée en 2 vrais dossiers Foundry ("Origine" /
// "Bonus/Malus aléatoire"). Dans le compendium vécu, "Origine" et "Bonus/Malus aléatoire"
// existent comme deux RollTable orphelines (vides, ids fHist00000000001/002) au lieu de
// vrais dossiers — ce qui empêche le Navigateur de Compendium de les proposer comme filtres.
// Cette macro les remplace par de vrais dossiers et relie les 5 vraies tables dessus.
// À coller/exécuter dans Foundry (onglet Macros).
(async () => {
  const pack = game.packs.get("antique.historique");
  if (!pack) return ui.notifications.error("Compendium antique.historique introuvable.");

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

  try {
    const LEGACY_IDS = ["fHist00000000001", "fHist00000000002"];
    for (const id of LEGACY_IDS) {
      const doc = await pack.getDocument(id).catch(() => null);
      if (!doc) continue;
      const resultCount = doc.results?.size ?? 0;
      if (resultCount > 0) {
        ui.notifications.warn(`"${doc.name}" (${id}) contient ${resultCount} résultat(s) — non supprimé par précaution, à vérifier manuellement.`);
        continue;
      }
      await doc.delete();
      console.log(`Antique | Ancienne entrée orpheline "${doc.name}" (${id}) supprimée.`);
    }

    const FolderCls = foundry.utils.getDocumentClass("Folder");
    const created = await FolderCls.create(
      [
        { name: "Origine", type: "RollTable" },
        { name: "Bonus/Malus aléatoire", type: "RollTable" }
      ],
      { pack: pack.collection }
    );
    const folderIdByName = Object.fromEntries(created.map(f => [f.name, f.id]));
    console.log("Antique | Dossiers créés :", folderIdByName);

    const TABLE_FOLDER_BY_NAME = {
      "Origine du personnage": "Origine",
      "Bonus/Malus aléatoire 1": "Bonus/Malus aléatoire",
      "Bonus/Malus aléatoire 2": "Bonus/Malus aléatoire",
      "Bonus/Malus aléatoire 3": "Bonus/Malus aléatoire",
      "Bonus/Malus aléatoire 4": "Bonus/Malus aléatoire"
    };
    const docs = await pack.getDocuments();
    let relinked = 0;
    for (const doc of docs) {
      const folderName = TABLE_FOLDER_BY_NAME[doc.name];
      if (!folderName) continue;
      await doc.update({ folder: folderIdByName[folderName] });
      relinked++;
    }

    ui.notifications.info(`Historique : dossiers créés, ${relinked} table(s) reliée(s).`);
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
})();

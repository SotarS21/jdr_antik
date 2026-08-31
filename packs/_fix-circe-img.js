// Macro : corrige l'image manquante de Circé (compendium Divinités) vers l'icône par défaut
// Foundry, en attendant une vraie image. À coller/exécuter dans Foundry (onglet Macros).
(async () => {
  const pack = game.packs.get("antique.dieux");
  if (!pack) return ui.notifications.error("Compendium antique.dieux introuvable.");

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

  const doc = await pack.getDocument("aDty000000000017");
  if (!doc || doc.name !== "Circé") {
    if (wasLocked) await pack.configure({ locked: true });
    return ui.notifications.error("Document Circé introuvable dans antique.dieux.");
  }

  await doc.update({ img: "icons/svg/mystery-man.svg" });

  if (wasLocked) await pack.configure({ locked: true });
  ui.notifications.info(`Image de ${doc.name} mise à jour vers l'icône par défaut (en attendant une vraie image).`);
})();

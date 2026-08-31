# Plan — Ajustements fiche Personnage (CSS/UX) — CLOS (22 août 2026)

Plan original démarré le 8 juillet 2026. Audit du 22 août 2026 : 11 des 13 points d'origine
étaient déjà traités dans des sessions ultérieures (notamment celle du 25 juillet 2026, voir
`JOURNAL.md`) sans que ce fichier soit mis à jour pour le dire. Les 2 derniers points (munitions,
favoris) ont été traités et confirmés le 22 août 2026 (v0.6.28 et v0.6.29) — plus aucun point
ouvert sur ce chantier. Conservé pour référence historique/traçabilité des décisions prises.

---

## 1. Sélecteur de munitions pour armes à distance/consommables — FAIT (22 août 2026, v0.6.28)

Implémenté tel que décrit ci-dessous. `context.ammoCandidates` (equipment `consumable`, triés par
nom) ajouté dans `actor-sheet.mjs::_prepareContext()` ; `<select class="munitions-select">` dans
`.munitions-cell` du template quand `weapon.system.consumable` est vrai et qu'aucune munition n'est
liée ; listener `change` dans `_onRender()` → `weapon.update({"system.linkedAmmoId": ...})` + render
forcé. Non appliqué à la fiche PNJ (hors scope du plan d'origine, qui ne concernait que la fiche
personnage).

Description d'origine (conservée pour référence) :

Actuellement (`templates/actor/character-sheet.hbs`, `.munitions-cell`) : si `weapon.linkedAmmoId`
est déjà défini → badge avec quantité restante (fait). Si aucune munition n'est liée → un simple
tiret « — », rien d'actionnable.

À faire : afficher un `<select>` pour choisir une munition parmi l'équipement de l'acteur, visible
uniquement quand `weapon.system.consumable` est vrai et qu'aucune munition n'est encore liée.

- `module/sheets/actor-sheet.mjs`, `_prepareContext()` (~L137, section `weapons`) : exposer une
  liste de candidats munitions (`context.equipment` ou un sous-ensemble) pour peupler le `<select>`.
  **Périmètre à trancher à l'implémentation** : tout l'équipement, ou seulement les objets consommables
  (`system.consumable`) ? Les items alchimie/ingrédients ne sont pas des munitions, donc probablement
  restreindre à `type === "equipment" && system.consumable` au minimum — à valider si ça exclut des cas
  légitimes.
- `templates/actor/character-sheet.hbs`, `.munitions-cell` : ajouter le `<select>` dans la branche
  `{{else}}` actuelle (remplace le tiret), une `<option>` par candidat + une option vide "Choisir...".
- `module/sheets/actor-sheet.mjs`, `_onRender()` : listener `change` sur `.munitions-cell select`
  → `weaponItem.update({"system.linkedAmmoId": selectedId})`, puis re-render (cf. bug récurrent de
  re-render déjà documenté dans `JOURNAL.md` — ne pas oublier le `.then()`).

## 2. Rafraîchissement isolé de la barre de favoris — FAIT (22 août 2026, v0.6.29)

Implémenté via un partial Handlebars dédié (`templates/actor/parts/favorites-bar.hbs`, extrait tel
quel de l'ancien bloc inline), préchargé dans `antique.mjs` et rendu à la fois normalement (inclusion
`{{> }}` dans `character-sheet.hbs`, à l'intérieur d'un `<div class="favorites-bar-container">`
stable même à 0 favori) et isolément via `foundry.applications.handlebars.renderTemplate()`
(`_refreshFavoritesBar()` dans `actor-sheet.mjs`). `actor.update(..., {render:false})` supprime le
re-render automatique de Foundry (confirmé dans le code source client `client-document.mjs`,
`options.render !== false`) ; `_setSkillRowFavoriteState()` bascule directement en DOM la classe
`favorite`/l'étoile de la ligne de compétence concernée pour rester cohérent avec la barre. Confirmé
par l'utilisateur en test manuel dans Foundry (voir `JOURNAL.md`, session du 22 août 2026, suite 2).

Description d'origine (conservée pour référence) :

La barre de favoris (`system.favoriteSkills`, ajoutée après le plan d'origine — n'existait pas
encore lors de l'audit du 25 juillet) fonctionne, mais ajouter/retirer un favori déclenche un
re-render complet de la fiche (`actor-sheet.mjs` ~L619, 653, 668 : `this.actor.update(...)` sans
ciblage particulier). Demande initiale : ne rafraîchir que la barre elle-même.

Approche envisagée (non triviale, à creuser avant de s'engager) :
- Extraire le rendu de la barre dans un template Handlebars partiel séparé, ou une fonction JS qui
  regénère juste ce fragment à partir de `context.favoriteSkills` recalculé.
- Nouvelle méthode `_refreshFavoritesBar()` dans `actor-sheet.mjs` qui recalcule les favoris et
  ré-injecte seulement le HTML de `.favorites-bar` dans le DOM, sans passer par `this.render()`.
- Voir si Foundry expose un helper de rendu Handlebars isolé côté client
  (`foundry.applications.handlebars.renderTemplate()`) plutôt que de dupliquer la logique de template.
- Appeler `_refreshFavoritesBar()` à la place de `this.actor.update(...)` suivi d'un render complet,
  uniquement dans les handlers qui touchent `favoriteSkills`.

**Priorité basse** : confort/perf, pas un bug visible pour l'utilisateur.

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) — redéployer
  vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque changement, puis
  Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture statique
  (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans Foundry.

# TODO — Bugs Antique

Liste de points remontés par l'utilisateur, à traiter. Créé le 31 août 2026.

---

## 1. ~~CA qui augmente à l'update d'une fiche (PNJ "Ephise")~~ — CORRIGÉ (31 août 2026, v0.6.38)

Cause : les inputs "Temp" (CA + Sauvegardes) affichaient la valeur déjà modifiée par un ActiveEffect
actif (buff), et la soumission automatique du formulaire à chaque changement de champ la persistait
comme nouvelle valeur brute, qui se refaisait regonfler au rendu suivant — d'où l'augmentation à
chaque update tant qu'un buff de CA restait actif. Voir `JOURNAL.md`, session du 31 août 2026, pour
le détail. **À confirmer par l'utilisateur en jeu** (poser un buff de CA sur Ephise, modifier un
autre champ de la fiche, vérifier que la CA reste stable).

## 2. ~~Erreur à l'édition d'un ingrédient (fenêtre + 404)~~ — CORRIGÉ (31 août 2026, v0.6.39)

Cause : `packs/_build-alchimie.js` utilisait `icons/svg/potion.svg` comme icône par défaut des
potions "Bénéfique" sans entrée explicite dans `POTION_ICONS` — ce fichier **n'existe pas** dans la
bibliothèque d'icônes de Foundry (vérifié dans l'installation locale), d'où le 404. Le `.db` source
et le compendium déployé n'ont plus aucune occurrence (toutes les potions ont désormais une icône
explicite) ; l'objet fautif est donc une copie déjà existante (sur un acteur, ou dans le monde) créée
avant que la liste ne devienne exhaustive. Voir `JOURNAL.md`, session du 31 août 2026 (suite).

**Correctif** : icône de fallback changée vers une vraie icône
(`icons/consumables/potions/potion-bottle-corked-labeled-green.webp`). **À exécuter par
l'utilisateur** : macro `packs/_fix-potion-svg-icon.js` (corrige compendium + objets du monde +
objets déjà possédés par un acteur), pour réparer l'objet déjà créé qui a déclenché ce signalement.

## 3. ~~Sorts / Rituels — ingrédients et composants~~ — CORRIGÉ (31 août 2026, v0.6.40 → v0.6.41)

- FAIT. `castSpell()` saute désormais le mécanisme `costText` pour un personnage-joueur dès que
  `system.ingredients` est rempli. Les 8 rituels existants (qui n'avaient que `costText`) ont été
  migrés automatiquement. **À exécuter par l'utilisateur** : macro
  `packs/_fix-sorts-ritual-ingredients-live.js` pour appliquer la migration au compendium déjà
  déployé + aux copies déjà possédées par un acteur.
- FAIT. Après consommation, chaque ingrédient se resynchronise avec le stock réel restant au lieu
  d'être systématiquement décoché.
- FAIT. Champ "composant" confirmé comme pure duplication de `costText`, jamais lu par la logique
  de jeu — retiré (schéma, template, affichage chat, `_build-sorts.js`, langues, `sorts.db`).
  **À exécuter par l'utilisateur** : macro `packs/_fix-remove-spell-components.js` pour nettoyer le
  compendium déjà déployé + les copies déjà possédées par un acteur.

## 4. Glisser-déposer d'objets — stack si possible

Lors d'un drag & drop d'un objet vers un inventaire, si un objet identique empilable
(`STACKABLE_TYPES`, cf. `browser-shared.mjs`) est déjà présent, l'objet déposé doit s'empiler
dessus (incrémenter la quantité) plutôt que créer un nouveau doublon.

## 5. ~~Navigateur de Compendium — impossible de modifier les objets~~ — NE S'APPLIQUE PLUS (31 août 2026)

Régression ou bug bloquant signalé : depuis le Navigateur de Compendium, il n'était plus possible
d'éditer un objet (ouverture de sa fiche en modification). **Correction jugée non nécessaire par
l'utilisateur** — point retiré, plus rien à traiter ici.

## 6. Fiche PNJ — onglet Combat incomplet

Ajouter dans l'onglet Combat de la fiche PNJ : la CA, l'Initiative, le Déplacement et les bonus
d'attaque (actuellement absents ou pas tous affichés).

## 7. Compétences Parade et Esquive en combat

Ajouter les compétences "Parade" et "Esquive" dans la partie Combat des fiches — à la fois fiche
Personnage et fiche PNJ.

**Point de blocage** : demander à FLo les règles d'esquive avant d'implémenter (retrouvé dans
`todo_foundry.txt` sur le Bureau) — pas juste une question de code, les règles précises de ces deux
compétences ne sont pas encore tranchées.

## 8. PNJ — compétences de combat avec compendium associé

Sur les PNJ, ajouter des compétences de combat, avec un compendium associé — s'inspirer des
descriptions des créatures mythologiques (retrouvé dans `todo_foundry.txt`). Plus large que le
point 6 (qui ne concerne que l'affichage CA/Initiative/Déplacement/bonus d'attaque) : il s'agit ici
d'un vrai système de compétences de combat pour le Bestiaire, pas encore défini.

## 9. Glisser les compétences et armes dans la liste des macros

Permettre de glisser-déposer une compétence ou une arme depuis la fiche vers la barre de macros de
Foundry (retrouvé dans `todo_foundry.txt`), pour créer une macro de jet rapide — non implémenté à
ce jour.

## 10. Réorganiser les favoris

Actuellement les favoris de compétence ne peuvent qu'être ajoutés/retirés — permettre de les
réordonner (glisser-déposer dans la barre de favoris, retrouvé dans `todo_foundry.txt`).

## 11. Éditeur de texte riche — taille dynamique à la fenêtre

Les zones de texte riche (`<prose-mirror>`) ont des hauteurs minimales fixes (ajoutées en juillet/
août, cf. `JOURNAL.md`) mais ne s'agrandissent pas avec la taille de la fenêtre. Demande d'origine
(`todo_foundry.txt`, "TODO robin") : agrandir l'éditeur avec la taille de la fenêtre, taille minimum
300px — seulement partiellement traité (tailles fixes, pas de scaling dynamique).

## 12. Combobox d'emplacement d'équipement mal affichée

Dans l'inventaire, pour ajouter l'emplacement (slot) d'un objet, la liste déroulante s'affiche mal
(retrouvé dans `todo_foundry.txt`) — aucune trace de correctif dans `JOURNAL.md`, à diagnostiquer.

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) —
  redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque
  changement, puis Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture
  statique (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans
  Foundry.

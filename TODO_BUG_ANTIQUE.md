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

## 4. ~~Glisser-déposer d'objets — stack si possible~~ — CORRIGÉ (31 août 2026, v0.6.42)

Nouveau `stackOrCreateDroppedItem()` (`browser-shared.mjs`), appelé dans `_onDropItem()` des fiches
Personnage et PNJ : un drag & drop d'un objet empilable (`STACKABLE_TYPES`) depuis le Navigateur, un
autre acteur ou les objets du monde s'empile désormais sur une correspondance existante (type + nom
+ apothCategory) au lieu de créer un doublon. Voir `JOURNAL.md`, session du 31 août 2026 (suite 4).

## 5. ~~Navigateur de Compendium — impossible de modifier les objets~~ — NE S'APPLIQUE PLUS (31 août 2026)

Régression ou bug bloquant signalé : depuis le Navigateur de Compendium, il n'était plus possible
d'éditer un objet (ouverture de sa fiche en modification). **Correction jugée non nécessaire par
l'utilisateur** — point retiré, plus rien à traiter ici.

## 6. ~~Fiche PNJ — onglet Combat incomplet~~ — CORRIGÉ (31 août 2026, v0.6.43)

CA/Initiative/Attaque existaient déjà mais uniquement sur l'onglet Statistiques — dupliqués sur
l'onglet Combat (mêmes champs, synchronisés automatiquement). Nouveau champ Déplacement (n'existait
pas du tout pour les PNJ), ajouté aux deux endroits. Voir `JOURNAL.md`, session du 31 août 2026
(suite 5).

## 7. ~~Compétences Parade et Esquive en combat~~ — CORRIGÉ (31 août 2026, v0.6.50)

Règle confirmée par l'utilisateur : n'importe qui (PJ/PNJ) peut tenter une Esquive/Parade en
réaction quand un ennemi va toucher, plusieurs fois par tour ; que le jet réussisse ou non, -1
temporaire cumulatif à cette même compétence, remis à zéro au début du tour suivant de l'acteur
(automatique, via le tracker de combat). Boutons ajoutés dans l'onglet Combat des deux fiches, à
côté du Déplacement. Voir `JOURNAL.md`, session du 31 août 2026 (suite 12).

## 8. ~~PNJ — onglet Combat complet et réservé au MJ~~ — CORRIGÉ (31 août 2026, v0.6.44)

Reformulé après clarification utilisateur : le même onglet Combat que la fiche Personnage
(CA/Initiative/Déplacement en rappel + tableau de bonus d'attaque par catégorie — main nue, arme
blanche, arme de jet, arme exotique, combat à deux mains, arme à distance —, modifiable par le MJ,
+ le tableau d'armes déjà existant), et surtout **réservé au MJ** : un joueur qui possède/contrôle
un PNJ n'a plus accès à cet onglet du tout (les autres onglets restent inchangés). Voir
`JOURNAL.md`, session du 31 août 2026 (suite 6).

## 9. ~~Glisser les compétences et armes dans la liste des macros~~ — CORRIGÉ (31 août 2026, v0.6.46)

Nouveau `module/helpers/hotbar-macros.mjs` : glisser une arme (déjà glissable) ou une compétence
(nouveau payload de drag dédié) vers la barre de macros crée un raccourci qui lance directement le
jet (`item.rollAttack()` / `actor.rollSkill()`), au lieu d'ouvrir la fiche de l'objet. Voir
`JOURNAL.md`, session du 31 août 2026 (suite 8).

## 10. ~~Réorganiser les favoris~~ — CORRIGÉ (31 août 2026, v0.6.47)

Les puces de la barre de favoris se glissent-déposent maintenant les unes sur les autres pour
réordonner `system.favoriteSkills`. Voir `JOURNAL.md`, session du 31 août 2026 (suite 9).

## 11. ~~Éditeur de texte riche — taille dynamique à la fenêtre~~ — CORRIGÉ (31 août 2026, v0.6.48)

Plancher remonté à 300px partout (descriptions, notes, historique). S'agrandit désormais avec la
fenêtre sur les fiches Objet, Deity, et l'onglet Notes (Personnage/PNJ) + Statistiques (PNJ) —
c'étaient déjà des colonnes simples, sûres à passer en flex. **Laissé de côté volontairement** :
l'historique (onglet Background) garde son plancher à 300px mais ne s'agrandit pas — c'est une
vraie grille CSS à 2 colonnes, restructurer une seule ligne sans perturber les autres a été jugé
trop risqué sans accès navigateur pour vérifier visuellement. Voir `JOURNAL.md`, session du 31 août
2026 (suite 10).

## 12. ~~Combobox d'emplacement d'équipement mal affichée~~ — CORRIGÉ (31 août 2026, v0.6.49)

Cause : le `<select>` d'emplacement (fiche d'objet) n'avait pas de largeur/flex-basis dans sa ligne
`.form-group`, contrairement aux champs texte — débordait du cadre sur une fiche étroite au lieu de
partager l'espace avec son label. Corrigé pour tous les `<select>` des fiches d'objet (même défaut
partagé). Voir `JOURNAL.md`, session du 31 août 2026 (suite 11).

## 13. ~~Focus perdu après validation — compétence (Entrée) et toggle d'effet (Traits)~~ — CORRIGÉ (9 septembre 2026, v0.6.68)

Deux cas distincts remontant en haut de la fiche au lieu de garder le focus/scroll à l'endroit où
l'utilisateur était : (a) valider un champ de compétence avec Entrée — **déjà corrigé de longue
date** par le mécanisme générique `preventEnterSubmit`, aucun changement nécessaire ; (b) cliquer
sur actif/inactif d'un effet dans l'onglet Traits — bug réel, corrigé en appliquant le même patron
`captureFocusState`/`restoreFocusState` que le reste de la fiche. Voir `JOURNAL.md`, session du
9 septembre 2026. **À confirmer par l'utilisateur en jeu.**

## 14. ~~Recherche/surlignage d'une compétence dans l'onglet Compétences~~ — CORRIGÉ (9 septembre 2026, v0.6.69)

Champ de recherche ajouté en haut de l'onglet Compétences : la compétence correspondante est
surlignée (halo doré) pendant que les autres s'estompent, sans rien masquer. Voir `JOURNAL.md`,
session du 9 septembre 2026 (suite). **À confirmer par l'utilisateur en jeu.**

## 15. Colonnes en haut de la fiche de personnage — EN PAUSE (9 septembre 2026)

Demande d'origine : « ajouter des colonnes sur le haut de la fiche de perso » — concept flou, le
header est actuellement en flex empilé. Clarifié le 9 septembre 2026 : il s'agit bien de
réorganiser les champs déjà présents (Nom, Dévotion, Joueur, PV, PM, CA, Avantage temporaire,
icônes de traits) en colonnes plutôt que d'en ajouter de nouveaux — mais la répartition précise
reste à trancher, l'utilisateur ayant mis ce point en pause le temps de retrouver l'objectif
d'origine. **Ne pas coder avant qu'il revienne avec une répartition précise.** Source :
`todo_foundry.txt`, audit du 9 septembre 2026.

## 16. ~~« Charger en async la barre des favoris »~~ — DÉJÀ FAIT (confirmé 9 septembre 2026)

Demande d'origine ambiguë (« Check Ajax »), mais déjà satisfaite en pratique : `_refreshFavoritesBar()`
(`actor-sheet.mjs:301-312`) rend la barre de favoris isolément via `renderTemplate()` + remplacement
du `innerHTML` de son conteneur, sans re-render complet de la fiche ni blocage sur `actor.update()`
(v0.6.29, voir `TODO_FICHE_PERSONNAGE.md` point 2) — antérieur à ce fichier `todo_foundry.txt`.
Aucun code à ajouter.

## 17. ~~Checkbox « Sac à ingrédient » (onglet Background)~~ — CORRIGÉ (9 septembre 2026, v0.6.70)

À côté de « Praticien de la magie », nouvelle checkbox « Sac à ingrédient » (`system.hasIngredientBag`)
qui affiche/cache l'onglet Ingrédients selon son état. Correctif de rétro-compatibilité disponible
dans l'écran de mise à jour pour cocher automatiquement les personnages qui ont déjà des
ingrédients. Voir `JOURNAL.md`, session du 9 septembre 2026 (suite 3). **Confirmé par
l'utilisateur en jeu** (9 septembre 2026).

## 18. ~~Utilité du champ « composant » des sorts~~ — DÉJÀ FAIT (confirmé 9 septembre 2026)

Doublon du point 3 ci-dessus : le champ composant a été confirmé pure duplication de `costText`
et retiré (schéma, template, affichage chat, `_build-sorts.js`, langues, `sorts.db`) en v0.6.41.
Vérifié le 9 septembre 2026 : aucune trace du champ nulle part dans le code actuel (seule mention
restante, purement historique : le changelog de `release-notes.mjs`). Ce point de
`todo_foundry.txt` est antérieur à cette suppression, jamais nettoyé du fichier source. Aucun
code à ajouter.

## 19. ~~Erreur d'ouverture de fenêtre à l'édition d'un ingrédient~~ — DÉJÀ FAIT (confirmé 9 septembre 2026)

Ré-audit du 9 septembre 2026 : contrairement à ma note précédente, ce n'est **pas** distinct du
point 2. Dans `todo_foundry.txt`, les 4 lignes consécutives sans saut de paragraphe (« Erreur à
l'édition d'ingredient la fenettre s'ouvre » suivi des deux lignes de console « Failed to load
resource ... 404 ... potion.svg ») ne forment qu'un seul signalement — exactement le bug déjà
corrigé en v0.6.39 (point 2 ci-dessus : icône `potion.svg` inexistante dans la bibliothèque
Foundry). Doublon, aucun code à ajouter.

## 20. Compendium de compétences de combat PNJ façon bestiaire mythologique — EN COURS (architecture livrée, v0.6.71)

Demande d'origine : ajouter aux PNJ des compétences de combat avec un compendium associé, en
s'inspirant des descriptions de créatures mythologiques. Seul un simple tableau de bonus d'attaque
par catégorie avait été livré (v0.6.44, voir point 8 ci-dessus).

**Étape 1 (9 septembre 2026, v0.6.71)** : architecture livrée — nouveau type d'objet
`npcability`, nouveau compendium "Capacités de Combat (PNJ)", nouvelle section dans l'onglet
Combat du PNJ, avec effet mécanique réel (pas juste du texte), comme demandé. **2 exemples
seulement** pour valider le patron avant généralisation (Charge furieuse, Regard pétrifiant) —
voir `JOURNAL.md`, session du 9 septembre 2026 (suite 4).

**Étape 2 (10 septembre 2026, v0.6.72)** : retour de test — description invisible à l'ouverture
depuis le compendium (type `npcability` oublié dans l'enregistrement de la fiche d'objet,
corrigé) + document Effet autonome manquant pour "Charge furieuse" (ajouté dans `effets.db`,
lié depuis la description, même patron que les avantages). Voir `JOURNAL.md`, session du
10 septembre 2026. **À confirmer par l'utilisateur en jeu** avant de généraliser à toutes les
créatures/PNJ existants (reste à faire, pas encore planifié).

## 21. Recochage automatique visuel des ingrédients après incantation d'un rituel

Après consommation, chaque ingrédient se resynchronise avec le stock réel (livré, voir point 3
ci-dessus) mais le recochage visuel automatique dans la fiche du sort après incantation n'est pas
confirmé. **À vérifier en jeu** avant de coder quoi que ce soit de plus. Source : `todo_foundry.txt`,
audit du 9 septembre 2026.

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) —
  redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque
  changement, puis Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture
  statique (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans
  Foundry.

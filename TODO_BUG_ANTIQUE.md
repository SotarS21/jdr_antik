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
10 septembre 2026.

**Étape 3 (10 septembre 2026, v0.6.73)** : retour de test — le bonus d'attaque doit être actif
en permanence, pas désactivé par défaut. Corrigé (compendium + copie déjà glissée sur un PNJ).
Voir `JOURNAL.md`, session du 10 septembre 2026 (suite). Confirmé par l'utilisateur en jeu.

**Étape 4 (10 septembre 2026, v0.6.74)** : "Regard pétrifiant" a maintenant lui aussi un document
Effet autonome ("Pétrifié (Regard de Méduse)", marqueur narratif). Voir `JOURNAL.md`, session du
10 septembre 2026 (suite 2).

**Étape 5 (10 septembre 2026, v0.6.75)** : retour de test — l'onglet Effets de la capacité
restait vide (l'effet n'était que lié dans la description, pas embarqué). Corrigé : effet
maintenant aussi embarqué sur la capacité en `transfer:false` (visible dans l'onglet Effets,
sans s'appliquer à la créature elle-même). Voir `JOURNAL.md`, session du 10 septembre 2026
(suite 3).

**Étape 6 (10 septembre 2026, v0.6.76)** : capacités de combat cliquables (nom + icône) pour
les afficher dans le chat (icône, titre, description) — patron déjà générique
(`AntiqueItem#postToChat()`), juste la classe manquante sur le nom. "Regard pétrifiant" affiche
désormais un bouton "Jet de sauvegarde" (Robustesse DC 18) sur sa carte de chat : le joueur visé
clique lui-même, avec les stats de son personnage assigné. Voir `JOURNAL.md`, session du
10 septembre 2026 (suite 4). **Confirmé par l'utilisateur en jeu (10 septembre 2026)** : "ça
marche bien".

**Étape 7 (10 septembre 2026, v0.6.79) — généralisé à tout le bestiaire.** Les 26 créatures
restantes de "Créatures Mythologiques" (toutes sauf Minotaure/Méduse déjà faites, et sauf
Cyclope/Pégase/Hippocampe qui n'avaient rien à ajouter) ont reçu 51 nouvelles capacités de
combat, même discipline que les désavantages : mécanique (ActiveEffect embarqué, actif en
permanence) seulement quand ça correspond à un champ existant (6 cas : Sphinx, Griffon, Triton,
Centaure guerrier, Sanglier d'Érymanthe, Taureau de Crète), bouton de jet de sauvegarde quand le
texte précise une difficulté (Réflexes/Robustesse/Volonté), narratif sinon. Chaque capacité est
aussi embarquée directement sur sa créature dans le compendium (glisser une créature sur une
scène l'amène déjà équipée) — y compris un retrofit de Minotaure/Méduse, qui n'avaient jamais eu
leur propre capacité embarquée sur eux-mêmes jusqu'ici. Voir `JOURNAL.md`, session du
10 septembre 2026 (suite 7). **À confirmer par l'utilisateur en jeu.**

## 22. ~~Effets désactivés — grisés, plus éditables ni réactivables~~ — CORRIGÉ (10 septembre 2026, v0.6.82)

Cause : la classe CSS `.disabled` (ajoutée sur la ligne d'un effet désactivé, pour le griser)
porte aussi le même nom qu'une classe utilitaire du noyau de Foundry qui pose
`pointer-events: none` — propriété héritée, elle coupait donc aussi les clics sur les propres
boutons de contrôle de la ligne (actif/inactif, éditer, supprimer). Corrigé en réactivant
`pointer-events: auto` explicitement sur ces boutons. Voir `JOURNAL.md`, session du
10 septembre 2026 (suite 10). **À confirmer par l'utilisateur en jeu.**

## 23. ~~Regard pétrifiant — bouton de jet de sauvegarde manquant~~ — CORRIGÉ (10 septembre 2026, via le point 26)

Signalé le 10 septembre 2026, dans la même session que sa création (v0.6.76) et sa confirmation
("ça marche bien"). Cause : l'utilisateur avait tenté "Écraser mes compendiums", qui échouait
totalement (403 sur les 14 packs, voir point 26) — n'avait donc rien copié. Résolu de fait par
le correctif du point 26 (v0.6.83 → v0.6.84). **Confirmé par l'utilisateur en jeu**
("ça marche bien").

## 24. ~~Compendiums "Effets" et "Capacités de Combat" absents du Navigateur de Compendium~~ — CORRIGÉ (13 septembre 2026, v0.6.85)

Demandé le 10 septembre 2026 : `module/apps/compendium-browser.mjs` avait 5 onglets
(`packs:` par onglet, voir `key: "traits"` : avantages/désavantages/bénédictions/avantages-divins)
mais ni `antique.effets` ni `antique.capacites-combat` n'y figuraient nulle part — inaccessibles
autrement que par le panneau de compendiums natif de Foundry. `antique.effets` ajouté à l'onglet
Traits existant (aux côtés des avantages/désavantages/etc., avec sa propre case de filtre) ; ses
documents sont des `ActiveEffect`, un type de document jamais géré jusqu'ici par le Navigateur
(seuls Item/Actor/RollTable l'étaient) — nouvelle branche dédiée dans `_prepareContext` +
`grantEffectToActor()` (`browser-shared.mjs`) pour le bouton "Prendre" (pas de notion de prix/
stack, contrairement à un Item). Nouvel onglet dédié "Capacités de Combat" créé pour
`antique.capacites-combat`, sans filtre (un seul pack). **Bug latent corrigé au passage** : le
`data-drag-type` du glisser-déposer était hardcodé à `"Item"` dans le template pour toutes les
sections de type "item", au lieu de lire `section.dragType` — sans incidence tant que seuls des
Items y passaient, mais aurait cassé le glisser d'un effet vers une fiche (créé comme un faux
Item au lieu d'un ActiveEffect). Voir `JOURNAL.md`, session du 13 septembre 2026. **À confirmer
par l'utilisateur en jeu.**

## 26. ~~"Écraser mes compendiums" échoue (403 sur les 14 packs)~~ — CORRIGÉ (10 septembre 2026, v0.6.83 → v0.6.84)

Foundry bloque désormais le téléchargement direct d'un fichier `.db` (famille LevelDB) comme
asset statique — le bouton "Écraser mes compendiums" du dialogue de version, qui allait
chercher `packs/*.db` par HTTP pour resemer les compendiums, échouait donc systématiquement (0
mis à jour, 14 échecs). Corrigé via un miroir `.json` de chaque pack (`packs/_json-mirrors/`,
généré automatiquement à chaque déploiement par `packs/_sync-json-mirrors.js`), extension non
bloquée. Voir `JOURNAL.md`, session du 10 septembre 2026 (suite 11) — attention, cette session a
aussi accidentellement écrasé un fichier `packs/dieux.json` préexistant (restauré) et perdu 13
fichiers `.json` non suivis par git dont le contenu d'origine est inconnu ; voir le détail dans
le journal.

**Test utilisateur (v0.6.83)** : le 403 est bien résolu (715 mis à jour, 209 créés), mais deux
nouveaux types d'échec apparus dans la console (masqués jusque-là par l'échec total) : des
dossiers d'organisation (armes/sorts/alchimie/avantages-divins/historique) traités par erreur
comme du contenu normal, et 5 tables aléatoires de l'Historique rejetées pour une donnée
technique invalide. Les deux corrigés en v0.6.84. Voir `JOURNAL.md`, session du
10 septembre 2026 (suite 12). **Confirmé par l'utilisateur en jeu (10 septembre 2026)** : "ça
marche bien".

## 25. ~~Filtre "Consommable" (Navigateur de Compendium, onglet Équipement) mal nommé~~ — CORRIGÉ (10 septembre 2026, v0.6.81)

Ce filtre montre en fait le contenu du compendium Alchimie (potions/ingrédients) — renommé
"Alchimie" pour plus de clarté. Voir `JOURNAL.md`, session du 10 septembre 2026 (suite 9).

## 21. ~~Recochage automatique visuel des ingrédients après incantation d'un rituel~~ — CONFIRMÉ (10 septembre 2026)

Après consommation, chaque ingrédient se resynchronise avec le stock réel (livré, voir point 3
ci-dessus) et le recochage visuel automatique dans la fiche du sort après incantation est
**confirmé par l'utilisateur en jeu** (10 septembre 2026). Source : `todo_foundry.txt`, audit du
9 septembre 2026.

**Bug connexe trouvé en testant, corrigé le même jour (v0.6.77)** : le bouton "+" d'un ingrédient
(onglet Apothicaire) forçait un re-rendu complet de la fiche (scroll remonté en haut, recherche
effacée) pour une simple incrémentation. Corrigé par une mise à jour directe du DOM (juste le
nombre affiché), sans re-rendu. Voir `JOURNAL.md`, session du 10 septembre 2026 (suite 5).

**Amélioration demandée dans la foulée (v0.6.78)** : quand un ingrédient manquant est restocké
(bouton "+", édition directe, glisser-déposer), la case "Possédé" de chaque sort/rituel concerné
se recoche maintenant automatiquement dès que le stock redevient suffisant — plus besoin de la
recocher à la main. Voir `JOURNAL.md`, session du 10 septembre 2026 (suite 6). **Confirmé par
l'utilisateur en jeu (10 septembre 2026)** : "ça marche bien".

## 27. ~~Navigateur de Compendium — placeholder de recherche incorrect~~ — CORRIGÉ (15 septembre 2026, v0.6.86)

Le champ de recherche affichait « Rechercher un ingrédient... » alors qu'on peut y chercher
n'importe quel type de contenu. Nouvelle clé dédiée `ANTIQUE.Browser.SearchPlaceholder`
(« Rechercher... »), sans toucher aux usages légitimes de l'ancienne clé (boutique alchimie,
onglet Ingrédients). Voir `JOURNAL.md`, session du 15 septembre 2026. **Confirmé par
l'utilisateur en jeu (15 septembre 2026)** : "ça marche bien".

## 28. ~~Navigateur de Compendium — filtre "Bouclier" ne fonctionnait pas~~ — CORRIGÉ (15 septembre 2026, v0.6.87)

Les boucliers ressortaient classés comme "Arme". Cause : `doc.folder` renvoie le document
Folder lui-même (résolu automatiquement par Foundry), pas un id — la comparaison contre une
`Map` indexée par id échouait toujours. Corrigé en lisant `doc.folder?.name` directement. Même
correctif appliqué à l'onglet Historique (bug identique, jamais signalé). Voir `JOURNAL.md`,
session du 15 septembre 2026 (suite). **Confirmé par l'utilisateur en jeu (15 septembre 2026)** :
"ça marche bien".

## 29. ~~Navigateur de Compendium — Capacités de Combat visibles par les joueurs~~ — CORRIGÉ (15 septembre 2026, v0.6.87)

Onglet PNJ réservé au MJ désormais, comme l'onglet Combat des fiches PNJ. Voir `JOURNAL.md`,
session du 15 septembre 2026 (suite). **Confirmé par l'utilisateur en jeu (15 septembre 2026)** :
"ça marche bien".

## 30. ~~Focus perdu au toggle "maîtrisé" d'une compétence~~ — CORRIGÉ (15 septembre 2026, v0.6.88)

Même bug que le point 13b (toggle d'effet, Traits) : re-rendu forcé sans passer par
`captureFocusState`/`restoreFocusState`, la fiche remontait en haut à chaque clic. Corrigé avec
le même patron. Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 2). **Confirmé par
l'utilisateur en jeu (15 septembre 2026)** : "ça marche bien".

## 31. ~~Filtres "Arme de jet" / "Arme à distance" manquants~~ — CORRIGÉ (15 septembre 2026, v0.6.89)

Demande : dans l'onglet Équipement du Navigateur de Compendium, les armes à distance étaient
fondues dans le filtre générique "Arme". Deux filtres dédiés ajoutés, reflétant les deux
dossiers déjà distincts du compendium (choix confirmé par l'utilisateur : filtres séparés,
pas un seul filtre combiné). Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 3). **À
confirmer par l'utilisateur en jeu.**

## 32. ~~Fiche perso passe devant la fiche d'objet à chaque champ modifié~~ — CORRIGÉ (15 septembre 2026, v0.6.90)

Cause : `force: true` sur un `Application#render()` Foundry ramène toujours la fenêtre au
premier plan, même déjà ouverte. `AntiqueItemSheet` et l'utilitaire partagé `refreshSheet()`
rafraîchissaient une fiche déjà ouverte (acteur, autre document) avec `force: true` sans besoin
— corrigé pour ne plus passer `force` sur ces rafraîchissements "en arrière-plan" (les
ouvertures explicites par clic gardent `force: true`, volontairement). Voir `JOURNAL.md`,
session du 15 septembre 2026 (suite 4). **À confirmer par l'utilisateur en jeu.**

## 33. ~~Munitions réelles pour les armes à distance~~ — CORRIGÉ (15 septembre 2026, v0.6.91)

Demandé : flèches, carreaux d'arbalète, pierres de fronde, avec vrai suivi de stock (choix
confirmé : comme les ingrédients, pas de simples objets sans mécanique). Le mécanisme de liaison
munition/décompte au tir existait déjà en entier depuis v0.6.28 — seuls les objets manquaient.
Ajouté : Arbalète (nouvelle arme, 3 paliers) + dossier "Munition" (Flèches, Carreaux
d'arbalète, Pierres de fronde), reconnus par le filtre "Munition" du Navigateur de Compendium.
Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 5). **À confirmer par l'utilisateur en
jeu** — nécessite de cocher les 2 nouveaux correctifs dans l'écran de mise à jour (MJ).

## 34. ~~Catégorie d'attaque des armes jamais définie (les arcs en "Arme blanche")~~ — CORRIGÉ (15 septembre 2026, v0.6.91)

Bug trouvé en creusant le point 33 : aucune arme n'avait jamais `system.category`/
`categoryDistance` explicitement défini, toutes retombaient sur la valeur par défaut du schéma
("Arme blanche" en mêlée) — pas qu'un problème d'affichage, le mauvais bonus d'attaque
s'appliquait pour toute arme qui n'était pas réellement "Arme blanche" (jets, exotiques, à deux
mains, à distance). Corrigé sur les 100 armes du compendium + toute copie déjà possédée. Voir
`JOURNAL.md`, session du 15 septembre 2026 (suite 5). **À confirmer par l'utilisateur en jeu**
— nécessite de cocher le correctif correspondant dans l'écran de mise à jour (MJ).

## 35. ~~PV/PM qui augmentaient à chaque champ modifié~~ — CORRIGÉ (15 septembre 2026, v0.6.92)

Même bug que le point 1 (CA/Sauvegardes, v0.6.38) : `system.pv`/`system.pm` sont à la fois
éditables et cibles valides d'ActiveEffect — sous un buff actif, l'input affichait déjà la
valeur gonflée, resoumise comme nouvelle valeur brute à chaque changement de champ ailleurs sur
la fiche. Corrigé avec le même patron (`pvSource`/`pmSource` lisant `actor._source.system`),
fiches Personnage et PNJ. Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 6). **À
confirmer par l'utilisateur en jeu** (poser un buff de PV, modifier un autre champ, vérifier
que les PV ne bougent plus).

## 36. ~~Nouveau type d'objet "Trésor"~~ — CORRIGÉ (15 septembre 2026, v0.6.93)

Demandé : bijoux, parchemins, lettres, statuettes, parfum, pierres précieuses, cailloux, avec
description/description MJ (cachée des joueurs)/image/prix. Nouveau type d'objet dédié
(`treasure`) plutôt que réutiliser "equipment" (choix confirmé). Premier lot de 7 objets dans
un nouveau compendium "Trésors", avec son propre filtre dans le Navigateur de Compendium
(onglet Équipement). Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 7). **À confirmer
par l'utilisateur en jeu** — nécessite de cocher le correctif "7 premiers objets de trésor"
dans l'écran de mise à jour (MJ), le nouveau compendium étant vide tant qu'il n'est pas
appliqué.

## 37. Fiches PNJ (via jeton) et fiche perso pas synchronisées — EN ATTENTE D'INFO (15 septembre 2026)

Signalé : les valeurs divergent entre la fiche ouverte via un jeton et celle ouverte depuis
l'onglet Acteurs, pour un jeton confirmé "lié" (Actor Link coché) — ce qui, par conception de
Foundry, devrait rendre les deux fiches strictement identiques (même document). Aucune cause
trouvée dans le code (aucun override suspect autour de `token.actor`/mise en cache de fiche).
**Bloqué en attente d'un exemple concret** : quel champ précis diverge, et confirmation qu'il
s'agit bien du même acteur (pas deux acteurs distincts portant le même nom).

## 38. Redimensionnement de fenêtre parfois bloqué — EN ATTENTE D'INFO (15 septembre 2026)

Signalé : après avoir cliqué sur la poignée de redimensionnement d'une fenêtre, il arrive de
rester bloqué en mode redimensionnement même après avoir relâché le clic. Recherche dans
`antique.css`/le code JS du système : rien ne touche `.window-resize-handle`,
`pointer-events`/`touch-action` autour, ni de hook qui forcerait un re-rendu en boucle —
ressemble à un comportement natif Foundry/navigateur (capture de pointeur), pas un bug
introduit par ce système. **À reprendre si l'utilisateur peut préciser** : une fenêtre en
particulier (fiche perso/PNJ, Navigateur de Compendium...) ou une action qui précède
systématiquement le blocage.

## 39. ~~Section Effets pas en dernière position (onglet Traits)~~ — CORRIGÉ (15 septembre 2026, v0.6.94)

Ordre demandé : Avantages, Désavantages, Malédictions, Bénédictions, puis Effets en dernier.
Simple déplacement de bloc dans `character-sheet.hbs`. Voir `JOURNAL.md`, session du
15 septembre 2026 (suite 8). **À confirmer par l'utilisateur en jeu.**

## 40. ~~Munitions pas liables aux armes à distance~~ — CORRIGÉ (15 septembre 2026, v0.6.95)

Bug introduit dans cette même session (point 33) : `system.consumable` mis à `false` au lieu
de `true` sur les 3 munitions — c'est ce flag qui rend un objet sélectionnable comme "Munition
liée" sur une arme. Corrigé (compendium + copies déjà possédées, nouveau correctif dédié
puisque l'ancien reste marqué "appliqué" même s'il a créé les mauvaises données). Voir
`JOURNAL.md`, session du 15 septembre 2026 (suite 9). **À confirmer par l'utilisateur en jeu**
— nécessite de cocher le nouveau correctif dans l'écran de mise à jour (MJ).

## 41. ~~Déplacer un Avantage/Désavantage vers Malédiction/Bénédiction~~ — CORRIGÉ (15 septembre 2026, v0.6.96)

Choix confirmé : glisser-déposer (pas un bouton dédié). Déposer un Avantage/Désavantage déjà
possédé sur la section Bénédictions/Malédictions de l'onglet Traits le reclasse (nouvel objet
du type cible créé avant suppression de l'original, coût non repris — n'existe pas sur
Bénédiction/Malédiction). Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 10). **À
confirmer par l'utilisateur en jeu.**

## 42. ~~Flèches empoisonnées~~ — CORRIGÉ (15 septembre 2026, v0.6.96)

4e munition, dossier "Munition". Pas de mécanique de poison automatisée (aucune arme ne
déclenche de sauvegarde/dégâts additionnels au toucher dans ce système) — note MJ pour
résolution manuelle. Voir `JOURNAL.md`, session du 15 septembre 2026 (suite 10). **À confirmer
par l'utilisateur en jeu** — nécessite de cocher le correctif "Flèches empoisonnées" dans
l'écran de mise à jour (MJ).

## 43. ~~Focus perdu au glisser-déposer d'un objet~~ — CORRIGÉ (15 septembre 2026, v0.6.97)

Même famille que les points 13b/30 : `_onDropItem()` (fiches Personnage et PNJ) n'avait jamais
été mis à jour avec `captureFocusState`/`restoreFocusState`. Voir `JOURNAL.md`, session du
15 septembre 2026 (suite 11). **À confirmer par l'utilisateur en jeu.**

## 44. EN COURS — Effet lié à la description de chaque sort (9/32 faits + 2 sorts à bonus CA, 16 septembre 2026, v0.6.102)

Même ampleur que l'ancien chantier Effets (avantages/désavantages). Traités jusqu'ici :
Bénédiction des Titans (+3 For), Danse du Serpent (+3 Dex), Résilience de l'Immortel (+3 Con),
Eveil du Sage (+3 Int), Méditation des Ancêtres (+3 Ast), Glamour Divin (+3 Cha), Souffle aux
Pieds Legers (+4 Initiative) — tous avec bouton "Appliquer l'effet" au lancer — plus Rage
Incontrôlable et Peau de Fer (bonus de CA seul, +1/+2, via le mécanisme plus simple de "Peau
d'écorce"). **Reste à faire** : les ~21 sorts restants sont purement narratifs (localisation,
communication, divination, dégâts ponctuels, déclencheurs sans hook existant — invocation,
réduction de dégâts, régénération au toucher) — aucun bonus chiffré propre à embarquer sans
inventer un nouveau mécanisme de jeu non demandé ; probablement rien de plus à coder ici, à
confirmer avec l'utilisateur si ce point doit être considéré clos. Voir `JOURNAL.md`, sessions
du 15 et 16 septembre 2026. **À confirmer par l'utilisateur en jeu** — nécessite de cocher les
2 correctifs (`0.6.98` et `0.6.102`) dans l'écran de mise à jour (MJ).

## 45. ~~Reclasser un trait depuis sa propre fiche~~ — CORRIGÉ (15 septembre 2026, v0.6.99)

Deuxième point d'entrée pour la conversion Avantage/Désavantage → Bénédiction/Malédiction
(point 41) : deux boutons dans l'onglet Description de la fiche d'objet, en plus du
glisser-déposer. Logique de conversion déplacée vers `AntiqueItem#convertTraitType()`
(document) pour être partagée par les deux entrées. Voir `JOURNAL.md`, session du
15 septembre 2026 (suite 13). **À confirmer par l'utilisateur en jeu.**

## 46. ~~Focus perdu sur plusieurs boutons d'action~~ — CORRIGÉ (15 septembre 2026, v0.6.100)

Signalé sur le bouton "Consommer" (liste d'ingrédients) ; même famille que 13b/30/43, cette
fois sur des handlers qui rafraîchissent via `refreshSheet()` (volontairement indifférent au
scroll quand il rafraîchit une AUTRE fiche — mais ici c'est la propre fiche de l'utilisateur).
Corrigé sur `.item-consume`, `.dodge-roll`, `.long-rest`, `.spell-cast-btn`, `.weapon-attack`,
`.item-delete`, `.item-equip-btn`, `.npc-combat-quick input` (fiches Personnage et PNJ). Voir
`JOURNAL.md`, session du 15 septembre 2026 (suite 14). **Confirmé par l'utilisateur en jeu
(15 septembre 2026)** : "ça marche bien".

## 47. ~~Vraies images pour les armes/armures~~ — CORRIGÉ (15 septembre 2026, v0.6.101)

120 images fournies par l'utilisateur (`img/equipement/`), cadrées en carré ("contain", sans
perte de pixel). **16 des 74 retenues pour des objets existants (~22 %) se sont révélées
protégées par des droits d'auteur** (jeux vidéo commerciaux, produit Weta Workshop, jeu de
plateau Plaid Hat Games, filigrane de banque d'images, marketplace Patreon) — exclues après
vérification visuelle systématique, signalée à l'utilisateur avant intégration. 58 images
propres retenues, couvrant 60 objets du compendium armes. Voir `JOURNAL.md`, session du
15 septembre 2026 (suite 15). **À confirmer par l'utilisateur en jeu** — nécessite de cocher
le correctif correspondant dans l'écran de mise à jour (MJ).

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) —
  redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque
  changement, puis Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture
  statique (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans
  Foundry.

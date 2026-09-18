# TODO — Bugs Antique

Liste de points remontés par l'utilisateur, à traiter. Créé le 31 août 2026.

---

## 71. ~~Audit complet du code (cohérence + fonctionnement)~~ — CORRIGÉ (18 septembre 2026, v0.6.131)

Demande : "fait un audit de tout le code pour verrifier que tout est cohérent et fonctionel",
avec mot-clé "ultracode" (autorise l'orchestration multi-agents). Workflow à 12 agents (un par
sous-système : documents, data-models, sheets, apps, antique.mjs, migration/PACK_UPDATES,
autres helpers, templates Acteur, templates Objet/Apps, traductions, manifeste, données de
compendium) + vérification adversariale (3 réfutateurs indépendants par anomalie trouvée).
19 constats remontés, tous confirmés, réduits à **16 anomalies distinctes** après fusion des
doublons détectés sous deux angles différents. Toutes corrigées le jour même (choix de
l'utilisateur : "Tout corriger maintenant").

**Critique** : `registerPointsChanceEffectHook()` (`module/helpers/actor-utils.mjs`) lisait
`effect.system.changes` — `ActiveEffect` n'a pas de sous-objet `system`, `changes` est un champ
racine. L'exception levée empêchait le `return false` d'être atteint : glisser un effet "Point
de Chance +1/+2" du compendium créait un ActiveEffect ordinaire invisible au lieu d'incrémenter
`system.pointsChance`. Corrigé (`effect.changes`).

**Majeur** :
- Les objets de type "treasure" (Trésors) n'apparaissaient dans aucun onglet des fiches
  Personnage/PNJ une fois possédés — invisibles, inéditables. Ajoutés à la liste unifiée
  d'inventaire (Personnage) et à une nouvelle section dédiée (PNJ), avec bouton de création sur
  les deux. Leur poids (`system.poids`) compte désormais dans `poidsPorteTotal` (Personnage).
- Navigateur de Compendium : la recherche texte et les filtres par catégorie s'annulaient
  mutuellement (chacun écrasait `row.style.display` sans tenir compte de l'autre) au lieu de se
  cumuler. Unifié dans `refreshBrowserRowVisibility()` (`browser-shared.mjs`), appelée par les
  deux.
- `system.json → documentTypes.Item` n'avait que 7 types sur les 10 réels (treasure/curse/
  npcability manquants) — désynchronisé de `template.json`/`antique.mjs`. Aligné.
- 8 potions (`equipement.db`) et 2 documents du bestiaire (`capacites-combat.db`/`creatures.db`)
  référençaient une icône inexistante dans la bibliothèque Foundry (`flask.svg`/`water.svg`,
  même famille que le bug historique `potion.svg`/point 2) — 404 en jeu. Corrigées à la source
  + nouveau correctif `PACK_UPDATES` (`0.6.131-fix-flask-icon`/`0.6.131-fix-water-icon`) pour
  les copies déjà déployées (compendium, objets du monde, copies sur un acteur/jeton non lié).

**Moyen** :
- `AntiqueActor#applyCaBonus()` lit `system.ca.total`, qui n'existe que sur le schéma
  Personnage (PNJ n'a que `system.ca.value`, pas de `.total`/`.temp`) — un PNJ qui se lance un
  sort à bonus de CA affichait "undefined → undefined CA" sans aucun effet réel. Exclu du
  chemin `applyCaBonus` (`antique.mjs`), même filtre que Divinité.
- Fiche PNJ : aucun moyen de lier une munition à une arme consommable depuis l'onglet Combat
  (existait déjà côté Personnage). Ajouté (`ammoCandidates` + `.munitions-select`).
- `TYPES.Item.npcability` absent des fichiers de langue malgré 53 documents utilisant ce type.
  Ajouté (fr/en).
- Type Item "effect" déclaré dans les 3 manifestes (`system.json`/`template.json`/lang) sans
  DataModel ni sheet enregistrés — résidu de l'ancien chantier Effets (voir mémoire
  `antique-effets-compendium-status`, remplacé depuis par les vrais ActiveEffect). Retiré des
  3 manifestes.

**Mineur** : section morte dans `actor-ref-section.hbs` (jamais alimentée par ses appelants) —
retirée ; libellé "acteurs" peu clair dans l'écran de mise à jour MJ pour le correctif
`0.6.70-backfill-ingredient-bag` — libellé dédié ajouté ; `rollD20()` (`rolls.mjs`) jamais
importée nulle part — supprimée ; clé de traduction `ANTIQUE.Traits.Effects` dupliquée (fr/en) —
dédupliquée ; champ résiduel `system.bonusSexe` sur le PNJ Éphise (mécanique abandonnée,
absente du schéma actuel) — retiré à la source + correctif `PACK_UPDATES`
(`0.6.131-remove-ephise-bonus-sexe`).

Voir `JOURNAL.md`, session du 18 septembre 2026, pour le détail complet (rapport d'audit +
fichiers modifiés). **Confirmés par l'utilisateur en jeu (18 septembre 2026)** : Trésors ("les
trésaur sont ok"), l'apparition d'un Point de Chance ("l'apparaition d'un point de chance est
foncitonel", le bug critique de ce lot), et la recherche + filtres du Navigateur de Compendium
("la recherche du compendium + filtre fonctione en se combiant"). Reste à confirmer :
nécessite de cocher les 3 nouveaux correctifs dans l'écran de mise à jour (MJ) pour les icônes/
champ résiduel déjà déployés ; le reste (code) prend effet immédiatement au rechargement.

**Bug trouvé en testant "Combattant aquatique" (18 septembre 2026, v0.6.132)** : "combatant
aquatique ne semble pas donné + 3 à l'attaque, mais donne bien +2 à la CA" — pas un défaut de
l'effet lui-même (les deux changements sont dans le même ActiveEffect, donc s'appliquent
ensemble), mais un vrai bug distinct trouvé en creusant : le tableau d'armes de la fiche PNJ
(`npc-sheet.hbs`/`.mjs`) affichait `weapon.system.attBonus` brut, jamais combiné avec
`system.attackBonuses[category].total` (le tableau de bonus par catégorie, cible de cette
capacité) — contrairement à la fiche Personnage qui affiche déjà `attTotal` (les deux combinés).
Le jet réel (`AntiqueItem#_executeAttackRoll()`, `item.mjs`) lisait déjà correctement le total
combiné (`this.actor?.system.attackBonuses?.[category]?.total`), donc le jet posté au chat
était probablement déjà juste — seul le nombre affiché dans le tableau était trompeur. Corrigé :
`attTotal`/`attTotalDistance` ajoutés au contexte PNJ (même calcul que la fiche Personnage), le
template affiche désormais le total.

**Retour de test (18 septembre 2026) — TOUJOURS PAS BON, rouvert** : "ça ne va toujours pas sur
combatant aquatique, j'ai la CA qui augmente de + 4 au lieux de +2 et je n'ais toujours pas de
bonus d'attaque de base de +3 (ce n'est pas spécifique à l'arme blanche, mais à toute les
attaques)". Deux infos nouvelles, pas encore expliquées :
- CA +4 au lieu de +2 (suggère l'effet appliqué deux fois, ou un deuxième mécanisme redondant).
- Le bonus d'attaque manque **pour toutes les attaques**, pas seulement "armes blanches" —
  suggère que le bonus devrait viser un champ plus générique que
  `system.attackBonuses.armeBlanche.total` (à confirmer : quelle règle veut l'utilisateur pour
  une capacité "combattant aquatique" — bonus sur toutes les catégories d'attaque, ou juste
  celle utilisée en combat au corps à corps dans l'eau ?).

Vérifié statiquement (source `packs/capacites-combat.db` et `packs/creatures.db`, les deux
copies de l'effet) : **un seul effet embarqué**, un seul jeu de `changes`
(`system.attackBonuses.armeBlanche.total` ADD 3, `system.ca.value` ADD 2) — pas de duplication
dans les données source. Le doublement de CA (+4 au lieu de +2) et l'absence totale du bonus
d'attaque viennent donc soit de l'état déjà déployé dans le monde de l'utilisateur (ex. une
deuxième copie de l'effet/capacité déjà présente sur son PNJ avant ce chantier, ou un
mécanisme séparé qui touche aussi CA), soit d'un problème plus profond pas encore identifié.
**Pas encore corrigé — à reprendre lundi.** Prochaines étapes : demander à l'utilisateur
d'ouvrir l'onglet Effets de son Triton (ou du PNJ concerné) et de compter combien de fois
"Combattant aquatique" apparaît, et clarifier la portée voulue du bonus d'attaque (toutes
catégories vs armes blanches seulement).

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

## 20. ~~Compendium de compétences de combat PNJ façon bestiaire mythologique~~ — CORRIGÉ (16 septembre 2026, toutes étapes confirmées)

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
10 septembre 2026 (suite 7). **Confirmé par l'utilisateur en jeu (16 septembre 2026)**.

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

## 37. ~~Fiches PNJ (via jeton) et fiche perso pas synchronisées~~ — CORRIGÉ (16 septembre 2026, v0.6.104)

Diagnostiqué en jeu avec l'utilisateur (personnage "Antalios") : `token.document.actorLink`
valait `false` — le jeton n'était en fait **pas lié** à sa fiche Acteur, contrairement à ce qui
avait été supposé au premier signalement (15 septembre). Comportement Foundry par conception (un
jeton non lié porte sa propre copie de données), pas un bug du système — mais confirmé que
l'utilisateur veut que le jeton fasse toujours autorité. Choix confirmé : uniquement les
Personnages (PJ) sont concernés, pas les PNJ/créatures (souvent placés plusieurs fois sur une
scène depuis le même acteur, où le non-lié est voulu pour des PV indépendants). Nouvelle
migration `0.6.104` (`migrateLinkCharacterTokens`, `module/helpers/migration.mjs`) : relie tous
les Personnages existants (prototype + jetons déjà placés sur toute scène) ; nouveau hook
`preCreateActor` (`registerCharacterTokenLinkDefault`) pour que tout futur Personnage créé
naisse déjà lié par défaut. Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 18).
**Confirmé par l'utilisateur en jeu (16 septembre 2026)** : "ça marche bien".

## 38. Redimensionnement de fenêtre parfois bloqué — NE S'APPLIQUE PAS (16 septembre 2026)

Signalé : après avoir cliqué sur la poignée de redimensionnement d'une fenêtre, il arrive de
rester bloqué en mode redimensionnement même après avoir relâché le clic. Confirmé comme bug du
**cœur Foundry**, pas de ce système : lecture du code source de Foundry v14.368 installé
localement (`applications/api/application.mjs`) — le redimensionnement (`ApplicationV2`) repose
sur `setPointerCapture`/un unique écouteur `pointerup` pour nettoyer proprement ; si le geste se
termine autrement (souris qui quitte la fenêtre, alt-tab, menu contextuel), le navigateur émet
`pointercancel`/`lostpointercapture` à la place, jamais écoutés par Foundry — le nettoyage ne se
fait jamais et tout mouvement de souris continue à redimensionner. Mécanisme interne (champs/
méthodes privés `#element`/`#onWindowResizeMove`/`#endPointerCapture`), aucun moyen propre de
corriger depuis le code du système. Concerne toutes les fenêtres redimensionnables (Personnage,
PNJ, Objet, Divinité), pas seulement la fiche Personnage où l'utilisateur l'a remarqué en
premier. **Confirmé par l'utilisateur** : effectivement un problème du cœur Foundry, pas du
système Antique — à signaler à Foundry directement si besoin d'une vraie correction, rien à
faire ici.

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

## 68. ~~Assistance/Malédiction — retour au narratif pur~~ — CORRIGÉ (16 septembre 2026, v0.6.124)

Décision finale de l'utilisateur après le point 67 : "il faut vraiment que l'effet soit
applicable sur les PJ, on va garder ça narratif si on ne peut pas ajouter à la description le
lanceur de dés." Ni le bouton de carte de chat (point 62) ni l'effet informatif (point 67)
n'étaient un vrai effet applicable — retour en arrière complet : suppression du bouton "Lancer
le dé", de l'effet informatif dans l'onglet Effets, des champs `rollFormula`/`rollLabel`
(schéma), et de tout le code associé (`item.mjs`, `antique.mjs`, `lang/*.json`). Nouveau
correctif `PACK_UPDATES` (`0.6.124-revert-spells-to-narrative`) pour nettoyer les copies qui
auraient déjà reçu les points 62/67. Assistance et Malédiction sont maintenant identiques aux 6
autres sorts narratifs du dossier Druide — texte seul, aucun bouton, aucun effet. Voir
`JOURNAL.md`, session du 16 septembre 2026 (suite 39). **À confirmer par l'utilisateur en jeu.**

## 69. ~~Auditer et finir tous les sorts (toutes écoles)~~ — CORRIGÉ (17 septembre 2026, v0.6.125)

Demande de l'utilisateur en fin de session du 16 septembre 2026 : "fini tout les sorts" +
mot-clé "ultracode" (autorise l'orchestration multi-agents). Reporté à la prochaine session à sa
demande ("on reprendra demain"). Portée : auditer systématiquement les sorts des dossiers
**Berserk** (7) et **Morrigan** (7), plus reconfirmer les 6 sorts Druide encore narratifs
(Baie nourricière, les 2 Localisation, Sens animal, Gland des quatre chemins, Langue de frêne),
avec la même discipline que les points 44/62/68 : ne mécaniser **que** si un champ système réel
existe déjà à cibler (comme Grâce des Astres Alignés/point 60, oublié la première fois) — sinon
laisser purement narratif, **sans** inventer de bouton "Lancer le dé" ou d'effet informatif
factice (rejeté au point 68, l'utilisateur veut un vrai effet applicable ou rien).

**Audit fait le 17 septembre 2026** (lecture directe, sans workflow multi-agents — pas de
mot-clé "ultracode" dans la demande de reprise) : aucun des 14 sorts Berserk/Morrigan ni des 6
Druide restants ne cible un champ système réel au sens des mécanismes déjà en place
(`system.abilities.*.mod`, `system.initiative`, `system.pointsChance`, `caBonus`) — voir
`JOURNAL.md`, session du 17 septembre 2026, pour le détail sort par sort. Rage Incontrôlable et
Peau de Fer restent les 2 seuls du dossier Berserk déjà mécanisés (`caBonus`, point 44). Les
autres (dégâts, régénération au toucher, peur, résurrection rituelle, vision prophétique, etc.)
n'ont pas d'équivalent existant — dégâts/soins chiffrés explicitement écartés (même refus que le
bouton "Lancer le dé", point 68).

**Point ouvert soumis à l'utilisateur, tranché le jour même** : *Force Déchainée* (rayon 5m) et
*Hurlement de Bataille* (rayon 10m) sont les deux seuls sorts du lot à préciser un rayon —
confirmé d'ajouter `hasTemplate`/`templateRadius` (mécanisme de gabarit de zone déjà utilisé
pour Brouillard, `templateRadius` en mètres réels d'après `system.json`), sans rien inventer de
nouveau. Fait : `packs/sorts.db` + nouveau correctif `PACK_UPDATES`
(`0.6.125-add-spell-templates`) pour les copies déjà déployées (compendium/acteurs/jetons non
liés). Voir `JOURNAL.md`, session du 17 septembre 2026. **Testé en jeu, confirmé** ("ça marche
bien") — deux retours dans la foulée, corrigés en v0.6.126 :
- La texture du gabarit (empruntée à Brouillard, pensée pour boucler) se répétait de façon
  disgracieuse sur un petit gabarit — remplacée par une couleur unie pour les deux sorts.
- Ajout demandé : bouton de jet de sauvegarde sur la carte de lancer de Force Déchainée
  (Robustesse DC 15, d'après le "diff 15" de sa description — pas de save "Constitution" pur
  dans ce système, `robustesse` = con+for, même convention que les capacités de combat PNJ).
  Nouveaux champs `saveAbility`/`saveDC` sur `item-spell.mjs` (mêmes que `npcability`), bouton
  branché dans `castSpell()` (`item.mjs`). **Retour utilisateur immédiat** : ne pas dupliquer le
  bouton en 2 (joueur / MJ-sélection) comme sur `npcability` — un seul bouton, ouvert à tout le
  monde, qui lance le jet pour le(s) jeton(s) actuellement sélectionné(s) (n'importe quel
  nombre), ou pour le personnage assigné du joueur à défaut de sélection. Nouveau hook dédié
  `.spell-save-button` (`antique.mjs`), distinct des deux hooks `.roll-save-button`/
  `.roll-save-selected-button` qui restent inchangés pour `npcability` (postToChat(), patron
  différent : une capacité de PNJ visant un seul joueur, déjà confirmé au point 20).
  **Vérification demandée par l'utilisateur** : Hurlement de Bataille a le même besoin (sa
  description dit "jet de sauvegarde pour ne pas fuir diff 15") — ajouté aussi (Volonté DC 15,
  même convention que les capacités de peur du bestiaire, ex. Gémissement/Rugissement). Audit
  des 5 autres sorts Berserk : aucun autre jet de sauvegarde à cibler — Rage Incontrôlable
  mentionne un "jet de volonté" mais c'est une sauvegarde du **lanceur lui-même**, à un moment
  narratif conditionnel ("si tous les ennemis sont tombés avant la fin de la rage"), pas un jet
  immédiat déclenché au lancer comme les deux autres — **à confirmer avec l'utilisateur si un
  bouton est aussi voulu pour ce cas différent avant d'y toucher**. **À exécuter par
  l'utilisateur** : cocher le correctif (`0.6.126-fix-spell-template-visual-and-save`) dans
  l'écran de mise à jour (MJ), puis confirmer en jeu.

**Icônes des 32 sorts (demandé le 17 septembre 2026)** : les 32 sorts partageaient seulement 4
icônes génériques par école (chêne/Druide, feu/Hécate, épée/Berserk, crâne/Morrigan) — remplacées
par une icône distincte par sort, chaque chemin vérifié dans l'installation Foundry locale avant
usage (même prudence que le bug historique `potion.svg`/point 2). Fait : `packs/sorts.db` +
nouveau correctif `PACK_UPDATES` (`0.6.127-spell-real-icons`). **À exécuter par l'utilisateur** :
cocher le correctif dans l'écran de mise à jour (MJ), puis confirmer en jeu.

**Peau de Fer ne réduisait pas vraiment les dégâts (trouvé le 17 septembre 2026, v0.6.128)** :
son texte dit "réduit les dégâts reçus de moitié et +2 à la CA", mais seul le `caBonus` (+2 CA)
était mécanisé (point 44) — la réduction de moitié n'existait nulle part, le bouton "Appliquer
les dégâts" (`actor.applyDamage()`) infligeait toujours les dégâts pleins. Corrigé :
`applyDamage()` (`actor.mjs`) divise par deux (arrondi à l'inférieur) si la cible porte un effet
actif nommé "Peau de Fer" (même détection par nom que `applyCaBonus()`, pas de nouveau champ).
Le message de chat affiche désormais le montant réellement appliqué (pas le montant brut du jet
de dégâts) avec une mention "réduit de moitié par Peau de Fer" quand c'est le cas. Aucun
correctif `PACK_UPDATES` nécessaire — pur changement de code, prend effet immédiatement.
Premier test négatif ("je ne vois aucune différence"), cause jamais identifiée avec certitude
(probablement le monde pas encore complètement rechargé à ce moment-là) — **confirmé fonctionnel
par l'utilisateur après rechargement complet du monde (17 septembre 2026)**.

## 68b. ~~Rage Incontrôlable — description tronquée + expiration automatique~~ — CORRIGÉ (17 septembre 2026, v0.6.129)

Signalé : dans le panneau d'effets, la description de "Rage Incontrôlable" n'affiche pas le
texte complet du sort. Cause : `applyCaBonus()` (mécanisme partagé par tous les buffs à
`caBonus` — Peau d'écorce, Rage Incontrôlable, Peau de Fer) synthétise un texte de repli
générique ("+N CA") quand aucune description n'est fournie — et le bouton "Appliquer l'effet"
(carte de lancer, `item.mjs`) n'en fournissait justement aucune (contrairement au mécanisme plus
général `applyEffectChanges()`, corrigé pour ça au point 65). Corrigé en ajoutant
`data-item-uuid` au bouton et en résolvant l'item pour lire sa vraie description
(`sourceItem.system.description`) avant l'appel à `applyCaBonus()` (`antique.mjs`) — bénéficie
aux 3 sorts `caBonus`, pas seulement Rage Incontrôlable.

**Investigation demandée** : possibilité de décrémenter un compteur sur l'effet pour le
supprimer automatiquement au bout de 10 tours (durée de Rage Incontrôlable). Confirmé possible
et fait, sans rien inventer : Foundry (v14 installée localement) a un vrai mécanisme de durée
de combat natif (`duration.units: "rounds"`/`value`, migration automatique depuis l'ancien
`duration.rounds`) déjà pisté par `ActiveEffectRegistry` — par défaut `CONFIG.ActiveEffect.
expiryAction` vaut `"update"` (marque juste l'effet expiré, ne le supprime pas), changé en
`"delete"` dans `antique.mjs` (aucun autre effet du système n'utilisait de durée basée sur les
tours jusqu'ici, sans risque). `applyCaBonus()` accepte désormais un `durationRounds` optionnel
(nouveau paramètre) ; `castSpell()` (`item.mjs`) le déduit automatiquement du texte de durée du
sort via une regex `/^(\d+)\s*tours?$/i` — s'applique donc aussi à Peau de Fer ("3 Tours"), pas
seulement à Rage Incontrôlable, sans code supplémentaire. Peau d'écorce ("1h") ne matche pas,
reste permanent comme avant.

Description de Rage Incontrôlable reformulée au passage ("jet de sauvegarde de Volonté" au lieu
de "jet de volonté", terminologie cohérente) — nouveau correctif `PACK_UPDATES`
(`0.6.129-rage-incontrolable-volonte-wording`). Voir `JOURNAL.md`, session du 17 septembre 2026.
**Confirmé par l'utilisateur en jeu (17 septembre 2026)** : "les effets disparaissent bien après
10 tours."

## 67. ~~Assistance/Malédiction invisibles dans l'onglet Effets~~ — CORRIGÉ (16 septembre 2026, v0.6.123)

Signalé après le point 62 : "les sorts de Druide n'ont toujours pas d'effet". Clarifié avec
l'utilisateur (2 questions) : le bouton "Lancer le dé" existait déjà sur la carte de chat, mais
il voulait aussi que le sort apparaisse dans son propre **onglet Effets** (comme tous les autres
sorts), et pas seulement un bouton posté au moment du lancer. Contrainte technique expliquée et
acceptée : impossible d'insérer un bouton cliquable dans la fenêtre native Foundry de
configuration d'un ActiveEffect — solution retenue : effet **informatif** (`changes: []`,
`eSrt000000000009`/`010`) visible dans l'onglet Effets, décrivant le dé en texte ; le bouton
cliquable pour lancer reste sur la carte de chat. `item.mjs` filtré pour ne plus générer de
bouton "Appliquer l'effet" pour un effet sans changement réel (aurait été un bouton qui ne fait
rien). Nouveau correctif `PACK_UPDATES` (`0.6.123-embed-spell-info-effects`). Voir `JOURNAL.md`,
session du 16 septembre 2026 (suite 38). **À confirmer par l'utilisateur en jeu.**

## 66. ~~Suppression d'un effet depuis le panneau — fiche pas rafraîchie~~ — CORRIGÉ (16 septembre 2026, v0.6.122)

Signalé : supprimer un effet via le panneau flottant ne met pas à jour visuellement la liste
des effets dans l'onglet Traits de la fiche restée ouverte. Cause : ce système ne s'appuie
jamais sur le re-rendu automatique de Foundry pour les changements de document embarqué —
chaque point de mutation appelle explicitement `refreshSheet()` (voir `actor.mjs`,
`sheet-utils.mjs`) ; le clic de suppression du panneau (`effects-panel.mjs`, ajouté au point 48)
avait été oublié à ce moment-là. Corrigé : `effect.delete().then(() => refreshSheet(effect.parent))`.
Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 37). **Confirmé par l'utilisateur en jeu
(16 septembre 2026)**.

## 65. ~~Panneau d'effets — description toujours vide~~ — CORRIGÉ (16 septembre 2026, v0.6.121)

Signalé après le point 64 : la description ne s'affiche jamais dans l'infobulle. Cause :
`AntiqueActor#applyCaBonus()`/`applyEffectChanges()` (le mécanisme derrière tous les boutons
"Appliquer l'effet") créent un **nouvel** ActiveEffect sur l'acteur avec seulement `name`/`icon`/
`changes` — la description du sort d'origine n'a jamais été transmise. Corrigé : les deux
méthodes acceptent désormais un paramètre `description` optionnel, transmis à l'effet créé/
mis à jour ; `applyCaBonus()` synthétise une description de repli (`+N CA`) si aucune n'est
fournie (les boutons CA-bonus n'ont pas de texte riche disponible côté DOM) ; le site d'appel de
`applyEffectChanges()` (`antique.mjs`) transmet `spellEffect.description`. Voir `JOURNAL.md`,
session du 16 septembre 2026 (suite 36). **À confirmer par l'utilisateur en jeu.**

## 64. ~~Panneau d'effets — icônes trop petites + infobulle incomplète~~ — CORRIGÉ (16 septembre 2026, v0.6.120)

Suite du point 63 : icônes doublées de taille (32px → 64px), et l'infobulle native (déjà
présente, juste le nom) enrichie avec la description de l'effet et le rappel "Clic gauche pour
retirer l'effet." (nouvelle clé `ANTIQUE.EffectsPanel.RemoveHint`). Description HTML convertie
en texte brut pour l'infobulle (`stripHtml()`, `effects-panel.mjs`). Voir `JOURNAL.md`, session
du 16 septembre 2026 (suite 35). **À confirmer par l'utilisateur en jeu.**

## 63. ~~Repositionner le panneau d'effets~~ — CORRIGÉ (16 septembre 2026, v0.6.119)

Le panneau d'effets flottant du point 48 était positionné en bas à gauche — demandé : le
déplacer en haut à droite, près du chat. `right: calc(var(--sidebar-width, 300px) + 10px)`
(variable CSS native de Foundry, reste juste à côté de la barre latérale même si l'utilisateur
la redimensionne/replie), `top: 6px`, `flex-direction: column` (au lieu de `column-reverse`,
cohérent avec un ancrage en haut plutôt qu'en bas). Voir `JOURNAL.md`, session du 16 septembre
2026 (suite 34). **Confirmé par l'utilisateur en jeu (16 septembre 2026)**.

## 62. ~~Effets pour tous les sorts de Druide~~ — CORRIGÉ (16 septembre 2026, v0.6.118)

Audit des 10 sorts du dossier "Sorts de Druide" : Peau d'écorce (déjà mécanisé, `caBonus`) et
Brouillard (déjà mécanisé, gabarit de zone) n'avaient rien à ajouter. Les 8 autres sont
purement narratifs, aucun champ système existant ne correspond à leur effet (même discipline
que le point 44). Décision avec l'utilisateur : pas de nouveau mécanisme de bonus/malus de
caractéristique pour ça, mais nouveau **bouton "Lancer le dé"** générique (`system.rollFormula`/
`rollLabel`, `item-spell.mjs`) — appliqué à **Assistance** (+1d4) et **Malédiction** (-1d6), les
deux sorts qui nomment un dé précis dans leur texte. Le résultat est manuel (le joueur/MJ
l'applique lui-même), pas une ActiveEffect. Description narrative retravaillée pour les deux.
Les 6 autres (Baie nourricière, Localisation ×2, Sens animal, Gland des quatre chemins, Langue
de frêne) restent tels quels — pas de dé unique et précis à automatiser (formule variable ou
absente). Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 33). **Note (16 septembre
2026)** : manquait la visibilité dans l'onglet Effets — corrigé, voir point 67. **À confirmer
par l'utilisateur en jeu.**

## 61. ~~Gains de Points de Chance sans effet réel~~ — CORRIGÉ (16 septembre 2026, v0.6.117)

Signalé après test du point 60 : les boutons ne mettent pas à jour le compteur. Cause :
`applyEffectChanges()` (mécanisme générique des boutons "Appliquer l'effet") crée un
**ActiveEffect persistant classique**, pensé pour des buffs temporaires (Force, CA, Initiative)
— mais `system.pointsChance` est un simple compteur librement éditable, et son input affiche
volontairement la valeur **brute** (`pointsChanceSource`, point 59) pour éviter le bug CA/PV.
Résultat : le bonus s'appliquait bien "sous le capot" (valeur dérivée) mais ne s'affichait
jamais, et une dépense manuelle (baisser le chiffre) aurait été immédiatement contrée par
l'effet qui aurait continué à ajouter son bonus. Même angle mort repéré côté glisser-déposer
des effets "Point de Chance +1"/"+2" (point 57) — jamais testé isolément par l'utilisateur mais
touché par le même défaut.

Corrigé pour les deux chemins : `applyEffectChanges()` (`actor.mjs`) applique désormais un
changement ciblant `system.pointsChance` directement et définitivement via `actor.update()` au
lieu de créer un effet ; nouveau hook `preCreateActiveEffect`
(`registerPointsChanceEffectHook()`, `actor-utils.mjs`) qui intercepte le glisser-déposer d'un
effet ne ciblant que `system.pointsChance` sur une fiche Personnage, annule sa création et
applique le même traitement direct. Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 32).
**Confirmé par l'utilisateur en jeu (16 septembre 2026)** : "ça fonctionne nickel".

## 60. ~~Grâce des Astres Alignés sans effet~~ — CORRIGÉ (16 septembre 2026, v0.6.116)

Signalé : pas d'effet visible sur ce sort. Cause : son texte ("Offre 1 point de chance à
l'équipe ou 2 à une personne") n'avait jamais pu être mécanisé — `system.pointsChance`
n'existait pas encore au moment du chantier du point 44, c'était l'un des ~22 sorts restés
purement narratifs faute de champ existant à cibler (voir point 44). Maintenant que le compteur
existe (point 56), ajouté avec le même système solo (+2)/groupe (+1) que les 7 autres sorts à
effet embarqué — 8e et dernier sort de ce type. Voir `JOURNAL.md`, session du 16 septembre 2026
(suite 31). **À confirmer par l'utilisateur en jeu** — nécessite de cocher le nouveau correctif
dans l'écran de mise à jour.

## 59. ~~Infobulle des règles de Chance + bug latent des effets +1/+2~~ — CORRIGÉ (16 septembre 2026, v0.6.115)

Demandé : afficher les règles de la Chance en infobulle au survol du bloc (onglet Combat).
Texte ajouté (`ANTIQUE.Combat.PointsChanceHint`).

**Bug trouvé en le faisant** : `system.pointsChance` est éditable ET une cible valide
d'ActiveEffect (via les effets "+1"/"+2" du point 57) — exactement le même patron que les bugs
CA (point 1) et PV/PM (point 35) : l'input affichait la valeur déjà bonifiée par un effet actif,
et la soumission automatique du formulaire à chaque changement de champ ailleurs sur la fiche
l'aurait persistée comme nouvelle valeur brute, gonflant le compteur à chaque sauvegarde tant
qu'un effet restait actif. Corrigé préventivement avec le même patron
(`pointsChanceSource` lisant `actor._source.system.pointsChance`, `actor-sheet.mjs`) avant même
qu'un utilisateur ne le remarque en jeu. Voir `JOURNAL.md`, session du 16 septembre 2026
(suite 30). **À confirmer par l'utilisateur en jeu** (poser un effet "+1", modifier un autre
champ de la fiche, vérifier que la valeur ne gonfle pas).

## 58. ~~Mécanique de dépense/régénération des Points de Chance~~ — DÉJÀ FAIT (confirmé 16 septembre 2026)

Règles reçues : la Chance permet une réussite automatique (dépense d'un point) ; se régénère
lentement — 1 point par scénario, ou via une action valorisée par certaines divinités (Héra,
Hécate, Nike). Clarifié avec l'utilisateur : **entièrement manuel, aucun bouton/automatisation à
coder** — le joueur dépense/gagne des points en éditant directement le compteur (input déjà
livré au point 56) et l'annonce au MJ ; pas de logique spéciale par type de jet. La régénération
via une divinité favorable s'appuie sur les effets "+1"/"+2" du point 57 (glissés manuellement
par le MJ). Rien de plus à coder pour ce point.

## 57. ~~Effets "Point de Chance +1"/"+2"~~ — CORRIGÉ (16 septembre 2026, v0.6.114)

Suite du point 56 : deux effets permanents pour augmenter le compteur. Choix confirmé avec
l'utilisateur : **effets autonomes** (compendium Effets), pas des Avantages achetables — pas de
coût, octroyés manuellement par le MJ (glisser-déposer). Nouveaux documents `eEft...172`/`173`
(`packs/effets.db`), `system.pointsChance` ADD 1/2, phase par défaut ("initial") suffisante —
`pointsChance` n'est jamais recalculé par `prepareDerivedData()` (même raisonnement que les
Auras ciblant `.value`, voir point 51). Nouveau correctif `PACK_UPDATES`
(`0.6.114-create-effets-points-chance`) pour créer ces 2 documents dans le compendium déjà
déployé. Icône `icons/svg/upgrade.svg` réutilisée (générique, déjà utilisée pour les effets
similaires) — pas d'icône "trèfle"/"chance" native dans la bibliothèque Foundry. Voir
`JOURNAL.md`, session du 16 septembre 2026 (suite 29). **Note (16 septembre 2026)** : le
glisser-déposer de ces effets aurait souffert du même bug que le point 61 (jamais testé
isolément) — corrigé en même temps, voir point 61. **À confirmer par l'utilisateur en jeu.**

## 56. ~~Points de Chance (fiche Personnage, onglet Combat)~~ — CORRIGÉ (16 septembre 2026, v0.6.113)

Demandé : mécanique de points de chance, règles pas encore définies — pour l'instant une simple
valeur modifiable en input, dans l'onglet Combat. Nouveau champ `system.pointsChance`
(`actor-character.mjs`, même patron que `deplacement` : jamais touché par
`prepareDerivedData()`), nouveau bloc dans `combat-stats` (`character-sheet.hbs`, même style
visuel que CA/Initiative/Déplacement/Esquive/Parade). **Scope volontairement limité à la fiche
Personnage** (PJ) — la demande dit "fiche de personnage", pas PNJ ; à étendre si demandé. Voir
`JOURNAL.md`, session du 16 septembre 2026 (suite 28). **À confirmer par l'utilisateur en jeu.**

## 55. ~~Version "groupe" de Souffle aux Pieds Legers~~ — CORRIGÉ (16 septembre 2026, v0.6.112)

Dernier des 7 sorts à effet embarqué (point 44) à recevoir sa version groupe (+2 Initiative au
lieu de +4) — `system.initiative`, `phase: "final"` (pas `"abilities"`, aucune dépendance en
cascade pour l'Initiative, voir suite 22). Les 7 sorts ont désormais tous leur bouton "Appliquer
sur un allié". Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 27). **Confirmé par
l'utilisateur en jeu (16 septembre 2026)**.

## 54. ~~Version "groupe" de Résilience de l'Immortel, Méditation des Ancêtres, Glamour Divin~~ — CORRIGÉ (16 septembre 2026, v0.6.111)

Suite des points 52/53 : les 3 derniers sorts à bonus de caractéristique reçoivent le même
traitement (+1 au lieu de +3, bouton dédié). Toujours aucun nouveau code — entrées de données
dans `SPELL_GROUP_EFFECTS` + `packs/sorts.db` + nouveau correctif `0.6.111`. Les 6 sorts à
bonus de caractéristique (voir point 44) ont désormais tous leur version groupe. Reste
**Souffle aux Pieds Legers** (Initiative, +4 solo / +2 groupe selon sa description) — pas encore
demandé par l'utilisateur, description encore au texte "à ajuster manuellement" ; à traiter si
demandé (même mécanisme, cible `system.initiative` en phase `"final"` au lieu de `"abilities"`).
Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 26). **À confirmer par l'utilisateur en
jeu** — nécessite de cocher le nouveau correctif dans l'écran de mise à jour.

## 53. ~~Version "groupe" d'Eveil du Sage~~ — CORRIGÉ (16 septembre 2026, v0.6.110)

Suite du point 52, à la demande de l'utilisateur : même traitement pour Eveil du Sage (+1
Intelligence au lieu de +3). Aucun nouveau code — juste une entrée de données dans
`SPELL_GROUP_EFFECTS` + `packs/sorts.db` + nouveau correctif `0.6.110` (réutilise
`applyEmbedSpellGroupEffects()`, déjà générique). Voir `JOURNAL.md`, session du 16 septembre
2026 (suite 25). **Confirmé par l'utilisateur en jeu (16 septembre 2026)**.

## 52. ~~Version "groupe" de Bénédiction des Titans et Danse du Serpent~~ — CORRIGÉ (16 septembre 2026, v0.6.108)

Demande : le texte de ces 2 sorts (et 4 autres similaires) prévoyait déjà une version plus
faible pour le groupe (+1 au lieu de +3), jusqu'ici laissée "à ajuster manuellement" faute de
mécanisme dédié. Ajouté un **deuxième effet embarqué** sur chacun (`SPELL_GROUP_EFFECTS`,
flag `spellScope: "group"`), avec son propre bouton sur la carte de lancer ("Appliquer sur un
allié") — n'importe quel joueur peut se l'appliquer lui-même à son propre jeton, sans passer par
le lanceur du sort (même patron de résolution de cible que le bouton solo existant :
`game.user.targets` puis jeton contrôlé). `item.mjs` génère désormais un bouton par effet
embarqué au lieu d'un seul (`effects.contents[0]`) ; le handler de clic (`antique.mjs`) lit
`data-effect-id` pour appliquer le bon effet. Mécanisme générique, réutilisable tel quel pour les
4 autres sorts similaires (Résilience de l'Immortel, Eveil du Sage, Méditation des Ancêtres,
Glamour Divin) si demandé plus tard — pas fait ici, seuls les 2 sorts explicitement demandés
traités. Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 23). **Bug trouvé au premier
test** : le bouton "Appliquer sur un allié" ne répondait pas au clic (seul le premier bouton
`.apply-spell-effect` de la carte recevait son écouteur — corrigé en v0.6.109, voir suite 24).
**Confirmé par l'utilisateur en jeu (16 septembre 2026)** sur les deux sorts (Bénédiction des
Titans et Danse du Serpent).

## 51. ~~Bonus de caractéristique des sorts pas répercuté sur les compétences liées~~ — CORRIGÉ (16 septembre 2026, v0.6.107)

Signalé juste après le correctif du point 49 : la Force augmente bien avec "Bénédiction des
Titans", mais les compétences liées à la Force ne suivent pas. Cause : `phase: "final"`
(Foundry) s'applique après la fin complète de `prepareDerivedData()` — trop tard, puisque les
compétences/sauvegardes/CA/bonus d'attaque lisent `abilities.*.mod` *dans* cette même fonction,
avant que la phase "final" n'ait eu lieu. Comparé aux "Auras" des avantages divins (qui ciblent
`system.abilities.*.value`, un champ non recalculé plus loin, jamais touchées par ce bug) : les
sorts ciblent volontairement `.mod` directement (bonus plus fort, cohérent avec le texte "+3" du
sort), donc pas d'équivalent simple en changeant juste la clé visée.

Corrigé en enregistrant une **phase personnalisée** `"abilities"` (`CONFIG.ActiveEffect.phases`,
`antique.mjs`) et en appelant `this.parent.applyActiveEffects("abilities")` juste après le calcul
de base des modificateurs dans `prepareDerivedData()` (`actor-character.mjs` **et**
`actor-npc.mjs`, par cohérence) — juste avant tout ce qui en dépend dans la même fonction. Les 6
sorts concernés (pas Souffle aux Pieds Legers/Initiative, qui n'a aucun dépendant plus loin dans
la fonction) passent de `phase: "final"` à `phase: "abilities"`. Nouveau correctif
`0.6.107-fix-spell-ability-mod-cascade` (id neuf, l'ancien `0.6.105` déjà coché ne serait pas
réappliqué). Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 22). **Confirmé par
l'utilisateur en jeu (16 septembre 2026)**.

## 50. ~~Sous-filtres des sorts instantanés (Berserk/Druide/Morrigan)~~ — CORRIGÉ (16 septembre 2026, v0.6.106)

Demande : dans l'onglet Sorts & Rituels du Navigateur de Compendium, remplacer le filtre unique
"Sort Instantané" par un filtre dédié par école. Les 3 catégories existaient déjà comme dossiers
du compendium et couvrent l'intégralité des 24 sorts non-rituels. Voir `JOURNAL.md`, session du
16 septembre 2026 (suite 21). **À confirmer par l'utilisateur en jeu.**

## 49. ~~Effet du sort "Bénédiction des Titans" (et 6 autres) sans effet réel~~ — CORRIGÉ (16 septembre 2026, v0.6.105)

Signalé : l'effet de "Bénédiction des Titans" (+3 Force) ne modifiait pas la Force affichée sur
la fiche, malgré l'effet embarqué et le bouton "Appliquer l'effet" fonctionnels en apparence.
Vérifié dans le code source de Foundry (`ActiveEffectTypeDataModel`, `Actor#applyActiveEffects`)
: chaque changement d'effet a une `phase` (`"initial"` par défaut) — `prepareDerivedData()`
(`actor-character.mjs`) recalcule `system.abilities.*.mod` et `system.initiative` à partir de
zéro, et ce calcul s'exécute *après* la phase `"initial"` mais *avant* la phase `"final"`. Les 7
sorts à effet embarqué (Bénédiction des Titans, Danse du Serpent, Résilience de l'Immortel,
Eveil du Sage, Méditation des Ancêtres, Glamour Divin, Souffle aux Pieds Legers) ciblaient tous
un de ces deux champs recalculés sans jamais préciser `phase: "final"` — leur bonus était donc
systématiquement appliqué puis immédiatement écrasé, sans jamais atteindre l'affichage. Aucun des
7 n'a jamais réellement fonctionné, malgré une note du 15 septembre affirmant l'inverse pour
l'initiative (vérification de l'ordre théorique, mais le champ `phase` n'avait en fait jamais été
positionné). Corrigé : `phase: "final"` ajouté aux 7 changements (`packs/sorts.db`,
`SPELL_EFFECTS` dans `pack-updates.mjs`) + nouveau correctif `0.6.105-fix-spell-effect-phase` qui
répare aussi les copies déjà embarquées sur un acteur **et sur un jeton non lié** (demande
explicite de l'utilisateur, même angle mort que le point 37). Voir `JOURNAL.md`, session du
16 septembre 2026 (suite 20). **Confirmé par l'utilisateur en jeu (16 septembre 2026)**.

## 44. ~~Effet lié à la description de chaque sort~~ — CORRIGÉ (17 septembre 2026, clos via le point 69)

Même ampleur que l'ancien chantier Effets (avantages/désavantages). Traités jusqu'ici :
Bénédiction des Titans (+3 For), Danse du Serpent (+3 Dex), Résilience de l'Immortel (+3 Con),
Eveil du Sage (+3 Int), Méditation des Ancêtres (+3 Ast), Glamour Divin (+3 Cha), Souffle aux
Pieds Legers (+4 Initiative) — tous avec bouton "Appliquer l'effet" au lancer — plus Rage
Incontrôlable et Peau de Fer (bonus de CA seul, +1/+2, via le mécanisme plus simple de "Peau
d'écorce"). **Reste à faire** : les ~21 sorts restants sont purement narratifs (localisation,
communication, divination, dégâts ponctuels, déclencheurs sans hook existant — invocation,
réduction de dégâts, régénération au toucher) — aucun bonus chiffré propre à embarquer sans
inventer un nouveau mécanisme de jeu non demandé. **Confirmé clos le 17 septembre 2026** :
l'audit du point 69 a couvert systématiquement ces sorts restants (plus Berserk/Morrigan) et n'a
trouvé aucun cas de plus à mécaniser (sauf Force Déchainée/Hurlement de Bataille, gabarit de
zone, voir point 69). Voir `JOURNAL.md`, sessions du 15, 16 et 17 septembre 2026. **À confirmer
par l'utilisateur en jeu** — nécessite de cocher les correctifs (`0.6.98`, `0.6.102`, `0.6.125`)
dans l'écran de mise à jour (MJ).

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

## 48. ~~Icône d'effet sur jeton + panneau d'effets flottant~~ — CORRIGÉ (16 septembre 2026, v0.6.103)

Demande explicite : afficher une icône d'état sur le jeton quand un effet de sort est appliqué,
et rendre les effets du personnage visibles côté MJ via une UI dédiée quand le jeton est
sélectionné, inspirée de Pathfinder 2e, retirable au clic gauche. Précédé d'une recherche à 3
agents en parallèle (lecture du client Foundry v14.367.0 installé) confirmant qu'aucun panneau
d'effets natif n'existe et que `showIcon: ALWAYS` est requis pour l'icône de jeton. Nouveau
`module/apps/effects-panel.mjs` (DOM injecté, pas une ApplicationV2). Revue de code
adversariale (2 agents) menée avant finalisation : a fait corriger un rejet de promesse non
géré sur `effect.delete()` et l'absence d'un hook `deleteActor` (panneau qui restait affiché
avec les anciens effets si l'acteur était supprimé pendant que son jeton restait sélectionné).
Voir `JOURNAL.md`, session du 16 septembre 2026 (suite 17). **À confirmer par l'utilisateur en
jeu.**

## 70. ~~Les effets doivent afficher partout la même icône que le sort qui les a créés~~ — CORRIGÉ (18 septembre 2026, v0.6.130)

Demande : "il faudrait que les effets affichent partout le même icône que les sorts." Diagnostic
posé le 17 septembre 2026, codé le 18 septembre 2026.

Cause confirmée : `AntiqueActor#applyCaBonus()` (`actor.mjs`) acceptait un paramètre `icon`
optionnel avec un repli générique (`icons/svg/upgrade.svg`), mais son unique site d'appel
(`.apply-effect`, `antique.mjs`) ne le fournissait **jamais** — l'effet créé sur l'acteur (Peau
d'écorce, Rage Incontrôlable, Peau de Fer) affichait donc toujours l'icône générique "upgrade".
`AntiqueActor#applyEffectChanges()` (mécanisme jumeau pour les 8 sorts à bonus de
caractéristique, `.apply-spell-effect`) passait déjà correctement `icon: item.img` — confirmé
déjà correct pour ces 8-là, comme supposé. `grantEffectToActor()` (Navigateur de Compendium,
onglet Traits → Effets) copie l'objet effet complet depuis le compendium, donc porte déjà sa
propre icône de longue date — reconfirmé, rien à corriger là.

**Corrigé** : le site d'appel `.apply-effect` (`antique.mjs`) résout désormais `sourceItem.img`
(le `sourceItem` était déjà résolu via `data-item-uuid` depuis le point 68b) et le transmet à
`applyCaBonus()`. **Bug latent trouvé au passage** : les deux méthodes (`applyCaBonus()` et
`applyEffectChanges()`) ne réappliquaient l'icône que sur la branche *création* d'un effet, pas
sur la branche *mise à jour* (effet déjà présent, recast d'un buff déjà actif) — même angle mort
déjà corrigé pour `showIcon` par le passé (point 48/64). Corrigé sur les deux branches des deux
méthodes. Pas de correctif `PACK_UPDATES` nécessaire : ces effets sont créés dynamiquement sur
l'acteur au moment du lancer (pas des documents de compendium à migrer) — la prochaine fois
qu'un buff déjà actif est ré-appliqué (recast), il rafraîchit son icône tout seul via la branche
mise à jour désormais corrigée. Voir `JOURNAL.md`, session du 18 septembre 2026. **À confirmer
par l'utilisateur en jeu.**

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) —
  redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque
  changement, puis Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture
  statique (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans
  Foundry.

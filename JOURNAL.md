# Journal de développement — Système Antique (Foundry VTT)

---

## Session du 15 septembre 2026 (suite 15) — Vraies images pour 60 armes/armures (v0.6.100 → v0.6.101)

Demande : reprendre les images fournies par l'utilisateur dans `img/equipement/` (120 fichiers)
pour remplacer les icônes génériques (un seul SVG partagé par catégorie, ex. toutes les
armures utilisent `icons/svg/shield.svg`) — cadrées en carré pour rentrer dans les vignettes.

**Étape 1 — cadrage** : correspondance fichier→objet établie manuellement (noms de fichiers
pleins de coquilles : "cimetère" pour "cimeterre", "doucle_hache" pour "double_hache",
"bolas_simpàle" pour "bolas_simple", etc.). Cadrage d'abord tenté en "cover" (recadrage centré,
remplit le carré) mais rejeté après vérification visuelle : une épée très allongée perdait sa
pointe et son pommeau. Repris en "contain" (redimensionne dans un carré avec marges, aucun
pixel perdu) — correspond aussi mieux au texte de la demande ("cadrés pour les rentrer dans le
carré").

**Étape 2 — un problème plus grave découvert en vérifiant visuellement chaque image cadrée** :
**16 des 74 images retenues pour des objets existants (~22 %) se sont révélées protégées par
des droits d'auteur** — pas de simples "photos libres" : renders promotionnels de jeux vidéo
commerciaux avec logo (Ubisoft "Immortals Fenyx Rising", "Back 4 Blood"/Warner Bros, une démo
Unreal Engine "ThinkTank Training Centre"), photo produit officielle Weta Workshop
("© WETA WORKSHOP"), composant de jeu de plateau ("© Plaid Hat Games 2016"), filigrane de banque
d'images (pngtree.com), signatures d'artiste identifiables, et plusieurs icônes de marketplace
Patreon vendues sous un nom propre ("Wyrmshide Bow", "Kirin Hornbow", "Flanker's Bow",
"Redeemer's Regards", "Arc of the Alicorn", "The Griffon's Saddlebag", "Dungeon Strugglers").
Signalé immédiatement à l'utilisateur avant toute intégration — confirmé : vérifier chaque
image et exclure les problématiques plutôt que les utiliser telles quelles.

**Résultat final** : 58 images propres retenues (sur les 74 initialement cadrées), couvrant
60 objets du compendium armes (l'Arbalète, sans photo par palier, réutilise sa seule image
pour ses 3 paliers). Copiées dans `img/items/` (nouveau dossier, chemin
`systems/antique/img/items/<nom>`) — les images d'origine dans `img/equipement/` restent
intactes, ce sont les fichiers livrés par l'utilisateur. Les objets dont la seule image
disponible était protégée (ex. Bouclier de bois, Bouclier cuivre, Épée courte "Bonne facture",
Glaive "Parfaite facture") gardent leur icône générique faute d'alternative propre.

Comme pour toute modification de contenu déjà déployé, `packs/armes.db` (source) a été mis à
jour mais ça ne suffit pas à propager le changement au monde déjà en jeu — nouveau correctif
`PACK_UPDATES` (`0.6.101-weapon-armor-real-images`) qui met à jour le compendium déployé et
toute copie déjà possédée par un acteur.

**Fichiers modifiés/créés** : `img/items/` (58 nouveaux fichiers), `packs/armes.db`,
`module/helpers/pack-updates.mjs`, `system.json`.

---

## Session du 15 septembre 2026 (suite 14) — Focus perdu sur plusieurs boutons d'action (v0.6.99 → v0.6.100)

Signalé : le bouton "Consommer" de la liste d'ingrédients remonte la fiche en haut au
rafraîchissement — même famille que les points 13b/30/43, mais cette fois sur des handlers qui
appellent une méthode (`item.consume()`, `castSpell()`, `rollAttack()`, `rollDodgeSkill()`...)
dont le rafraîchissement passe par `refreshSheet()` — un utilitaire *volontairement*
indifférent au scroll/focus (il sert à rafraîchir une fiche *différente* de celle sur laquelle
l'utilisateur agit, voir le point 32). Quand l'acteur rafraîchi via `refreshSheet()` est en fait
la **propre fiche déjà ouverte** de l'utilisateur (le cas courant ici), il faut capturer/
restaurer l'état localement dans le handler du bouton, pas compter sur `refreshSheet()`.

Audité et corrigé sur les fiches Personnage et PNJ, tout handler de clic appelant une méthode
mutante sans déjà passer par `captureFocusState`/`restoreFocusState` : `.item-consume`,
`.dodge-roll`, `.long-rest`, `.spell-cast-btn`, `.weapon-attack`, `.item-delete`,
`.item-equip-btn` (fiche Personnage) + les mêmes plus `.npc-combat-quick input` (fiche PNJ).
`.weapon-damage`/`.save-roll`/`.item-chat`/`.spell-chat` vérifiés non concernés (ne mutent
jamais l'acteur, pas de rafraîchissement à préserver).

**Fichiers modifiés** : `module/sheets/actor-sheet.mjs`, `module/sheets/npc-sheet.mjs`.

---

## Session du 15 septembre 2026 (suite 13) — Deuxième point d'entrée pour reclasser un trait (v0.6.98 → v0.6.99)

Demande : en plus du glisser-déposer (suite 10), pouvoir reclasser un Avantage/Désavantage en
Bénédiction/Malédiction directement depuis la fiche de l'objet ("par exemple avec une
checkbox"). Choisi : deux boutons ("Convertir en" Bénédiction / Malédiction) dans l'onglet
Description — plus adapté qu'une case à cocher pour une action ponctuelle et destructrice
(l'objet d'origine est supprimé) plutôt qu'un état à bascule.

Refactor au passage : la logique de conversion (créer le nouvel objet avant de supprimer
l'ancien, coût non repris) vivait uniquement dans `AntiqueActorSheet#_convertTraitType()` —
déplacée vers `AntiqueItem#convertTraitType()` (document, pas fiche) pour être appelable
depuis les deux points d'entrée sans dupliquer le code. La fiche d'objet se ferme après
conversion (son propre document n'existe plus).

**Fichiers modifiés** : `module/documents/item.mjs`, `module/sheets/actor-sheet.mjs`,
`module/sheets/item-sheet.mjs`, `templates/item/advantage-sheet.hbs`,
`templates/item/disadvantage-sheet.hbs`, `css/antique.css`, `lang/fr.json`, `lang/en.json`.

---

## Session du 15 septembre 2026 (suite 12) — Effet lié à la description d'un sort (2 premiers exemples) (v0.6.97 → v0.6.98)

Demande : chaque sort devrait avoir un effet lié à sa description, comme les avantages/
désavantages. 37 sorts existent, 32 ont déjà un champ "Effet" textuel — même ampleur que
l'ancien chantier Effets (avantages/désavantages). Décision confirmée avec l'utilisateur :
commencer par 2-3 exemples avant de généraliser, comme à l'époque.

**Point de mécanique clarifié avant de coder** : contrairement à un avantage (trait permanent,
effet actif tant qu'il est possédé), un sort à bonus chiffré (ex. Peau d'écorce, +2 CA pendant
1h) ne doit bonifier que pendant sa durée, pas juste parce qu'on connaît le sort. Confirmé avec
l'utilisateur : le bonus doit s'appliquer automatiquement au lancer (bouton "Appliquer l'effet"
sur la carte de chat, comme le mécanisme CA existant), pas juste une référence descriptive.

**Découverte en creusant** : "Peau d'écorce" avait déjà ce mécanisme — `system.caBonus` +
bouton "Appliquer l'effet" (`AntiqueActor#applyCaBonus()`, existant depuis longtemps, jamais
généralisé au-delà de la CA). Généralisé :
- Nouveau `AntiqueActor#applyEffectChanges(changes, {name, icon})` (`actor.mjs`) : même
  patron créer-ou-rafraîchir que `applyCaBonus()`, mais accepte n'importe quel tableau de
  `changes` au lieu d'un seul montant de CA codé en dur.
- `AntiqueItem#castSpell()` : un sort sans `caBonus` mais avec un effet embarqué
  (`transfer:false`, comme les avantages/bénédictions) affiche désormais un bouton générique
  "Appliquer l'effet" (`.apply-spell-effect`, `data-item-uuid`) au lieu du bouton CA-only.
- Nouveau hook `renderChatMessageHTML` (`antique.mjs`) pour ce bouton générique — même
  résolution de cible (ciblé → jeton sélectionné → lanceur) que le bouton CA existant.
- **2 sorts traités** : Bénédiction des Titans (+3 Force) et Danse du Serpent (+3 Dextérité) —
  effet embarqué directement sur le sort (`transfer:false`, sans document Effet autonome
  séparé ni lien `@UUID` dans la description : contrairement aux avantages, les sorts ont déjà
  leur propre champ "Effet" résumé, même convention que les bénédictions qui n'ont pas non
  plus de document Effet séparé). Variante "+1 pour le groupe" laissée à l'ajustement manuel du
  MJ (non modélisée).

**Fichiers modifiés** : `module/documents/actor.mjs`, `module/documents/item.mjs`,
`antique.mjs`, `packs/sorts.db`, `module/helpers/pack-updates.mjs`, `lang/fr.json`,
`lang/en.json`.

---

## Session du 15 septembre 2026 (suite 11) — Focus perdu au glisser-déposer d'un objet (v0.6.96 → v0.6.97)

Signalé : glisser un objet (ex. depuis Alchimie) dans le sac à ingrédient d'un PJ remonte la
liste tout en haut à chaque fois. Même famille de bug que les points 13b/30 (toggle d'effet,
toggle de compétence) : `AntiqueActorSheet#_onDropItem()` et `AntiqueNpcSheet#_onDropItem()`
n'avaient jamais été mis à jour avec `captureFocusState`/`restoreFocusState` — un oubli plus
ancien que les autres correctifs déjà appliqués cette session, jamais remarqué faute de test.
Corrigé sur les 4 issues possibles de `_onDropItem` (dépôt sur un emplacement d'équipement,
reclassement de trait, empilement d'un objet glissé d'ailleurs, dépôt générique).

**Fichiers modifiés** : `module/sheets/actor-sheet.mjs`, `module/sheets/npc-sheet.mjs`.

---

## Session du 15 septembre 2026 (suite 10) — Glisser-déposer Avantage/Désavantage → Bénédiction/Malédiction + Flèches empoisonnées (v0.6.95 → v0.6.96)

Deux demandes :

1. **Glisser-déposer un trait pour le reclasser.** Déposer un Avantage ou un Désavantage déjà
   possédé sur la section Bénédictions ou Malédictions de l'onglet Traits le convertit — choix
   confirmé avec l'utilisateur : glisser-déposer plutôt qu'un bouton dédié. Techniquement,
   Foundry ne permet pas de changer le `type` d'un document existant : `_onDropItem()`
   (`actor-sheet.mjs`) détecte le dépôt sur une section marquée `data-trait-section` (nouvel
   attribut sur les 4 sections de traits), et `_convertTraitType()` crée un nouvel objet du
   type cible (nom/image/description/note MJ/effets embarqués repris) **avant** de supprimer
   l'original — jamais l'inverse, pour ne rien perdre en cas d'échec. Le champ "coût"
   (Avantage/Désavantage) n'est délibérément pas repris : il n'existe pas sur Bénédiction/
   Malédiction (une malédiction est subie, pas choisie — voir le commentaire déjà présent dans
   `item-curse.mjs`). Reste de la ligne (`.item-list .item`) déjà glissable nativement par le
   mixin DragDrop de Foundry (`dragSelector: ".item-list .item"`, `draggable` posé en JS), donc
   aucun changement côté template pour l'activer. Surbrillance au survol ajoutée par cohérence
   avec `.equip-slot.drag-over` déjà existant.
2. **Flèches empoisonnées** — 4e munition, même dossier "Munition" que les 3 précédentes.
   Aucune mécanique de poison automatisée dans ce système (aucune arme ne déclenche de jet de
   sauvegarde ou de dégâts additionnels au toucher) — laissé comme note MJ à résoudre
   manuellement, même convention que les objets narratifs du compendium Trésors.

**Fichiers modifiés/créés** : `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`,
`css/antique.css`, `packs/_add-fleche-empoisonnee.js` (nouveau), `packs/armes.db`,
`module/helpers/pack-updates.mjs`.

---

## Session du 15 septembre 2026 (suite 9) — Munitions non liables aux armes (v0.6.94 → v0.6.95)

Signalé : les munitions ajoutées en (suite 5) n'apparaissaient pas dans le menu "Munition liée"
d'une arme à distance. **Cause : bug introduit par moi-même dans cette même session** —
`system.consumable` avait été mis à `false` sur les 3 munitions (Flèches, Carreaux d'arbalète,
Pierres de fronde) au lieu de `true`. Ce flag n'a rien à voir avec la notion "arme consommable"
(qui vit sur l'arme elle-même) : côté objet d'équipement, c'est précisément ce qui rend un
objet sélectionnable comme munition liée (`context.ammoOptions`/`ammoCandidates`, tous deux
filtrent sur `system.consumable`), et je l'avais confondu avec le sens "consommable façon
ration/potion à usage unique" (`AntiqueItem#consume()`), pas encore pertinent pour ces objets.

Corrigé : `packs/armes.db` (les 3 lignes concernées), `packs/_add-arbalete-munitions.js`
(le générateur, pour toute réutilisation future), et un nouveau correctif `PACK_UPDATES`
(`0.6.95-fix-munition-consumable`) pour corriger le compendium déjà déployé **et** toute copie
déjà récupérée par un joueur (l'ancien correctif `0.6.91-create-arbalete-munitions`, s'il a
déjà été appliqué, reste marqué "appliqué" dans `appliedPackFixes` même s'il a créé des
documents avec le mauvais flag — un nouvel id de correctif était nécessaire, pas une
modification de l'ancien).

**Fichiers modifiés** : `packs/armes.db`, `packs/_add-arbalete-munitions.js`,
`module/helpers/pack-updates.mjs`.

---

## Session du 15 septembre 2026 (suite 8) — Section "Effets" déplacée en dernier dans l'onglet Traits (v0.6.93 → v0.6.94)

Demandé : repositionner la section Effets de la fiche personnage en dernier. Ordre précédent
dans l'onglet Traits : Avantages, Désavantages, Malédictions, **Effets**, Bénédictions. Nouvel
ordre : Avantages, Désavantages, Malédictions, Bénédictions, **Effets**. Simple déplacement de
bloc dans `templates/actor/character-sheet.hbs`, aucune logique changée.

---

## Session du 15 septembre 2026 (suite 7) — Nouveau type d'objet "Trésor" (v0.6.92 → v0.6.93)

Demande : objets de trésor (bijoux, parchemins, lettres, statuettes à l'effigie d'un dieu,
parfum, pierres précieuses, cailloux...) avec description, description MJ (cachée des
joueurs), image et prix. Choix confirmé avec l'utilisateur : un nouveau type d'objet dédié et
simple plutôt que réutiliser "equipment" (qui aurait affiché des champs sans rapport —
emplacement, consommable, bonus de compétence...).

- Nouveau type d'objet `treasure` (`template.json`, `module/data-models/items/item-treasure.mjs`)
  : `quantity`, `price`, `poids`, `description`, `gmNotes` — rien d'autre.
- Nouvelle fiche minimale `templates/item/treasure-sheet.hbs` (image, nom, description,
  description MJ visible seulement si `isGM`, prix, poids) — même patron que la section
  Description/gm-notes d'`equipment-sheet.hbs`, sans les onglets Détails/Effets superflus.
- Nouveau compendium "Trésors" (`packs/tresors.db`, `packs/_build-tresors.js`) : 7 premiers
  objets (Bijou orné, Parchemin scellé, Lettre cachetée, Statuette à l'effigie d'un dieu,
  Flacon de parfum, Pierre précieuse, Caillou) — les 2 derniers ont un prix "0 po" plutôt que
  vide : l'onglet Équipement du Navigateur de Compendium n'affiche que les objets avec un
  `system.price` non-vide, une chaîne vide les aurait masqués.
- Nouveau filtre "Trésor" dans l'onglet Équipement du Navigateur de Compendium
  (`classifyEquipmentItem()` reconnaît `antique.tresors`).
- Nouveau correctif `PACK_UPDATES` (`0.6.93-create-tresors`) pour peupler ce nouveau
  compendium dans un monde déjà déployé — un pack tout neuf déclaré dans `system.json` est
  créé vide par Foundry au redémarrage, son contenu doit ensuite être créé en direct (même cas
  que l'Arbalète/Munition ci-dessus).

**Fichiers modifiés/créés** : `template.json`, `antique.mjs`,
`module/data-models/items/item-treasure.mjs` (nouveau), `templates/item/treasure-sheet.hbs`
(nouveau), `module/sheets/item-sheet.mjs`, `module/apps/compendium-browser.mjs`,
`module/helpers/pack-updates.mjs`, `packs/_build-tresors.js` (nouveau), `packs/tresors.db`
(nouveau), `system.json`, `lang/fr.json`, `lang/en.json`.

---

## Session du 15 septembre 2026 (suite 6) — PV/PM qui augmentaient à chaque modification de champ (v0.6.91 → v0.6.92)

Signalé : cocher la case "Sac à ingrédient" (onglet Background), ou modifier les points de
mana, faisait augmenter les PV — en fait dès qu'on touchait n'importe quel champ de la fiche.

**Même bug, exactement, que le point 1 du `TODO_BUG_ANTIQUE.md`** (CA/Sauvegardes qui
augmentaient à chaque update, v0.6.38) : `system.pv.value`/`system.pv.max` (et
`system.pm.*`) sont à la fois des champs éditables ET des cibles valides d'ActiveEffect en
mode ADD (voir `ANTIQUE.getEffectChangeLabel`, `config.mjs`, qui gère explicitement
"system.pv.max"/"system.pv.value"). Foundry applique les ActiveEffect avant
`prepareDerivedData()` — l'input affichait donc déjà `valeur_stockée + bonus_actif`, et la
soumission du formulaire à chaque changement de champ (`submitOnChange: true`) persistait
cette valeur gonflée comme nouvelle valeur brute, regonflée à nouveau au rendu suivant.

Corrigé avec exactement le même patron que `caTempSource`/`tempSource` (`actor-sheet.mjs`,
v0.6.38) : les inputs PV/PM lisent désormais la valeur brute persistée
(`actor._source.system.pv`/`.pm`, jamais touchée par les ActiveEffect) via `pvSource`/
`pmSource`, sur la fiche Personnage ET la fiche PNJ (même schéma, même risque).

**Fichiers modifiés** : `module/sheets/actor-sheet.mjs`, `module/sheets/npc-sheet.mjs`,
`templates/actor/character-sheet.hbs`, `templates/actor/npc-sheet.hbs`.

---

## Session du 15 septembre 2026 (suite 5) — Munitions, Arbalète, et catégorie d'arme corrigée (v0.6.90 → v0.6.91)

Demande : munitions réelles (flèches, carreaux d'arbalète, pierres de fronde) pour les armes à
distance, avec un vrai suivi de stock (comme les ingrédients d'alchimie), pas juste des objets
listés sans mécanique. Bug signalé en cours de route : "les arcs sont notés en catégorie Arme
blanche, ils devraient être Arme à distance".

**Découverte en creusant le mécanisme de munitions** : celui-ci existait déjà en entier depuis
v0.6.28 (`AntiqueItem#_doRollAttack`/`#consume`, sélecteur `.munitions-select` dans l'onglet
Combat, `system.linkedAmmoId` + `system.quantity` sur l'objet lié) — **seuls les objets de
munition eux-mêmes n'avaient jamais été créés** (le filtre "Munition" du Navigateur de
Compendium existait déjà, vide, en attente). Le travail de cette session est donc presque
entièrement du contenu, pas un nouveau mécanisme.

**Cause du bug de catégorie** (bien plus large que les arcs) : `system.category` /
`system.categoryDistance` n'ont **jamais** été explicitement définis sur aucune des 100 armes
du compendium (ni par `packs/_build-armes.js` à l'origine, ni par aucun correctif depuis) —
toutes reposaient donc silencieusement sur la valeur par défaut du schéma
(`item-weapon.mjs` : `"armeBlanche"`/`"armeADistance"`), correcte par coïncidence uniquement
pour les armes réellement "Arme blanche". Toute arme de jet/exotique/à deux mains utilisait
donc le mauvais bonus d'attaque au jet (pas seulement un problème d'affichage).

**Piège évité** : `packs/_build-armes.js` s'est révélé **périmé par rapport aux données
réellement déployées** — il ne génère ni `system.poids` ni `system.category` (ces champs n'ont
été ajoutés au monde qu'via des correctifs `PACK_UPDATES` a posteriori, ex. `0.6.65-item-
weights-armes`, jamais reportés dans le script générateur lui-même, même convention que
`packs/_add-item-weights.js`). Une tentative de régénérer entièrement `armes.db` via ce script
aurait donc silencieusement fait disparaître `poids` de tous les objets déjà déployés (vérifié
et annulé avant tout dégât — voir `[[antique-current-todo-tracker]]`). Corrigé en travaillant
**exclusivement en ajout** : nouveau script `packs/_add-arbalete-munitions.js`, qui lit
`armes.db` existant et n'ajoute que 7 nouvelles lignes à la fin (ids continuant après le plus
haut déjà utilisé, 116 → 117+), sans toucher aux 116 lignes déjà présentes.

**Contenu ajouté** :
- Nouvelle arme "Arbalète" (3 paliers, dossier "Arme à distance").
- Nouveau dossier "Munition" + 3 objets (`equipment`, `quantity` = stock réel) : Flèches,
  Carreaux d'arbalète, Pierres de fronde.
- `classifyEquipmentItem()` (`compendium-browser.mjs`) reconnaît maintenant le dossier
  "Munition" → filtre "munition" (jusqu'ici jamais atteint, faute d'objets).

**Correctifs appliqués à TOUT ce qui est déjà déployé**, via deux nouvelles entrées
`PACK_UPDATES` (`module/helpers/pack-updates.mjs`, cochables par le MJ) :
- `0.6.91-fix-weapon-categories` : corrige `system.category`/`categoryDistance` sur les 100
  armes du compendium + toute copie déjà possédée par un acteur, d'après une table de
  correspondance nom→catégorie (`WEAPON_CATEGORIES`).
- `0.6.91-create-arbalete-munitions` : crée l'Arbalète + le dossier Munition + les 3 munitions
  directement dans le pack déployé (mêmes ids que le script ci-dessus, `keepId: true`) — une
  simple copie du fichier `armes.db` mis à jour n'aurait pas suffi, un document tout neuf dans
  un pack déjà déployé n'apparaît jamais tant qu'il n'est pas créé en direct (voir
  `[[antique-system-overview]]`, cas n°3).

**Rattrapage constaté au passage** : `module/helpers/release-notes.mjs` n'avait pas été mis à
jour depuis la v0.6.85 (5 versions manquantes, 0.6.86→0.6.90, toutes de cette session) —
entrées ajoutées rétroactivement.

**Fichiers modifiés** : `packs/_add-arbalete-munitions.js` (nouveau), `packs/armes.db`,
`module/apps/compendium-browser.mjs`, `module/helpers/pack-updates.mjs`,
`module/helpers/release-notes.mjs`.

---

## Session du 15 septembre 2026 (suite 4) — La fiche perso passait devant la fiche d'objet à chaque champ modifié (v0.6.89 → v0.6.90)

Signalé : éditer un objet (ex. changer la catégorie d'une arme) faisait systématiquement passer
la fenêtre de la fiche de personnage devant celle de l'objet en cours d'édition, à chaque
changement de champ.

Cause, dans Foundry lui-même (vérifié dans le code source client,
`client/applications/api/application.mjs`) : l'option `force: true` passée à `Application#render()`
déclenche `this.maximize().then(() => this.bringToFront())` — y compris quand l'appli était déjà
rendue. `AntiqueItemSheet#_processSubmitData()` (`item-sheet.mjs`) rafraîchissait la fiche
acteur déjà ouverte après chaque soumission (`actorSheet.render({ force: true })`) pour garder
ses tableaux à jour — mais ce `force` n'était pas nécessaire (la fiche acteur est déjà ouverte,
un `render()` simple suffit à rafraîchir son contenu) et avait pour seul effet de la ramener au
premier plan à chaque fois.

Corrigé à deux endroits : `AntiqueItemSheet#_processSubmitData()` et l'utilitaire partagé
`refreshSheet()` (`module/helpers/sheet-utils.mjs`, utilisé par de nombreux autres points —
incantation de sort, tir d'une arme consommable, repos long, etc. — pour rafraîchir une fiche
déjà ouverte ailleurs après une mutation faite depuis un autre document) — les deux ne passent
plus `force` puisqu'ils ne rafraîchissent que des fiches déjà confirmées ouvertes (`?.rendered`).
Les fiches ouvertes explicitement par un clic (ex. "éditer cet objet", "créer un effet") gardent
`force: true`, volontairement — sur une fiche pas encore ouverte c'est ce qui l'ajoute au DOM, et
le premier plan y est de toute façon l'effet attendu.

**Fichiers modifiés** : `module/sheets/item-sheet.mjs`, `module/helpers/sheet-utils.mjs`.

---

## Session du 15 septembre 2026 (suite 3) — Filtres "Arme de jet" et "Arme à distance" (v0.6.88 → v0.6.89)

Demandé : dans l'onglet Équipement du Navigateur de Compendium, les armes à distance (jets et
tir) étaient toutes fondues dans le filtre générique "Arme" — ajout de deux filtres dédiés.
Clarifié avec l'utilisateur : deux filtres séparés reflétant les deux dossiers déjà distincts
du compendium `antique.armes` (`packs/_build-armes.js`), pas un seul filtre combiné.

- Deux nouvelles entrées dans les filtres de l'onglet Équipement :
  `ANTIQUE.Browser.FilterArmeJet` ("Arme de jet") et `ANTIQUE.Browser.FilterArmeDistance`
  ("Arme à distance").
- `classifyEquipmentItem()` (`module/apps/compendium-browser.mjs`) vérifie désormais le nom du
  dossier d'un item de type `weapon` : "Arme de jet" → `arme-jet`, "Arme à distance" →
  `arme-distance`, tout le reste (Arme blanche/exotique/à deux mains) reste dans `arme` comme
  avant.

**Fichiers modifiés** : `module/apps/compendium-browser.mjs`, `lang/fr.json`, `lang/en.json`.

---

## Session du 15 septembre 2026 (suite 2) — Focus perdu au toggle "maîtrisé" d'une compétence (v0.6.87 → v0.6.88)

Même famille de bug que le point 13b du `TODO_BUG_ANTIQUE.md` (toggle actif/inactif d'un effet
dans l'onglet Traits, v0.6.68) : le bouton "maîtrisé" d'une compétence (`.skill-trained`,
`actor-sheet.mjs`) appelait `actor.update()` puis `this.render({ force: true })` sans passer par
`captureFocusState`/`restoreFocusState` — le re-rendu forcé remontait donc la fiche en haut à
chaque clic. Corrigé en appliquant le même patron que le toggle d'effet (capture avant l'update,
restore après le render). Voir `JOURNAL.md`, cette session.

**Fichiers modifiés** : `module/sheets/actor-sheet.mjs`.

---

## Session du 15 septembre 2026 (suite) — Filtre Bouclier + onglet Capacités de Combat réservé au MJ (v0.6.86 → v0.6.87)

Deux bugs signalés dans le Navigateur de Compendium :

1. **Les boucliers apparaissaient sous le filtre "Arme" au lieu de "Bouclier"** (et, en
   creusant, les armures avaient très probablement le même souci — juste jamais remarqué).
   Cause réelle, dans `classifyEquipmentItem()` (`module/apps/compendium-browser.mjs`) : le
   champ `folder` d'un document Foundry est un `ForeignDocumentField` — dès l'initialisation du
   document, Foundry le résout en le **document Folder lui-même** (vérifié dans le code source
   client, `common/data/fields.mjs`, `ForeignDocumentField#initialize`), jamais en un simple id
   string. Le code construisait une `Map` `folderNamesById` indexée par `folder.id` puis faisait
   `folderNamesById.get(doc.folder)` — `doc.folder` étant un objet Folder et non son id, la
   recherche échouait toujours silencieusement, et la fonction retombait systématiquement sur
   son cas par défaut `"arme"`. Corrigé en lisant directement `doc.folder?.name` (plus besoin de
   Map du tout). **Même bug corrigé en passant** dans la classification de l'onglet Historique
   (`filterByFolder`, `doc => doc.folder` → `doc => doc.folder?.id`) — jamais signalé, mais
   souffrait très probablement du même problème (le filtre par dossier n'aurait jamais pu
   fonctionner).
2. **Les joueurs ne devraient pas voir l'onglet "Capacités de Combat" (PNJ)** — contenu
   mécanique réservé au MJ, comme l'onglet Combat des fiches PNJ (`npc-sheet.mjs`, déjà
   `isGM`-gated). Nouveau flag `gmOnly: true` sur cette entrée de `TABS`, onglet sauté
   entièrement dans `_prepareContext` (`if (tabDef.gmOnly && !game.user.isGM) continue;`) —
   invisible pour un non-MJ, pas juste désactivé/grisé.

**Fichiers modifiés** : `module/apps/compendium-browser.mjs`.

---

## Session du 15 septembre 2026 — Placeholder de recherche du Navigateur de Compendium (v0.6.85 → v0.6.86)

Signalé : le champ de recherche du Navigateur de Compendium affichait « Rechercher un
ingrédient... » alors qu'on peut y chercher n'importe quel type de contenu (armes, sorts,
traits, créatures, etc.), pas seulement des ingrédients.

Cause : `templates/apps/compendium-browser.hbs` réutilisait telle quelle la clé
`ANTIQUE.Apoth.SearchPlaceholder`, partagée avec la boutique alchimie (`alchemy-shop.hbs`) et
l'onglet Ingrédients de la fiche personnage (`character-sheet.hbs`) — correcte à ces deux
endroits, où la recherche porte bien uniquement sur des ingrédients.

Corrigé en donnant au Navigateur de Compendium sa propre clé générique
`ANTIQUE.Browser.SearchPlaceholder` (« Rechercher... » / « Search... »), sans toucher aux deux
autres usages.

**Fichiers modifiés** : `templates/apps/compendium-browser.hbs`, `lang/fr.json`, `lang/en.json`.

---

## Session du 13 septembre 2026 — Effets et Capacités de Combat dans le Navigateur de Compendium (v0.6.84 → v0.6.85)

Reprise du point #24 laissé en pause en fin de session précédente.

- `antique.effets` ajouté à l'onglet Traits du Navigateur de Compendium
  (`module/apps/compendium-browser.mjs`), aux côtés d'avantages/désavantages/bénédictions/
  avantages-divins (`filterByPack: true`, donc case de filtre automatique). Ses documents sont
  des `ActiveEffect`, jamais gérés jusqu'ici par `_prepareContext` (seuls Item/Actor/RollTable
  l'étaient) — nouvelle branche dédiée, champs lus directement sur le document (`effect.img`,
  `effect.description`, pas de `system.*`, contrairement à un Item).
- Nouveau bouton "Prendre" pour un effet : `grantEffectToActor()` (`browser-shared.mjs`),
  pendant de `grantItemToActor()` mais sans notion de prix/stack — applique une copie fraîche
  directement sur l'acteur ciblé.
- Nouvel onglet dédié "Capacités de Combat" pour `antique.capacites-combat`, sans filtre (un
  seul pack) — premier onglet de ce genre, exercice au passage de la branche "sans filtre" du
  template qui n'avait jamais servi jusqu'ici (tous les onglets précédents avaient au moins un
  filtre).
- **Bug latent trouvé et corrigé en marge** : le `data-drag-type` du glisser-déposer était
  hardcodé à `"Item"` dans le template (`compendium-browser.hbs`) pour toute section de type
  "item", au lieu de lire `section.dragType`. Sans incidence tant que seuls des Items passaient
  par cette branche ; glisser un effet l'aurait fait atterrir comme un faux Item au lieu d'un
  ActiveEffect. Corrigé pour les deux variantes du template (mise en page avec/sans filtres).

**Point #24 du `TODO_BUG_ANTIQUE.md` clos. À confirmer par l'utilisateur en jeu.**

---

## Bilan de la session du 10 septembre 2026 (v0.6.76 → v0.6.84)

Session longue, 12 étapes ("suite" 1 à 12 ci-dessous), toutes testées et confirmées par
l'utilisateur en jeu sauf mention contraire :

1. **v0.6.77** — le bouton "+" d'un ingrédient ne rafraîchit plus toute la fiche perso (scroll,
   recherche préservés).
2. **v0.6.78** — restocker un ingrédient recoche automatiquement "Possédé" sur tous les
   sorts/rituels concernés, pas seulement celui en cours de test.
3. **v0.6.79** — capacités de combat PNJ généralisées aux 26 créatures restantes du bestiaire
   (51 nouvelles capacités, 6 mécaniques), embarquées directement sur chaque créature.
4. **v0.6.80** — bouton MJ pour lancer un jet de sauvegarde sur le(s) token(s) sélectionné(s),
   en plus du bouton joueur existant.
5. **v0.6.81** — filtre "Consommable" renommé "Alchimie" (Navigateur de Compendium).
6. **v0.6.82** — effets désactivés à nouveau cliquables (collision de classe CSS avec le
   noyau de Foundry).
7. **v0.6.83 → v0.6.84** — "Écraser mes compendiums" entièrement réparé : blocage HTTP 403
   sur les `.db` (miroir `.json` automatique), puis dossiers d'organisation et RollTables mal
   gérés une fois le fetch relancé. Explique aussi pourquoi Regard pétrifiant restait sans
   bouton chez l'utilisateur (point 23 du TODO).

**Points ouverts en fin de session** (`TODO_BUG_ANTIQUE.md`) : #15 (colonnes du header de
fiche perso, en pause — attend une répartition précise de l'utilisateur) et #24 (ajouter les
compendiums Effets/Capacités de Combat au Navigateur de Compendium, demandé mais pas codé).

**Utilisateur signale s'arrêter là pour aujourd'hui.**

---

## Session du 10 septembre 2026 (suite 12) — Correctif : dossiers + RollTables dans "Écraser mes compendiums" (v0.6.83 → v0.6.84)

Retour utilisateur après test du correctif précédent (le 403 est bien résolu, "715 mis à jour,
209 créés") : la console montre encore deux catégories d'échecs.

**Dossiers traités comme du contenu normal** : l'export NDJSON plat d'un pack mélange les vrais
documents (armes, sorts...) et les documents Dossier (Folder) qui servent à les organiser dans
la barre latérale — 23 au total (armes ×7, sorts ×5, alchimie ×5, avantages-divins ×4,
historique ×2). Un Dossier a lui-même un champ `type` qui vaut le nom de la classe du pack
("Item", "RollTable"...) — ça ressemble à s'y méprendre à un document de contenu invalide de ce
même type, d'où l'erreur "type: Item n'est pas un type valide". Discriminant fiable : seul un
Dossier porte un champ `sorting` dans cette forme. Corrigé : ces entrées passent maintenant par
`pack.folders`/`Folder.create()` au lieu de `pack.documentClass`.

**RollTables de l'Historique (`_stats.lastModifiedBy` invalide)** : 5 tables portaient une
valeur technique `_stats.lastModifiedBy: "buildScript"` (héritée d'un ancien script de
construction, pas un vrai ID utilisateur à 16 caractères) — rejetée par la validation dès qu'un
`.update()` la repasse telle quelle. `_stats` est de toute façon géré par Foundry lui-même (qui
a modifié/quand) et ne devrait jamais être réécrit depuis un fichier de départ statique — retiré
de la charge utile pour toutes les entrées, pas seulement l'Historique.

**Fichiers** : `module/helpers/version-check.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 11) — Correctif : "Écraser mes compendiums" refonctionne (v0.6.82 → v0.6.83)

Signalé par l'utilisateur (erreurs console) : le bouton "Écraser mes compendiums" du dialogue
de mise à jour de version (`checkSystemVersionUpdate()`/`overwriteSystemCompendiums()` dans
`version-check.mjs`) échouait pour les 14 compendiums système, avec `HTTP 403` sur chaque
`packs/*.db`. C'est ce mécanisme, distinct de l'écran de correctifs `PACK_UPDATES`, qui
expliquait probablement pourquoi Regard pétrifiant restait sans bouton chez l'utilisateur
(point 23) : la tentative de tout réécraser n'avait en réalité rien copié.

**Cause** : Foundry bloque désormais (403) le fetch HTTP direct de fichiers portant une
extension de la famille LevelDB (`.db` inclus) — mesure anti-fuite pour les données de
compendium — cassant silencieusement cette fonctionnalité qui téléchargeait le contenu shippé
directement depuis `packs/*.db` en tant qu'asset statique.

**Correctif choisi** (option complète, demandée explicitement par l'utilisateur plutôt qu'un
simple retrait du bouton) : nouveau script `packs/_sync-json-mirrors.js`, qui régénère un
miroir `.json` (contenu NDJSON identique, juste l'extension) de chaque `packs/<nom>.db` dans un
sous-dossier dédié `packs/_json-mirrors/` — extension non bloquée par Foundry. `version-
check.mjs` fetch désormais ce miroir au lieu du `.db` directement. Le script tourne
automatiquement à chaque déploiement (`.claude/commands/deploy.md` mis à jour, exécuté avant le
`Copy-Item`), pour qu'il ne puisse jamais être désynchronisé d'un `.db` modifié en session —
aucune étape manuelle à retenir.

**Attention lors de la construction** : la première version du script écrivait les miroirs
directement dans `packs/` sous leur nom nu (`packs/avantages.json`, etc.) — collision avec des
fichiers déjà présents portant exactement ces noms. `packs/dieux.json` était un fichier suivi
par git (ancien format, contenu réel différent) et a été écrasé par erreur ; restauré via
`git checkout` avant tout commit. 13 autres (`pnj.json`, `effets.json`, etc.) n'étaient jamais
suivis par git (aucun historique) — probablement des sorties jetables d'anciens scripts
d'inspection/import ponctuels déjà présents dans `packs/`, mais leur contenu d'origine, non
suivi, n'a pas pu être récupéré après écrasement. Corrigé en isolant tous les miroirs dans le
sous-dossier `_json-mirrors/`, qui n'existait pas avant — plus aucun risque de collision.
**Signalé à l'utilisateur** : si l'un de ces 13 fichiers avait un contenu qui comptait, il est
perdu ; sinon, aucune conséquence.

**Fichiers** : `packs/_sync-json-mirrors.js` (nouveau), `packs/_json-mirrors/*.json`
(nouveau), `module/helpers/version-check.mjs`, `system.json`,
`module/helpers/release-notes.mjs`, `C:\projet\VTT_Foundry\.claude\commands\deploy.md` (hors
dépôt du système, dans le dépôt parent VTT_Foundry).

---

## Session du 10 septembre 2026 (suite 10) — Correctif : effets désactivés à nouveau cliquables (v0.6.81 → v0.6.82)

Signalé par l'utilisateur (point 22) : une fois un effet actif désactivé, ses boutons (actif/
inactif, éditer, supprimer) ne réagissent plus du tout au clic — confirmé "rien du tout ne se
passe". Revue du JS (`item-sheet.mjs`/`actor-sheet.mjs`) : aucun des handlers ne conditionne la
recherche du document ni l'attache du listener sur `effect.disabled`. La CSS de ce système
(`.effect-row.disabled`/`.trait-row.disabled`) ne pose que de l'opacité.

**Cause réelle** : le noyau de Foundry a sa propre classe utilitaire générique `.disabled` qui
pose `pointer-events: none` — `pointer-events` est une propriété héritée en CSS, donc ce
`none` descend sur tous les enfants de la ligne, y compris ses propres boutons de contrôle
(`.effect-controls`/`.item-controls`). Notre CSS ajoutait juste l'opacité par-dessus sans
jamais réactiver les clics sur ces boutons précis.

**Correctif** : deux nouvelles règles CSS qui réactivent `pointer-events: auto` explicitement
sur `.effect-row.disabled .effect-controls` (tous les onglets Effets d'objet) et
`.trait-row.disabled .item-controls` (section Effets autonome de l'onglet Traits) — la ligne
reste visuellement grisée (opacité inchangée), seuls ses boutons redeviennent cliquables.

**Fichiers** : `css/antique.css`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 9) — Filtre "Alchimie" renommé (v0.6.80 → v0.6.81)

Retour utilisateur : dans le Navigateur de Compendium, onglet Équipement, le filtre qui montre
le contenu du compendium Alchimie (potions/ingrédients) s'appelait "Consommable" — nom hérité de
la clé interne (`classifyEquipmentItem()`, `packId === "antique.alchimie"` → `"consommable"`),
jamais renommé côté affichage. Renommé "Alchimie" (label seulement, la clé de filtre interne
`consommable` reste inchangée).

**Fichiers** : `lang/{fr,en}.json`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 8) — Jet de sauvegarde pour les tokens sélectionnés (v0.6.79 → v0.6.80)

Demande utilisateur : pour les capacités de monstres avec jet de sauvegarde, pouvoir le lancer
sur le(s) token(s) sélectionné(s) plutôt que de dépendre uniquement du personnage assigné du
joueur qui clique — utile quand la victime est un PNJ/monstre (aucun joueur assigné).

**Clarifié avant codage** (2 questions) : garder le bouton joueur existant tel quel, en ajouter
un second réservé au MJ plutôt que remplacer le comportement ; un jet par token sélectionné si
plusieurs le sont.

**`AntiqueActor#rollSave()` étendu aux PNJ** : ne lisait que `system.saves[clé].total`, un champ
qui n'existe que sur les personnages (les PNJ n'ont pas de système de sauvegarde). Pour un PNJ,
utilise maintenant le meilleur des deux modificateurs de caractéristique liés à cette
sauvegarde (ex. Robustesse = max(CON, FOR)) — même esprit simplifié que leur table de bonus
d'attaque.

**Nouveau bouton** (`AntiqueItem#postToChat`, classe `.roll-save-selected-button`) sur la carte
de chat d'une capacité avec `saveAbility`/`saveDC` — retiré côté client pour tout non-MJ (le
hook `renderChatMessageHTML` dans `antique.mjs` le supprime du DOM si `!game.user.isGM`). Au
clic, lance le jet pour chaque token actuellement contrôlé sur le canevas (`canvas.tokens.
controlled`), un jet indépendant par token.

**Fichiers** : `module/documents/actor.mjs`, `module/documents/item.mjs`, `antique.mjs`,
`css/antique.css`, `lang/{fr,en}.json`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 7) — Capacités de combat généralisées à tout le bestiaire (v0.6.78 → v0.6.79)

Point 20 de `TODO_BUG_ANTIQUE.md` : demande explicite de généraliser le patron
Charge furieuse/Regard pétrifiant (architecture livrée v0.6.71-76, 2 exemples seulement) à
l'ensemble des 28 créatures de `packs/creatures.db`.

**Approche confirmée avec l'utilisateur avant codage** (3 questions) : même discipline que le
chantier des Désavantages (mécanique seulement si un champ NPC existant correspond, narratif
sinon — le système n'a pas de champ pour la régénération, le poison au fil du temps, les
attaques multiples, la peur/charme, l'incorporel, etc.) ; embarquer aussi chaque capacité
directement sur sa créature dans `creatures.db` (pas seulement le compendium séparé) ; tout
bonus chiffré situationnel (charge, attaque en piqué) actif en permanence, pas désactivé par
défaut — cohérent avec la décision finale déjà prise pour Charge furieuse.

**Extraction** : pour chacune des 26 créatures restantes (Minotaure/Méduse déjà faites), les
capacités notables du champ `notes` (hors lignes "Habitat"/"Faiblesse", qui restent de la
couleur locale pour le MJ) sont devenues des items `npcability`. Cyclope, Pégase et Hippocampe
n'ont rien reçu — leurs seules capacités notables sont déjà entièrement couvertes par leurs
armes existantes (Lancer de rocher, etc.), rien à ajouter. Résultat : 51 nouvelles capacités,
6 mécaniques (Sphinx et Griffon : bonus d'attaque en piqué ; Triton : bonus attaque+CA aquatique ;
Centaure guerrier, Sanglier d'Érymanthe, Taureau de Crète : bonus de charge), le reste narratif
avec bouton de jet de sauvegarde quand le texte d'origine précisait une difficulté chiffrée
(Réflexes/Robustesse/Volonté — les seules 3 caractéristiques de sauvegarde du système ; un texte
mentionnant une autre caractéristique, comme "Navigation" pour Charybde, reste sans bouton).

**Collisions de noms détectées et corrigées avant déploiement** : 6 créatures avaient déjà une
arme portant exactement le même nom qu'une capacité générée depuis leurs notes (Chimère/Érinye :
le duplicata ajoutait un vrai bonus — renommé "(jet de sauvegarde)" pour les distinguer sans les
supprimer ; Cyclope/Spectre du Styx/Typhon/Stymphale : le duplicata n'ajoutait rien de mécanique
par rapport à l'arme déjà présente — abandonné plutôt que renommé). Un script Node
(`packs/_build-capacites-bestiaire.js`) vérifie l'absence de collision par recoupement
programmatique avant chaque exécution.

**Propagation** : deux nouvelles entrées `PACK_UPDATES` — `0.6.79-create-capacites-bestiaire`
(crée les 51 documents manquants dans `capacites-combat`) et
`0.6.79-embed-capacites-bestiaire` (les embarque sur chaque créature du compendium
"Créatures Mythologiques" et sur toute copie déjà glissée sur un PNJ du monde, y compris le
retrofit Minotaure/Méduse). Les deux données sont dupliquées en dur dans `pack-updates.mjs`
(mêmes IDs que dans `packs/capacites-combat.db`/`creatures.db`) pour ne pas dépendre d'un ordre
d'exécution entre elles.

**Fichiers** : `packs/_build-capacites-bestiaire.js` (nouveau), `packs/capacites-combat.db`,
`packs/creatures.db`, `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 6) — Recochage automatique des ingrédients après restock (v0.6.77 → v0.6.78)

Retour utilisateur après le correctif précédent : quand un ingrédient manque, sa case
"Possédé" (checklist Ingrédients d'un sort/rituel) reste décochée — logique, mais si on
re-stocke l'ingrédient ensuite, rien ne recochait automatiquement la case : il fallait rouvrir
le sort et cocher à la main.

**Ajouté** : `syncSpellIngredientPossession(actor)` (nouveau, `module/helpers/actor-utils.mjs`) —
reprend exactement la formule déjà utilisée après un cast dans `AntiqueItem#castSpell`
(`getIngredientStock(actor, name) >= quantity`) mais appliquée à **tous** les sorts de l'acteur,
pas seulement celui qu'on vient de lancer ; ne touche que les entrées qui correspondent à un
ingrédient réellement possédé (une entrée purement narrative, sans stock réel, n'est jamais
retouchée). Câblée via un nouveau hook générique `registerIngredientStockSyncHook()` sur
`Hooks.on("updateItem")`, filtré sur les objets équipement-ingrédient (`apothCategory` renseigné,
hors besace) dont `system.quantity` a changé — couvre en une seule fois le bouton "+", une
modification directe de la quantité depuis la fiche de l'objet, `item.consume()`, et l'empilement
par glisser-déposer, puisque ces quatre chemins passent tous par `Item#update()`.

**Fichiers** : `module/helpers/actor-utils.mjs`, `antique.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 5) — Correctif : +1 ingrédient ne rafraîchit plus toute la fiche (v0.6.76 → v0.6.77)

Point 21 de `TODO_BUG_ANTIQUE.md` : l'utilisateur a testé le recochage automatique de la
checklist "Ingrédients" d'un sort après un cast — **confirmé, ça fonctionne**. En testant, il a
trouvé un problème connexe : cliquer sur le bouton "+" d'un ingrédient (onglet Apothicaire de la
fiche Personnage) remonte toute la fiche en haut et efface le champ de recherche en cours.

**Cause** : le handler `.ingredient-restock` (`actor-sheet.mjs`) faisait
`await item.update(...); this.render({force:true})` — un re-rendu complet de la fiche pour
incrémenter un simple nombre. Contrairement au bouton `.item-consume` juste à côté (qui ne force
aucun rendu et laisse Foundry gérer la mise à jour), ce force-render était superflu et surtout
destructeur (perd le scroll et la valeur du champ `.ingredient-search`).

**Correctif** : remplacé par une correction directe du DOM — après l'update, le `<span
class="quantity-value">` de la ligne est mis à jour en place (texte + classe `.empty`), ainsi que
`.apoth-row-empty` sur la ligne, sans aucun appel à `render()`. Plus de perte de scroll ni de
recherche en cours.

**Fichiers** : `module/sheets/actor-sheet.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 4) — Capacités cliquables dans le chat + bouton de jet de sauvegarde (v0.6.75 → v0.6.76)

Demande utilisateur (dernière du soir) : « il faut que les capacités de combat soient cliquables
pour les afficher dans le chat. Que la description soit visible dans le chat avec l'icône et le
titre. Pour le regard pétrifiant il faut que le pj visé puisse cliquer sur un bouton pour lancer
un test de sauvegarde avec ses stats mais avec la difficulté indiquée dans la description, il
faut aussi qu'il y ait le lien de l'effet "Pétrifier" (vers le compendium) pour que le MJ puisse
l'appliquer sur le pj ou des pnj [...] ».

**Cliquable + chat** : `AntiqueItem#postToChat()` (générique, déjà utilisé par armes/sorts/etc.)
fonctionnait déjà pour ce type d'objet (icône + titre + description) — seule l'icône de la ligne
avait la classe `.item-chat` dans `npc-sheet.hbs`, le nom n'en avait pas. Ajouté sur le nom aussi
(`.item-chat.clickable`), même patron que `.spell-chat` pour les sorts.

**Bouton de jet de sauvegarde** : nouveaux champs `system.saveAbility`/`system.saveDC` sur le
type `npcability` (`item-npcability.mjs`), configurables dans la fiche (`npcability-sheet.hbs`,
liste déroulante Réflexe/Robustesse/Volonté + DC). `postToChat()` ajoute un bouton
"Jet de sauvegarde" sur la carte quand ces champs sont renseignés. Le clic (nouveau hook
`renderChatMessageHTML` sur `.roll-save-button` dans `antique.mjs`) utilise volontairement
`game.user.character` (le personnage assigné à l'utilisateur qui clique, PAS l'acteur qui a
posté le message) : c'est bien la victime, sur son propre client, qui lance son propre jet.
`AntiqueActor#rollSave()` accepte maintenant un DC optionnel, affiche réussite/échec (nouveau
`buildSaveFlavor()` dans `rolls.mjs`, réutilise les classes CSS `attack-hit`/`attack-miss` déjà
existantes). "Regard pétrifiant" configuré avec Robustesse DC 18 — le lien vers l'effet
"Pétrifié" (compendium Effets) était déjà présent dans la description depuis la session
précédente, donc déjà inclus automatiquement dans la carte de chat (Foundry enrichit les liens
`@UUID[...]` dans le contenu d'un ChatMessage).

**Propagation** : nouvelle entrée `PACK_UPDATES` (`0.6.76-add-save-to-petrifiant`) pour
appliquer `saveAbility`/`saveDC` + le nouveau texte de description au compendium et à la copie
déjà glissée sur le PNJ de l'utilisateur.

**Fichiers** : `templates/actor/npc-sheet.hbs`, `module/documents/item.mjs`,
`module/documents/actor.mjs`, `module/helpers/rolls.mjs`,
`module/data-models/items/item-npcability.mjs`, `templates/item/npcability-sheet.hbs`,
`module/sheets/item-sheet.mjs`, `antique.mjs`, `css/antique.css`, `lang/{fr,en}.json`,
`packs/_build-capacites-combat.js`, `packs/capacites-combat.db`,
`module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

**Fin de session** — utilisateur signale s'arrêter là pour ce soir après ce traitement.

---

## Session du 10 septembre 2026 (suite 3) — Correctif : effet "Pétrifié" visible dans l'onglet Effets (v0.6.74 → v0.6.75)

Retour utilisateur après test de la 0.6.74 : « toujours rien dans regard pétrifiant ». Clarifié
par une question : l'onglet Effets de la capacité montrait bien 0 effet — voulu à l'origine
(l'effet n'était que lié depuis la description, jamais embarqué, pour ne pas s'appliquer à
Méduse elle-même via `transfer:true`), mais pas ce que l'utilisateur attendait — il voulait la
même présentation visuelle que Charge furieuse (un effet listé dans l'onglet Effets).

**Correctif** : l'effet "Pétrifié" est maintenant aussi embarqué directement sur la capacité,
mais en **`transfer:false`** — reste visible dans l'onglet Effets (même patron visuel que Charge
furieuse) sans jamais s'appliquer à la créature qui possède la capacité. Le lien dans la
description (vers la copie autonome du compendium Effets, à glisser sur la victime) reste
inchangé.

**Propagation** : nouvelle entrée `PACK_UPDATES` (`0.6.75-embed-effet-petrifie`, réutilise la
fonction déjà corrigée de la 0.6.74 — nouvel id nécessaire car l'ancien est déjà marqué appliqué
chez l'utilisateur et ne se serait pas reproposé).

**Fichiers** : `packs/_build-capacites-combat.js`, `packs/capacites-combat.db`,
`module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite 2) — Effet "Pétrifié" pour Regard pétrifiant (v0.6.73 → v0.6.74)

Retour utilisateur après validation de Charge furieuse : « il faut que tu ajoutes l'effet du
regard pétrifiant ». Contrairement à Charge furieuse, aucune ActiveEffect ne peut forcer un jet
de sauvegarde ou en interpréter le résultat — le jet reste entièrement géré par le MJ. Ce qui
peut avoir un effet, c'est sa **conséquence** en cas d'échec ("être pétrifiée").

**Décision de conception** : cet effet n'est **jamais embarqué sur la capacité elle-même**
(`transfer:true` l'appliquerait à Méduse, pas à sa victime) — juste un document autonome dans
`effets.db` (marqueur narratif, aucun `changes`, même principe que la majorité des désavantages)
lié depuis la description de "Regard pétrifiant", à glisser manuellement par le MJ sur le token
de la victime après un échec. Nouvel effet `eEft000000000171` "Pétrifié (Regard de Méduse)".

**Propagation** : 2 nouvelles entrées `PACK_UPDATES` (`0.6.74-create-effet-petrifie`/
`-link-effet-petrifie`), même patron que Charge furieuse — compendium + copie déjà glissée sur
un PNJ.

**Fichiers** : `packs/_build-capacites-combat.js`, `packs/capacites-combat.db`,
`packs/effets.db`, `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 (suite) — Charge furieuse : bonus actif en permanence (v0.6.72 → v0.6.73)

Retour utilisateur après test de la 0.6.72 : « l'effet actif est présent mais désactivé, elle
devrait être par défaut activé ». Revirement assumé par rapport au choix initial (conditionnel,
à activer manuellement pendant la charge) — l'effet embarqué de "Charge furieuse" passe
`disabled: false` par défaut, à la fois dans `packs/_build-capacites-combat.js`/
`capacites-combat.db` (pour toute future installation fraîche) et via un nouveau correctif
`PACK_UPDATES` (`0.6.73-enable-effet-charge-furieuse`) pour activer l'effet déjà créé désactivé
sur le compendium et la copie déjà glissée sur le PNJ de l'utilisateur — corrige aussi le texte
de la description qui mentionnait encore "désactivé par défaut".

**Fichiers** : `packs/_build-capacites-combat.js`, `packs/capacites-combat.db`,
`module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 10 septembre 2026 — Correctifs capacités de combat : fiche + lien vers l'effet (v0.6.71 → v0.6.72)

Retour utilisateur après test de la 0.6.71 : « le compendium existe bien, j'arrive à ajouter la
capacité de combat sur le pnj, cependant quand je clique sur l'item dans le compendium je ne vois
pas la description » + demande explicite de reprendre le patron des avantages (document Effet
autonome + lien dans la description, pas seulement la copie embarquée).

**Bug n°1 — description invisible** : `antique.mjs`, l'enregistrement de `AntiqueItemSheet`
(`Items.registerSheet`) restreint les types pris en charge à une liste figée
(`weapon, equipment, advantage, disadvantage, blessing, spell, curse`) — **`npcability` n'y
figurait pas**, ajouté à la 0.6.71 mais oublié à cet endroit. Foundry retombait donc sur une
fiche générique qui ne connaît pas le champ `description`, d'où la fiche vide à l'ouverture
depuis le compendium (fonctionnait quand même en liste sur le PNJ, qui lit `system.description`
directement côté serveur sans passer par la fiche). Corrigé : type ajouté à la liste.

**Bug n°2 — pas de document Effet autonome** : contrairement aux avantages (`Cuir de Héros`,
`Mule`...), "Charge furieuse" n'avait qu'une copie d'effet embarquée directement sur l'objet,
sans document autonome dans le compendium Effets ni lien dans sa description — choix de scope
délibéré de la session précédente, revu à la demande de l'utilisateur pour rester cohérent avec
le patron des avantages. Ajouté : `eEft000000000170` dans `effets.db` (bibliothèque générale,
réutilisable/glissable sur un token) + lien `@UUID[...]` dans la description de la capacité, même
patron que `_build-effet-mule.js`/`MULE_EFFET_ID` dans `pack-updates.mjs`.

**Propagation** : 2 nouvelles entrées `PACK_UPDATES`
(`0.6.72-create-effet-charge-furieuse`/`-link-effet-charge-furieuse`) — création du document
Effet + correction de la description sur le compendium "capacites-combat" et toute copie déjà
glissée sur un PNJ (le cas de l'utilisateur, qui avait déjà testé le drag&drop en 0.6.71).

**Fichiers** : `antique.mjs`, `packs/capacites-combat.db`, `packs/effets.db`,
`packs/_build-capacites-combat.js`, `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 9 septembre 2026 (suite 4) — Capacités de combat PNJ : architecture + 2 exemples (v0.6.70 → v0.6.71)

Point 20 de `TODO_BUG_ANTIQUE.md` : « sur les pnj, ajouter des compétences de combat, avec un
compendium associé, s'inspirant des descriptions des créatures mythologiques ». Clarifié avec
l'utilisateur avant codage : capacités avec un **vrai effet mécanique** (pas juste du texte),
comme les effets d'avantages PJ — et démarrage petit (architecture + 2-3 exemples à valider)
plutôt que tout généraliser d'un coup, chantier trop gros (comparable à celui des Effets PJ) pour
une seule session.

**Architecture** (même patron que les avantages/effets PJ) : nouveau type d'objet `npcability`
(`module/data-models/items/item-npcability.mjs` — juste `description` + `gmNotes`, pas de
`cout`/`limitation`, concepts PJ), enregistré dans `template.json`/`antique.mjs`, nouvelle fiche
`templates/item/npcability-sheet.hbs` (copie d'`advantage-sheet.hbs` sans les champs de coût),
nouveau compendium **"Capacités de Combat (PNJ)"** (`packs/capacites-combat.db`, type Item).
Nouvelle section dans l'onglet Combat du PNJ (GM only, déjà gardé par `{{#if isGM}}`) : tableau
accordéon identique à celui des Avantages/Désavantages PJ (`_prepareNpcAbilityItems()` dans
`npc-sheet.mjs`, calque de `_prepareTraitItems()` d'`actor-sheet.mjs`), glisser-déposer depuis le
compendium fonctionne sans changement (pas dans `STACKABLE_TYPES`, tombe sur la création
normale).

**2 exemples repris de `packs/creatures.db`** (`packs/_build-capacites-combat.js`, nouveau) :
- **Charge furieuse** (Minotaure) : `+2 attaque` mécanisé via un effet embarqué ADD sur
  `system.attackBonuses.armeBlanche.total`, **désactivé par défaut** (le MJ l'active pendant la
  charge, le désactive ensuite) — pas de bouton dédié, juste le toggle actif/inactif déjà présent
  sur la fiche de l'objet. Le `+4 dégâts` annoncé reste **narratif** : les armes de PNJ n'ont
  qu'une formule de dégâts en texte libre (pas de champ de bonus numérique séparé comme
  `armeADistance.damageBonus` côté PJ), rien à sommer automatiquement dessus sans construire une
  infra dédiée — hors scope de cette première étape.
- **Regard pétrifiant** (Méduse) : entièrement narratif (jet de sauvegarde + conséquence gérés
  par le MJ), aucun effet embarqué — même limite déjà rencontrée et acceptée pour la quasi-
  totalité des désavantages PJ (conséquence conditionnelle, pas un malus chiffré permanent).

**Décision de scope** : contrairement aux effets PJ, l'effet de Charge furieuse n'est **pas**
dupliqué dans le compendium `effets` — embarqué uniquement sur l'objet capacité, plus simple tant
qu'aucune réutilisation croisée entre capacités n'est nécessaire. À revoir si ça change en
généralisant à toutes les créatures.

**Fichiers** : `template.json`, `antique.mjs`,
`module/data-models/items/item-npcability.mjs` (nouveau),
`templates/item/npcability-sheet.hbs` (nouveau), `module/sheets/item-sheet.mjs`,
`module/sheets/npc-sheet.mjs`, `templates/actor/npc-sheet.hbs`, `lang/{fr,en}.json`,
`system.json`, `packs/capacites-combat.db` (nouveau),
`packs/_build-capacites-combat.js` (nouveau), `module/helpers/release-notes.mjs`.

---

## Session du 9 septembre 2026 (suite 3) — Case "Sac à ingrédient" (v0.6.69 → v0.6.70)

Point 17 de `TODO_BUG_ANTIQUE.md` : ajouter une case à côté de "Praticien de la magie" (onglet
Background) qui affiche/cache l'onglet Ingrédients selon son état. Nouveau champ
`system.hasIngredientBag` (`actor-character.mjs`), même patron que `isMagicPractitioner` : seul
le lien de navigation de l'onglet est gardé par la condition (pas le contenu de l'onglet
lui-même), exactement comme pour l'onglet Magie.

**Rétro-compatibilité** : ce champ étant nouveau (`initial: false`), tout personnage existant qui
a déjà des ingrédients dans son inventaire perdrait sinon l'accès à son propre onglet. Nouveau
correctif `PACK_UPDATES` (`0.6.70-backfill-ingredient-bag`) qui coche automatiquement la case pour
tout personnage possédant déjà un objet d'équipement catégorisé apothicaire — premier correctif de
ce registre à ne toucher que des acteurs du monde, aucun compendium (nouveau groupe "acteurs" dans
l'écran de mise à jour, pas de vrai nom de compendium associé).

**Fichiers** : `module/data-models/actor-character.mjs`, `templates/actor/character-sheet.hbs`,
`css/antique.css`, `lang/{fr,en}.json`, `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 9 septembre 2026 (suite) — Recherche de compétence (v0.6.68 → v0.6.69)

Point 14 de `TODO_BUG_ANTIQUE.md` (issu de l'audit de `todo_foundry.txt`) : permettre de taper
une recherche pour mettre en évidence une compétence dans l'onglet Compétences.

**Choix** : surlignage (dim des non-correspondances + halo doré sur les correspondances) plutôt
que masquage — contrairement au filtre déjà existant sur l'onglet Ingrédients
(`.ingredient-search`, qui masque les lignes non trouvées), garder toutes les compétences
visibles évite de perdre ses repères entre les 6 groupes de caractéristiques. Champ de recherche
sans `name` (pas de donnée d'acteur, juste un filtre d'affichage JS), même patron d'écoute
`"input"` que la recherche d'ingrédients, placé hors de la garde `isEditable` pour fonctionner
aussi en lecture seule.

**Fichiers** : `templates/actor/character-sheet.hbs`, `module/sheets/actor-sheet.mjs`,
`css/antique.css`, `lang/{fr,en}.json`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 9 septembre 2026 — Audit `todo_foundry.txt` + correctif focus/scroll effet (v0.6.67 → v0.6.68)

Demande utilisateur : reprendre le travail, en repartant du fichier de suivi personnel
`C:\Users\arthe\Desktop\todo_foundry.txt` (hors du dépôt, jamais vu par Claude avant cette
session — mélange les projets "antique" et un projet "pirate" séparé, avec des items marqués
`done`/`[X]` de façon inconsistante). Audit croisé contre `JOURNAL.md` et le code réel (pas de
confiance aveugle aux marqueurs du fichier) : la quasi-totalité des items antique étaient déjà
livrés ; 9 points réellement ouverts identifiés et ajoutés à `TODO_BUG_ANTIQUE.md`
(points 13 à 21).

**Point 13 traité dans la foulée** : "focus perdu après validation" recouvrait deux cas
distincts dans le fichier source.
- **Champ de compétence + Entrée** : déjà corrigé de longue date par le mécanisme générique
  `preventEnterSubmit` (`module/helpers/sheet-utils.mjs`), qui bloque la soumission implicite du
  formulaire sur Entrée pour tous les champs texte/nombre — couvre `.skill-bonus-input` sans
  modification nécessaire. Le signalement du fichier source datait d'avant l'ajout de ce
  mécanisme.
- **Toggle actif/inactif d'un effet (onglet Traits)** : bug réel, non couvert. Le handler
  `.actor-effect-toggle` (`actor-sheet.mjs`) faisait un `render({force:true})` brut après
  `effect.update()`, sans passer par `captureFocusState`/`restoreFocusState` comme le reste de la
  fiche (`_processSubmitData`, barre de favoris). Corrigé avec le même patron déjà établi.

**Fichiers** : `module/sheets/actor-sheet.mjs`, `TODO_BUG_ANTIQUE.md`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 11) — 90 nouveaux Effets pour les Désavantages (v0.6.66 → v0.6.67)

Demande utilisateur : appliquer le même travail qu'aux avantages, côté désavantages — "fait
une liste comme ce que j'ai fait pour les avantages avant de le coder". Audit des 95
désavantages (5 avaient déjà un effet : Sens défaillant, Frêle, Distrait, Dépressif,
Maladroit) : contrairement aux avantages, la quasi-totalité des textes restants décrivent une
conséquence **conditionnelle ou de jeu de rôle** (peur si échec de Volonté, malus
situationnel, poursuivi par une créature, dépendance à gérer...) plutôt qu'un malus chiffré
permanent — ce qu'un effet actif passif ne peut représenter fidèlement. Liste proposée à
l'utilisateur avant codage (4 cas chiffrables + 86 narratifs), validée telle quelle.

**4 cas avec un vrai malus de compétence** : Petite nature (`ADD skills.resistancePoisons.
bonus -2`), Enfant (`ADD skills.commandement.bonus -2`), Introverti (`ADD skills.baratin.
bonus -2`) — Poigne d'Arès reste narratif, aucun champ n'existe pour une pénalité de
"deuxième attaque" (pas de nouveau mécanisme construit pour un seul cas).

**86 autres** : effet "simple" narratif (aucun `changes`), même patron que les avantages
narratifs — description reprise du désavantage.

**Bug trouvé et corrigé pendant la construction** : le script initial
(`packs/_build-effets-desavantages.js`) oubliait le champ `description` sur l'effet
embarqué — exactement la régression que l'étape 4 avait corrigée pour les avantages
(`todo_foundry.txt` ligne 455), reproduite sans y penser pour les désavantages. Corrigé
avant déploiement : `description` backfillée sur les 90 effets déjà construits, script
source corrigé pour l'avenir, et le correctif live (`linkAndEmbedDesavantage`) vérifie
maintenant aussi la description sur un effet déjà présent, pas seulement sur sa création.

**Propagation** : `0.6.67-create-effets-desavantages` + `0.6.67-embed-effets-desavantages`
dans `PACK_UPDATES`, même mécanisme que pour les avantages — correspondance vérifiée
programmatiquement (changes + description) entre les données dupliquées dans
`pack-updates.mjs` et `desavantages.db`/`effets.db` avant déploiement (0 écart, 0 doublon).

**Fichiers** : `packs/desavantages.db`, `packs/effets.db`,
`packs/_build-effets-desavantages.js` (nouveau), `module/helpers/pack-updates.mjs`,
`system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 10) — Correctif : compendium verrouillé sur les correctifs de poids (v0.6.65 → v0.6.66)

Erreur en jeu en testant la 0.6.65 : `You may not update documents in the locked compendium
"antique.equipement"`, dans `applyItemWeightsEquipement`. Le code suivait pourtant le patron
déjà utilisé (avec succès) dans toutes les fonctions précédentes de `pack-updates.mjs` :
lire `pack.locked`, ne déverrouiller que si vrai, reverrouiller à la fin dans le même état.

**Cause** : la lecture de `pack.locked` n'est pas fiable pour décider s'il faut déverrouiller
— pour ce compendium précis, elle a manifestement renvoyé une valeur fausse (falsy),
sautant l'appel `pack.configure({ locked: false })`, alors que le compendium était bel et
bien verrouillé. Comme cette échec se produit avant toute écriture, le correctif n'a jamais
été marqué comme appliqué (l'exception est interceptée par le picker) — pas besoin d'une
nouvelle entrée, corriger la fonction suffit à ce qu'elle soit reproposée telle quelle.

**Correctif** : les 13 occurrences du patron dans `pack-updates.mjs` rendues
inconditionnelles — `pack.configure({ locked: false })`/`{ locked: true }` sont appelés
systématiquement, sans dépendre de la lecture de `pack.locked` (verrouiller/déverrouiller
un compendium déjà dans cet état est un no-op sans risque).

**Fichiers** : `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 9) — Capacité de port (kg) + Mule (v0.6.64 → v0.6.65)

Dernier point ouvert du chantier Effets (`todo_foundry.txt` lignes 353-354, mis de côté en
septembre car la fonctionnalité n'existait pas encore) : une capacité de port en kg pour
les PJ, plafonnée au poids du personnage sauf avec l'avantage Mule (qui la double).

**Champ "Poids" existant conservé tel quel** (texte libre, Identité) — nouveau champ
numérique séparé `capacitePort` (kg), directement modifiable comme `Déplacement`, jamais
recalculé dans `prepareDerivedData()` pour qu'un ActiveEffect MULTIPLY (Mule) s'applique
dessus normalement, même patron qu'Athlète/`deplacement`.

**Poids par objet** : nouveau champ `poids` (kg) sur `item-weapon.mjs`/`item-equipment.mjs`
(défaut 0). Une estimation plausible a été appliquée aux ~160 objets déjà présents dans
`armes.db`/`equipement.db` (`packs/_add-item-weights.js`) — équivalents historiques/RPG
usuels (ex. dague ~0.5kg, armure en plaque ~20kg, potion ~0.3kg), approximatif par
construction et à corriger par l'utilisateur au cas par cas. Les armes d'`armes.db`
partagent un nom de base ("Glaive (Bonne facture)") suivi d'un palier de qualité qui
n'affecte pas le poids — la table est indexée sur le nom avant la parenthèse.

**Poids total porté** : nouvelle boucle dans `prepareDerivedData()` (même famille que la
boucle CA/compétences existante), somme `quantité × poids` sur tout l'inventaire (pas
seulement l'équipé — on porte tout ce qu'on a sur soi). Bannière dans l'onglet Inventaire
reprenant exactement le patron visuel de "Balance des traits" (mêmes classes CSS,
`.trait-balance`/`.unbalanced`) — informatif uniquement, ne bloque jamais l'ajout d'un
objet (décision utilisateur).

**Effet de Mule** (`packs/_build-effet-mule.js`) : `MULTIPLY system.capacitePort ×2`,
embarqué directement sur l'avantage (bonus sur le porteur, comme Colère de Zeus/Talent
d'Héphaistos) + lien dans sa description — même patron que toutes les autres corrections
d'effet cette session.

**Propagation** : 4 nouvelles entrées `PACK_UPDATES` (créer l'effet Mule, l'embarquer sur
l'avantage, appliquer les poids sur `armes`/`equipement` — compendiums et copies déjà
possédées). Correspondance vérifiée programmatiquement entre les tables de poids dupliquées
dans `pack-updates.mjs` et les fichiers source avant déploiement (0 écart).

**Ceci clôt le chantier Effets** — plus aucun point ouvert connu dans `todo_foundry.txt`.

**Fichiers** : `module/data-models/actor-character.mjs`,
`module/data-models/items/item-weapon.mjs`, `item-equipment.mjs`,
`templates/actor/character-sheet.hbs`, `templates/item/weapon-sheet.hbs`,
`equipment-sheet.hbs`, `module/sheets/actor-sheet.mjs`, `lang/{fr,en}.json`,
`packs/armes.db`, `packs/equipement.db`, `packs/avantages.db`, `packs/effets.db`,
`packs/_add-item-weights.js` (nouveau), `packs/_build-effet-mule.js` (nouveau),
`module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 8) — Correctif : descriptions des effets actifs pas reprises (v0.6.63 → v0.6.64)

Retour utilisateur après test de la 0.6.63 : "ça marche, presque tout est bon" puis "les
effets actifs simple n'ont pas encore récupéré leurs descriptions... ou même les autres
effets actifs" — la reprise de description ne s'était appliquée nulle part, pas seulement
sur les "effets simples".

**Cause** : `applyCleanupEffectField{Avantages,Desavantages}` lisait `doc.system.effect` en
direct sur le monde pour le recopier dans la description de l'effet actif — mais ce
déploiement retire justement `effect` du schéma `item-advantage.mjs`/`item-disadvantage.mjs`
dans le même mouvement. `.system` étant reconstruit par Foundry depuis le schéma DataModel
actuel, un champ qui n'y figure plus n'est simplement plus lisible via `doc.system.effect`,
même si la donnée brute existe encore quelque part en base — le correctif ne trouvait donc
plus jamais rien à recopier (0 corrigé, aucune erreur, échec silencieux).

**Autre piège découvert** : l'écran de mise à jour marque un correctif "appliqué" dès que sa
fonction s'exécute sans lever d'exception — indépendamment du nombre réel de documents
corrigés. Les deux correctifs `0.6.63-cleanup-effect-field-*`, bien qu'inopérants, étaient
donc déjà marqués comme faits et ne se seraient jamais reproposés spontanément.

**Correctif** : les textes attendus (extraits d'`avantages.db`/`desavantages.db` après le
passage d'`_remove-effect-field.js`, 90 avantages + 5 désavantages) sont maintenant codés en
dur dans `pack-updates.mjs` (`EFFECT_DESCRIPTIONS_AVANTAGES`/`_DESAVANTAGES`) plutôt que lus
depuis le monde en direct. Deux **nouvelles** entrées `PACK_UPDATES`
(`0.6.64-backfill-effect-descriptions-avantages`/`-desavantages`, réutilisant les mêmes
fonctions `apply` désormais corrigées) plutôt que de modifier les entrées `0.6.63-*` déjà
marquées appliquées — correspondance vérifiée programmatiquement contre les deux fichiers
sources avant déploiement (95/95 noms, aucun manquant).

**Fichiers** : `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 7) — Étape 4 : retrait du champ "Effet", dédoublonnage (v0.6.62 → v0.6.63)

Dernières notes de `todo_foundry.txt` (lignes 453-455) traitées : le champ texte "Effet"
(`system.effect`) faisait doublon avec la description complète — retiré du schéma
(`item-advantage.mjs`, `item-disadvantage.mjs`) et de la fiche d'objet des deux types.

**Découverte en creusant l'usage réel du champ** : `system.effect` alimentait aussi la
tooltip au survol des icônes d'avantages/désavantages en haut de la fiche de personnage
(`data-tooltip-effect`, `actor-sheet.mjs`). Décision utilisateur : la tooltip lit maintenant
la description de l'effet actif existant (ajout d'un champ `description` sur chaque effet
embarqué, repris depuis l'ancien `system.effect`) ; à défaut d'effet, repli sur un extrait
en texte brut de la description complète (`htmlExcerpt()`, nouvelle fonction dans
`actor-sheet.mjs`).

**Découverte en creusant la couverture réelle** : sur 95 désavantages, seulement 5 ont un
effet actif embarqué (contre 90/94 avantages, grâce au chantier Effets qui n'a jamais visé
les désavantages). Décision utilisateur : ne pas construire d'effets manquants pour les 90
désavantages restants dans cette étape — repli sur l'extrait de description pour eux, comme
pour Mule/Cuisine de Déméter/Connaissance d'Héphaistos côté avantages.

**Correctif source** (`packs/_remove-effect-field.js`) : sur `avantages.db` et
`desavantages.db`, reprend `system.effect` dans la description de l'effet existant (s'il y
en a un et qu'il n'a pas déjà de description), retire le champ. Confirmé 0 doublon présent
dans les deux fichiers sources avant traitement.

**Propagation** : `0.6.63-cleanup-effect-field-avantages` et
`0.6.63-cleanup-effect-field-desavantages` dans `PACK_UPDATES` — dédoublonnent (garde le
premier effet, supprime le reste) ET reprennent le texte encore présent dans
`system.effect` sur le monde déjà déployé (champ orphelin après le retrait du schéma, mais
pas encore purgé des documents déjà stockés) dans la description de l'effet conservé.
Corrige au passage les doublons probablement causés par le bug de la 0.6.62.

**Ceci clôt l'étape 4** et, avec elle, le complément au chantier Effets initié par les
nouveaux avantages -2/-3/-5 ajoutés à `todo_foundry.txt` le 3 septembre.

**Fichiers** : `module/data-models/items/item-advantage.mjs`,
`module/data-models/items/item-disadvantage.mjs`, `templates/item/advantage-sheet.hbs`,
`templates/item/disadvantage-sheet.hbs`, `module/sheets/actor-sheet.mjs`,
`packs/avantages.db`, `packs/desavantages.db`, `packs/_remove-effect-field.js` (nouveau),
`module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 6) — Correctif urgent : `.effects.length` cassé dans tout l'écran de mise à jour (v0.6.61 → v0.6.62)

En testant le correctif Athlète (0.6.61), erreur en jeu : `TypeError: Cannot read properties
of undefined (reading 'system')` dans `fixAthleteEffect`. Cause racine identifiée : la
collection d'effets embarqués d'un Document Foundry (`doc.effects`) est une `Map`, dont la
propriété de comptage est `.size`, pas `.length` — `doc.effects.length` vaut donc toujours
`undefined`, silencieusement (`undefined === 0` et `undefined > 1` sont tous les deux
`false`, aucune exception levée). **Tous les contrôles d'idempotence écrits cette session
dans `module/helpers/pack-updates.mjs` reposaient sur ce pattern cassé** — 6 occurrences dans
5 fonctions (`embedMissingEffect`, `linkAndEmbedBatch2`, `linkAndMaybeEmbedBatch3`,
`embedAuraEffect`, `fixAthleteEffect`).

**Conséquence probable** : les correctifs `0.6.57-embed-effets-batch2`,
`0.6.58-link-embed-effets-batch3` et `0.6.59-embed-auras`, en pensant à tort qu'aucun effet
n'existait déjà sur un avantage, ont pu en ajouter un second par-dessus celui déjà présent
depuis un déploiement normal du compendium — explique vraisemblablement la nouvelle note de
`todo_foundry.txt` : "dans certains avantages, il y a deux effets". Le crash sur Athlète
avait une cause différente mais liée : `doc.effects.contents[0]` sur une collection
réellement vide (copie possédée sans aucun effet) retourne `undefined`, jamais intercepté
faute du bon test `=== 0`.

**Correctif** : les 6 occurrences remplacées par `.effects.size` (propriété standard de
`Map`, garantie fiable, aucune ambiguïté contrairement à `.length` qui n'est qu'une
commodité ajoutée par Foundry sur certaines collections mais pas celle-ci). Le code
pré-existant du système (hors cette session) n'était pas concerné : `item-sheet.mjs`
construit d'abord un vrai tableau JS via une boucle `for...of` avant d'appeler `.length`
dessus, jamais directement sur la collection Foundry.

**Reste à faire** : l'étape 4 (nettoyage des doublons + suppression du champ "Effet" +
alignement des descriptifs, voir `todo_foundry.txt` lignes 453-455) va justement inclure un
balayage générique de dédoublonnage qui répare la casse laissée par ce bug, sur le
compendium et toutes les copies déjà possédées.

**Fichiers** : `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 5) — Correctif : Athlète sans effet actif (v0.6.60 → v0.6.61)

Retour utilisateur en test : "Athléte n'a pas d'effet actif, il faut le corriger." Audit de
`packs/avantages.db` : rien de cassé côté source — Athlète a toujours son effet MULTIPLY
`system.deplacement` ×2, identique à Cuir de Héros/Peau d'Hadès qui fonctionnent, et aucun
avantage du compendium n'a de doublon d'effet actuellement.

**Diagnostic** : Athlète fait partie des 3 tout premiers exemples du chantier Effets
(session du 31 août, suite 14), construit avant TOUS les mécanismes de propagation ajoutés
depuis (macros `_fix-*-live.js` puis `PACK_UPDATES`). Contrairement à Cuir de Héros — qui a
eu son propre correctif de propagation dédié le lendemain suite à son propre bug — aucun
correctif n'a jamais spécifiquement ciblé Athlète, ni sur le compendium déjà déployé, ni sur
d'éventuelles copies déjà possédées par un personnage. Un joueur ayant récupéré Athlète
avant l'ajout de son effet (l'avantage existe dans le compendium de base depuis bien avant
le chantier Effets) n'a donc jamais pu recevoir la correction.

**Correctif** (`0.6.61-fix-athlete-effect` dans `PACK_UPDATES`) : défensif et idempotent,
gère les deux symptômes possibles — aucun effet (l'ajoute) et effet en double (garde une
seule copie correcte, `MULTIPLY déplacement ×2`) — sur le compendium et toute copie déjà
possédée par un acteur.

**Découverte en relisant `todo_foundry.txt`** (demande explicite de l'utilisateur après ce
retour) : trois nouvelles notes en bas du fichier, pas vues lors de l'audit initial —
certains avantages auraient 2 effets, le champ texte "Effet" de l'onglet description
devrait être supprimé (fait doublon avec la description), et chaque effet actif devrait
reprendre le descriptif simple de l'avantage. Portée plus large qu'Athlète seul — traité
comme une étape 4 distincte, à confirmer avec l'utilisateur avant de s'y lancer (pas
implémenté dans cette session).

**Fichiers** : `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 4) — Faveur de la Dame : compteur d'utilisations, étape 3/3 (v0.6.59 → v0.6.60)

Dernière étape du complément au chantier Effets : Faveur de la Dame ("cherche un moyen de
faire un bouton actif décrémenteur, commençant à 3... un autre bouton 'Rituel à la dame'
permet de remettre à 3") ne rentre pas dans le gabarit ActiveEffect — c'est un compteur
d'utilisations manuel, pas un modificateur de statistique.

**Découverte utile en cherchant une base à réutiliser** : les Sorts ont déjà exactement ce
mécanisme — `system.limitation`/`system.limitationValue` sur `item-spell.mjs`, avec
compteur + avertissement "plus d'utilisations" dans `castSpell()`
(`module/documents/item.mjs`). Plutôt que d'inventer un nouveau concept, les deux mêmes
champs sont ajoutés à `item-advantage.mjs` — générique, réutilisable par n'importe quel
futur avantage à charges limitées, pas seulement Faveur de la Dame.

**Différence avec les Sorts** : la limitation d'un Sort se réinitialise automatiquement au
repos long (`actor.mjs`, `longRest()`). Faveur de la Dame demande une réinitialisation
manuelle ("Rituel à la dame" est une action de jeu de rôle, pas du repos) — deux nouvelles
méthodes génériques sur `AntiqueItem` (`useCharge()`/`resetCharges()`), pas de branchement
sur le repos long.

**UI** : sur la fiche de personnage, dans la ligne de détail (dépliée) de chaque avantage,
un compteur `X / Y` + boutons "Utiliser"/"Réinitialiser" apparaissent seulement si
`system.limitation > 0` — aucun changement visuel pour les 111 autres avantages du
compendium. Champ également exposé dans l'onglet Description de la fiche d'objet
(mêmes classes CSS `.limitation-fields`/`.limitation-counter` que les Sorts).

**Faveur de la Dame** configurée à `limitation: 3` dans `packs/avantages.db`. Propagation :
`0.6.60-faveur-de-la-dame-limitation` dans `PACK_UPDATES`, avec une garde idempotente qui
ne réinitialise jamais un compteur déjà entamé par un joueur (ne patche que si
`limitation` n'est pas encore à 3).

**Ceci clôt les 3 étapes** du complément au chantier Effets (todo_foundry.txt étoffé le
3 septembre) : 32 effets narratifs + 18 effets mécaniques (dont correction des 15 Auras) +
ce compteur. Tout le contenu -2/-3/-5 des avantages est désormais traité.

**Fichiers** : `module/data-models/items/item-advantage.mjs`,
`templates/item/advantage-sheet.hbs`, `templates/actor/character-sheet.hbs`,
`module/sheets/actor-sheet.mjs`, `module/documents/item.mjs`, `css/antique.css`,
`lang/{fr,en}.json`, `packs/avantages.db`, `module/helpers/pack-updates.mjs`, `system.json`,
`module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 3) — Les 15 Auras s'appliquent aussi au porteur (v0.6.58 → v0.6.59)

Retour utilisateur sur l'étape 2 : "si je reviens sur ce que j'ai dit, les effets actifs
doivent être présents dans la description et être dans la partie effet de l'avantage pour
être appliqués aussi sur le pj qui a l'avantage." Les 15 "Aura d'X" ne sont donc plus
seulement des effets à glisser sur un allié (interprétation initiale, cohérente avec la
description "de l'équipe" et le nom "Allié de l'aura d'X") — ils doivent aussi s'appliquer
automatiquement au porteur, en plus de rester glissables. Même situation que le suivi du
2 septembre pour les 24 premiers effets simples : le lien de description existait déjà, il
ne manquait que l'effet embarqué.

**Correctif** (`packs/_embed-auras-on-advantages.js`) : embarque l'effet manquant sur les 15
avantages Aura (idempotent, ne touche pas un avantage déjà pourvu d'un effet), et ajuste le
texte de description des 15 documents Effet correspondants dans `effets.db` (l'ancien texte
"Glisser directement sur un allié" ne décrivait plus que la moitié du comportement réel).

**Propagation** : nouvelle entrée `0.6.59-embed-auras` dans `PACK_UPDATES` — les entrées de
l'étape 2 (`0.6.58-*`) ne sont pas modifiées dans leur comportement (un GM qui les aurait
déjà appliquées ne les revoit pas), donc un correctif de suivi séparé était nécessaire plutôt
que de changer leur fonction en place. Les données partagées (`EFFETS_BATCH3`, drapeau
`selfEmbed`) sont mises à jour pour que toute future application "à froid" des entrées
`0.6.58-*` embarque aussi directement les Auras.

**Fichiers** : `packs/effets.db`, `packs/avantages.db`, `packs/_embed-auras-on-advantages.js`
(nouveau), `module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite 2) — 18 nouveaux Effets mécaniques, étape 2/3 des avantages -2/-3/-5 (v0.6.57 → v0.6.58)

Suite de l'étape 1 (effets narratifs) : les avantages restants avaient tous une vraie
mécanique demandée dans `todo_foundry.txt`, faisable directement avec le schéma actuel.

**Découverte en construisant** : les 15 "Aura d'X" ne sont **pas** des effets à
auto-appliquer au porteur — la description déjà présente sur chaque avantage dit "Renforce
les jets de &lt;carac&gt; de l'équipe", et le nom demandé par le todo est "Allié de l'aura
d'X" (pas "Aura d'X"), donc un effet à glisser sur un allié. Traité comme Connaissance
d'Héphaistos (31 août) : document Effet autonome avec un vrai `changes`, lié depuis la
description de l'avantage, mais **sans** effet embarqué sur l'avantage lui-même — à
distinguer clairement des 3 autres avantages de cette étape, qui eux sont des bonus sur le
porteur (embarqués, comme Colère de Zeus/Visée d'Apollon).

**15 Auras** (`ADD system.abilities.<carac>.value +2`) : mapping caractéristique par dieu
repris à l'identique de `todo_foundry.txt` ET de la description déjà présente sur chaque
avantage (les deux sources concordaient) — Zeus/Athéna/Arès/Héphaïstos → Force, Héra/
Apollon/Hécate → Astuce, Poséidon/Demeter/Hadès → Constitution, Artèmis/Hermes →
Dextérité, Aphrodite/Dionysos/Hestia → Charisme. Vérifié avant d'écrire :
`system.abilities.<carac>.value` n'est jamais écrasé par `prepareDerivedData()` (seul
`.mod` en est dérivé, à partir de `.value`) — contrairement au piège `saves.base` d'une
session précédente, un ADD dessus persiste normalement.

**3 bonus sur le porteur** : Mire d'Artèmis (`ADD system.attackBonuses.armeADistance.
damageBonus +3`), Talent d'Héphaistos (`ADD system.attackBonuses.armeBlanche.damageBonus
+3`, littéralement le même effet que Colère de Zeus déjà en place), Pieds d'Hermes (`ADD
system.deplacement +6` — la description de l'avantage dit "+4 cases", et la grille du
système fait 1,5m/case, donc 4 × 1,5 = 6m, cohérent avec le todo qui demandait "+6m").

**Propagation** : deux nouvelles entrées dans le registre `PACK_UPDATES`
(`0.6.58-create-effets-batch3`, `0.6.58-link-embed-effets-batch3`), même mécanisme que
l'étape 1, pas de macro à coller.

**Reste à faire** : étape 3, Faveur de la Dame — hors gabarit ActiveEffect (compteur
décrémentable 3→0 avec bouton d'usage/erreur + bouton de reset), à cadrer séparément.

**Fichiers** : `packs/effets.db`, `packs/avantages.db`,
`packs/_build-effets-batch3-mechaniques.js` (nouveau), `module/helpers/pack-updates.mjs`,
`system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 (suite) — 32 nouveaux Effets simples, étape 1/3 des avantages -2/-3/-5 (v0.6.56 → v0.6.57)

Reprise du chantier Effets : l'utilisateur a étoffé `todo_foundry.txt` avec les avantages
divins (paliers -2/-3/-5) qui n'étaient pas dans le périmètre de la vague de septembre
(celle-ci ne couvrait que le palier -1). Audit avant construction : sur les 94 avantages du
compendium, 52 avaient `effects: 0` (aucun effet embarqué), dont 3 légitimement exemptés
(Mule reporté, Cuisine de Déméter et Connaissance d'Héphaistos qui ont leur propre mécanique
distincte d'un effet auto-attaché). Décision utilisateur : traiter les 49 restants par étapes,
en commençant par les effets purement narratifs.

**Étape 1 : 32 effets narratifs simples** (`packs/_build-effets-batch2.js`, même patron que
`packs/_build-effets-simple.js` de la première vague — Orientation, Porte bouclier, Don des
langues, Volonté de fer, Maitre d'Arme, Maitre des forges, Faveur +, Etincelle de Zeus,
Vision d'Héra, Voix d'Athéna, Moisson de Déméter, Talent de Dionysos, Flamme d'Hestia,
Lanterne d'Hécate, Dieu de l'esquive, Dieu du stade, Dieu de la guerre, Rageux, Faveur ++,
Sang de Zeus, Paume de Poséidon, Esprit d'Athéna, Armure d'Arès, Blé de Déméter, Oeil
d'Apollon, Compagnon d'Artèmis, Yeux d'Héphaistos, Murmure d'Aphrodite, Message d'Hermes,
Amphore de Dionysos, Bucher d'Héstia, Lune d'Hécate). **Différence avec la première vague** :
cette fois le lien de description ET l'effet embarqué sont créés dans le même passage — la
première vague avait dû faire un correctif de suivi séparé (`_embed-effets-simple-on-
advantages.js`, session précédente) parce que seul le lien avait été posé au départ ; leçon
retenue, plus la peine de refaire cette erreur.

**Propagation** : contrairement à toutes les vagues précédentes, pas de nouveau script
`packs/_fix-*-live.js` — les deux correctifs (créer les 32 documents dans `effets`, lier+
embarquer sur les 32 avantages dans `avantages`) sont enregistrés comme entrées
`0.6.57-create-effets-batch2` et `0.6.57-embed-effets-batch2` dans le registre
`module/helpers/pack-updates.mjs` mis en place plus tôt cette session — premier usage réel
du nouvel écran GM (`module/apps/pack-update-picker.mjs`) pour autre chose que la migration
de l'exemple `0.6.55`.

**Reste à faire** (étapes suivantes, pas dans cette session) :
- Étape 2 : avantages avec un vrai effet mécanique — 16 "Aura d'X" (`ADD
  system.abilities.<carac>.value +2`, champ vérifié non écrasé par `prepareDerivedData()`),
  Mire d'Artèmis (`ADD system.attackBonuses.armeADistance.damageBonus +3`, même famille que
  Visée d'Apollon), Talent d'Héphaistos (`ADD system.attackBonuses.armeBlanche.damageBonus
  +3`, identique à Colère de Zeus), Pieds d'Hermes (`ADD system.deplacement +6`).
- Étape 3 : Faveur de la Dame — hors gabarit ActiveEffect, demande un compteur décrémentable
  (3→0) avec bouton d'usage/erreur et un bouton de reset, à cadrer séparément.

**Fichiers** : `packs/effets.db`, `packs/avantages.db`, `packs/_build-effets-batch2.js`
(nouveau), `module/helpers/pack-updates.mjs`, `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 3 septembre 2026 — Écran de mise à jour des compendiums, par compendium (v0.6.55 → v0.6.56)

Jusqu'ici, propager une correction de contenu de compendium vers un monde déjà déployé
passait par un script `packs/_fix-*-live.js` que l'utilisateur devait se souvenir de coller
dans une macro GM et d'exécuter — point de friction déjà pris en défaut la veille (la macro
`_fix-embed-effets-simple-live.js` de la session du 2 septembre est restée en attente une
journée entière avant confirmation). Demande explicite : un écran par compendium, à cocher,
pour choisir quoi mettre à jour, avec une fusion sélective plutôt qu'un écrasement en bloc.

**Découverte en cours de route** : `module/helpers/version-check.mjs` contenait déjà une
ébauche quasi identique (dialog GM au login sur changement de version, choix "tout écraser /
tout garder" des compendiums) — mais gardée par `if (!game.system.manifest) return;`, et
`system.json` avait `"manifest": ""`. Ni les notes de version ni ce dialog ne s'étaient donc
jamais réellement affichés avec le déploiement Copy-Item habituel. Recherche sur l'API Foundry
(manifest/download de `system.json`, mécanisme `isNewerVersion` du bouton "Update" de Setup) :
`game.system.manifest` est une simple métadonnée statique lue depuis `system.json`, jamais
vérifiée par le réseau tant que l'admin ne clique pas explicitement sur "Update" — renseigner
`manifest`/`download` avec de vraies URLs GitHub Releases (`.../releases/latest/download/...`,
en s'appuyant sur `url` déjà présent) suffit donc à activer ce mécanisme existant pour les deux
modes de déploiement (Copy-Item et une future vraie install Foundry), sans toucher au code.
Aucune Release GitHub réelle n'est nécessaire pour l'usage local ; en poser un jour (avec
`system.json`/`system.zip` attachés à chaque tag) reste un prérequis distinct pour qu'une
install Foundry externe puisse réellement récupérer une mise à jour — hors scope ici.

**Nouveau mécanisme** (`module/helpers/pack-updates.mjs`) : un registre `PACK_UPDATES`, un
objet par correctif (id stable, `pack` cible, `label`/`description`, fonction `apply`) —
remplace, pour les futures sessions, l'écriture d'un script `_fix-*-live.js` à coller en macro.
Un réglage monde caché `appliedPackFixes` retient les `id` déjà appliqués ; `checkPendingPackUpdates()`
(hook `ready`, GM uniquement) ouvre l'écran de choix s'il en reste — **indépendamment** de
`checkSystemVersionUpdate()` et sans condition de changement de version : tant qu'un correctif
n'a pas été explicitement appliqué, il revient à chaque connexion GM. Premier correctif migré
dans ce registre : `0.6.55-embed-effets-simple` (reprend telle quelle la logique de
`packs/_fix-embed-effets-simple-live.js`, déjà exécutée et confirmée la veille — l'ancien
script reste en archive, non rétro-porté au-delà de cet exemple).

**Écran GM** (`module/apps/pack-update-picker.mjs`, `ApplicationV2`, même patron que
`module/apps/alchemy-shop.mjs`) : une `<fieldset>` par compendium concerné (regroupement via
`update.pack`, label résolu depuis `game.system.packs`), une case à cocher par correctif
(cochée par défaut), boutons "Appliquer la sélection" (n'exécute que les correctifs cochés,
marque leur id comme appliqué) et "Plus tard" (ferme sans rien marquer — tout ce qui n'a pas
été coché/appliqué reste en attente).

Le dialog existant "tout écraser / tout garder" (`overwriteSystemCompendiums()`) est conservé
tel quel, en parallèle — décision utilisateur : coexistence, pas remplacement. Comme il n'était
jamais réellement actif jusqu'ici, cette session est aussi la première fois qu'il s'affichera
réellement en jeu (au passage de v0.6.55 à v0.6.56) : à surveiller au prochain retour utilisateur.

**Fichiers** : `system.json` (`manifest`, `download`, version), `module/helpers/pack-updates.mjs`
(nouveau), `module/apps/pack-update-picker.mjs` (nouveau), `templates/apps/pack-update-picker.hbs`
(nouveau), `antique.mjs`, `css/antique.css`, `module/helpers/release-notes.mjs`.

---

## Session du 2 septembre 2026 — Correctif : les Effets simples n'étaient pas attachés aux avantages (v0.6.54 → v0.6.55)

Après déploiement de la session précédente, retour utilisateur : "les effets actifs existe bien, mais
il ne sont pas dans les aventages". Cause : `_build-effets-simple.js` n'avait ajouté qu'un lien
`@UUID` dans la description de chaque avantage, sans l'attacher réellement — l'onglet "Effets" de
l'avantage (`advantage-sheet.hbs`) restait vide pour les 24 "effets simples", contrairement à Cuir de
Héros/Athlète/Peau d'Hadès qui ont depuis le début un effet embarqué en plus du lien. Relecture de la
formulation d'origine dans `todo_foundry.txt` : "ajouter cet effet sur l'aventage" — demandait bien
les deux, pas seulement le lien.

**Correctif** (`packs/_embed-effets-simple-on-advantages.js`) : ajoute un effet embarqué narratif
(mêmes nom/description, aucun `changes` — cohérent avec la version standalone du compendium) sur
chacun des 24 avantages concernés dans `packs/avantages.db`. Connaissance d'Héphaistos n'est
délibérément pas concernée (effet à cibler sur un ennemi, pas à s'auto-attacher). Macro de
propagation `packs/_fix-embed-effets-simple-live.js` (idempotente, ne crée rien si un effet est déjà
présent) pour le compendium déjà déployé et les copies déjà possédées par un acteur — cas d'édition
d'un document déjà existant (`createEmbeddedDocuments` sur l'item), pas de création de document de
premier niveau, donc pas besoin de la macro `_fix-create-missing-pack-docs-live.js` ni de fermer
Foundry (voir la mémoire du système sur les 3 cas de déploiement des compendiums).

**Fichiers** : `packs/avantages.db`, `packs/_embed-effets-simple-on-advantages.js` (nouveau),
`packs/_fix-embed-effets-simple-live.js` (nouveau), `module/helpers/release-notes.mjs`,
`system.json`.

---

## Session du 1er septembre 2026 — Chantier Effets : audit + 27 nouveaux effets + 2 bugs (v0.6.53 → v0.6.54)

Reprise du chantier "Effets" (voir suite 13-15). Avant de continuer à en créer, audit de l'existant :
en plus des 3 effets construits via le nouveau compendium `effets.db`, **15 avantages avaient déjà un
effet embarqué fonctionnel**, hérité d'un ancien script `packs/_add-effects-final.js` (antérieur au
chantier compendium, jamais documenté dans ce journal) — écrit dans le format Foundry déprécié
(`changes` au premier niveau + `mode` numérique) plutôt que le format moderne
(`system.changes` + `type` string) adopté depuis la suite 14.

**2 bugs trouvés, même cause que Cuir de Héros (suite 15)** : "Sang froid" ciblait
`system.saves.volonte.base` et "Vif" `system.saves.reflexes.base` — champ retiré du schéma des
sauvegardes en juillet (`prepareDerivedData()` écrase `save.base` avec la constante codée en dur
`SAVE_BASE`), donc no-op silencieux depuis toujours. Corrigés vers `.bonus`, comme Cuir de Héros.
Vérifié dans le même passage que `system.ca.base` n'a pas ce problème (jamais écrasé dans
`prepareDerivedData()`) — les 4 avantages qui l'utilisent (Peau dense, Protection d'Athéna, Force de
Poséidon, Corps d'Arès) fonctionnent réellement, contrairement aux sauvegardes.

**Migration de format** (`packs/_migrate-advantage-effects-format.js`, source ; macro
`packs/_fix-migrate-advantage-effects-live.js` pour le compendium déjà déployé + copies sur acteur) :
les 15 effets embarqués existants (dont Sang froid et Vif une fois leur clé corrigée) réécrits au
format moderne — élimine l'avertissement de dépréciation loggué à chaque lecture (confirmé sans
risque : `ANTIQUE.getEffectChangeLabel()` lit déjà `change.type`, qui est toujours correct même sur
l'ancien format grâce à la migration à la volée de Foundry — seul le stockage change, pas le
comportement).

**24 nouveaux Effets narratifs** (`packs/_build-effets-simple.js`) : un par avantage restant listé
dans `todo_foundry.txt` sans mécanique demandée (Beauté d'Aphrodite, Bon sens, Branchies de Poséidon,
Chaleur d'Hestia, Chasse d'Artèmis, Commerçant, Don d'Hadès, Equilibre félin, Faveur, Fêtard,
Guerrier Aguerri, Ivresse de Dionysos, Mains d'Hermès, Rage d'Arès, Respect d'Héra, Soin d'Apollon,
Sommeil léger, Visage passe-partout, Vue d'Hécate, Ambidextrie, Ami des animaux, Casque d'Hadès,
Charme d'Aphrodite, Chrono sens) — document `ActiveEffect` sans `changes`, description reprise de
l'avantage, lié depuis la description de l'avantage (`@UUID[...]`, même patron que les 3 premiers).
Macro de propagation : `packs/_fix-effets-simple-links-live.js`.

**Peau d'Hadès** (`packs/_build-effet-peau-hades.js`) : MULTIPLY `system.pv.value` ×2, même famille
qu'Athlète — effet embarqué sur l'avantage (auto-appliqué tant qu'il est possédé) **et** document
standalone lié depuis la description, les deux écrits directement au format moderne (contenu neuf,
pas de dette à migrer). Macro de propagation : `packs/_fix-effet-peau-hades-live.js`.

**Cuisine de Déméter** : nouvel objet "Rations régénératrices de Déméter" (`packs/equipement.db`,
`aEqp000000000051`, `system.healAmount: 10`). Nouveau champ générique `system.healAmount` sur le
schéma Équipement (`item-equipment.mjs`, même famille que `caBonus`) — quand non nul, `consume()`
(`item.mjs`, l'action "Consommer" existante, distincte du simple clic sur l'image qui ne fait que
poster au chat) ajoute un bouton "Appliquer le soin" au message de chat qu'elle poste déjà. Nouveau
`AntiqueActor#applyHeal()` (miroir d'`applyDamage()`, plafonné au PV max) + hook chat `.apply-heal`
dans `antique.mjs` (miroir de `.apply-damage`/`.apply-effect`). Pour le lien "générer une ration"
demandé dans la description de l'avantage : plutôt qu'un vrai document Macro Foundry (aurait demandé
un nouveau compendium de type Macro rien que pour ça), un lien `<a class="generate-item-link"
data-item-uuid="...">` ordinaire dans la description, câblé par un handler délégué dans
`actor-sheet.mjs` (même famille que `.item-chat`/`.item-consume`) qui poste un message de chat
contenant un lien `@UUID[...]` — l'enrichissement natif des messages de chat le rend glissable par
n'importe quel joueur, donc aucune plomberie de "don de copie" à écrire : le mécanisme de stack déjà
en place (session du 31 août, suite 4) s'occupe du reste au drop.

**Décisions utilisateur sur les 2 autres cas laissés de côté** :
- **Mule** — remis à plus tard (dépend d'une fonctionnalité de capacité de port en kg qui n'existe
  pas encore dans le système, plus gros qu'un simple ActiveEffect).
- **"Bénédiction d'Hécate"** — abandonné, ne correspondait à rien de concret dans `todo_foundry.txt`
  malgré la formulation ; confirmé par l'utilisateur, plus la peine d'y revenir.

**Fichiers** : `packs/avantages.db`, `packs/effets.db`, `packs/equipement.db`,
`packs/_migrate-advantage-effects-format.js` (nouveau),
`packs/_fix-migrate-advantage-effects-live.js` (nouveau), `packs/_build-effets-simple.js` (nouveau),
`packs/_fix-effets-simple-links-live.js` (nouveau), `packs/_build-effet-peau-hades.js` (nouveau),
`packs/_fix-effet-peau-hades-live.js` (nouveau), `packs/_fix-cuisine-demeter-live.js` (nouveau),
`module/data-models/items/item-equipment.mjs`, `templates/item/equipment-sheet.hbs`,
`module/documents/item.mjs`, `module/documents/actor.mjs`, `antique.mjs`,
`module/sheets/actor-sheet.mjs`, `css/antique.css`, `lang/{fr,en}.json`,
`module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 31 août 2026 (suite 15) — Correctifs Effets + traits cliquables vers le chat (v0.6.52 → v0.6.53)

Retours utilisateur après test de la session précédente : "Connaissance d'Héphaistos fonctionne"
mais pas "Cuir de Héros" ; les effets doivent être glissables directement depuis un lien dans la
description de l'avantage ; il faut aussi que cliquer l'image d'un Avantage/Désavantage/Bénédiction/
Malédiction l'envoie au chat, comme les sorts et l'équipement le font déjà.

**Vraie cause du bug Cuir de Héros** : son effet ciblait `system.saves.robustesse.base` — ce champ
n'existe plus dans le schéma des sauvegardes depuis la refonte du 25 juillet (`base` retiré,
remplacé par la constante `SAVE_BASE = 1` codée en dur dans `prepareDerivedData()`, qui écrase
sans condition toute valeur de `save.base` à chaque calcul). L'ActiveEffect était donc un no-op
silencieux depuis toujours — jamais un problème de format de donnée. Le bon champ, déjà utilisé
avec succès par le désavantage "Dépressif", est `system.saves.<clé>.bonus`. Corrigé sur l'objet
"Effet" standalone ET sur l'avantage "Cuir de Hero" lui-même (source + macro
`packs/_fix-advantages-effect-links.js` pour le compendium déjà déployé et les copies sur acteur).

**Au passage, migration vers le schéma moderne d'ActiveEffect** : `packs/_build-effets.js` écrit
désormais `changes` sous `system.changes` (plus au premier niveau) avec un `type` de chaîne
(`"add"`/`"multiply"`) plutôt qu'un `mode` numérique — les deux sont dépréciés depuis Foundry v14
(vérifié dans `common/documents/active-effect.mjs` : `migrateData()`/`shimData()` gèrent la
rétrocompatibilité via des accesseurs qui logguent un avertissement à chaque lecture, pas une
solution à garder pour du contenu qu'on écrit nous-mêmes aujourd'hui). `CONFIG.ANTIQUE.
getEffectChangeLabel()` (`config.mjs`) lit maintenant `change.type` au lieu de `change.mode`,
supprimant les avertissements de la console sur TOUT effet du système, pas seulement les nouveaux.

**Liens glissables** : les 3 avantages (Cuir de Hero, Athléte, Connaissance d'Héphaistos) reçoivent
un `@UUID[Compendium.antique.effets.<id>]{...}` à la fin de leur description — un lien de contenu
Foundry enrichi est nativement glissable, donc le glisser directement depuis le texte applique
l'Effet exactement comme le glisser depuis le compendium, sans code supplémentaire.

**Nettoyage** : découverte en cherchant où ajouter les liens `.item-chat` d'un **second bloc
"Effets" mort**, plus ancien que celui de la session précédente (13/14) — un reliquat jamais
retiré référençant l'ancien type d'objet `AntiqueEffect` (`data-type="effect"`, `system.active`,
`actor.items.get(...)` sur un id qui vit en réalité dans `actor.effects`) : template, handler JS
(`.effect-active-toggle`) et CSS (`.effects-list-actor`, `.effect-inactive`) tous retirés.

**Cliquer pour envoyer au chat** : `.item-chat` ajouté sur l'image des Avantages, Désavantages,
Bénédictions et Malédictions dans l'onglet Traits (déjà présent sur Sorts et Équipement,
manquant partout ailleurs) — clic envoie image + titre + description au chat, via
`AntiqueItem#postToChat()` déjà générique.

**Fichiers** : `packs/_build-effets.js`, `packs/effets.db`, `packs/effets/`, `packs/avantages.db`,
`packs/_fix-advantages-effect-links.js` (nouveau), `module/helpers/config.mjs`,
`module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`,
`module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 31 août 2026 (suite 14) — Simplification : compendium d'Effets = ActiveEffect pur (v0.6.51 → v0.6.52)

Retour utilisateur après test de la session précédente (suite 13) : le champ "Actif" de l'objet
Effet est redondant avec le vrai effet actif déjà listé dans son propre onglet Effets ; pareil pour
"Durée" ; et le bonus de CA de Connaissance d'Héphaistos devrait faire partie du vrai effet actif
plutôt que d'être un champ à part avec un bouton de chat séparé. Question posée en retour : pourquoi
ne pas mettre directement des documents de type `ActiveEffect` dans le compendium plutôt que des
objets "Effet" qui en contiennent un ?

**Vérifié dans le vrai schéma Foundry** (`common/documents/active-effect.mjs`) : `ActiveEffect` a
déjà nativement `name`, `img`, `description` (HTML), une vraie `duration` structurée
(value/units/expiry, plus riche que le champ texte qu'on avait), `disabled`, `transfer` — tout ce
qu'on avait dupliqué à la main sur `AntiqueEffect` existait déjà. Aucune raison de garder un objet
Item comme simple emballage.

**Correctif** : type d'objet `AntiqueEffect` retiré entièrement du système (`item-effect.mjs`,
`effect-sheet.hbs` supprimés ; retiré de `antique.mjs` — dataModels, types de fiche d'objet,
préchargement de template — et de `item-sheet.mjs`). Le compendium `packs/effets.db` /
`packs/effets/` contient désormais directement des documents `ActiveEffect` de premier niveau
(`type: "ActiveEffect"` dans `system.json`, préfixe de clé LevelDB `!effects!` — confirmé dans le
schéma Foundry, `ActiveEffect.metadata.collection === "effects"`, même convention que `!items!`
pour un pack Item).

- **Connaissance d'Héphaistos** : n'a plus de champ `caBonus` à part ni de bouton de chat — c'est
  maintenant un `ActiveEffect` `system.ca.temp` -2 comme les deux autres, à glisser directement sur
  la cible (désactiver ou supprimer l'effet quand il doit cesser).
- **Onglet Traits** : la section "Effets" lit maintenant `actor.effects` (collection Foundry native
  des ActiveEffect embarqués directement sur l'acteur) au lieu de `actor.items` filtrés par type —
  distincte des effets qui vivent sur un Avantage/Désavantage possédé (`item.effects`, déjà montrés
  dans l'accordéon de ce trait). Nouveaux handlers dédiés dans `actor-sheet.mjs`
  (`.actor-effect-create/-edit/-delete/-toggle`, plutôt que les `.item-*` génériques qui
  résolvaient via `actor.items` et auraient échoué silencieusement). Éditer un effet ouvre la fiche
  native Foundry de configuration d'ActiveEffect — aucune fiche personnalisée à maintenir.

**Note pour l'utilisateur** : relancer le monde à nouveau après ce déploiement (le type du pack a
changé, Foundry doit le relire). Un éventuel objet "Effet" déjà glissé sur un acteur de test lors de
la session précédente restera un type d'objet orphelin (n'existe plus) — à supprimer à la main si
présent.

**Fichiers** : suppression de `module/data-models/items/item-effect.mjs`,
`templates/item/effect-sheet.hbs` ; `antique.mjs`, `module/sheets/item-sheet.mjs`,
`module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`,
`lang/{fr,en}.json`, `system.json`, `packs/effets.db`, `packs/effets/`,
`packs/_build-effets.js`, `packs/_build-effets-leveldb.js`, `module/documents/item.mjs`,
`module/helpers/release-notes.mjs`.

---

## Session du 31 août 2026 (suite 13) — Architecture des Effets + 3 exemples (v0.6.50 → v0.6.51)

Suite à la nouvelle demande retrouvée dans `todo_foundry.txt` ("Feature antique" : système d'effets
glissables depuis un compendium, un par Avantage, avec de la vraie mécanique quand c'est possible).
Discussion d'architecture avec l'utilisateur avant d'implémenter — décision : construire d'abord la
plomberie avec 2-3 exemples plutôt que les ~19 d'un coup.

**Constat de départ** : le type d'objet `AntiqueEffect` ("Effet") existait déjà (`item-effect.mjs`,
`effect-sheet.hbs`) mais était un simple stub narratif jamais utilisé dans aucun compendium — bon
véhicule pour ce chantier, pas besoin d'un nouveau type de document ni d'un compendium
`ActiveEffect` autonome (jamais utilisé dans ce système, aurait demandé de la plomberie neuve).
`_prepareEffectItems()` existait aussi déjà côté `actor-sheet.mjs` (`context.effects`) mais n'était
jamais consommé par aucun template — code mort, jamais fini.

**Deux points d'attache pour un même objet "Effet"**, sans dupliquer de logique :
1. Intégré directement à l'avantage correspondant (`effects` embarqué sur l'item Avantage — déjà le
   mécanisme existant, ex. "Cuir de Hero" l'avait déjà correctement pour +2 Robustesse).
2. Glissé directement sur un PJ/PNJ comme objet indépendant — fonctionne déjà nativement (item
   `transfer:true`, icône de token gratuite côté Foundry) ; il manquait juste l'affichage dans
   l'onglet Traits.

**3 exemples couvrant les 3 familles mécaniques** (nouveau compendium `packs/effets.db` +
`packs/effets/`, script `packs/_build-effets.js` / `_build-effets-leveldb.js`) :
- **Cuir de Héros** — bonus passif ADD (`system.saves.robustesse.base` +2). Déjà présent et correct
  sur l'avantage lui-même (`aAdv000000000014`), rien à changer côté avantage.
- **Athlète** — bonus passif MULTIPLY (`system.deplacement` ×2, mode `CONST.ACTIVE_EFFECT_MODES.
  MULTIPLY`). L'avantage "Athléte" (`aAdv000000000007`) décrivait déjà "Capacité de déplacement x2"
  mais son tableau `effects` était vide — vrai bug de contenu, corrigé (source + macro
  `packs/_fix-athlete-effect.js` pour le compendium déjà déployé et les copies sur acteur).
- **Connaissance d'Héphaistos** — effet ponctuel ciblé, pas un bonus passif : nouveau champ
  `system.caBonus` sur `AntiqueEffect` (même concept que le `caBonus` des sorts), `postToChat()`
  ajoute le même bouton "Appliquer l'effet" qu'un sort à bonus de CA (`applyCaBonus`, déjà générique
  sur la cible) quand `caBonus` est non nul — zéro nouveau hook de chat, réutilise le handler
  existant (`renderChatMessageHTML` dans `antique.mjs`, déjà écrit pour les sorts).

**Bug corrigé au passage** : `CONFIG.ANTIQUE.getEffectChangeLabel()` (résumé affiché dans l'accordéon
Traits) supposait toujours un mode ADD (`+N`/`-N`) et n'avait aucun cas pour `system.deplacement` —
aurait affiché "+2 system.deplacement" (faux et moche) pour l'effet Athlète. Corrigé : `×N` pour le
mode MULTIPLY, libellé propre pour le déplacement.

**Onglet Traits** : nouvelle section "Effets" (`character-sheet.hbs`), même gabarit que Malédictions
(liste simple, pas de colonne coût) — icône cliquable pour envoyer au chat (déclenche le bouton
d'application le cas échéant), badge résumant l'ActiveEffect embarqué s'il y en a un.

**Limite connue, assumée pour cette première passe** : pas de section "Effets" dédiée sur la fiche
PNJ (pas de bloc Traits sur cette fiche) — un effet déposé sur un PNJ s'applique quand même
mécaniquement (transfert d'ActiveEffect natif Foundry), juste sans affichage dédié pour l'instant.

**Suite prévue** (non faite ici, à la demande de l'utilisateur de valider la plomberie d'abord) :
remplir le compendium avec le reste des ~19 avantages listés dans `todo_foundry.txt`, dont
Cuisine de Déméter (objet consommable + macro de génération via un lien dans le chat) et Peau
d'Hadès (PV actuels ×2, même mode MULTIPLY qu'Athlète — déjà prouvé).

**Fichiers** : `module/data-models/items/item-effect.mjs`, `templates/item/effect-sheet.hbs`,
`module/documents/item.mjs`, `module/sheets/actor-sheet.mjs`,
`templates/actor/character-sheet.hbs`, `module/helpers/config.mjs`, `css/antique.css`,
`lang/{fr,en}.json`, `system.json`, `packs/effets.db` (nouveau), `packs/effets/` (nouveau),
`packs/_build-effets.js` (nouveau), `packs/_build-effets-leveldb.js` (nouveau),
`packs/avantages.db`, `packs/_fix-athlete-effect.js` (nouveau), `module/helpers/release-notes.mjs`.

---

## Session du 31 août 2026 (suite 12) — Esquive/Parade en réaction (v0.6.49 → v0.6.50)

Point 7 de `TODO_BUG_ANTIQUE.md`, débloqué après clarification des règles avec l'utilisateur :
n'importe qui (PJ ou PNJ) peut tenter une Esquive/Parade en réaction quand un ennemi va toucher,
plusieurs fois par tour ; que le jet réussisse ou non, ça coûte -1 temporaire à cette même
compétence (cumulatif sur le tour), remis à sa valeur normale au début du tour suivant de l'acteur.

**Nouveau champ `tempPenalty`** : ajouté au schéma générique `skillSchema()` de
`actor-character.mjs` (présent sur les 48 compétences pour la cohérence du schéma, mais seul
Esquive/Parade y écrivent) ; `skill.total` inclut désormais `+ skill.tempPenalty`. Les PNJ n'ont pas
de système de compétences : nouveaux champs plats dédiés `system.esquive`/`system.parade`
(`{value, tempPenalty}` + `total` dérivé) sur `AntiqueNpc`, même principe simplifié que
`attackBonuses`.

**`AntiqueActor#rollDodgeSkill(skillKey)`** (nouveau, partagé PJ/PNJ) : lit `system.skills.<key>`
ou `system.<key>` selon le type d'acteur, lance `1d20 + total`, puis décrémente `tempPenalty` de 1
— fonctionne quel que soit le résultat du jet, conformément à la règle.

**Remise à zéro automatique** : nouveau `module/helpers/dodge-reset.mjs`
(`registerDodgeResetHook()`) qui écoute `Hooks.on("combatTurnChange", ...)` — hook interne de
`Combat#_manageTurnEvents()` (vérifié dans le vrai code source Foundry v14,
`client/documents/combat.mjs`), qui expose directement `current.combatantId` (l'acteur dont le tour
commence). Gardé au MJ actif uniquement (`game.user.isActiveGM`) puisque ce hook se déclenche sur
tous les clients à la fois — évite que chacun tente la même écriture (idempotente mais redondante)
en parallèle.

**UI** : boutons Esquive/Parade ajoutés dans l'onglet Combat, juste à côté du Déplacement (demande
explicite) — sur la fiche Personnage (`combat-stats`, nouvelle classe `.dodge-section.dodge-roll`)
et sur la fiche PNJ (`npc-combat-quick`, `.npc-stat-box.npc-rollable.dodge-roll`, éditable comme les
autres cases rapides via `data-field` + listener dédié déjà en place depuis le point 8). Toujours
présents aussi dans la liste générale des compétences (Esquive/Parade existaient déjà comme
compétences standard) — ce nouvel emplacement est un raccourci, pas un remplacement.

**Fichiers** : `module/data-models/actor-character.mjs`, `module/data-models/actor-npc.mjs`,
`module/documents/actor.mjs`, `module/helpers/dodge-reset.mjs` (nouveau), `antique.mjs`,
`module/sheets/actor-sheet.mjs`, `module/sheets/npc-sheet.mjs`,
`templates/actor/character-sheet.hbs`, `templates/actor/npc-sheet.hbs`, `css/antique.css`,
`lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 11) — Combolist d'emplacement mal affichée (v0.6.48 → v0.6.49)

Point 12 de `TODO_BUG_ANTIQUE.md`. Deux mécanismes distincts existent pour l'emplacement d'un
objet : (1) un menu contextuel "+" dans le tableau d'inventaire (`.item-equip-picker`, session du
25 juillet), et (2) un vrai `<select name="system.slot">` sur la fiche de l'objet lui-même
(`equipment-sheet.hbs`/`weapon-sheet.hbs`) — c'est ce deuxième, la vraie "combolist", que visait le
signalement d'origine.

**Cause** : `.antique.sheet.item .form-group` est une ligne flex (`label` + champ) sans
`flex-wrap`, et aucune règle ne donnait de largeur/flex-basis au `<select>` — contrairement à
`input[type="number"]` qui a sa propre règle. Un `<select>` prend nativement la largeur de sa plus
longue `<option>` (ex. "Arme principale"), souvent plus large qu'un champ texte, donc plus
susceptible de déborder du cadre sur une fiche d'objet étroite faute de pouvoir rétrécir.

**Correctif** : `.antique.sheet.item .form-group select {flex:1; min-width:0}` — s'applique à tous
les `<select>` des fiches d'objet (emplacement, catégorie d'arme, compétence liée, catégorie
d'ingrédient, munition liée...), pas seulement celui de l'emplacement initialement signalé, puisque
tous partagent exactement la même structure `.form-group` et le même défaut.

Point du menu contextuel (`.item-equip-picker`, mécanisme 1) audité en passant : `fixed:true`
déplace le menu dans `document.body` via l'API `popover` native — la règle `.antique #context-menu
{z-index:9999}` ne le concerne donc plus (il sort du DOM scopé `.antique`), mais Foundry force de
toute façon `z-index:unset` sur `#context-menu[popover]` (vérifié dans le CSS core Foundry) et
s'appuie uniquement sur le top-layer natif du navigateur pour l'empilement — donc sans impact réel,
rien à corriger de ce côté.

**Fichiers** : `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`,
`TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 10) — Éditeurs de texte : taille dynamique + plancher 300px (v0.6.47 → v0.6.48)

Point 11 de `TODO_BUG_ANTIQUE.md` (todo_foundry.txt, "TODO robin"). Audit de tous les `<prose-mirror>`
du système (`richEditor`, 21 emplacements) : les fiches d'Objet, le Deity, et l'onglet Notes
(Personnage + PNJ) étaient déjà entièrement câblés en `flex-column` de bout en bout depuis les
sessions de juillet — seul leur plancher (150-200px) était trop bas. L'onglet Statistiques du PNJ,
lui, n'avait aucun câblage flex du tout (`display:block`, comme la plupart des onglets).

**Correctif** :
- Plancher remonté à 300px partout où c'est un éditeur de contenu principal (description d'objet,
  notes joueur/MJ, description de divinité, historique du personnage) — inchangé sur les micro-champs
  de commentaire par entrée (`.bg-field`, alliés/ennemis, 60px, différent usage).
- `data-tab="stats"` ajouté à la liste des onglets `flex-column` (déjà scopée à `notes` seulement,
  par choix délibéré des sessions précédentes pour ne pas risquer les tableaux/grilles des autres
  onglets) — l'onglet Statistiques du PNJ n'a qu'une grille de caractéristiques + un bloc de stats
  rapides + une description en fin d'onglet, même profil de risque que l'onglet Notes déjà traité.
  `.npc-description` reçoit le même triplet `flex:1; min-height:0; display:flex; flex-direction:column`.
- Nettoyage au passage : `.antique.npc .npc-notes {height:100%; min-height:200px}` supprimée — une
  règle plus spécifique et plus tardive dans le fichier (`.antique .player-notes-section .npc-notes`)
  écrasait déjà silencieusement son `min-height` depuis le passage de l'onglet Notes en flex-column ;
  code mort, jamais nettoyé.
- **Laissé de côté volontairement** : l'historique (`bg-histoire`, onglet Background) garde son
  plancher remonté à 300px mais ne s'agrandit pas avec la fenêtre — cet onglet est une vraie grille
  CSS à 2 colonnes (alliés/ennemis, croyance, historique...), pas un simple empilement comme les
  onglets déjà traités ; y faire grandir spécifiquement la ligne de l'historique sans perturber les
  autres cases demanderait de restructurer les lignes de la grille, jugé trop risqué à faire sans
  vérification visuelle directe (pas d'accès navigateur dans cet environnement).

**Fichiers** : `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`,
`TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 9) — Réorganiser les favoris (v0.6.46 → v0.6.47)

Point 10 de `TODO_BUG_ANTIQUE.md`. `system.favoriteSkills` est un `ArrayField` de clés de
compétence dont l'ordre pilote déjà l'affichage de la barre de favoris — il ne restait qu'à
permettre de le réordonner par glisser-déposer, aucune structure de donnée à changer.

**Correctif** : `.favorite-chip` devient `draggable="true"` (`favorites-bar.hbs`). Payload de drag
dédié (`{type: "AntiqueFavoriteReorder", skillKey}`, pas un vrai document Foundry) posé au
`dragstart`, lu au `drop` sur la puce cible — `#applyFavoriteReorder()` déplace la clé glissée à la
position de la cible dans le tableau (`splice`/`splice`) puis persiste + rafraîchit la barre isolée
(même mécanisme que l'ajout/retrait). Le verrou de séquencement déjà en place pour éviter une
course entre deux ajouts/retraits rapprochés (`_favoriteToggleChain`, renommé `_favoritesChain`
puisqu'il sert maintenant aussi le réordonnancement) protège aussi cette nouvelle opération.

**Fichiers** : `templates/actor/parts/favorites-bar.hbs`, `module/sheets/actor-sheet.mjs`,
`css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 8) — Glisser compétences/armes vers les macros (v0.6.45 → v0.6.46)

Point 9 de `TODO_BUG_ANTIQUE.md`. Les armes étaient déjà glissables (`dragSelector: ".item-list
.item"`, standard Foundry) mais un drop sur la barre de macros produisait le comportement par défaut
de Foundry : une macro qui ouvre juste la fiche de l'objet. Les compétences, elles, ne sont pas des
Item — rien n'existait pour les glisser du tout.

**Correctif** : nouveau `module/helpers/hotbar-macros.mjs` (`registerHotbarMacroDrop()`, appelé
depuis `Hooks.once("init")`), qui écoute `Hooks.on("hotbarDrop", ...)` — le hook exposé par
`Hotbar#_onDropData` (vérifié dans le vrai code source Foundry v14,
`client/applications/ui/hotbar.mjs`) : y retourner `false` **de façon synchrone** empêche Foundry de
créer sa propre macro par défaut ; la création de la vraie macro se fait ensuite en arrière-plan
(non attendue par le hook, qui a déjà retourné `false`).

- **Armes** (`data.type === "Item"`) : si l'objet est une arme, macro `script` dont la commande
  refait `fromUuid(uuid)` puis `item.rollAttack()`. Sinon (tout autre type d'objet), reproduit à
  l'identique le comportement par défaut de Foundry (`Hotbar#_createDocumentSheetToggle`, même
  commande `foundry.applications.ui.Hotbar.toggleDocumentSheet(uuid)`) — ce hook interceptant
  désormais TOUT drop de type "Item", il fallait explicitement préserver le comportement existant
  pour ce qui n'est pas une arme, sans quoi glisser un autre type d'objet ne ferait plus rien.
- **Compétences** : nouveau payload de drag inventé (pas un vrai type de document Foundry),
  `{type: "AntiqueSkillRoll", actorUuid, skillKey}`, posé par un `dragstart` ajouté sur `.skill-roll`
  (`character-sheet.hbs`/`actor-sheet.mjs`) — la macro générée refait `fromUuid(actorUuid)` puis
  `actor.rollSkill(skillKey)`.

**Fichiers** : `module/helpers/hotbar-macros.mjs` (nouveau), `antique.mjs`,
`module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `lang/{fr,en}.json`,
`module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 7) — Régression : validation cassée sur les PNJ (v0.6.44 → v0.6.45)

Retour utilisateur (PNJ "Harpie" sur le plateau) : décocher "Praticien de la magie" fait échouer la
sauvegarde avec `DataModelValidationError` sur `ca.value`/`initiative.value`/`attaque.value`
("must be a number"). Régression introduite dans cette même session (point 8 ci-dessus) : le
nouveau bloc `.npc-combat-quick` de l'onglet Combat réutilisait les mêmes `name="system.ca.value"`
(etc.) que le bloc déjà existant sur l'onglet Statistiques — les deux vivant dans le **même**
`<form>` (les deux onglets sont rendus simultanément dans le DOM, seul un `classList.toggle`
change lequel est visible), Foundry lit alors une liste de deux éléments au lieu d'une valeur
unique à la soumission, quel que soit le champ réellement modifié.

**Correctif** : les 4 champs du bloc Combat (`ca.value`, `initiative.value`, `deplacement`,
`attaque.value`) n'ont plus de `name` — ils portent un `data-field` et sont sauvegardés par un
listener `change` dédié (`actor.update({[field]: value})` + re-render), plutôt que par la
soumission du formulaire partagé. Le bloc Statistiques (seule copie avec `name=`) est inchangé.
Le tableau de bonus d'attaque (`system.attackBonuses.*`, unique à l'onglet Combat) n'était pas
concerné.

**Fichiers** : `templates/actor/npc-sheet.hbs`, `module/sheets/npc-sheet.mjs`,
`module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 31 août 2026 (suite 6) — Onglet Combat PNJ complet + réservé au MJ (v0.6.43 → v0.6.44)

Point 8 de `TODO_BUG_ANTIQUE.md`, reformulé après clarification utilisateur (la demande initiale
"compétences de combat avec compendium associé" était trop vague — la vraie demande : le même
onglet Combat que la fiche Personnage, avec CA/Initiative/Déplacement/bonus d'attaque par
catégorie, éditable par le MJ, et **réservé au MJ** — un joueur qui possède/contrôle un PNJ ne doit
plus voir cet onglet du tout).

**Bonus d'attaque par catégorie** : nouveau `system.attackBonuses.{mainNue,armeBlanche,armeDeJet,
armeExotique,combatDeuxMains,armeADistance}.total` sur `AntiqueNpc` — même forme `{total}` que la
fiche Personnage (pas de détail carac/compétence, les PNJ n'ont pas de système de compétences),
pour que `AntiqueActor#rollAttackCategory()` (déjà partagé par les deux types d'acteur) fonctionne
sans modification. Tableau `.attack-table` à 2 colonnes (Catégorie / Bonus, éditable), même styles
CSS que la fiche Personnage, ligne cliquable pour lancer le jet (`.attack-cat-roll`).

**Réservé au MJ** : le lien d'onglet et le contenu de l'onglet Combat sont désormais conditionnés
sur `isGM` (au lieu de `hasFullAccess = isGM || isOwner`) — un joueur propriétaire d'un PNJ garde
Statistiques/Inventaire/Magie, mais plus Combat. La case CA masquée aux joueurs (ajoutée plus tôt
sur l'onglet Statistiques) devient inutile dans ce nouvel onglet Combat puisqu'il est déjà 100%
MJ — simplifiée en input toujours visible à cet endroit précis (le Statistiques garde son
traitement d'origine, inchangé).

**Fichiers** : `module/data-models/actor-npc.mjs`, `module/sheets/npc-sheet.mjs`,
`templates/actor/npc-sheet.hbs`, `module/helpers/release-notes.mjs`, `system.json`,
`TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 5) — Onglet Combat des PNJ complété (v0.6.42 → v0.6.43)

Point 6 de `TODO_BUG_ANTIQUE.md`. La CA, l'Initiative et le Bonus d'attaque existaient déjà dans le
modèle de données PNJ, mais leur seul affichage (`.npc-combat-quick`) vivait sur l'onglet
**Statistiques**, jamais sur l'onglet **Combat** (qui ne contenait que le tableau d'armes) — d'où le
signalement "absents" en le cherchant au bon endroit. Le Déplacement, lui, n'existait carrément pas
dans le modèle PNJ (seulement sur la fiche Personnage).

**Correctif** : nouveau champ `system.deplacement` (9m par défaut, même défaut que le personnage)
sur `AntiqueNpc`. Le bloc `.npc-combat-quick` (CA/Initiative/Attaque, + désormais Déplacement)
dupliqué en haut de l'onglet Combat — mêmes champs `name="system...."`, donc automatiquement
synchronisé avec l'onglet Statistiques sans code JS supplémentaire (les listeners de
`_onRender()` sont déjà posés par sélecteur de classe, pas par ID). `.npc-combat-quick` passé en
`flex-wrap: wrap` pour absorber la 4ᵉ case sans dépasser la largeur de la fiche.

**Fichiers** : `module/data-models/actor-npc.mjs`, `templates/actor/npc-sheet.hbs`,
`css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 4) — Glisser-déposer d'objets empilables (v0.6.41 → v0.6.42)

Point 4 de `TODO_BUG_ANTIQUE.md`. Le glisser-déposer natif Foundry (`ActorSheetV2#_onDropItem`) ne
stackait déjà que via `grantItemToActor()` (boutons Prendre/Payer du Navigateur/Boutique
d'Alchimie) — un drag & drop HTML5 direct (depuis le Navigateur, un autre acteur, ou les objets du
monde) tombait dans le comportement par défaut de Foundry, qui crée toujours une copie neuve.

**Correctif** : nouveau `stackOrCreateDroppedItem(actor, item)` dans `browser-shared.mjs`
(`STACKABLE_TYPES` désormais exporté) — même règle de correspondance que `grantItemToActor`
(type + nom + apothCategory), mais incrémente de la quantité **réelle de l'objet déposé** (pas
toujours +1, pertinent quand la source a elle-même plusieurs exemplaires) plutôt que de forcer 1.
Appelé dans `_onDropItem()` de `actor-sheet.mjs` et `npc-sheet.mjs`, uniquement quand l'objet vient
d'ailleurs que l'acteur cible lui-même (un drop intra-fiche reste un simple réordonnancement, géré
tel quel par `super._onDropItem()`) ; retombe sur le comportement par défaut (nouvelle copie) si
aucune correspondance stackable n'est trouvée.

**Fichiers** : `module/apps/browser-shared.mjs`, `module/sheets/actor-sheet.mjs`,
`module/sheets/npc-sheet.mjs`, `module/helpers/release-notes.mjs`, `system.json`,
`TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 3) — Retrait du champ "composant" des sorts (v0.6.40 → v0.6.41)

Suite à l'audit du point 3 de `TODO_BUG_ANTIQUE.md` (voir session précédente) : `system.components`
confirmé comme pure duplication de `system.costText` pour les rituels (recopié une seule fois au
build par `_build-sorts.js`, jamais lu par aucune logique de jeu, seulement réaffiché dans
`postToChat()`). Décision utilisateur : le retirer.

Retiré du schéma (`item-spell.mjs`), du template (`spell-sheet.hbs`), de l'affichage chat
(`item.mjs::postToChat()`), de `packs/_build-sorts.js`, des clés de langue
(`ANTIQUE.Spell.Components`, `lang/{fr,en}.json`), et des scripts d'analyse/validation
(`_analyze-sorts.js`, `_validate-sorts.js`). Champ retiré des 32 documents sort de `packs/sorts.db`
(clé supprimée, pas juste vidée). Nouvelle macro `packs/_fix-remove-spell-components.js` (syntaxe de
suppression de clé `"system.-=components"`) pour nettoyer le compendium déjà déployé et les copies
déjà possédées par un acteur — **à exécuter par l'utilisateur**.

**Fichiers** : `module/data-models/items/item-spell.mjs`, `templates/item/spell-sheet.hbs`,
`module/documents/item.mjs`, `packs/_build-sorts.js`, `packs/sorts.db`, `packs/_analyze-sorts.js`,
`packs/_validate-sorts.js`, `packs/_fix-remove-spell-components.js` (nouveau),
`lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite 2) — Rituels : l'onglet Ingrédients fait foi (v0.6.39 → v0.6.40)

Point 3 de `TODO_BUG_ANTIQUE.md`. Pour un rituel, deux mécanismes coexistaient sans se remplacer
depuis la session du 16 août : `system.costText` (texte libre, ex. "Anis/ Bougie") recherche et
décrémente un objet consommable par correspondance de nom (étape 3 de `castSpell()`), tandis que
`system.ingredients` (onglet "Ingrédients" dédié) gère sa propre checklist "Possédé" + son propre
décompte réel (étape 1.5/4.5, ajoutées le 16 août). Les deux pouvaient bloquer/décompter
indépendamment pour le même rituel dès que ses deux champs étaient renseignés.

**Correctif** : `castSpell()` — l'étape 3 (costText) est désormais sautée pour un **personnage
joueur** dès que `system.ingredients` est rempli ; l'onglet Ingrédients devient alors la seule
source de vérité (gating + décompte réel déjà en place depuis le 16 août). Un PNJ n'est pas
concerné (l'onglet Ingrédients ne s'applique déjà qu'aux personnages-joueurs) : ses rituels
continuent de décrémenter via `costText` sans changement.

**Migration des données** : les 8 rituels existants n'avaient encore jamais aucun `system.ingredients`
rempli, seulement `costText`. Nouveau script `packs/_fix-sorts-ritual-ingredients.js` (source,
one-off) qui parse `costText` ("X/ Y" → 2 entrées, quantité 1 chacune) et remplit `sorts.db` sans
toucher aux autres champs ni aux `_id` (jamais relancé le build complet depuis l'Excel, absent en
local). Nouvelle macro `packs/_fix-sorts-ritual-ingredients-live.js` (API Document Foundry
uniquement) pour appliquer le même correctif au compendium Sorts déjà déployé et à toute copie déjà
possédée par un acteur — **à exécuter par l'utilisateur**.

**Troisième point du bug** : après un cast avec "Consommer les ingrédients", la checklist ne remet
plus systématiquement tout à `possede: false` — chaque entrée est resynchronisée avec le stock réel
restant (`getIngredientStock`), donc un ingrédient encore en quantité suffisante reste coché au lieu
d'exiger un nouveau cochage manuel avant le prochain lancer. Un ingrédient purement narratif (jamais
stocké en vrai) garde l'ancien comportement (décoché, à reconfirmer à la main).

**Champ "composant" (`system.components`)** : audité, pas touché — s'est avéré être une pure
duplication de `costText` pour les rituels (recopié une seule fois au build par `_build-sorts.js`,
jamais lu par aucune logique de jeu, juste réaffiché dans `postToChat()`). Signalé à l'utilisateur
pour décision (garder/retirer) plutôt que supprimé unilatéralement — c'est un changement de schéma
qui toucherait des documents déjà existants.

**Fichiers** : `module/documents/item.mjs`, `packs/_build-sorts.js`, `packs/sorts.db`,
`packs/_fix-sorts-ritual-ingredients.js` (nouveau), `packs/_fix-sorts-ritual-ingredients-live.js`
(nouveau), `module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 (suite) — Icône de potion cassée, 404 sur potion.svg (v0.6.38 → v0.6.39)

Retour utilisateur (point 2 de `TODO_BUG_ANTIQUE.md`) : erreur en console à l'édition d'un
ingrédient, `Failed to load resource: 404` sur `potion.svg`.

**Cause** : `packs/_build-alchimie.js` (source de `packs/alchimie.db`) utilise `POTION_ICONS[nom]`
si une icône explicite existe pour la potion, sinon un défaut par type — `icons/svg/skull.svg`
pour les potions "Négative" (existe bien dans les assets Foundry), mais `icons/svg/potion.svg`
pour les "Bénéfique" — **ce fichier n'existe pas** dans la bibliothèque d'icônes bundlée par
Foundry (vérifié directement dans `resources/app/public/icons/svg/` de l'installation locale).
Toute potion bénéfique sans entrée explicite dans `POTION_ICONS` héritait donc d'un chemin cassé.
Le `.db` source actuel et le compendium Alchimie actuellement déployé n'en contiennent plus aucune
occurrence (toutes les potions bénéfiques ont désormais une entrée explicite) — le bug ne peut donc
venir que d'un objet créé avant que `POTION_ICONS` ne devienne exhaustif : une copie déjà présente
sur un acteur (ne se resynchronise jamais automatiquement depuis le compendium, piège déjà
documenté) ou un ancien import resté dans le monde. Pas de correspondance trouvée en cherchant
"potion.svg"/"Ephise" dans les données brutes des mondes Foundry locaux (LevelDB probablement
compressé côté valeurs, recherche texte brute peu fiable) — pas d'accès direct au monde réel de
l'utilisateur depuis cet environnement.

**Correctif** : fallback changé vers une vraie icône existante
(`icons/consumables/potions/potion-bottle-corked-labeled-green.webp`) dans
`packs/_build-alchimie.js`. Nouvelle macro `packs/_fix-potion-svg-icon.js` (API Document Foundry
uniquement, jamais d'édition LevelDB directe) qui recherche et corrige tout objet portant encore
`icons/svg/potion.svg` à trois endroits : le compendium Alchimie, les objets du monde, et les
objets possédés par chaque acteur — **à exécuter par l'utilisateur** pour corriger l'objet déjà
existant qui a déclenché ce signalement.

**Fichiers** : `packs/_build-alchimie.js`, `packs/_fix-potion-svg-icon.js` (nouveau),
`module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Session du 31 août 2026 — CA (et Sauvegardes) qui augmentait à chaque update de fiche (v0.6.37 → v0.6.38)

Retour utilisateur (fiche PNJ/Personnage "Ephise") : la CA augmente à chaque mise à jour d'un champ
quelconque de la fiche. Consigné dans `TODO_BUG_ANTIQUE.md` (point 1) avant investigation.

**Cause** : `system.ca.temp` (et `system.saves.<save>.temp`) sont deux champs persistés qui servent
de cible à la fois à un input manuel sur la fiche (`<input name="system.ca.temp">`) et à des
ActiveEffect en mode ADD (buffs comme "Peau d'écorce", `AntiqueActor#applyCaBonus()`, avantages de
Sauvegarde). Foundry applique les ActiveEffect **avant** `prepareDerivedData()` — donc au moment où
la fiche se rend, `system.ca.temp` vaut déjà `valeur_stockée + bonus_actif`. Le template liait la
`value` de l'input à cette valeur dérivée. Comme la fiche se soumet à chaque changement de champ
(`submitOnChange: true`), modifier n'importe quoi ailleurs sur la fiche réécrivait cette valeur
déjà gonflée comme nouvelle valeur brute persistée — qui se faisait ensuite regonfler par le même
ActiveEffect au rendu suivant, d'où une croissance à chaque update tant qu'un buff restait actif.

**Correctif** : les inputs "Temp" (CA + les 3 Sauvegardes, même schéma) lisent maintenant la valeur
brute persistée (`actor._source.system.ca.temp` / `actor._source.system.saves.<key>.temp`, jamais
touchée par les ActiveEffect) plutôt que la valeur dérivée — `context.caTempSource` et
`save.tempSource` dans `actor-sheet.mjs::_prepareContext()`. Les totaux et l'infobulle continuent
d'utiliser la valeur dérivée (`system.ca.temp`/`save.temp`) puisqu'ils doivent refléter le bonus
actif en cours. Pas de suite automatisée dans ce dépôt (pas de `package.json`/tests) — vérifié par
relecture statique du flux dérivation → rendu → soumission ; confirmation en jeu à faire par
l'utilisateur (poser un buff de CA, modifier un autre champ, vérifier que la CA ne bouge plus).

**Fichiers** : `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`,
`module/helpers/release-notes.mjs`, `system.json`, `TODO_BUG_ANTIQUE.md`.

---

## Navigateur de Compendium — deux retouches demandées le 22 août 2026 — CLOS (23 août 2026)

Les deux points ci-dessous sont désormais faits et confirmés par l'utilisateur (voir détail de
chaque correctif, et les sessions du 23 août plus bas pour le vrai bug de mise en page découvert
en cours de route). Plus aucun point ouvert sur ce TODO.

1. **FAIT (v0.6.30 → v0.6.31)** — ~~Colonne "Type" dans l'onglet Sorts~~, étendue à Traits/Bestiaire/Historique.
   Confirmé fonctionnel sur Sorts, puis généralisé sur demande à Traits et Bestiaire (retour
   utilisateur "ça marche bien, mais ça doit être pareil sur les trait et le bestiaire"), puis à
   Historique ("et historique"). `tab.showTypeColumn` (`tab.filters.length > 0 && !isEquipmentTab`)
   et `tab.itemColumns` (`tab.filters.length ? 4 : 3`) calculés génériquement dans
   `compendium-browser.mjs` — remplace les 2 cas particuliers `{{#ifEquals tab.key "sorts"}}` de
   la v0.6.30 par une règle unique qui s'applique à tout onglet filtré. Historique n'avait encore
   aucun filtre : ajout d'un nouveau mode `filterByFolder: true` (à côté de `filterByPack`
   existant) — son unique pack (`antique.historique`) est en réalité déjà scindé par l'auteur des
   données en 2 vrais dossiers Foundry ("Origine", "Bonus/Malus aléatoire", vérifié dans
   `packs/historique.db` : 2 documents `Folder` avec `type: "RollTable"`, les 5 RollTables
   pointant vers l'un des deux via leur champ `folder`) — même principe que le dossier
   Armure/Bouclier déjà exploité pour `classifyEquipmentItem()`. `classify = doc => doc.folder`
   pour ce mode ; filtres dérivés de `pack.folders` (`{key: folder.id, label: folder.name}`).

**Retour utilisateur : ne fonctionne pas sur Historique.** Cause trouvée en inspectant directement
le LevelDB déployé (via `classic-level`, en lecture — l'ouverture a échoué tant que Foundry a le
pack ouvert, ce qui a confirmé sans risque qu'aucune lecture concurrente n'était possible ; le vrai
diagnostic est donc venu d'une lecture des octets bruts du fichier `.ldb` pendant que Foundry
tournait, en cherchant les préfixes de clé `!folders!` vs `!tables!` — cf. `packs/_build-leveldb.js`
pour la convention de préfixe) : le compendium **vécu** en jeu a été construit avant que la source
`packs/historique.db` ne soit restructurée en 2 vrais dossiers Foundry. "Origine" et "Bonus/Malus
aléatoire" existent donc dans le jeu comme deux **RollTable orphelines vides** (préfixe `!tables!`,
pas `!folders!`) au lieu de vrais dossiers — encore un exemple du piège déjà documenté plusieurs fois
dans ce journal (source `.db` ≠ compendium LevelDB déjà déployé). `pack.folders` est donc vide en
jeu, d'où aucun filtre/Type pour cet onglet malgré un code correct.

**Correctif** : nouvelle macro `packs/_fix-historique-folders.js` (jamais d'édition directe du
LevelDB, cf. incident de corruption déjà documenté) — supprime les 2 RollTable orphelines (avec
garde-fou : ne supprime que si elles sont vides, avertit sinon), crée 2 vrais documents `Folder`
(`type: "RollTable"`) via `Folder.create([...], {pack: pack.collection})`, puis relie chacune des 5
vraies tables à son dossier par correspondance de nom. **Confirmé par l'utilisateur** après exécution
de la macro : filtres + colonne Type fonctionnels sur Historique.

**Deuxième retour utilisateur : décalage du tracé des lignes de colonnes.** Chaque section
(Équipement/Traits/Bestiaire/Historique) est son propre `<table>` HTML indépendant (un par pack ou
regroupement de pack) ; sans layout fixe, chaque table calcule la largeur de ses colonnes à partir
de son PROPRE contenu — les bordures verticales ne s'alignaient donc pas d'une section à l'autre
(zigzag), d'autant plus visible maintenant que la colonne Type ajoute une largeur de texte variable
(labels courts comme "PNJ" à côté de longs comme "Bonus/Malus aléatoire"). Corrigé avec un
`<colgroup>` à largeurs fixes (`.col-img` 30px / `.col-extra` 130px / `.col-controls` 56px, colonne
nom sans largeur déclarée = absorbe le reste) + `table-layout: fixed` sur une nouvelle classe
`.browser-table`, ajoutée aux 4 variantes de tableau du template (scoping volontaire : `.apoth-table`
est une classe partagée avec l'onglet Ingrédients de la fiche perso et la Boutique d'Alchimie, donc
tout changement structurel passe par `.browser-table` pour ne toucher qu'ici). `white-space: normal`
réintroduit spécifiquement sur `.browser-table .price-cell`/`.type-cell` (le `nowrap` partagé
ailleurs aurait fait déborder un long libellé hors de sa colonne désormais fixe).

**Fichiers** : `templates/apps/compendium-browser.hbs`, `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`.

**Retour utilisateur : toujours pas aligné, et pareil sur Traits/Sorts/Bestiaire/Historique ET sur
l'onglet Ingrédients de la fiche perso** (jamais touché cette session) — signe que le vrai bug n'a
rien à voir avec les colonnes ajoutées aujourd'hui, il est déjà présent partout où `.apoth-table`/
`.item-controls` est utilisé. Diagnostic par capture d'écran demandée puis analysée (recadrée et
zoomée 3× via PowerShell/`System.Drawing`, faute d'accès navigateur direct) : la bande de fond teal
de l'en-tête de tableau s'arrête net après la colonne "QUANTITÉ" — la dernière colonne (icônes
crayon/poubelle) n'a aucun fond d'en-tête au-dessus d'elle et semble "détachée" du reste du tableau,
ses icônes débordant visuellement à droite du tableau réel.

**Cause** : `.item-controls` (`display:flex; gap:4px`) posé directement sur un `<td>` sans texte —
dans l'algorithme de mise en page automatique des tableaux, ce genre de cellule peut se voir
calculer une largeur de colonne quasi nulle (le contenu flex n'est pas pris en compte comme
attendu), et comme les cellules de tableau ne découpent pas leur contenu qui déborde par défaut, les
icônes débordent visuellement hors du tableau réel au lieu d'agrandir leur colonne — d'où l'en-tête
(dimensionné sur cette même largeur quasi nulle) qui semble "s'arrêter avant" la colonne réelle.
Bug global, présent sur TOUTE table utilisant `.item-controls` (Inventaire, Ingrédients, Traits,
fiche PNJ, Boutique d'Alchimie, Navigateur), pas une régression du travail du jour — juste jamais
remarqué avant que l'attention ne se porte sur l'alignement des tableaux du Navigateur.

**Premier correctif (v0.6.34, `min-width: 50px` sur `td.item-controls`) : sans effet**, confirmé par
une nouvelle capture identique au pixel près. Diagnostic poussé plus loin avec des contours de debug
temporaires très visibles (`outline` rouge sur `tr.item`, vert sur `.item-controls`, bleu sur
`.quantity-cell`, magenta sur les `<th>`) — la capture suivante a montré sans ambiguïté que le
contour rouge de la ligne s'arrêtait AVANT le contour vert : `.item-controls` n'est structurellement
plus considéré comme faisant partie de la grille du tableau.

**Vraie cause** : `display: flex` posé directement sur un vrai `<td>` lui fait perdre son type de
boîte `table-cell` — Chromium l'exclut alors du calcul des colonnes du tableau, et il se retrouve à
flotter tout seul au lieu d'occuper sa colonne sous l'en-tête. Ce n'était donc pas un problème de
largeur (d'où l'échec du premier correctif) mais de *display*. Restauré `display: table-cell` sur
`.antique td.item-controls` + espacement des icônes via `margin-left` plutôt que le `gap` de flexbox.

**Deuxième bug, découvert après déploiement** : le premier essai de ce correctif (sans le préfixe
`.antique`) n'a eu STRICTEMENT AUCUN EFFET visible non plus (capture identique une fois de plus) —
cause : `td.item-controls` (specificité 0,1,1) est moins spécifique que `.antique .item-controls`
(0,2,0) qui pose le `display:flex` d'origine, donc perdait systématiquement, quel que soit l'ordre
des règles dans le fichier. Corrigé en préfixant `.antique` sur les 3 nouvelles règles, ce qui les
rend strictement plus spécifiques (0,2,1) que la règle flex d'origine. **Confirmé par capture
utilisateur** (zoomée) : lignes de séparation continues, icônes crayon/poubelle et prendre/payer bien
à l'intérieur du tableau sur les deux fenêtres testées (Ingrédients de la fiche perso + Navigateur).

**Retour utilisateur : toujours un décalage visible.** Nouveaux contours de debug (un par type de
cellule cette fois : nom/prix/quantité/actions/type, + la ligne elle-même) → capture zoomée : la
ligne de séparation de ligne (`tr`) et les bordures de Prix/Quantité/Actions fusionnent bien en une
seule ligne continue (comportement correct), mais la colonne **Nom** (`.equip-name-cell`) en a une
**deuxième**, légèrement décalée en hauteur — exactement le même bug que celui déjà corrigé sur
`.item-controls`, appliqué cette fois à `.equip-name-cell` (elle aussi `display:flex` sur un vrai
`<td>`, jamais repérée la première fois puisque le symptôme se manifeste différemment selon la
position de la colonne dans la ligne). Corrigé de la même manière : `display:flex` retiré, icône de
bascule (`.equip-toggle`) et nom passés en `inline-block`/`vertical-align:middle`, `.equip-name {
flex:1 }` supprimé (mort une fois le parent non-flex). **Confirmé par l'utilisateur.**

**Fichiers** : `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`.

2. **FAIT (v0.6.34 → v0.6.37)** — ~~Alignement info/boutons sur une seule ligne, en colonnes distinctes~~.
   Le rendu réel signalé par l'utilisateur (capture d'écran) s'est avéré être un vrai bug de mise en
   page plutôt qu'un manque de colonnes : `display:flex` posé directement sur `.item-controls` puis
   `.equip-name-cell` (deux vrais `<td>`) leur faisait perdre leur type de boîte `table-cell`,
   d'où des cellules qui flottaient hors de la grille du tableau ou une deuxième ligne de séparation
   décalée. Diagnostiqué à coups de captures recadrées/zoomées (PowerShell + `System.Drawing`) puis
   de contours de debug colorés par classe de cellule — voir la session du 23 août plus haut/plus bas
   pour le détail complet. Suite à ce correctif, ajout d'une marge à droite des icônes d'action
   (`padding-right` sur `.item-controls`, colonne `.col-controls` élargie de 56 à 68px) sur retour
   utilisateur explicite.

**Fichiers de cette dernière retouche** : `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`.

---

## Session du 22 août 2026 (suite 2) — Rafraîchissement isolé de la barre de favoris (v0.6.28 → v0.6.29)

Dernier point ouvert de `TODO_FICHE_PERSONNAGE.md` (point 2, priorité basse/confort). Ajouter ou
retirer un favori de compétence déclenchait un `render({force:true})` complet de la fiche à chaque
fois (3 points d'entrée : bouton "x" sur un chip, clic droit "Ajouter"/"Retirer favoris" sur une
ligne de compétence).

Bloc de la barre de favoris extrait tel quel de `character-sheet.hbs` vers un nouveau partial
`templates/actor/parts/favorites-bar.hbs` (même idiome que `actor-ref-section.hbs` déjà existant),
préchargé dans `preloadHandlebarsTemplates()` (`antique.mjs`) — nécessaire pour que
`foundry.applications.handlebars.renderTemplate()` puisse le rendre isolément à la demande. Le
`{{#if favoriteSkills.length}}` d'origine reste dans le partial (rend `""` à 0 favori) ; le template
principal l'enveloppe désormais dans un `<div class="favorites-bar-container">` toujours présent,
qui sert d'ancre stable pour `_refreshFavoritesBar()` même quand il n'y a rien à afficher dedans.

`actor-sheet.mjs` : nouveau `_toggleFavorite(skillKey, add)`, appelé par les 3 handlers à la place de
`actor.update(...).then(() => this.render({force:true}))`. Utilise `actor.update(data, {render:false})`
— confirmé en lisant le vrai code client Foundry (`client/documents/abstract/client-document.mjs`,
`_onUpdate` : `options.render !== false` conditionne le re-render automatique déclenché par la mise à
jour du document) — pour empêcher Foundry de re-render la fiche tout seul, puis fait le travail à la
main : `_refreshFavoritesBar()` régénère `.favorites-bar-container` via le partial + réattache les
listeners des chips (sinon un chip fraîchement ajouté serait mort au clic), et
`_setSkillRowFavoriteState()` bascule directement en DOM la classe `favorite` + l'icône étoile sur la
`<li class="skill-row">` correspondante (repérée via `.skill-roll[data-skill]`), pour rester cohérent
avec la barre sans dupliquer toute la logique de rendu des compétences.

**Relecture adversariale** (agent fork) : aucun bug bloquant, un point plausible relevé — deux clics rapprochés sur des favoris différents pouvaient tous deux lire `favoriteSkills` avant que la première écriture ne soit résolue, le second `update()` écrasant alors silencieusement le premier (même famille que le verrou `withRowLock` déjà utilisé dans `browser-shared.mjs`). Corrigé : `_toggleFavorite()` chaîne désormais ses appels sur une promesse d'instance (`_favoriteToggleChain`) plutôt que de les laisser s'exécuter en parallèle, `#applyFavoriteToggle()` (privé) porte la logique réelle.

**Fichiers** : `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `templates/actor/parts/favorites-bar.hbs` (nouveau), `antique.mjs`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`, `TODO_FICHE_PERSONNAGE.md`.

**Confirmé par l'utilisateur** en test manuel dans Foundry. `TODO_FICHE_PERSONNAGE.md` n'a donc plus aucun point ouvert — chantier refonte CSS/UX de la fiche personnage clos.

---

## Session du 22 août 2026 (suite) — Sélecteur de munitions (v0.6.27 → v0.6.28)

Reprise du chantier `TODO_FICHE_PERSONNAGE.md` (point 1, seul point encore réellement ouvert avec
le point 2 après audit — voir plus bas). Une arme consommable (`system.consumable`) sans munition
liée (`system.linkedAmmoId` vide) affichait juste un tiret dans `.munitions-cell`, sans action
possible — il fallait passer par la fiche de l'arme elle-même pour lier une munition.

`actor-sheet.mjs::_prepareContext()` : nouveau `context.ammoCandidates`, liste de tout l'équipement
`consumable` de l'acteur (triée par nom) — même liste pour toutes les armes, pas de calcul par ligne
puisque le pool de candidats ne dépend pas de l'arme. Template : `<select class="munitions-select">`
ajouté dans la branche `{{else}}` (pas de munition liée) de `.munitions-cell`, aux côtés du badge
existant (inchangé) pour le cas où une munition est déjà liée. `_onRender()` : listener `change` →
`weapon.update({"system.linkedAmmoId": ...})` puis re-render forcé (convention du bug récurrent de
re-render déjà documenté plusieurs fois dans ce journal).

Scope volontairement limité à la fiche personnage (fiche PNJ non touchée), conforme au plan d'origine.

**Fichiers** : `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`, `TODO_FICHE_PERSONNAGE.md`.

**Confirmé par l'utilisateur** en test manuel dans Foundry.

---

## Session du 22 août 2026 — Filtres pour Traits, Sorts, Bestiaire (v0.6.25 → v0.6.26)

Reprise du TODO laissé en suspens après la v0.6.24 (voir capture PF2e Bestiaires/Sorts, filtres non transposables tels quels faute de Taille/Rareté/Traditions/Rangs dans nos données — décision déjà actée : adapter le PRINCIPE avec des catégories réelles).

`compendium-browser.mjs` : `TABS` généralisé — chaque entrée déclare maintenant soit `filters` (liste statique) + `classify(doc, packId, ctx)`, soit `filterByPack: true` (liste dérivée à l'affichage des packs de l'onglet, `key = packId`, `label = pack.metadata.label`). Le cas spécial `EQUIPMENT_FILTERS`/`classifyEquipmentItem()` d'avant devient juste la première entrée de ce schéma générique (`classifyEquipmentItem()` elle-même inchangée). `_prepareContext` calcule `tab.filters` pour chaque onglet et passe `filterKind` sur les items ET les acteurs (avant, seul `kind: "item"` de l'onglet Équipement portait un `filterKind`).

Filtres obtenus :
- **Traits** (avantages+désavantages+bénédictions+avantages-divins) : par pack d'origine.
- **Bestiaire** (pnj+dieux+creatures) : par pack d'origine, même logique.
- **Sorts** : par `system.ritual` (Sort Instantané / Rituel).
- **Historique** : toujours pas de filtre (un seul pack, pas de sous-catégorie).

Template : le `{{#ifEquals tab.key "equipement"}}` codé en dur devient `{{#if tab.filters.length}}` — Traits/Sorts/Bestiaire retombent maintenant dans la disposition à deux colonnes (aside filtres + résultats) déjà utilisée par Équipement, avec la colonne Prix/bouton Payer toujours conditionnée à `tab.key == "equipement"` (seul onglet dont les items ont un prix). La branche `browser-results-full` (sans filtres) reste en place, désormais seulement empruntée par Historique. `_onRender` : la logique de filtrage (écouteurs sur les cases à cocher) est repassée d'un scope unique "onglet Équipement" à un scope par panneau d'onglet (`querySelectorAll(".tab[data-tab]")`), pour que chaque onglet filtré fonctionne indépendamment.

**Fichiers** : `module/apps/compendium-browser.mjs`, `templates/apps/compendium-browser.hbs`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`.

**Confirmé par l'utilisateur** en test manuel dans Foundry (pas d'accès navigateur depuis cet environnement pour cette session, ni extension Chrome installable côté utilisateur) : filtres Traits/Sorts/Bestiaire fonctionnels, Équipement non régressé.

**Deux 404 d'image remontées pendant ce test** (préexistantes, sans rapport avec les filtres — juste rendues visibles par le fait de parcourir l'onglet Bestiaire/Divinités pour la première fois avec ce navigateur) :
- `centaure` (creatures.db) : simple faute de frappe de nom de fichier sur le disque — `centaur_epée.jpg` (sans accent sur le premier "e") au lieu de `centaur_épée.jpg` référencé par la donnée. Corrigé en renommant le fichier (source + déployé), rien à toucher côté données.
- `Circé` (dieux.db, `_id: aDty000000000017`) : aucune image n'a jamais existé pour ce document (rien dans `packs/token/divinity/`, pas une faute de frappe). Sur choix de l'utilisateur (icône par défaut en attendant une vraie image) : `img` mis à `icons/svg/mystery-man.svg` dans la source `packs/dieux.db`, + macro `packs/_fix-circe-img.js` fournie pour appliquer le même changement sur le document déjà vécu dans le compendium LevelDB déployé (jamais d'édition directe d'un fichier LevelDB, cf. incident de corruption déjà documenté).

**Confirmé par l'utilisateur** après exécution de la macro : le Centaure à l'épée et Circé s'affichent tous les deux correctement. Session close.

---

## Session du 16 août 2026 — Incanter décompte enfin les vrais ingrédients (v0.6.24 → v0.6.25)

### Contexte
Retour utilisateur : au clic sur « Incanter », les ingrédients doivent se décrémenter dans l'onglet « Ingrédients » de la fiche de personnage. Audit des trois zones citées (onglet Description du sort, onglet Ingrédients du sort, onglet Ingrédients de la fiche perso) : le champ déclaratif `system.ingredients` du sort ({id, name, quantity, possede}, v0.6.3) n'a jamais été relié à l'inventaire réel. `castSpell()` ne faisait que remettre `possede` à `false` sur toute la liste au moment de « Dépenser les ingrédients » — aucune quantité réelle d'aucun objet n'était jamais touchée. Seul le mécanisme séparé `system.costText` (rituels, onglet Description) décrémentait un vrai objet d'équipement, par correspondance de nom.

### Correctif
Nouveau helper partagé `findIngredientItems(actor, name)` / `getIngredientStock(actor, name)` dans `module/helpers/actor-utils.mjs` : cherche, parmi les objets `equipment` de l'acteur tagués `system.apothCategory` (le pool de l'onglet Ingrédients de la fiche perso), une correspondance de nom — exacte d'abord, puis sous-chaîne dans un sens ou l'autre (même convention que le mécanisme `costText` existant).

`castSpell()` (étape 4.5) : quand le joueur choisit « Dépenser les ingrédients », chaque entrée de `system.ingredients` est maintenant réellement décomptée sur le(s) objet(s) réel(s) correspondant(s) (répartition sur plusieurs objets si nécessaire, du plus stocké au moins stocké), avec avertissement chat/notification si le stock réel est insuffisant. Un ingrédient déclaratif sans aucune correspondance réelle en inventaire (jamais stocké) est simplement ignoré pour le décompte — pas de blocage, comportement additif qui ne casse pas les sorts déjà remplis avec des ingrédients purement narratifs. Le reset `possede: false` de toute la liste reste inchangé (comportement pré-existant conservé).

Onglet Ingrédients du sort (`spell-sheet.hbs`) : chaque ligne affiche désormais, quand le sort appartient à un acteur, le stock réel actuel de l'ingrédient correspondant (`{count} en stock`), en rouge si insuffisant face à la quantité requise — rend visible le lien entre les trois onglets sans changer le workflow manuel de la case « Possédé ».

**Fichiers** : `module/helpers/actor-utils.mjs`, `module/documents/item.mjs`, `module/sheets/item-sheet.mjs`, `templates/item/spell-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`, `CHANGELOG.md`.

---

## Session du 9 août 2026 (suite 1.5) — Régression version-check.mjs corrigée

En remplissant `manifest`/`download` dans `system.json` (pour le workflow de release GitHub), le garde-fou `if (!game.system.manifest) return;` de `checkSystemVersionUpdate()` (censé ne JAMAIS se déclencher pendant le déploiement de dev, voir commentaire du fichier) s'est retrouvé désactivé, déclenchant `overwriteSystemCompendiums()` à chaque rechargement. Ce dernier avait en plus un vrai bug latent : `fetch(\`systems/antique/${packDef.path}\`)` utilisait `packDef.path`, un champ que Foundry normalise en interne (strip du `.db`, et selon la version résout déjà en chemin absolu depuis Data) — d'où des 404 en cascade ("systems/antique/systems/antique/packs/...").

Corrigé des deux côtés : `system.json` repasse `manifest`/`download` à `""` dans le dépôt (seul le zip construit par la CI les renseigne désormais, cf. `.github/workflows/release.yml`) ; `version-check.mjs` reconstruit le chemin du fichier depuis `packDef.name` + `.db` (notre convention fixe) plutôt que depuis `packDef.path`.

**Fichiers** : `system.json`, `.github/workflows/release.yml`, `module/helpers/version-check.mjs`.

---

## Session du 9 août 2026 (suite 9, ultracode) — Navigateur à onglets par catégorie + filtres (v0.6.23 → v0.6.24)

Utilisateur a fourni une vraie capture d'écran du Compendium Browser de Pathfinder 2e. Lecture précise : les onglets du haut ("Capacités", "Bestiaires", "Équipement", "Sorts"...) regroupent PLUSIEURS compendiums source par catégorie de contenu — pas un onglet par compendium — et le filtrage par sous-type (Arme/Armure/Bouclier/Consommable/...) se fait via des cases à cocher dans un panneau latéral gauche, à côté de la recherche/du tri.

Confirmé avec l'utilisateur (question à choix) : 5 onglets — **Équipement** (armes+équipement+alchimie, filtrable), **Traits** (avantages+désavantages+bénédictions+avantages divins), **Sorts**, **Bestiaire** (pnj+dieux+creatures), **Historique**.

`compendium-browser.mjs` restructuré : `TABS` (regroupement pack→onglet) remplace `BROWSED_PACKS` (pack→section plate). `classifyEquipmentItem()` calcule le type de filtre (arme/armure/bouclier/munition/consommable) uniquement pour l'onglet Équipement, à partir du pack d'origine + (pour `armes`) du nom du dossier Foundry de l'objet (`pack.folders`, une vraie `Collection` Foundry — vérifié qu'elle s'itère par valeurs via `Symbol.iterator` dans `common/utils/collection.mjs`, pas par paires clé/valeur). "Munition" n'a aucun objet correspondant actuellement (pas de flèches/carreaux dans les données) — le filtre existe quand même, prêt pour plus tard, sans rien inventer.

Changement de rendu de fond : les 5 onglets sont TOUS rendus dans le DOM en une fois (`_prepareContext` construit toutes leurs données à chaque fois), et changer d'onglet ne fait qu'un `classList.toggle` côté client (`_activateTab`, même idiome que les fiches acteur/objet du système) — pas de rechargement des compendiums à chaque clic d'onglet.

CSS : nouvelle classe `.compendium-browser-tabbed` (uniquement sur le Navigateur général, pas la Boutique d'Alchimie qui garde son scroll racine simple) transforme la fenêtre en colonne flex non-scrollable ; le scroll (et donc les en-têtes collants) se fait maintenant dans `.browser-results`/`.browser-results-full`, propre à l'onglet actif.

**Fichiers** : `module/apps/compendium-browser.mjs`, `templates/apps/compendium-browser.hbs` (réécrits), `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 8, ultracode) — Scission Boutique d'Alchimie / vrai Navigateur multi-compendiums (v0.6.22 → v0.6.23)

Retour utilisateur : la fusion armes+équipement+alchimie dans une seule fenêtre "Navigateur" n'était pas ce qui était demandé. Scission en deux applis distinctes, partageant leur logique commune via un nouveau module `module/apps/browser-shared.mjs` (`resolveShopTargetActors`, `grantItemToActor`, `attachBrowserRowInteractions`, `withRowLock`) :

1. **`module/apps/alchemy-shop.mjs`** (+ `templates/apps/alchemy-shop.hbs`) — "Boutique d'Alchimie", clic droit sur le compendium Alchimie uniquement (`getCompendiumContextOptions`), sections par catégorie d'ingrédient comme avant.
2. **`module/apps/compendium-browser.mjs`** (+ `.hbs`, réécrit) — "Navigateur de Compendium", ouvert via un **bouton ajouté sous la liste des compendiums** dans la barre latérale (pas un clic droit, pas un contrôle de scène — retirés). Couvre `BROWSED_PACKS` = les 12 compendiums du système, "absolument tout, comme Pathfinder" (choix explicite de l'utilisateur face à 3 options de portée proposées).

**Bouton du navigateur** : `Hooks.on("renderCompendiumDirectory", (app, html) => {...})` ajoute un `<button>` dans le `<footer class="directory-footer">` — un vrai PART nommé de `CompendiumDirectory` (`templates/sidebar/directory/footer.hbs`, vérifié dans le code source Foundry), pas une supposition. Garde anti-doublon (`footer.querySelector(".antique-compendium-browser-btn")`) puisque ce hook se redéclenche à chaque rendu, contrairement aux hooks "une seule fois" des sessions précédentes.

**Trois types de documents, trois actions** (`pack.documentName`, propriété native vérifiée dans `compendium-collection.mjs`) :
- **Item** avec `system.price` : Prendre (gratuit) + Payer (déduit l'or) — comme avant.
- **Item** sans prix (avantages, désavantages, bénédictions, avantages divins, sorts — aucun de ces modèles de données n'a de champ `price`, confirmé) : Prendre seul, jamais empilé sur un exemplaire existant (`STACKABLE_TYPES` dans `browser-shared.mjs` limité à `weapon`/`equipment` — une malédiction ou un sort n'a pas de quantité).
- **Actor** (pnj, dieux, creatures) : bouton Importer → `game.actors.importFromCompendium(pack, id)`, l'API native Foundry pour copier un acteur de compendium dans le monde (vérifiée dans `world-collection.mjs`).
- **RollTable** (historique, 5 tables) : bouton Tirer → `table.draw()` directement sur le document de compendium — vérifié dans `roll-table.mjs` que `draw()` saute volontairement l'écriture "résultat déjà tiré" quand `this.pack` est défini, donc pas besoin d'importer la table dans le monde avant de tirer dessus.

Glisser-déposer généralisé : chaque ligne porte maintenant `data-drag-type` (Item/Actor/RollTable selon la section) au lieu d'être toujours "Item".

**Fichiers** : `module/apps/browser-shared.mjs` (nouveau), `module/apps/alchemy-shop.mjs` (nouveau), `templates/apps/alchemy-shop.hbs` (nouveau), `module/apps/compendium-browser.mjs` (réécrit), `templates/apps/compendium-browser.hbs` (réécrit), `antique.mjs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 7) — Armures d'equipement.db ajoutées au Navigateur (v0.6.21 → v0.6.22)

`equipement.db` s'est avéré être un mélange : 20 objets qui dupliquent verbatim des potions déjà présentes dans Alchimie (même nom, prix identique en description — probablement un reliquat d'avant que le compendium Alchimie ne soit séparé), 21 autres consommables/objets d'aventure sans prix nulle part, et 9 vraies armures/boucliers grecs nommés (Linothorax, Thorax de cuir, Cuirasse de bronze, Armure d'hoplite complète, Casque corinthien, Casque chalcidien, Cnémides de bronze, Aspis, Peltè) also sans prix nulle part (ni description, ni Excel source).

Consigne utilisateur : laisser les armures à 0 en attendant les vrais prix. Nouveau script `packs/_fix-equipement-armor-price.js` (one-off, pas un vrai build script puisque `equipement.db` n'en a pas) : met `system.price = "0 po"` uniquement sur ces 9 armures nommées explicitement, sans toucher au reste du fichier — les 20 doublons et les 21 autres objets restent sans prix, donc invisibles dans le Navigateur (filtre "seulement ce qui a un prix"), ce qui évite à la fois la duplication avec Alchimie et l'invention de prix pour ce qui n'en a pas. `antique.equipement` ajouté à `BROWSED_PACKS` dans `compendium-browser.mjs`.

**Fichiers** : `packs/_fix-equipement-armor-price.js` (nouveau), `packs/equipement.db`, `module/apps/compendium-browser.mjs`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 6, ultracode) — Navigateur de Compendium multi-packs + drag&drop (v0.6.20 → v0.6.21)

Retour utilisateur : "le bouton de navigation dans les compendiums n'a pas pour vocation de faire une boutique mais plus un navigateur... avec option d'acheter n'importe quel objet depuis les listes d'équipement, d'ingrédient et tout ce qui a un prix." Renommage + refonte complète : `module/apps/ingredient-shop.mjs` (+ `.hbs`) → `module/apps/compendium-browser.mjs` (+ `.hbs`), classe `AntiqueIngredientShop` → `AntiqueCompendiumBrowser`. `BROWSED_PACKS` (tableau `{id, label}`) remplace le `SHOP_PACK_ID` unique — actuellement `["antique.armes", "antique.alchimie"]`, chaque section du navigateur correspond à un pack plutôt qu'à une `apothCategory`. Ne montre que les documents avec un `system.price` non vide (filtre "tout ce qui a un prix"). `grantItemToActor()` généralisé pour matcher par `type + name + apothCategory` (ce dernier `undefined` des deux côtés pour les armes/équipement générique, donc toujours égal).

**Bug de données découvert en creusant "pourquoi armes.db n'a pas de prix"** : `_build-armes.js` calcule bien un prix par palier de qualité (`tier.prix`, `armor.prix`, `shield.prix`, directement recopiés depuis la feuille Excel "arme armure") et l'écrit dans la description HTML ("Prix : X po"), mais ne l'a jamais copié dans `system.price` (`AntiqueWeapon`/`AntiqueEquipment` ont pourtant bien ce champ dans leur schéma). Exactement le même bug déjà corrigé pour l'alchimie plus tôt dans la session. Corrigé aux 3 endroits (armes, armures, boucliers), régénéré `armes.db` (109/109 items avec prix désormais).

**equipement.db laissé de côté** : contient un mélange (a) de potions dupliquées de celles déjà dans Alchimie (avec prix en description, probablement un reliquat d'avant la scission du compendium Alchimie) et (b) de vraies armures grecques nommées (Linothorax, Cuirasse de bronze...) sans aucun prix nulle part, ni dans la description ni dans l'Excel source. Décision reportée à l'utilisateur plutôt que d'inventer des prix.

**Nouvelles fonctionnalités demandées dans la foulée** :
- Glisser-déposer : chaque `.shop-row` devient `draggable="true"`, `dragstart` pose le payload standard Foundry `{type:"Item", uuid}` en JSON dans `text/plain` (vérifié contre `TextEditor.getDragEventData()` dans le vrai code source Foundry — c'est exactement ce format que tout `ActorSheetV2` lit nativement pour accepter un drop, donc déposer sur une fiche perso fonctionne sans code supplémentaire de notre côté). `img` de la ligne mis à `draggable="false"` pour éviter que le navigateur ne fasse de l'image elle-même une source de drag concurrente.
- Clic sur l'image → `item.postToChat()` (méthode déjà existante sur `AntiqueItem`, réutilisée telle quelle — même convention que `.equip-img.item-chat` dans l'Inventaire de la fiche perso). Vérifié : Foundry n'a pas de cible de drop native sur l'onglet Chat de la sidebar (`chat.mjs` n'a pas de `_onDrop`) — le clic sur l'image est donc la voie retenue pour "avoir les infos dans le chat", pas un drop direct sur le chat.
- En-têtes de section collantes (`position: sticky; top:0`) via une classe dédiée `apoth-section-sticky` posée uniquement dans le template du navigateur, sans toucher au style partagé `.apoth-section h2` de l'onglet Ingrédients de la fiche perso.

**Fichiers** : `module/apps/compendium-browser.mjs` (nouveau, remplace `ingredient-shop.mjs`), `templates/apps/compendium-browser.hbs` (nouveau, remplace `ingredient-shop.hbs`), `packs/_build-armes.js`, `packs/armes.db`, `antique.mjs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 5) — Vrai bug de timing des hooks (v0.6.19 → v0.6.20)

Après la "correction" précédente (bon nom de hook `getCompendiumContextOptions` + bouton de contrôle de scène), toujours rien : ni le bouton ni le clic droit ne fonctionnaient. Cause réelle, plus profonde que le nom du hook : `registerCompendiumContextMenu()`, `registerIngredientShopCompendiumEntry()` et `registerIngredientShopSceneControl()` étaient appelés dans le hook **`"ready"`** de `antique.mjs`. Or `getSceneControlButtons` (voir `#prepareControls()` dans `scene-controls.mjs` : "This is only done once when the application is first rendered") et la construction du menu contextuel du compendium (`_onFirstRender` de `CompendiumDirectory`, également "first render" donc unique) se déclenchent **une seule fois, tôt dans le boot de Foundry, avant `"ready"`**. Les écouteurs enregistrés en `"ready"` arrivaient systématiquement après coup.

Déplacés dans le hook **`"init"`** (le tout premier hook Foundry, avant construction de toute UI) — un `Hooks.on(...)` ne fait qu'ajouter un callback au registre, ça ne touche `game`/`canvas` qu'au moment où le hook se déclenche réellement plus tard, donc aucun risque à le faire aussi tôt.

**Fichiers** : `antique.mjs` (déplacement des 3 appels de `Hooks.once("ready")` vers `Hooks.once("init")`), `css/antique.css` (onglets encore réduits), `system.json`, `module/helpers/release-notes.mjs`.

---

## Session du 9 août 2026 (suite 4) — Bug de hook trouvé + bouton visible + onglets compacts (v0.6.18 → v0.6.19)

Le clic droit sur "Alchimie" n'ouvrait jamais la Boutique. En inspectant le vrai code source de Foundry v14 (`resources/app/client/applications/sidebar/tabs/compendium-directory.mjs`), trouvé la cause : `_createContextMenu(this._getEntryContextOptions, ..., { hookName: "getCompendiumContextOptions", parentClassHooks: false })` — le nom de hook réellement utilisé par cette version de Foundry est **`getCompendiumContextOptions`**, pas `getCompendiumDirectoryEntryContext` que `ingredient-shop.mjs` (et `random-tables.mjs`, déjà présent avant cette session — même bug, jamais remarqué faute de test) écoutaient. Les deux corrigés.

En creusant aussi pourquoi pf2e ouvre son "Compendium Browser" : ce n'est pas un clic droit mais un raccourci clavier (`Keybinding.OpenCompendiumBrowser` dans son lang.json) — sans bouton évident correspondant trouvé dans les fichiers statiques. Plutôt que de deviner plus loin, ajout d'un vrai bouton visible et permanent : `registerIngredientShopSceneControl()` ajoute un outil "Boutique d'ingrédients" dans le groupe de contrôles "tokens" de la barre d'outils de scène (`Hooks.on("getSceneControlButtons", ...)`, format v13+ à base d'objet `Record<string, SceneControl>`, vérifié dans `scene-controls.mjs`), en plus de l'entrée du menu contextuel désormais fonctionnelle.

Séparément : les onglets principaux de la fiche perso (jusqu'à 8 avec Magie) passaient sur deux lignes même à la largeur par défaut de 800px, à cause du padding/font-size trop généreux (6px 14px / 0.85em). Réduits à 4px 9px / 0.72em (et la variante compacte `@container antique-sheet (max-width: 650px)` à 3px 6px / 0.64em).

**Fichiers** : `module/apps/ingredient-shop.mjs`, `module/helpers/random-tables.mjs`, `antique.mjs`, `css/antique.css`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 3) — Boutique inspirée du vrai Compendium Browser PF2e (v0.6.17 → v0.6.18, ultracode)

Sur demande explicite : exploration directe de `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\pf2e` (le vrai système Pathfinder 2e installé), pas une simple inspiration de mémoire. Constat : le JS de pf2e (`pf2e.mjs`, 5.8 Mo) est entièrement bundlé/minifié et son listing du Compendium Browser est un composant Svelte interne — aucun template `.hbs` copiable (`templates/compendium-browser/` ne contient que des dialogues de settings). En revanche `lang/en.json` (jamais minifié) a livré les vraies chaînes officielles : `TakeLabel`/`BuyLabel` (confirme le concept Prendre/Payer déjà choisi), et surtout `AddedItem: "...to the selected actor(s)"` / `BoughtItemWithAllCharacters` / `FailedToBuyItemWithSomeCharacters` — PF2e applique Prendre/Payer à **tous les jetons sélectionnés à la fois**, pas à une seule cible. Le CSS compilé (`--color-result-list-odd`) a aussi confirmé un listing à lignes alternées.

Répercuté sur `ingredient-shop.mjs`/`.hbs` :
- `resolveShopTargetActors()` (pluriel) remplace l'ancienne fonction à cible unique — Take/Pay boucle sur tous les tokens possédés sélectionnés, repli sur `game.user.character` si rien n'est sélectionné. Notifications distinctes succès unique / succès multiple / échec partiel / échec total (`ANTIQUE.Shop.TakenAll`, `BoughtAll`, `FailedBuySome`, `FailedBuyAll`).
- Contrôle de tri (`.shop-sort`, Nom/Prix croissant/Prix décroissant), état gardé dans `this._sortMode` entre les rendus.
- Lignes alternées en CSS via le sélecteur `tr.shop-row:nth-of-type(4n+1)` — chaque `.shop-row` est toujours immédiatement suivi d'un `.equip-desc-row` caché, donc les lignes visibles tombent systématiquement sur une position impaire ; alterner par paquets de 4 cible une ligne d'ingrédient sur deux.

**Relecture adversariale** (agent fork, puisque je ne peux pas tester en direct dans Foundry) : deux bugs réels trouvés et corrigés — (1) un double-clic rapide sur Prendre/Payer pouvait lire quantité/or avant que la première écriture ne soit résolue (écrasement silencieux) → verrou visuel `.shop-busy` par ligne pendant l'action ; (2) rouvrir le menu contextuel du compendium pendant que la Boutique était déjà ouverte créait une deuxième instance `ApplicationV2` partageant le même `id` statique → singleton `AntiqueIngredientShop.open()` + libération dans `_onClose`.

**Fichiers** : `module/apps/ingredient-shop.mjs`, `templates/apps/ingredient-shop.hbs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite 2) — Boutique déplacée sur le compendium Alchimie (v0.6.16 → v0.6.17)

Suite à retour utilisateur ("je n'aime pas que les utilisateurs aient accès en permanence à la boutique") : retrait du bouton "Boutique d'ingrédients" de l'onglet Ingrédients de la fiche perso (`character-sheet.hbs`, `actor-sheet.mjs`). À la place, un clic droit sur le compendium **Alchimie** dans la barre latérale ajoute une entrée "Boutique d'ingrédients" à son menu contextuel — réutilise le hook `getCompendiumDirectoryEntryContext` déjà éprouvé par `random-tables.mjs` (mêmes créneaux "Créer une table"/"Tirer au hasard"), filtré via `visible: li => li.dataset.pack === "antique.alchimie"` pour n'apparaître que sur ce pack précis (Foundry v14 : `visible` remplace `condition`, désormais déprécié).

Sur inspiration du "Compendium Browser" de Pathfinder 2e (une fenêtre dédiée, pas le navigateur de compendium natif de Foundry) : chaque ligne de la Boutique perd sa colonne Type (non demandée) et gagne deux actions séparées au lieu d'un simple "Acheter" — `.shop-take` (« Prendre l'objet », gratuit, icône main) et `.shop-pay` (« Payer l'objet », déduit l'or, icône pièces). La logique commune d'ajout/incrémentation d'objet sur l'acteur cible est factorisée dans `grantItemToActor()` (`module/apps/ingredient-shop.mjs`), partagée par les deux actions.

**Fichiers** : `module/apps/ingredient-shop.mjs`, `antique.mjs`, `templates/actor/character-sheet.hbs`, `templates/apps/ingredient-shop.hbs`, `module/sheets/actor-sheet.mjs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 (suite) — Ingrédients à quantité 0 grisés + réapprovisionnement rapide (v0.6.15 → v0.6.16)

Dans l'onglet Ingrédients de la fiche perso (`apothSections`, déjà exhaustif — tous les ingrédients y sont listés, quantité 0 comprise), une ligne à quantité 0 se distinguait à peine du reste (seul le chiffre passait en rouge via `.quantity-value.empty`, déjà existant). Ajout d'une classe `apoth-row-empty` sur le `<tr>` lui-même (calculée comme `.quantity-value.empty`, sur `lt ing.system.quantity 1`) qui grise toute la ligne (`opacity: 0.55`, remonte à `0.85` au survol) — scopée à `.apoth-row` pour ne pas toucher le style de l'Inventaire qui partage le même marquage `quantity-value.empty`.

Nouveau bouton `.ingredient-restock` (icône `fa-plus-circle`) sur chaque ligne, y compris à quantité 0 : incrémente `system.quantity` de 1 via un handler direct dans `actor-sheet.mjs` (`item.update({"system.quantity": qty + 1})` + re-render), sans passer par `item.consume()` (qui décrémente et est gardé par `system.consumable`) — l'ajout n'a pas cette contrainte, tout ingrédient doit pouvoir être réapprovisionné.

**Fichiers** : `templates/actor/character-sheet.hbs`, `module/sheets/actor-sheet.mjs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`.

---

## Session du 9 août 2026 — Besace d'ingrédients (v0.6.14 → v0.6.15)

Un objet d'équipement tagué `system.apothCategory` (un ingrédient) apparaissait à la fois dans l'onglet Inventaire et dans l'onglet dédié « Ingrédients » (ex-Apothicaire). Premier essai : masquer les ingrédients de l'Inventaire uniquement pour un Praticien de la magie, avec une case à cocher pour les réafficher (`system.showIngredientsInInventory`) — **abandonné en cours de session**, remplacé par l'approche ci-dessous.

Approche retenue : les ingrédients ne s'affichent plus jamais comme lignes séparées dans l'Inventaire (`inventoryItems` dans `actor-sheet.mjs` exclut désormais tout equipment ayant un `apothCategory`, sans condition de Praticien). À la place, un objet d'équipement particulier peut être marqué « Est une Besace d'ingrédients » (nouveau champ `system.isIngredientBag` sur `AntiqueEquipment`, checkbox sur `equipment-sheet.hbs`) : dans l'Inventaire, ouvrir le détail de cet objet (même mécanisme de dépli que la description) affiche la liste en temps réel de tous les ingrédients actuellement possédés, regroupés par catégorie (Communs/Peu Communs/Rares/Potions via `context.possessedIngredientSections`, filtré `quantity > 0`, recalculé à chaque `getData()`). L'onglet « Ingrédients » n'est pas affecté — il continue de tout lister, y compris à quantité 0.

**Bug corrigé en cours de session** : le filtre d'exclusion de l'Inventaire (`!i.system.apothCategory`) excluait aussi la besace elle-même dès qu'elle portait un `apothCategory` (ex. créée depuis le bouton "+" d'une section de l'onglet Ingrédients) — elle disparaissait purement et simplement de l'Inventaire. Condition corrigée en `!i.system.apothCategory || i.system.isIngredientBag` : un objet marqué besace reste toujours visible dans l'Inventaire, même s'il a par ailleurs une catégorie d'ingrédient.

### Onglet "Ingrédients" déplacé sur la fiche de la Besace elle-même
Revu suite à retour utilisateur : l'affichage des ingrédients possédés ne se fait plus en dépliant la ligne de la besace dans l'Inventaire de la fiche perso — retiré de `character-sheet.hbs`/`actor-sheet.mjs` (`context.possessedIngredientSections` n'existe plus côté acteur). À la place, cocher "Est une Besace d'ingrédients" sur la fiche de l'objet Équipement lui-même (`equipment-sheet.hbs`) fait apparaître un onglet "Ingrédients" dédié sur **cette fiche d'objet**, qui liste en temps réel (regroupé par catégorie) tout ce que l'acteur parent (`this.item.actor`) possède actuellement en quantité > 0 (`item-sheet.mjs`, `_prepareContext`). N'affiche rien pour un objet non possédé par un acteur (compendium).

Au passage, suppression de la mention obsolète "(Sac d'Apothicaire)" dans le libellé du champ `ANTIQUE.Equipment.ApothCategory` (devenu simplement "Catégorie d'ingrédient"), et nettoyage du commentaire correspondant dans `config.mjs`, qui référençait encore l'ancien nom de l'onglet avant son renommage en "Ingrédients" (v0.6.12).

Une besace ne peut pas être elle-même un ingrédient : quand `system.isIngredientBag` est coché, les champs Bonus CA, Compétence liée (+ son bonus) et Catégorie d'ingrédient (+ Type) sont masqués sur `equipment-sheet.hbs` (`{{#unless system.isIngredientBag}}`). Pour que ça reste vrai même si une valeur résiduelle traîne dans `system.apothCategory` (ex. objet basculé en besace après coup), le filtre `apothItems` de `actor-sheet.mjs` (source de l'onglet Ingrédients de la fiche perso) exclut désormais explicitement `i.system.isIngredientBag`.

### Onglet "Détails" sur la fiche d'objet Équipement
La fiche d'objet Équipement n'avait que Description/Effets, avec tous les champs (quantité, prix, consommable, emplacement, équipé, bonus CA, compétence liée, catégorie/type d'ingrédient, besace) entassés dans l'onglet Description. Nouvel onglet "Détails" (`ANTIQUE.Tab.Details`) qui regroupe tous ces champs ; l'onglet Description ne contient plus que le texte riche (+ notes MJ). Purement une réorganisation de template (`equipment-sheet.hbs`) — aucun champ de données déplacé ou renommé, le mécanisme générique d'activation d'onglet (`item-sheet.mjs`, basé sur `data-tab`) n'a pas eu besoin d'être modifié.

**Fichiers** : `module/data-models/items/item-equipment.mjs`, `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `templates/item/equipment-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`, `module/helpers/release-notes.mjs`, `system.json`. (`module/data-models/actor-character.mjs` : ajout puis retrait de `showIngredientsInInventory`, pas de trace résiduelle.)

---

## Session du 8 août 2026 — Ingrédients de sort, audit rafraîchissement complet, remplissage Antalios, sorts à zone (v0.6.3 → v0.6.14)

### Contexte
Longue session continue, du diagnostic Foundry 14.365 jusqu'au remplissage complet de la fiche du PJ "Antalios" et l'ajout d'un système de gabarit de sort. Convention de version conservée : bump `system.json` + entrée `CHANGELOG.md` (français, Keep a Changelog) + entrée `module/helpers/release-notes.mjs` à chaque déploiement. Déploiement systématique via `Copy-Item -Recurse` vers `D:\AppDataFoundry$\...\systems\antique\`.

---

### Onglet "Ingrédients" sur la fiche de Sort (v0.6.3)
Nouveau champ `system.ingredients` (ArrayField de `{id, name, quantity, possede}`) sur `AntiqueSpell`, avec un onglet dédié sur `spell-sheet.hbs` (ajout/suppression/édition inline). `castSpell()` bloque le lancer d'un sort par un **personnage-joueur** (pas les PNJ, lancés librement par le MJ) si un ingrédient requis n'est pas coché "Possédé" — proposition ensuite, via `DialogV2.wait`, de consommer ou garder les ingrédients cochés. À ne pas confondre avec le mécanisme préexistant de consommation d'un ingrédient texte-libre (`system.costText`) depuis l'inventaire pour les rituels : les deux coexistent sans se remplacer.

**Fichiers** : `module/data-models/items/item-spell.mjs`, `templates/item/spell-sheet.hbs`, `module/sheets/item-sheet.mjs`, `module/documents/item.mjs`, `lang/{fr,en}.json`.

---

### Mécanisme de vérification de version (externe uniquement)
Ajout de `module/helpers/version-check.mjs` : compare la version vue au dernier chargement (world setting `lastSeenVersion`) à `game.system.version`, affiche les notes de version (`release-notes.mjs`) et propose une resynchronisation des compendiums depuis le manifeste GitHub distant si l'utilisateur le souhaite. **Contrainte explicite du client** : ce mécanisme ne doit JAMAIS se déclencher pendant nos déploiements manuels de développement — gardé par `if (!game.system.manifest) return;` (un système chargé en local sans manifeste distant configuré a toujours `manifest` vide). Ne concernera que de futurs utilisateurs récupérant le système via un vrai manifeste GitHub hébergé, pas encore mis en place.

**Fichiers** : `module/helpers/version-check.mjs` (nouveau), `module/helpers/release-notes.mjs` (nouveau), `antique.mjs`.

---

### Rituel/Instantané, Malédiction, bonus de CA des sorts (v0.6.4)
- Onglet Magie scindé en deux sections (Sorts Instantanés / Rituels) avec bouton "+" séparé (`data-ritual="true"` pré-coche `system.ritual` à la création).
- "Malédiction" devient un vrai type d'Item (`AntiqueCurse`, schéma `{effet, description, gmNotes}`, **sans** `cout` — volontairement exclu de la balance de traits Avantages/Désavantages), à côté des Avantages/Désavantages/Bénédictions.
- Sorts à bonus de CA temporaire (ex. Peau d'écorce) : nouveau champ `system.caBonus` sur les sorts, ajoute un bouton "Appliquer l'effet" dans le message de chat de `castSpell()` — cible les tokens du joueur/sélectionnés, retombe sur le lanceur si rien n'est ciblé (self-buff). Applique un bonus de CA temporaire via ActiveEffect nommée déterministe (même principe que le bouton "Appliquer les dégâts" déjà existant).

**Fichiers** : `module/data-models/items/item-curse.mjs` (nouveau), `templates/item/curse-sheet.hbs` (nouveau), `templates/actor/{character,npc}-sheet.hbs`, `module/sheets/{actor,npc,item}-sheet.mjs`, `module/documents/{item,actor}.mjs`, `antique.mjs`, `template.json`, `lang/{fr,en}.json`.

---

### Audit complet des bugs de rafraîchissement (v0.6.6)
Suite à un retour utilisateur global ("de nombreux problèmes de rafraîchissement... sur tout élément de la fiche"), audit exhaustif via un Workflow à 5 agents parallèles sur l'ensemble de l'écosystème fiches perso/PNJ/objet. **13 bugs distincts trouvés et corrigés**, tous de la même famille (mutation hors du cycle de soumission propre à une fiche, sans re-render forcé explicite) :
- `refreshSheet(doc)` centralisé dans `module/helpers/sheet-utils.mjs` (déplacé depuis `item.mjs`) — vérifie `doc.sheet?.rendered` avant de forcer un re-render, pour ne jamais ouvrir une fiche fermée.
- Appliqué : attaque d'arme + munition liée (`_doRollAttack`), consommation d'ingrédient de rituel, décrément de `limitationValue`/reset ingrédients dans `castSpell()`, consommation d'équipement/arme (`consume()`), `_onUpdate()` de l'acteur (sync Avantage Temporaire), `applyDamage()`, `applyCaBonus()`, repos long (rations + sorts), `_onItemCreate` du PNJ (manquait un `render({force:true})`), `_onEffectCreate/_onEffectDelete/_onEffectToggle` de la fiche d'objet (+ propagation vers `item.actor`), bouton `.long-rest` de la fiche perso (manquait le `.then()`).
- Confirmé par test utilisateur en direct ("j'ai testé, ça marche bien").

**Fichiers** : `module/helpers/sheet-utils.mjs`, `module/documents/{item,actor}.mjs`, `module/sheets/{npc,item,actor}-sheet.mjs`.

---

### Correctif de taille des éditeurs de texte riche (v0.6.7 → v0.6.8)
Problème : les zones Notes/Description restaient minuscules avec ascenseur interne plutôt que de remplir la box parente. Cause racine : le `<prose-mirror>` natif Foundry v14 (modèle `display:flex;flex-direction:column;min-height:var(--min-height)`, contenu interne en `position:absolute;inset:0`) a besoin d'un `flex:1` transmis par toute la chaîne d'ancêtres flex-column pour réellement grandir — or le CSS legacy ciblait encore une classe `.editor`, **morte** depuis la migration `{{editor}}` → `<prose-mirror>`, donc sans aucun effet. Corrigé sur fiche PNJ (`.antique .sheet-body .tab.active[data-tab="notes"]` passé en flex-column, scopé à cet onglet précis pour ne pas casser les onglets à tableaux/grilles), fiche d'objet (`.antique.sheet.item .sheet-body .tab.active` passé en `flex` globalement — pas de tableau dense sur ces fiches, risque jugé faible) et fiche Divinité. Notes MJ (PNJ) remontées à `min-height: 160px` (~4 lignes éditables) sur demande explicite ("il faudrait au moins que les deux blocs 'note' fassent 4 lignes éditables chacun"). Volontairement **pas** appliqué à `bg-histoire` du `background-grid` de la fiche perso (risque d'overflow horizontal jugé trop incertain à l'époque) — demande reprise et traitée séparément plus tard dans la session (voir plus bas, v0.6.10).
Suppression du bloc `.antique .editor {...}` totalement mort dans `css/antique.css`.

**Fichiers** : `css/antique.css`.

---

### Bonus de sauvegarde permanent — fix Dépressif/Volonté (v0.6.9)
Un trait comme "Dépressif" (censé donner -1 Volonté de base) n'avait en réalité **aucun moyen mécanique** de réduire une sauvegarde : seul `system.saves.X.temp` existait, un champ manuel édité par le joueur, jamais ciblé par une ActiveEffect de trait. Ajout d'un nouveau champ `system.saves.X.bonus` (piloté par ActiveEffect, `mode:2` ADD) distinct de `temp`, même principe que `damageBonus` à côté de `bonus` pour les catégories d'attaque. Formule : `save.total = SAVE_BASE + mod1 + mod2 + save.bonus + save.temp`. Tooltip de survol mis à jour pour inclure le détail du bonus.

**Fichiers** : `module/data-models/actor-character.mjs`, `module/sheets/actor-sheet.mjs`.

---

### Champ Histoire agrandi (v0.6.10)
Demande explicite reprenant le point laissé de côté en v0.6.7/0.6.8 : `.bg-histoire` (onglet Background, fiche perso) remonté de 140px à 190px (bloc) et 100px à 160px (éditeur), ~4 lignes visibles, cohérent avec le traitement des notes PNJ.

**Fichiers** : `css/antique.css`.

---

### Remplissage de la fiche "Antalios" depuis l'Excel (3 macros)
Impossible d'exécuter du JS dans le client Foundry en direct depuis cet environnement (pas d'accès navigateur) : chaque mise à jour de données d'acteur/objet **déjà vivantes** est livrée sous forme de Macro Script que l'utilisateur colle et exécute lui-même dans Foundry, jamais par écriture directe de fichiers LevelDB (cf. incident de corruption déjà rencontré sur les compendiums).
1. `remplir-antalios.js` : stats de base (FOR/DEX/CON/INT/AST/CHA), PV/PM, `isMagicPractitioner`, historique, 48 compétences, 4 avantages + 10 désavantages (dont "Dépressif" avec une vraie ActiveEffect `system.saves.volonte.bonus -1`), arme "Serpe", 2 équipements de départ, 10 sorts instantanés, 8 rituels Hécate avec ingrédients.
2. `remplir-antalios-apothicaire.js` : 73 ingrédients + 5 potions du "Sac d'Apoticaire" — uniquement ce qu'Antalios **possède réellement** (colonnes Dose/Nombre > 0 de l'Excel), pas le catalogue générique déjà couvert par le compendium "alchimie" (`packs/_build-alchimie.js`, items equipment organisés en dossiers Communs/Peu Communs/Rares/Potions).
3. `antalios-tag-apothicaire.js` : rattache ces mêmes objets à `system.apothCategory`/`apothType` (champ qui n'existait pas encore au moment de la macro 2) pour qu'ils apparaissent dans le nouvel onglet Ingrédients de la fiche (voir plus bas).
Des doublons (anciens/nouveaux objets de même nom) sont apparus après coup ; une macro de fusion (`antalios-supprimer-doublons.js`, garde le plus récent + additionne les quantités) fournie mais le premier essai n'a rien trouvé (0 doublon groupé par nom exact) — une macro de diagnostic en lecture seule (`antalios-diag-items.js`, liste tous les items groupés par nom exact dans la console) a été fournie pour comprendre l'écart, résultat encore en attente de retour utilisateur.

---

### Onglet "Ingrédients" sur la fiche de personnage (v0.6.11 → v0.6.12)
Nouveau champ générique `system.apothCategory` (`ingredientCommun`/`ingredientPeuCommun`/`ingredientRare`/`potion`, config `ANTIQUE.apothCategories`) + `system.apothType` (texte libre, ex. Plante/Minéral) sur `AntiqueEquipment`. Tout objet equipment taggé apparaît groupé par catégorie dans un nouvel onglet dédié de la fiche perso (sur le modèle de l'onglet Excel "Sac d'Apoticaire"), en plus de rester dans l'Inventaire général — chaque section a son propre bouton "+" (`data-apoth-category` lu dans `_onItemCreate`, même principe que `data-ritual`). Réutilise volontairement les classes CSS/handlers déjà délégués de l'Inventaire (`.item`, `.equip-row`, `.item-edit/-delete/-consume`) pour ne rien ajouter côté JS. Onglet d'abord nommé "Apothicaire" puis renommé "Ingrédients" sur demande (label seul, clés techniques `apoth*`/`data-tab="apothicaire"` inchangées), puis repositionné juste à côté de l'onglet Magie (au lieu de juste après Inventaire). Pas ajouté à la fiche PNJ (jugé PJ-only).

**Fichiers** : `module/data-models/items/item-equipment.mjs`, `module/helpers/config.mjs`, `module/sheets/{actor,item}-sheet.mjs`, `templates/item/equipment-sheet.hbs`, `templates/actor/character-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`.

---

### Sorts à zone — gabarit circulaire (v0.6.13 → v0.6.14)
Nouveaux champs génériques sur `AntiqueSpell` : `hasTemplate`, `templateRadius` (défaut 25m), `templateTexture` (défaut `icons/magic/air/fog-gas-smoke-green.webp`), `templateColor` (défaut `#808080` gris). Si actif, `castSpell()` ajoute un bouton "Placer un gabarit" au message de chat ; un hook `renderChatMessageHTML` dans `antique.mjs` gère le placement interactif (aperçu qui suit la souris, snap sur la grille via `canvas.grid.getSnappedPoint`, clic gauche = confirme/crée le `MeasuredTemplate` sur la scène, clic droit = annule) — idiome standard de placement de gabarit repris de la plupart des systèmes Foundry, avec repli silencieux si l'API de snap venait à différer. **Jamais testé en direct depuis cet environnement** (pas d'accès navigateur/canvas) ; confirmé fonctionnel par l'utilisateur après un premier essai, ajustement demandé sur la couleur par défaut (gris au lieu de la couleur du joueur assignée par Foundry) intégré dans la foulée.

**Piège découvert au passage** : dans le repo source, `packs/sorts.db` (et les autres `packs/*.db`) est un NDJSON à plat utilisé comme source de build lisible — ce n'est **pas** ce que Foundry charge en jeu. Le vrai compendium vécu est le dossier LevelDB `packs/sorts/`, déployé une fois et jamais recopié par le `Copy-Item` de déploiement (absent du repo source). Éditer `packs/sorts.db` puis déployer ne change donc rien aux données déjà en jeu ; toute modification d'un compendium déjà déployé (activer `caBonus`, `hasTemplate`, etc. sur un sort existant) doit passer par une Macro utilisant l'API Document de Foundry (`game.packs.get("antique.sorts").getDocument(id)` puis `.update()`, avec déverrouillage temporaire du pack si besoin) — sûr même verrouillé, sans jamais toucher aux fichiers LevelDB bruts. Sort "Brouillard" activé (25m, texture brouillard, gris) via `brouillard-activer-gabarit.js` sur le compendium, puis `antalios-sync-brouillard.js` sur la copie déjà possédée par Antalios (les copies d'items sur un acteur ne se resynchronisent jamais automatiquement depuis le compendium — même piège que le bug de portée du Glaive documenté précédemment).

**Fichiers** : `module/data-models/items/item-spell.mjs`, `templates/item/spell-sheet.hbs`, `module/documents/item.mjs`, `antique.mjs`, `css/antique.css`, `lang/{fr,en}.json`.

---

## Session du 25 juillet 2026 — Refonte Combat/Sauvegardes/CA, bonus d'équipement, et série de bugs de re-render

### Contexte
Grosse session de traitement d'une todo-list utilisateur (`todo_foundry.txt` sur le Bureau), en continu, avec vérification systématique via Playwright headless piloté contre l'instance Foundry déjà lancée en local (port 30000, monde "test_antique", utilisateur Gamemaster) — chaque correctif déployé puis testé en conditions réelles avant de passer au suivant.

---

### Onglet Combat — Bonus d'attaque entièrement revus

**Problème initial** : le total du tableau "Bonus d'attaque" ne reflétait pas le bonus inscrit sur la compétence liée, et affichait une colonne "Bonus" manuelle redondante avec le champ `system.attackBonuses.X.bonus`.

**Décisions successives (affinées au fil des retours utilisateur) :**
1. Ajout du nom de la caractéristique à côté du modificateur (ex "FOR +2") — `abilityLabel` ajouté dans `weaponCatsData` (`actor-sheet.mjs`).
2. Lien caractéristique/compétence : chaque catégorie d'arme référence sa compétence dans `ANTIQUE.weaponCategories[x].skill` (`config.mjs`).
3. **Retrait complet** de la colonne "Bonus" manuelle (`system.attackBonuses.X.bonus`) — colonne + calcul retirés (`character-sheet.hbs`, `actor-character.mjs`). Un avantage du compendium ("Visée d'Apollon") ciblait ce champ via ActiveEffect, mais il s'est avéré que le compendium **live** (LevelDB) n'a en réalité aucun effet sur cet item — décalage préexistant avec le fichier source `.db`, sans rapport avec ce correctif. Rien de cassé en pratique.
4. Le modificateur de caractéristique ne s'applique **que si la compétence liée est entraînée** — sinon grisé/barré dans le tableau (`.ability-mod-cell.inactive`) et exclu du total.
5. **Version finale** : `atk.total = linkedSkill.total` directement (plus aucun recalcul à part) — le total du Combat est TOUJOURS strictement identique au total de la compétence liée dans l'onglet Compétences, pénalité non-entraîné (-4) comprise. Testé sur 2 personnages différents, 5 catégories chacun : concordance parfaite avant/après bascule d'état entraîné.
6. Tableau passé de 5 à 4 colonnes finales : Catégorie / Mod Carac / Bonus Cpt / TOTAL.
7. Table "Bonus d'attaque" sortie du conteneur flex partagé avec CA/Initiative (`.combat-stats`) — désormais sur sa propre ligne pleine largeur, plus collée à côté d'Initiative.
8. Blocs CA/Initiative : `align-items: flex-start` ajouté à `.combat-stats` pour que chaque bloc garde sa hauteur naturelle (Initiative ne s'étire plus pour matcher CA).

**Fichiers** : `module/data-models/actor-character.mjs`, `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`.

---

### Sauvegardes (Reflexe/Robustesse/Volonté) — refonte complète

Affichage repensé : seuls Nom du jet, Mod Temp (éditable) et TOTAL (auto) sont visibles ; survol (`title`) affiche le détail complet du calcul (Base + Mod Carac 1 + Mod Carac 2 + Temp = Total).

**Changement de règle** : la valeur de Base n'est plus un champ éditable — elle est désormais **fixe à 1** (constante `SAVE_BASE` dans `prepareDerivedData`), le schéma `base` a été retiré de `saveSchema()`. Formules :
- Reflexe = 1 + Mod Dex + Mod Ast + Temp
- Robustesse = 1 + Mod Con + Mod For + Temp
- Volonté = 1 + Mod Int + Mod Cha + Temp

Bloc des sauvegardes déplacé en haut de l'onglet "Abilities & Skills" (au-dessus de la barre de favoris), et chaque jet restylé en bloc/carte (bordure, fond) plutôt qu'en ligne de texte plate.

**Fichiers** : `module/data-models/actor-character.mjs`, `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`.

---

### CA (Classe d'Armure) — masquage des champs manuels

Même traitement que les sauvegardes : le bloc CA n'affiche plus que le TOTAL et le champ Temporaire ; Base/Armure/Bouclier/Bonus Vigueur/Mod Con sont retirés de l'affichage principal et uniquement visibles au survol (tooltip avec calcul complet). Les champs restent dans le schéma (non supprimés, contrairement à Base des sauvegardes) — ils peuvent encore être ajustés via une autre voie (ActiveEffect, édition source), seule leur présence dans l'UI principale change.

**Nouveauté associée** : les objets d'équipement peuvent désormais porter un bonus/malus de CA (`system.caBonus`, champ "Bonus/Malus CA" dans la fiche d'objet) qui s'additionne automatiquement à `ca.total` — pensé pour les armures/boucliers/objets magiques. De la même façon, un équipement peut optionnellement porter un bonus lié à UNE compétence précise (`system.linkedSkill` + `system.skillBonus`, menu déroulant "Aucun" par défaut) qui s'additionne au total de cette compétence. Agrégation faite dans `prepareDerivedData()` en itérant `this.parent.items` (type "equipment") avant le calcul des totaux CA/compétences.

**Fichiers** : `module/data-models/actor-character.mjs`, `module/data-models/items/item-equipment.mjs`, `module/sheets/actor-sheet.mjs`, `module/sheets/item-sheet.mjs`, `templates/actor/character-sheet.hbs`, `templates/item/equipment-sheet.hbs`, `lang/{fr,en}.json`.

---

### Bug — Avantage Temporaire : crash sur fiche orpheline + doublons d'ActiveEffect

**Crash reporté** : `Error: undefined id [...] does not exist in the EmbeddedCollection collection` lors du toggle. Cause : un token non-lié dont le Token a été supprimé de la scène pendant que sa fiche restait ouverte — toute tentative de mise à jour plante en profondeur dans le pipeline Foundry (parent chain irrésoluble). Piège découvert au passage : `token.parent` reste truthy (renvoie la Scène) même après suppression du Token — il faut vérifier que le Token existe encore dans `scene.tokens`, pas juste que `.parent` est défini. Nouveau helper `module/helpers/actor-utils.mjs` (`isOrphanedTokenActor`), utilisé dans `_processSubmitData` des 3 fiches d'acteur pour fermer proprement la fiche orpheline au lieu de laisser planter Foundry.

**Doublons d'ActiveEffect** : un même toggle créait parfois 2 effets "Avantage Temporaire" au lieu d'un (~1.7-3s d'écart), cause exacte non élucidée (probablement liée à 2 clients connectés simultanément sous le même compte GM pendant les tests, la vraie fenêtre Foundry + le navigateur de test). Corrigé en donnant un **`_id` déterministe fixe** (`avantageTempEff1`) à l'effet — Foundry refuse structurellement un doublon d'ID dans la même collection, éliminant le problème à la racine plutôt que de nettoyer après coup.

**Visibilité** : indicateur "Avantage Temporaire" ajouté en badge permanent dans le header de la fiche (visible sur tous les onglets, cliquable pour toggle direct), et retiré de l'onglet Traits (redondant, l'ancien emplacement provoquait aussi une confusion sur un supposé bug de CA qui ne s'est pas confirmé en test).

**Fichiers** : `module/documents/actor.mjs`, `module/helpers/actor-utils.mjs` (nouveau), `module/sheets/{actor,npc,deity}-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`.

---

### Bug — Impossible de changer l'image des objets/personnages (FilePicker)

Cause : `data-edit="img"` seul ne suffit pas en Foundry v14 ApplicationV2. `DocumentSheetV2` définit bien un handler natif (`#onEditImage`, confirmé en lisant `client/applications/api/document-sheet.mjs`), mais il est déclenché via le système d'actions (`data-action="editImage"`), absent de tous nos templates. Ajouté sur les 10 balises `<img data-edit="img">` du projet (personnage, PNJ, divinité, + 7 fiches d'item).

**Fichiers** : `templates/actor/{character,npc,deity}-sheet.hbs`, `templates/item/{weapon,equipment,advantage,disadvantage,blessing,spell,effect}-sheet.hbs`, `css/antique.css` (`cursor: pointer` sur `img[data-edit]`).

---

### Bug — Tableau des armes : consommable lié pas mis à jour après édition

Modifier la quantité d'un consommable (ex. carquois) via sa **propre** fiche d'objet ne rafraîchissait pas la fiche du personnage ouverte à côté (donnée bien sauvegardée, juste pas réaffichée). Même famille de bug que les re-render manquants déjà rencontrés, mais cette fois inter-documents (Item → Actor). Corrigé dans `item-sheet.mjs` : après sauvegarde, si la fiche de l'acteur parent est déjà rendue, on la force aussi à se redessiner (garde `actorSheet?.rendered` pour ne pas l'ouvrir si elle ne l'était pas).

---

### Bug — Barre de favoris (compétences) pas mise à jour immédiatement

Ajouter/retirer une compétence des favoris via le menu contextuel, ou cliquer la croix de suppression sur une puce, mettait bien à jour la donnée mais pas l'affichage — même cause récurrente (`actor.update()` sans `.then(() => this.render({force:true}))`). Corrigé sur les deux handlers concernés dans `actor-sheet.mjs`.

---

### Bug — Dépréciation `ContextMenuEntry#callback`

`callback:` déprécié depuis Foundry v14 (retrait prévu v16) au profit de `onClick:` — **attention, l'ordre des arguments s'inverse** : `callback(target, event)` devient `onClick(event, target)`, pas un simple renommage de clé. Corrigé sur les 4 entrées de `actor-sheet.mjs` (favoris compétences, alliés/ennemis) et les 2 de `random-tables.mjs` (menu contextuel compendium).

---

### Nouvelle fonctionnalité — Accordéon sur Traits/Avantages/Désavantages/Bénédictions

Clic sur une ligne (tableau ou liste) : déroule la description riche de l'objet + le résumé de ses ActiveEffects mécaniques (réutilise `getEffectChangeLabel` existant). Reclic = réenroule. Colonne "Effet" (texte brut redondant) retirée des tableaux. Chaque ligne a un état indépendant. Caret visuel (rotation 90°) comme indicateur.

**Fichiers** : `templates/actor/character-sheet.hbs`, `module/sheets/actor-sheet.mjs`, `css/antique.css`.

---

### Palette, police, mise en page (batch de retouches visuelles)

- Nouvelle palette "méditerranéenne" (Bleu Profond `#1d5763` remplace le brun, Or `#c39a3f`, Parchemin `#f4eedf`/`#d9caa8`/`#ece2cd`) — mêmes noms de variables CSS conservés pour ne pas casser les usages existants, seules les valeurs changent.
- **Bug de contraste découvert après coup** : les tables (`traits-table`, `attack-table`, `item-list`) n'avaient pas de fond explicite sur la balise `<table>` elle-même — le fond sombre par défaut de Foundry passait à travers les cellules "transparentes", rendant le texte quasi illisible. Corrigé en ajoutant `background: transparent` explicite sur les 3 sélecteurs.
- Bandeau décoratif motif méandre (`--meander`, SVG inline en zigzag) en haut de fiche (`.band`).
- Police `Cinzel` (fichiers `.ttf` téléchargés et embarqués dans `fonts/`, déclarés via `system.json` → `fonts`) appliquée aux titres (`h1/h2/h3`, onglets) uniquement — pas au corps de texte.
- Icônes de compétence agrandies (`1em`→`1.25em`, `16px`→`20px`) et détachées du losange checkbox (`margin-left`).
- Compétence entraînée : fond teinté de la couleur de sa caractéristique au lieu d'un gold générique unique.
- Icône de trait (header) : fond sombre + marge.
- Tailles carac/compétences en liste : `0.875em`.
- Cité déplacée du header vers l'onglet Identité (1ère position de la grille) — header ne garde que Dévotion/Joueur.
- Titre d'objet (fiche Item) : débordait du cadre pour les noms longs — `min-width: 0` + `flex: 1` + `text-overflow: ellipsis`.

---

### Réassignation d'icônes sur les compendiums — terminé

Constat : ~254 objets (avantages, désavantages, avantages-divins) utilisaient seulement 2 icônes génériques au total sur les ~620 objets que compte le système. Tâche déléguée à un fork (bibliothèque bundlée Foundry, `icons/svg/` pour les concepts abstraits + dossiers spécifiques pour armes/équipement/alchimie). **Résultat vérifié indépendamment** : avantages 90/94, désavantages 87/95, avantages-divins 4, armes 116/116, équipement 17/50, alchimie 25/115, bénédictions 0 (déjà correctes) — tous les packs re-verrouillés, 0 fichier d'icône manquant sur 576 items contrôlés.

---

### Compendiums — "impossible de les déverrouiller" : comportement normal, pas un bug

Le clic dans la fenêtre du compendium **ouverte** ne déverrouille rien (l'icône de cadenas dans son header a l'attribut `inert`, purement décoratif). Le vrai contrôle est un **clic droit sur l'entrée dans la sidebar** (liste des compendiums), qui ouvre un menu contextuel natif Foundry (`COMPENDIUM.ToggleLocked.Lock/Unlock`). Pour un pack de type `"system"` (notre cas), Foundry affiche en plus une boîte de dialogue d'avertissement (Dupliquer / Déverrouiller quand même / Annuler) avant d'appliquer le déverrouillage — si elle passe inaperçue, on a l'impression que rien ne s'est passé. Rien à corriger dans le code, juste un point de UX à expliquer.

---

### Audit CA armures/boucliers + ajout d'un champ Prix (fork)

Deux tâches déléguées à un fork sur les compendiums d'objets : (1) vérifier que `system.caBonus` de chaque armure/bouclier correspond bien au bonus mentionné dans sa description, corriger les écarts ; (2) ajouter un nouveau champ `system.price` rempli à partir du prix mentionné dans la description, sur tous les objets pertinents (équipement + armes), sans jamais inventer de valeur en cas d'ambiguïté.

---

### Nouvelle fonctionnalité — Équipement porté (silhouette / paperdoll)

Demande : voir en un coup d'œil ce qui est réellement porté, à la manière d'un écran d'équipement de jeu vidéo, plutôt qu'une simple liste plate.

- **9 emplacements** (`ANTIQUE.equipmentSlots` dans `config.mjs`) : Tête, Torse, Jambes, Mains, Bouclier, Arme principale, Arme secondaire, Accessoire 1, Accessoire 2 — chaque emplacement restreint les types d'objets acceptés (armes vs équipement).
- Nouveaux champs sur les objets : `slot`, `equipped` (armes et équipement), `caBonus`/`linkedSkill`/`skillBonus` déjà existants, `price` (armes + équipement).
- Silhouette centrale en icône Font Awesome (`fa-person`) teintée dans la palette du thème — pas d'asset externe (le mockup fourni par l'utilisateur était une image Shutterstock sous copyright, non réutilisable).
- Chaque case affiche l'icône de l'objet équipé + son bonus pertinent (CA pour armure/bouclier, bonus de compétence pour accessoire, bonus d'attaque pour arme), tooltip nom, bouton de retrait au survol.
- **Trois façons d'équiper** : (1) case à cocher dans la liste d'inventaire (si l'objet a déjà un emplacement défini dans sa propre fiche) ; (2) glisser-déposer une ligne du tableau directement sur une case de la silhouette (avec validation de type — refuse une arme sur un emplacement d'armure) ; (3) bouton "+" dans la colonne Équipé (pour un objet sans emplacement défini) qui ouvre un petit menu contextuel listant les emplacements compatibles.
- **Découverte importante sur le drag & drop** : dans cette version de Foundry, `ActorSheetV2._dragDrop` **ignore silencieusement** l'option `dragSelector` déclarée dans `DEFAULT_OPTIONS` — elle est câblée en dur sur `.draggable` (confirmé en lisant `client/applications/sheets/actor-sheet.mjs`). Sans la classe `draggable` explicitement posée sur l'élément, aucun glisser ne démarre, quoi que dise la config. Ajoutée sur les lignes du tableau d'inventaire.
- **Comportement de calcul associé** : seuls les objets **réellement équipés** contribuent désormais aux bonus (CA, compétence) — avant cette fonctionnalité, un objet d'équipement dans l'inventaire (même non porté) l'ajoutait automatiquement à la CA, ce qui n'avait pas de sens une fois la notion d'emplacement introduite.
- **Armure/Bouclier vs bonus générique** : le bonus de CA d'un objet équipé alimente désormais `ca.armure` s'il est dans l'emplacement Torse, `ca.bouclier` s'il est dans Bouclier, et seulement les autres emplacements (anneaux, amulettes...) vont dans le bonus générique — avant, tout partait dans le même bonus indifférencié.
- Layout Inventaire : silhouette placée à droite du tableau d'objets sur fenêtre large (`display:flex; flex-wrap:wrap`), repasse automatiquement sous le tableau si la fenêtre est trop étroite pour les deux côte à côte — pas de breakpoint fixe à maintenir, le wrap flex s'en charge tout seul. Tableau doté d'une largeur minimale (480px) pour ne jamais nécessiter de scrollbar horizontale au profit d'un simple retour à la ligne de la colonne silhouette.

**Fichiers** : `module/helpers/config.mjs`, `module/data-models/actor-character.mjs`, `module/data-models/items/{item-equipment,item-weapon}.mjs`, `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `css/antique.css`, `lang/{fr,en}.json`.

---

### Bug récurrent — re-render manquant, étendu à de nouveaux endroits

Le même symptôme (l'action réussit en base mais la fiche ouverte ne se met pas à jour tant qu'on ne la referme/rouvre pas) est réapparu à plusieurs nouveaux endroits au fil de la session, toujours pour la même raison : un appel `document.update()`/`.delete()`/`.create()` sans `.then(() => this.render({force:true}))` derrière. Corrigés : création d'arme via le "+" de l'onglet Combat, les 3 méthodes d'équipement (case à cocher / glisser-déposer / bouton "+"), suppression d'un objet (fiche personnage **et** fiche PNJ), suppression d'un effet sur une fiche d'objet, toggle actif/inactif d'un effet (fiche d'objet et fiche personnage), dépôt d'un acteur dans le BG, et les 5 actions de gestion des groupes du BG (créer/supprimer/renommer/recolorer un groupe, déplacer une carte).

---

### Combat — bonus d'attaque à distance + choix de mode d'attaque

Retour en arrière partiel sur la décision "le total = strictement le total de la compétence" (voir plus haut) : la formule finale du tableau Bonus d'attaque est désormais `Total = Bonus de compétence + (modificateur de caractéristique si la compétence est entraînée, sinon rien)` — recalculée directement dans le tableau plutôt que piochée telle quelle sur la compétence, pour ne plus hériter de la pénalité -4 non-entraîné qui n'a pas de sens dans ce contexte précis.

Nouveau champ `system.attBonusDistance` sur les armes, visible uniquement si "À distance" est coché. Cliquer sur l'attaque d'une arme à distance ouvre désormais une fenêtre de choix (Distance / Corps à corps) avant de lancer le jet, chacun utilisant son propre bonus et l'indiquant dans le message de chat (`item.mjs` : `rollAttack()` délègue à `_executeAttackRoll(mode)`).

**Bug corrigé au passage** : la fiche PNJ n'affichait pas du tout de colonne Portée dans son tableau d'armes (contrairement à la fiche personnage) — ce n'était pas un bug de sauvegarde de données comme initialement soupçonné (`hasPortee`/`portee` étaient bien enregistrés), juste une colonne manquante côté template PNJ.

---

### CA des monstres masquée aux joueurs

Deux fuites distinctes corrigées :
1. **Fiche PNJ** : le champ CA n'est éditable/visible que si `game.user.isGM` — sinon une icône verrouillée s'affiche à la place.
2. **Fuite plus sournoise, dans le chat** : `buildAttackFlavor()` (`helpers/rolls.mjs`) insérait `(CA {valeur})` en clair dans le texte du message d'attaque dès qu'une cible était targetée — visible par **tous** les joueurs, pas seulement le MJ, à chaque jet d'attaque contre un monstre. Corrigé : le nombre exact n'apparaît que si c'est le MJ qui a lancé le jet, ou si la cible est un personnage joueur (dont la CA n'est pas un secret) ; le résultat Touché/Manqué reste toujours visible.

---

### Bug majeur découvert — l'éditeur de texte riche (`{{editor}}`) n'a jamais fonctionné sous ApplicationV2

En creusant un signalement "impossible de modifier la description d'un équipement", découverte que le helper Handlebars legacy `{{editor}}` produit un balisage (`.editor` / `.editor-edit` / `.editor-content`) qui n'est activé **que** par les fiches `FormApplication` v1 (confirmé : seul `appv1/api/form-application-v1.mjs` câble un listener sur `.editor-edit` dans tout le client Foundry). `DocumentSheetV2` — utilisé par **toutes** les fiches de ce système — ne l'active jamais : le bouton crayon existait visuellement mais ne faisait rigoureusement rien. Bug systémique, présent depuis la migration vers ApplicationV2, sur **tous** les champs de texte riche du système (descriptions d'objets, historique, background, notes MJ...), pas seulement celui initialement signalé.

**Correctif** : remplacement de `{{editor}}` par l'élément natif `<prose-mirror>` (que `DocumentSheetV2` sait nativement lire/sauvegarder, confirmé dans `client/applications/api/document-sheet.mjs`), via un nouveau helper Handlebars `richEditor` (`antique.mjs`) supportant en option un mode `toggled` (aperçu HTML enrichi par défaut + activation à la demande) pour les champs consultés plus souvent qu'édités. Appliqué sur les **23 occurrences** du système (toutes fiches d'objets + personnage + PNJ + divinité).

**Point d'attention utilisateur** : contrairement à un simple `<input>`, la sauvegarde du contenu ProseMirror nécessite **Ctrl+S ou le bouton dédié de la barre d'outils** — cliquer ailleurs ne suffit pas (comportement standard Foundry, pas une régression).

**Fichiers** : `antique.mjs` (helper), `module/sheets/actor-sheet.mjs` (calcul du HTML enrichi), toutes les fiches `templates/actor/*.hbs` et `templates/item/*.hbs`.

---

### Onglet Background — refonte du BG (Alliés/Ennemis/groupes)

Plusieurs demandes traitées en plusieurs passes, avec un aller-retour sur la case "Neutre" :

- **Glisser-déposer un acteur dans le BG** et **création de groupe cassée** : même cause que le bug récurrent ci-dessus (re-render manquant après `_onDropActor` et sur les 5 actions de groupe) — corrigé.
- **Case "Neutre" ajoutée puis retirée** : d'abord implémentée comme 3ᵉ section complète (miroir d'Alliés/Ennemis avec sa propre liste/groupes/texte libre), refactorisée en un **partial Handlebars commun** (`templates/actor/parts/actor-ref-section.hbs`) pour éviter de tripler le code. Un bug de profondeur de contexte Handlebars (`../` vs `../../` dans les `{{#each}}` imbriqués) a été détecté et corrigé via un test de compilation Handlebars **hors-ligne**, en réutilisant la copie de Handlebars embarquée par Foundry lui-même (utile en l'absence d'accès direct au monde Foundry à ce moment de la session). Puis, sur demande explicite, **tout le bloc Neutre a été retiré** (schéma, template, mapping des groupes) au profit d'une meilleure solution :
- **Entrées manuelles dans Alliés/Ennemis** : nouveau bouton "+" qui ouvre une invite de nom et ajoute une entrée **non liée à un acteur réel** (uuid synthétique `manual-<id>`), mais qui se comporte à l'identique des entrées liées à un acteur : commentable, déplaçable dans un groupe, supprimable — la logique existante de résolution (`_resolveActorRefs`) gérait déjà nativement le cas "acteur introuvable" (fallback sur le nom/image générique), simplement fiabilisé avec un `try/catch` autour de `fromUuid()` pour ne jamais planter sur un uuid non standard.
- **Accordéon sur les groupes** : chaque groupe (Alliés/Ennemis) peut être replié/déplié indépendamment (classe `.collapsed`, caret pivotant).
- **Croyance / Aime / N'aime pas / Expressions** : remplacé l'édition permanente par un aperçu en lecture seule (HTML enrichi) + bouton crayon ouvrant une **petite fenêtre dédiée** (`DialogV2` avec un `<prose-mirror>` créé dynamiquement dans le callback `render`) plutôt qu'un simple toggle inline — pattern différent du "aperçu togglable" initialement tenté sur Aime/N'aime pas, finalement remplacé par cette popup pour les 4 champs par cohérence. Histoire (le champ principal) reste volontairement toujours éditable en place, non concernée par ce changement.
- Zone de texte libre retirée des boîtes Alliés/Ennemis (redondante avec les entrées structurées).

**Fichiers** : `module/data-models/actor-character.mjs`, `module/sheets/actor-sheet.mjs`, `templates/actor/character-sheet.hbs`, `templates/actor/parts/actor-ref-section.hbs` (nouveau), `antique.mjs`, `css/antique.css`, `lang/{fr,en}.json`.

---

### Retouches diverses (batch de fin de session)

- **"Avantage Temporaire" renommé "Avantage"** dans le badge d'en-tête (et dans le nom de l'ActiveEffect généré, désormais localisé au lieu d'être codé en dur).
- **Images non mises à l'échelle** : `object-fit: cover` ajouté partout où il manquait (portrait d'objet, icônes d'armes/effets/traits dans les listes, icônes d'avantages/désavantages dans l'en-tête) — évite la déformation des images non carrées.
- **Champ Déplacement** : nouveau `system.deplacement` (9m par défaut), visible dans l'onglet Identité (avec suffixe "m" à droite du champ) et dans l'onglet Combat.
- **Compétences** : le TOTAL est mis en avant (agrandi, gras) plutôt que le bonus modifiable (réduit, discret, n'apparaît clairement qu'au survol/focus) — inversion volontaire de la hiérarchie visuelle.
- **Largeur des blocs de compétences** : passé de 2 colonnes fixes à `repeat(auto-fit, minmax(220px, 320px))` avec `justify-content: start` — jusqu'à 3 blocs côte à côte sur fenêtre large, jamais plus large que 320px chacun.
- **Nouvelle palette des caractéristiques** : rouge foncé (FOR), bleu foncé (DEX), magenta foncé (CON), jaune clair (INT), vert foncé (AST), cyan foncé (CHA) — appliquée aux couleurs de texte/bordure **et** aux fonds de bloc/ligne entraînée (ces derniers utilisaient des valeurs RGB codées en dur séparément, oubliées lors d'une première passe puis corrigées).
- **Bloc Sauvegardes** déplacé du haut vers le bas de l'onglet Compétences (peu utilisé selon l'utilisateur).
- **Label "Équipement porté" invisible** : `<h2>` sans classe héritait du blanc par défaut de Foundry sur fond clair — rattaché aux règles de couleur partagées des autres titres de section.

---

### Colonne "Att Bonus (Distance)" dans le tableau d'armes

Ajoutée dans l'onglet Combat, sur la fiche personnage **et** la fiche PNJ (même structure de tableau) : affiche `weapon.system.attBonusDistance` quand l'arme a une portée (`hasPortee`), sinon `—` (même convention que la colonne Portée). Le champ existait déjà dans le modèle de données et alimentait déjà le choix mêlée/distance au moment du jet (dialogue `DialogV2` dans `item.mjs`) — il manquait juste sa visibilité dans le tableau.

**Fichiers** : `templates/actor/character-sheet.hbs`, `templates/actor/npc-sheet.hbs`.

---

### Audit de la todo-list (lecture seule) + garde-fou contre le double jet d'attaque

Avant de continuer à traiter la todo-list, un audit en lecture seule (agent dédié) a comparé 23 items de la liste utilisateur à l'état réel du code — les coches "done"/"[X]" du fichier texte ne sont pas fiables (édité indépendamment par l'utilisateur entre les sessions). Résultat : la quasi-totalité est déjà en place (tableau bonus d'attaque 4 colonnes avec nom de carac, calcul carac-si-entraînée, palette de couleurs, police Cinzel, tailles de police, mise en avant du TOTAL des compétences, ordre natation/escalade/vigueur, catégorie combat à deux mains, etc.). Points restés ouverts :

- **"Charger en async la barre des favoris"** : aucun concept de "barre de favoris" n'existe dans le système actuel — item probablement obsolète/superseded, à clarifier avec l'utilisateur avant d'implémenter quoi que ce soit.
- **"Ajouter des colonnes sur le haut de la fiche"** : l'en-tête est en lignes flex empilées, pas en grille de colonnes explicite — vague, probablement superseded par les retouches CSS ultérieures.
- **Glaive sans portée affichée** : la donnée source du compendium (`packs/armes.db`) est correcte (`portee: 1.5, hasPortee: true`). Le bug rapporté concerne donc vraisemblablement une copie déjà présente sur un acteur du monde (antérieure au correctif, les copies d'objets sur un acteur ne se resynchronisent pas automatiquement avec le compendium) — pas vérifiable ni corrigeable sans accès au monde Foundry en direct (indisponible cette session, le monde actif étant Mer des Pirates).
- **"Guerrier Aguerri" lance deux fois les dés** : toujours non reproduit directement, mais l'audit a identifié un risque structurel plausible : `actor-sheet.mjs` rebranche tous ses écouteurs (dont `.weapon-attack`) dans `_onRender` (appelé à CHAQUE rendu) plutôt que `_onFirstRender` — un pattern déjà connu pour causer une accumulation d'écouteurs sur [[project-sea-of-thieves]] quand le nœud DOM persiste entre deux rendus. Plutôt que de refactoriser tout le système de binding sur une hypothèse non confirmée, un garde-fou ciblé et à faible risque a été ajouté directement dans `AntiqueItem#rollAttack()` (`module/documents/item.mjs`) : un flag `_rollingAttack` empêche toute exécution concurrente/rapprochée de la méthode, quelle que soit la cause exacte d'un double déclenchement.

**Fichiers** : `module/documents/item.mjs`.

---

## Session du 8 juillet 2026 — Vraie cause du bug de sauvegarde/re-render trouvée et corrigée

### Contexte
Reprise du bug non résolu depuis plusieurs sessions : modifier une caractéristique (ou tout autre champ) ne mettait à jour ni la valeur ni les modificateurs affichés. Les tentatives précédentes (`_processSubmitData` override, suppression du `handler`) partaient d'une hypothèse fausse (contexte `this` non garanti) et n'ont jamais traité la vraie cause.

Diagnostic mené en lisant directement le vrai code source client Foundry v14 (`D:\FoundryVTT\Foundry Virtual Tabletop\resources\app\client\`), puis en instrumentant temporairement `actor-sheet.mjs` avec des `console.log` pour observer les données réellement soumises.

---

### Cause racine n°1 — `<form>` imbriqué dans les 10 templates de fiches

Tous les templates (`character-sheet.hbs`, `npc-sheet.hbs`, `deity-sheet.hbs`, et les 7 templates d'item) commençaient par leur propre `<form class="antique sheet ...">...</form>`. Or en Foundry v14, `DocumentSheetV2.DEFAULT_OPTIONS.tag = "form"` fait déjà de l'élément racine de l'application un vrai `<form>`. Le `<form>` du template créait donc un **formulaire imbriqué**.

Le mécanisme de soumission (`FormDataExtended`) collecte les champs via `form.elements` (propriété native du `<form>` DOM), qui ne renvoie que les éléments dont le **formulaire propriétaire** est ce `<form>` précis. Comme tous les champs du template (`name="system.abilities.*"`, compétences, sauvegardes, etc.) étaient descendants du `<form>` intérieur, leur propriétaire était ce formulaire imbriqué — invisible pour `this.form.elements` (qui pointe vers le `<form>` extérieur, celui de l'application). Résultat : `document.update()` s'exécutait "avec succès" mais avec un diff vide ou quasi vide (seuls les champs `data-edit`, captés via `querySelectorAll` et non `form.elements`, passaient).

**Correctif** : remplacement du `<form ...>`/`</form>` racine par `<div ...>`/`</div>` dans les 10 templates (mêmes classes CSS conservées, `autocomplete="off"` retiré car sans effet sur un div).

Fichiers modifiés :
- `templates/actor/character-sheet.hbs`
- `templates/actor/npc-sheet.hbs`
- `templates/actor/deity-sheet.hbs`
- `templates/item/{weapon,equipment,advantage,disadvantage,blessing,spell,effect}-sheet.hbs`

---

### Cause racine n°2 — `context.actor` / `context.item` jamais transmis au template

Une fois le formulaire imbriqué corrigé, une nouvelle erreur est apparue : `DataModelValidationError: name: may not be undefined`. Diagnostic (log de `formData.object`) : le champ `name` était soumis comme chaîne **vide**, alors que le personnage a un nom réel.

Cause : ni `ApplicationV2._prepareContext()` (base), ni `DocumentSheetV2`, ni `ActorSheetV2`/`ItemSheetV2` de Foundry ne définissent `context.actor`/`context.item` par défaut. Le `_prepareContext()` de chaque fiche Antique ajoutait `context.system`, `context.config`, etc., mais jamais `context.actor` (ou `context.item`) — alors que les templates utilisent `{{actor.name}}`, `{{actor.img}}`, `{{item.xxx}}` directement. Ces expressions s'évaluaient silencieusement en chaîne vide (comportement Handlebars sur `undefined`), ce qui a toujours été le cas — invisible tant que le formulaire imbriqué empêchait toute vraie soumission. Une fois le formulaire réparé, soumettre `name: ""` a fait échouer la validation Foundry (`blank: false` sur le champ `name` du schéma de base).

**Correctif** : ajout de `context.actor = this.actor;` dans `_prepareContext()` de `actor-sheet.mjs`, `npc-sheet.mjs`, `deity-sheet.mjs`, et `context.item = this.item;` dans `item-sheet.mjs`.

### Résultat
**Fonctionnel.** Confirmé par test utilisateur : modification d'une caractéristique → valeur ET modificateurs se mettent à jour correctement.

### Note pour la suite
Les fiches Deity et les 7 types d'Item n'ont pas encore été testés individuellement après ce correctif (seuls Personnage et PNJ l'ont été), mais ils présentaient exactement le même double défaut et ont reçu le même correctif. À vérifier lors d'une prochaine session si un souci apparaît sur l'un d'eux.

Les overrides `_processSubmitData` (forçant `this.render({force:true})`) ajoutés lors de sessions précédentes sur les 4 fiches d'acteur/item restent en place mais sont probablement redondants maintenant que le vrai problème est réglé (Foundry re-render automatiquement après un `document.update()` réussi). Non retirés par prudence — un nettoyage possible dans une session future une fois le fonctionnement confirmé plus largement.

---

### Correctif complémentaire — Modificateur de caractéristique PNJ non calculé automatiquement

En testant la vraie fiche PNJ (`AntiqueNpcSheet`, à distinguer d'un acteur de type "Personnage" nommé de façon similaire — piège rencontré pendant cette session), la valeur de caractéristique se mettait bien à jour mais pas son modificateur.

Cause : `actor-npc.mjs` avait `prepareDerivedData() { /* NPC has no auto-derived data — all values are manual */ }` — contrairement à `actor-character.mjs` qui calcule `mod = Math.floor((value - 10) / 2)`. Le template `npc-sheet.hbs` exposait aussi `mod` comme un `<input>` éditable manuellement plutôt qu'un champ calculé en lecture seule.

Décision utilisateur : aligner le comportement PNJ sur celui du personnage (auto-calcul), plutôt que garder un champ manuel.

**Correctif** :
- `module/data-models/actor-npc.mjs` : `prepareDerivedData()` calcule maintenant `mod` depuis `value` (même formule que le personnage).
- `templates/actor/npc-sheet.hbs` : le `<input name="system.abilities.{{key}}.mod">` remplacé par `<span class="ability-mod-value">{{signedNum ability.mod}}</span>` (lecture seule, même classe CSS que la fiche personnage).

### Résultat final
**Fonctionnel** sur les fiches Personnage et PNJ, confirmé par test utilisateur sur les deux.

---

## Session du 30 juin 2026 — Correctif re-render `submitOnChange` (4 sheets)

### Contexte
Reprise du problème ouvert de la session précédente : modifier une valeur de caractéristique ne mettait pas à jour les modificateurs/totaux affichés malgré `submitOnChange: true`.

---

### Correctif — `_processSubmitData` override (actor-sheet, npc-sheet, item-sheet, deity-sheet)

#### Cause racine
Le `handler` défini dans `DEFAULT_OPTIONS.form` est une propriété `function` statique. En Foundry v14 AppV2, le contexte `this` à l'intérieur de ce handler n'est **pas garanti** d'être l'instance de la sheet — Foundry peut l'appeler sans `.call(this, ...)`. La donnée était bien sauvegardée (mécanisme de fallback Foundry), mais `this.render({ force: true })` ne s'exécutait pas dans le bon contexte.

#### Solution
Suppression du `handler` dans `DEFAULT_OPTIONS.form`. Override de `_processSubmitData` en méthode d'instance (contexte `this` garanti) sur les 4 sheets :

```javascript
async _processSubmitData(event, form, formData) {
  await super._processSubmitData(event, form, formData);
  this.render({ force: true });
}
```

`super._processSubmitData()` effectue le `document.update()` standard de Foundry, puis on force le re-render. Les valeurs calculées (modificateurs de caractéristiques, totaux de compétences, etc.) s'affichent désormais correctement après toute modification de formulaire.

#### Fichiers modifiés
- `module/sheets/actor-sheet.mjs`
- `module/sheets/npc-sheet.mjs`
- `module/sheets/item-sheet.mjs`
- `module/sheets/deity-sheet.mjs`

#### Résultat
**Non fonctionnel.** `_processSubmitData` n'est peut-être pas le bon nom de méthode en Foundry v14 AppV2 — ou la méthode parent n'existe pas, ce qui ferait échouer silencieusement le `super._processSubmitData()`.

---

### À investiguer demain

1. **Trouver le vrai nom de la méthode** dans le source Foundry v14 — candidats : `_onSubmitForm`, `_onChangeForm`, `_processSubmitData`. Chercher dans `foundry.js` (fichier core servi par l'app Foundry, pas dans le dossier Data).
2. **Piste alternative — `Hooks.on("updateActor")`** : enregistrer le hook dans `_onFirstRender` avec cleanup dans `close()` :
   ```javascript
   _onFirstRender(context, options) {
     // ...existing code...
     this._updateHookId = Hooks.on("updateActor", (actor) => {
       if (actor.id === this.actor.id) this.render({ force: true });
     });
   }
   async close(options = {}) {
     Hooks.off("updateActor", this._updateHookId);
     return super.close(options);
   }
   ```
3. **Piste alternative — listeners manuels** : désactiver `submitOnChange`, ajouter des listeners `change` sur tous les inputs dans `_onRender` qui appellent `actor.update()` + `render({ force: true })` directement (pattern identique au toggle compétences qui fonctionne).

---

## Session du 28–29 juin 2026 — Toggle compétences entraînées & re-render AppV2

### Contexte
Foundry v14 AppV2 : les valeurs calculées (modificateurs, totaux) ne se rafraîchissent pas visuellement après `actor.update()` ou `submitOnChange`. Problème systémique à toutes les fiches.

---

### Correctif 1 — `ContextMenuEntry#name` deprecated
Remplacement de `name:` → `label:` dans tous les menus contextuels :
- `module/sheets/actor-sheet.mjs` (4 entrées)
- `module/helpers/random-tables.mjs` (2 entrées)

---

### Correctif 2 — Toggle compétences entraînées (losange)

#### Problème
Clic sur le losange (icône compétence entraînée) ne produisait aucun effet visuel ni mise à jour de valeur.

#### Cause racine
Plusieurs étapes de diagnostic :
1. Les fichiers n'étaient pas déployés dans `D:\AppDataFoundry$\` → aucune modification visible
2. `ui.notifications` non fonctionnel dans ce setup → diagnostic via `console.log` uniquement
3. `actor.update()` appelé depuis un click handler **ne déclenche pas de re-render** en v14 AppV2

#### Solution finale (`module/sheets/actor-sheet.mjs`)
L'`<input type="checkbox">` a été remplacé par `<button type="button" class="skill-trained" data-skill="...">` dans le template HBS pour éviter l'interférence du système de formulaire Foundry.

Pattern dans `_onRender` :
```javascript
this.element.querySelectorAll(".skill-trained").forEach(el => {
  el.addEventListener("click", ev => {
    const key = ev.currentTarget.dataset.skill;
    const current = this.actor.system.skills[key]?.trained ?? false;
    const newTrained = !current;
    // Feedback visuel immédiat
    ev.currentTarget.closest(".skill-row")?.classList.toggle("trained", newTrained);
    // Sauvegarde + re-render forcé
    this.actor.update({ [`system.skills.${key}.trained`]: newTrained })
      .then(() => this.render({ force: true }));
  });
});
```

CSS : la classe `.trained` sur le `<li class="skill-row">` pilote le `::before` losange et son état rempli/vide.

---

### Correctif 3 — Slash command `/deploy`

Créé `.claude/commands/deploy.md` : commande Claude Code qui copie tout `C:\projet\VTT_Foundry\antique\` vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` et rappelle le `Ctrl+Shift+F5`.

---

### Correctif 4 — Re-render après `submitOnChange`

#### Cause racine
Le `handler` défini dans `DEFAULT_OPTIONS.form` est une `function` statique. En Foundry v14 AppV2, le contexte `this` à l'intérieur de ce handler n'est pas garanti d'être l'instance de la sheet — Foundry peut l'appeler sans `.call(this, ...)`. La donnée était sauvegardée (via un mécanisme de fallback Foundry), mais le `this.render()` ne s'exécutait pas correctement.

#### Solution (`module/sheets/actor-sheet.mjs`, npc-sheet, item-sheet, deity-sheet)
Suppression du `handler` dans `DEFAULT_OPTIONS.form`. Override de `_processSubmitData` en méthode d'instance (garantie d'avoir `this` correct) :

```javascript
async _processSubmitData(event, form, formData) {
  await super._processSubmitData(event, form, formData);
  this.render({ force: true });
}
```

`super._processSubmitData()` effectue le `this.document.update()` par défaut, puis on force le re-render. Pattern appliqué aux 4 sheets.

---

## Session du 23 juin 2026 — Correctif onglets item-sheet

### Problème
`item-sheet.mjs` avait deux bugs liés aux onglets en v14 :
1. **Group mismatch** : `DEFAULT_OPTIONS.tabs` déclarait `group: "main"` alors que tous les templates utilisent `data-group="primary"`
2. **Même bug v14** que les actor/npc-sheets : le système d'onglets interne de Foundry AppV2 est cassé en v14

Résultat : les onglets "Description" / "Effets" ne fonctionnaient pas dans aucune fiche d'item (arme, équipement, avantage, désavantage, bénédiction, sort, effet).

### Correctif appliqué (`module/sheets/item-sheet.mjs`)
- `DEFAULT_OPTIONS.tabs` → `[]`
- Ajout de `_activateTab(tabName)` (même pattern que actor-sheet et npc-sheet)
- Gestion manuelle dans `_onRender` : initialisation sur `"description"`, listeners `click` sur les boutons d'onglets

---

## Session du 21–22 juin 2026 — Migration Foundry v14 & correctifs CSS

### Contexte
Mise à jour vers Foundry VTT **Release 14.364** (API v14). Résolution de tous les warnings de dépréciation et correctifs visuels.

---

### Correctifs de dépréciation Foundry v14

#### `antique.mjs`
- `Actors` → `foundry.documents.collections.Actors`
- `Items` → `foundry.documents.collections.Items`
- Affecte `unregisterSheet` et `registerSheet`

#### `module/sheets/actor-sheet.mjs`
- `ContextMenu` : ajout de `{ jQuery: false }` en 4e argument sur les deux constructeurs (`_onFirstRender`)
- `condition:` → `visible:` dans les entrées du menu contextuel des compétences (Ajouter/Retirer favoris)
- Système d'onglets cassé en v14 → gestion manuelle complète via `_activateTab()` + `this._activeTab` dans `_onRender`. `DEFAULT_OPTIONS.tabs = []`

#### `module/sheets/npc-sheet.mjs`
- Même correction onglets que actor-sheet

#### `module/helpers/random-tables.mjs`
- `li.data("pack")` → `li instanceof HTMLElement ? li.dataset.pack : li.data?.("pack")`
- `table.sheet.render(true)` → `table.sheet.render({force: true})`

---

### Correctifs CSS — En-têtes de tables sombres (Foundry v14)

Foundry v14 injecte un fond sombre sur les `<th>`. Correction appliquée sur toutes les tables :

**Règle appliquée à tous les `th` :**
```css
color: var(--antique-cream) !important;
background: var(--antique-brown) !important;
```

**Tables concernées :**
- `.attack-table th` — onglet Combat
- `.weapons-list th` — onglet Combat + NPC
- `.item-list th` — onglet Inventaire (équipement PC + NPC)
- `.traits-table thead th` — onglet Traits (avantages, désavantages, sorts)

**Cellules `<td>` et `<tr>` :**
```css
color: var(--antique-dark) !important;
background: transparent !important;
```

---

### Correctifs CSS — Divers

#### Nom du personnage (`.charname`)
- Suppression de `overflow: hidden` qui coupait le champ en hauteur
- Ajout : `height: auto`, `line-height: normal`, `margin: 0`, `padding: 0`
- Sur l'input : `height: auto`, `line-height: 1.3`, `padding: 2px 0`

#### Scrollbar onglet Caract. & Comp.
- `.antique.sheet` : `display: flex; flex-direction: column; height: 100%`
- `.antique .sheet-body` : `flex: 1; min-height: 0; overflow-y: auto`

---

### Icônes losange pour les compétences

#### Historique des tentatives

**Tentative 1 — carré avec SVG checkmark (background-image)**
`appearance: none` + `transform: rotate(45deg)` sur l'`<input>` directement.
❌ Foundry v14 ré-applique son propre rendu de checkbox par-dessus, icône native visible.

**Tentative 2 — `::before` comme flex item + checkbox en position absolue**
Le `::before` était dans le flux flex (premier item visuel), le checkbox en `position: absolute` par-dessus.
❌ Le checkbox absolu ne recevait pas les clics : les autres flex items bloquaient malgré `z-index: 2`.

**Tentative 3 — checkbox en `position: absolute` invisible, `::before` en flux**
Inverse de la tentative 2.
❌ Même problème : les éléments de la liste en flux étaient devant le checkbox absolu.

#### Solution finale (fonctionnelle)

Principe : séparer complètement le rôle visuel et le rôle fonctionnel.

- **Checkbox `<input>`** : reste dans le **flux flex** (prend son espace 12×12px), `opacity: 0`, `z-index: 2`, `position: relative` → invisible mais cliquable, aucune interférence de rendu Foundry possible
- **Losange `::before`** sur le `<li.skill-row>` : `position: absolute` aligné sur la zone du checkbox, `pointer-events: none` → purement visuel, ne capte jamais les clics
- **État actif/inactif** : piloté par la classe `.trained` sur le `<li>` (Foundry la met à jour lors du re-render), pas par `:checked` sur l'input

```css
/* .skill-row */ position: relative;

/* Checkbox — fonctionnel uniquement */
.antique .skill-row .skill-trained {
  -webkit-appearance: none; appearance: none;
  flex-shrink: 0; width: 12px; height: 12px;
  opacity: 0; cursor: pointer;
  position: relative; z-index: 2;
}

/* Losange — visuel uniquement */
.antique .skill-row::before {
  content: ""; position: absolute;
  top: 50%; left: 2px;
  width: 10px; height: 10px;
  transform: translate(1px, -50%) rotate(45deg);
  border: 1.5px solid var(--antique-border);
  background: var(--antique-cream);
  pointer-events: none; z-index: 1;
}
.antique .skill-row.trained::before {
  background: var(--antique-dark);
  border-color: var(--antique-dark-gold);
}
```

#### Icônes de compétence (`.skill-icon`)
- Taille : `0.9em` → `1em`, largeur : `14px` → `16px`
- Espacement : `margin-right: 2px` sur l'icône

---

### Responsive (container queries)

Activation : `container-type: inline-size; container-name: antique-sheet` sur `.antique.sheet`

| Largeur | Changements |
|---------|-------------|
| ≤ 650px | Marges réduites, identity grid 3 col, saves wrapent, background 1 col |
| ≤ 480px | Header empilé, identity grid 2 col, abilities en rangée horizontale, onglets compacts |

Tables toujours scrollables horizontalement via `overflow-x: auto` sur `.weapons-section`, `.equipment-section`, `.traits-section`, `.combat-section`.

---

### Fichiers modifiés

| Fichier | Type de changement |
|---|---|
| `antique.mjs` | Dépréciation globals Actors/Items |
| `module/sheets/actor-sheet.mjs` | Onglets, ContextMenu jQuery + condition→visible |
| `module/sheets/npc-sheet.mjs` | Onglets |
| `module/helpers/random-tables.mjs` | jQuery li.data, render(true) |
| `css/antique.css` | En-têtes tables, charname, scrollbar, losanges, responsive |

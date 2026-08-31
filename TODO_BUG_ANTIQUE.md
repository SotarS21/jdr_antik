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

## 3. Sorts / Rituels — ingrédients et composants

- Pour un rituel qui a des ingrédients listés dans la description (`system.costText`), le coût et
  les ingrédients affichés ne doivent pas définir ce que le joueur possède ou non — c'est la partie
  "Ingrédients" (`system.ingredients`, onglet dédié) qui doit faire foi. Actuellement les deux
  mécanismes coexistent (voir `JOURNAL.md`, session du 16 août 2026) mais semblent se marcher dessus
  côté possession/disponibilité.
- Vérifier l'utilité réelle du champ "composant" (à date, pas clair s'il sert encore à quelque
  chose ou s'il est redondant avec les ingrédients).
- Quand un sort est lancé (`castSpell()`), re-cocher automatiquement les ingrédients correspondants
  dans la partie Ingrédients de l'édition du sort, pour rester synchronisé avec le stock réel après
  décompte.

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

---

## Notes techniques générales

- Fichiers concernés dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) —
  redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque
  changement, puis Ctrl+Shift+F5 avant de tester.
- Pas d'accès navigateur dans cet environnement : tout changement UI passe par une relecture
  statique (voir mémoire `no-browser-access`) suivie d'un test manuel par l'utilisateur dans
  Foundry.

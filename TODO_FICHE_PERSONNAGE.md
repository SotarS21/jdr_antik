# Plan — Ajustements fiche Personnage (CSS/UX)

Session démarrée le 8 juillet 2026, à reprendre. **Aucune modification de code n'a encore été faite** pour ce chantier — uniquement de la recherche/lecture de code. Tout est encore à implémenter.

Référence visuelle fournie par l'utilisateur : `C:\projet\VTT_Foundry\projet_antique_system\exemple_de_mockup.png` (style gréco-antique, bandeau méandre en haut, badges circulaires colorés par caractéristique, losanges de maîtrise, palette bleu profond / or / parchemin).

---

## 1. Bouton d'édition d'objet cassé
**RÉSOLU DE LUI-MÊME** — confirmé par l'utilisateur le 8 juillet 2026 : "le bouton d'édition des objets fonctionne à nouveau". Probablement un souci passager (cache navigateur non vidé après un déploiement précédent). Plus de sujet à traiter ici.

---

## 2. Onglet Combat : afficher la caractéristique associée au bonus (ex: "FOR +2")
**Trouvé** : le code court existe déjà dans `lang/fr.json` (`ANTIQUE.Ability.For` = `"FOR"`, etc.) — pas besoin de créer de nouvelle clé de traduction.

Modification prévue :
- `module/sheets/actor-sheet.mjs`, dans `_prepareContext()`, section `weaponCatsData` : ajouter `abilityLabel: game.i18n.localize(ANTIQUE.abilities[cfg.ability])` à chaque entrée.
- `templates/actor/character-sheet.hbs`, colonne "Mod Carac" du tableau `.attack-table` : remplacer `{{signedNum cat.abilityMod}}` par `{{cat.abilityLabel}} {{signedNum cat.abilityMod}}` (ex: "FOR +2").

## 3. Onglet Combat : bonus d'attaque doit intégrer le bonus de compétence
**Trouvé** : actuellement `atk.total = atk.bonus + abilityMod` dans `actor-character.mjs::prepareDerivedData()` — le bonus de compétence associée (`skills[x].total`, qui inclut déjà le mod de carac + bonus + pénalité non-entraîné) n'est PAS utilisé du tout dans le calcul du bonus d'attaque. Les deux systèmes (compétences et bonus d'attaque) sont actuellement complètement déconnectés.

Mapping catégorie d'arme → compétence associée (clés à faire correspondre, PAS identiques partout) :
- `mainNue` → compétence `combatMainNue` (⚠ noms différents)
- `armeBlanche` → `armeBlanche` (même nom)
- `armeDeJet` → `armeDeJet` (même nom)
- `armeExotique` → `armeExotique` (même nom)
- `armeADistance` → `armeADistance` (même nom)

Modification prévue :
- `module/helpers/config.mjs` : ajouter `skill: "combatMainNue"` (etc.) à chaque entrée de `ANTIQUE.weaponCategories`.
- `module/data-models/actor-character.mjs::prepareDerivedData()` : calculer les compétences AVANT les bonus d'attaque (déjà le cas dans l'ordre actuel), puis pour chaque catégorie :
  ```js
  const linkedSkill = this.skills[catCfg.skill];
  atk.skillTotal = linkedSkill?.total ?? abilityMod;
  atk.total = atk.skillTotal + atk.bonus; // atk.bonus devient un bonus additionnel manuel (arme spécifique)
  ```
  **À valider avec l'utilisateur** : est-ce que `atk.bonus` (champ actuellement éditable dans le tableau) doit rester un bonus manuel additionnel, ou faut-il le supprimer complètement au profit du seul total de compétence ? Pas demandé explicitement — à clarifier avant d'implémenter pour éviter de casser un usage existant.

## 4. Sélecteur de munitions pour armes à distance
Demande utilisateur (réponse à la clarification) : dans la cellule munitions du tableau d'armes (`.munitions-cell`), si une munition est déjà liée (`weapon.linkedAmmoId` défini) → afficher la quantité restante (**déjà fait actuellement**). Si AUCUNE munition n'est liée → afficher un menu déroulant (`<select>`) pour en choisir une parmi l'équipement disponible, au lieu de rien afficher.

À vérifier : `module/data-models/items/item-weapon.mjs` pour le champ `linkedAmmoId`, et voir s'il existe déjà un mécanisme de liaison ailleurs (ex: dans la fiche d'objet arme) à réutiliser plutôt que dupliquer.

Modification prévue :
- `templates/actor/character-sheet.hbs`, dans `.munitions-cell`, ajouter un `<select>` (visible seulement si `weapon.system.consumable` et PAS `weapon.linkedAmmoName`) listant `context.equipment` (ou un sous-ensemble filtré, à définir — munitions vs équipement générique ?).
- `module/sheets/actor-sheet.mjs`, `_onRender()` : listener `change` sur ce nouveau select pour appeler `weaponItem.update({"system.linkedAmmoId": selectedId})`.

**À clarifier avec l'utilisateur** : le menu déroulant doit-il lister TOUT l'équipement, ou seulement l'équipement marqué `consumable` (munitions logiques) ?

---

## 5. Bandeau décoratif grec (méandre) en haut de la fiche
CSS fourni par l'utilisateur :
```css
.band {
    height: 24px;
    background: var(--meander) repeat-x;
    background-size: auto 24px;
    border-bottom: 1px solid var(--gold-deep);
    opacity: .95;
}
```
Référence visuelle : bandeau en haut du mockup, motif clé grecque doré sur fond sombre, pleine largeur, avant même le portrait/nom.

À faire :
- Créer le motif `--meander` : soit une image SVG inline en `background-image: url("data:image/svg+xml,...")` (le plus simple, pas de dépendance externe), soit un dégradé CSS répétitif approximant le motif (moins fidèle). **Recommandé : SVG inline data-URI**, à dessiner/générer.
- Ajouter `<div class="band"></div>` tout en haut de `templates/actor/character-sheet.hbs`, avant `.sheet-header`.
- Définir `--gold-deep` dans `:root` (probablement un ton plus foncé que `--antique-gold` actuel, à harmoniser avec la nouvelle palette du point 6).

## 6. Nouvelle palette de couleurs méditerranéenne
Palette fournie :
- Bleu Profond : `#1d5763`
- Or (Gold) : `#c39a3f`
- Fond Parchemin : `#f4eedf`
- Or Sombre / Bronze : `#9a7726`
- Parchemin Moyen : `#d9caa8`
- Parchemin Clair : `#ece2cd`

À faire : remplacer/étendre les variables `:root` dans `css/antique.css` (actuellement `--antique-gold: #c9a227`, `--antique-dark-gold: #8b6914`, `--antique-brown: #5c3d2e`, `--antique-dark: #2c1810`, `--antique-cream: #f5e6c8`, `--antique-parchment: #f0ddb8`, `--antique-light: #faf3e3`, `--antique-border: #8b7355`).

**Point à trancher avec l'utilisateur avant d'implémenter** : la palette actuelle est brun/or "terre cuite". La nouvelle palette introduit un bleu profond (`#1d5763`) qui n'a pas d'équivalent actuel — sert-il à remplacer `--antique-dark` (fond sombre, actuellement brun `#2c1810`) ou à devenir une nouvelle couleur d'accent (ex: badge CA comme dans le mockup où le badge CA est bleu-teal) ? Le mockup montre le bleu utilisé pour : les onglets (fond), le badge CA, les cercles de modificateur DEX. Proposition : `--antique-dark` → bleu profond pour les onglets/badges, garder brun pour le texte/bordures, OU introduire une variable séparée `--antique-teal: #1d5763` pour ces éléments précis sans tout remplacer. À valider.

## 7. Police Cinzel
`font-family: 'Cinzel', Georgia, serif;` à ajouter. Actuellement `.antique.sheet` utilise `"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`.
**Point technique à vérifier** : Cinzel n'est pas une police système — il faudra soit l'embarquer localement (fichier `.woff2` dans le système, déclaré via `@font-face`, pas de dépendance réseau — recommandé pour un usage hors-ligne fiable), soit charger depuis Google Fonts via `@import url(...)` dans `antique.css` (plus simple mais nécessite une connexion internet au moment du rendu). **Recommandation : télécharger et embarquer le fichier de police localement** (`css/fonts/Cinzel-*.woff2` + `@font-face`), pour éviter toute dépendance réseau en jeu.
Usage suggéré (à confirmer) : probablement pour les titres/labels (noms, en-têtes de section) plutôt que tout le texte courant (moins lisible en petite taille pour les compétences/valeurs).

## 8. Icônes de compétence : agrandir + espacer du losange
Actuellement (`css/antique.css` ~L829) : `.skill-icon { width: 16px; font-size: 1em; margin-right: 2px; }`. Le losange (`.skill-trained`) est un bouton de 12×12px juste avant. Augmenter la taille de `.skill-icon` (ex: 20px/1.2em) et augmenter l'espace entre le losange et l'icône (actuellement `gap: 4px` sur `.skill-row`, ou `margin-left` dédié sur `.skill-icon`).

## 9. Fond coloré par caractéristique pour compétences entraînées
Actuellement : `.skill-row.trained { background: rgba(201, 162, 39, 0.12); }` — couleur or fixe, peu importe la caractéristique. Il existe déjà des variables `--ability-for/dex/con/int/ast/cha` et des classes `.skill-group-for/dex/...` sur le groupe parent. Modification : cibler `.skill-group-for .skill-row.trained { background: rgba(196, 75, 44, 0.15); }` etc. pour chaque groupe (6 règles, une par caractéristique), en réutilisant les couleurs `--ability-*` déjà définies.

## 10. Rechargement indépendant de la barre des favoris
Actuellement : toggler un favori (`.favorite-chip-remove`, menu contextuel "Ajouter/Retirer favoris") appelle `this.actor.update(...)`, ce qui déclenche un re-render complet de la fiche (via le mécanisme normal `_onUpdate`). L'utilisateur veut une fonction dédiée qui ne recharge QUE la barre des favoris, sans re-render complet.

Approche envisagée :
- Extraire la génération du HTML de la barre favoris dans un template Handlebars partiel séparé (`templates/actor/parts/favorites-bar.hbs`), ou une fonction JS qui regénère juste ce fragment.
- Ajouter une méthode `_refreshFavoritesBar()` dans `actor-sheet.mjs` qui recalcule `context.favoriteSkills` (dupliquer la logique de `_prepareContext`) et ré-injecte seulement le HTML de `.favorites-bar` dans le DOM (`this.element.querySelector('.favorites-bar').outerHTML = ...` ou équivalent), sans passer par `this.render()`.
- Appeler `_refreshFavoritesBar()` à la place de `this.render({force:true})` spécifiquement dans les handlers qui touchent `favoriteSkills` (ajout/retrait favori).
**Non trivial** — nécessite de dupliquer ou factoriser la logique de rendu du template Handlebars pour un seul fragment. À creuser techniquement avant de s'engager (voir si Foundry expose un helper pour rendre un template Handlebars isolé côté client, ex: `foundry.applications.handlebars.renderTemplate()`).

## 11. Icônes de trait : fond plus sombre + marge 3-4px
Cible : `.header-trait-icon` (css ~L265). Actuellement pas de `background` défini explicitement sur l'icône elle-même (juste une bordure colorée selon avantage/désavantage). Ajouter un fond sombre (ex: `var(--antique-dark)` ou nouvelle teinte plus foncée que la palette actuelle) + `margin: 3px` ou `4px` sur `.header-trait-icon`.

## 12. Repositionner + rendre responsive les jets de sauvegarde
Actuellement `.saves-row` est une bande horizontale sous le panneau compétences (`css/antique.css` ~L621), déjà avec un peu de responsive (`@container` à 650px/480px). L'utilisateur veut : (a) changer sa position, (b) ajouter des "blocks en haut" pour la rendre responsive — proche du mockup où chaque sauvegarde/perception est une carte indépendante (`VIGUEUR (CON)`, icônes losange, input, badge total) plutôt qu'une ligne continue. **Interprétation à confirmer** : transformer `.saves-row` d'une ligne flex en une grille de cartes (comme les blocs `DÉFENSES & PERCEPTION` du mockup), qui wrap naturellement en responsive au lieu de dépendre de règles `@container` mangées à la main.

## 13. Tailles de police caractéristiques/compétences → 0.875em
- Caractéristiques (liste, valeurs) : cibler `.ability-label`, `.ability-score input`, `.ability-mod-value` dans `css/antique.css`.
- Compétences (liste) : `.skill-row` a déjà `font-size: 0.82em` — à monter à `0.875em`.
Simple ajustement de valeurs, faible risque.

---

## Notes techniques générales pour la reprise
- Tous les fichiers concernés se trouvent dans `C:\projet\VTT_Foundry\projet_antique_system\antique\` (source) — se rappeler de redéployer vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\antique\` après chaque changement (`Copy-Item ... -Force`), puis demander un **Ctrl+Shift+F5** avant de tester.
- CSS complet lu et disponible en contexte (`css/antique.css`, 2657 lignes) — structure connue : variables `:root` en haut, sections par onglet, media queries `@container antique-sheet` en bas de fichier.
- `module/helpers/config.mjs` contient tout le mapping caractéristiques/compétences/catégories d'armes/sauvegardes.
- Fichier `templates/actor/character-sheet.hbs` : structure des onglets confirmée (identity, abilities, combat, inventory, traits, magic conditionnel, background).

## Ordre d'implémentation suggéré pour la prochaine session
1. Ajustements CSS simples et sans ambiguïté (tailles de police, icônes compétences, fond coloré par carac, icônes de trait) — rapides, faible risque
2. Clarifier les points ouverts avec l'utilisateur (palette bleu vs brun, calcul bonus combat + compétence, périmètre du sélecteur de munitions, position exacte des sauvegardes)
3. Palette de couleurs + police Cinzel (impact visuel large, à faire une fois les couleurs validées)
4. Bandeau méandre (nécessite de dessiner/trouver un motif SVG)
5. Onglet Combat : label caractéristique + calcul lié aux compétences
6. Sélecteur de munitions
7. Rechargement indépendant de la barre des favoris (le plus complexe techniquement, à faire en dernier)

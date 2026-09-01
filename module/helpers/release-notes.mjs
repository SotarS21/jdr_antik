/**
 * Release notes shown to the GM when the system version changes between two
 * world loads (see version-check.mjs). Keep this in sync with CHANGELOG.md —
 * add one entry per version that should trigger the update dialog. Text is
 * French-only (this system has no English-facing audience).
 */
export const RELEASE_NOTES = {
  "0.6.54": {
    title: "Version 0.6.54 — 27 nouveaux Effets + 2 sauvegardes cassées corrigées",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : "Sang froid" (Volonté) et "Vif" (Réflexes) ne faisaient rien — même bug que Cuir de Héros (ciblaient un champ .base écrasé automatiquement). Corrigés vers le vrai champ.</li>
        <li><strong>Corrigé</strong> : 15 avantages avec un effet déjà fonctionnel (Sens aiguisé, Sens artistique, Pisteur, Peau dense, Protection d'Athéna, Colère de Zeus, Athlète, Cuir de Hero, Sang froid, Vif, Voix enchanteresse, Force de Poséidon, Corps d'Arès, Visée d'Apollon, Taille imposante) migrés vers le format Foundry moderne — supprime les avertissements de dépréciation en console, aucun changement de comportement en jeu.</li>
        <li><strong>Ajouté</strong> : 24 nouveaux Effets narratifs dans le compendium Effets, un par avantage restant (Beauté d'Aphrodite, Bon sens, Branchies de Poséidon, Chaleur d'Hestia, Chasse d'Artèmis, Commerçant, Don d'Hadès, Equilibre félin, Faveur, Fêtard, Guerrier Aguerri, Ivresse de Dionysos, Mains d'Hermès, Rage d'Arès, Respect d'Héra, Soin d'Apollon, Sommeil léger, Visage passe-partout, Vue d'Hécate, Ambidextrie, Ami des animaux, Casque d'Hadès, Charme d'Aphrodite, Chrono sens) — chacun lié depuis la description de son avantage, glissable directement.</li>
        <li><strong>Ajouté</strong> : Peau d'Hadès a maintenant un vrai effet mécanique (PV actuels ×2), en plus de sa description.</li>
        <li><strong>Ajouté</strong> : nouvel objet "Rations régénératrices de Déméter" (compendium Équipement, +10 PV à la consommation, bouton "Appliquer le soin" dans le chat) ; l'avantage Cuisine de Déméter a maintenant un lien "Générer une ration" dans sa description — cliquer poste un message de chat avec un lien vers la ration, que n'importe quel joueur peut glisser sur sa propre fiche pour en récupérer une copie.</li>
        <li>Après cette mise à jour, exécute (dans cet ordre) les macros GM : <code>_fix-migrate-advantage-effects-live.js</code>, <code>_fix-effets-simple-links-live.js</code>, <code>_fix-effet-peau-hades-live.js</code>, <code>_fix-cuisine-demeter-live.js</code> pour appliquer ces correctifs au compendium déjà déployé et aux copies déjà possédées par un acteur.</li>
      </ul>`
  },
  "0.6.53": {
    title: "Version 0.6.53 — Correctifs Effets + traits cliquables vers le chat",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : Cuir de Héros ne fonctionnait pas (ciblait system.saves.robustesse.base, un champ écrasé automatiquement — jamais réellement lu). Corrigé vers le vrai champ.</li>
        <li><strong>Ajouté</strong> : Cuir de Héros, Athlète et Connaissance d'Héphaistos ont maintenant un lien vers leur Effet directement dans leur description — glisser ce lien applique l'effet sans avoir à aller le chercher dans le compendium.</li>
        <li><strong>Ajouté</strong> : cliquer l'icône d'un Avantage, Désavantage, Bénédiction ou Malédiction envoie maintenant son image/titre/description au chat (comme c'était déjà le cas pour les sorts et l'équipement).</li>
        <li><strong>Corrigé</strong> : avertissements de dépréciation Foundry (mode numérique d'ActiveEffect) supprimés, plus un vieux bloc "Effets" mort et redondant retiré de l'onglet Traits.</li>
      </ul>`
  },
  "0.6.52": {
    title: "Version 0.6.52 — Simplification du compendium d'Effets",
    html: `
      <ul>
        <li><strong>Changé</strong> : le compendium "Effets" contient maintenant directement de vrais ActiveEffect Foundry, au lieu d'objets qui en contenaient un — plus simple, et le bonus/malus (ex. Connaissance d'Héphaistos : -2 CA) fait maintenant partie du vrai effet actif, plus d'un champ à part. Glisser l'effet directement sur la cible.</li>
        <li>Après cette mise à jour, relance le monde pour que Foundry recharge le compendium (nécessaire à chaque changement de ce type). Si un ancien objet "Effet" traîne sur un acteur de test, supprime-le à la main — ce type d'objet n'existe plus.</li>
      </ul>`
  },
  "0.6.51": {
    title: "Version 0.6.51 — Nouveau : compendium d'Effets (plomberie)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouveau compendium "Effets" — des objets glissables directement sur un PJ/PNJ (visibles sur le token et dans l'onglet Traits), indépendants de tout Avantage. 3 premiers exemples : Cuir de Héros (+2 Robustesse), Athlète (Déplacement ×2), Connaissance d'Héphaistos (réduit la CA d'une cible de 2, via un bouton dans le chat).</li>
        <li><strong>Corrigé</strong> : l'avantage "Athléte" disait "Capacité de déplacement x2" mais n'avait aucun effet mécanique — corrigé (macro fournie pour le compendium déjà déployé).</li>
      </ul>`
  },
  "0.6.50": {
    title: "Version 0.6.50 — Esquive et Parade en réaction, dans l'onglet Combat",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : boutons Esquive et Parade dans l'onglet Combat (fiche Personnage et PNJ, à côté du Déplacement) — tout le monde peut tenter la réaction, plusieurs fois par tour. Que le jet réussisse ou non, il coûte -1 temporaire à la compétence utilisée (cumulatif ce tour-ci), remis à zéro automatiquement au début du tour suivant de l'acteur (grâce au tracker de combat).</li>
      </ul>`
  },
  "0.6.49": {
    title: "Version 0.6.49 — Listes déroulantes des fiches d'objet mieux affichées",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : sur les fiches d'objet (emplacement, catégorie, compétence liée...), les listes déroulantes n'avaient pas de largeur définie et pouvaient déborder du cadre sur une fenêtre étroite au lieu de partager l'espace avec leur label.</li>
      </ul>`
  },
  "0.6.48": {
    title: "Version 0.6.48 — Éditeurs de texte plus grands, certains s'agrandissent avec la fenêtre",
    html: `
      <ul>
        <li><strong>Amélioré</strong> : la hauteur minimale des zones de texte riche (descriptions, notes, historique) est passée à 300px. Sur les fiches Objet, Personnage (onglet Notes) et PNJ (onglets Statistiques et Notes), ces zones s'agrandissent désormais pour remplir l'espace disponible quand la fenêtre est plus grande.</li>
        <li>L'historique (onglet Background) garde son minimum à 300px mais ne s'agrandit pas davantage — c'est une grille à deux colonnes, pas une simple colonne comme les autres onglets, une restructuration plus risquée à faire sans accès navigateur direct.</li>
      </ul>`
  },
  "0.6.47": {
    title: "Version 0.6.47 — Réorganiser les favoris",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : les compétences favorites peuvent désormais être réordonnées en glissant une puce sur une autre dans la barre de favoris.</li>
      </ul>`
  },
  "0.6.46": {
    title: "Version 0.6.46 — Glisser une compétence ou une arme vers les macros",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : glisser-déposer une compétence (fiche Personnage) ou une arme (n'importe quelle fiche) vers la barre de macros crée désormais un raccourci qui lance directement le jet correspondant, au lieu d'ouvrir la fiche de l'objet.</li>
      </ul>`
  },
  "0.6.45": {
    title: "Version 0.6.45 — Correctif urgent : erreur de validation à la sauvegarde d'un PNJ",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : modifier n'importe quel champ d'un PNJ (rapporté sur "Praticien de la magie") pouvait faire échouer la sauvegarde ("ca/initiative/attaque : must be a number"), à cause de la CA/Initiative/Bonus d'attaque dupliquées entre l'onglet Statistiques et le nouvel onglet Combat (v0.6.43). Régression introduite dans cette même session, corrigée avant de continuer.</li>
      </ul>`
  },
  "0.6.44": {
    title: "Version 0.6.44 — Onglet Combat des PNJ, réservé au MJ",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : l'onglet Combat de la fiche PNJ affiche désormais un tableau de bonus d'attaque par catégorie (Main nue, Arme blanche, Arme de jet, Arme exotique, Combat à deux mains, Arme à distance), modifiable par le MJ, en plus du rappel CA/Initiative/Déplacement et du tableau d'armes.</li>
        <li><strong>Changé</strong> : l'onglet Combat de la fiche PNJ n'est désormais visible que par le MJ — les joueurs qui possèdent/contrôlent un PNJ n'y ont plus accès (les autres onglets restent inchangés).</li>
      </ul>`
  },
  "0.6.43": {
    title: "Version 0.6.43 — Onglet Combat des PNJ complété",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : la CA, l'Initiative, le Déplacement et le Bonus d'attaque sont désormais visibles (et modifiables) directement dans l'onglet Combat de la fiche PNJ, en plus de l'onglet Statistiques. Nouveau champ Déplacement pour les PNJ (9m par défaut).</li>
      </ul>`
  },
  "0.6.42": {
    title: "Version 0.6.42 — Le glisser-déposer d'objets s'empile enfin",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : glisser-déposer une arme ou un équipement (depuis le Navigateur, un autre acteur, ou les objets du monde) sur une fiche qui en possède déjà un identique l'empile désormais (incrémente la quantité) au lieu de créer un doublon.</li>
      </ul>`
  },
  "0.6.41": {
    title: "Version 0.6.41 — Retrait du champ \"composant\" (doublon)",
    html: `
      <ul>
        <li><strong>Nettoyé</strong> : le champ "Composantes" des sorts était une pure duplication du texte de coût des rituels, jamais utilisée par aucune règle du jeu — retiré du formulaire, du schéma et des documents existants.</li>
      </ul>`
  },
  "0.6.40": {
    title: "Version 0.6.40 — Rituels : l'onglet Ingrédients fait foi",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : pour un rituel, le coût en ingrédients (texte libre) et l'onglet "Ingrédients" pouvaient se marcher dessus pour déterminer ce que le lanceur possède réellement. L'onglet Ingrédients (relié au vrai stock) fait maintenant seul foi dès qu'il est rempli — les 8 rituels existants ont été migrés automatiquement à partir de leur ancien texte de coût.</li>
        <li><strong>Amélioré</strong> : après avoir lancé un sort et choisi de consommer les ingrédients, les cases "Possédé" se resynchronisent maintenant avec le stock réel restant, au lieu d'être toutes décochées à chaque fois.</li>
      </ul>`
  },
  "0.6.39": {
    title: "Version 0.6.39 — Correctif : icône de potion cassée (404 potion.svg)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : certaines potions bénéfiques utilisaient une icône par défaut inexistante (<code>potion.svg</code>), provoquant un 404 en console à l'ouverture de leur fiche. Une vraie icône a été assignée ; une macro est fournie pour corriger les objets déjà créés avec l'ancienne icône (compendium, objets du monde, objets possédés par un acteur).</li>
      </ul>`
  },
  "0.6.38": {
    title: "Version 0.6.38 — Correctif : la CA (et les jets de Sauvegarde) n'augmentent plus toutes seules",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : sur la fiche Personnage, modifier n'importe quel champ pouvait faire grimper la CA (et les bonus temporaires de Sauvegarde) à chaque enregistrement, quand un effet temporaire (buff) était actif. Les champs "Temp" affichent maintenant la bonne valeur et ne s'accumulent plus.</li>
      </ul>`
  },
  "0.6.37": {
    title: "Version 0.6.37 — Marge à droite des boutons d'action du Navigateur",
    html: `
      <ul>
        <li><strong>Amélioré</strong> : les icônes Prendre/Payer (et Importer/Tirer sur les autres onglets) du Navigateur de Compendium ont désormais un peu de marge à droite, au lieu d'être collées au bord du tableau.</li>
      </ul>`
  },
  "0.6.36": {
    title: "Version 0.6.36 — Dernier correctif d'alignement (colonne Nom)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : la colonne Nom des listes à tableau avait elle aussi une ligne de séparation légèrement décalée par rapport aux autres colonnes, même cause que le correctif précédent sur la colonne des boutons d'action.</li>
      </ul>`
  },
  "0.6.35": {
    title: "Version 0.6.35 — Vrai correctif de l'alignement des colonnes",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : la colonne des boutons d'action (crayon/poubelle, prendre/payer...) est maintenant correctement intégrée à la grille du tableau sur toutes les listes du système, au lieu de flotter hors de l'en-tête.</li>
      </ul>`
  },
  "0.6.34": {
    title: "Version 0.6.34 — Correctif d'alignement des colonnes (toutes les listes)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : dans toutes les listes à tableau du système (Inventaire, Ingrédients, Traits, PNJ, Boutique d'Alchimie, Navigateur de Compendium), la colonne des boutons d'action (crayon/poubelle, prendre/payer...) pouvait déborder du tableau, donnant l'impression que l'en-tête et les lignes n'étaient pas alignés.</li>
      </ul>`
  },
  "0.6.33": {
    title: "Version 0.6.33 — Colonnes alignées dans le Navigateur",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : dans le Navigateur de Compendium, les colonnes (image/nom/type-prix/actions) ne s'alignaient plus verticalement d'une section à l'autre. Largeurs de colonnes désormais fixes et identiques partout.</li>
      </ul>`
  },
  "0.6.32": {
    title: "Version 0.6.32 — Correctif dossiers Historique",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le compendium Historique n'avait pas de vrais dossiers en jeu (structure restée ancienne malgré la mise à jour de la source), empêchant le filtre/colonne Type d'y fonctionner. Une macro (<code>packs/_fix-historique-folders.js</code>) est fournie pour corriger le compendium déjà déployé.</li>
      </ul>`
  },
  "0.6.31": {
    title: "Version 0.6.31 — Colonne Type sur Traits, Bestiaire et Historique",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : la colonne « Type » du Navigateur de Compendium (déjà présente sur Sorts) s'affiche désormais aussi sur les onglets Traits, Bestiaire et Historique — chacun montre sa propre catégorie (compendium d'origine pour Traits/Bestiaire, dossier Origine/Bonus-Malus pour Historique).</li>
        <li><strong>Nouveau</strong> : l'onglet Historique a maintenant lui aussi un panneau de filtres (par dossier).</li>
      </ul>`
  },
  "0.6.30": {
    title: "Version 0.6.30 — Colonne Type dans l'onglet Sorts du Navigateur",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : dans le Navigateur de Compendium, l'onglet Sorts affiche désormais une colonne « Type » (Sort Instantané / Rituel) sur chaque ligne, en plus du filtre déjà existant.</li>
      </ul>`
  },
  "0.6.29": {
    title: "Version 0.6.29 — Rafraîchissement isolé des favoris",
    html: `
      <ul>
        <li><strong>Amélioré</strong> : ajouter/retirer un favori de compétence ne recharge plus toute la fiche — seule la barre de favoris (et l'étoile sur la ligne de compétence concernée) se met à jour, plus rapide et sans perdre la position de défilement.</li>
      </ul>`
  },
  "0.6.28": {
    title: "Version 0.6.28 — Sélecteur de munitions",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : dans l'onglet Combat, une arme consommable sans munition liée affiche désormais un menu déroulant pour en choisir une directement dans l'équipement, au lieu d'un simple tiret.</li>
      </ul>`
  },
  "0.6.27": {
    title: "Version 0.6.27 — Deux images manquantes corrigées",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le token du Centaure à l'épée ne s'affichait plus (fichier image mal nommé sur le disque) — corrigé.</li>
        <li><strong>Corrigé</strong> : Circé (compendium Divinités) n'avait jamais eu d'image — pointe désormais vers l'icône par défaut en attendant une vraie image. Une macro (<code>packs/_fix-circe-img.js</code>) est fournie pour appliquer ce correctif au compendium déjà en jeu.</li>
      </ul>`
  },
  "0.6.26": {
    title: "Version 0.6.26 — Filtres pour Traits, Sorts et Bestiaire",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : dans le Navigateur de Compendium, les onglets Traits, Sorts et Bestiaire ont désormais eux aussi un panneau de filtres (comme Équipement).</li>
        <li>Traits : filtre par origine (Avantages/Désavantages/Bénédictions/Avantages Divins). Bestiaire : filtre par origine (PNJ/Divinités/Créatures). Sorts : filtre Sort Instantané/Rituel.</li>
      </ul>`
  },
  "0.6.25": {
    title: "Version 0.6.25 — Incanter décompte les vrais ingrédients",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : à l'incantation, si vous choisissez « Dépenser les ingrédients », le système décompte réellement les ingrédients correspondants (par nom) dans l'onglet « Ingrédients » de la fiche — plus seulement une case décochée dans l'onglet du sort.</li>
        <li><strong>Nouveau</strong> : dans l'onglet Ingrédients d'un sort, chaque ligne affiche désormais le stock réel possédé, en rouge si insuffisant.</li>
      </ul>`
  },
  "0.6.24": {
    title: "Version 0.6.24 — Navigateur à onglets, comme Pathfinder",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : le Navigateur de Compendium a maintenant des onglets par catégorie (Équipement, Traits, Sorts, Bestiaire, Historique) au lieu d'une longue liste empilée.</li>
        <li><strong>Nouveau</strong> : dans l'onglet Équipement, filtres par type (Arme/Armure/Bouclier/Munition/Consommable), inspirés du Compendium Browser de Pathfinder 2e.</li>
      </ul>`
  },
  "0.6.23": {
    title: "Version 0.6.23 — Boutique d'Alchimie + vrai Navigateur de Compendium",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : « Boutique d'Alchimie » — clic droit sur le compendium Alchimie, dédiée aux ingrédients (regroupés par catégorie comme avant).</li>
        <li><strong>Nouveau</strong> : « Navigateur de Compendium » — bouton sous la liste des compendiums dans la barre latérale, montre tous les compendiums du système (armes, équipement, alchimie, avantages, désavantages, avantages divins, bénédictions, sorts, PNJ, divinités, créatures, historique).</li>
        <li><strong>Nouveau</strong> : dans le Navigateur, Prendre/Payer pour les objets, Prendre seul pour les traits sans prix, Importer pour les personnages (PNJ/divinités/créatures), Tirer pour les tables aléatoires.</li>
      </ul>`
  },
  "0.6.22": {
    title: "Version 0.6.22 — Armures grecques dans le Navigateur",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : les 9 armures/boucliers grecs nommés (Linothorax, Cuirasse de bronze, Casque corinthien...) apparaissent dans le Navigateur de Compendium, prix temporairement à 0 en attendant les vrais tarifs.</li>
      </ul>`
  },
  "0.6.21": {
    title: "Version 0.6.21 — Navigateur de Compendium",
    html: `
      <ul>
        <li><strong>Modifié</strong> : la Boutique d'ingrédients devient le Navigateur de Compendium — regroupe désormais Armes/Armures/Boucliers et Alchimie (tout objet ayant un prix), pas seulement les ingrédients.</li>
        <li><strong>Nouveau</strong> : glisser-déposer un objet du navigateur vers une fiche de personnage pour l'ajouter directement.</li>
        <li><strong>Nouveau</strong> : cliquer sur l'image d'un objet du navigateur le poste dans le chat.</li>
        <li><strong>Nouveau</strong> : le titre de chaque catégorie reste visible en haut pendant le défilement.</li>
        <li><strong>Corrigé</strong> : les armes, armures et boucliers avaient un prix affiché en description mais jamais dans le champ structuré — corrigé, ils sont maintenant achetables.</li>
      </ul>`
  },
  "0.6.20": {
    title: "Version 0.6.20 — Bouton Boutique et menu contextuel enfin actifs",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le bouton de la Boutique (contrôles de jetons) et le clic droit sur Alchimie ne faisaient toujours rien — les hooks étaient enregistrés trop tard (au chargement du monde au lieu de l'initialisation du système). Déplacés au bon endroit.</li>
        <li><strong>Modifié</strong> : onglets principaux de la fiche personnage encore réduits.</li>
      </ul>`
  },
  "0.6.19": {
    title: "Version 0.6.19 — Boutique enfin accessible + onglets compacts",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le clic droit sur le compendium Alchimie n'ouvrait jamais la Boutique (mauvais nom de hook pour Foundry v14) — corrigé.</li>
        <li><strong>Nouveau</strong> : un bouton "Boutique d'ingrédients" dans les contrôles de jetons (barre d'outils de la scène), toujours visible.</li>
        <li><strong>Corrigé</strong> : les onglets principaux de la fiche personnage sont plus compacts pour éviter le retour à la ligne.</li>
      </ul>`
  },
  "0.6.18": {
    title: "Version 0.6.18 — Boutique inspirée du Compendium Browser de PF2e",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : Prendre/Payer s'applique désormais à tous les jetons sélectionnés à la fois (comme le Compendium Browser de Pathfinder 2e), pas seulement à un seul personnage.</li>
        <li><strong>Nouveau</strong> : tri des ingrédients par nom ou par prix, lignes alternées pour la lisibilité.</li>
        <li><strong>Corrigé</strong> : un double-clic rapide sur Prendre/Payer ne peut plus dupliquer ou perdre une action ; rouvrir la Boutique déjà ouverte la ramène au premier plan au lieu d'en ouvrir une deuxième copie.</li>
      </ul>`
  },
  "0.6.17": {
    title: "Version 0.6.17 — Boutique accessible depuis le compendium Alchimie",
    html: `
      <ul>
        <li><strong>Modifié</strong> : la Boutique d'ingrédients n'est plus accessible depuis la fiche de personnage — elle s'ouvre désormais via un clic droit sur le compendium « Alchimie » dans la barre latérale (« Boutique d'ingrédients »).</li>
        <li><strong>Modifié</strong> : chaque ligne propose deux actions séparées — « Prendre l'objet » (gratuit) et « Payer l'objet » (déduit l'or).</li>
      </ul>`
  },
  "0.6.16": {
    title: "Version 0.6.16 — Ingrédients à quantité 0 grisés, réapprovisionnement rapide",
    html: `
      <ul>
        <li><strong>Modifié</strong> : dans l'onglet Ingrédients, une ligne à quantité 0 apparaît grisée (au lieu de se confondre avec le reste).</li>
        <li><strong>Nouveau</strong> : un bouton « + » sur chaque ligne d'ingrédient permet d'ajouter un exemplaire directement, sans ouvrir la fiche de l'objet.</li>
      </ul>`
  },
  "0.6.15": {
    title: "Version 0.6.15 — Besace d'ingrédients",
    html: `
      <ul>
        <li><strong>Modifié</strong> : les ingrédients ne s'affichent plus comme objets séparés dans l'onglet Inventaire (ils restent listés dans l'onglet « Ingrédients »).</li>
        <li><strong>Nouveau</strong> : un objet d'équipement peut être marqué « Est une Besace d'ingrédients » — sa propre fiche affiche alors un onglet « Ingrédients » listant en temps réel tout ce que le personnage possède actuellement (quantité > 0), regroupé par catégorie.</li>
        <li><strong>Nouveau</strong> : la fiche d'un objet Équipement a maintenant un onglet « Détails » qui regroupe quantité, prix, consommable, emplacement, équipé, bonus CA, compétence liée et besace d'ingrédients.</li>
        <li><strong>Modifié</strong> : le champ « Catégorie (Sac d'Apothicaire) » s'appelle désormais « Catégorie d'ingrédient ».</li>
      </ul>`
  },
  "0.6.14": {
    title: "Version 0.6.14 — Gabarit gris par défaut",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : la couleur du gabarit d'un sort à zone est configurable par sort (gris par défaut) au lieu de reprendre la couleur du joueur.</li>
      </ul>`
  },
  "0.6.13": {
    title: "Version 0.6.13 — Sorts à zone (gabarit circulaire)",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : un sort peut proposer un bouton « Placer un gabarit » dans le chat, pour poser un gabarit circulaire (taille et texture configurables) directement sur la scène. Activé sur « Brouillard » (25m de rayon).</li>
        <li><strong>Modifié</strong> : l'onglet « Ingrédients » est maintenant juste à côté de l'onglet « Magie ».</li>
      </ul>`
  },
  "0.6.12": {
    title: "Version 0.6.12 — Onglet renommé",
    html: `
      <ul>
        <li><strong>Modifié</strong> : l'onglet « Apothicaire » de la fiche de personnage s'appelle maintenant « Ingrédients ».</li>
      </ul>`
  },
  "0.6.11": {
    title: "Version 0.6.11 — Onglet Apothicaire",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : un onglet « Apothicaire » sur la fiche de personnage, qui regroupe les ingrédients (Communs/Peu Communs/Rares) et les potions par catégorie — sur le modèle de l'onglet « Sac d'Apoticaire » de la fiche Excel.</li>
      </ul>`
  },
  "0.6.10": {
    title: "Version 0.6.10 — Champ Histoire agrandi",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le champ « Histoire » de l'onglet Background était trop petit — remonté à ~4 lignes visibles, comme les notes PNJ.</li>
      </ul>`
  },
  "0.6.9": {
    title: "Version 0.6.9 — Les traits peuvent enfin modifier une sauvegarde",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : un trait comme "Dépressif" (Volonté -1) peut maintenant réellement réduire une sauvegarde, via un nouveau champ dédié distinct du modificateur temporaire manuel.</li>
      </ul>`
  },
  "0.6.8": {
    title: "Version 0.6.8 — Notes PNJ un peu plus grandes",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le plancher minimum des deux blocs de notes (PNJ) remonté à ~4 lignes chacun, en plus du remplissage automatique déjà ajouté en 0.6.7.</li>
      </ul>`
  },
  "0.6.7": {
    title: "Version 0.6.7 — Éditeurs de texte agrandis",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : les zones de Notes/Description restaient minuscules avec un ascenseur interne au lieu d'utiliser l'espace disponible — corrigé sur les fiches PNJ, objet et divinité.</li>
      </ul>`
  },
  "0.6.6": {
    title: "Version 0.6.6 — Corrections de rafraîchissement",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : plusieurs écrans (fiche PNJ, fiche d'objet, effets, repos long, sorts, munitions) ne se mettaient pas toujours à jour immédiatement après une action — corrigé partout.</li>
      </ul>`
  },
  "0.6.5": {
    title: "Version 0.6.5 — Les ingrédients de sort bloquent enfin le lancer (côté PJ)",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : un personnage-joueur ne peut plus lancer un sort si un ingrédient requis n'est pas coché « Possédé ».</li>
        <li><strong>Nouveau</strong> : au moment de lancer, choix proposé entre dépenser les ingrédients ou les garder.</li>
        <li><strong>Nouveau</strong> : aucune restriction pour les PNJ — le MJ lance librement leurs sorts.</li>
      </ul>`
  },
  "0.6.4": {
    title: "Version 0.6.4 — Rituels séparés, Malédictions, sorts à bonus de CA",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : l'onglet Magie sépare désormais les sorts instantanés des rituels dans deux sections distinctes.</li>
        <li><strong>Nouveau</strong> : les Malédictions deviennent un vrai type de trait, aux côtés des Avantages et Désavantages.</li>
        <li><strong>Nouveau</strong> : les sorts à bonus de CA (ex. Peau d'écorce) proposent un bouton « Appliquer l'effet » dans le chat.</li>
      </ul>`
  },
  "0.6.3": {
    title: "Version 0.6.3 — Ingrédients de sort, statut Mort, corrections de combat",
    html: `
      <ul>
        <li><strong>Nouveau</strong> : un onglet « Ingrédients » sur la fiche de Sort, pour lister ce qu'il faut pour le lancer.</li>
        <li><strong>Nouveau</strong> : le statut « Mort » s'applique désormais automatiquement à 0 PV (et se retire après un repos long qui soigne).</li>
        <li><strong>Nouveau</strong> : un rappel discret « DEX + Vigilance » sous le bloc Initiative.</li>
        <li><strong>Corrigé</strong> : le focus d'un champ de compétence ne saute plus ailleurs en appuyant sur Entrée.</li>
        <li><strong>Corrigé</strong> : le sélecteur d'emplacement d'un objet d'inventaire ne se coupe plus visuellement.</li>
        <li><strong>Corrigé</strong> : les Points de Magie se rafraîchissent bien à l'écran après avoir incanté un sort.</li>
        <li><strong>Corrigé</strong> : l'avantage « Colère de Zeus » applique enfin son bonus de dégâts.</li>
        <li><strong>Corrigé</strong> : la portée d'une arme (ex. le Glaive) qui pouvait rester invisible sur la fiche.</li>
      </ul>`
  }
};

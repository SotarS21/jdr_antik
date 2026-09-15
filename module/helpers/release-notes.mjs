/**
 * Release notes shown to the GM when the system version changes between two
 * world loads (see version-check.mjs). Keep this in sync with CHANGELOG.md —
 * add one entry per version that should trigger the update dialog. Text is
 * French-only (this system has no English-facing audience).
 */
export const RELEASE_NOTES = {
  "0.6.99": {
    title: "Version 0.6.99 — Reclasser un trait depuis sa propre fiche",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : boutons "Convertir en Bénédiction/Malédiction" dans l'onglet Description d'un Avantage/Désavantage — en plus du glisser-déposer déjà existant.</li>
      </ul>`
  },
  "0.6.98": {
    title: "Version 0.6.98 — Effet lié à un sort (2 premiers exemples)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : Bénédiction des Titans (+3 Force) et Danse du Serpent (+3 Dextérité) embarquent maintenant un vrai effet, appliqué à la cible via un bouton "Appliquer l'effet" au lancer — même principe que les avantages/désavantages, généralisé au-delà du bonus de CA. Premiers exemples avant de généraliser aux 30 autres sorts.</li>
      </ul>`
  },
  "0.6.97": {
    title: "Version 0.6.97 — Correctif : focus perdu au glisser-déposer d'un objet",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : glisser un objet dans l'inventaire (ex. dans le sac à ingrédient) remontait la fiche tout en haut à chaque fois.</li>
      </ul>`
  },
  "0.6.96": {
    title: "Version 0.6.96 — Reclasser un trait par glisser-déposer + Flèches empoisonnées",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : glisser un Avantage ou un Désavantage déjà possédé sur la section Bénédictions ou Malédictions (onglet Traits) le reclasse dans ce type.</li>
        <li><strong>Ajouté</strong> : "Flèches empoisonnées", 4e munition dans le dossier "Munition".</li>
      </ul>`
  },
  "0.6.95": {
    title: "Version 0.6.95 — Correctif : munitions liables aux armes",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : les munitions (Flèches, Carreaux d'arbalète, Pierres de fronde) n'apparaissaient pas dans le menu "Munition liée" d'une arme à distance.</li>
      </ul>`
  },
  "0.6.94": {
    title: "Version 0.6.94 — Section Effets repositionnée en dernier",
    html: `
      <ul>
        <li><strong>Modifié</strong> : dans l'onglet Traits de la fiche personnage, la section "Effets" est désormais affichée en dernier (après les Bénédictions).</li>
      </ul>`
  },
  "0.6.93": {
    title: "Version 0.6.93 — Nouveau type d'objet \"Trésor\"",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouveau type d'objet "Trésor" (bijoux, parchemins, lettres, statuettes, parfum, pierres précieuses...) avec description, description MJ cachée des joueurs, image et prix. Premier lot de 7 objets dans le nouveau compendium "Trésors".</li>
      </ul>`
  },
  "0.6.92": {
    title: "Version 0.6.92 — Correctif : PV/PM qui augmentaient à chaque champ modifié",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : sous un buff actif, les PV (ou les PM) augmentaient à chaque modification d'un champ quelconque de la fiche — même cause que l'ancien bug de CA (v0.6.38).</li>
      </ul>`
  },
  "0.6.91": {
    title: "Version 0.6.91 — Arbalète, munitions, et catégorie d'arme corrigée",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouvelle arme "Arbalète" (3 paliers de qualité) et un dossier "Munition" (Flèches, Carreaux d'arbalète, Pierres de fronde) — à lier depuis la fiche d'une arme à distance (menu "Munition liée") pour un vrai suivi de stock, décompté à chaque tir.</li>
        <li><strong>Corrigé</strong> : aucune arme n'avait jamais sa vraie catégorie d'attaque enregistrée (toutes retombaient sur "Arme blanche" par défaut) — les arcs, javelines, bâtons, etc. utilisaient donc le mauvais bonus d'attaque. Corrigé sur les 100 armes du compendium et toute copie déjà possédée par un personnage.</li>
      </ul>`
  },
  "0.6.90": {
    title: "Version 0.6.90 — Correctif : la fiche perso ne vole plus le focus fenêtre",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : éditer un objet (ex. changer la catégorie d'une arme) faisait systématiquement passer la fenêtre de la fiche de personnage devant celle de l'objet en cours d'édition, à chaque champ modifié.</li>
      </ul>`
  },
  "0.6.89": {
    title: "Version 0.6.89 — Filtres \"Arme de jet\" / \"Arme à distance\"",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : dans l'onglet Équipement du Navigateur de Compendium, deux nouveaux filtres séparés pour les armes à distance (jets et tir), au lieu d'être fondues dans le filtre générique "Arme".</li>
      </ul>`
  },
  "0.6.88": {
    title: "Version 0.6.88 — Correctif : focus perdu au toggle \"maîtrisé\" d'une compétence",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : cliquer sur "maîtrisé" pour une compétence remontait la fiche de personnage tout en haut à chaque clic.</li>
      </ul>`
  },
  "0.6.87": {
    title: "Version 0.6.87 — Correctifs : filtre Bouclier et Capacités de Combat cachées aux joueurs",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le filtre "Bouclier" du Navigateur de Compendium ne fonctionnait jamais, les boucliers ressortaient classés comme "Arme".</li>
        <li><strong>Corrigé</strong> : l'onglet "Capacités de Combat" (PNJ) du Navigateur de Compendium, réservé au MJ, était visible par les joueurs.</li>
      </ul>`
  },
  "0.6.86": {
    title: "Version 0.6.86 — Correctif : placeholder de recherche du Navigateur de Compendium",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le champ de recherche du Navigateur de Compendium affichait "Rechercher un ingrédient..." alors qu'on peut y chercher n'importe quel type de contenu.</li>
      </ul>`
  },
  "0.6.85": {
    title: "Version 0.6.85 — Effets et Capacités de Combat dans le Navigateur de Compendium",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : le compendium "Effets" apparaît désormais dans l'onglet Traits du Navigateur de Compendium (à côté des avantages/désavantages/bénédictions/avantages divins) — glisser un effet ou cliquer "Prendre" l'applique directement à l'acteur ciblé.</li>
        <li><strong>Ajouté</strong> : nouvel onglet "Capacités de Combat" dédié au compendium "Capacités de Combat (PNJ)".</li>
      </ul>`
  },
  "0.6.84": {
    title: "Version 0.6.84 — Correctif : \"Écraser mes compendiums\" (dossiers + RollTables)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : 23 dossiers d'organisation (Armes, Sorts, Alchimie, Avantages divins, Historique) échouaient systématiquement lors de l'écrasement des compendiums — traités par erreur comme du contenu normal au lieu de vrais dossiers Foundry.</li>
        <li><strong>Corrigé</strong> : 5 tables aléatoires de l'onglet Historique échouaient aussi (donnée technique invalide héritée d'un ancien script). Plus généralement, cette donnée technique n'est plus jamais réécrasée par ce mécanisme.</li>
      </ul>`
  },
  "0.6.83": {
    title: "Version 0.6.83 — Correctif : \"Écraser mes compendiums\" refonctionne",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le bouton "Écraser mes compendiums" (dialogue de mise à jour de version) ne faisait plus rien depuis que Foundry bloque le téléchargement direct des fichiers de compendium (.db) pour raisons de sécurité — 403 Forbidden sur chaque pack, 0 mise à jour. Le système passe maintenant par un miroir .json (non bloqué) de chaque pack, régénéré à chaque déploiement.</li>
      </ul>`
  },
  "0.6.82": {
    title: "Version 0.6.82 — Correctif : effets désactivés à nouveau cliquables",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : une fois un effet actif désactivé (grisé), ses boutons actif/inactif, éditer et supprimer ne réagissaient plus du tout au clic — la classe CSS "disabled" partagée avec le noyau de Foundry coupait les clics sur toute la ligne, y compris ses propres boutons. Corrigé partout (onglet Effets d'un objet, et section Effets autonome de l'onglet Traits).</li>
      </ul>`
  },
  "0.6.81": {
    title: "Version 0.6.81 — Filtre \"Alchimie\" renommé (Navigateur de Compendium)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : dans l'onglet Équipement du Navigateur de Compendium, le filtre qui montrait le contenu du compendium Alchimie s'appelait "Consommable" — renommé "Alchimie", plus clair.</li>
      </ul>`
  },
  "0.6.80": {
    title: "Version 0.6.80 — Jet de sauvegarde pour les tokens sélectionnés (MJ)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : sur la carte de chat d'une capacité de combat avec jet de sauvegarde, un second bouton (visible seulement du MJ) lance le même jet pour le(s) token(s) actuellement sélectionné(s) sur le canevas — utile quand la victime est un PNJ/monstre sans joueur assigné. Un jet est lancé par token sélectionné.</li>
      </ul>`
  },
  "0.6.79": {
    title: "Version 0.6.79 — Capacités de combat généralisées à tout le bestiaire",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : le compendium "Capacités de Combat (PNJ)" couvre maintenant les 28 créatures de "Créatures Mythologiques" (51 nouvelles capacités, en plus de Charge furieuse/Regard pétrifiant) — bonus d'attaque/CA embarqués quand une capacité correspond à un champ existant (6 cas), bouton de jet de sauvegarde quand le texte d'origine en précise un, sinon narratif.</li>
        <li><strong>Ajouté</strong> : glisser une créature du compendium sur une scène l'amène désormais déjà équipée de sa/ses capacité(s) — y compris Minotaure et Méduse, qui ne l'étaient pas encore eux-mêmes.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour (Capacités de Combat, Créatures Mythologiques).</li>
      </ul>`
  },
  "0.6.78": {
    title: "Version 0.6.78 — Recochage automatique des ingrédients après restock",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : quand un ingrédient manquant est de nouveau en stock suffisant (bouton "+", édition directe de la quantité, ou glisser-déposer d'un duplicata), la case "Possédé" de la checklist "Ingrédients" de chaque sort/rituel concerné se recoche automatiquement — plus besoin de la cocher à la main.</li>
      </ul>`
  },
  "0.6.77": {
    title: "Version 0.6.77 — Correctif : le bouton +1 ingrédient ne rafraîchit plus toute la fiche",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : cliquer sur le bouton "+" d'un ingrédient (onglet Apothicaire) ne recharge plus toute la fiche — seul le nombre affiché se met à jour. Avant, ça remontait la fiche en haut et effaçait la recherche en cours.</li>
      </ul>`
  },
  "0.6.76": {
    title: "Version 0.6.76 — Capacités de combat cliquables + bouton de jet de sauvegarde",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : cliquer sur le nom ou l'icône d'une capacité de combat (PNJ) l'affiche maintenant dans le chat, avec son icône, son titre et sa description.</li>
        <li><strong>Ajouté</strong> : "Regard pétrifiant" affiche un bouton "Jet de sauvegarde (Robustesse DC 18)" sur sa carte de chat — le joueur visé clique lui-même, sur son propre client, avec les stats de son personnage assigné, et voit un résultat réussite/échec.</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour (Capacités de Combat).</li>
      </ul>`
  },
  "0.6.75": {
    title: "Version 0.6.75 — Correctif : effet \"Pétrifié\" visible dans l'onglet Effets",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : l'onglet Effets de "Regard pétrifiant" restait vide malgré le lien ajouté en 0.6.74 dans sa description. Une copie de l'effet "Pétrifié" est maintenant embarquée directement sur la capacité (en <code>transfer:false</code>, comme Charge furieuse visuellement, mais sans jamais s'appliquer à la créature qui la possède).</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour (Capacités de Combat).</li>
      </ul>`
  },
  "0.6.74": {
    title: "Version 0.6.74 — Effet \"Pétrifié\" pour Regard pétrifiant",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : comme Charge furieuse, "Regard pétrifiant" a maintenant un document Effet autonome dans le compendium Effets — un marqueur narratif ("Pétrifié (Regard de Méduse)"), à glisser par le MJ directement sur la victime après un échec de jet de sauvegarde (jamais sur la créature elle-même).</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour (Effets, Capacités de Combat).</li>
      </ul>`
  },
  "0.6.73": {
    title: "Version 0.6.73 — Charge furieuse : bonus actif en permanence",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : retour utilisateur après test — le bonus d'attaque de "Charge furieuse" doit être actif en permanence, pas désactivé par défaut. Corrigé sur le compendium et sur les copies déjà glissées sur un PNJ.</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour (Capacités de Combat).</li>
      </ul>`
  },
  "0.6.72": {
    title: "Version 0.6.72 — Correctifs : fiche des capacités de combat, lien vers l'effet",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : les capacités de combat (nouveau type d'objet de la 0.6.71) n'affichaient pas leur description à l'ouverture — le type n'était pas encore reconnu par le système pour choisir la bonne fiche.</li>
        <li><strong>Ajouté</strong> : comme pour les avantages, "Charge furieuse" a maintenant un document Effet autonome dans le compendium Effets (réutilisable/glissable sur un token), lié depuis sa description — en plus de la copie déjà embarquée sur la capacité.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour (Effets, Capacités de Combat).</li>
      </ul>`
  },
  "0.6.71": {
    title: "Version 0.6.71 — Capacités de combat pour les PNJ (architecture + 2 exemples)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouveau type d'objet "Capacité de combat" + nouveau compendium "Capacités de Combat (PNJ)", glissable sur un PNJ (nouvelle section dans l'onglet Combat, GM only).</li>
        <li>2 exemples pour valider l'architecture avant de généraliser : Charge furieuse (Minotaure — effet actif +2 attaque, désactivé par défaut) et Regard pétrifiant (Méduse — purement narratif, pas d'effet).</li>
      </ul>`
  },
  "0.6.70": {
    title: "Version 0.6.70 — Case \"Sac à ingrédient\" (onglet Ingrédients optionnel)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouvelle case "Sac à ingrédient" dans l'onglet Background, à côté de "Praticien de la magie" — l'onglet Ingrédients ne s'affiche dans la barre d'onglets que si elle est cochée.</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour : coche automatiquement la case pour tout personnage qui a déjà des objets d'apothicaire dans son inventaire, pour ne pas lui faire perdre l'accès à ce qu'il a déjà.</li>
      </ul>`
  },
  "0.6.69": {
    title: "Version 0.6.69 — Recherche de compétence dans l'onglet Compétences",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : un champ de recherche en haut de l'onglet Compétences de la fiche de personnage — la compétence recherchée est mise en évidence (surlignée) pendant que les autres s'estompent, sans rien masquer ni changer de disposition.</li>
      </ul>`
  },
  "0.6.68": {
    title: "Version 0.6.68 — Correctif : focus/scroll perdu au toggle d'un effet (onglet Traits)",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : cliquer sur actif/inactif pour un effet dans l'onglet Traits faisait remonter la fiche en haut et perdait le focus, au lieu de rester à l'endroit où on était.</li>
        <li>Le cas similaire signalé pour les champs de compétence (Entrée qui fait remonter la fiche) était déjà corrigé depuis longtemps par le même mécanisme général de préservation du focus/scroll.</li>
      </ul>`
  },
  "0.6.67": {
    title: "Version 0.6.67 — 90 nouveaux Effets pour les Désavantages",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : les 90 désavantages qui n'avaient pas encore d'effet actif en ont maintenant un — narratif pour la quasi-totalité (la plupart décrivent une conséquence conditionnelle ou de jeu de rôle, pas un malus chiffré permanent), avec 3 exceptions à vrai malus de compétence : Petite nature (-2 Résistance aux poisons), Enfant (-2 Commandement), Introverti (-2 Baratin).</li>
        <li>Chaque effet est lié depuis la description de son désavantage et directement embarqué dans son onglet "Effets", comme pour les avantages.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour des compendiums (Effets, Désavantages).</li>
      </ul>`
  },
  "0.6.66": {
    title: "Version 0.6.66 — Correctif : \"compendium verrouillé\" sur les correctifs de poids",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le correctif "Poids de l'équipement" plantait avec "You may not update documents in the locked compendium" — le code lisait l'état verrouillé/déverrouillé du compendium avant de tenter le déverrouillage, et cette lecture n'était pas fiable pour tous les compendiums. Le dé/reverrouillage est maintenant systématique, sans dépendre de cette lecture.</li>
        <li>Réessaie les correctifs de poids (Armes, Équipement) dans l'écran de mise à jour des compendiums.</li>
      </ul>`
  },
  "0.6.65": {
    title: "Version 0.6.65 — Capacité de port (kg) + Mule",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouveau champ "Capacité de port" (kg) dans l'onglet Identité de la fiche de personnage, modifiable directement (comme le Déplacement).</li>
        <li><strong>Ajouté</strong> : chaque arme et objet d'équipement a maintenant un poids (kg) — visible dans l'onglet Inventaire, avec une estimation déjà en place pour tous les objets existants (approximative, à corriger au cas par cas). Une bannière en haut de l'onglet Inventaire affiche le poids porté total et passe en alerte visuelle si la capacité est dépassée — jamais bloquant.</li>
        <li><strong>Ajouté</strong> : l'avantage Mule multiplie maintenant réellement la capacité de port par deux, tant qu'il est possédé.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour des compendiums (Effets, Avantages, Armes, Équipement).</li>
        <li>Ceci clôt le dernier point du chantier Effets — plus rien d'ouvert dans <code>todo_foundry.txt</code>.</li>
      </ul>`
  },
  "0.6.64": {
    title: "Version 0.6.64 — Correctif : les descriptions des effets actifs n'étaient pas reprises",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : retour utilisateur "les effets actifs n'ont pas encore récupéré leurs descriptions" — les correctifs de la 0.6.63 lisaient le champ "Effet" en direct sur le monde pour le recopier, mais ce champ n'est plus lisible une fois retiré du schéma dans le même déploiement. Nouveaux correctifs qui recopient les bons textes (95 avantages/désavantages).</li>
        <li>Disponibles dans l'écran de mise à jour des compendiums — les anciens correctifs 0.6.63 ne se reproposent pas (ils sont déjà marqués comme appliqués), d'où ces deux nouvelles entrées.</li>
      </ul>`
  },
  "0.6.63": {
    title: "Version 0.6.63 — Nettoyage du champ \"Effet\" (étape 4)",
    html: `
      <ul>
        <li><strong>Retiré</strong> : le champ texte "Effet" de l'onglet Description des Avantages/Désavantages, redondant avec la description complète. Son contenu est repris dans la description de l'effet actif de l'avantage/désavantage quand il en a un.</li>
        <li><strong>Corrigé</strong> : la tooltip des icônes d'avantages/désavantages en haut de la fiche de personnage lit maintenant la description de l'effet actif (ou un extrait de la description complète s'il n'y a pas d'effet) plutôt que ce champ supprimé.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour des compendiums (Avantages et Désavantages) — dédoublonnent aussi tout avantage/désavantage qui se serait retrouvé avec plusieurs effets à cause du bug de la 0.6.62.</li>
      </ul>`
  },
  "0.6.62": {
    title: "Version 0.6.62 — Correctif urgent : contrôles d'idempotence cassés dans l'écran de mise à jour",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : le correctif "Athlète" a planté à l'exécution ("Cannot read properties of undefined") — cause racine : <code>doc.effects.length</code> n'existe pas sur ce type d'objet Foundry (une collection de type Map, qui utilise <code>.size</code>), donc tous les contrôles "cet effet existe-t-il déjà ?" de cette session étaient silencieusement toujours faux. Corrigé partout dans l'écran de mise à jour des compendiums.</li>
        <li>Cause probable des doublons d'effets signalés sur certains avantages : un correctif déjà appliqué (qui pensait à tort qu'aucun effet n'existait) pouvait en ajouter un second par-dessus l'effet déjà présent depuis le déploiement normal.</li>
        <li>Réessaie le correctif "Athlète" dans l'écran de mise à jour des compendiums — il devrait maintenant fonctionner.</li>
      </ul>`
  },
  "0.6.61": {
    title: "Version 0.6.61 — Correctif : Athlète sans effet actif",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : retour utilisateur "Athlète n'a pas d'effet actif" — Athlète est l'un des 3 tout premiers exemples du chantier Effets, construit avant tous les mécanismes de propagation ajoutés depuis. Un joueur ayant récupéré Athlète avant l'ajout de son effet (ou une copie corrompue avec plusieurs effets) n'en avait jamais reçu de correctif dédié.</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour des compendiums — corrige l'absence d'effet et les doublons éventuels, sur le compendium et les copies déjà possédées.</li>
      </ul>`
  },
  "0.6.60": {
    title: "Version 0.6.60 — Faveur de la Dame : compteur d'utilisations (étape 3/3)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : nouveau champ générique "Utilisations limitées" sur les avantages (onglet Description de la fiche d'objet) — un compteur apparaît sur la fiche du personnage avec un bouton "Utiliser" (décrémente, prévient quand il n'en reste plus) et "Réinitialiser" (remet au maximum).</li>
        <li>Faveur de la Dame en profite la première : 3 utilisations, rechargeables via "Réinitialiser".</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour des compendiums.</li>
        <li>Ceci clôt le chantier des avantages -2/-3/-5 de <code>todo_foundry.txt</code>.</li>
      </ul>`
  },
  "0.6.59": {
    title: "Version 0.6.59 — Les 15 Auras s'appliquent aussi au porteur",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : les 15 avantages "Aura d'X" (v0.6.58) sont maintenant aussi embarqués dans l'onglet "Effets" de l'avantage lui-même — décision revue : ils s'appliquent automatiquement au PJ qui possède l'avantage, en plus de rester glissables sur un allié depuis le lien de la description.</li>
        <li>Correctif de propagation disponible dans l'écran de mise à jour des compendiums.</li>
      </ul>`
  },
  "0.6.58": {
    title: "Version 0.6.58 — 18 nouveaux Effets mécaniques (étape 2/3 des avantages -2/-3/-5)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : les 15 avantages "Aura d'X" ont maintenant un vrai effet — un bonus de +2 sur une caractéristique — lié depuis leur description sous le nom "Allié de l'aura d'X". <strong>À glisser sur un allié</strong>, pas sur soi-même : ce n'est pas un effet embarqué sur l'avantage, la description dit "renforce les jets de l'équipe".</li>
        <li><strong>Ajouté</strong> : Mire d'Artèmis (+3 dégâts armes à distance), Talent d'Héphaistos (+3 dégâts corps à corps) et Pieds d'Hermes (+6m de déplacement) ont maintenant un effet mécanique réel, embarqué directement sur l'avantage (bonus sur le porteur lui-même, comme Colère de Zeus/Visée d'Apollon).</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour des compendiums.</li>
        <li>Reste à traiter : Faveur de la Dame (compteur à part, hors gabarit ActiveEffect).</li>
      </ul>`
  },
  "0.6.57": {
    title: "Version 0.6.57 — 32 nouveaux Effets simples (étape 1/3 des avantages -2/-3/-5)",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : 32 nouveaux Effets narratifs dans le compendium Effets, un par avantage restant des paliers -2/-3/-5 qui n'en avait pas encore (Orientation, Etincelle de Zeus, Dieu de l'esquive, Faveur ++, Bucher d'Héstia, etc.) — chacun lié depuis la description de son avantage et directement embarqué dans son onglet "Effets", comme pour la première vague.</li>
        <li>Correctifs de propagation disponibles dans l'écran de mise à jour des compendiums (compendiums Effets et Avantages).</li>
        <li>Reste à traiter dans les prochaines versions : les avantages nécessitant un vrai effet mécanique (les 16 Auras, Mire d'Artèmis, Talent d'Héphaistos, Pieds d'Hermes) puis Faveur de la Dame (compteur à part).</li>
      </ul>`
  },
  "0.6.56": {
    title: "Version 0.6.56 — Écran de mise à jour des compendiums, par compendium",
    html: `
      <ul>
        <li><strong>Ajouté</strong> : à la connexion, si un correctif de contenu de compendium est en attente, une fenêtre liste maintenant les compendiums concernés avec une case à cocher par correctif — décoche ce que tu ne veux pas appliquer, le reste se fait automatiquement (créations de documents manquants + corrections de champs ciblées, jamais un écrasement en bloc de tes propres modifications). Ce qui reste décoché est reproposé à ta prochaine connexion, tant que ça n'a pas été traité.</li>
        <li>Remplace, pour les futures corrections de contenu, le besoin de coller une macro <code>_fix-*-live.js</code> dans la console GM.</li>
        <li>Ce dialog "notes de version" que tu es en train de lire fonctionne maintenant lui aussi avec le déploiement habituel (auparavant il ne s'affichait jamais, faute d'URL de manifeste renseignée dans <code>system.json</code>).</li>
      </ul>`
  },
  "0.6.55": {
    title: "Version 0.6.55 — Les 24 nouveaux Effets sont maintenant attachés à leur avantage",
    html: `
      <ul>
        <li><strong>Corrigé</strong> : les 24 Effets narratifs ajoutés en 0.6.54 n'avaient qu'un lien dans la description de leur avantage — l'effet n'apparaissait pas dans l'onglet "Effets" de l'avantage lui-même. Chaque avantage a maintenant son effet correspondant réellement attaché, comme Cuir de Héros/Athlète/Peau d'Hadès.</li>
        <li>Après cette mise à jour, exécute la macro GM <code>_fix-embed-effets-simple-live.js</code> pour appliquer ce correctif au compendium déjà déployé et aux copies déjà possédées par un acteur.</li>
      </ul>`
  },
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

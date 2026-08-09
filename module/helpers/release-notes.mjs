/**
 * Release notes shown to the GM when the system version changes between two
 * world loads (see version-check.mjs). Keep this in sync with CHANGELOG.md —
 * add one entry per version that should trigger the update dialog. Text is
 * French-only (this system has no English-facing audience).
 */
export const RELEASE_NOTES = {
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

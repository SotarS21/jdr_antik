# Antique

Système de jeu de rôle pour [Foundry Virtual Tabletop](https://foundryvtt.com/), situé dans l'univers de la Grèce antique mythologique.

- **Version :** 0.6.14
- **Compatibilité Foundry VTT :** v12 minimum, v14 vérifiée
- **Auteurs :** Mr Banane, Florico

## Contenu

- 6 caractéristiques (FOR, DEX, CON, INT, AST, CHA), 3 sauvegardes, 35 compétences
- Fiches Personnage, PNJ et Divinité (ApplicationV2)
- Objets : armes, équipement, avantages, désavantages, malédictions, bénédictions, sorts
- Magie : sorts instantanés/rituels avec ingrédients, gabarits de zone, bonus de CA temporaires
- Compendiums fournis : armes, équipement, avantages, désavantages, bénédictions, avantages divins, alchimie, sorts & rituels, PNJ, divinités grecques, créatures mythologiques, table d'historique aléatoire
- Localisation FR/EN

## Installation

**Manuelle :**
1. Copier le dossier `antique` dans `<Données Foundry>/systems/`
2. Redémarrer Foundry VTT
3. Sélectionner "Antique" à la création d'un monde

## Développement

Système en JavaScript/ESM vanilla, sans étape de build.

- `module/` : documents, data models, feuilles, helpers
- `templates/` : gabarits Handlebars des fiches
- `packs/` : compendiums (`.db`, format NeDB à plat) et scripts de migration/build (`_*.js`, `_*.bat`, `npm install` dans `packs/` pour leurs dépendances)
- `lang/` : traductions FR/EN
- `JOURNAL.md` : journal de développement détaillé par session

Convention de version : à chaque changement livré, incrémenter `system.json` et ajouter une entrée dans `module/helpers/release-notes.mjs`.

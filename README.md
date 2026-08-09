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

## Publier une release

Un workflow GitHub Actions (`.github/workflows/release.yml`) construit et publie automatiquement le système à chaque tag `vX.Y.Z` poussé :

```
git tag v0.6.14
git push origin v0.6.14
```

Le workflow empaquette `system.json`, `template.json`, `antique.mjs`, `css/`, `lang/`, `module/`, `templates/`, `fonts/` et les compendiums (`packs/*.db`, `packs/token/`) dans `system.zip`, puis crée une release GitHub avec ce zip et `system.json` en assets.

`manifest` et `download` dans `system.json` pointent vers `releases/latest/download/...` : l'URL reste stable d'une version à l'autre, donc l'installation/mise à jour via manifeste dans Foundry (`https://github.com/SotarS21/jdr_antik/releases/latest/download/system.json`) fonctionnera automatiquement dès que le dépôt sera public.

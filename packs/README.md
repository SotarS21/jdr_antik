# 📦 Dossier Packs - Système Antique

**Dernière mise à jour :** 24/04/2026  
**Version système :** 0.6.1

---

## 📂 Contenu du Dossier

| Fichier/Dossier | Description |
|-----------------|-------------|
| `*.db` | Fichiers des compendiums (LevelDB) |
| `node_modules/` | Dépendances npm pour les scripts |
| `_*.js` | Scripts utilitaires pour la gestion des compendiums |
| `_*.bat` | Scripts Windows pour l'installation |
| `*.md` | Documentation |

---

## 🚀 Guide d'Utilisation

### 1️⃣ Prérequis

- **Foundry VTT v12+** (recommandé v14)
- **Node.js v16+** (pour exécuter les scripts)
- **foundryvtt-cli** (pour gérer les compendiums)

#### Installation des dépendances

```bash
# Installer Node.js (si ce n'est pas déjà fait)
# Exécuter le script Windows :
INSTALL_NODEJS.bat

# Ou installer manuellement depuis : https://nodejs.org/

# Installer les dépendances npm
cd C:\projet\VTT_Foundry\antique\packs
npm install classic-level
```

---

### 2️⃣ Scripts Disponibles

#### 🎯 Gestion des Avantages

| Script | Description | Commande |
|--------|-------------|----------|
| `_add-advantages-effects-V2.js` | **Recommandé** - Script interactif pour ajouter/retirer des effets aux avantages | `node _add-advantages-effects-V2.js` |
| `_add-advantages-effects.js` | Version simple pour ajouter les effets manquants | `node _add-advantages-effects.js` |

**Options du script V2 :**
```bash
# Mode interactif (par défaut)
node _add-advantages-effects-V2.js

# Lister tous les avantages
node _add-advantages-effects-V2.js list

# Lister les avantages AVEC effets
node _add-advantages-effects-V2.js list-with

# Lister les avantages SANS effets
node _add-advantages-effects-V2.js list-without

# Ajouter les effets manquants
node _add-advantages-effects-V2.js add

# Aide
node _add-advantages-effects-V2.js help
```

#### 📋 Documentation

| Fichier | Description |
|---------|-------------|
| `LISTE_AVANTAGES_COMPLETE.md` | Liste complète des 94 avantages avec leurs effets |
| `MACROS_AURAS_DIVINES.md` | Macros pour gérer les 15 auras divines |
| `INSTALL_NODEJS.bat` | Script Windows pour installer Node.js |

---

## 📊 Compendiums

### Avantages (94 entrées)

- **20 avantages** ont déjà des **ActiveEffects** mécaniques
- **12 avantages** sont **à mettre à jour** (priorité haute)
- **62 avantages** sont **passifs/narratifs** (texte seulement)

** Stats après exécution du script :**
- ✅ 32 avantages avec effets mécaniques
- ⚠️ 62 avantages avec description textuelle

### Autres Compendiums

- `armes.db` - Armes, armures & boucliers (150+)
- `equipement.db` - Équipement & potions (100+)
- `avantages-divins.db` - Avantages divins (20+)
- `benedictions.db` - Bénédictions divines (30+)
- `desavantages.db` - Désavantages PJ (50+)
- `pnj.db` - Personnages & PNJ (80+)
- `dieux.db` - Divinités grecques (25+)
- `creatures.db` - Créatures mythologiques (40+)
- `historique.db` - Historique aléatoire (RollTable)
- `alchimie.db` - Recettes alchimiques (30+)
- `sorts/` - Sorts & rituels (60+, en cours)

---

## 🎯 Étapes pour Mettre à Jour les Avantages

### Méthode Recommandée (Automatique)

```bash
# 1. Fermer Foundry VTT
# 2. Ouvrir un terminal dans ce dossier
cd C:\projet\VTT_Foundry\antique\packs

# 3. Exécuter le script interactif
node _add-advantages-effects-V2.js

# 4. Choisir l'option 4 pour ajouter les effets manquants
# 5. Appuyer sur ENTRÉE pour confirmer
# 6. Nettoyer le cache
fvtt package clear

# 7. Redémarrer Foundry VTT
```

### Méthode Alternative ( Manuel )

1. Dans Foundry, ouvrir le compendium **"Avantages"**
2. Pour chaque avantage dans la liste ci-dessous, ajouter un **ActiveEffect**
3. Voir `LISTE_AVANTAGES_COMPLETE.md` pour les détails

---

## 📋 Liste des Avantages à Mettre à Jour (Priorité)

### Priorité 1 : Effets Mécaniques Simples (12)

| Nom | Effet à Ajouter | Statut |
|-----|----------------|--------|
| Guerrier Aguerri | +2 `armeBlanche.bonus` | ⏳ |
| Commerçant | +2 `marchandage.bonus` | ⏳ |
| Visage passe-partout | +2 `discretion.bonus` | ⏳ |
| Colère de Zeus | +3 `armeBlanche.bonus` | ⏳ |
| Respect d'Héra | +2 `psychologie.bonus` | ⏳ |
| Beauté d'Aphrodite | +2 `seduction.bonus` | ⏳ |
| Mains d'Hermès | +2 `escamotage.bonus` | ⏳ |
| Ami des animaux | +2 `dressage.bonus` | ⏳ |
| Maître d'Arme | +2 `armeBlanche.bonus` | ⏳ |
| Maître des forges | +2 `artisanatFor.bonus` | ⏳ |
| Talent d'Héphaïstos | +3 `armeBlanche.bonus` | ⏳ |
| Talent de Dionysos | +2 `robustesse.base` | ⏳ |

### Priorité 2 : Auras Divines (15)

Ces avantages nécessitent des **macros** car ils affectent toute l'équipe.

| Nom | Dévotion | Effet | Macro Nécessaire |
|-----|----------|-------|------------------|
| Aura de Zeus | Zeus | Force équipe +2 | ✅ |
| Aura d'Héra | Hera | Astuce équipe +2 | ✅ |
| Aura de Poséidon | Poseïdon | Constitution équipe +2 | ✅ |
| Aura d'Athéna | Athéna | Force équipe +2 | ✅ |
| Aura d'Arès | Arès | Force équipe +2 | ✅ |
| Aura de Démeter | Démeter | Constitution équipe +2 | ✅ |
| Aura d'Apollon | Apollon | Astuce équipe +2 | ✅ |
| Aura d'Artémis | Artémis | Dextérité équipe +2 | ✅ |
| Aura d'Héphaïstos | Héphaïstos | Force équipe +2 | ✅ |
| Aura d'Aphrodite | Aphrodite | Charisme équipe +2 | ✅ |
| Aura d'Hermes | Hermes | Dextérité'équipe +2 | ✅ |
| Aura de Dionysos | Dionysos | Charisme équipe +2 | ✅ |
| Aura d'Hestia | Hestia | Charisme équipe +2 | ✅ |
| Aura d'Hécate | Hécate | Astuce équipe +2 | ✅ |
| Aura d'Hadès | Hadès | Constitution équipe +2 | ✅ |

> Voir `MACROS_AURAS_DIVINES.md` pour le code des macros.

### Priorité 3 : Effets Complexes (7)

Ces avantages nécessitent une **gestion manuelle** ou un **script avancé** :

| Nom | Effet | Solution |
|-----|-------|----------|
| Connaissance d'Héphaïstos | Réduit CA adverse de 2 | Script de combat |
| Mire d'Artémis | Dégâts à distance +3 | Non standard dans Foundry |
| Charme d'Aphrodite | Réduit jet de touche de -2 | Macro personnalisée |
| Rage d'Arès | Deux attaques/tour | Macro |
| Amphore de Dionysos | Récupérer tous PV avec alcool | Script |
| Armure d'Arès | Frénésie après 2 kills | Script de suivi |
| Peau d'Hadès | PV ×2 | Script de modification PV |

---

## 🎨 Macros pour les Auras Divines

Une **macro universelle** est disponible dans `MACROS_AURAS_DIVINES.md` :

- **1 seule macro** pour gérer toutes les auras
- **Interface graphique** avec sélection des auras disponibles
- **Activation/Désactivation** automatique pour tous les alliés dans un rayon de 30 pieds
- **Messages de feedback** dans le chat

### Comment créer la macro :

1. Dans Foundry, aller dans l'onglet **"Macros"** (ou appuyer sur **M**)
2. Cliquer sur **"Create Macro"**
3. Configurer :
   - **Name** : `Auras Divines - Gestionnaire`
   - **Icon** : `icons/svg/aura.svg`
   - **Type** : `Script`
   - **Scope** : `Global`
4. Copier-coller le code de la **macro universelle** depuis `MACROS_AURAS_DIVINES.md`
5. **Sauvegarder**

---

## 📝 CSS Recommandés

Ajouter ces styles à votre fichier `antique/css/antique.css` pour améliorer l'affichage des messages :

```css
/* Styles pour les messages des auras divines */
.antique .aura-message {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid #a8c0ff;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.antique .aura-message h3 {
  margin: 0 0 10px 0;
  padding: 0;
}

.antique .aura-message .fas {
  margin-right: 8px;
}

/* Styles pour le menu des auras */
.antique .aura-menu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 20px;
  color: white;
}

.antique .aura-menu div[onclick] {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 8px;
  margin: 5px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.antique .aura-menu div[onclick]:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

---

## 🔧 Commandes Utiles

### Gestion des Compendiums

```bash
# Extraire un compendium en JSON pour édition
fvtt package unpack "avantages" --out ./_source/avantages

# Reconstruire le compendium après modification
fvtt package pack "avantages" --in ./_source/avantages

# Nettoyer le cache (TOUJOURS faire après toute modification)
fvtt package clear
```

### Vérification

```bash
# Lister tous les avantages
node _add-advantages-effects-V2.js list

# Vérifier les avantages avec effets
node _add-advantages-effects-V2.js list-with

# Vérifier les avantages sans effets
node _add-advantages-effects-V2.js list-without
```

---

## 💡 Conseils

### Pour les Développeurs

1. **Toujours fermer Foundry** avant d'exécuter les scripts
2. **Faire des sauvegardes** des compendiums avant toute modification
3. **Tester** chaque modification dans Foundry
4. **Utiliser Git** pour versionner vos modifications

### Pour les MJ

1. **Créer un dossier "Auras Divines"** dans vos macros
2. **Donner les permissions aux joueurs** pour activer leurs propres auras
3. **Expliquer le mécanisme** aux joueurs
4. **Vérifier périodiquement** que les bonus sont correctement appliqués

### Pour les Joueurs

1. **Vérifier que vous possédez bien l'avantage** avant d'essayer de l'activer
2. **Désactiver l'aura** quand vous quittez le groupe ou qu'elle n'est plus nécessaire
3. **Signaler au MJ** si un bonus ne semble pas s'appliquer correctement

---

## ⚠️ Problèmes Courants et Solutions

### Problème : Les modifications ne s'affichent pas dans Foundry

**Solution :**
```bash
# Nettoyer le cache CLI
fvtt package clear

# Supprimer manuellement le cache Foundry
# Fermer Foundry
# Supprimer : D:\AppDataFoundry$\FoundryVTT_Data\Cache\
# Redémarrer Foundry
```

### Problème : Erreur "Cannot find module 'classic-level'"

**Solution :**
```bash
cd C:\projet\VTT_Foundry\antique\packs
npm install classic-level
```

### Problème : Node.js n'est pas installé

**Solution :**
```bash
# Exécuter le script d'installation Windows
INSTALL_NODEJS.bat

# Ou installer manuellement depuis : https://nodejs.org/
```

### Problème : Permission refusée sur les fichiers .db

**Solution :**
- Fermer **toutes** les instances de Foundry VTT
- Vérifier qu'aucun autre programme n'utilise les fichiers
- Exécuter le terminal **en tant qu'administrateur** si nécessaire

---

## 📚 Documentation

- **[LISTE_AVANTAGES_COMPLETE.md](./LISTE_AVANTAGES_COMPLETE.md)** - Liste complète des 94 avantages avec leurs effets
- **[MACROS_AURAS_DIVINES.md](./MACROS_AURAS_DIVINES.md)** - Macros pour gérer les auras divines
- **[CAHIER_DES_CHARGES.md](../../CAHIER_DES_CHARGES.md)** - Spécifications complètes du système
- **[DOCUMENTATION.md](../../DOCUMENTATION.md)** - Guide utilisateur

---

## 🔗 Liens Utiles

- [Foundry VTT](https://foundryvtt.com/)
- [foundryvtt-cli](https://github.com/foundryvtt/foundryvtt-cli)
- [Node.js](https://nodejs.org/)

---

---

*Dernière mise à jour : 24/04/2026*
*© 2025 Mr Banane, Florico - Système Antique pour Foundry VTT*

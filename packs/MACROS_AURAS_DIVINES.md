# 🔮 Macros pour les Auras Divines - Système Antique

**version :** 1.0  
**Auteur :** Mistral Vibe  
**Date :** 24/04/2026  

---

## 📌 Introduction

Les **Auras Divines** (coût -3) sont des avantages spéciaux qui offrent des bonus à **toute l'équipe**. Contrairement aux autres avantages qui s'appliquent directement au personnage, les auras nécessitent une **gestion via macros** dans Foundry VTT.

Ce document fournit **15 macros** prêtes à l'emploi pour chaque aura divine.

---

## 📋 Liste des Auras Divines

| # | Nom | Dévotion | Effet | Type |
|---|-----|----------|-------|------|
| 1 | Aura de Zeus | Zeus | Force équipe +2 | Caractéristique |
| 2 | Aura d'Héra | Hera | Astuce équipe +2 | Caractéristique |
| 3 | Aura de Poséidon | Poseïdon | Constitution équipe +2 | Caractéristique |
| 4 | Aura d'Athéna | Athéna | Force équipe +2 | Caractéristique |
| 5 | Aura d'Arès | Arès | Force équipe +2 | Caractéristique |
| 6 | Aura de Démeter | Demeter | Constitution équipe +2 | Caractéristique |
| 7 | Aura d'Apollon | Apollon | Astuce équipe +2 | Caractéristique |
| 8 | Aura d'Artémis | Artémis | Dextérité équipe +2 | Caractéristique |
| 9 | Aura d'Héphaïstos | Héphaïstos | Force équipe +2 | Caractéristique |
| 10 | Aura d'Aphrodite | Aphrodite | Charisme équipe +2 | Caractéristique |
| 11 | Aura d'Hermes | Hermes | Dextérité équipe +2 | Caractéristique |
| 12 | Aura de Dionysos | Dionysos | Charisme équipe +2 | Caractéristique |
| 13 | Aura d'Hestia | Hestia | Charisme équipe +2 | Caractéristique |
| 14 | Aura d'Hécate | Hécate | Astuce équipe +2 | Caractéristique |
| 15 | Aura d'Hadès | Hadès | Constitution équipe +2 | Caractéristique |

---

## 🎯 Comment Créer une Macro dans Foundry

1. **Ouvrir Foundry VTT**
2. **Aller dans l'onglet "Macros"** (ou appuyer sur **M**)
3. **Cliquer sur "Create Macro"**
4. **Configurer la macro :**
   - **Name** : Nom de la macro (ex: "Aura de Zeus - Activer")
   - **Icon** : Choisir une icône appropriée (ex: `icons/svg/aura.svg`)
   - **Type** : `Script`
   - **Scope** : `Global` (pour que tous les joueurs puissent l'utiliser)
5. **Copier-coller le code JavaScript** de la macro ci-dessous
6. **Sauvegarder**
7. **Répéter** pour chaque aura

---

## 📜 Macro Générique (Recommandée)

Cette macro **unique** gère **toutes les auras** en une seule !

### Code de la Macro Universelle

```javascript
// ============================================================================
// MACRO: Gestion Universelle des Auras Divines
// Système: Antique pour Foundry VTT
// Auteur: Mistral Vibe
// ============================================================================

/**
 * Mapping des auras divines
 * Clé = nom de l'avantage (doit correspondre exactement)
 * Valeur = { characteristic, bonus, devotion }
 */
const AURAS = {
  // Force
  "Aura de Zeus": { characteristic: "for", bonus: 2, devotion: "Zeus" },
  "Aura d'Athéna": { characteristic: "for", bonus: 2, devotion: "Athéna" },
  "Aura d'Arès": { characteristic: "for", bonus: 2, devotion: "Arès" },
  "Aura d'Héphaïstos": { characteristic: "for", bonus: 2, devotion: "Héphaïstos" },
  
  // Astuce
  "Aura d'Héra": { characteristic: "ast", bonus: 2, devotion: "Héra" },
  "Aura d'Apollon": { characteristic: "ast", bonus: 2, devotion: "Apollon" },
  "Aura d'Hécate": { characteristic: "ast", bonus: 2, devotion: "Hécate" },
  
  // Constitution
  "Aura de Poséidon": { characteristic: "con", bonus: 2, devotion: "Poséidon" },
  "Aura de Démeter": { characteristic: "con", bonus: 2, devotion: "Démeter" },
  "Aura d'Hadès": { characteristic: "con", bonus: 2, devotion: "Hadès" },
  
  // Dextérité
  "Aura d'Artémis": { characteristic: "dex", bonus: 2, devotion: "Artémis" },
  "Aura d'Hermes": { characteristic: "dex", bonus: 2, devotion: "Hermes" },
  
  // Charisme
  "Aura d'Aphrodite": { characteristic: "cha", bonus: 2, devotion: "Aphrodite" },
  "Aura de Dionysos": { characteristic: "cha", bonus: 2, devotion: "Dionysos" },
  "Aura d'Hestia": { characteristic: "cha", bonus: 2, devotion: "Hestia" }
};

// Rayon de l'aura en cases (mètres dans Foundry)
const AURA_RANGE = 30; // 30 pieds = ~9 mètres

// Durée de l'effet en rounds (0 = permanent jusqu'à désactivation)
const EFFECT_DURATION = 0;

// ============================================================================
// FONCTIONS
// ============================================================================

/**
 * Trouve l'avantage aura sur un acteur
 */
function findAuraAdvantage(actor, auraName) {
  return actor.items.find(item => 
    item.type === "advantage" && 
    item.name === auraName
  );
}

/**
 * Trouve les alliés dans le rayon
 */
function getAlliesInRange(sourceToken, range) {
  if (!canvas || !canvas.tokens) return [];
  
  const source = sourceToken || canvas.tokens.controlled[0];
  if (!source) {
    ui.notifications.warn("Aucun jeton sélectionné ou contrôlé !");
    return [];
  }
  
  return canvas.tokens.placeables.filter(token => {
    if (!token.actor) return false;
    if (token === source) return true; // Inclure le porteur
    if (token.disposition <= 0) return false; // Exclure les ennemis/neutres
    
    // Vérifier la distance
    const distance = canvas.grid.measureDistance(source, token);
    return distance <= range;
  });
}

/**
 * Applique l'aura à un acteur
 */
async function applyAuraToActor(targetActor, auraName, auraData) {
  const { characteristic, bonus, devotion } = auraData;
  
  // Vérifier si l'effet existe déjà
  const existingEffect = targetActor.effects.find(e => 
    e.name === `Aura: ${auraName}` || 
    e.name === auraName ||
    (e.flags?.antique?.auraName === auraName)
  );
  
  if (existingEffect) {
    // Mettre à jour si nécessaire
    if (existingEffect.disabled) {
      await existingEffect.update({ disabled: false });
    }
    return { updated: true, message: `Aura déjà active sur ${targetActor.name}` };
  }
  
  // Créer le nouvel effet
  const newEffect = {
    name: `Aura: ${auraName}`,
    icon: "icons/svg/aura.svg",
    changes: [
      {
        key: `system.abilities.${characteristic}.mod`,
        mode: 2, // Add
        value: bonus
      }
    ],
    disabled: false,
    duration: EFFECT_DURATION > 0 ? { rounds: EFFECT_DURATION } : {},
    flags: {
      antique: {
        auraName: auraName,
        devotion: devotion,
        characteristic: characteristic,
        source: game.actors.current?.id || ""
      }
    },
    tint: null,
    origin: game.actors.current?.uuid || null
  };
  
  await targetActor.createEmbeddedDocuments("ActiveEffect", [newEffect]);
  return { updated: false, message: `Aura activée sur ${targetActor.name}` };
}

/**
 * Retire l'aura d'un acteur
 */
async function removeAuraFromActor(targetActor, auraName) {
  const existingEffect = targetActor.effects.find(e => 
    e.name === `Aura: ${auraName}` || 
    e.name === auraName ||
    (e.flags?.antique?.auraName === auraName)
  );
  
  if (existingEffect) {
    await targetActor.deleteEmbeddedDocuments("ActiveEffect", [existingEffect.id]);
    return true;
  }
  return false;
}

/**
 * Active une aura pour toute l'équipe
 */
async function activateAura(auraName) {
  const speaker = ChatMessage.getSpeaker();
  const sourceActor = await fromUuid(speaker.actor);
  
  if (!sourceActor) {
    ui.notifications.error("Aucun acteur source trouvé !");
    return;
  }
  
  // Vérifier que l'acteur a l'avantage
  const auraAdvantage = findAuraAdvantage(sourceActor, auraName);
  
  if (!auraAdvantage) {
    ui.notifications.warn(`Vous n'avez pas l'avantage "${auraName}" !`);
    return;
  }
  
  const auraData = AURAS[auraName];
  if (!auraData) {
    ui.notifications.error(`Aura inconnue: ${auraName}`);
    return;
  }
  
  // Trouver les alliés dans le rayon
  const sourceToken = canvas.tokens.placeables.find(t => t.actor?.id === sourceActor.id);
  const allies = getAlliesInRange(sourceToken, AURA_RANGE);
  
  if (allies.length === 0) {
    ui.notifications.warn("Aucun allié trouvé dans le rayon de l'aura !");
    return;
  }
  
  // Messages de feedback
  const results = [];
  
  for (const token of allies) {
    const targetActor = token.actor;
    if (!targetActor) continue;
    
    const result = await applyAuraToActor(targetActor, auraName, auraData);
    results.push(result);
  }
  
  // Afficher le résumé dans le chat
  const activatedCount = results.length;
  const messageContent = `
    <div class="antique aura-message">
      <h3 style="color: #4CAF50; margin-bottom: 10px;">
        <i class="fas fa-sun"></i> Aura Activée: ${auraName}
      </h3>
      <p><strong>Dévotion:</strong> ${auraData.devotion}</p>
      <p><strong>Bonus:</strong> +${auraData.bonus} ${CONFIG.ANTIQUE.abilities[auraData.characteristic] || auraData.characteristic}</p>
      <p><strong>Cibles:</strong> ${activatedCount} personnage(s) affecté(s)</p>
      <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
        <i class="fas fa-info-circle"></i> Rayon: ${AURA_RANGE} pieds
      </p>
    </div>
  `;
  
  await ChatMessage.create({
    speaker: speaker,
    content: messageContent
  });
  
  ui.notifications.info(`Aura ${auraName} activée pour ${activatedCount} personnage(s)`);
}

/**
 * Désactive une aura pour toute l'équipe
 */
async function deactivateAura(auraName) {
  const speaker = ChatMessage.getSpeaker();
  const sourceActor = await fromUuid(speaker.actor);
  
  if (!sourceActor) {
    ui.notifications.error("Aucun acteur source trouvé !");
    return;
  }
  
  // Trouver les alliés dans le rayon
  const sourceToken = canvas.tokens.placeables.find(t => t.actor?.id === sourceActor.id);
  const allies = getAlliesInRange(sourceToken, AURA_RANGE);
  
  // Retirer l'aura de tous les alliés
  let removedCount = 0;
  
  for (const token of allies) {
    const targetActor = token.actor;
    if (!targetActor) continue;
    
    const removed = await removeAuraFromActor(targetActor, auraName);
    if (removed) removedCount++;
  }
  
  if (removedCount > 0) {
    await ChatMessage.create({
      speaker: speaker,
      content: `
        <div class="antique aura-message">
          <h3 style="color: #F44336;">
            <i class="fas fa-moon"></i> Aura Désactivée: ${auraName}
          </h3>
          <p>${removedCount} personnage(s) ne sont plus affectés</p>
        </div>
      `
    });
    ui.notifications.info(`Aura ${auraName} désactivée pour ${removedCount} personnage(s)`);
  } else {
    ui.notifications.warn(`Aucune aura ${auraName} active trouvée`);
  }
}

/**
 * Affiche le menu des auras
 */
async function showAuraMenu() {
  const speaker = ChatMessage.getSpeaker();
  const sourceActor = await fromUuid(speaker.actor);
  
  if (!sourceActor) {
    ui.notifications.error("Aucun acteur sélectionné !");
    return;
  }
  
  // Trouver toutes les auras que le personnage possède
  const availableAuras = sourceActor.items.filter(item => 
    item.type === "advantage" && 
    AURAS[item.name] !== undefined
  );
  
  if (availableAuras.length === 0) {
    ui.notifications.warn("Vous ne possédez aucune aura divine !");
    return;
  }
  
  // Construire le contenu du menu
  let content = `
    <div class="antique aura-menu">
      <h2 style="color: #2196F3; text-align: center;">
        <i class="fas fa-star"></i> Auras Divines
      </h2>
      <p style="text-align: center; margin-bottom: 20px;">
        Sélectionnez une aura à activer/désactiver
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
  `;
  
  availableAuras.forEach(aura => {
    const auraData = AURAS[aura.name];
    const characteristicName = CONFIG.ANTIQUE?.abilities?.[auraData.characteristic] || auraData.characteristic;
    
    content += `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  padding: 15px; border-radius: 8px; color: white; cursor: pointer;
                  transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
           onclick=" activateAuraFromMenu('${aura.name.replace(/'/g, "\\'")}')">
        <h4 style="margin: 0 0 5px 0;">${aura.name}</h4>
        <p style="margin: 0; font-size: 0.9em;">
          <i class="fas fa-fire"></i> +${auraData.bonus} ${characteristicName}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 0.8em; opacity: 0.9;">
          ${auraData.devotion}
        </p>
      </div>
    `;
  });
  
  content += `
      </div>
      <p style="text-align: center; margin-top: 20px; font-size: 0.8em; color: #666;">
        Cliquez sur une aura pour l'activer. Exécutez à nouveau pour la désactiver.
      </p>
    </div>
    
    <script>
      function activateAuraFromMenu(auraName) {
        // Envoyer l ACTION via game.socket
        game.socket.emit('module.antique', { 
          type: 'toggleAura', 
          auraName: auraName,
          actorId: '${sourceActor.id}'
        });
        
        // Ou simplement appeler la fonction via le chat
        // (Alternative pour les versions sans socket)
        game.antique?.toggleAura(auraName);
        
        // Fermer le message
        event.currentTarget.closest('.message').style.display = 'none';
      }
    </script>
  `;
  
  await ChatMessage.create({
    speaker: speaker,
    content: content
  });
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

// S'enregistrer dans l'espace global pour accès via d'autres scripts
game.antique = game.antique || {};
game.antique.AURAS = AURAS;
game.antique.activateAura = activateAura;
game.antique.deactivateAura = deactivateAura;
game.antique.showAuraMenu = showAuraMenu;

// Fonction principale appelée quand la macro est exécutée
async function main() {
  const speaker = ChatMessage.getSpeaker();
  
  // Si un argument est passé (nom de l'aura), activer/désactiver cette aura
  if (args && args[0]) {
    const auraName = args.join(' ');
    const sourceActor = await fromUuid(speaker.actor);
    
    if (!sourceActor) {
      ui.notifications.error("Aucun acteur source trouvé !");
      return;
    }
    
    // Vérifier si l'aura est déjà active sur le personnage
    const hasActiveAura = sourceActor.effects.some(e => 
      e.name === `Aura: ${auraName}` || 
      e.flags?.antique?.auraName === auraName
    );
    
    if (hasActiveAura) {
      await deactivateAura(auraName);
    } else {
      await activateAura(auraName);
    }
  } else {
    // Sinon, afficher le menu
    await showAuraMenu();
  }
}

// Exécuter
main().catch(err => {
  console.error("Erreur dans la macro Aura Divine:", err);
  ui.notifications.error(`Erreur: ${err.message}`);
});
```

---

## 📜 Macros Individuelles (Alternative)

Si vous préférez avoir des macros séparées pour chaque aura, voici le template :

### Template de Macro pour une Aura

```javascript
// ============================================================================
// MACRO: Aura de [DEVOTION]
// Exemple: Aura de Zeus
// ============================================================================

const AURA_NAME = "Aura de Zeus";          // Nom exact de l'avantage
const CHARACTERISTIC = "for";               // for, dex, con, int, ast, cha
const BONUS = 2;                           // Valeur du bonus
const DEVOTION = "Zeus";                    // Nom de la dévotion
const AURA_RANGE = 30;                      // Rayon en pieds
const ICON = "icons/svg/lightning-bolt.svg";  // Icône de l'aura

// ============================================================================
// NE PAS MODIFIER CI-DESSOUS
// ============================================================================

/**
 * Active/désactive l'aura pour les alliés
 */
async function toggleAura() {
  const speaker = ChatMessage.getSpeaker();
  const sourceActor = await fromUuid(speaker.actor);
  
  if (!sourceActor) {
    ui.notifications.error("Aucun acteur source trouvé !");
    return;
  }
  
  // Vérifier que l'acteur a l'avantage
  const hasAdvantage = sourceActor.items.some(item => 
    item.type === "advantage" && item.name === AURA_NAME
  );
  
  if (!hasAdvantage) {
    ui.notifications.warn(`Vous n'avez pas l'avantage "${AURA_NAME}" !`);
    return;
  }
  
  // Trouver les alliés dans le rayon
  const sourceToken = canvas.tokens.controlled[0] || 
    canvas.tokens.placeables.find(t => t.actor?.id === sourceActor.id);
  
  if (!sourceToken) {
    ui.notifications.error("Aucun jeton source trouvé !");
    return;
  }
  
  const allies = canvas.tokens.placeables.filter(token => {
    if (!token.actor) return false;
    if (token.disposition <= 0) return false; // Exclure ennemis/neutres
    
    const distance = canvas.grid.measureDistance(sourceToken, token);
    return distance <= AURA_RANGE;
  });
  
  if (allies.length === 0) {
    ui.notifications.warn("Aucun allié trouvé dans le rayon !");
    return;
  }
  
  // Vérifier si l'aura est déjà active
  const hasActiveAura = sourceActor.effects.some(e => 
    e.name === `Aura: ${AURA_NAME}` || e.flags?.antique?.auraName === AURA_NAME
  );
  
  if (hasActiveAura) {
    // Désactiver
    let removedCount = 0;
    for (const token of allies) {
      const targetActor = token.actor;
      if (!targetActor) continue;
      
      const effect = targetActor.effects.find(e => 
        e.name === `Aura: ${AURA_NAME}` || e.flags?.antique?.auraName === AURA_NAME
      );
      
      if (effect) {
        await targetActor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
        removedCount++;
      }
    }
    
    await ChatMessage.create({
      speaker: speaker,
      content: `
        <div class="antique aura-message" style="border-left: 4px solid #F44336;">
          <h3><i class="fas fa-moon"></i> ${AURA_NAME} - Désactivée</h3>
          <p><strong>Dévotion:</strong> ${DEVOTION}</p>
          <p>${removedCount} personnage(s) ne sont plus affectés</p>
        </div>
      `
    });
    
    ui.notifications.info(`Aura désactivée pour ${removedCount} personnage(s)`);
  } else {
    // Activer
    let activatedCount = 0;
    for (const token of allies) {
      const targetActor = token.actor;
      if (!targetActor) continue;
      
      // Vérifier si l'effet existe déjà
      const existingEffect = targetActor.effects.find(e => 
        e.name === `Aura: ${AURA_NAME}` || e.flags?.antique?.auraName === AURA_NAME
      );
      
      if (existingEffect && !existingEffect.disabled) {
        continue; // Déjà actif
      }
      
      const newEffect = {
        name: `Aura: ${AURA_NAME}`,
        icon: ICON,
        changes: [
          {
            key: `system.abilities.${CHARACTERISTIC}.mod`,
            mode: 2,
            value: BONUS
          }
        ],
        disabled: false,
        duration: {},
        flags: {
          antique: {
            auraName: AURA_NAME,
            devotion: DEVOTION,
            characteristic: CHARACTERISTIC
          }
        },
        tint: null
      };
      
      await targetActor.createEmbeddedDocuments("ActiveEffect", [newEffect]);
      activatedCount++;
    }
    
    await ChatMessage.create({
      speaker: speaker,
      content: `
        <div class="antique aura-message" style="border-left: 4px solid #4CAF50;">
          <h3><i class="fas fa-sun"></i> ${AURA_NAME} - Activée</h3>
          <p><strong>Dévotion:</strong> ${DEVOTION}</p>
          <p><strong>Bonus:</strong> +${BONUS} ${CONFIG.ANTIQUE?.abilities?.[CHARACTERISTIC] || CHARACTERISTIC}</p>
          <p><strong>Cibles:</strong> ${activatedCount} personnage(s) affectés</p>
          <p style="font-size: 0.9em; margin-top: 10px;">
            <i class="fas fa-ruler"></i> Rayon: ${AURA_RANGE} pieds
          </p>
        </div>
      `
    });
    
    ui.notifications.info(`Aura activée pour ${activatedCount} personnage(s)`);
  }
}

// Exécuter
toggleAura().catch(err => {
  console.error("Erreur:", err);
  ui.notifications.error(`Erreur: ${err.message}`);
});
```

### Exemple pour Aura de Zeus

```javascript
const AURA_NAME = "Aura de Zeus";
const CHARACTERISTIC = "for";
const BONUS = 2;
const DEVOTION = "Zeus";
const AURA_RANGE = 30;
const ICON = "icons/svg/lightning-bolt.svg";
// ... (le reste du code est identique)
```

---

## 🎨 Styles CSS pour les Messages

Pour que les messages des auras soient plus beaux, ajouter ces styles dans votre **antique.css** :

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

.antique .aura-menu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 20px;
  color: white;
}

.antique .aura-menu h2 {
  margin: 0 0 20px 0;
  text-align: center;
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

.antique .aura-menu div[onclick}:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.antique .aura-menu div[onclick] h4 {
  margin: 0;
}

.antique .aura-menu .fas {
  margin-right: 8px;
}
```

---

## 🎯 Configuration Recommandée

### 1. Créer une Macro par Aura (15 macros)
- **Avantage** : Contrôle fin sur chaque aura
- **Inconvénient** : Beaucoup de macros à créer

### 2. Créer une Seule Macro Universelle (Recommandé ⭐)
- **Avantage** : Une seule macro pour gérer tout
- **Inconvénient** : Moins de personnalisation par aura

### 3. Créer des Catégories de Macros
- **1 macro pour les auras de Force** (Zeus, Athéna, Arès, Héphaïstos)
- **1 macro pour les auras d'Astuce** (Héra, Apollon, Hécate)
- **1 macro pour les auras de Constitution** (Poséidon, Démeter, Hadès)
- **1 macro pour les auras de Dextérité** (Artémis, Hermes)
- **1 macro pour les auras de Charisme** (Aphrodite, Dionysos, Hestia)

---

## 💡 Conseils d'Utilisation

### Pour le MJ :
1. **Créer un dossier "Auras Divines"** dans vos macros pour les organiser
2. **Donner les permissions** aux joueurs pour qu'ils puissent activer leurs propres auras
3. **Expliquer le mécanisme** : les auras sont automatiquement appliquées à tous les alliés dans un rayon de 30 pieds

### Pour les Joueurs :
1. **Vérifier que vous avez bien l'avantage** dans votre feuille de personnage
2. **Modifier la macro** si vous changiez de dévotion (remplacer le nom de l'aura)
3. **Désactiver l'aura** quand elle n'est plus nécessaire (pour éviter les cumul de bonus)

---

## ⚠️ Limitations et Solutions

### Problème : Les bonus sont cumulatifs
**Solution :**
- Les auras avec le même nom ne s'appliquent qu'une seule fois
- Si plusieurs joueurs ont la même aura, le bonus sera appliqué plusieurs fois (c'est normal dans le lore)

### Problème : L'aura persiste après la mort du porteur
**Solution :**
- La macro vérifie automatiquement les alliés dans le rayon
- Si le porteur meurt ou quitte la zone, l'aura reste active jusqu'à désactivation manuelle
- Vous pouvez ajouter un script qui vérifie périodiquement la présence du porteur

### Problème : Les bonus ne sont pas visibles dans la feuille
**Solution :**
- Les ActiveEffects apparaissent dans l'onglet "Effects" des personnages affectés
- Les modificateurs de caractéristiques sont recalculés automatiquement par Foundry

---

## 📊 Tableau Récapitulatif

| Dévotion | Caractéristique | Aura ID | Macro Needed |
|----------|-----------------|---------|---------------|
| Zeus | Force | aAdv000000000037 | ✅ |
| Héra | Astuce | aAdv000000000041 | ✅ |
| Poséidon | Constitution | aAdv000000000045 | ✅ |
| Athéna | Force | aAdv000000000049 | ✅ |
| Arès | Force | aAdv000000000053 | ✅ |
| Démeter | Constitution | aAdv000000000057 | ✅ |
| Apollon | Astuce | aAdv000000000061 | ✅ |
| Artémis | Dextérité | aAdv000000000065 | ✅ |
| Héphaïstos | Force | aAdv000000000069 | ✅ |
| Aphrodite | Charisme | aAdv000000000073 | ✅ |
| Hermès | Dextérité | aAdv000000000077 | ✅ |
| Dionysos | Charisme | aAdv000000000081 | ✅ |
| Hestia | Charisme | aAdv000000000085 | ✅ |
| Hécate | Astuce | aAdv000000000089 | ✅ |
| Hadès | Constitution | aAdv000000000093 | ✅ |

---

## 🔗 Liens Utiles

- [Documentation Foundry sur les Macros](https://foundryvtt.com/article/macros/)
- [Documentation sur les ActiveEffects](https://foundryvtt.com/article/active-effects/)
- [API Foundry pour les Développeurs](https://foundryvtt.com/api/)

---

*Documentation des Macros pour les Auras Divines*
*© 2025 Mr Banane, Florico - Système Antique pour Foundry VTT*

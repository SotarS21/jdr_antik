// ============================================================================
// Script: Ajout des ActiveEffects aux avantages du compendium "Avantages"
// Auteur: Mistral Vibe
// Date: 2025
// Description: Ajoute des effets mécaniques (ActiveEffects) aux avantages qui n'en ont pas
// ============================================================================

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

/**
 * Mapping complet de TOUS les avantages avec leurs ActiveEffects suggérés
 * Clé = _id de l'avantage dans le compendium
 * Valeur = { name, changes: Array<{key, mode, value}>, transfer? } 
 *    - Si changes.length === 0, on ne fait rien (effet passif/narratif)
 *    - Si changes.length > 0, on ajoute un ActiveEffect
 */
const ADVANTAGE_EFFECTS = {
  // ==========================================================================
  // COÛT -1 : Avantages généraux
  // ==========================================================================
  "aAdv000000000001": {
    name: "Guerrier Aguerri",
    changes: [
      { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000002": {
    name: "Sens aiguisé",
    changes: [
      { key: "system.skills.perception.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000003": {
    name: "Équilibre félin",
    changes: [] // Effet passif: Pas de malus terrain difficile
  },
  "aAdv000000000004": {
    name: "Fêtard",
    changes: [] // Effet passif: Immunité alcool/manque sommeil
  },
  "aAdv000000000005": {
    name: "Bon sens",
    changes: [] // Effet passif: Voix conseillère
  },
  "aAdv000000000006": {
    name: "Sens artistique",
    changes: [
      { key: "system.skills.representation.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000007": {
    name: "Athlète",
    changes: [] // Effet passif: Déplacement x2
  },
  "aAdv000000000008": {
    name: "Sang froid",
    changes: [
      { key: "system.saves.volonte.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000009": {
    name: "Commerçant",
    changes: [
      { key: "system.skills.marchandage.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000010": {
    name: "Visage passe-partout",
    changes: [
      { key: "system.skills.discretion.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000011": {
    name: "Peau dense",
    changes: [
      { key: "system.ca.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000012": {
    name: "Mule",
    changes: [] // Effet passif: Capacité kg x2
  },
  "aAdv000000000013": {
    name: "Vif",
    changes: [
      { key: "system.saves.reflexes.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000014": {
    name: "Cuir de Héros",
    changes: [
      { key: "system.saves.robustesse.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000015": {
    name: "Pisteur",
    changes: [
      { key: "system.skills.vigueur.bonus", mode: 2, value: 2 },
      { key: "system.skills.nature.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000016": {
    name: "Sommeil léger",
    changes: [] // Effet passif: Réveil sudden
  },
  "aAdv000000000017": {
    name: "Faveur",
    changes: [] // Effet passif: Faveur d'un lambda
  },

  // ==========================================================================
  // COÛT -1 : Avantages divins
  // ==========================================================================
  "aAdv000000000035": {
    name: "Colère de Zeus",
    changes: [
      { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }
    ]
  },
  "aAdv000000000039": {
    name: "Respect d'Héra",
    changes: [
      { key: "system.skills.psychologie.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000043": {
    name: "Branchies de Poséidon",
    changes: [] // Effet passif: Régénération 1d6/lvl avec eau
  },
  "aAdv000000000047": {
    name: "Protection d'Athéna",
    changes: [
      { key: "system.ca.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000051": {
    name: "Rage d'Arès",
    changes: [] // Effet passif: Deux attaques/tour
  },
  "aAdv000000000055": {
    name: "Cuisine de Déméter",
    changes: [] // Effet passif: Rations régénératives 10 PV
  },
  "aAdv000000000059": {
    name: "Soin d'Apollon",
    changes: [] // Effet passif: Stabiliser allié 2/j
  },
  "aAdv000000000063": {
    name: "Chasse d'Artémis",
    changes: [
      { key: "system.skills.nature.bonus", mode: 2, value: 2 },
      { key: "system.skills.vigueur.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000067": {
    name: "Connaissance d'Héphaïstos",
    changes: [] // Effet passif: Réduit CA adverse de 2
  },
  "aAdv000000000071": {
    name: "Beauté d'Aphrodite",
    changes: [
      { key: "system.skills.seduction.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000075": {
    name: "Mains d'Hermès",
    changes: [
      { key: "system.skills.escamotage.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000079": {
    name: "Ivresse de Dionysos",
    changes: [] // Effet passif: Renforce effets alcool
  },
  "aAdv000000000083": {
    name: "Chaleur d'Hestia",
    changes: [
      { key: "system.skills.commandement.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000087": {
    name: "Vue d'Hécate",
    changes: [
      { key: "system.skills.navigation.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000091": {
    name: "Don d'Hadès",
    changes: [] // Effet passif: Voir/communiquer avec morts
  },

  // ==========================================================================
  // COÛT -2 : Avantages généraux
  // ==========================================================================
  "aAdv000000000018": {
    name: "Orientation",
    changes: [
      { key: "system.skills.navigation.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000019": {
    name: "Porte-bouclier",
    changes: [] // Effet passif: Avantage comme bouclier
  },
  "aAdv000000000020": {
    name: "Chrono-sens",
    changes: [
      { key: "system.skills.histoire.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000021": {
    name: "Don des langues",
    changes: [
      { key: "system.skills.linguistique.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000022": {
    name: "Voix enchanteresse",
    changes: [
      { key: "system.skills.seduction.bonus", mode: 2, value: 2 },
      { key: "system.skills.baratin.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000023": {
    name: "Volonté de fer",
    changes: [
      { key: "system.saves.volonte.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000024": {
    name: "Ami des animaux",
    changes: [
      { key: "system.skills.dressage.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000025": {
    name: "Maître d'Arme",
    changes: [
      { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000026": {
    name: "Maître des forges",
    changes: [
      { key: "system.skills.artisanatFor.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000027": {
    name: "Ambidextrie",
    changes: [] // Effet passif: Pas de faiblesse main
  },
  "aAdv000000000028": {
    name: "Faveur +",
    changes: [] // Effet passif: Faveur d'un membre respecté
  },

  // ==========================================================================
  // COÛT -2 : Avantages divins
  // ==========================================================================
  "aAdv000000000036": {
    name: "Étincelle de Zeus",
    changes: [] // Effet passif: 1/4 chance Stun 1 tour
  },
  "aAdv000000000040": {
    name: "Vision d'Héra",
    changes: [] // Effet passif: Info sur personne connue 1/j
  },
  "aAdv000000000044": {
    name: "Force de Poséidon",
    changes: [
      { key: "system.ca.base", mode: 2, value: 1 }
    ]
  },
  "aAdv000000000048": {
    name: "Voix d'Athéna",
    changes: [] // Effet passif: Forcer obéissance 1/j
  },
  "aAdv000000000052": {
    name: "Corps d'Arès",
    changes: [
      { key: "system.ca.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000056": {
    name: "Moisson de Déméter",
    changes: [] // Effet passif: Trouver nourriture végétaux
  },
  "aAdv000000000060": {
    name: "Visée d'Apollon",
    changes: [
      { key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000064": {
    name: "Mire d'Artémis",
    changes: [
      // Dégâts à distance +3 - comme c'est un bonus de dégâts, pas un bonus d'attaque
      // On pourrait créer un effet personnalisé, mais ce n'est pas standard
      // Pour l'instant, on laisse en texte
    ]
  },
  "aAdv000000000068": {
    name: "Talent d'Héphaïstos",
    changes: [
      { key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }
    ]
  },
  "aAdv000000000072": {
    name: "Charme d'Aphrodite",
    changes: [] // Effet passif: Réduit jet de touche adverse de 2
  },
  "aAdv000000000076": {
    name: "Pieds d'Hermès",
    changes: [] // Effet passif: Marche +4 cases
  },
  "aAdv000000000080": {
    name: "Talent de Dionysos",
    changes: [
      { key: "system.saves.robustesse.base", mode: 2, value: 2 }
    ]
  },
  "aAdv000000000084": {
    name: "Flamme d'Hestia",
    changes: [] // Effet passif: Pas de pénalité froid/humide
  },
  "aAdv000000000088": {
    name: "Lanterne d'Hécate",
    changes: [] // Effet passif: Voir dans le noir
  },
  "aAdv000000000092": {
    name: "Casque d'Hadès",
    changes: [] // Effet passif: Disparaître dans les ombres 2/j
  },

  // ==========================================================================
  // COÛT -3 : Avantages généraux
  // ==========================================================================
  "aAdv000000000029": {
    name: "Taille imposante",
    changes: [
      { key: "system.pv.max", mode: 2, value: 10 }
    ]
  },
  "aAdv000000000030": {
    name: "Dieu de l'esquive",
    changes: [] // Effet passif: Esquive illimitée
  },
  "aAdv000000000031": {
    name: "Dieu du stade",
    changes: [] // Effet passif: Pas de fatigue
  },
  "aAdv000000000032": {
    name: "Dieu de la guerre",
    changes: [] // Effet passif: Pas de malus attaque second
  },
  "aAdv000000000033": {
    name: "Rageux",
    changes: [] // Effet passif: Coups + malus (à gérer manuellement)
  },
  "aAdv000000000034": {
    name: "Faveur ++",
    changes: [] // Effet passif: Faveur haut membre
  },

  // ==========================================================================
  // COÛT -3 : Auras divines (effets sur équipe - AFFAIRE EN MACRO/SCRIPT)
  // ==========================================================================
  "aAdv000000000037": {
    name: "Aura de Zeus",
    changes: [] // Effet sur équipe: Force +2 (nécessite script)
  },
  "aAdv000000000041": {
    name: "Aura d'Héra",
    changes: [] // Effet sur équipe: Astuce +2
  },
  "aAdv000000000045": {
    name: "Aura de Poséidon",
    changes: [] // Effet sur équipe: Constitution +2
  },
  "aAdv000000000049": {
    name: "Aura d'Athéna",
    changes: [] // Effet sur équipe: Force +2
  },
  "aAdv000000000053": {
    name: "Aura d'Arès",
    changes: [] // Effet sur équipe: Force +2
  },
  "aAdv000000000057": {
    name: "Aura de Démeter",
    changes: [] // Effet sur équipe: Constitution +2
  },
  "aAdv000000000061": {
    name: "Aura d'Apollon",
    changes: [] // Effet sur équipe: Astuce +2
  },
  "aAdv000000000065": {
    name: "Aura d'Artémis",
    changes: [] // Effet sur équipe: Dextérité +2
  },
  "aAdv000000000069": {
    name: "Aura d'Héphaïstos",
    changes: [] // Effet sur équipe: Force +2
  },
  "aAdv000000000073": {
    name: "Aura d'Aphrodite",
    changes: [] // Effet sur équipe: Charisme +2
  },
  "aAdv000000000077": {
    name: "Aura d'Hermes",
    changes: [] // Effet sur équipe: Dextérité +2
  },
  "aAdv000000000081": {
    name: "Aura de Dionysos",
    changes: [] // Effet sur équipe: Charisme +2
  },
  "aAdv000000000085": {
    name: "Aura d'Hestia",
    changes: [] // Effet sur équipe: Charisme +2
  },
  "aAdv000000000089": {
    name: "Aura d'Hécate",
    changes: [] // Effet sur équipe: Astuce +2
  },
  "aAdv000000000093": {
    name: "Aura d'Hadès",
    changes: [] // Effet sur équipe: Constitution +2
  },

  // ==========================================================================
  // COÛT -5 : Avantages divins (ultimes)
  // ==========================================================================
  "aAdv000000000038": {
    name: "Sang de Zeus",
    changes: [] // Effet passif: Extra Life
  },
  "aAdv000000000042": {
    name: "Faveur de la Dame",
    changes: [] // Effet passif: 3 relances de jet
  },
  "aAdv000000000046": {
    name: "Paume de Poséidon",
    changes: [] // Effet passif: Bateau magique
  },
  "aAdv000000000050": {
    name: "Esprit d'Athéna",
    changes: [] // Effet passif: Athéna prévient mauvais choix
  },
  "aAdv000000000054": {
    name: "Armure d'Arès",
    changes: [] // Effet passif: Frénésie après 2 kills
  },
  "aAdv000000000058": {
    name: "Blé de Déméter",
    changes: [] // Effet passif: Régénération x3 en mangeant
  },
  "aAdv000000000062": {
    name: "Œil d'Apollon",
    changes: [] // Effet passif: Oracle (vision sommeil)
  },
  "aAdv000000000066": {
    name: "Compagnon d'Artémis",
    changes: [] // Effet passif: Animal magique
  },
  "aAdv000000000070": {
    name: "Yeux d'Héphaïstos",
    changes: [] // Effet passif: Détecter magie/enchantements
  },
  "aAdv000000000074": {
    name: "Murmure d'Aphrodite",
    changes: [] // Effet passif: Secrets sombres
  },
  "aAdv000000000078": {
    name: "Message d'Hermes",
    changes: [] // Effet passif: Transmettre messages
  },
  "aAdv000000000082": {
    name: "Amphore de Dionysos",
    changes: [] // Effet passif: Récupérer tous PV avec alcool 1/j
  },
  "aAdv000000000086": {
    name: "Bûcher d'Hestia",
    changes: [] // Effet passif: Feu protecteur
  },
  "aAdv000000000090": {
    name: "Lune d'Hécate",
    changes: [] // Effet passif: 1 rituel/nuit
  },
  "aAdv000000000094": {
    name: "Peau d'Hadès",
    changes: [
      { key: "system.pv.max", mode: 2, value: "@system.pv.max" } // Double les PV
    ]
  }
};

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Vérifie si un avantage a déjà des effets
 */
function hasExistingEffects(item) {
  return Array.isArray(item.effects) && item.effects.length > 0;
}

/**
 * Génère un ID unique pour un ActiveEffect
 */
function generateEffectId(itemId, effectName) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `effect-${itemId.replace('aAdv', '')}-${effectName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Crée un ActiveEffect pour un avantage
 */
function createActiveEffect(item, effectData) {
  if (effectData.changes.length === 0) return null;

  return {
    _id: generateEffectId(item._id, effectData.name),
    name: effectData.name,
    img: "icons/svg/aura.svg",
    changes: effectData.changes,
    disabled: false,
    transfer: true,
    duration: {
      startTime: null,
      seconds: null,
      rounds: null,
      turns: null
    },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  };
}

// ============================================================================
// SCRIPT PRINCIPAL
// ============================================================================

async function addEffectsToAvantages() {
  console.log('╔═══════════════════════════════════════════════════════════════');
  console.log('║  📦 ANTIQUE - Ajout des ActiveEffects aux Avantages          ║');
  console.log('╚═══════════════════════════════════════════════════════════════\n');

  const dbPath = path.join(__dirname, 'avantages');
  
  console.log(`📂 Chemin du compendium: ${dbPath}`);
  console.log('🔍 Voulez-vous vraiment continuer ? (Oui = appuyer sur Entrée, Non = Ctrl+C)\n');
  
  // Attendre confirmation utilisateur
  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });

  const db = new ClassicLevel(dbPath, {
    keyEncoding: 'utf8',
    valueEncoding: 'utf8'
  });

  let totalScanned = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const detailedLog = [];

  console.log('⏳ Scanning du compendium en cours...\n');

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;

    try {
      const item = JSON.parse(value);
      totalScanned++;

      if (item.type !== 'advantage') {
        totalSkipped++;
        continue;
      }

      const itemName = item.name || key;
      const effectData = ADVANTAGE_EFFECTS[key];

      // Si l'avantage n'est pas dans notre mapping, on skip
      if (!effectData) {
        console.log(`⚠️  [${key}] ${itemName} - Non référencé dans le mapping`);
        totalSkipped++;
        continue;
      }

      // Vérifier si l'avantage a déjà des effets
      const hasEffects = hasExistingEffects(item);

      // Si l'avantage a déjà des effets ET qu'on veut les remplacer
      // On ne fait rien pour éviter de écraser
      if (hasEffects && effectData.changes.length === 0) {
        console.log(`✅ [${key}] ${itemName} - Déjà des effets, pas de modification nécessaire`);
        totalSkipped++;
        continue;
      }

      // Si l'avantage a des effets personnalisés dans notre mapping
      if (effectData.changes.length > 0) {
        // Vérifier si un effet similaire existe déjà
        const hasSimilarEffect = item.effects && item.effects.some(eff => 
          eff.name === effectData.name
        );

        if (hasSimilarEffect) {
          console.log(`✅ [${key}] ${itemName} - Effet "${effectData.name}" déjà présent`);
          totalSkipped++;
          continue;
        }

        // Créer et ajouter le nouvel effet
        const newEffect = createActiveEffect(item, effectData);
        if (newEffect) {
          item.effects = item.effects || [];
          item.effects.push(newEffect);
          
          // Sauvegarder
          await db.put(key, JSON.stringify(item));
          
          console.log(`✨ [${key}] ${itemName} - Ajout effet: ${effectData.name}`);
          detailedLog.push({
            id: key,
            name: itemName,
            effect: effectData.name,
            changes: effectData.changes
          });
          totalUpdated++;
        } else {
          console.log(`ℹ️  [${key}] ${itemName} - Effet passif (texte seulement)`);
          totalSkipped++;
        }
      } else {
        console.log(`ℹ️  [${key}] ${itemName} - Effet passif/narratif (texte seulement)`);
        totalSkipped++;
      }

    } catch (e) {
      console.error(`❌ [${key}] Erreur:`, e.message);
      totalSkipped++;
    }
  }

  await db.close();

  // Résumé
  console.log('\n' + '='.repeat(64));
  console.log('📊 RÉSULTATS');
  console.log('='.repeat(64));
  console.log(`📦 Avantages scannés: ${totalScanned}`);
  console.log(`✅ Avantages mis à jour: ${totalUpdated}`);
  console.log(`⏭️  Avantages ignorés: ${totalSkipped}`);
  console.log('='.repeat(64));

  if (detailedLog.length > 0) {
    console.log('\n📝 Détails des modifications:');
    console.log('-'.repeat(64));
    detailedLog.forEach(log => {
      console.log(`  • ${log.name}`);
      log.changes.forEach(change => {
        const op = change.mode === 2 ? '+' : change.mode === 0 ? '=' : change.mode === 1 ? '×' : change.mode === 5 ? '=' : '?';
        console.log(`    → ${change.key} ${op} ${change.value}`);
      });
    });
  }

  console.log('\n' + '='.repeat(64));
  console.log('⚠️  ACTIONS REQUISES APRES EXECUTION:');
  console.log('='.repeat(64));
  console.log('1. Nettoyer le cache CLI: fvtt package clear');
  console.log('2. Fermer et rouvrir Foundry VTT');
  console.log('3. Vérifier les avantages dans le compendium');
  console.log('='.repeat(64));
  console.log('\n✅ Script terminé!\n');
}

// ============================================================================
// EXECUTION
// ============================================================================

addEffectsToAvantages().catch(err => {
  console.error('\n❌ Erreur fatale:', err);
  console.error(err.stack);
  process.exit(1);
});

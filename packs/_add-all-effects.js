/**
 * Script pour ajouter des ActiveEffects à TOUS les avantages et désavantages
 * Basé sur les règles du rapport de mise à jour
 * 
 * Exécuter avec : node _add-all-effects.js
 * 
 * Ce script:
 * 1. Lit les avantages depuis avantages_liste.txt (JSON)
 * 2. Lit les désavantages depuis le compendium LevelDB
 * 3. Ajoute des ActiveEffects mécaniques selon les descriptions
 * 4. Met à jour directement les compendiums LevelDB
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// ============================================
// CONFIGURATION DES CLÉS SYSTÈME (Modèle Antique)
// ============================================
// D'après le cahier des charges et le rapport
const SYSTEM_KEYS = {
  // Caractéristiques (6)
  characteristics: {
    'FOR': 'system.abilities.for.value',
    'DEX': 'system.abilities.dex.value', 
    'CON': 'system.abilities.con.value',
    'INT': 'system.abilities.int.value',
    'AST': 'system.abilities.ast.value',
    'CHA': 'system.abilities.cha.value'
  },
  
  // Compétences (35) - noms connus du système
  skills: {
    'perception': 'system.skills.perception.bonus',
    'marchandage': 'system.skills.marchandage.bonus',
    'discretion': 'system.skills.discretion.bonus',
    'representation': 'system.skills.representation.bonus',
    'volonte': 'system.skills.volonte.bonus', // Note: dans saves ?
    'robustesse': 'system.saves.robustesse.base',
    'reflexes': 'system.saves.reflexes.base',
    'psychologie': 'system.skills.psychologie.bonus',
    'seduction': 'system.skills.seduction.bonus',
    'escamotage': 'system.skills.escamotage.bonus',
    'dressage': 'system.skills.dressage.bonus',
    'artisanatFor': 'system.skills.artisanatFor.bonus',
    'navigation': 'system.skills.navigation.bonus',
    'histoire': 'system.skills.histoire.bonus',
    'linguistique': 'system.skills.linguistique.bonus',
    'baratin': 'system.skills.baratin.bonus',
    'commandement': 'system.skills.commandement.bonus',
    'nature': 'system.skills.nature.bonus',
    'vigueur': 'system.skills.vigueur.bonus',
    'artisanat': 'system.skills.artisanat.bonus'
  },
  
  // Sauvegardes (3)
  saves: {
    'robustesse': 'system.saves.robustesse.base',
    'reflexes': 'system.saves.reflexes.base',
    'volonte': 'system.saves.volonte.base'
  },
  
  // Autres
  ca: 'system.ca.base',
  pvMax: 'system.pv.max',
  pvValue: 'system.pv.value',
  attackBonuses: {
    'armeBlanche': 'system.attackBonuses.armeBlanche.bonus',
    'corpsACorps': 'system.attackBonuses.armeBlanche.bonus', // alias
    'armeADistance': 'system.attackBonuses.armeADistance.bonus',
    'distance': 'system.attackBonuses.armeADistance.bonus' // alias
  }
};

// ============================================
// MAPPING COMPLET DES EFFETS POUR AVANTAGES
// ============================================
// Basé sur avantages_liste.txt et le rapport
// Format: { itemId: [{ key, mode, value, description }] }
const AVANTAGES_MAPPING = {
  // ===== Coût -1 =====
  // Déjà avec effets dans le rapport (20 initiaux)
  "aAdv000000000002": [{ key: "system.skills.perception.bonus", mode: 2, value: 2, desc: "+2 perception" }],
  "aAdv000000000006": [{ key: "system.skills.representation.bonus", mode: 2, value: 2, desc: "+2 representation" }],
  "aAdv000000000008": [{ key: "system.saves.volonte.base", mode: 2, value: 2, desc: "+2 volonté" }],
  "aAdv000000000011": [{ key: "system.ca.base", mode: 2, value: 2, desc: "+2 CA base" }],
  "aAdv000000000013": [{ key: "system.saves.reflexes.base", mode: 2, value: 2, desc: "+2 réflexes" }],
  "aAdv000000000014": [{ key: "system.saves.robustesse.base", mode: 2, value: 2, desc: "+2 robustesse" }],
  "aAdv000000000015": [
    { key: "system.skills.vigueur.bonus", mode: 2, value: 2, desc: "+2 vigueur" },
    { key: "system.skills.nature.bonus", mode: 2, value: 2, desc: "+2 nature" }
  ],
  "aAdv000000000018": [{ key: "system.skills.navigation.bonus", mode: 2, value: 2, desc: "+2 navigation" }],
  "aAdv000000000020": [{ key: "system.skills.histoire.bonus", mode: 2, value: 2, desc: "+2 histoire" }],
  "aAdv000000000021": [{ key: "system.skills.linguistique.bonus", mode: 2, value: 2, desc: "+2 linguistique" }],
  "aAdv000000000022": [
    { key: "system.skills.seduction.bonus", mode: 2, value: 2, desc: "+2 séduction" },
    { key: "system.skills.baratin.bonus", mode: 2, value: 2, desc: "+2 baratin" }
  ],
  "aAdv000000000023": [{ key: "system.saves.volonte.base", mode: 2, value: 2, desc: "+2 volonté" }],
  "aAdv000000000029": [{ key: "system.pv.max", mode: 2, value: 10, desc: "+10 PV max" }],
  "aAdv000000000044": [{ key: "system.ca.base", mode: 2, value: 1, desc: "+1 CA base" }],
  "aAdv000000000047": [{ key: "system.ca.base", mode: 2, value: 2, desc: "+2 CA base" }],
  "aAdv000000000052": [{ key: "system.ca.base", mode: 2, value: 2, desc: "+2 CA base" }],
  "aAdv000000000060": [{ key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 2, desc: "+2 arme à distance" }],
  "aAdv000000000083": [{ key: "system.skills.commandement.bonus", mode: 2, value: 2, desc: "+2 commandement" }],
  "aAdv000000000087": [{ key: "system.skills.navigation.bonus", mode: 2, value: 2, desc: "+2 navigation" }],
  
  // Les 12 à ajouter selon le rapport
  "aAdv000000000001": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2, desc: "+2 arme blanche" }],
  "aAdv000000000009": [{ key: "system.skills.marchandage.bonus", mode: 2, value: 2, desc: "+2 marchandage" }],
  "aAdv000000000010": [{ key: "system.skills.discretion.bonus", mode: 2, value: 2, desc: "+2 discrétion" }],
  "aAdv000000000035": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3, desc: "+3 arme blanche" }],
  "aAdv000000000039": [{ key: "system.skills.psychologie.bonus", mode: 2, value: 2, desc: "+2 psychologie" }],
  "aAdv000000000071": [{ key: "system.skills.seduction.bonus", mode: 2, value: 2, desc: "+2 séduction" }],
  "aAdv000000000075": [{ key: "system.skills.escamotage.bonus", mode: 2, value: 2, desc: "+2 escamotage" }],
  "aAdv000000000024": [{ key: "system.skills.dressage.bonus", mode: 2, value: 2, desc: "+2 dressage" }],
  "aAdv000000000025": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2, desc: "+2 arme blanche" }],
  "aAdv000000000026": [{ key: "system.skills.artisanatFor.bonus", mode: 2, value: 2, desc: "+2 artisanat(FOR)" }],
  "aAdv000000000068": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3, desc: "+3 arme blanche" }],
  "aAdv000000000080": [{ key: "system.saves.robustesse.base", mode: 2, value: 2, desc: "+2 robustesse" }],
  
  // === Autres avantages avec effets mécaniques identifiables ===
  // Coût -1
  "aAdv000000000003": [], // Équilibre félin - passif/narratif
  "aAdv000000000004": [], // Fêtard - passif
  "aAdv000000000005": [], // Bon sens - narratif
  "aAdv000000000007": [{ key: "system.attributes.movement.value", mode: 2, value: 2, desc: "déplacement x2" }], // Athlète
  "aAdv000000000012": [], // Mule - passif (x2 capacité de port)
  "aAdv000000000016": [], // Sommeil léger - passif
  "aAdv000000000017": [], // Faveur - narratif
  
  // Coût -1 Divins
  "aAdv000000000037": [], // Aura de Zeus - nécessitent MACRO
  "aAdv000000000039": [], // Respect d'Héra - déjà traité ci-dessus
  "aAdv000000000043": [], // Branchies de Poséidon - passif
  "aAdv000000000047": [], // Protection d'Athéna - déjà traité
  "aAdv000000000051": [], // Rage d'Arès - nécessitent hook
  "aAdv000000000055": [], // Cuisine de Déméter - passif
  "aAdv000000000059": [], // Soin d'Apollon - action
  "aAdv000000000063": [], // Chasse d'Artémis - passif
  "aAdv000000000067": [], // Connaissance d'Héphaïstos - nécessitent hook
  "aAdv000000000071": [], // Beauté d'Aphrodite - déjà traité
  "aAdv000000000075": [], // Mains d'Hermès - déjà traité
  "aAdv000000000079": [], // Ivresse de Dionysos - passif
  "aAdv000000000083": [], // Chaleur d'Hestia - déjà traité
  "aAdv000000000087": [], // Vue d'Hécate - déjà traité
  "aAdv000000000091": [], // Don d'Hadès - passif
  
  // Coût -2
  "aAdv000000000018": [], // Orientation - passif
  "aAdv000000000019": [], // Porte bouclier - passif
  "aAdv000000000020": [], // Chrono sens - déjà traité
  "aAdv000000000021": [], // Don des langues - déjà traité
  "aAdv000000000022": [], // Voix enchanteresse - déjà traité
  "aAdv000000000023": [], // Volonté de fer - déjà traité
  "aAdv000000000024": [], // Ami des animaux - déjà traité
  "aAdv000000000025": [], // Maître d'Arme - déjà traité
  "aAdv000000000026": [], // Maître des forges - déjà traité
  "aAdv000000000027": [], // Ambidextrie - passif
  "aAdv000000000028": [], // Faveur + - narratif
  
  // Coût -2 Divins
  "aAdv000000000036": [], // Étincelle de Zeus - nécessitent hook
  "aAdv000000000040": [], // Vision d'Héra - action
  "aAdv000000000044": [], // Force de Poséidon - déjà traité
  "aAdv000000000048": [], // Voix d'Athéna - action
  "aAdv000000000052": [], // Corps d'Arès - déjà traité
  "aAdv000000000056": [], // Moisson de Déméter - passif
  "aAdv000000000060": [], // Visée d'Apollon - déjà traité
  "aAdv000000000064": [{ key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 3, desc: "Dégats à distance +3" }], // Mire d'Artémis
  "aAdv000000000068": [], // Talent d'Héphaïstos - déjà traité
  "aAdv000000000072": [{ key: "system.attributes.attackRoll.bonus", mode: 2, value: -2, desc: "Réduit jet de touche adverse de 2" }], // Charme d'Aphrodite
  "aAdv000000000076": [], // Pieds d'Hermes - passif
  "aAdv000000000080": [], // Talent de Dionysos - déjà traité
  "aAdv000000000084": [], // Flamme d'Hestia - passif
  "aAdv000000000088": [], // Lanterne d'Hécate - passif
  "aAdv000000000092": []  // Casque d'Hadès - action
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function createActiveEffect(name, img, changesArray) {
  return {
    _id: `eff-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: name,
    img: img || "icons/svg/aura.svg",
    changes: changesArray.map(c => ({
      key: c.key,
      mode: c.mode !== undefined ? c.mode : 2,
      value: c.value
    })),
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    statuses: []
  };
}

function cleanName(name) {
  return name
    .replace(/[()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// FONCTION PRINCIPALE POUR LES AVANTAGES
// ============================================

async function migrateAvantages() {
  const compendiumPath = path.join(__dirname, 'avantages');
  console.log('\n🔄 Migration des AVANTAGES...\n');
  
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  let updatedCount = 0;
  let skippedCount = 0;
  let alreadyHasEffectsCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) {
      skippedCount++;
      continue;
    }

    try {
      const item = JSON.parse(value);
      
      if (!item.name || item.type !== 'advantage') {
        skippedCount++;
        continue;
      }

      // Initialiser effects si absent
      if (!item.effects) {
        item.effects = [];
      }

      const hasExistingEffects = item.effects.length > 0;
      const mapping = AVANTAGES_MAPPING[item._id];

      if (mapping && mapping.length > 0) {
        // Vérifier si l'effet existe déjà
        const effectExists = item.effects.some(e => 
          e.changes && e.changes.some(c => 
            mapping.some(m => m.key === c.key && m.value === c.value)
          )
        );
        
        if (effectExists) {
          alreadyHasEffectsCount++;
          console.log(`ℹ️  [${item.name}] - Effets déjà présents`);
          continue;
        }

        // Créer et ajouter les ActiveEffects
        const effectName = `Effet: ${cleanName(item.name).substring(0, 40)}`;
        const effect = createActiveEffect(effectName, item.img, mapping);
        item.effects.push(effect);

        await db.put(key, JSON.stringify(item));
        updatedCount++;
        console.log(`✅ [${item.name}] - ${mapping.length} effet(s) ajouté(s): ${mapping.map(m => m.desc).join(', ')}`);
      } else {
        // Pas de mapping, mais vérifier si déjà des effets
        if (hasExistingEffects) {
          alreadyHasEffectsCount++;
        } else {
          skippedCount++;
        }
      }
    } catch (e) {
      console.error(`❌ [ERREUR] ${key}: ${e.message}`);
    }
  }

  await db.close();
  
  console.log(`\n📊 Avantages:`);
  console.log(`   ✅ Modifiés: ${updatedCount}`);
  console.log(`   ℹ️  Déjà avec effets: ${alreadyHasEffectsCount}`);
  console.log(`   ⏭️  Sans effets (non automatisables): ${skippedCount}`);
  
  return { updated: updatedCount, skipped: skippedCount, already: alreadyHasEffectsCount };
}

// ============================================
// FONCTION POUR METTRE À JOUR UN COMPENDIUM GÉNÉRIQUE
// ============================================

async function updateCompendium(compendiumPath, compendiumName, itemsWithEffects) {
  console.log(`\n🔄 Migration du compendium: ${compendiumName}...\n`);
  
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  let updatedCount = 0;
  let skippedCount = 0;
  let alreadyHasEffectsCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;

    try {
      const item = JSON.parse(value);
      
      if (!item.name) continue;

      // Initialiser effects si absent
      if (!item.effects) {
        item.effects = [];
      }

      // Trouver le mapping pour cet item
      const mapping = itemsWithEffects[item._id];
      
      if (mapping && mapping.length > 0) {
        const hasExistingEffects = item.effects.length > 0;
        
        // Vérifier si l'effet existe déjà
        const effectExists = item.effects.some(e => 
          e.changes && e.changes.some(c => 
            mapping.some(m => m.key === c.key && m.value === c.value)
          )
        );
        
        if (effectExists) {
          alreadyHasEffectsCount++;
          console.log(`ℹ️  [${item.name}] - Effets déjà présents`);
          continue;
        }

        const effectName = `Effet: ${cleanName(item.name).substring(0, 40)}`;
        const effect = createActiveEffect(effectName, item.img, mapping);
        item.effects.push(effect);

        await db.put(key, JSON.stringify(item));
        updatedCount++;
        console.log(`✅ [${item.name}] - ${mapping.length} effet(s) ajouté(s)`);
      } else {
        if (item.effects && item.effects.length > 0) {
          alreadyHasEffectsCount++;
        } else {
          skippedCount++;
        }
      }
    } catch (e) {
      console.error(`❌ [ERREUR] ${key}: ${e.message}`);
    }
  }

  await db.close();
  
  console.log(`\n📊 ${compendiumName}:`);
  console.log(`   ✅ Modifiés: ${updatedCount}`);
  console.log(`   ℹ️  Déjà avec effets: ${alreadyHasEffectsCount}`);
  console.log(`   ⏭️  Sans changement: ${skippedCount}`);
  
  return { updated: updatedCount, skipped: skippedCount, already: alreadyHasEffectsCount };
}

// ============================================
// EXÉCUTION
// ============================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Script: Ajout des ActiveEffects aux avantages/désavantages        ║');
  console.log('║  Système Antique pour Foundry VTT v0.6.1                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Migrer les avantages
    const avantagesResult = await migrateAvantages();
    
    // Lire les désavantages et demander à l'utilisateur
    console.log('\n📋 Pour les désavantages, il faut d\'abord les analyser.');
    console.log('   Exécutez: node _list-desavantages.js');
    console.log('   Puis mettez à jour ce script avec le mapping des désavantages.');
    console.log('\n✨ Migration des avantages terminée!');
    console.log('\n⚠️  Pour appliquer les changements:');
    console.log('   1. Fermez Foundry VTT');
    console.log('   2. Exécutez: fvtt package clear');
    console.log('   3. OU: rmdir /s /q "D:\\AppDataFoundry$\\FoundryVTT_Data\\Cache"');
    console.log('   4. Redémarrez Foundry VTT');
    
    // Sauvegarder un résumé
    fs.writeFileSync(
      path.join(__dirname, '_migration-resultat.json'),
      JSON.stringify({
        date: new Date().toISOString(),
        avantages: avantagesResult
      }, null, 2),
      'utf8'
    );
    console.log('\n✅ Résumé sauvegardé dans: _migration-resultat.json');
    
  } catch (err) {
    console.error('\n❌ Erreur critique:', err);
    process.exit(1);
  }
}

main();

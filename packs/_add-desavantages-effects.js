/**
 * SCRIPT: Ajout des ActiveEffects aux DÉSAVANTAGES
 * selon les règles du système Antique
 * 
 * EXÉCUTION:
 *   1. Fermer Foundry VTT
 *   2. node _add-desavantages-effects.js
 *   3. Nettoyer le cache: fvtt package clear
 *   4. Redémarrer Foundry
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// ============================================
// CLÉS SYSTÈME (mêmes que pour les avantages)
// ============================================
const KEYS = {
  skills: {
    'perception': 'system.skills.perception.bonus',
    'marchandage': 'system.skills.marchandage.bonus',
    'discretion': 'system.skills.discretion.bonus',
    'representation': 'system.skills.representation.bonus',
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
    'vigilance': 'system.skills.vigilance.bonus',
    'charisme': 'system.skills.commandement.bonus' // pour les comp Char
  },
  saves: {
    'robustesse': 'system.saves.robustesse.base',
    'reflexes': 'system.saves.reflexes.base',
    'volonte': 'system.saves.volonte.base'
  },
  ca: 'system.ca.base',
  attackBonuses: {
    'armeBlanche': 'system.attackBonuses.armeBlanche.bonus',
    'armeADistance': 'system.attackBonuses.armeADistance.bonus'
  }
};

// ============================================
// MAPPING DES DÉSAVANTAGES À METTRE À JOUR
// ============================================
// Basé sur l'analyse des descriptions
// Coût = nombre positif (contrairement aux avantages)
const DESAVANTAGES_MAPPING = {
  // ==== Coût 1 ====
  // Déjà avec effets (5)
  "aDis000000000002": [], // Sens défaillant - déjà a -2 perception
  "aDis000000000009": [], // Frêle - déjà a robustesse -1
  "aDis000000000012": [], // Distrait - déjà a vigilance -2
  "aDis000000000013": [], // Dépressif - déjà a volonté -1
  "aDis000000000014": [], // Maladroit - déjà a réflexes -1
  
  // À ajouter (effets mécaniques clairs)
  "aDis000000000011": [
    { key: KEYS.skills.baratin, mode: 2, value: -2 },
    { key: KEYS.skills.seduction, mode: 2, value: -2 },
    { key: KEYS.skills.commandement, mode: 2, value: -2 }
  ], // Enfant - -2 dans certaines comp Char
  "aDis000000000016": [
    { key: KEYS.skills.baratin, mode: 2, value: -2 },
    { key: KEYS.skills.seduction, mode: 2, value: -2 },
    { key: KEYS.skills.commandement, mode: 2, value: -2 }
  ], // Introverti - -2 comp Char
  
  // ==== Coût 1 (Divins) ====
  // La plupart sont narratifs ou nécessitent des hooks
  // Seuls ceux avec des malus mécaniques clairs sont traités
  
  // ==== Coût 2 ====
  // Peu avec des effets mécaniques simples
  "aDis000000000019": [{ key: KEYS.skills.dressage, mode: 2, value: -2 }], // Hostilité animal
  "aDis000000000020": [{ key: KEYS.saves.volonte, mode: 2, value: -2 }], // Phobie majeur - -2 si échec volonté
  "aDis000000000052": [{ key: "system.attributes.difficulty", mode: 2, value: 1 }], // Poigne d'Arès - +1 diff
  
  // ==== Coût 1 (Spécifiques) ====
  "aDis000000000060": [{ key: KEYS.attackBonuses.armeADistance, mode: 2, value: -2 }], // Arc d'Apollon
  "aDis000000000064": [{ key: KEYS.skills.nature, mode: 2, value: -2 }], // Proie d'Artémis
  "aDis000000000068": [{ key: "system.attributes.prices", mode: 2, value: 1.2 }], // Confiance d'Héphaïstos
  "aDis000000000080": [{ key: KEYS.saves.robustesse, mode: 2, value: -2 }] // Coupe de Dionysos
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function createActiveEffect(item, changes) {
  return {
    _id: `eff-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: `Effet: ${item.name.replace(/[()\-]/g, ' ').trim().substring(0, 50)}`,
    img: item.img || "icons/svg/aura.svg",
    changes: changes.map(c => ({
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

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function addEffectsToDesavantages() {
  const compendiumPath = path.join(__dirname, 'desavantages');
  console.log('📁 Compendium: desavantages\n');
  
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  let addedCount = 0;
  let skippedCount = 0;
  let alreadyCount = 0;
  let errorCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;

    try {
      const item = JSON.parse(value);
      
      // Filtrer les désavantages
      if (item.type !== 'disadvantage' || !item._id) {
        skippedCount++;
        continue;
      }

      // Initialiser effects si absent
      if (!item.effects) {
        item.effects = [];
      }

      const itemId = item._id;
      const hasExistingEffects = item.effects.length > 0;

      // Vérifier si déjà dans DESAVANTAGES_MAPPING
      const effectsToAdd = DESAVANTAGES_MAPPING[itemId];
      
      if (effectsToAdd && effectsToAdd.length > 0) {
        // Vérifier si ces effets existent déjà
        const effectsExist = item.effects.some(eff => {
          if (!eff.changes) return false;
          return effectsToAdd.some(newEff => 
            eff.changes.some(ex => ex.key === newEff.key && ex.value === newEff.value)
          );
        });

        if (effectsExist) {
          alreadyCount++;
          console.log(`ℹ️  [${item._id}] ${item.name} - Effets déjà présents`);
          continue;
        }

        // Ajouter les effets
        const effect = createActiveEffect(item, effectsToAdd);
        item.effects.push(effect);

        await db.put(key, JSON.stringify(item));
        addedCount++;
        console.log(`✅ [${item._id}] ${item.name} - ${effectsToAdd.length} effet(s) ajouté(s)`);
      } else {
        // Pas de mapping pour ce désavantage
        if (hasExistingEffects) {
          alreadyCount++;
        } else {
          skippedCount++;
        }
      }
    } catch (e) {
      errorCount++;
      console.error(`❌ [ERREUR] ${key}: ${e.message}`);
    }
  }

  await db.close();
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSULTATS:');
  console.log('='.repeat(70));
  console.log(`✅ Désavantages avec nouveaux effets: ${addedCount}`);
  console.log(`ℹ️  Désavantages déjà avec effets: ${alreadyCount}`);
  console.log(`⏭️  Désavantages sans effets automatisables: ${skippedCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log('\n🎯 DÉSAVANTAGES TRAITÉS:');
  console.log(`   - ${Object.keys(DESAVANTAGES_MAPPING).filter(k => DESAVANTAGES_MAPPING[k].length > 0).length} désavantages avec effets mécaniques`);
  
  return { added: addedCount, already: alreadyCount, skipped: skippedCount, errors: errorCount };
}

// ============================================
// EXÉCUTION
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SCRIPT: Ajout des ActiveEffects aux DÉSAVANTAGES                 ║');
  console.log('║  Système Antique v0.6.1                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    const result = await addEffectsToDesavantages();
    
    console.log('\n✨ MIGRATION TERMINÉE!\n');
    console.log('📌 PROCHAINES ÉTAPES:');
    console.log('   1. Exécutez: fvtt package clear');
    console.log('      OU: rmdir /s /q "D:\\AppDataFoundry$\\FoundryVTT_Data\\Cache"');
    console.log('   2. Redémarrez Foundry VTT');
    console.log('   3. Vérifiez le compendium "Désavantages"');
    
    // Sauvegarder le résultat
    fs.writeFileSync(
      path.join(__dirname, '_resultat-migration-desavantages.json'),
      JSON.stringify({
        date: new Date().toISOString(),
        result: result,
        effectsAdded: DESAVANTAGES_MAPPING
      }, null, 2),
      'utf8'
    );
    console.log('\n✅ Résumé sauvegardé dans: _resultat-migration-desavantages.json');
    
    console.log('\n⚠️  NOTE:');
    console.log('   Certains désavantages nécessitent des hooks ou des macros.');
    console.log('   Seuls les désavantages avec des malus mécaniques simples ont été traités.');
    
  } catch (err) {
    console.error('\n❌ ERREUR CRITIQUE:', err);
    process.exit(1);
  }
}

main();

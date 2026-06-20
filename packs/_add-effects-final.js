/**
 * SCRIPT FINAL: Ajout des ActiveEffects aux AVANTAGES
 * selon les règles du rapport de mise à jour
 * 
 * basés sur:
 * - Le modèle de données Antique (system.json)
 * - Le rapport de mise à jour (RAPPORT_MISE_A_JOUR_AVANTAGES.txt)
 * - Le fichier avantages_liste.txt
 * 
 * EXÉCUTION:
 *   1. Fermer Foundry VTT
 *   2. node _add-effects-final.js
 *   3. Nettoyer le cache: fvtt package clear OU rmdir /s /q "D:\AppDataFoundry$\FoundryVTT_Data\Cache"
 *   4. Redémarrer Foundry
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// ============================================
// CLÉS SYSTÈME VALIDÉES (d'après le modèle Antique)
// ============================================
// Ces clés sont utilisées dans le système et vérifiées dans les bénédictions
const KEYS = {
  // Compétences (35)
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
    'vigueur': 'system.skills.vigueur.bonus'
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
  attackBonuses: {
    'armeBlanche': 'system.attackBonuses.armeBlanche.bonus',
    'armeADistance': 'system.attackBonuses.armeADistance.bonus'
  }
};

// ============================================
// MAPPING COMPLET DES AVANTAGES À METTRE À JOUR
// ============================================
// Format: { itemId: [{ key, mode, value }] }
// mode: 2 = Add (ajouter la valeur)
const EFFECTS_TO_ADD = {
  // ==== Les 12 du rapport ====
  "aAdv000000000001": [{ key: KEYS.attackBonuses.armeBlanche, mode: 2, value: 2 }], // Guerrier Aguerri
  "aAdv000000000009": [{ key: KEYS.skills.marchandage, mode: 2, value: 2 }], // Commerçant
  "aAdv000000000010": [{ key: KEYS.skills.discretion, mode: 2, value: 2 }], // Visage passe-partout
  "aAdv000000000035": [{ key: KEYS.attackBonuses.armeBlanche, mode: 2, value: 3 }], // Colère de Zeus
  "aAdv000000000039": [{ key: KEYS.skills.psychologie, mode: 2, value: 2 }], // Respect d'Héra
  "aAdv000000000071": [{ key: KEYS.skills.seduction, mode: 2, value: 2 }], // Beauté d'Aphrodite
  "aAdv000000000075": [{ key: KEYS.skills.escamotage, mode: 2, value: 2 }], // Mains d'Hermès
  "aAdv000000000024": [{ key: KEYS.skills.dressage, mode: 2, value: 2 }], // Ami des animaux
  "aAdv000000000025": [{ key: KEYS.attackBonuses.armeBlanche, mode: 2, value: 2 }], // Maître d'Arme
  "aAdv000000000026": [{ key: KEYS.skills.artisanatFor, mode: 2, value: 2 }], // Maître des forges
  "aAdv000000000068": [{ key: KEYS.attackBonuses.armeBlanche, mode: 2, value: 3 }], // Talent d'Héphaïstos
  "aAdv000000000080": [{ key: KEYS.saves.robustesse, mode: 2, value: 2 }], // Talent de Dionysos
  
  // ==== Autres identifiés dans avantages_liste.txt ====
  "aAdv000000000064": [{ key: KEYS.attackBonuses.armeADistance, mode: 2, value: 3 }], // Mire d'Artémis
  "aAdv000000000072": [{ key: "system.attributes.attackRoll.bonus", mode: 2, value: -2 }] // Charme d'Aphrodite
};

// ============================================
// AVANTAGES DÉJÀ AVEC EFFETS (à ne pas modifier)
// ============================================
// Ces avantages ont déjà des ActiveEffects dans le compendium
const ALREADY_WITH_EFFECTS = new Set([
  "aAdv000000000002", // Sens aiguisé
  "aAdv000000000006", // Sens artistique
  "aAdv000000000008", // Sang froid
  "aAdv000000000011", // Peau dense
  "aAdv000000000013", // Vif
  "aAdv000000000014", // Cuir de Héros
  "aAdv000000000015", // Pisteur
  "aAdv000000000018", // Orientation
  "aAdv000000000020", // Chrono sens
  "aAdv000000000021", // Don des langues
  "aAdv000000000022", // Voix enchanteresse
  "aAdv000000000023", // Volonté de fer
  "aAdv000000000029", // Taille imposante
  "aAdv000000000044", // Force de Poséidon
  "aAdv000000000047", // Protection d'Athéna
  "aAdv000000000052", // Corps d'Arès
  "aAdv000000000060", // Visée d'Apollon
  "aAdv000000000083", // Chaleur d'Hestia
  "aAdv000000000087"  // Vue d'Hécate
]);

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

async function addEffectsToAvantages() {
  const compendiumPath = path.join(__dirname, 'avantages');
  console.log('📁 Compendium: avantages\n');
  
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
      
      // Filtrer les avantages
      if (item.type !== 'advantage' || !item._id) {
        skippedCount++;
        continue;
      }

      // Initialiser effects si absent
      if (!item.effects) {
        item.effects = [];
      }

      const itemId = item._id;
      const hasExistingEffects = item.effects.length > 0;

      // Si déjà dans la liste des avantages avec effets
      if (ALREADY_WITH_EFFECTS.has(itemId)) {
        alreadyCount++;
        if (hasExistingEffects) {
         console.log(`✅ [${item.name}] - Déjà avec effets (${item.effects.length})`);
        } else {
          console.log(`⚠️  [${item.name}] - Dans la liste des "déjà avec effets" mais pas d'effets trouvés`);
        }
        continue;
      }

      // Vérifier si on a un mapping pour cet item
      const effectsToAdd = EFFECTS_TO_ADD[itemId];
      
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
          console.log(`ℹ️  [${item.name}] - Effets déjà présents`);
          continue;
        }

        // Ajouter les effets
        const effect = createActiveEffect(item, effectsToAdd);
        item.effects.push(effect);

        await db.put(key, JSON.stringify(item));
        addedCount++;
        console.log(`✅ [${item.name}] - ${effectsToAdd.length} effet(s) ajouté(s)`);
        console.log(`   ${effectsToAdd.map(e => `${e.key}=${e.value}`).join(', ')}`);
      } else {
        // Pas de mapping pour cet avantage
        if (hasExistingEffects) {
          alreadyCount++;
        } else {
          skippedCount++;
        }
        // Pour le débogage
        if (!hasExistingEffects) {
          console.log(`⏭️  [${item.name}] - Pas d'effets mécaniques identifiés`);
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
  console.log(`✅ Avantages avec nouveaux effets: ${addedCount}`);
  console.log(`ℹ️  Avantages déjà avec effets: ${alreadyCount}`);
  console.log(`⏭️  Avantages sans effets automatisables: ${skippedCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log('\n🎯 AVANTAGES TRAITÉS:');
  console.log(`   - ${Object.keys(EFFECTS_TO_ADD).length} avantages avec effets mécaniques`);
  console.log(`   - Total dans le compendium: ${addedCount + alreadyCount + skippedCount - errorCount}`);
  
  return { added: addedCount, already: alreadyCount, skipped: skippedCount, errors: errorCount };
}

// ============================================
// EXÉCUTION
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SCRIPT FINAL: Ajout des ActiveEffects aux AVANTAGES              ║');
  console.log('║  Système Antique v0.6.1                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    const result = await addEffectsToAvantages();
    
    console.log('\n✨ MIGRATION TERMINÉE!\n');
    console.log('📌 PROCHAINES ÉTAPES:');
    console.log('   1. Exécutez: fvtt package clear');
    console.log('      OU: rmdir /s /q "D:\\AppDataFoundry$\\FoundryVTT_Data\\Cache"');
    console.log('   2. Redémarrez Foundry VTT');
    console.log('   3. Vérifiez le compendium "Avantages"');
    console.log('\n💡 Pour vérifier:');
    console.log('   - Ouvrez "Guerrier Aguerri" (aAdv000000000001) dans le compendium');
    console.log('   - Vérifiez l\'onglet "Effects": doit avoir +2 armeBlanche.bonus');
    
    // Sauvegarder le résultat
    fs.writeFileSync(
      path.join(__dirname, '_resultat-migration-avantages.json'),
      JSON.stringify({
        date: new Date().toISOString(),
        result: result,
        effectsAdded: EFFECTS_TO_ADD
      }, null, 2),
      'utf8'
    );
    console.log('\n✅ Résumé sauvegardé dans: _resultat-migration-avantages.json');
    
    // Avertissement pour les désavantages
    console.log('\n⚠️  POUR LES DÉSAVANTAGES:');
    console.log('   Exécutez d\'abord: node _list-desavantages.js');
    console.log('   Puis ajoutez leur mapping dans ce script.');
    
  } catch (err) {
    console.error('\n❌ ERREUR CRITIQUE:', err);
    process.exit(1);
  }
}

main();

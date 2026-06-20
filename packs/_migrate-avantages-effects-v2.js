/**
 * Migration des avantages du système Antique pour Foundry VTT v14
 * Version 2 - Correction du bug changes.map
 * Ajoute des ActiveEffect automatiques aux items ne les ayant pas
 * Backup disponible dans _backup_db_20250115/
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

// ============================================
// MAPPING DES EFFETS À APPLIQUER
// ============================================
// Format: { _id: [{ key, mode, value, target? }, ...] }
const EFFECT_MAPPING = {
  // Coût -1 (Base)
  "aAdv000000000002": [{ key: "system.skills.perception.bonus", mode: 2, value: 2 }],
  "aAdv000000000007": [{ key: "system.attributes.movement.value", mode: 2, value: 2 }],
  "aAdv000000000011": [{ key: "system.ca.base", mode: 2, value: 2 }],
  "aAdv000000000012": [{ key: "system.attributes.encumbrance.value", mode: 2, value: 2 }],
  
  // Coût -1 (Divins)
  "aAdv000000000035": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }],
  "aAdv000000000047": [{ key: "system.ca.base", mode: 2, value: 2 }],
  
  // Coût -2 (Base)
  "aAdv000000000022": [
    { key: "system.skills.seduction.bonus", mode: 2, value: 2 },
    { key: "system.skills.baratin.bonus", mode: 2, value: 2 }
  ],
  "aAdv000000000023": [{ key: "system.saves.volonte.base", mode: 2, value: 2 }],
  "aAdv000000000025": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 2 }],
  
  // Coût -2 (Divins)
  "aAdv000000000044": [
    { key: "system.ca.base", mode: 2, value: 1 },
    { key: "system.ca.base", mode: 2, value: 2 } // Note: ne peut pas être conditionnel sans Hook
  ],
  "aAdv000000000052": [{ key: "system.ca.base", mode: 2, value: 2 }],
  "aAdv000000000060": [{ key: "system.attackBonuses.armeADistance.bonus", mode: 2, value: 2 }],
  "aAdv000000000064": [{ key: "system.attackBonuses.ranged.bonus", mode: 2, value: 3 }],
  "aAdv000000000068": [{ key: "system.attackBonuses.armeBlanche.bonus", mode: 2, value: 3 }],
  "aAdv000000000072": [{ key: "system.attributes.attackRoll.bonus", mode: 2, value: -2 }],
  "aAdv000000000076": [{ key: "system.attributes.movement.value", mode: 2, value: 4 }],
  
  // Coût -3 (Base)
  "aAdv000000000029": [
    { key: "system.pv.max", mode: 2, value: 10 },
    { key: "system.attributes.size", mode: 0, value: "large" }
  ],
  
  // Coût -3 (Divins - Auras) 
  "aAdv000000000037": [{ key: "system.attributes.force.base", mode: 2, value: 2 }],
  "aAdv000000000041": [{ key: "system.attributes.astuce.base", mode: 2, value: 2 }],
  "aAdv000000000045": [{ key: "system.attributes.constitution.base", mode: 2, value: 2 }],
  "aAdv000000000049": [{ key: "system.attributes.intelligence.base", mode: 2, value: 2 }],
  "aAdv000000000053": [{ key: "system.attributes.force.base", mode: 2, value: 2 }],
  "aAdv000000000057": [{ key: "system.attributes.constitution.base", mode: 2, value: 2 }],
  "aAdv000000000061": [{ key: "system.attributes.astuce.base", mode: 2, value: 2 }],
  "aAdv000000000065": [{ key: "system.attributes.dexterite.base", mode: 2, value: 2 }],
  "aAdv000000000069": [{ key: "system.attributes.force.base", mode: 2, value: 2 }],
  "aAdv000000000073": [{ key: "system.attributes.charisme.base", mode: 2, value: 2 }],
  "aAdv000000000077": [{ key: "system.attributes.dexterite.base", mode: 2, value: 2 }],
  "aAdv000000000081": [{ key: "system.attributes.charisme.base", mode: 2, value: 2 }],
  "aAdv000000000085": [{ key: "system.attributes.constitution.base", mode: 2, value: 2 }],
  "aAdv000000000089": [{ key: "system.attributes.astuce.base", mode: 2, value: 2 }],
  "aAdv000000000093": [{ key: "system.attributes.constitution.base", mode: 2, value: 2 }],
  
  // Coût -5
  "aAdv000000000038": [{ key: "system.pv.max", mode: 2, value: 1 }], // Extra Life
  "aAdv000000000058": [{ key: "system.pv.regeneration", mode: 2, value: 3 }],
  "aAdv000000000082": [{ key: "system.pv.value", mode: 0, value: "@pv.max" }],
  "aAdv000000000094": [{ key: "system.pv.max", mode: 2, value: 2 }]
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function createActiveEffect(name, img, changesArray) {
  return {
    _id: `effect-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: name,
    img: img || "icons/svg/aura.svg",
    changes: changesArray.map(c => ({
      key: c.key,
      mode: c.mode !== undefined ? c.mode : 2,
      value: c.value
    })),
    disabled: false,
    transfer: true,
    duration: { seconds: null, startTime: null },
    flags: {}
  };
}

function cleanName(name) {
  return name
    .replace(/[()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// FONCTION PRINCIPALE
// ============================================
async function migrateCompendium() {
  const compendiumPath = path.join(__dirname, 'avantages');
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('🔄 [Migration] Début de la migration des avantages...\n');

  let updatedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

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

      // Appliquer les effets mappés
      if (EFFECT_MAPPING[item._id]) {
        const changesArray = EFFECT_MAPPING[item._id];
        
        if (hasExistingEffects) {
          console.log(`⚠️  [${item.name}] a déjà des effets. Ajout de nouveaux effets.`);
        }

        // Créer UN ActiveEffect avec tous les changements
        const effectName = `Effet: ${cleanName(item.name).substring(0, 30)}`;
        const effect = createActiveEffect(effectName, item.img, changesArray);
        item.effects.push(effect);

        await db.put(key, JSON.stringify(item));
        updatedCount++;
        console.log(`✅ [${item.name}] - ${changesArray.length} changement(s) ajouté(s)`);
      } else {
        skippedCount++;
        if (hasExistingEffects) {
          console.log(`ℹ️  [${item.name}] - Effets déjà présents (${item.effects.length})`);
        } else {
          console.log(`ℹ️  [${item.name}] - Aucun effet à ajouter (non automatisable)`);
        }
      }
    } catch (e) {
      errorCount++;
      console.error(`❌ [ERREUR] ${key}: ${e.message}`);
    }
  }

  await db.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 [Résumé de la migration]');
  console.log('='.repeat(60));
  console.log(`✅ Avantages modifiés : ${updatedCount}`);
  console.log(`ℹ️  Avantages sans modification : ${skippedCount}`);
  console.log(`❌ Erreurs : ${errorCount}`);
  console.log('\n✨ Migration terminée !');
  console.log('⚠️  Certains effets non automatisables nécessitent des modules supplémentaires.');
}

// ============================================
// EXÉCUTION
// ============================================
console.log('📋 [Antique v14] Migration des ActiveEffects pour les avantages\n');
console.log('🔹 Backup disponible dans : _backup_db_20250115/\n');

migrateCompendium().catch(err => {
  console.error('❌ Erreur critique:', err);
  process.exit(1);
});


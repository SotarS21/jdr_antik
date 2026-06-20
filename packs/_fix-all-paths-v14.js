/**
 * Correction complète des chemins ActiveEffect pour Foundry VTT v14
 * Remplace system. par data. dans TOUS les compendiums du système Antique
 * Cible : avantages, benedictions, sorts, etc.
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// Liste des compendiums à corriger
const COMPENDIUMS = [
  'avantages',
  'avantages-divins', 
  'benedictions',
  'sorts',
  'armes',
  'equipement',
  'desavantages'
];

// Compendiums à ignorer (non-Item ou sans effets)
const SKIP_COMPENDIUMS = ['pnj', 'dieux', 'creatures', 'historique'];

async function fixCompendium(compendiumName) {
  const dbPath = path.join(__dirname, compendiumName);
  
  // Vérifier si c'est un dossier LevelDB
  if (!fs.existsSync(dbPath)) {
    console.log(`⚠️  ${compendiumName}: Non trouvé (fichier .db manquant)`);
    return 0;
  }
  
  const db = new ClassicLevel(dbPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  let updatedCount = 0;
  let totalEffects = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;
    
    try {
      const item = JSON.parse(value);
      
      // Ne corriger que les items avec des effets
      if (!item.effects || !Array.isArray(item.effects)) continue;
      
      let modified = false;
      totalEffects += item.effects.length;
      
      for (const effect of item.effects) {
        if (!effect.changes || !Array.isArray(effect.changes)) continue;
        
        for (const change of effect.changes) {
          if (change.key && typeof change.key === 'string' && change.key.startsWith('system.')) {
            change.key = change.key.replace(/^system\./, 'data.');
            modified = true;
          }
        }
      }
      
      if (modified) {
        await db.put(key, JSON.stringify(item));
        updatedCount++;
        console.log(`  ✅ [${compendiumName}] ${item.name || key} (${item.effects.length} effets)`);
      }
    } catch (e) {
      console.error(`  ❌ [${compendiumName}] Erreur avec ${key}: ${e.message}`);
    }
  }
  
  await db.close();
  return updatedCount;
}

// Fonction pour copier un fichier .db vers le dossier Foundry
function copyToFoundry(compendiumName) {
  const source = path.join(__dirname, compendiumName + '.db');
  const destDir = path.join(__dirname, '..', '..', '..', 'Users', 'arthe', 'AppData', 'Local', 'FoundryVTT', 'Data', 'systems', 'antique', 'packs');
  const dest = path.join(destDir, compendiumName + '.db');
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    return true;
  }
  return false;
}

async function main() {
  console.log('🔄 [Antique v14] Correction complète des chemins (system. → data.)\n');
  console.log('='.repeat(70));
  
  let globalUpdated = 0;
  let globalTotalEffects = 0;
  
  for (const compendium of COMPENDIUMS) {
    console.log(`\n📁 Compendium: ${compendium}`);
    console.log('-'.repeat(50));
    const updated = await fixCompendium(compendium);
    globalUpdated += updated;
    console.log(`   → ${updated} items modifiés`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 BILAN FINAL');
  console.log('='.repeat(70));
  console.log(`✅ Total items corrigés: ${globalUpdated}`);
  console.log(`ℹ️  Tous les chemins 'system.xxx' → 'data.xxx' appliqués`);
  console.log('\n💡 Prochaine étape: Copier les fichiers vers Foundry VTT');
  
  // Copier les fichiers modifiés vers Foundry
  console.log('\n📤 Copie vers Foundry...');
  for (const compendium of COMPENDIUMS) {
    const source = path.join(__dirname, compendium);
    if (fs.existsSync(source + '.db')) {
      const destDir = path.join('C:', 'Users', 'arthe', 'AppData', 'Local', 'FoundryVTT', 'Data', 'systems', 'antique', 'packs');
      const dest = path.join(destDir, compendium + '.db');
      if (fs.existsSync(destDir)) {
        fs.copyFileSync(source + '.db', dest);
        console.log(`  ✅ Copié: ${compendium}.db`);
      }
    }
  }
  
  console.log('\n✨ Correction complète terminée !');
  console.log('⚠️  Nettoyer le cache Foundry: fvtt package clear');
}

main().catch(err => {
  console.error('❌ Erreur critique:', err);
  process.exit(1);
});

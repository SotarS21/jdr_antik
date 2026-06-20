const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// Compendiums à vérifier (fichiers .db)
const DB_FILES = [
  { name: 'pnj', type: 'Actor' },
  { name: 'dieux', type: 'Actor' },
  { name: 'creatures', type: 'Actor' }
];

(async () => {
  console.log('🔍 Vérification des ACTEURS dans les compendiums\n');
  console.log('='.repeat(70));

  let totalSystem = 0;
  
  for (const { name, type } of DB_FILES) {
    const dbPath = path.join(__dirname, name);
    const dbFilePath = path.join(__dirname, name + '.db');
    let db = null;
    
    try {
      // Essayer d'abord le dossier LevelDB
      if (fs.existsSync(dbPath)) {
        db = new ClassicLevel(dbPath, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
      }
      // Sinon essayer le fichier .db
      else if (fs.existsSync(dbFilePath)) {
        db = new ClassicLevel(dbFilePath, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
      }
      else {
        console.log(`❌ ${name}: Non trouvé (ni dossier ni fichier .db)`);
        continue;
      }

      let compSystemCount = 0;
      let compDataCount = 0;
      let actorCount = 0;

      for await (const [key, value] of db.iterator()) {
        if (key.startsWith('!folders!')) continue;
        
        try {
          const item = JSON.parse(value);
          
          // Vérifier si c'est un acteur
          if (item.type === type || item.type === 'NPC' || item.type === 'Deity' || item.type === 'Creature') {
            actorCount++;
            
            if (item.effects) {
              for (const effect of item.effects) {
                if (!effect.changes) continue;
                for (const change of effect.changes) {
                  if (change.key) {
                    if (change.key.startsWith('data.')) compDataCount++;
                    if (change.key.startsWith('system.')) {
                      compSystemCount++;
                      totalSystem++;
                      console.log(`  ❌ [${name}] ${item.name}: ${change.key}`);
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          // Ignorer
        }
      }

      await db.close();
      console.log(`${name} (${type}): ${actorCount} acteurs, data.xxx=${compDataCount}, system.xxx=${compSystemCount}`);
    } catch (e) {
      console.error(`❌ Erreur avec ${name}: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Bilan:');
  console.log(`   Total chemins 'system.' dans les acteurs: ${totalSystem}`);
  
  if (totalSystem > 0) {
    console.log(`\n⚠️  CORRECTION NÉCESSAIRE: ${totalSystem} chemins 'system.' trouvés`);
  } else {
    console.log('\n✅ Tous les acteurs ont des chemins corrects (data.xxx)');
  }
})();

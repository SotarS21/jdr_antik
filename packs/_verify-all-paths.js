const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

const COMPENDIUMS = ['avantages', 'desavantages', 'benedictions', 'sorts'];

(async () => {
  console.log('🔍 Vérification complète des chemins (tous compendiums)\n');
  console.log('='.repeat(70));

  for (const compendium of COMPENDIUMS) {
    const dbPath = path.join(__dirname, compendium);
    if (!fs.existsSync(dbPath)) {
      console.log(`❌ ${compendium}: Non trouvé`);
      continue;
    }

    const db = new ClassicLevel(dbPath, { 
      keyEncoding: 'utf8', 
      valueEncoding: 'utf8' 
    });

    let dataCount = 0;
    let systemCount = 0;

    for await (const [key, value] of db.iterator()) {
      if (key.startsWith('!folders!')) continue;
      if (!key.startsWith('!items!')) continue;
      
      try {
        const item = JSON.parse(value);
        if (!item.effects) continue;
        
        for (const effect of item.effects) {
          if (!effect.changes) continue;
          
          for (const change of effect.changes) {
            if (change.key && change.key.startsWith('data.')) {
              dataCount++;
            } else if (change.key && change.key.startsWith('system.')) {
              systemCount++;
              console.log(`  ❌ [${compendium}] ${item.name}: ${change.key}`);
            }
          }
        }
      } catch (e) {
        // Ignorer
      }
    }

    await db.close();
    console.log(`${compendium}: ✅ data.xxx=${dataCount} | ❌ system.xxx=${systemCount}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Vérification terminée !');
})();

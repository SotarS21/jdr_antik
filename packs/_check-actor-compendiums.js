const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

// Compendiums de type Actor
const ACTOR_COMPENDIUMS = ['pnj', 'dieux', 'creatures'];

(async () => {
  console.log('🔍 Vérification des compendiums de type Actor\n');
  console.log('='.repeat(70));

  for (const compendium of ACTOR_COMPENDIUMS) {
    const dbPath = path.join(__dirname, compendium);
    if (!fs.existsSync(dbPath)) {
      console.log(`❌ ${compendium}: Non trouvé`);
      continue;
    }

    const db = new ClassicLevel(dbPath, { 
      keyEncoding: 'utf8', 
      valueEncoding: 'utf8' 
    });

    let totalCount = 0;
    let withEffects = 0;
    let dataCount = 0;
    let systemCount = 0;

    for await (const [key, value] of db.iterator()) {
      if (key.startsWith('!folders!')) continue;
      if (!key.startsWith('!items!') && !key.startsWith('!actors!')) continue;
      
      try {
        const item = JSON.parse(value);
        totalCount++;
        
        // Vérifier si c'est un acteur (type: Actor)
        if (item.type === 'Actor' || item.type === 'NPC' || item.type === 'Deity' || item.type === 'Creature') {
          console.log(`  🎭 ${item.name || 'N/A'} (${item.type || 'Unknown'})`);
          
          if (item.effects) {
            withEffects++;
            for (const effect of item.effects) {
              if (!effect.changes) continue;
              for (const change of effect.changes) {
                if (change.key) {
                  if (change.key.startsWith('data.')) dataCount++;
                  if (change.key.startsWith('system.')) {
                    systemCount++;
                    console.log(`     ❌ system. chemin: ${change.key}`);
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
    console.log(`   ${compendium}: ${totalCount} acteurs, ${withEffects} avec effets, data.xxx=${dataCount}, system.xxx=${systemCount}\n`);
  }

  console.log('='.repeat(70));
  
  if (systemCount > 0) {
    console.log(`\n⚠️  ${systemCount} chemins 'system.' trouvés dans les acteurs - CORRECTION NÉCESSAIRE`);
  } else {
    console.log('\n✅ Tous les acteurs ont des chemins corrects (data.xxx)');
  }
})();

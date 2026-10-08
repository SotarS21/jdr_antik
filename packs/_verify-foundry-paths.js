const { ClassicLevel } = require(`${process.env.LOCALAPPDATA}/FoundryVTT/Data/systems/antique/packs/node_modules/classic-level`);
const path = require('path');

(async () => {
  const db = new ClassicLevel(path.join(process.env.LOCALAPPDATA, 'FoundryVTT', 'Data', 'systems', 'antique', 'packs', 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Vérification des chemins dans Foundry (avantages.db)\n');

  let dataCount = 0;
  let systemCount = 0;

  for await (const [key, value] of db.iterator()) {
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
            console.log(`  ❌ ${item.name}: ${change.key}`);
          }
        }
      }
    } catch (e) {
      // Ignorer
    }
  }

  await db.close();
  console.log(`\n✅ Chemins 'data.xxx': ${dataCount}`);
  console.log(`❌ Chemins 'system.xxx': ${systemCount}`);
  
  if (systemCount === 0 && dataCount > 0) {
    console.log('\n✨ Tous les chemins sont corrigés dans Foundry !');
  }
})();

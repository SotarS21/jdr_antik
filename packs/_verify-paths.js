const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

(async () => {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Vérification des chemins après correction v14\n');
  console.log('='.repeat(60));

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
            console.log(`❌ [${item.name}] ${change.key}`);
          }
        }
      }
    } catch (e) {
      // Ignorer
    }
  }

  await db.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Résultats:');
  console.log(`✅ Chemins 'data.xxx': ${dataCount}`);
  console.log(`❌ Chemins 'system.xxx': ${systemCount}`);
  
  if (systemCount === 0 && dataCount > 0) {
    console.log('\n✨ Tous les chemins sont corrigés pour v14 !');
  } else if (systemCount > 0) {
    console.log('\n⚠️  Certains chemins ne sont pas encore corrigés.');
  }
})();

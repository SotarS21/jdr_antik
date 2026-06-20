const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function verify() {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Vérification des avantages après migration\n');
  console.log('='.repeat(60));
  
  let totalWithEffects = 0;
  let totalWithoutEffects = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;
    if (!key.startsWith('!items!')) continue;
    
    try {
      const item = JSON.parse(value);
      const effectCount = item.effects ? item.effects.length : 0;
      
      if (effectCount > 0) {
        totalWithEffects++;
        if (totalWithEffects <= 5) {
          console.log(`✅ ${item.name} - ${effectCount} effet(s)`);
          item.effects.forEach(e => {
            console.log(`   - ${e.name}: ${e.changes.length} changement(s)`);
          });
        }
      } else {
        totalWithoutEffects++;
        if (totalWithoutEffects <= 5) {
          console.log(`❌ ${item.name} - Aucun effet`);
        }
      }
    } catch (e) {
      console.error(`⚠️  Erreur avec ${key}: ${e.message}`);
    }
  }
  
  await db.close();
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Total:`);
  console.log(`   ✅ Avec effets: ${totalWithEffects}`);
  console.log(`   ❌ Sans effets: ${totalWithoutEffects}`);
}

verify();

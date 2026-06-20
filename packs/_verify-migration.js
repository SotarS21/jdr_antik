const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function verify() {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Vérification des avantages modifiés...\n');
  
  const sampleIds = [
    'aAdv000000000002', // Sens aiguisé
    'aAdv000000000007', // Athlète
    'aAdv000000000022', // Voix enchanteresse
    'aAdv000000000029'  // Taille imposante
  ];

  for (const id of sampleIds) {
    try {
      const value = await db.get(id);
      const item = JSON.parse(value);
      console.log(`📌 ${item.name}`);
      console.log(`   ID: ${item._id}`);
      console.log(`   Effets: ${item.effects ? item.effects.length : 0}`);
      if (item.effects && item.effects.length > 0) {
        item.effects.forEach(e => {
          console.log(`   - ${e.name}: ${e.changes.length} changement(s)`);
          e.changes.forEach(c => {
            console.log(`     • ${c.key} = ${c.value} (mode: ${c.mode})`);
          });
        });
      }
      console.log('');
    } catch (e) {
      console.error(`❌ ${id}: ${e.message}`);
    }
  }
  
  await db.close();
}

verify();

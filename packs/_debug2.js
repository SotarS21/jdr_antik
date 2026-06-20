const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function debug() {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  // Essayer de lire un avantage spécifique
  const id = 'aAdv000000000007'; // Athlète
  
  try {
    const raw = await db.get(id);
    console.log('Raw value type:', typeof raw);
    console.log('Raw value:', raw);
    
    const item = JSON.parse(raw);
    console.log('\nParsed item:');
    console.log('Name:', item.name);
    console.log('Effects count:', item.effects ? item.effects.length : 0);
    
    if (item.effects && item.effects.length > 0) {
      console.log('\nEffects:');
      item.effects.forEach(e => {
        console.log(`  - ${e.name}: ${e.changes.length} changes`);
        console.log('    Changes:', JSON.stringify(e.changes));
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
  
  await db.close();
}

debug();

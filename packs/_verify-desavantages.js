const {ClassicLevel} = require('./node_modules/classic-level');

(async () => {
  const db = new ClassicLevel('desavantages', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  
  const idsToCheck = [
    'aDis000000000011', // Enfant
    'aDis000000000016', // Introverti
    'aDis000000000019', // Hostilite animal
    'aDis000000000020', // Phobie majeur
    'aDis000000000052', // Poigne d'Ares
    'aDis000000000060', // Arc d'Apollon
    'aDis000000000064', // Proie d'Artemis
    'aDis000000000068', // Confiance d'Hephaistos
    'aDis000000000080'  // Coupe de Dionysos
  ];
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('VERIFICATION: Désavantages avec ActiveEffects');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith('!items!')) continue;
    
    try {
      const item = JSON.parse(value);
      if (item._id && idsToCheck.includes(item._id)) {
        const hasEffects = item.effects && item.effects.length > 0;
        
        if (hasEffects) {
          console.log(`✅ [${item._id}] ${item.name}`);
          item.effects.forEach((eff, i) => {
            if (eff.changes) {
              eff.changes.forEach(c => {
                console.log(`   - ${c.key} = ${c.value}`);
              });
            } else {
              console.log(`   - (pas de changes definis)`);
            }
          });
        } else {
          console.log(`❌ [${item._id}] ${item.name} - AUCUN EFFET`);
        }
        console.log('');
      }
    } catch (e) {
      // ignore
    }
  }
  
  await db.close();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Verification terminee.');
})();

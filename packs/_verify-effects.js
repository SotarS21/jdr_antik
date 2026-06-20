const {ClassicLevel} = require('./node_modules/classic-level');

(async () => {
  const db = new ClassicLevel('avantages', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  
  const idsToCheck = [
    'aAdv000000000001', // Guerrier Aguerri
    'aAdv000000000009', // Commercant
    'aAdv000000000010', // Visage passe-partout
    'aAdv000000000035', // Colere de Zeus
    'aAdv000000000025', // Maitre d'Arme
    'aAdv000000000068'  // Talent d'Hepaistos
  ];
  
  console.log('Verification des ActiveEffects ajoutes:\n');
  
  for (const id of idsToCheck) {
    try {
      const value = await db.get(id);
      const item = JSON.parse(value);
      const hasEffects = item.effects && item.effects.length > 0;
      
      console.log(`[${id}] ${item.name}:`);
      if (hasEffects) {
        console.log(`  ✅ ${item.effects.length} effet(s)`);
        item.effects.forEach((eff, i) => {
          if (eff.changes) {
            eff.changes.forEach(c => {
              console.log(`    - ${c.key} = ${c.value}`);
            });
          }
        });
      } else {
        console.log('  ❌ Aucun effet');
      }
      console.log('');
    } catch (e) {
      console.log(`[${id}] Erreur: ${e.message}\n`);
    }
  }
  
  await db.close();
  console.log('Verification terminee.');
})();

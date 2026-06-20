const {ClassicLevel} = require('./node_modules/classic-level');

(async () => {
  const db = new ClassicLevel('avantages', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  
  const namesToCheck = [
    '(-1) Guerrier Aguerri',
    '(-1) Commercant',
    '(-1) Visage passe partout',
    '(-1) Colere de Zeus',
    '(-1) Respect d\'Hera',
    '(-2) Maitre d\'Arme',
    '(-2) Talent d\'Hepaistos'
  ];
  
  console.log('Verification des ActiveEffects par nom:\n');
  
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith('!items!')) continue;
    
    try {
      const item = JSON.parse(value);
      if (item.name && namesToCheck.includes(item.name)) {
        console.log(`[${item._id}] ${item.name}:`);
        const hasEffects = item.effects && item.effects.length > 0;
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
      }
    } catch (e) {
      // ignore
    }
  }
  
  await db.close();
  console.log('Verification terminee.');
})();

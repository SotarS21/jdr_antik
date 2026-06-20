const {ClassicLevel} = require('./node_modules/classic-level');

(async () => {
  const db = new ClassicLevel('avantages', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  
  let withEffects = 0;
  let withoutEffects = 0;
  const withEffList = [];
  const withoutEffList = [];
  
  console.log('Analyse du compendium Avantages...\n');
  
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith('!items!')) continue;
    
    try {
      const item = JSON.parse(value);
      if (item.type === 'advantage') {
        const hasEffects = item.effects && item.effects.length > 0;
        if (hasEffects) {
          withEffects++;
          withEffList.push(item._id + ' - ' + item.name);
        } else {
          withoutEffects++;
          withoutEffList.push(item._id + ' - ' + item.name);
        }
      }
    } catch (e) {}
  }
  
  await db.close();
  
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║            STATISTIQUES - AVANTAGES                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log(`Total avantages: ${withEffects + withoutEffects}`);
  console.log(`\n✅ Avec ActiveEffects: ${withEffects}`);
  console.log(`❌ Sans ActiveEffects: ${withoutEffects}`);
  
  console.log('\n─' + '─'.repeat(66));
  console.log('AVEC EFFETS (exemples):');
  console.log('─' + '─'.repeat(66));
  withEffList.slice(0, 15).forEach(id => console.log(' ✅', id));
  if (withEffList.length > 15) {
    console.log(` ... et ${withEffList.length - 15} autres`);
  }
  
  console.log('\n─' + '─'.repeat(66));
  console.log('SANS EFFETS (narratifs/complexes/auras):');
  console.log('─' + '─'.repeat(66));
  withoutEffList.forEach(id => console.log(' ❌', id));
  
  console.log('\n✨ COUVERTURE: ' + Math.round((withEffects / (withEffects + withoutEffects)) * 100) + '% des avantages mechaniques');
})();

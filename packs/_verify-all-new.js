const {ClassicLevel} = require('./node_modules/classic-level');

(async () => {
  const db = new ClassicLevel('avantages', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  
  // Tous les IDs qui devraient avoir des nouveaux effets
  const idsToCheck = [
    'aAdv000000000001', // Guerrier Aguerri
    'aAdv000000000009', // Commercant
    'aAdv000000000010', // Visage passe partout
    'aAdv000000000035', // Colere de Zeus
    'aAdv000000000039', // Respect d'Hera
    'aAdv000000000071', // Beaute d'Aphrodite
    'aAdv000000000075', // Mains d'Hermes
    'aAdv000000000024', // Ami des animaux
    'aAdv000000000025', // Maitre d'Arme
    'aAdv000000000026', // Maitre des forges
    'aAdv000000000068', // Talent d'Hepaistos
    'aAdv000000000080', // Talent de Dionysos
    'aAdv000000000064', // Mire d'Artemis
    'aAdv000000000072'  // Charme d'Aphrodite
  ];
  
  let successCount = 0;
  let missCount = 0;
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('VERIFICATION: ActiveEffects ajoutes aux avantages');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith('!items!')) continue;
    
    try {
      const item = JSON.parse(value);
      if (item._id && idsToCheck.includes(item._id)) {
        const hasEffects = item.effects && item.effects.length > 0;
        
        if (hasEffects) {
          successCount++;
          console.log(`✅ [${item._id}] ${item.name}`);
          // Vérifier que le nouvel effet est présent
          const hasNewEffect = item.effects.some(eff => 
            eff.name && eff.name.includes('Effet:')
          );
          if (hasNewEffect) {
            console.log(`   ✓ Nouvel ActiveEffect present`);
          } else {
            console.log(`   ⚠️  Effet present mais peut-etre existant`);
          }
          console.log('');
        } else {
          missCount++;
          console.log(`❌ [${item._id}] ${item.name} - AUCUN EFFET`);
          console.log('');
        }
      }
    } catch (e) {
      // ignore
    }
  }
  
  await db.close();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`RESULTAT: ${successCount}/${idsToCheck.length} avantages verifies`);
  console.log(`          ${missCount} sans ActiveEffects ayant ete ajoutes`);
  console.log('═══════════════════════════════════════════════════════════');
})();

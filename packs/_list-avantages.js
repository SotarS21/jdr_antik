// Script pour lister tous les items du compendium "Avantages"
// Exécuter avec : node _list-avantages.js

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function listCompendiumItems(compendiumPath, compendiumName) {
  console.log('\n=== ' + compendiumName.toUpperCase() + ' ===\n');
  
  const db = new ClassicLevel(compendiumPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });
  
  let count = 0;
  const items = [];
  
  for await (const [key, value] of db.iterator()) {
    // Ignorer les entrée de dossier (commencent par !folders!)
    if (key.startsWith('!folders!')) {
      continue;
    }
    
    try {
      const parsed = JSON.parse(value);
      
      // Filtrer les entrées valides (avec un nom)
      if (parsed.name) {
        count++;
        items.push({
          id: key,
          name: parsed.name,
          type: parsed.type || 'N/A',
          folder: parsed.folder || 'Aucun'
        });
        
        console.log(`${count}. [${parsed.type || 'N/A'}] ${parsed.name}`);
        if (parsed.folder) {
          console.log(`   Dossier: ${parsed.folder}`);
        }
        console.log('');
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
  }
  
  console.log(`\nTotal: ${count} items trouvés`);
  await db.close();
  
  return items;
}

// Chemin vers le compendium
const compendiumPath = path.join(__dirname, 'avantages');

// Exécuter
listCompendiumItems(compendiumPath, 'Compendium Avantages')
  .then(() => console.log('\n✅ Liste terminée'))
  .catch(err => console.error('Erreur:', err));

/**
 * Script pour lister tous les désavantages du compendium
 * Exécuter avec : node _list-desavantages.js
 */

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');
const fs = require('fs');

async function listDesavantages() {
  const dbPath = path.join(__dirname, 'desavantages');
  console.log('Lecture du compendium des désavantages depuis:', dbPath);
  
  const db = new ClassicLevel(dbPath, { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('\n=== LISTE DES DÉSAVANTAGES ===\n');
  
  const items = [];
  let count = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!folders!')) continue;
    
    try {
      const item = JSON.parse(value);
      
      if (item.name && item.type === 'disadvantage') {
        count++;
        items.push(item);
        
        const hasEffects = item.effects && item.effects.length > 0;
        const effectText = item.system?.effect || item.system?.description || '';
        
        console.log(`${count}. [${item._id}] ${item.name}`);
        console.log(`   Cout: ${item.system?.cout || 'N/A'}`);
        console.log(`   Effet: ${effectText.substring(0, 80)}${effectText.length > 80 ? '...' : ''}`);
        console.log(`   ActiveEffects: ${hasEffects ? item.effects.length + ' ✅' : '0 ❌'}`);
        console.log('');
      }
    } catch (e) {
      console.log(`Erreur parsing ${key}:`, e.message);
    }
  }
  
  await db.close();
  
  console.log(`\nTotal: ${count} désavantages trouvés`);
  
  // Sauvegarder en JSON
  fs.writeFileSync(
    path.join(__dirname, 'desavantages_liste.json'),
    JSON.stringify(items, null, 2),
    'utf8'
  );
  console.log('✅ Liste sauvegardée dans: desavantages_liste.json');
  
  return items;
}

listDesavantages().catch(err => console.error('Erreur:', err));

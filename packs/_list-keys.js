const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function listKeys() {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Liste des 10 premières clés :\n');
  
  let count = 0;
  for await (const [key, value] of db.iterator()) {
    if (count >= 10) break;
    console.log(`${count + 1}. ${key}`);
    count++;
  }
  
  await db.close();
}

listKeys();

const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

async function debug() {
  const db = new ClassicLevel(path.join(__dirname, 'avantages'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Lecture de la première entrée...\n');
  
  for await (const [key, value] of db.iterator()) {
    console.log('Key:', key);
    console.log('Value type:', typeof value);
    console.log('Value preview:', value.substring(0, 200));
    break;
  }
  
  await db.close();
}

debug();

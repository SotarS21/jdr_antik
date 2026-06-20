const fs = require('fs');

const FILES = ['pnj', 'dieux', 'creatures'];

function checkFile(name) {
  const data = fs.readFileSync(name + '.db', 'utf8');
  const items = JSON.parse(data);
  
  let systemCount = 0;
  let actorCount = 0;
  let hasEffects = 0;
  
  for (const item of items) {
    actorCount++;
    if (item.effects && Array.isArray(item.effects)) {
      hasEffects++;
      for (const eff of item.effects) {
        if (eff.changes && Array.isArray(eff.changes)) {
          for (const ch of eff.changes) {
            if (ch.key && ch.key.startsWith('system.')) {
              systemCount++;
              console.log('FOUND system.:', name, '->', item.name, ':', ch.key);
            }
          }
        }
      }
    }
  }
  console.log(name + '.db: ' + actorCount + ' actors, ' + hasEffects + ' with effects, ' + systemCount + ' system. paths');
  return systemCount;
}

let total = 0;
for (const f of FILES) {
  try {
    total += checkFile(f);
  } catch(e) {
    console.log('Error reading', f + '.db:', e.message);
  }
}
console.log('\nTOTAL system. paths in actors:', total);
if (total === 0) {
  console.log('✅ All actors already have correct data. paths');
} else {
  console.log('⚠️  Need to fix ' + total + ' system. paths in actors');
}

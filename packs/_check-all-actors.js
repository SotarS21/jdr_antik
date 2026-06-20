const fs = require('fs');

function checkFile(name) {
  const data = fs.readFileSync(name + '.db', 'utf8');
  
  let systemCount = 0;
  let actorCount = 0;
  let hasEffects = 0;
  
  // Try to split by top-level braces
  let depth = 0;
  let start = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (data[i] === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const obj = JSON.parse(data.substring(start, i + 1));
          actorCount++;
          if (obj.effects && Array.isArray(obj.effects)) {
            hasEffects++;
            for (const eff of obj.effects) {
              if (eff.changes && Array.isArray(eff.changes)) {
                for (const ch of eff.changes) {
                  if (ch.key && typeof ch.key === 'string' && ch.key.startsWith('system.')) {
                    systemCount++;
                    console.log('  FOUND system.:', name, '->', obj.name || obj._id, ':', ch.key);
                  }
                }
              }
            }
          }
        } catch(e) {}
      }
    }
  }
  console.log(name + '.db: ' + actorCount + ' actors, ' + hasEffects + ' with effects, ' + systemCount + ' system. paths');
  return { actors: actorCount, effects: hasEffects, system: systemCount };
}

const files = ['pnj', 'dieux', 'creatures'];
let totalSystem = 0;
let totalActors = 0;
let totalEffects = 0;

for (const f of files) {
  const result = checkFile(f);
  totalActors += result.actors;
  totalEffects += result.effects;
  totalSystem += result.system;
}

console.log('\n' + '='.repeat(50));
console.log('TOTAL:');
console.log('  Actors:', totalActors);
console.log('  Actors with effects:', totalEffects);
console.log('  system. paths found:', totalSystem);

if (totalSystem === 0) {
  console.log('\n✅ All actors already use correct data. paths');
} else {
  console.log('\n⚠️  Need to fix', totalSystem, 'system. paths in actors');
}

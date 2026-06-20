const { ClassicLevel } = require('./node_modules/classic-level');

async function checkDb(name) {
  const db = new ClassicLevel(name + '.db', { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  let count = 0;
  let systemCount = 0;
  let hasEffects = 0;
  
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!')) continue;
    try {
      const item = JSON.parse(value);
      count++;
      if (item.effects && Array.isArray(item.effects)) {
        hasEffects++;
        for (const eff of item.effects) {
          if (eff.changes && Array.isArray(eff.changes)) {
            for (const ch of eff.changes) {
              if (ch.key && typeof ch.key === 'string') {
                if (ch.key.startsWith('system.')) {
                  systemCount++;
                  console.log('FOUND system.:', name, '->', item.name || key, ':', ch.key);
                }
              }
            }
          }
        }
      }
    } catch(e) {}
  }
  await db.close();
  console.log(name + '.db: ' + count + ' entries, ' + hasEffects + ' with effects, ' + systemCount + ' system. paths');
  return systemCount;
}

(async () => {
  const files = ['pnj', 'dieux', 'creatures'];
  let total = 0;
  for (const f of files) {
    total += await checkDb(f);
  }
  console.log('\nTOTAL system. paths in actors:', total);
  if (total === 0) {
    console.log('✅ All actors have correct data. paths');
  } else {
    console.log('⚠️  Need to fix ' + total + ' system. paths');
  }
})();

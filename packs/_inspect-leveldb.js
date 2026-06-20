const { ClassicLevel } = require('classic-level');
const path = require('path');

async function inspect(dir, label, limit) {
  console.log('\n=== ' + label + ' ===');
  const db = new ClassicLevel(dir, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  let count = 0;
  for await (const [key, value] of db.iterator()) {
    if (count < limit) {
      const parsed = JSON.parse(value);
      console.log('KEY: ' + key);
      console.log('  name: ' + (parsed.name || 'N/A'));
      console.log('  type: ' + (parsed.type || 'N/A'));
      console.log('  folder: ' + (parsed.folder || 'null'));
      if (key.startsWith('!folders!')) {
        console.log('  FULL: ' + value.substring(0, 300));
      }
    }
    count++;
  }
  console.log('Total entries: ' + count);
  await db.close();
}

(async () => {
  const deployed = 'C:/Users/jarthemise/AppData/Local/FoundryVTT/Data/systems/antique/packs';
  // Inspect a working compendium
  await inspect(path.join(deployed, 'armes'), 'ARMES (working)', 5);
  // Inspect our generated compendium
  await inspect(path.join(deployed, 'avantages'), 'AVANTAGES (ours)', 10);
})();

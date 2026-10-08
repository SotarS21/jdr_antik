const { ClassicLevel } = require('classic-level');
const path = require('path');

async function verify(dir, label) {
  console.log('\n=== ' + label + ' ===');
  const db = new ClassicLevel(dir, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
  let folders = 0, items = 0, withFolder = 0;
  for await (const [key, value] of db.iterator()) {
    const parsed = JSON.parse(value);
    if (key.startsWith('!folders!')) {
      folders++;
      console.log('FOLDER: ' + parsed.name + ' (id: ' + parsed._id + ')');
    } else {
      items++;
      if (parsed.folder) withFolder++;
      if (items <= 3) {
        console.log('ITEM: ' + parsed.name + ' -> folder: ' + parsed.folder);
      }
    }
  }
  console.log('... ' + items + ' items total, ' + withFolder + ' avec dossier assigné, ' + folders + ' dossiers');
  await db.close();
}

(async () => {
  const deployed = `${process.env.LOCALAPPDATA}/FoundryVTT/Data/systems/antique/packs`;
  await verify(path.join(deployed, 'avantages'), 'AVANTAGES (deployed)');
  await verify(path.join(deployed, 'desavantages'), 'DESAVANTAGES (deployed)');
})();

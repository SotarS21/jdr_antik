const { ClassicLevel } = require('classic-level');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a valid Foundry v13 ID (16 alphanumeric chars) from a seed string
function generateFoundryId(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return hash.substring(0, 16);
}

async function createLevelDB(dbFile, outputDir) {
  const content = fs.readFileSync(dbFile, 'utf8');
  const lines = content.split('\n').filter(l => l.trim().startsWith('{'));
  // Only keep actual items (skip any folder entries from previous runs)
  const items = lines.map(l => JSON.parse(l)).filter(e => e.system && e.system.cout !== undefined);

  // Get unique costs sorted by absolute value
  const costs = [...new Set(items.map(e => e.system.cout))].sort((a, b) => Math.abs(a) - Math.abs(b));

  // Create folder definitions
  const costToFolderId = {};
  const packName = path.basename(dbFile, '.db');
  const folders = costs.map((cost, i) => {
    const id = generateFoundryId(packName + '_cost_' + cost + '_' + i);
    costToFolderId[cost] = id;
    return {
      name: 'Coût ' + cost,
      sorting: 'a',
      folder: null,
      type: 'Item',
      _id: id,
      sort: (i + 1) * 100000,
      color: null,
      flags: {}
    };
  });

  // Clean output dir
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }

  const db = new ClassicLevel(outputDir, { keyEncoding: 'utf8', valueEncoding: 'utf8' });

  // Write folders
  for (const folder of folders) {
    const key = '!folders!' + folder._id;
    await db.put(key, JSON.stringify(folder));
    console.log('  Folder: ' + folder.name + ' (' + folder._id + ')');
  }

  // Write items with folder assigned
  for (const item of items) {
    item.folder = costToFolderId[item.system.cout];
    // Remove any _key field from old format
    delete item._key;
    const key = '!items!' + item._id;
    await db.put(key, JSON.stringify(item));
  }

  console.log('  ' + items.length + ' items with folders assigned');
  await db.close();
  console.log('  OK: ' + outputDir + '\n');
}

(async () => {
  const base = path.dirname(process.argv[1]);
  await createLevelDB(
    path.join(base, 'avantages.db'),
    path.join(base, 'avantages')
  );
  await createLevelDB(
    path.join(base, 'desavantages.db'),
    path.join(base, 'desavantages')
  );
  console.log('Done!');
})();

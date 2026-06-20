const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function buildSortsLevelDB() {
  const dbFile = path.join(__dirname, 'sorts.db');
  const outputDir = path.join(__dirname, 'sorts');

  const content = fs.readFileSync(dbFile, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  const folders = [];
  const items = [];

  lines.forEach(l => {
    try {
      const obj = JSON.parse(l);
      if (!obj.system && obj.sorting !== undefined) {
        folders.push(obj);
      } else if (obj.system) {
        items.push(obj);
      }
    } catch(e) {}
  });

  // Clean output dir
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }

  const db = new ClassicLevel(outputDir, { keyEncoding: 'utf8', valueEncoding: 'utf8' });

  // Write folders with !folders! key prefix
  for (const folder of folders) {
    const key = '!folders!' + folder._id;
    await db.put(key, JSON.stringify(folder));
    console.log('  Folder: ' + folder.name + ' (' + folder._id + ')');
  }

  // Write items with !items! key prefix
  for (const item of items) {
    const key = '!items!' + item._id;
    await db.put(key, JSON.stringify(item));
  }

  console.log('\n  ' + folders.length + ' folders');
  console.log('  ' + items.length + ' spell items');
  await db.close();
  console.log('  OK: ' + outputDir);
}

buildSortsLevelDB().catch(e => {
  console.error(e);
  process.exit(1);
});

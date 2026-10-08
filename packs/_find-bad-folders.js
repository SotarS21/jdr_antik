const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

const deployed = `${process.env.LOCALAPPDATA}/FoundryVTT/Data/systems/antique/packs`;

async function scanPack(dir, label) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  if (label === 'node_modules' || label === 'token') return;

  let db;
  try {
    db = new ClassicLevel(dir, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
    await db.open();

    let folderCount = 0;
    let badFolders = [];
    let totalEntries = 0;

    const entries = await db.iterator().all();
    for (const [key, value] of entries) {
      totalEntries++;
      if (key.startsWith('!folders!')) {
        folderCount++;
        try {
          const parsed = JSON.parse(value);
          const id = parsed._id;
          const isValid = /^[a-zA-Z0-9]{16}$/.test(id);
          if (!isValid) {
            badFolders.push({ key, id, name: parsed.name, full: value.substring(0, 500) });
          }
        } catch (parseErr) {
          badFolders.push({ key, id: 'PARSE_ERROR', name: 'N/A', full: value.substring(0, 200) });
        }
      }
    }

    console.log(`[${label}] ${totalEntries} entries, ${folderCount} folders, ${badFolders.length} BAD`);
    for (const bf of badFolders) {
      console.log(`  BAD FOLDER: key=${bf.key} _id=${bf.id} name=${bf.name}`);
      console.log(`  DATA: ${bf.full}`);
    }

    await db.close();
  } catch (e) {
    console.log(`[${label}] ERROR: ${e.message}`);
    if (db) try { await db.close(); } catch (_) {}
  }
}

(async () => {
  console.log('Scanning all packs in:', deployed);
  const dirEntries = fs.readdirSync(deployed);
  for (const entry of dirEntries) {
    const full = path.join(deployed, entry);
    if (fs.statSync(full).isDirectory()) {
      await scanPack(full, entry);
    }
  }
  console.log('\nDone.');
})();

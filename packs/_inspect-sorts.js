const fs = require('fs');
const lines = fs.readFileSync('./sorts.db', 'utf8').split('\n');

let items = 0;
let folders = 0;
const folderMap = {};  // id -> name
const folderRefs = {}; // folder id -> count of items

lines.forEach(l => {
  if (!l.trim()) return;
  try {
    const obj = JSON.parse(l);

    // Check if this is a folder entry
    if (obj.type === 'folder' || (obj.name && !obj.system && obj.sorting !== undefined)) {
      folders++;
      folderMap[obj._id] = obj.name || '(unnamed)';
      console.log('FOLDER: id=' + obj._id + ' name="' + obj.name + '" type=' + (obj.type || '?'));
    } else {
      items++;
      const fid = obj.folder || 'null';
      folderRefs[fid] = (folderRefs[fid] || 0) + 1;
    }
  } catch (e) {}
});

console.log('\n--- Résumé ---');
console.log('Items: ' + items);
console.log('Folders: ' + folders);
console.log('\nItems par dossier:');
Object.entries(folderRefs).forEach(([fid, count]) => {
  const fname = folderMap[fid] || '(aucun dossier)';
  console.log('  ' + fname + ' (' + fid + '): ' + count + ' items');
});

// Show first 5 items as sample
console.log('\n--- Premiers items ---');
let shown = 0;
lines.forEach(l => {
  if (!l.trim() || shown >= 5) return;
  try {
    const obj = JSON.parse(l);
    if (obj.system) {
      console.log(obj.name + ' | type=' + obj.type + ' | folder=' + obj.folder + ' | ritual=' + (obj.system.ritual || false));
      shown++;
    }
  } catch (e) {}
});

const fs = require('fs');
const lines = fs.readFileSync('./sorts.db', 'utf8').split('\n');

const folders = {};
const items = [];

lines.forEach(l => {
  if (!l.trim()) return;
  try {
    const obj = JSON.parse(l);
    if (!obj.system) {
      // Folder
      folders[obj._id] = obj;
    } else {
      items.push(obj);
    }
  } catch (e) {}
});

// List all folders
console.log('=== DOSSIERS ===');
Object.values(folders).forEach(f => {
  const childCount = items.filter(i => i.folder === f._id).length;
  console.log('  ' + f.name + ' (id=' + f._id + ') -> ' + childCount + ' sorts');
});

// List all items grouped by folder
console.log('\n=== SORTS PAR DOSSIER ===');
const grouped = {};
items.forEach(i => {
  const fid = i.folder || 'AUCUN';
  if (!grouped[fid]) grouped[fid] = [];
  grouped[fid].push(i);
});

Object.entries(grouped).forEach(([fid, list]) => {
  const fname = folders[fid] ? folders[fid].name : '(sans dossier)';
  console.log('\n[' + fname + '] (' + list.length + ' sorts)');
  list.forEach(i => {
    const r = i.system.ritual ? ' [RITUEL]' : '';
    const cost = i.system.ritual ? ('ingredients: ' + (i.system.costText || '?')) : ('PM: ' + i.system.cost);
    console.log('  - ' + i.name + r + ' | ' + cost + ' | limit: ' + i.system.limitation);
  });
});

// Check for folder "Rituels" with no items
console.log('\n=== DOSSIER "Rituels" ===');
const rituelFolder = Object.values(folders).find(f => f.name === 'Rituels');
if (rituelFolder) {
  const rituelItems = items.filter(i => i.folder === rituelFolder._id);
  console.log('Items dans le dossier Rituels: ' + rituelItems.length);
  if (rituelItems.length === 0) {
    console.log('VIDE - les rituels sont-ils dans un autre dossier ?');
    const ritualSpells = items.filter(i => i.system.ritual);
    console.log('Sorts marqués ritual=true: ' + ritualSpells.length);
    ritualSpells.forEach(i => {
      const fname = folders[i.folder] ? folders[i.folder].name : '(sans dossier)';
      console.log('  - ' + i.name + ' -> dossier: ' + fname);
    });
  }
}

const fs = require('fs');

function getFirstEntry(file, type) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const l of lines) {
    if (!l.trim()) continue;
    try {
      const obj = JSON.parse(l);
      if (type === 'item' && obj.system) return obj;
      if (type === 'folder' && !obj.system && obj.sorting !== undefined) return obj;
    } catch(e) {}
  }
  return null;
}

// Compare items
console.log('=== ITEM COMPARISON (full JSON) ===\n');

const sortsItem = getFirstEntry('./sorts.db', 'item');
const armesItem = getFirstEntry('./armes.db', 'item');
const alchimieItem = getFirstEntry('./alchimie.db', 'item');

console.log('sorts.db item keys:', JSON.stringify(Object.keys(sortsItem)));
console.log('armes.db item keys:', JSON.stringify(Object.keys(armesItem)));
console.log('alchimie.db item keys:', JSON.stringify(Object.keys(alchimieItem)));

// Check for _stats
console.log('\nsorts.db _stats:', JSON.stringify(sortsItem._stats));
console.log('armes.db _stats:', JSON.stringify(armesItem._stats));
console.log('alchimie.db _stats:', JSON.stringify(alchimieItem._stats));

// Compare folders
console.log('\n=== FOLDER COMPARISON ===\n');

const sortsFolder = getFirstEntry('./sorts.db', 'folder');
const armesFolder = getFirstEntry('./armes.db', 'folder');
const alchimieFolder = getFirstEntry('./alchimie.db', 'folder');

console.log('sorts.db folder keys:', JSON.stringify(Object.keys(sortsFolder)));
console.log('armes.db folder keys:', JSON.stringify(Object.keys(armesFolder)));
console.log('alchimie.db folder keys:', JSON.stringify(Object.keys(alchimieFolder)));

console.log('\nsorts.db folder:', JSON.stringify(sortsFolder));
console.log('armes.db folder:', JSON.stringify(armesFolder));
console.log('alchimie.db folder:', JSON.stringify(alchimieFolder));

// Check _stats on folders
console.log('\nsorts.db folder _stats:', JSON.stringify(sortsFolder._stats));
console.log('armes.db folder _stats:', JSON.stringify(armesFolder._stats));
console.log('alchimie.db folder _stats:', JSON.stringify(alchimieFolder._stats));

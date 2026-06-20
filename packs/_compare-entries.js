const fs = require('fs');

// Read one spell from sorts.db
const sortLines = fs.readFileSync('./sorts.db', 'utf8').split('\n');
let spellEntry = null;
let folderEntry = null;
for (const l of sortLines) {
  if (!l.trim()) continue;
  try {
    const obj = JSON.parse(l);
    if (obj.system && !spellEntry) spellEntry = obj;
    if (!obj.system && !folderEntry) folderEntry = obj;
  } catch(e) {}
}

// Read one item from armes.db (working compendium)
const armesLines = fs.readFileSync('./armes.db', 'utf8').split('\n');
let armeEntry = null;
let armeFolderEntry = null;
for (const l of armesLines) {
  if (!l.trim()) continue;
  try {
    const obj = JSON.parse(l);
    if (obj.system && !armeEntry) armeEntry = obj;
    if (!obj.system && !armeFolderEntry) armeFolderEntry = obj;
  } catch(e) {}
}

console.log('=== SPELL ENTRY (sorts.db) ===');
console.log('Top-level keys:', Object.keys(spellEntry).join(', '));
console.log(JSON.stringify(spellEntry, null, 2));

console.log('\n=== ARME ENTRY (armes.db) ===');
console.log('Top-level keys:', Object.keys(armeEntry).join(', '));
console.log(JSON.stringify(armeEntry, null, 2));

console.log('\n=== FOLDER in sorts.db ===');
console.log('Top-level keys:', Object.keys(folderEntry).join(', '));
console.log(JSON.stringify(folderEntry, null, 2));

if (armeFolderEntry) {
  console.log('\n=== FOLDER in armes.db ===');
  console.log('Top-level keys:', Object.keys(armeFolderEntry).join(', '));
  console.log(JSON.stringify(armeFolderEntry, null, 2));
} else {
  console.log('\n=== No folder in armes.db ===');
}

// Compare keys
console.log('\n=== MISSING KEYS in spell vs arme ===');
const spellKeys = Object.keys(spellEntry);
const armeKeys = Object.keys(armeEntry);
const missingInSpell = armeKeys.filter(k => !spellKeys.includes(k));
const extraInSpell = spellKeys.filter(k => !armeKeys.includes(k));
console.log('Missing in spell:', missingInSpell.join(', ') || '(none)');
console.log('Extra in spell:', extraInSpell.join(', ') || '(none)');

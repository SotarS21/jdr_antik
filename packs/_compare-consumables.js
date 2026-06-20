const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

// 1. Read compendium
const lines = fs.readFileSync('./equipement.db', 'utf8').split('\n');
const compendium = [];
lines.forEach(l => {
  if (!l.trim()) return;
  try {
    const o = JSON.parse(l);
    if (o.system && o.system.consumable) compendium.push(o.name);
  } catch (e) {}
});

// 2. Read Excel
const wb = XLSX.readFile('C:/Projet/CF_3.7/CLAUDE_TEST_FROMATION/VTT_Foundry/jonas antik.xlsx');
const ws = wb.Sheets['Consommable'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const excelIngredients = new Set();
const excelPotions = new Set();
let inPotions = false;

data.forEach((row) => {
  if (!row || row.length === 0) return;
  if (row[0] === 'Potions') { inPotions = true; return; }
  if (!inPotions) {
    [1, 4, 7].forEach(col => {
      if (row[col] && typeof row[col] === 'string' && row[col].trim()) {
        excelIngredients.add(row[col].trim());
      }
    });
  } else {
    if (row[1] && typeof row[1] === 'string' && row[1].trim() && row[1] !== 'Nom') {
      excelPotions.add(row[1].trim());
    }
  }
});

excelIngredients.delete('Ingrédient');
excelIngredients.delete('description');

const allExcel = new Set([...excelIngredients, ...excelPotions]);
const compSet = new Set(compendium);

const inBoth = [...allExcel].filter(x => compSet.has(x)).sort();
const excelOnly = [...allExcel].filter(x => !compSet.has(x)).sort();
const compOnly = [...compSet].filter(x => !allExcel.has(x)).sort();

console.log('=== DANS LES DEUX (Excel + Compendium) ===');
inBoth.forEach(x => console.log('  ' + x));
console.log('Total: ' + inBoth.length);

console.log('');
console.log('=== EXCEL SEULEMENT (manquant du compendium) ===');
excelOnly.forEach(x => {
  const tag = excelPotions.has(x) ? ' [Potion]' : ' [Ingrédient]';
  console.log('  ' + x + tag);
});
console.log('Total: ' + excelOnly.length);

console.log('');
console.log('=== COMPENDIUM SEULEMENT (pas dans Excel) ===');
compOnly.forEach(x => console.log('  ' + x));
console.log('Total: ' + compOnly.length);

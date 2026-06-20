const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

// Read Excel
const wb = XLSX.readFile('C:/Projet/CF_3.7/CLAUDE_TEST_FROMATION/VTT_Foundry/jonas antik.xlsx');
const ws = wb.Sheets['Consommable'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Extract potions (rows after "Potions" header)
const potions = [];
let inPotions = false;
let currentCategory = '';

data.forEach((row) => {
  if (!row || row.length === 0) return;
  if (row[0] === 'Potions') { inPotions = true; return; }
  if (!inPotions) return;
  if (row[1] === 'Nom') return;

  // Track category (Bénéfique / Négative) - only set on first row of group
  if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
    currentCategory = row[0].trim();
  }

  const name = row[1];
  if (!name || typeof name !== 'string' || !name.trim()) return;

  const ingredients = row[2] || '';
  const prix = row[5] || 0;
  const effet = row[6] || '';

  potions.push({
    name: name.trim(),
    category: currentCategory,
    ingredients: typeof ingredients === 'string' ? ingredients.trim() : String(ingredients),
    prix,
    effet: typeof effet === 'string' ? effet.trim() : String(effet)
  });
});

// Icon mapping
function getIcon(potion) {
  if (potion.category === 'Négative') return 'icons/svg/poison.svg';
  if (potion.name.toLowerCase().includes('antidote')) return 'icons/svg/aura.svg';
  if (potion.name.toLowerCase().includes('onguent')) return 'icons/svg/heal.svg';
  if (potion.name.toLowerCase().includes('tisane') || potion.name.toLowerCase().includes('thé')) return 'icons/svg/tankard.svg';
  return 'icons/svg/flask.svg';
}

// Remove previously imported potions (IDs aEqp000000000031+)
const dbPath = './equipement.db';
const existingLines = fs.readFileSync(dbPath, 'utf8').split('\n');
const keptLines = existingLines.filter(l => {
  if (!l.trim()) return false;
  try {
    const obj = JSON.parse(l);
    const idNum = parseInt(obj._id.replace('aEqp', ''), 10);
    return idNum <= 30;
  } catch (e) {
    return true;
  }
});

// Build new entries starting from ID 31
let nextId = 31;
const entries = potions.map(p => {
  const id = 'aEqp' + String(nextId++).padStart(12, '0');
  const description = `<p><em>${p.category}</em></p><p><strong>Ingrédients :</strong> ${p.ingredients}</p><p><strong>Effet :</strong> ${p.effet}</p>${p.prix ? `<p><strong>Prix :</strong> ${p.prix} po</p>` : ''}`;

  return JSON.stringify({
    _id: id,
    name: p.name,
    type: 'equipment',
    img: getIcon(p),
    system: {
      quantity: 1,
      description,
      consumable: true
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  });
});

// Write back
const newContent = keptLines.join('\n') + '\n' + entries.join('\n') + '\n';
fs.writeFileSync(dbPath, newContent, 'utf8');

console.log(`${entries.length} potions importées dans equipement.db :`);
potions.forEach(p => console.log(`  - ${p.name} [${p.category}] : ${p.effet.substring(0, 60)}`));

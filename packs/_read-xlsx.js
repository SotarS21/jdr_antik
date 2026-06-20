const XLSX = require('xlsx');
const path = require('path');

const file = path.resolve(__dirname, '..', '..', 'Fiche technique_aventage_desaventage.xlsx');
const wb = XLSX.readFile(file);

for (const name of wb.SheetNames) {
  console.log('\n=== SHEET: ' + name + ' ===');
  const sheet = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 0; i < Math.min(data.length, 200); i++) {
    const row = data[i];
    if (row && row.length > 0) {
      console.log(`ROW ${i}: ${JSON.stringify(row)}`);
    }
  }
}

const fs = require('fs');
const path = 'C:/Projet/CF_3.7/CLAUDE_TEST_FROMATION/VTT_Foundry/antique/packs';

// Step 1: Scan all .db files for "po/" pattern
const files = fs.readdirSync(path).filter(f => f.endsWith('.db'));
const regex = /(\d+)\s*po\s*\/\s*(\d+)/g;

let totalFixed = 0;

files.forEach(file => {
  const filePath = path + '/' + file;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let modified = false;

  const newLines = lines.map(l => {
    if (!l.trim()) return l;
    if (!regex.test(l)) {
      regex.lastIndex = 0;
      return l;
    }
    regex.lastIndex = 0;

    try {
      const obj = JSON.parse(l);
      const desc = obj.system && obj.system.description ? obj.system.description : '';
      const allText = JSON.stringify(obj);

      // Find all matches before fixing
      const matches = allText.match(/\d+\s*po\s*\/\s*\d+/g);
      if (matches) {
        matches.forEach(m => {
          console.log(`  [${file}] ${obj.name} : "${m}" -> fix`);
        });
      }

      // Fix in description
      if (obj.system && obj.system.description) {
        obj.system.description = obj.system.description.replace(regex, '$1 po à $2 po');
        regex.lastIndex = 0;
      }

      // Fix in any other string field at system level
      if (obj.system) {
        for (const key of Object.keys(obj.system)) {
          if (typeof obj.system[key] === 'string' && key !== 'description') {
            const before = obj.system[key];
            obj.system[key] = obj.system[key].replace(regex, '$1 po à $2 po');
            regex.lastIndex = 0;
            if (obj.system[key] !== before) {
              // already logged above
            }
          }
        }
      }

      // Also check name (unlikely but just in case)
      if (typeof obj.name === 'string') {
        obj.name = obj.name.replace(regex, '$1 po à $2 po');
        regex.lastIndex = 0;
      }

      modified = true;
      totalFixed++;
      return JSON.stringify(obj);
    } catch (e) {
      return l;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`-> ${file} sauvegardé`);
  }
});

console.log(`\nTotal: ${totalFixed} objets corrigés`);

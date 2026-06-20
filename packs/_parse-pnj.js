const fs = require('fs');
const data = fs.readFileSync('pnj.db', 'utf8');

// Try to count braces
let openCount = 0;
let closeCount = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') openCount++;
  if (data[i] === '}') closeCount++;
}
console.log('Total opening braces:', openCount);
console.log('Total closing braces:', closeCount);

// Try to parse as JSON
try {
  const parsed = JSON.parse(data);
  console.log('Parsed as JSON. Type:', typeof parsed);
  if (Array.isArray(parsed)) {
    console.log('It is an array with', parsed.length, 'items');
  } else {
    console.log('It is an object with keys:', Object.keys(parsed).slice(0, 10));
  }
} catch(e) {
  console.log('Not valid JSON:', e.message);
  console.log('Trying to find JSON objects...');
  
  // Try to split by top-level braces
  let depth = 0;
  let start = -1;
  let objects = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (data[i] === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const obj = JSON.parse(data.substring(start, i + 1));
          objects++;
          if (obj.effects) {
            console.log('Object with effects:', obj.name || obj._id);
            for (const eff of obj.effects) {
              if (eff.changes) {
                for (const ch of eff.changes) {
                  if (ch.key && ch.key.startsWith('system.')) {
                    console.log('  FOUND system.:', ch.key);
                  }
                }
              }
            }
          }
        } catch(e2) {}
      }
    }
  }
  console.log('Found', objects, 'top-level objects');
}

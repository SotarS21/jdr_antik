const fs = require('fs');
const data = fs.readFileSync('pnj.db', 'utf8');
console.log('Length:', data.length);
console.log('First 200 chars:');
console.log(data.substring(0, 200));
console.log('\nLast 200 chars:');
console.log(data.substring(data.length - 200));

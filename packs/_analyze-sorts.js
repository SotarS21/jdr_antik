const fs = require('fs');
const lines = fs.readFileSync('./sorts.db', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (!l.trim()) return;
  try {
    const obj = JSON.parse(l);
    const isFolder = !obj.system;
    if (isFolder) {
      console.log('FOLDER line ' + (i+1) + ': id=' + obj._id + ' name="' + obj.name + '" type=' + obj.type + ' folder=' + (obj.folder || 'null'));
      console.log('  keys: ' + Object.keys(obj).join(', '));
    } else {
      const fields = Object.keys(obj.system);
      console.log('SPELL  line ' + (i+1) + ': id=' + obj._id + ' name="' + obj.name + '" type=' + obj.type + ' folder=' + (obj.folder || 'null'));
      console.log('  system fields: ' + fields.join(', '));
      // Check for unexpected fields or missing required ones
      const expected = ['effect','cost','ritual','costText','limitation','limitationValue','range','duration','description','gmNotes'];
      const extra = fields.filter(f => !expected.includes(f));
      const missing = expected.filter(f => !fields.includes(f));
      if (extra.length) console.log('  EXTRA fields: ' + extra.join(', '));
      if (missing.length) console.log('  MISSING fields: ' + missing.join(', '));
      // Check field types
      if (typeof obj.system.cost !== 'number') console.log('  WARN: cost is ' + typeof obj.system.cost + ' = ' + JSON.stringify(obj.system.cost));
      if (typeof obj.system.ritual !== 'boolean') console.log('  WARN: ritual is ' + typeof obj.system.ritual + ' = ' + JSON.stringify(obj.system.ritual));
      if (typeof obj.system.limitation !== 'number' && obj.system.limitation !== undefined) console.log('  WARN: limitation is ' + typeof obj.system.limitation + ' = ' + JSON.stringify(obj.system.limitation));
      if (typeof obj.system.limitationValue !== 'number' && obj.system.limitationValue !== undefined) console.log('  WARN: limitationValue is ' + typeof obj.system.limitationValue + ' = ' + JSON.stringify(obj.system.limitationValue));
    }
  } catch(e) { console.log('ERROR line ' + (i+1) + ': ' + e.message); }
});

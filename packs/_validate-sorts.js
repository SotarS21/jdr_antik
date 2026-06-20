const fs = require('fs');
const lines = fs.readFileSync('./sorts.db', 'utf8').split('\n');

let errors = 0;
lines.forEach((l, i) => {
  if (!l.trim()) return;
  try {
    const obj = JSON.parse(l);
    if (!obj.system) return; // skip folders

    const s = obj.system;
    const issues = [];

    // Check types match schema
    // effect: StringField
    if (typeof s.effect !== 'string') issues.push('effect: expected string, got ' + typeof s.effect + ' = ' + JSON.stringify(s.effect));

    // cost: NumberField integer
    if (typeof s.cost !== 'number') issues.push('cost: expected number, got ' + typeof s.cost + ' = ' + JSON.stringify(s.cost));
    else if (!Number.isInteger(s.cost)) issues.push('cost: not integer = ' + s.cost);

    // ritual: BooleanField
    if (typeof s.ritual !== 'boolean') issues.push('ritual: expected boolean, got ' + typeof s.ritual + ' = ' + JSON.stringify(s.ritual));

    // costText: StringField
    if (typeof s.costText !== 'string') issues.push('costText: expected string, got ' + typeof s.costText + ' = ' + JSON.stringify(s.costText));

    // limitation: NumberField integer min:0
    if (typeof s.limitation !== 'number') issues.push('limitation: expected number, got ' + typeof s.limitation + ' = ' + JSON.stringify(s.limitation));
    else if (!Number.isInteger(s.limitation)) issues.push('limitation: not integer = ' + s.limitation);
    else if (s.limitation < 0) issues.push('limitation: negative = ' + s.limitation);

    // limitationValue: NumberField integer min:0
    if (typeof s.limitationValue !== 'number') issues.push('limitationValue: expected number, got ' + typeof s.limitationValue + ' = ' + JSON.stringify(s.limitationValue));
    else if (!Number.isInteger(s.limitationValue)) issues.push('limitationValue: not integer = ' + s.limitationValue);
    else if (s.limitationValue < 0) issues.push('limitationValue: negative = ' + s.limitationValue);

    // range: StringField
    if (typeof s.range !== 'string') issues.push('range: expected string, got ' + typeof s.range + ' = ' + JSON.stringify(s.range));

    // duration: StringField
    if (typeof s.duration !== 'string') issues.push('duration: expected string, got ' + typeof s.duration + ' = ' + JSON.stringify(s.duration));

    // components: StringField
    if (typeof s.components !== 'string') issues.push('components: expected string, got ' + typeof s.components + ' = ' + JSON.stringify(s.components));

    // description: HTMLField
    if (typeof s.description !== 'string') issues.push('description: expected string, got ' + typeof s.description + ' = ' + JSON.stringify(s.description));

    // gmNotes: HTMLField
    if (typeof s.gmNotes !== 'string') issues.push('gmNotes: expected string, got ' + typeof s.gmNotes + ' = ' + JSON.stringify(s.gmNotes));

    // Check top-level required fields
    if (!obj._id) issues.push('missing _id');
    if (!obj.name) issues.push('missing name');
    if (obj.type !== 'spell') issues.push('type is "' + obj.type + '" not "spell"');
    if (!obj.img) issues.push('missing img');
    if (!Array.isArray(obj.effects)) issues.push('effects is not array: ' + typeof obj.effects);
    if (typeof obj.ownership !== 'object') issues.push('missing ownership');

    if (issues.length > 0) {
      errors++;
      console.log('\nPROBLEM: "' + obj.name + '" (line ' + (i+1) + ', id=' + obj._id + ')');
      issues.forEach(iss => console.log('  - ' + iss));
    }
  } catch(e) {
    console.log('JSON PARSE ERROR line ' + (i+1) + ': ' + e.message);
    errors++;
  }
});

if (errors === 0) {
  console.log('All spells pass validation - no schema issues found.');
  console.log('\nChecking for other potential issues...');

  // Check for duplicate IDs
  const ids = [];
  lines.forEach(l => {
    if (!l.trim()) return;
    try {
      const obj = JSON.parse(l);
      if (ids.includes(obj._id)) console.log('DUPLICATE ID: ' + obj._id);
      ids.push(obj._id);
    } catch(e) {}
  });

  // Check for invalid folder references
  const folderIds = [];
  lines.forEach(l => {
    if (!l.trim()) return;
    try {
      const obj = JSON.parse(l);
      if (!obj.system) folderIds.push(obj._id);
    } catch(e) {}
  });

  lines.forEach(l => {
    if (!l.trim()) return;
    try {
      const obj = JSON.parse(l);
      if (obj.folder && !folderIds.includes(obj.folder)) {
        console.log('ORPHAN FOLDER REF: "' + obj.name + '" refs folder ' + obj.folder + ' which does not exist');
      }
    } catch(e) {}
  });
} else {
  console.log('\n' + errors + ' entries with problems.');
}

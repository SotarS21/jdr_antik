const fs = require('fs');
const lines = fs.readFileSync('./sorts.db', 'utf8').split('\n');

const entries = [];
lines.forEach(l => {
  if (!l.trim()) return;
  try {
    entries.push(JSON.parse(l));
  } catch (e) {}
});

// Find the "Rituels" parent folder
const rituelsFolder = entries.find(e => e.name === 'Rituels' && !e.system);
// Find the "Rituels d'Hécate" folder
const hecateFolder = entries.find(e => e.name === "Rituels d'Hécate" && !e.system);

if (!rituelsFolder || !hecateFolder) {
  console.log('Dossiers non trouvés !');
  process.exit(1);
}

console.log('Rituels parent: ' + rituelsFolder._id);
console.log("Rituels d'Hécate: " + hecateFolder._id + ' | folder actuel: ' + (hecateFolder.folder || 'null'));

// Set "Rituels d'Hécate" as child of "Rituels"
hecateFolder.folder = rituelsFolder._id;

console.log("Rituels d'Hécate -> folder mis à: " + hecateFolder.folder);

// Write back
const output = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
fs.writeFileSync('./sorts.db', output, 'utf8');
console.log('sorts.db sauvegardé');

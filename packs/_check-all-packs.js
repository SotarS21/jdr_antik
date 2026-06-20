const fs = require('fs');
const path = require('path');

const packsDir = __dirname;
const dbFiles = fs.readdirSync(packsDir).filter(f => f.endsWith('.db'));

dbFiles.forEach(file => {
  const content = fs.readFileSync(path.join(packsDir, file), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  let items = 0;
  let folders = 0;
  let folderNames = [];

  lines.forEach(l => {
    try {
      const obj = JSON.parse(l);
      // A folder has no 'system' field but has 'sorting'
      if (!obj.system && obj.sorting !== undefined) {
        folders++;
        folderNames.push(obj.name);
      } else if (obj.system) {
        items++;
      }
    } catch(e) {}
  });

  if (folders > 0) {
    console.log(file + ': ' + items + ' items, ' + folders + ' folders -> ' + folderNames.join(', '));
  } else {
    console.log(file + ': ' + items + ' items, no folders');
  }
});

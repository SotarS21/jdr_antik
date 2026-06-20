const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

(async () => {
  const db = new ClassicLevel(path.join(__dirname, 'benedictions'), { 
    keyEncoding: 'utf8', 
    valueEncoding: 'utf8' 
  });

  console.log('Liste des bénédictions:\n');

  for await (const [key, value] of db.iterator()) {
    if (!key.startsWith('!items!')) continue;
    try {
      const item = JSON.parse(value);
      if (item.name) {
        console.log(`- ${item.name}`);
        if (item._id === 'bBene000000000001') {
          console.log('  Details:', JSON.stringify(item, null, 2));
        }
      }
    } catch (e) {
      // ignore
    }
  }

  await db.close();
})();

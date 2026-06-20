const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

(async () => {
  try {
    const dbPath = path.join(__dirname, 'benedictions');
    console.log('Checking database at:', dbPath);
    
    const db = new ClassicLevel(dbPath, { 
      keyEncoding: 'utf8', 
      valueEncoding: 'utf8' 
    });

    console.log('Database opened successfully\n');
    
    let count = 0;
    let itemCount = 0;
    
    for await (const [key, value] of db.iterator()) {
      count++;
      if (key.startsWith('!items!')) {
        itemCount++;
        try {
          const item = JSON.parse(value);
          console.log(`Item: ${item.name || 'N/A'} (${key})`);
          if (item.name && item.name.toLowerCase().includes('divine') || item.name.toLowerCase().includes('beauté')) {
            console.log('-> FOUND:', JSON.stringify(item, null, 2));
          }
          if (itemCount >= 5) break;
        } catch (e) {
          console.log(`Error parsing ${key}:`, e.message);
        }
      }
    }
    
    console.log(`\nTotal keys: ${count}`);
    console.log(`Item keys: ${itemCount}`);
    
    await db.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();

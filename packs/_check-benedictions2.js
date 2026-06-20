const { ClassicLevel } = require('./node_modules/classic-level');
const path = require('path');

(async () => {
  try {
    // Essayons avec le fichier .db directement
    const dbPathFile = path.join(__dirname, 'benedictions.db');
    console.log('Trying file:', dbPathFile);
    
    try {
      const db = new ClassicLevel(dbPathFile, { 
        keyEncoding: 'utf8', 
        valueEncoding: 'utf8' 
      });

      console.log('Database (file) opened successfully\n');
      
      let count = 0;
      for await (const [key, value] of db.iterator()) {
        count++;
        if (key.startsWith('!items!')) {
          try {
            const item = JSON.parse(value);
            console.log(`Item: ${item.name || 'N/A'} (${key})`);
            if (item.name && (item.name.toLowerCase().includes('divine') || item.name.toLowerCase().includes('beauté') || item.name.toLowerCase().includes('divin'))) {
              console.log('-> MATCH FOUND:', JSON.stringify(item, null, 2));
            }
          } catch (e) {
            console.log(`Error parsing ${key}:`, e.message);
          }
        }
        if (count > 20) break;
      }
      
      console.log(`\nTotal keys in file: ${count}`);
      await db.close();
    } catch (e) {
      console.log('File mode failed:', e.message);
    }

    // Essayons avec le dossier
    const dbPathDir = path.join(__dirname, 'benedictions');
    console.log('\nTrying directory:', dbPathDir);
    
    const db = new ClassicLevel(dbPathDir, { 
      keyEncoding: 'utf8', 
      valueEncoding: 'utf8' 
    });

    let count2 = 0;
    for await (const [key, value] of db.iterator()) {
      count2++;
      if (key.startsWith('!items!')) {
        try {
          const item = JSON.parse(value);
          console.log(`Item: ${item.name || 'N/A'} (${key})`);
          if (item.name && (item.name.toLowerCase().includes('divine') || item.name.toLowerCase().includes('beauté') || item.name.toLowerCase().includes('divin'))) {
            console.log('-> MATCH FOUND:', JSON.stringify(item, null, 2));
          }
        } catch (e) {
          console.log(`Error parsing ${key}:`, e.message);
        }
      }
      if (count2 > 20) break;
    }
      
    console.log(`\nTotal keys in dir: ${count2}`);
    await db.close();
    
  } catch (e) {
    console.error('Error:', e.message);
  }
})();

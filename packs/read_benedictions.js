const { ClassicLevel } = require('classic-level');

(async () => {
  const db = new ClassicLevel('benedictions.db');
  await db.open();
  
  let count = 0;
  for await (const [key, value] of db.iterator()) {
    count++;
    console.log(JSON.stringify({
      key: key.toString(),
      value: JSON.parse(value.toString())
    }, null, 2));
    
    if (count >= 5) {
      console.log('--- Affichage limité à 5 entrées. Supprimez cette ligne pour tout voir. ---');
      break;
    }
  }
  
  console.log(`\nTotal entrées : ${count}`);
  await db.close();
})();

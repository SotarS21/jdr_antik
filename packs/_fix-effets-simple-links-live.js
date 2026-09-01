/**
 * Macro GM : ajoute le lien @UUID vers l'Effet correspondant à la fin de la
 * description des 24 avantages "effet simple" (voir packs/_build-effets-simple.js),
 * au compendium Avantages déjà déployé et aux copies déjà possédées par un acteur —
 * même principe que packs/_fix-advantages-effect-links.js pour les 3 premiers
 * exemples. À exécuter APRÈS avoir redéployé le compendium Effets mis à jour (sans
 * quoi le lien pointera vers un document qui n'existe pas encore côté monde) — voir
 * la skill "deploy".
 *
 * Idempotent, sûr à relancer ; jamais d'édition LevelDB directe, uniquement l'API
 * Document Foundry.
 */
const EFFET_IDS = {
  "Guerrier Aguerri": "eEft000000000004",
  "Equilibre félin": "eEft000000000005",
  "Fetard": "eEft000000000006",
  "Bon sens": "eEft000000000007",
  "Commercant": "eEft000000000008",
  "Visage passe partout": "eEft000000000009",
  "Sommeil leger": "eEft000000000010",
  "Faveur": "eEft000000000011",
  "Respect d'Héra": "eEft000000000012",
  "Branchies de Poséidon": "eEft000000000013",
  "Rage d'Arès": "eEft000000000014",
  "Soin d'Apollon": "eEft000000000015",
  "Chasse d'Artèmis": "eEft000000000016",
  "Beauté d'Aphrodite": "eEft000000000017",
  "Mains d'Hèrmès": "eEft000000000018",
  "Ivresse de Dionysos": "eEft000000000019",
  "Chaleur d'Hestia": "eEft000000000020",
  "Vue d'Hécate": "eEft000000000021",
  "Don d'Hadès": "eEft000000000022",
  "Chrono sens": "eEft000000000023",
  "Ami des animaux": "eEft000000000024",
  "Ambidextrie": "eEft000000000025",
  "Charme d'Aphrodite": "eEft000000000026",
  "Casque d'Hadès": "eEft000000000027"
};

function cleanName(name) {
  return name.replace(/^\(-?\d+\)\s*/, "");
}

async function applyLink(doc) {
  const effetId = EFFET_IDS[cleanName(doc.name)];
  if (!effetId) return false;

  const uuidLink = `@UUID[Compendium.antique.effets.${effetId}]{${cleanName(doc.name)}}`;
  if (doc.system.description.includes(uuidLink)) return false;

  await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
  console.log(`[fix-effets-simple-links] "${doc.name}": lien vers l'Effet ajouté à la description.`);
  return true;
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage" || !EFFET_IDS[cleanName(entry.name)]) continue;
    const doc = await pack.getDocument(entry._id);
    if (await applyLink(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "advantage" || !EFFET_IDS[cleanName(item.name)]) continue;
    if (await applyLink(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) lié(s) à leur Effet — voir la console pour le détail.`);

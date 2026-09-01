/**
 * Macro GM : crée l'effet embarqué manquant (voir
 * packs/_embed-effets-simple-on-advantages.js) sur les 24 avantages "effet simple",
 * au compendium Avantages déjà déployé + copies déjà possédées par un acteur.
 * Corrige le retour utilisateur du 1er septembre 2026 : les documents existaient
 * bien dans le compendium Effets, mais rien n'était réellement attaché à
 * l'avantage lui-même (juste un lien dans la description) — cette macro ajoute
 * l'effet manquant à l'avantage, sans toucher au lien déjà en place.
 *
 * Idempotent (ne crée rien si l'avantage a déjà un effet embarqué), sûr à
 * relancer ; jamais d'édition LevelDB directe, uniquement l'API Document Foundry.
 */
const SIMPLE_NAMES = [
  "Guerrier Aguerri", "Equilibre félin", "Fetard", "Bon sens", "Commercant",
  "Visage passe partout", "Sommeil leger", "Faveur", "Respect d'Héra",
  "Branchies de Poséidon", "Rage d'Arès", "Soin d'Apollon", "Chasse d'Artèmis",
  "Beauté d'Aphrodite", "Mains d'Hèrmès", "Ivresse de Dionysos", "Chaleur d'Hestia",
  "Vue d'Hécate", "Don d'Hadès", "Chrono sens", "Ami des animaux", "Ambidextrie",
  "Charme d'Aphrodite", "Casque d'Hadès"
];

function cleanName(name) {
  return name.replace(/^\(-?\d+\)\s*/, "");
}

async function applyFix(doc) {
  const name = cleanName(doc.name);
  if (!SIMPLE_NAMES.includes(name)) return false;
  if (doc.effects.length) return false;

  await doc.createEmbeddedDocuments("ActiveEffect", [{
    name,
    img: doc.img,
    "system.changes": [],
    disabled: false,
    transfer: true
  }]);
  console.log(`[fix-embed-effets-simple] "${doc.name}": effet embarqué créé.`);
  return true;
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(entry.name))) continue;
    const doc = await pack.getDocument(entry._id);
    if (await applyFix(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(item.name))) continue;
    if (await applyFix(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) corrigé(s) — voir la console pour le détail.`);

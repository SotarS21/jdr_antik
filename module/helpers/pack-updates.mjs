/**
 * Registre des correctifs de contenu de compendium en attente de propagation vers un
 * monde déjà déployé — remplace, pour les futures sessions, l'écriture d'un script
 * `packs/_fix-*-live.js` à coller dans une macro GM. Chaque entrée est proposée au GM
 * via un écran à cocher (module/apps/pack-update-picker.mjs), par compendium, et ne
 * touche le monde que si elle est cochée : jamais d'écrasement en bloc d'un document
 * existant, uniquement des créations de documents manquants et des corrections de champs
 * ciblées — même patron que les anciens scripts (game.packs.get, getIndex/getDocument,
 * createDocuments/createEmbeddedDocuments, verrouillage/déverrouillage du pack).
 *
 * `pack` doit correspondre à un `name` de `system.json` → `packs[]`. Les anciens scripts
 * déjà exécutés et confirmés ne sont pas rétro-portés ici — seuls les correctifs écrits
 * à partir de ce mécanisme y figurent.
 */
export const PACK_UPDATES = [
  {
    id: "0.6.55-embed-effets-simple",
    pack: "avantages",
    version: "0.6.55",
    label: "Effets simples embarqués sur les avantages",
    description:
      "Ajoute l'effet manquant dans l'onglet \"Effets\" des 24 avantages \"effet simple\" " +
      "(Guerrier Aguerri, Equilibre félin, Bon sens, etc.) — jusqu'ici seul un lien dans la " +
      "description existait, l'effet n'était pas réellement attaché à l'avantage.",
    apply: applyEmbedEffetsSimple
  }
];

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

async function embedMissingEffect(doc) {
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
  return true;
}

/** Voir packs/_fix-embed-effets-simple-live.js, dont cette fonction reprend la logique. */
async function applyEmbedEffetsSimple() {
  let fixed = 0;

  const pack = game.packs.get("antique.avantages");
  if (pack) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    const index = await pack.getIndex();
    for (const entry of index) {
      if (entry.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(entry.name))) continue;
      const doc = await pack.getDocument(entry._id);
      if (await embedMissingEffect(doc)) fixed++;
    }
    if (wasLocked) await pack.configure({ locked: true });
  }

  for (const actor of game.actors ?? []) {
    for (const item of actor.items) {
      if (item.type !== "advantage" || !SIMPLE_NAMES.includes(cleanName(item.name))) continue;
      if (await embedMissingEffect(item)) fixed++;
    }
  }

  return fixed;
}

const SETTING_KEY = "appliedPackFixes";

/**
 * Réglage monde caché mémorisant les `id` de PACK_UPDATES déjà appliqués — un correctif
 * absent de cette liste reste "en attente" et sera reproposé à chaque login GM, même sans
 * changement de version (contrairement à checkSystemVersionUpdate()). Appeler depuis le
 * hook "init", à côté de registerVersionCheckSettings()/registerMigrationSettings().
 */
export function registerPackUpdateSettings() {
  game.settings.register("antique", SETTING_KEY, {
    name: "Correctifs de compendium déjà appliqués à ce monde",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
}

function getAppliedIds() {
  return game.settings.get("antique", SETTING_KEY) ?? [];
}

export async function markPackUpdatesApplied(ids) {
  if (!ids.length) return;
  const applied = new Set(getAppliedIds());
  for (const id of ids) applied.add(id);
  await game.settings.set("antique", SETTING_KEY, Array.from(applied));
}

export function getPendingPackUpdates() {
  const applied = new Set(getAppliedIds());
  return PACK_UPDATES.filter(update => !applied.has(update.id));
}

/**
 * GM-only. Ouvre l'écran de choix par compendium s'il reste des correctifs en attente —
 * aucun lien avec checkSystemVersionUpdate() : se redéclenche à chaque login GM tant que
 * des entrées de PACK_UPDATES n'ont pas été explicitement appliquées, changement de
 * version ou pas. Call from the "ready" hook, GM only.
 */
export async function checkPendingPackUpdates() {
  if (!game.user.isGM) return;

  const pending = getPendingPackUpdates();
  if (!pending.length) return;

  const { AntiquePackUpdatePicker } = await import("../apps/pack-update-picker.mjs");
  AntiquePackUpdatePicker.open();
}

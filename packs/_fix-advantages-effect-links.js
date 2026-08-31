/**
 * Macro : applique au compendium Avantages déjà déployé (+ copies déjà possédées par
 * un acteur) trois correctifs liés au chantier "Effets" (voir JOURNAL.md, 31 août
 * 2026) :
 *
 * 1. "Cuir de Hero" ciblait system.saves.robustesse.base — ce champ est écrasé sans
 *    condition par prepareDerivedData() (save.base = SAVE_BASE, une constante ;
 *    le champ "base" a été retiré du schéma des sauvegardes en juillet), donc
 *    l'ActiveEffect était un no-op silencieux depuis toujours. Corrigé vers
 *    .bonus, le vrai champ lu par le calcul du total (même champ que "Dépressif").
 * 2. "Athléte" décrivait "Capacité de déplacement x2" sans aucun effet mécanique.
 *    Complète _fix-athlete-effect.js (toujours valide, mais cette macro-ci
 *    couvre aussi ce cas si elle n'a pas déjà été exécutée).
 * 3. Les 3 avantages (Cuir de Hero, Athléte, Connaissance d'Héphaistos) reçoivent un
 *    lien @UUID vers leur "Effet" correspondant du nouveau compendium Effets, ajouté
 *    à la fin de leur description — un lien de contenu Foundry est nativement
 *    glissable (draggable="true" une fois enrichi), donc glisser ce lien directement
 *    depuis le texte de description applique l'effet exactement comme le glisser
 *    depuis le compendium, sans code supplémentaire de notre côté.
 *
 * Ne modifie que ce qui est manquant/incorrect (idempotent, sûr à relancer) ; jamais
 * d'édition LevelDB directe, uniquement l'API Document Foundry.
 */
const FIXES = {
  "Cuir de Hero": {
    effetId: "eEft000000000001",
    wrongKey: "system.saves.robustesse.base",
    rightKey: "system.saves.robustesse.bonus"
  },
  "Athléte": {
    effetId: "eEft000000000002",
    createEffect: { key: "system.deplacement", value: "2", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
  },
  "Connaissance d'Héphaistos": {
    effetId: "eEft000000000003"
  }
};

function findFix(name) {
  return Object.entries(FIXES).find(([key]) => name.includes(key))?.[1];
}

async function applyFixes(doc) {
  const fix = findFix(doc.name);
  if (!fix) return false;
  let changed = false;

  if (fix.wrongKey) {
    for (const effect of doc.effects) {
      const change = effect.changes.find(c => c.key === fix.wrongKey);
      if (change) {
        await effect.update({ changes: effect.changes.map(c => c === change ? { ...c, key: fix.rightKey } : c) });
        changed = true;
        console.log(`[fix-advantages] "${doc.name}": clé corrigée (${fix.wrongKey} -> ${fix.rightKey}).`);
      }
    }
  }

  if (fix.createEffect && !doc.effects.some(e => e.changes.some(c => c.key === fix.createEffect.key))) {
    await doc.createEmbeddedDocuments("ActiveEffect", [{
      name: doc.name.replace(/^\(-?\d+\)\s*/, ""),
      img: doc.img,
      changes: [fix.createEffect],
      disabled: false,
      transfer: true
    }]);
    changed = true;
    console.log(`[fix-advantages] "${doc.name}": effet manquant créé.`);
  }

  const uuidLink = `@UUID[Compendium.antique.effets.${fix.effetId}]{${doc.name.replace(/^\(-?\d+\)\s*/, "")}}`;
  if (!doc.system.description.includes(uuidLink)) {
    await doc.update({ "system.description": doc.system.description + `<p>${uuidLink}</p>` });
    changed = true;
    console.log(`[fix-advantages] "${doc.name}": lien vers l'Effet ajouté à la description.`);
  }

  return changed;
}

let fixed = 0;

const pack = game.packs.get("antique.avantages");
if (pack) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const index = await pack.getIndex();
  for (const entry of index) {
    if (entry.type !== "advantage" || !findFix(entry.name)) continue;
    const doc = await pack.getDocument(entry._id);
    if (await applyFixes(doc)) fixed++;
  }
  if (wasLocked) await pack.configure({ locked: true });
}

for (const actor of game.actors ?? []) {
  for (const item of actor.items) {
    if (item.type !== "advantage" || !findFix(item.name)) continue;
    if (await applyFixes(item)) fixed++;
  }
}

ui.notifications.info(`${fixed} avantage(s) corrigé(s) — voir la console pour le détail.`);

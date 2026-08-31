/**
 * Build script: generates packs/effets.db — the "Effets" compendium (AntiqueEffect
 * items), droppable standalone on any actor (shows on the token + in the Traits tab,
 * see character-sheet.hbs) independently of any Avantage/Désavantage.
 *
 * Run:  node packs/_build-effets.js
 *
 * Starter batch of 3, one per mechanical pattern (see JOURNAL.md, 31 août 2026,
 * "architecture des effets") — to be extended to the rest of the ~19 examples from
 * todo_foundry.txt once this plumbing is confirmed working in-game:
 *  - Cuir de Héros      : passive ADD (system.saves.robustesse.base +2)
 *  - Athlète            : passive MULTIPLY (system.deplacement ×2)
 *  - Connaissance d'Héphaistos : targeted one-shot malus via chat button (caBonus)
 */
const fs = require("fs");
const path = require("path");

let idCounter = 0;
function genId(prefix) {
  idCounter++;
  return prefix + String(idCounter).padStart(16 - prefix.length, "0");
}

const EFFECTS = [
  {
    name: "Cuir de Héros",
    img: "icons/svg/aura.svg",
    description: "<p>La peau tannée par les épreuves du héros encaisse les coups comme un vieux cuir. Résistance physique accrue.</p><p><strong>+2 Robustesse (base)</strong>, tant que cet effet est présent.</p>",
    changes: [{ key: "system.saves.robustesse.base", mode: 2, value: "2" }]
  },
  {
    name: "Athlète",
    img: "icons/svg/upgrade.svg",
    description: "<p>Un corps sculpté par l'entraînement, capable de couvrir de grandes distances sans effort.</p><p><strong>Déplacement ×2</strong>, tant que cet effet est présent.</p>",
    changes: [{ key: "system.deplacement", mode: 1, value: "2" }]
  },
  {
    name: "Connaissance d'Héphaistos",
    img: "icons/svg/sun.svg",
    description: "<p>La science des forges d'Héphaïstos permet de repérer la faille d'une armure adverse.</p><p>Cliquer l'icône pour l'envoyer au chat, puis cibler un adversaire et utiliser le bouton pour <strong>réduire sa CA de 2</strong>.</p>",
    caBonus: -2
  }
];

const docs = EFFECTS.map(def => ({
  _id: genId("iEft"),
  name: def.name,
  type: "effect",
  img: def.img,
  system: {
    duration: "",
    active: true,
    caBonus: def.caBonus ?? 0,
    description: def.description,
    gmNotes: ""
  },
  effects: def.changes ? [{
    _id: genId("eEft"),
    name: def.name,
    img: def.img,
    changes: def.changes,
    disabled: false,
    transfer: true,
    duration: { startTime: null, seconds: null, rounds: null, turns: null },
    flags: {},
    tint: null,
    origin: null,
    statuses: []
  }] : [],
  folder: null,
  sort: 0,
  ownership: { default: 0 },
  flags: {}
}));

const outPath = path.join(__dirname, "effets.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");
console.log(`Wrote ${docs.length} documents to ${outPath}`);

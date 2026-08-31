/**
 * Build script: generates packs/effets.db — the "Effets" compendium, made of real
 * top-level ActiveEffect documents (not Item-wrapped) — droppable standalone on any
 * actor (shows on the token + in the Traits tab, see character-sheet.hbs), fully
 * self-sufficient: Foundry's own ActiveEffect schema already has name/img/description
 * (HTML)/duration/disabled, no need to reinvent any of that on a wrapper Item.
 *
 * Run:  node packs/_build-effets.js
 *
 * Starter batch of 3, one per mechanical pattern (see JOURNAL.md, 31 août 2026,
 * "architecture des effets") — to be extended to the rest of the ~19 examples from
 * todo_foundry.txt once this plumbing is confirmed working in-game:
 *  - Cuir de Héros      : ADD (system.saves.robustesse.base +2)
 *  - Athlète            : MULTIPLY (system.deplacement ×2)
 *  - Connaissance d'Héphaistos : ADD (system.ca.temp -2) — drag onto the target
 *    enemy directly (like the other two), then toggle off/delete when it should end;
 *    no bespoke "apply to target" button/mechanism needed.
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
    description: "<p>La peau tannée par les épreuves du héros encaisse les coups comme un vieux cuir. Résistance physique accrue.</p><p><strong>+2 Robustesse (base)</strong>, tant que cet effet est actif.</p>",
    changes: [{ key: "system.saves.robustesse.base", mode: 2, value: "2" }]
  },
  {
    name: "Athlète",
    img: "icons/svg/upgrade.svg",
    description: "<p>Un corps sculpté par l'entraînement, capable de couvrir de grandes distances sans effort.</p><p><strong>Déplacement ×2</strong>, tant que cet effet est actif.</p>",
    changes: [{ key: "system.deplacement", mode: 1, value: "2" }]
  },
  {
    name: "Connaissance d'Héphaistos",
    img: "icons/svg/sun.svg",
    description: "<p>La science des forges d'Héphaïstos permet de repérer la faille d'une armure adverse.</p><p><strong>-2 CA (temporaire)</strong>, tant que cet effet est actif. Glisser directement sur la cible ; désactiver ou supprimer l'effet quand il doit cesser.</p>",
    changes: [{ key: "system.ca.temp", mode: 2, value: "-2" }]
  }
];

const docs = EFFECTS.map(def => ({
  _id: genId("eEft"),
  name: def.name,
  img: def.img,
  type: "base",
  system: {},
  disabled: false,
  duration: { startTime: null, seconds: null, rounds: null, turns: null },
  description: def.description,
  origin: null,
  tint: "#ffffff",
  transfer: true,
  statuses: [],
  folder: null,
  sort: 0,
  flags: {},
  changes: def.changes
}));

const outPath = path.join(__dirname, "effets.db");
fs.writeFileSync(outPath, docs.map(d => JSON.stringify(d)).join("\n") + "\n", "utf-8");
console.log(`Wrote ${docs.length} documents to ${outPath}`);

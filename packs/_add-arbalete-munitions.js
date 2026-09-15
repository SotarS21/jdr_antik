/**
 * Build script: appends the Arbalète weapon (3 quality tiers) and a new "Munition"
 * folder + 3 munition items (Flèches, Carreaux d'arbalète, Pierres de fronde) to
 * packs/armes.db.
 *
 * Deliberately NOT done by re-running packs/_build-armes.js: that script rewrites
 * armes.db from scratch from its own hardcoded WEAPONS/ARMORS/SHIELDS tables, which
 * have drifted from the currently deployed data (e.g. it never sets system.poids or
 * system.category — those were only ever patched into the live/deployed compendium
 * via PACK_UPDATES entries in module/helpers/pack-updates.mjs, same pattern as
 * packs/_add-item-weights.js). Regenerating from that script would silently drop
 * those already-live fields for every one of the 111 pre-existing documents. This
 * script only ever appends new lines — every existing line is left untouched.
 *
 * New ids continue past every id already used in armes.db (max was 116, across all
 * prefixes — genId() in _build-armes.js shares one counter across prefixes, so a
 * document's numeric suffix isn't scoped per-prefix) to guarantee no collision.
 *
 * Run:  node packs/_add-arbalete-munitions.js
 * Companion live fix (already-deployed worlds): see the "0.6.91-create-arbalete-
 * munitions" PACK_UPDATES entry in module/helpers/pack-updates.mjs, which creates
 * the exact same documents (same ids, via keepId) directly in the live pack.
 */
const fs = require("fs");
const path = require("path");

const ARME_A_DISTANCE_FOLDER_ID = "fArm000000000005";

const ARBALETE_TIERS = [
  { prix: 12, dmg: "1d8",    crit: "x2",    qualite: "Simple facture" },
  { prix: 28, dmg: "1d8+2",  crit: "x2",    qualite: "Moyenne facture" },
  { prix: 40, dmg: "1d10+2", crit: "19/x2", qualite: "Bonne facture" }
];

const MUNITIONS = [
  { name: "Flèches",             prix: 0.1,  poids: 0.02, img: "icons/weapons/ammunition/arrows-fletching.webp" },
  { name: "Carreaux d'arbalète", prix: 0.2,  poids: 0.05, img: "icons/weapons/crossbows/crossbow-golden-bolt.webp" },
  { name: "Pierres de fronde",   prix: 0.02, poids: 0.05, img: "icons/commodities/stone/stone-chunk-grey-white.webp" }
];

const filePath = path.join(__dirname, "armes.db");
const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);

let nextNum = 117; // 1 past the highest id number already used by any prefix in armes.db
const nextId = prefix => prefix + String(nextNum++).padStart(16 - prefix.length, "0");

const newDocs = [];

// --- Arbalète (weapon, "Arme à distance" folder — same category bug fix as the
// PACK_UPDATES entry applies to every pre-existing weapon: category/categoryDistance
// set explicitly instead of left at the schema default "armeBlanche"/"armeADistance"). ---
for (const tier of ARBALETE_TIERS) {
  newDocs.push({
    _id:   nextId("aWpn"),
    name:  `Arbalète (${tier.qualite})`,
    type:  "weapon",
    img:   "icons/svg/target.svg",
    system: {
      attBonus:     0,
      attBonusDistance: 0,
      category:     "armeADistance",
      categoryDistance: "armeADistance",
      damage:       tier.dmg,
      critical:     tier.crit,
      typeDamage:   "Perçant",
      portee:       24,
      hasPortee:    true,
      consumable:   true,
      linkedAmmoId: "",
      slot:         "",
      equipped:     false,
      price:        `${tier.prix} po`,
      poids:        2,
      description: [
        `<p><strong>Catégorie :</strong> Arme à distance</p>`,
        `<p><strong>Qualité :</strong> ${tier.qualite}</p>`,
        `<p><strong>Prix :</strong> ${tier.prix} po</p>`
      ].join("\n"),
      gmNotes: ""
    },
    effects:   [],
    folder:    ARME_A_DISTANCE_FOLDER_ID,
    sort:      0,
    ownership: { default: 0 },
    flags:     {}
  });
}

// --- "Munition" folder ---
const munitionFolderId = nextId("fArm");
newDocs.push({
  _id:     munitionFolderId,
  name:    "Munition",
  type:    "Item",
  sort:    700000,
  sorting: "a",
  color:   "#8B0000",
  flags:   {},
  folder:  null
});

// --- Munition items (equipment, quantity = real stock, linked to a weapon via
// system.linkedAmmoId — see AntiqueItem#_doRollAttack/#consume) ---
for (const munition of MUNITIONS) {
  newDocs.push({
    _id:   nextId("aEqp"),
    name:  munition.name,
    type:  "equipment",
    img:   munition.img,
    system: {
      quantity:    1,
      // Must be true: this is what makes the item selectable as "linked ammo" on a
      // weapon's own sheet (context.ammoOptions, item-sheet.mjs) and in the Combat
      // tab's quick-select dropdown (context.ammoCandidates, actor-sheet.mjs) —
      // both filter on `system.consumable`, same flag a "Rations" item uses for its
      // own unrelated heal-on-consume behavior.
      consumable:  true,
      caBonus:     0,
      healAmount:  0,
      linkedSkill: "",
      skillBonus:  0,
      slot:        "",
      equipped:    false,
      price:       `${munition.prix} po`,
      poids:       munition.poids,
      apothCategory: "",
      apothType:     "",
      isIngredientBag: false,
      description: `<p><strong>Prix :</strong> ${munition.prix} po</p>`,
      gmNotes:     ""
    },
    effects:   [],
    folder:    munitionFolderId,
    sort:      0,
    ownership: { default: 0 },
    flags:     {}
  });
}

fs.writeFileSync(filePath, [...lines, ...newDocs.map(d => JSON.stringify(d))].join("\n") + "\n", "utf-8");
console.log(`armes.db : ${lines.length} lignes existantes conservées, ${newDocs.length} nouvelles ajoutées ` +
  `(1 Arbalète × 3 paliers, 1 dossier Munition, ${MUNITIONS.length} munitions).`);

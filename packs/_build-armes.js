/**
 * Build script: generates packs/armes.db from the Excel weapon/armor tables.
 *
 * Run:  node packs/_build-armes.js
 *
 * The compendium is organized with folders:
 *   Arme blanche / Arme de jet / Arme exotique / Arme à deux mains / Arme à distance
 *   Armure / Bouclier
 *
 * Each weapon exists in multiple quality tiers (Simple → Parfaite facture).
 * Armor & shields are equipment items (type "equipment") with bonus info in description.
 */

const fs   = require("fs");
const path = require("path");

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let idCounter = 0;
function genId(prefix) {
  idCounter++;
  return prefix + String(idCounter).padStart(16 - prefix.length, "0");
}

function parsePortee(raw) {
  if (!raw || raw === "-" || raw === "") return { value: 0, has: false };
  const s = String(raw).replace(",", ".").replace("m", "").trim();
  const n = parseFloat(s);
  return { value: isNaN(n) ? 0 : n, has: !isNaN(n) && n > 0 };
}

const QUALITY_LABELS = [
  "Simple facture",
  "Moyenne facture",
  "Bonne facture",
  "Très bonne facture",
  "Excellente facture",
  "Parfaite facture"
];

const TYPE_DAMAGE_MAP = {
  "P":       "Perçant",
  "T":       "Tranchant",
  "C":       "Contondant",
  "P ou T":  "Perçant ou Tranchant",
  "-":       "",
  "":        ""
};

/* ------------------------------------------------------------------ */
/*  Weapon data from Excel (hardcoded for reliability)                 */
/* ------------------------------------------------------------------ */

// Each weapon: [category, name, ...6 tiers of [prix, degats, critique, portée, typeDmg]]
// null/undefined tiers mean the quality doesn't exist for this weapon.

const WEAPONS = [
  // --- Arme blanche ---
  { cat: "Arme blanche", name: "Couteau", tiers: [
    { prix: 2,  dmg: "1d3",   crit: "x2",    portee: "-",    type: "P ou T" },
    { prix: 3,  dmg: "1d3+1", crit: "x2",    portee: "3m",   type: "P ou T" },
    { prix: 5,  dmg: "1d4+1", crit: "x2",    portee: "3m",   type: "P ou T" },
    { prix: 6,  dmg: "1d6",   crit: "19/x2", portee: "5m",   type: "P ou T" },
    { prix: 10, dmg: "1d6+2", crit: "19/x2", portee: "6m",   type: "P ou T" },
    { prix: 16, dmg: null,    crit: "19/x2", portee: "6m",   type: "P ou T" },
  ]},
  { cat: "Arme blanche", name: "Dague", tiers: [
    { prix: 3,  dmg: "1d4",   crit: "x2",    portee: "-",    type: "P ou T" },
    { prix: 4,  dmg: "1d4+1", crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 6,  dmg: "1d6",   crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 8,  dmg: "1d6+1", crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 11, dmg: "1d6+4", crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 19, dmg: null,    crit: "19/x2", portee: "-",    type: "P ou T" },
  ]},
  { cat: "Arme blanche", name: "Glaive", tiers: [
    { prix: 5,  dmg: "1d4+1", crit: "x2",    portee: "1,5m", type: "P ou T" },
    { prix: 7,  dmg: "1d6+1", crit: "19/x2", portee: "1,5m", type: "P ou T" },
    { prix: 10, dmg: "1d6+2", crit: "19/x2", portee: "1,5m", type: "P ou T" },
    { prix: 15, dmg: "1d10",  crit: "19/x2", portee: "1,5m", type: "P ou T" },
    { prix: 21, dmg: "1d10+1",crit: "19/x2", portee: "1,5m", type: "P ou T" },
    { prix: 26, dmg: null,    crit: "19/x2", portee: "1,5m", type: "P ou T" },
  ]},
  { cat: "Arme blanche", name: "Épée courte", tiers: [
    { prix: 5,  dmg: "1d4+1", crit: "x2",    portee: "-",    type: "P ou T" },
    { prix: 7,  dmg: "1d6+1", crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 10, dmg: "1d6+2", crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 15, dmg: "1d10",  crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 21, dmg: "1d10+1",crit: "19/x2", portee: "-",    type: "P ou T" },
    { prix: 26, dmg: null,    crit: "19/x2", portee: "-",    type: "P ou T" },
  ]},
  { cat: "Arme blanche", name: "Lance", tiers: [
    { prix: 7,  dmg: "1d4+1", crit: "x2",    portee: "2,5m", type: "P" },
    { prix: 9,  dmg: "1d6+1", crit: "19/x2", portee: "2,5m", type: "P" },
    { prix: 11, dmg: "1d6+2", crit: "19/x2", portee: "2,5m", type: "P" },
    { prix: 18, dmg: "1d10",  crit: "19/x2", portee: "2,5m", type: "P" },
    { prix: 26, dmg: "1d10+1",crit: "19/x2", portee: "2,5m", type: "P" },
    { prix: 30, dmg: null,    crit: "19/x2", portee: "2,5m", type: "P" },
  ]},
  { cat: "Arme blanche", name: "Hache", tiers: [
    { prix: 5,  dmg: "1d4+1", crit: "x2",    portee: "1,5m", type: "T" },
    { prix: 7,  dmg: "1d6+1", crit: "19/x2", portee: "1,5m", type: "T" },
    { prix: 10, dmg: "1d6+2", crit: "19/x2", portee: "1,5m", type: "T" },
    { prix: 15, dmg: "1d10",  crit: "19/x2", portee: "1,5m", type: "T" },
    { prix: 22, dmg: "1d10+1",crit: "19/x2", portee: "1,5m", type: "T" },
    { prix: 27, dmg: null,    crit: "19/x2", portee: "1,5m", type: "T" },
  ]},

  // --- Arme de jet ---
  { cat: "Arme de jet", name: "Javeline", tiers: [
    { prix: 1,  dmg: "1d4",   crit: "x2", portee: "9m", type: "P" },
    { prix: 3,  dmg: "1d4+1", crit: "x2", portee: "9m", type: "P" },
    { prix: 5,  dmg: "1d6",   crit: "x2", portee: "9m", type: "P" },
  ]},
  { cat: "Arme de jet", name: "Hache de lancer", tiers: [
    { prix: 8,  dmg: "1d4",   crit: "x2", portee: "3m", type: "T" },
    { prix: 12, dmg: "1d4+1", crit: "x2", portee: "3m", type: "T" },
    { prix: 15, dmg: "1d6",   crit: "x2", portee: "6m", type: "T" },
  ]},
  { cat: "Arme de jet", name: "Bolas", tiers: [
    { prix: 5,  dmg: "1d3",   crit: "x2",    portee: "6m", type: "C" },
    { prix: 8,  dmg: "1d3",   crit: "x2",    portee: "9m", type: "C" },
    { prix: 10, dmg: "1d4",   crit: "19/x2", portee: "9m", type: "C" },
  ]},
  { cat: "Arme de jet", name: "Bouclier de lancer", tiers: [
    { prix: 10, dmg: "1d4",   crit: "x2", portee: "6m", type: "C" },
    { prix: 20, dmg: "1d4+1", crit: "x2", portee: "6m", type: "C" },
    { prix: 35, dmg: "1d6",   crit: "x2", portee: "6m", type: "C" },
  ]},
  { cat: "Arme de jet", name: "Filet", tiers: [
    { prix: 10, dmg: "-",  crit: "-", portee: "3m", type: "-" },
    { prix: 20, dmg: "-",  crit: "-", portee: "-",  type: "-" },
    { prix: 35, dmg: "-",  crit: "-", portee: "-",  type: "-" },
  ]},
  { cat: "Arme de jet", name: "Couteau de lancer", tiers: [
    { prix: 1,  dmg: "1d3",   crit: "x2", portee: "3m", type: "P ou T" },
    { prix: 3,  dmg: "1d3+1", crit: "x2", portee: "3m", type: "P ou T" },
    { prix: 6,  dmg: "1d4+1", crit: "x3", portee: "6m", type: "P ou T" },
  ]},
  { cat: "Arme de jet", name: "Chakram", tiers: [
    { prix: 3,  dmg: "1d4",   crit: "x2", portee: "9m", type: "T" },
    { prix: 6,  dmg: "1d4+1", crit: "x2", portee: "9m", type: "T" },
    { prix: 10, dmg: "1d6",   crit: "x2", portee: "9m", type: "T" },
  ]},

  // --- Arme exotique ---
  { cat: "Arme exotique", name: "Serpe", tiers: [
    { prix: 6,  dmg: "1d4",   crit: "x2",    portee: "-", type: "T" },
    { prix: 10, dmg: "1d4+2", crit: "x2",    portee: "-", type: "T" },
    { prix: 15, dmg: "1d6",   crit: "19/x2", portee: "-", type: "T" },
  ]},
  { cat: "Arme exotique", name: "Bâton", tiers: [
    { prix: 0,  dmg: "1d3", crit: "x2", portee: "-",    type: "C" },
    { prix: 2,  dmg: "1d3", crit: "x2", portee: "1,5m", type: "C" },
    { prix: 5,  dmg: "1d4", crit: "x2", portee: "1,5m", type: "C" },
  ]},
  { cat: "Arme exotique", name: "Gourdin", tiers: [
    { prix: 0,  dmg: "1d4",   crit: "x2",    portee: "-", type: "C" },
    { prix: 3,  dmg: "1d4+1", crit: "x2",    portee: "-", type: "C" },
    { prix: 6,  dmg: "1d6",   crit: "19/x2", portee: "-", type: "C" },
  ]},
  { cat: "Arme exotique", name: "Marteau", tiers: [
    { prix: 2,  dmg: "1d3", crit: "x2",    portee: "-", type: "C" },
    { prix: 5,  dmg: "1d4", crit: "19/x2", portee: "-", type: "C" },
    { prix: 8,  dmg: "1d6", crit: "19/x2", portee: "-", type: "C" },
  ]},
  { cat: "Arme exotique", name: "Trident", tiers: [
    { prix: 10, dmg: "1d4+1", crit: "x2",    portee: "2m", type: "P" },
    { prix: 15, dmg: "1d6",   crit: "x2",    portee: "2m", type: "P" },
    { prix: 19, dmg: "1d6+2", crit: "19/x2", portee: "2m", type: "P" },
  ]},
  { cat: "Arme exotique", name: "Cimeterre", tiers: [
    { prix: 10, dmg: "1d4",   crit: "x2",    portee: "-",    type: "T" },
    { prix: 15, dmg: "1d6",   crit: "19/x2", portee: "-",    type: "T" },
    { prix: 19, dmg: "1d6+2", crit: "19/x2", portee: "1,5m", type: "T" },
  ]},

  // --- Arme à deux mains ---
  { cat: "Arme \u00e0 deux mains", name: "Double hache", tiers: [
    { prix: 20, dmg: "1d10",     crit: "x2", portee: "-",    type: "T" },
    { prix: 26, dmg: "1d10+2",   crit: "x3", portee: "-",    type: "T" },
    { prix: 33, dmg: "1d10+1d4", crit: "x3", portee: "1,5m", type: "T" },
  ]},
  { cat: "Arme \u00e0 deux mains", name: "Marteau de guerre", tiers: [
    { prix: 20, dmg: "1d10",     crit: "x2", portee: "-",    type: "C" },
    { prix: 26, dmg: "1d10+2",   crit: "x3", portee: "-",    type: "C" },
    { prix: 33, dmg: "1d10+1d4", crit: "x3", portee: "1,5m", type: "C" },
  ]},
  { cat: "Arme \u00e0 deux mains", name: "Sarisse", tiers: [
    { prix: 15, dmg: "1d8",    crit: "x2", portee: "3m", type: "P" },
    { prix: 21, dmg: "1d10",   crit: "x2", portee: "3m", type: "P" },
    { prix: 27, dmg: "1d10+2", crit: "x3", portee: "3m", type: "P" },
  ]},

  // --- Arme à distance ---
  { cat: "Arme \u00e0 distance", name: "Arc court", tiers: [
    { prix: 7,  dmg: "1d4",    crit: "x2",    portee: "18m", type: "P" },
    { prix: 15, dmg: "1d4+1",  crit: "x2",    portee: "18m", type: "P" },
    { prix: 25, dmg: "1d8+2",  crit: "x3",    portee: "18m", type: "P" },
    { prix: 38, dmg: "1d10+2", crit: "19/x3", portee: "20m", type: "P" },
  ]},
  { cat: "Arme \u00e0 distance", name: "Arc long", tiers: [
    { prix: 10, dmg: "1d6",   crit: "x2", portee: "30m", type: "P" },
    { prix: 25, dmg: "1d6+1", crit: "x2", portee: "30m", type: "P" },
    { prix: 35, dmg: "1d10",  crit: "x3", portee: "30m", type: "P" },
  ]},
  { cat: "Arme \u00e0 distance", name: "Fronde", tiers: [
    { prix: 2,  dmg: "1d3",   crit: "x2", portee: "6m", type: "C" },
    { prix: 5,  dmg: "1d4",   crit: "x2", portee: "6m", type: "C" },
    { prix: 10, dmg: "1d6+2", crit: "x2", portee: "6m", type: "C" },
  ]},
  { cat: "Arme \u00e0 distance", name: "Fouet", tiers: [
    { prix: 1,  dmg: "1d2", crit: "x2",    portee: "3m", type: "T" },
    { prix: 3,  dmg: "1d3", crit: "x2",    portee: "3m", type: "T" },
    { prix: 9,  dmg: "1d6", crit: "19/x2", portee: "3m", type: "T" },
  ]},
];

// --- Armures ---
const ARMORS = [
  { name: "Vêtement en Lin",        prix: 10,  bonus: 1 },
  { name: "Armure de cuir",         prix: 20,  bonus: 2 },
  { name: "Armure de cuir cloutée", prix: 35,  bonus: 3 },
  { name: "Armure en peau",         prix: 50,  bonus: 4 },
  { name: "Armure de cuivre",       prix: 65,  bonus: 5 },
  { name: "Armure en plaque",       prix: 100, bonus: 6 },
  { name: "Maille",                 prix: 150, bonus: 7 },
  { name: "Cuirasse",               prix: 200, bonus: 8 },
];

// --- Boucliers ---
const SHIELDS = [
  { name: "Bouclier de bois",   prix: 15, bonus: 1 },
  { name: "Bouclier en cuir",   prix: 30, bonus: 2 },
  { name: "Bouclier cuivre",    prix: 55, bonus: 3 },
  { name: "Bouclier renforcé",  prix: 75, bonus: 4 },
];

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const CAT_ICONS = {
  "Arme blanche":       "icons/svg/sword.svg",
  "Arme de jet":        "icons/svg/combat.svg",
  "Arme exotique":      "icons/svg/combat.svg",
  "Arme \u00e0 deux mains": "icons/svg/combat.svg",
  "Arme \u00e0 distance":   "icons/svg/target.svg",
  "Armure":             "icons/svg/shield.svg",
  "Bouclier":           "icons/svg/shield.svg",
};

/* ------------------------------------------------------------------ */
/*  Build documents                                                    */
/* ------------------------------------------------------------------ */

const docs = [];

// Create folders for each weapon category + Armure + Bouclier
const folderIds = {};
const categories = [
  "Arme blanche", "Arme de jet", "Arme exotique",
  "Arme \u00e0 deux mains", "Arme \u00e0 distance",
  "Armure", "Bouclier"
];

let folderSort = 0;
for (const cat of categories) {
  const fId = genId("fArm");
  folderIds[cat] = fId;
  docs.push({
    _id:     fId,
    name:    cat,
    type:    "Item",
    sort:    (folderSort++) * 100000,
    sorting: "a",
    color:   cat.startsWith("Arme") ? "#8B0000" : "#2F4F4F",
    flags:   {},
    folder:  null
  });
}

// --- Weapon items (one per weapon per quality tier) ---
const isRangedCat = new Set(["Arme de jet", "Arme \u00e0 distance"]);
const isConsumableCat = new Set(["Arme de jet", "Arme \u00e0 distance"]);

for (const weapon of WEAPONS) {
  for (let qi = 0; qi < weapon.tiers.length; qi++) {
    const tier = weapon.tiers[qi];
    if (!tier) continue;

    const qualityLabel = QUALITY_LABELS[qi];
    const displayName = `${weapon.name} (${qualityLabel})`;

    const p = parsePortee(tier.portee);
    const hasRange = isRangedCat.has(weapon.cat) || p.has;
    const consumable = isConsumableCat.has(weapon.cat);
    const typeDmg = TYPE_DAMAGE_MAP[tier.type] || tier.type || "";

    const descParts = [
      `<p><strong>Catégorie :</strong> ${weapon.cat}</p>`,
      `<p><strong>Qualité :</strong> ${qualityLabel}</p>`,
      `<p><strong>Prix :</strong> ${tier.prix} po</p>`,
    ];

    docs.push({
      _id:       genId("aWpn"),
      name:      displayName,
      type:      "weapon",
      img:       CAT_ICONS[weapon.cat] || "icons/svg/sword.svg",
      system: {
        attBonus:    0,
        damage:      (tier.dmg && tier.dmg !== "-") ? tier.dmg : "",
        critical:    (tier.crit && tier.crit !== "-") ? tier.crit : "",
        typeDamage:  typeDmg,
        portee:      p.value,
        hasPortee:   hasRange,
        consumable:  consumable,
        linkedAmmoId: "",
        description: descParts.join("\n"),
        gmNotes:     ""
      },
      effects:   [],
      folder:    folderIds[weapon.cat],
      sort:      0,
      ownership: { default: 0 },
      flags:     {}
    });
  }
}

// --- Armor items (equipment type) ---
for (const armor of ARMORS) {
  docs.push({
    _id:       genId("aEqp"),
    name:      armor.name,
    type:      "equipment",
    img:       CAT_ICONS["Armure"],
    system: {
      quantity:    1,
      consumable:  false,
      description: [
        `<p><strong>Bonus Armure :</strong> +${armor.bonus}</p>`,
        `<p><strong>Prix :</strong> ${armor.prix} po</p>`
      ].join("\n"),
      gmNotes:     ""
    },
    effects:   [],
    folder:    folderIds["Armure"],
    sort:      0,
    ownership: { default: 0 },
    flags:     {}
  });
}

// --- Shield items (equipment type) ---
for (const shield of SHIELDS) {
  docs.push({
    _id:       genId("aEqp"),
    name:      shield.name,
    type:      "equipment",
    img:       CAT_ICONS["Bouclier"],
    system: {
      quantity:    1,
      consumable:  false,
      description: [
        `<p><strong>Bonus Bouclier :</strong> +${shield.bonus}</p>`,
        `<p><strong>Prix :</strong> ${shield.prix} po</p>`
      ].join("\n"),
      gmNotes:     ""
    },
    effects:   [],
    folder:    folderIds["Bouclier"],
    sort:      0,
    ownership: { default: 0 },
    flags:     {}
  });
}

/* ------------------------------------------------------------------ */
/*  Write the .db file                                                 */
/* ------------------------------------------------------------------ */

const outPath = path.join(__dirname, "armes.db");
const content = docs.map(d => JSON.stringify(d)).join("\n") + "\n";
fs.writeFileSync(outPath, content, "utf-8");

// Stats
const folders  = docs.filter(d => d.type === "Item" && d.sorting);
const weapons  = docs.filter(d => d.type === "weapon");
const equip    = docs.filter(d => d.type === "equipment");

console.log(`Wrote ${docs.length} documents to ${outPath}`);
console.log(`  - ${folders.length} folders`);
console.log(`  - ${weapons.length} weapons`);
console.log(`  - ${equip.length} equipment (${ARMORS.length} armures + ${SHIELDS.length} boucliers)`);

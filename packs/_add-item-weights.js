/**
 * Build script : ajoute une estimation plausible de poids (kg) aux objets déjà présents
 * dans packs/armes.db et packs/equipement.db (nouveau champ system.poids, voir
 * item-weapon.mjs/item-equipment.mjs), pour le chantier "Capacité de port + Mule"
 * (todo_foundry.txt lignes 353-354).
 *
 * Valeurs approximatives (équivalents historiques/RPG usuels), à corriger au cas par cas
 * par l'utilisateur — l'objectif est d'avoir un tableau exploitable dès le départ plutôt
 * qu'une colonne entièrement à 0. Les armes d'armes.db partagent un nom de base
 * ("Glaive (Bonne facture)") suivi d'un palier de qualité qui n'affecte pas le poids —
 * la table est donc indexée sur le nom de base, avant la parenthèse.
 *
 * Run:  node packs/_add-item-weights.js
 */
const fs = require("fs");
const path = require("path");

const WEAPON_WEIGHTS = {
  "Couteau": 0.3,
  "Dague": 0.5,
  "Glaive": 1.2,
  "Épée courte": 1.3,
  "Lance": 2.5,
  "Hache": 1.8,
  "Javeline": 1.0,
  "Hache de lancer": 0.9,
  "Bolas": 0.7,
  "Bouclier de lancer": 1.5,
  "Filet": 1.5,
  "Couteau de lancer": 0.3,
  "Chakram": 0.6,
  "Serpe": 1.0,
  "Bâton": 1.5,
  "Gourdin": 1.2,
  "Marteau": 2.0,
  "Trident": 2.5,
  "Cimeterre": 1.4,
  "Double hache": 3.0,
  "Marteau de guerre": 3.5,
  "Sarisse": 4.5,
  "Arc court": 1.0,
  "Arc long": 1.5,
  "Fronde": 0.2,
  "Fouet": 0.5
};

// Armure/bouclier — présents à la fois dans armes.db (type "equipment") et sous leur
// forme historique dans equipement.db.
const ARMOR_WEIGHTS = {
  "Vêtement en Lin": 0.5,
  "Armure de cuir": 6,
  "Armure de cuir cloutée": 8,
  "Armure en peau": 5,
  "Armure de cuivre": 12,
  "Armure en plaque": 20,
  "Maille": 11,
  "Cuirasse": 9,
  "Bouclier de bois": 3,
  "Bouclier en cuir": 3.5,
  "Bouclier cuivre": 6,
  "Bouclier renforcé": 7
};

const EQUIPEMENT_WEIGHTS = {
  "Linothorax": 4,
  "Thorax de cuir": 6,
  "Cuirasse de bronze": 9,
  "Armure d'hoplite complète": 22,
  "Casque corinthien": 1.2,
  "Casque chalcidien": 1,
  "Cnémides de bronze": 1.5,
  "Aspis (bouclier rond)": 7,
  "Peltè (bouclier léger)": 3,
  "Potion de soin": 0.3,
  "Potion de soin majeure": 0.4,
  "Nectar des dieux": 0.3,
  "Ambroisie": 0.2,
  "Élixir de Force d'Héraclès": 0.3,
  "Huile de sagesse d'Athéna": 0.3,
  "Philtre d'amour d'Aphrodite": 0.2,
  "Vin de Dionysos": 1.0,
  "Onguent d'Asclépios": 0.2,
  "Eau du Styx": 0.3,
  "Larmes de Niobé": 0.1,
  "Sang de Méduse": 0.2,
  "Poudre de sommeil d'Hypnos": 0.1,
  "Antidote universel": 0.3,
  "Corde de chanvre (30m)": 3,
  "Torche": 0.5,
  "Rations de voyage": 1.0,
  "Sacoche de guérisseur": 2.0,
  "Outils d'artisan": 3.0,
  "Outre à eau (2L)": 2.0,
  "Tente de campagne": 8.0,
  "Breuvage du Colosse": 0.3,
  "Essence d'Acrobate": 0.2,
  "Philtre de l'Ours": 0.3,
  "Liqueur du Vent": 0.3,
  "Elixir de l'Orateur": 0.3,
  "Breuvage de l'Astre": 0.3,
  "Antidote Commun": 0.3,
  "Potion Simple": 0.3,
  "Onguent de cicatrisation": 0.2,
  "Antidouleur": 0.2,
  "Onguent anti infection": 0.2,
  "Tisane de langueur": 0.3,
  "Thé d'Asclépsios": 0.3,
  "Essence du Brisé": 0.2,
  "Elixir du Frêle": 0.2,
  "Breuvage de la Tortue": 0.3,
  "Sève du Boiteux": 0.2,
  "Sirop de Frêne": 0.2,
  "Morsure du Serpent": 0.2,
  "Plaie Ouverte": 0.2,
  "Rations régénératrices de Déméter": 0.5
};

function baseWeaponName(name) {
  const idx = name.indexOf(" (");
  return idx === -1 ? name : name.slice(0, idx);
}

function processArmes() {
  const filePath = path.join(__dirname, "armes.db");
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  let set = 0, skippedFolders = 0, unmatched = [];

  const out = lines.map(line => {
    const doc = JSON.parse(line);
    if (doc.type === "Item") { skippedFolders++; return line; }

    let weight;
    if (doc.type === "weapon") weight = WEAPON_WEIGHTS[baseWeaponName(doc.name)];
    else if (doc.type === "equipment") weight = ARMOR_WEIGHTS[doc.name];

    if (weight === undefined) { unmatched.push(doc.name); return line; }
    doc.system.poids = weight;
    set++;
    return JSON.stringify(doc);
  });

  fs.writeFileSync(filePath, out.join("\n") + "\n", "utf-8");
  console.log(`armes.db : ${set} poids appliqués, ${skippedFolders} entrées "Item" (catégories) ignorées, ${unmatched.length} sans correspondance:`, unmatched);
}

function processEquipement() {
  const filePath = path.join(__dirname, "equipement.db");
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  let set = 0, unmatched = [];

  const out = lines.map(line => {
    const doc = JSON.parse(line);
    const weight = EQUIPEMENT_WEIGHTS[doc.name];
    if (weight === undefined) { unmatched.push(doc.name); return line; }
    doc.system.poids = weight;
    set++;
    return JSON.stringify(doc);
  });

  fs.writeFileSync(filePath, out.join("\n") + "\n", "utf-8");
  console.log(`equipement.db : ${set} poids appliqués, ${unmatched.length} sans correspondance:`, unmatched);
}

processArmes();
processEquipement();

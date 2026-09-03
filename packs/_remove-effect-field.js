/**
 * Build script : étape 4 du complément au chantier Effets (todo_foundry.txt lignes
 * 453-455). Sur `packs/avantages.db` et `packs/desavantages.db` :
 *   1. Vérifie qu'aucun document n'a plus d'un effet embarqué (dédoublonnage préventif —
 *      la source n'en a jamais eu, mais on vérifie avant de continuer).
 *   2. Reprend le texte de `system.effect` (string) dans la `description` de l'effet
 *      embarqué existant, s'il y en a un — un effet actif porte désormais lui-même son
 *      descriptif simple, au lieu d'un champ séparé qui faisait doublon avec la
 *      description complète.
 *   3. Supprime le champ `system.effect`, devenu redondant (retiré aussi du schéma
 *      DataModel — item-advantage.mjs/item-disadvantage.mjs).
 *
 * Les avantages/désavantages SANS effet embarqué (Mule, Cuisine de Déméter, Connaissance
 * d'Héphaistos, la quasi-totalité des désavantages) ne reçoivent PAS de nouvel effet —
 * décision utilisateur : la tooltip et l'affichage retombent sur un extrait de la
 * description complète à la place (voir actor-sheet.mjs, _prepareTraitItems).
 *
 * Run:  node packs/_remove-effect-field.js
 */
const fs = require("fs");
const path = require("path");

function processFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);

  let dupErrors = 0;
  let backfilled = 0;
  let stripped = 0;

  const out = lines.map(line => {
    const doc = JSON.parse(line);

    if (doc.effects.length > 1) {
      console.warn(`[${fileName}] "${doc.name}" a ${doc.effects.length} effets — dédoublonnage manuel requis, non modifié.`);
      dupErrors++;
      return line;
    }

    if (doc.effects.length === 1 && !doc.effects[0].description && doc.system.effect) {
      doc.effects[0].description = doc.system.effect;
      backfilled++;
    }

    if ("effect" in doc.system) {
      delete doc.system.effect;
      stripped++;
    }

    return JSON.stringify(doc);
  });

  fs.writeFileSync(filePath, out.join("\n") + "\n", "utf-8");
  console.log(`${fileName} : ${backfilled} description(s) reprise(s), ${stripped} champ(s) "effect" retiré(s), ${dupErrors} doublon(s) restant(s) à traiter manuellement.`);
}

processFile("avantages.db");
processFile("desavantages.db");

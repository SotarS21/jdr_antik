/**
 * Point 78 — réaligne les objets embarqués des 7 PJ de packs/personnages.db sur les compendiums actuels
 * (packs/*.db), avec la même règle que le correctif MJ « 0.6.149-pj-objets-compendium » (module/helpers/
 * realignement-objets.mjs : règles à jour, état du personnage gardé). Objets sans équivalent par type + nom :
 * laissés tels quels et listés. Idempotent : relancé, il ne change plus rien.
 *
 * Usage : node packs/_build-realigner-pj.mjs   (puis node packs/_sync-json-mirrors.js, fait aussi au déploiement)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleObjet, donneesRealignees, realignementUtile } from "../module/helpers/realignement-objets.mjs";

const dossier = path.dirname(fileURLToPath(import.meta.url));
const lire = (nom) => fs.readFileSync(path.join(dossier, `${nom}.db`), "utf8").split("\n").filter((l) => l.trim());

// Packs d'objets : tout ce qui n'est pas un pack d'acteurs ni d'effets.
const PACKS_OBJETS = ["avantages", "desavantages", "benedictions", "avantages-divins", "sorts", "equipement", "armes",
  "alchimie", "tresors", "capacites-combat", "historique"];
const references = new Map();
for (const nom of PACKS_OBJETS) {
  if (!fs.existsSync(path.join(dossier, `${nom}.db`))) continue;
  for (const ligne of lire(nom)) {
    const doc = JSON.parse(ligne);
    if ("sorting" in doc) continue;
    const cle = cleObjet(doc.type, doc.name);
    if (!references.has(cle)) references.set(cle, doc);
  }
}

let realignes = 0;
const absents = [];
const lignes = lire("personnages").map((ligne) => {
  const acteur = JSON.parse(ligne);
  if ("sorting" in acteur || !Array.isArray(acteur.items)) return ligne;
  let modifie = false;
  acteur.items = acteur.items.map((objet) => {
    const reference = references.get(cleObjet(objet.type, objet.name));
    if (!reference) {
      absents.push(`${acteur.name} : ${objet.type} « ${objet.name} »`);
      return objet;
    }
    const donnees = donneesRealignees(objet, reference);
    if (!realignementUtile(objet, donnees)) return objet;
    realignes++;
    modifie = true;
    return { ...objet, img: donnees.img, system: donnees.system, effects: donnees.effects };
  });
  return modifie ? JSON.stringify(acteur) : ligne;
});

fs.writeFileSync(path.join(dossier, "personnages.db"), lignes.join("\n") + "\n");
console.log(`${realignes} objet(s) réaligné(s) dans packs/personnages.db.`);
console.log(`${absents.length} sans équivalent (inchangés) :\n  ${absents.join("\n  ")}`);

/**
 * Point 78 — réalignement des objets embarqués d'un personnage sur leur version actuelle de compendium.
 *
 * Fonctions PURES (objets bruts en entrée et en sortie, aucune API Foundry) : utilisées à la fois par le correctif
 * MJ (pack-updates.mjs, sur le monde et le compendium déployé) et par le script de build qui met à jour la source
 * packs/personnages.db — même règle des deux côtés, sinon « Écraser mes compendiums » re-figerait l'un ou l'autre.
 *
 * Règle choisie par l'utilisateur (« règles à jour, état du PJ gardé ») :
 * - repris du compendium : icône, effets actifs, et chaque champ `system` que le compendium renseigne (description,
 *   prix, gabarit de sort, bonus, durée…) ;
 * - jamais repris : l'état propre au personnage (CHAMPS_ETAT) ; une valeur vide / absente du compendium ne remplace
 *   pas celle du personnage ;
 * - ingrédients d'un sort : la liste du compendium, avec la case « possédé » du personnage (même nom) ;
 * - utilisations restantes (`limitationValue`) ramenées au nouveau maximum (`limitation`) s'il a baissé.
 */

/** Champs `system` propres au personnage, jamais écrasés. */
export const CHAMPS_ETAT = new Set(["quantity", "slot", "equipped", "linkedAmmoId", "gmNotes", "limitationValue", "isIngredientBag"]);

/** Clé de correspondance objet de personnage ↔ document de compendium : type + nom sans accents ni casse. */
export function cleObjet(type, nom) {
  const n = String(nom ?? "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return `${type}|${n}`;
}

const vide = (v) => v === undefined || v === null || v === "";
const copie = (v) => JSON.parse(JSON.stringify(v));

/**
 * Données réalignées d'un objet de personnage d'après sa référence de compendium.
 * @param {object} objet     objet embarqué (toObject()), avec `system` et `effects`
 * @param {object} reference document de compendium (toObject())
 * @returns {{img: string, system: object, effects: object[]}}
 */
export function donneesRealignees(objet, reference) {
  const system = copie(objet.system ?? {});
  for (const [cle, valeur] of Object.entries(reference.system ?? {})) {
    if (CHAMPS_ETAT.has(cle) || vide(valeur)) continue;
    if (cle === "ingredients" && Array.isArray(valeur)) {
      const possedes = new Map((objet.system?.ingredients ?? []).map((i) => [cleObjet("", i.name), !!i.possede]));
      system.ingredients = valeur.map((i) => ({ ...copie(i), possede: possedes.get(cleObjet("", i.name)) ?? !!i.possede }));
      continue;
    }
    system[cle] = copie(valeur);
  }
  if (typeof system.limitation === "number" && typeof system.limitationValue === "number" && system.limitationValue > system.limitation) {
    system.limitationValue = system.limitation;
  }
  return { img: reference.img ?? objet.img, system, effects: copie(reference.effects ?? []) };
}

/** Vrai si le réalignement changerait l'objet (icône, champs `system` ou effets). */
export function realignementUtile(objet, donnees) {
  const effets = (liste) => JSON.stringify((liste ?? []).map((e) => [e.name, e.img, e.system?.changes ?? e.changes ?? [], e.description ?? ""]));
  return objet.img !== donnees.img
    || JSON.stringify(objet.system ?? {}) !== JSON.stringify(donnees.system)
    || effets(objet.effects) !== effets(donnees.effects);
}

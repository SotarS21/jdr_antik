/**
 * Modificateurs génériques des statuts (point 80), communs aux PJ et aux PNJ : les statuts
 * du jeton (ANTIQUE.statuts, config.mjs) et tout autre effet peuvent les modifier
 * (changement « add » sur system.modificateurs.<clé>). Toujours 0 en base ; jamais saisis
 * sur la fiche.
 * - tousTests : ajouté à tous les jets (caractéristique, compétence, sauvegarde, attaque,
 *   esquive / parade, initiative) — voir modificateurJet() dans helpers/rolls.mjs ;
 * - attaque   : ajouté aux jets d'attaque ;
 * - ca        : ajouté à la CA (prepareDerivedData des deux DataModels) ;
 * - esquive   : ajouté au total d'Esquive (prepareDerivedData des deux DataModels).
 */
export function modificateursField() {
  const fields = foundry.data.fields;
  const mod = () => new fields.NumberField({ initial: 0, integer: true });
  return new fields.SchemaField({
    tousTests: mod(),
    attaque: mod(),
    ca: mod(),
    esquive: mod()
  });
}

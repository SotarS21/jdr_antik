/**
 * Effet actif Antique : corrige au moment de l'application deux erreurs de données connues,
 * pour toutes les copies (compendiums, objets possédés, jetons non liés) sans avoir à les
 * réécrire une par une.
 *
 * 1. Un changement visant un modificateur de caractéristique (system.abilities.<k>.mod)
 *    s'applique TOUJOURS dans la phase "abilities" (voir antique.mjs et les DataModels),
 *    quelle que soit la phase enregistrée : dans la phase par défaut ("initial"), le
 *    modificateur est recalculé juste après depuis la valeur et l'effet était perdu
 *    (Faveur d'Athéna, Force d'Héraclès, Vitesse d'Hermès, Beauté divine, Affamé…).
 * 2. Clés obsolètes redirigées vers le bon champ : system.saves.<k>.base n'existe pas (la base
 *    des sauvegardes est recalculée) — le malus de Frêle, Dépressif, Maladroit va dans
 *    system.saves.<k>.bonus, comme Cuir de Héros depuis la v0.6.53.
 */
export class AntiqueActiveEffect extends foundry.documents.ActiveEffect {

  /** [motif, remplacement] des clés redirigées (voir 2. ci-dessus). */
  static CLES_REDIRIGEES = [
    [/^system\.saves\.(\w+)\.base$/, "system.saves.$1.bonus"]
  ];

  /** @override */
  shouldApplyChange(change, options) {
    if (/^system\.abilities\.\w+\.mod$/.test(change.key)) return options?.phase === "abilities";
    return super.shouldApplyChange(change, options);
  }

  /** @override */
  static applyChange(actor, change, options) {
    for (const [motif, remplacement] of this.CLES_REDIRIGEES) {
      if (motif.test(change.key)) {
        change = { ...change, key: change.key.replace(motif, remplacement) };
        break;
      }
    }
    return super.applyChange(actor, change, options);
  }
}

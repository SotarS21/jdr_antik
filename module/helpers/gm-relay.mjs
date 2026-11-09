/**
 * Relai MJ (demande de l'utilisateur, 9 novembre 2026, après la vérification des fonctions) : un joueur n'a que la
 * permission Observateur sur les acteurs qu'il ne possède pas (monstres, PJ des autres) ; « Appliquer les dégâts »,
 * un soin ou un effet de sort sur eux échouait donc (« lacks permission to update Actor »).
 *
 * Même idée que le relai de Mer des Pirates, mais avec les requêtes Foundry (CONFIG.queries / User#query) plutôt
 * qu'un canal socket : rien à déclarer dans system.json (pas de redémarrage), et le joueur récupère le résultat
 * (avant / après) pour son message de bilan. Le MJ actif exécute la MÊME méthode de l'acteur que d'habitude.
 *
 * Seules quatre méthodes sont relayées, avec des arguments simples (nombres, textes, objets sans référence) :
 * c'est la seule porte qu'un joueur ouvre sur des acteurs qui ne sont pas à lui.
 */
const REQUETE = "antique.actionActeur";
const METHODES = new Set(["applyDamage", "applyHeal", "applyCaBonus", "applyEffectChanges"]);

/** À appeler à l'initialisation : le MJ actif répond aux demandes des joueurs. */
export function registerGmRelay() {
  CONFIG.queries[REQUETE] = async ({ uuid, methode, args } = {}) => {
    if (!game.user.isGM || !METHODES.has(methode)) return null;
    const doc = await fromUuid(uuid);
    const actor = doc?.documentName === "Actor" ? doc : doc?.actor;
    if (!actor || typeof actor[methode] !== "function") return null;
    return actor[methode](...(Array.isArray(args) ? args : []));
  };
}

/** Changements d'effet en objets simples (en v14, ils référencent leur effet : impossibles à transmettre tels quels). */
export function changementsSimples(changes) {
  return Array.from(changes ?? [], (c) => {
    const simple = { key: c.key, value: c.value };
    if (c.type !== undefined) simple.type = c.type;
    if (c.mode !== undefined) simple.mode = c.mode;
    if (c.phase !== undefined) simple.phase = c.phase;
    if (c.priority !== undefined) simple.priority = c.priority;
    return simple;
  });
}

/**
 * Exécute `actor[methode](...args)` : directement si l'utilisateur possède l'acteur, sinon par le MJ actif.
 * @returns {Promise<any|null>} le résultat de la méthode, ou null si aucun MJ n'est connecté (avertissement affiché)
 */
export async function actionActeur(actor, methode, ...args) {
  if (!METHODES.has(methode)) throw new Error(`Antique | méthode non relayable : ${methode}`);
  if (actor.isOwner) return actor[methode](...args);
  const mj = game.users.activeGM;
  if (!mj) {
    ui.notifications.warn(game.i18n.format("ANTIQUE.Relay.NoGM", { nom: actor.name }));
    return null;
  }
  try {
    return await mj.query(REQUETE, { uuid: actor.uuid, methode, args }, { timeout: 15000 });
  } catch (e) {
    console.error("Antique | Échec du relai MJ", e);
    ui.notifications.error(game.i18n.format("ANTIQUE.Relay.Echec", { nom: actor.name }));
    return null;
  }
}

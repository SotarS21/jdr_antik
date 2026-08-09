/**
 * Generic d20 roll helper.
 * @param {object} options
 * @param {string} options.formula - Roll formula (e.g. "1d20 + @mod")
 * @param {object} options.data - Roll data context
 * @param {string} options.flavor - Chat message flavor text
 * @param {Actor} options.actor - The actor performing the roll
 * @returns {Promise<Roll>}
 */
export async function rollD20({ formula = "1d20", data = {}, flavor = "", actor = null } = {}) {
  const roll = new Roll(formula, data);
  await roll.evaluate();
  await roll.toMessage({
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
    flavor
  });
  return roll;
}

/**
 * Retrieve the CA (armor class) of an actor regardless of type.
 * Characters store it in system.ca.total, NPCs in system.ca.value.
 * @param {Actor} actor
 * @returns {number|null}
 */
export function getActorCA(actor) {
  if (!actor) return null;
  if (actor.type === "character") return actor.system.ca?.total ?? null;
  if (actor.type === "npc") return actor.system.ca?.value ?? null;
  return null;
}

/**
 * Build an attack result flavor HTML that includes target CA comparison.
 * If the user has a token targeted, the flavor will show hit/miss against
 * the target's CA. Otherwise, returns the base flavor unchanged.
 * @param {string} baseFlavor - The base flavor text (e.g. "Épée - Jet d'attaque")
 * @param {number} rollTotal - The total of the attack roll
 * @returns {string} HTML flavor string
 */
export function buildAttackFlavor(baseFlavor, rollTotal) {
  const targets = game.user.targets;
  if (!targets || targets.size === 0) return baseFlavor;

  const target = targets.first();
  const targetActor = target.actor;
  if (!targetActor) return baseFlavor;

  const ca = getActorCA(targetActor);
  if (ca === null) return baseFlavor;

  const hit = rollTotal >= ca;
  const resultClass = hit ? "attack-hit" : "attack-miss";
  const resultLabel = hit
    ? game.i18n.localize("ANTIQUE.Attack.Hit")
    : game.i18n.localize("ANTIQUE.Attack.Miss");
  const vsLabel = game.i18n.localize("ANTIQUE.Attack.VsCA");

  // Players must not see a monster's exact CA in the chat flavor — only the
  // hit/miss outcome. The GM (or the CA of a player character, never secret
  // here) still gets the number.
  const showCA = game.user.isGM || targetActor.type === "character";
  const caLabel = showCA ? ` (CA ${ca})` : "";

  return `${baseFlavor}
    <div class="antique attack-result ${resultClass}">
      <span class="attack-vs">${vsLabel} <strong>${targetActor.name}</strong>${caLabel}</span>
      <span class="attack-outcome">${resultLabel}</span>
    </div>`;
}

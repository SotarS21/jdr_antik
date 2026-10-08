/**
 * Modificateurs de statut d'un jet (point 80) : somme de system.modificateurs.<clé> pour les
 * clés demandées (toujours "tousTests", plus "attaque" pour un jet d'attaque), et détail des
 * effets actifs qui les portent, pour le tchat (« Peur −1, Béni +1 »).
 * @param {Actor} actor
 * @param {string[]} [cles]
 * @returns {{value: number, flavor: string}} flavor = texte à ajouter au libellé du jet
 */
export function modificateurJet(actor, cles = ["tousTests"]) {
  const mods = actor?.system?.modificateurs;
  const value = mods ? cles.reduce((sum, k) => sum + (Number(mods[k]) || 0), 0) : 0;
  if (!value) return { value: 0, flavor: "" };
  const keys = new Set(cles.map(k => `system.modificateurs.${k}`));
  const details = [];
  for (const effect of actor.appliedEffects ?? []) {
    for (const change of effect.system?.changes ?? []) {
      if (!keys.has(change.key)) continue;
      const v = Number(change.value) || 0;
      if (v) details.push(`${effect.name} ${v > 0 ? "+" : "−"}${Math.abs(v)}`);
    }
  }
  const text = details.length ? details.join(", ") : `${value > 0 ? "+" : "−"}${Math.abs(value)}`;
  return { value, flavor: ` <span class="antique-roll-mods">(${text})</span>` };
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

/**
 * Build a save result flavor HTML that includes a success/failure comparison against a
 * fixed difficulty (ex. a monster ability's "Robustesse DC 18"). Unlike buildAttackFlavor,
 * the DC is never hidden — it's a known, printed value on the ability itself, not a
 * secret NPC stat.
 * @param {string} baseFlavor - The base flavor text (e.g. "Robustesse - Jet de sauvegarde")
 * @param {number} rollTotal - The total of the save roll
 * @param {number} dc - The difficulty to beat
 * @returns {string} HTML flavor string
 */
export function buildSaveFlavor(baseFlavor, rollTotal, dc) {
  if (!dc || dc <= 0) return baseFlavor;

  const success = rollTotal >= dc;
  // Reuses the attack-hit/attack-miss classes/CSS (buildAttackFlavor above) — same
  // green/red success-failure look, just a different label ("Réussite"/"Échec" instead of
  // "Touché"/"Manqué").
  const resultClass = success ? "attack-hit" : "attack-miss";
  const resultLabel = success
    ? game.i18n.localize("ANTIQUE.Save.Success")
    : game.i18n.localize("ANTIQUE.Save.Failure");
  const vsLabel = game.i18n.format("ANTIQUE.Save.VsDC", { dc });

  return `${baseFlavor}
    <div class="antique attack-result ${resultClass}">
      <span class="attack-vs">${vsLabel}</span>
      <span class="attack-outcome">${resultLabel}</span>
    </div>`;
}

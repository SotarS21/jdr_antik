/**
 * Esquive/Parade rule: each reaction stacks a -1 penalty on that same skill for the
 * rest of the actor's turn (see AntiqueActor#rollDodgeSkill), reset to 0 at the start
 * of that actor's own next turn. Foundry has no built-in "start of turn" effect —
 * this listens for Combat#_manageTurnEvents' "combatTurnChange" hook (fired on every
 * client once per turn change, after round/turn advance) and clears both skills'
 * tempPenalty for whichever actor's turn is now starting.
 *
 * Gated to the active GM only: the hook fires on every connected client, and having
 * just one of them actually write the reset avoids every client racing to perform
 * the same (idempotent, but redundant) update.
 */
export function registerDodgeResetHook() {
  Hooks.on("combatTurnChange", (combat, previous, current) => {
    if (!game.user.isActiveGM) return;
    const actor = combat.combatants.get(current.combatantId)?.actor;
    if (!actor) return;

    const isCharacter = actor.type === "character";
    const updates = {};
    for (const key of ["esquive", "parade"]) {
      const data = isCharacter ? actor.system.skills?.[key] : actor.system[key];
      if (data?.tempPenalty) {
        updates[isCharacter ? `system.skills.${key}.tempPenalty` : `system.${key}.tempPenalty`] = 0;
      }
    }
    if (Object.keys(updates).length) actor.update(updates);
  });
}

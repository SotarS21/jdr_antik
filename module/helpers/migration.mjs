/**
 * Migration helpers for the Antique system.
 *
 * Each migration function targets a specific schema version and is run once
 * (tracked via a world flag so it never re-runs after success).
 */

/* ------------------------------------------------------------------ */
/*  Migration registry                                                 */
/* ------------------------------------------------------------------ */

/**
 * List of migrations ordered by version.
 * Add new entries at the end when future schema changes are needed.
 */
const MIGRATIONS = [
  { version: "0.5.1", migrate: migrateBonusSexeToAvantageTemporaire },
  { version: "0.6.2", migrate: migrateWeaponHasPortee },
  { version: "0.6.3", migrate: migrateColereZeusEffect },
  { version: "0.6.104", migrate: migrateLinkCharacterTokens }
];

/* ------------------------------------------------------------------ */
/*  Public entry point — called from the "ready" hook                  */
/* ------------------------------------------------------------------ */

/**
 * Run every pending migration in order.
 * Only the GM executes migrations to avoid race conditions.
 */
export async function migrateWorld() {
  if (!game.user.isGM) return;

  for (const { version, migrate } of MIGRATIONS) {
    const flag = `migration-${version}`;
    if (game.settings.get("antique", flag)) continue;

    console.log(`Antique | Running migration ${version}…`);
    try {
      await migrate();
      await game.settings.set("antique", flag, true);
      console.log(`Antique | Migration ${version} complete.`);
    } catch (err) {
      console.error(`Antique | Migration ${version} failed:`, err);
      ui.notifications.error(
        `Antique – migration ${version} a échoué. Consultez la console (F12) pour les détails.`
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Settings registration — called from the "init" hook                */
/* ------------------------------------------------------------------ */

/**
 * Register one Boolean setting per migration so we can track completion.
 */
export function registerMigrationSettings() {
  for (const { version } of MIGRATIONS) {
    game.settings.register("antique", `migration-${version}`, {
      name: `Migration ${version} applied`,
      scope: "world",
      config: false,
      type: Boolean,
      default: false
    });
  }
}

/* ------------------------------------------------------------------ */
/*  0.5.1 — Rename bonusSexe → avantageTemporaire                     */
/* ------------------------------------------------------------------ */

async function migrateBonusSexeToAvantageTemporaire() {
  // --- World actors ---
  for (const actor of game.actors) {
    await _migrateActorBonusSexe(actor);
  }

  // --- Actors inside scenes (unlinked tokens) ---
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      // Unlinked tokens have their own actor delta
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      await _migrateActorBonusSexe(actor);
    }
  }

  ui.notifications.info("Antique – migration « bonusSexe → avantageTemporaire » terminée.");
}

/**
 * Migrate a single actor: rename the data field and the ActiveEffect status.
 */
async function _migrateActorBonusSexe(actor) {
  if (actor.type !== "character") return;

  const src = actor.system._source ?? actor.system;
  // Only migrate if the old field is still present
  if (!("bonusSexe" in src)) return;

  const oldValue = !!src.bonusSexe;

  // Update the data: set new field + remove old field
  const updateData = {
    "system.avantageTemporaire": oldValue,
    "system.-=bonusSexe": null
  };

  // Also migrate the ActiveEffect if it exists
  const oldEffect = actor.effects.find(e => e.statuses?.has("bonusSexe"));
  if (oldEffect) {
    await oldEffect.update({
      name: "Avantage Temporaire",
      statuses: ["avantageTemporaire"]
    });
  }

  await actor.update(updateData);
}

/* ------------------------------------------------------------------ */
/*  0.6.2 — Fix hasPortee on already-embedded weapon copies            */
/* ------------------------------------------------------------------ */

/**
 * A weapon copy already embedded on an actor before the compendium's `hasPortee`
 * value was corrected never picks up that fix on its own (Foundry doesn't resync
 * embedded items from a modified compendium) — this repairs any such stale copy
 * still lying around (e.g. Glaive: portee:1.5 but hasPortee stuck at false).
 */
async function migrateWeaponHasPortee() {
  for (const actor of game.actors) {
    await _migrateActorWeaponHasPortee(actor);
  }

  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      await _migrateActorWeaponHasPortee(actor);
    }
  }

  ui.notifications.info("Antique – migration « portée d'arme » terminée.");
}

async function _migrateActorWeaponHasPortee(actor) {
  for (const item of actor.items) {
    if (item.type !== "weapon") continue;
    if (item.system.portee > 0 && item.system.hasPortee !== true) {
      await item.update({ "system.hasPortee": true });
    }
  }
}

/* ------------------------------------------------------------------ */
/*  0.6.3 — Fix Colère de Zeus's ActiveEffect on already-embedded copies */
/* ------------------------------------------------------------------ */

/**
 * The compendium entry for "Colère de Zeus" pointed its ActiveEffect at
 * "system.damage" (not a real Actor field — silently a no-op) between 12/05/2026
 * and 08/08/2026. Copies of the advantage already embedded on a character before
 * the 08/08/2026 fix keep the broken key forever unless corrected here.
 */
async function migrateColereZeusEffect() {
  for (const actor of game.actors) {
    await _migrateActorColereZeusEffect(actor);
  }

  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      const actor = token.actor;
      if (!actor) continue;
      await _migrateActorColereZeusEffect(actor);
    }
  }

  ui.notifications.info("Antique – migration « Colère de Zeus » terminée.");
}

async function _migrateActorColereZeusEffect(actor) {
  const item = actor.items.find(i => i.type === "advantage" && i.name === "(-1) Colère de Zeus");
  if (!item) return;

  for (const effect of item.effects) {
    const change = effect.changes.find(c => c.key === "system.damage");
    if (!change) continue;
    const changes = effect.changes.map(c =>
      c === change ? { ...c, key: "system.attackBonuses.armeBlanche.damageBonus", value: "3" } : c
    );
    await effect.update({ changes });
  }
}

/* ------------------------------------------------------------------ */
/*  0.6.104 — Link every player-character actor/token                  */
/* ------------------------------------------------------------------ */

/**
 * Player-character tokens left unlinked ("Link Actor Data" unchecked) end up
 * as an independent data copy from the fiche in the Actors sidebar — the two
 * silently diverge over time even though they're meant to be the same
 * character. Only "character" actors are touched: NPCs/creatures are
 * deliberately left alone, since the same NPC actor is often placed multiple
 * times on a scene and each instance needs its own HP/effects.
 */
async function migrateLinkCharacterTokens() {
  for (const actor of game.actors) {
    if (actor.type !== "character") continue;
    if (actor.prototypeToken.actorLink) continue;
    await actor.update({ "prototypeToken.actorLink": true });
  }

  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (token.actorLink) continue;
      if (token.actor?.type !== "character") continue;
      await token.update({ actorLink: true });
    }
  }

  ui.notifications.info("Antique – migration « liaison des jetons de personnage » terminée.");
}

/* ------------------------------------------------------------------ */
/*  Default new player-character actors to a linked prototype token    */
/* ------------------------------------------------------------------ */

/**
 * The retroactive fix above (migration 0.6.104) only covers actors that
 * already existed. Without this, a "character" actor created afterwards
 * would still default to Foundry's own core setting for a fresh actor
 * (unlinked), reintroducing the same fiche/jeton divergence.
 */
export function registerCharacterTokenLinkDefault() {
  Hooks.on("preCreateActor", (actor, data) => {
    if (data.type !== "character") return;
    if (data.prototypeToken?.actorLink) return;
    actor.updateSource({ "prototypeToken.actorLink": true });
  });
}

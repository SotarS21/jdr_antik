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
  { version: "0.5.1", migrate: migrateBonusSexeToAvantageTemporaire }
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

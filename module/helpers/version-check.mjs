import { RELEASE_NOTES } from "./release-notes.mjs";

const VERSION_SETTING = "lastSeenVersion";

/**
 * Register the hidden world setting used to remember which system version this
 * world last saw. Call from the "init" hook, alongside registerMigrationSettings().
 */
export function registerVersionCheckSettings() {
  game.settings.register("antique", VERSION_SETTING, {
    name: "Dernière version du système vue par ce monde",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}

/**
 * Compare the system version this world last saw against the one currently
 * installed. On a genuine update (not the world's very first load), show the
 * GM a French release-note dialog and ask whether to overwrite this system's
 * own compendiums (Avantages, Désavantages, Sorts, etc.) with the content
 * shipped in this update — a GM who edited those compendiums directly would
 * otherwise silently lose that work on every update, with no way to know.
 * Call from the "ready" hook, GM only.
 *
 * Deliberately a no-op for our own dev deploys: `system.json`'s `manifest`
 * field is still "" (we don't publish through a GitHub-hosted manifest yet —
 * every reload during development would otherwise re-bump the stored version
 * and pop this dialog constantly for changes that aren't a real release).
 * Once `manifest`/`download` point to a real GitHub release, this activates
 * automatically for anyone updating through Foundry's own package manager —
 * nothing else needs to change here at that point.
 */
export async function checkSystemVersionUpdate() {
  if (!game.user.isGM) return;
  if (!game.system.manifest) return;

  const stored = game.settings.get("antique", VERSION_SETTING);
  const current = game.system.version;

  if (!stored) {
    // First time this system runs in this world: nothing to compare against yet.
    await game.settings.set("antique", VERSION_SETTING, current);
    return;
  }

  if (stored === current) return;

  const notes = Object.entries(RELEASE_NOTES)
    .filter(([version]) => foundry.utils.isNewerVersion(version, stored) && !foundry.utils.isNewerVersion(version, current))
    .sort(([a], [b]) => (foundry.utils.isNewerVersion(a, b) ? 1 : -1))
    .map(([, note]) => `<h3>${note.title}</h3>${note.html}`)
    .join("");

  const content = `
    <div class="antique release-notes-dialog">
      ${notes || "<p>Aucune note de version disponible pour cette mise à jour.</p>"}
      <p class="release-notes-warning">
        <i class="fas fa-triangle-exclamation"></i>
        Voulez-vous écraser vos compendiums système (Avantages, Désavantages, Sorts, etc.) avec le contenu fourni
        par cette mise à jour ? Toute modification que vous avez faite <strong>directement dans ces compendiums</strong>
        sera perdue si vous choisissez d'écraser. Vos personnages, objets et scènes ne sont jamais affectés.
      </p>
    </div>`;

  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `Antique — Mise à jour vers la version ${current}` },
    content,
    buttons: [
      {
        action: "overwrite",
        icon: "fas fa-triangle-exclamation",
        label: "Écraser mes compendiums",
        callback: () => "overwrite"
      },
      {
        action: "keep",
        icon: "fas fa-shield-halved",
        label: "Conserver mes compendiums",
        default: true,
        callback: () => "keep"
      }
    ],
    rejectClose: false
  });

  if (choice === "overwrite") {
    await overwriteSystemCompendiums();
  }

  // Record the new version regardless of the choice, so this dialog doesn't
  // reappear on the next reload.
  await game.settings.set("antique", VERSION_SETTING, current);
}

/**
 * Re-seed every system-bundled compendium from its packs/<name>.json source file
 * (a byte-identical mirror of packs/<name>.db, the file the `fvtt` CLI actually packs
 * from — see packs/_sync-json-mirrors.js for why a mirror exists at all: current
 * Foundry versions return HTTP 403 fetching a `.db` file directly as a static asset,
 * an anti-leak measure for compendium data, which silently broke this feature entirely
 * until the mirror was introduced) — upserts by _id (update existing, create missing),
 * never deletes an entry that isn't present in the source (a GM's own additions to a
 * system compendium are left alone even when overwriting).
 */
async function overwriteSystemCompendiums() {
  ui.notifications.info("Antique – mise à jour des compendiums en cours…");

  let updated = 0, created = 0, failed = 0;

  for (const packDef of game.system.packs) {
    const pack = game.packs.get(`antique.${packDef.name}`);
    if (!pack) continue;

    // Not packDef.path: Foundry normalizes that field (strips the extension, and on some
    // versions resolves it to a full "systems/antique/..." path already) — building the
    // fetch URL straight from the pack's own name/our fixed on-disk convention avoids
    // both quirks. packs/_json-mirrors/, not packs/<name>.db directly — see the function
    // doc above and packs/_sync-json-mirrors.js.
    const packFile = `packs/_json-mirrors/${packDef.name}.json`;
    let entries;
    try {
      const response = await fetch(`systems/antique/${packFile}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      entries = text.split("\n").map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line));
    } catch (err) {
      console.error(`Antique | Impossible de lire ${packFile} :`, err);
      failed++;
      continue;
    }

    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });

    for (const entry of entries) {
      try {
        // _stats is Foundry's own bookkeeping (who/when last modified) — never overwrite
        // it from a static seed file; some historical entries even carry an invalid
        // placeholder (ex. lastModifiedBy: "buildScript", not a real 16-char user id),
        // which fails validation outright if passed through untouched.
        const { _id, _stats, ...data } = entry;

        // The flat NDJSON export of a pack mixes real content documents with the Folder
        // documents used to organize them in the compendium sidebar — only Folders carry
        // a "sorting" field in this shape, and they need Folder's own document class, not
        // this pack's (ex. an "Item" pack's real documents are weapons/spells/etc., never
        // literally type "Item" — that value belongs to a Folder saying "this organizes
        // Items", which used to be fed into pack.documentClass.create() by mistake and
        // rejected as an invalid Item type).
        if ("sorting" in entry) {
          const existingFolder = pack.folders.get(_id);
          if (existingFolder) {
            await existingFolder.update(data);
            updated++;
          } else {
            await Folder.create({ _id, ...data }, { pack: pack.collection, keepId: true });
            created++;
          }
          continue;
        }

        const existing = await pack.getDocument(_id);
        if (existing) {
          await existing.update(data);
          updated++;
        } else {
          await pack.documentClass.create({ _id, ...data }, { pack: pack.collection, keepId: true });
          created++;
        }
      } catch (err) {
        console.error(`Antique | Échec de mise à jour de l'entrée ${entry._id} (${packDef.name}) :`, err);
        failed++;
      }
    }

    if (wasLocked) await pack.configure({ locked: true });
  }

  const summary = `Antique – compendiums mis à jour : ${updated} mis à jour, ${created} créés${failed ? `, ${failed} échecs (voir console)` : ""}.`;
  if (failed) ui.notifications.warn(summary);
  else ui.notifications.info(summary);
}

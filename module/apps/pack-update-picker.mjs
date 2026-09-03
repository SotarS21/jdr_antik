import { getPendingPackUpdates, markPackUpdatesApplied } from "../helpers/pack-updates.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Écran GM listant, par compendium, les correctifs de contenu en attente
 * (module/helpers/pack-updates.mjs) — une case à cocher par correctif, "Appliquer la
 * sélection" n'exécute que ceux cochés (fusion sélective : créations/corrections
 * ciblées, jamais un écrasement en bloc), "Plus tard" ferme sans rien marquer. Tout
 * correctif non coché reste en attente et sera reproposé au prochain login GM (voir
 * checkPendingPackUpdates()).
 */
export class AntiquePackUpdatePicker extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "antique-pack-update-picker",
    classes: ["antique", "sheet", "pack-update-picker"],
    position: { width: 520, height: "auto" },
    window: { title: "Antique — Mises à jour de compendium en attente", resizable: true, icon: "fas fa-box-open" }
  };

  static PARTS = {
    main: { template: "systems/antique/templates/apps/pack-update-picker.hbs" }
  };

  /** Shared singleton so a second trigger re-focuses the existing window instead of
   *  spawning a second ApplicationV2 instance with the same static id. */
  static _instance = null;

  static open() {
    AntiquePackUpdatePicker._instance ??= new AntiquePackUpdatePicker();
    AntiquePackUpdatePicker._instance.render(true);
    return AntiquePackUpdatePicker._instance;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const pending = getPendingPackUpdates();
    const packLabels = new Map(game.system.packs.map(p => [p.name, p.label]));

    const groups = new Map();
    for (const update of pending) {
      const label = packLabels.get(update.pack) ?? update.pack;
      if (!groups.has(update.pack)) groups.set(update.pack, { label, entries: [] });
      groups.get(update.pack).entries.push(update);
    }

    context.groups = Array.from(groups.values());
    context.hasPending = pending.length > 0;
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this.element.querySelector(".pack-update-apply")?.addEventListener("click", ev => this._onApply(ev));
    this.element.querySelector(".pack-update-later")?.addEventListener("click", () => this.close());
  }

  _onClose(options) {
    super._onClose(options);
    if (AntiquePackUpdatePicker._instance === this) AntiquePackUpdatePicker._instance = null;
  }

  async _onApply(event) {
    event.preventDefault();

    const checked = Array.from(this.element.querySelectorAll('input[type="checkbox"][data-id]:checked'))
      .map(el => el.dataset.id);
    if (!checked.length) {
      ui.notifications.warn("Antique – aucun correctif sélectionné.");
      return;
    }

    const pending = getPendingPackUpdates();
    const toApply = pending.filter(update => checked.includes(update.id));

    let applied = 0, failed = 0;
    const appliedIds = [];

    for (const update of toApply) {
      try {
        await update.apply();
        appliedIds.push(update.id);
        applied++;
      } catch (err) {
        console.error(`Antique | Échec du correctif "${update.id}" :`, err);
        failed++;
      }
    }

    if (appliedIds.length) await markPackUpdatesApplied(appliedIds);

    const summary = `Antique – ${applied} correctif(s) appliqué(s)${failed ? `, ${failed} échec(s) (voir console)` : ""}.`;
    if (failed) ui.notifications.warn(summary);
    else ui.notifications.info(summary);

    if (getPendingPackUpdates().length) this.render(true);
    else this.close();
  }
}

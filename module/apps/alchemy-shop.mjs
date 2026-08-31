import { resolveShopTargetActors, grantItemToActor, attachBrowserRowInteractions, withRowLock } from "./browser-shared.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const ALCHIMIE_PACK_ID = "antique.alchimie";

/**
 * Add a "Boutique d'Alchimie" entry to the Alchimie compendium's right-click menu in the
 * sidebar — deliberately not a persistent button on every character sheet (see JOURNAL.md).
 * Distinct from the general Navigateur de Compendium: this one is specific to Alchimie,
 * grouped by ingredient category rather than by pack.
 *
 * Foundry v14's CompendiumDirectory fires "getCompendiumContextOptions" for its per-entry
 * context menu (see client/applications/sidebar/tabs/compendium-directory.mjs's explicit
 * `hookName: "getCompendiumContextOptions"` override) — NOT the older "getCompendiumDirectoryEntryContext"
 * that module/helpers/random-tables.mjs also (incorrectly, for this Foundry version) used to listen on.
 */
export function registerAlchemyShopContextMenu() {
  Hooks.on("getCompendiumContextOptions", (html, options) => {
    options.push({
      label: game.i18n.localize("ANTIQUE.AlchemyShop.Title"),
      icon: '<i class="fas fa-mortar-pestle"></i>',
      visible: li => {
        const packId = li instanceof HTMLElement ? li.dataset.pack : li.data?.("pack");
        return packId === ALCHIMIE_PACK_ID;
      },
      onClick: () => AntiqueAlchemyShop.open()
    });
  });
}

export class AntiqueAlchemyShop extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "antique-alchemy-shop",
    classes: ["antique", "sheet", "compendium-browser"],
    position: { width: 520, height: 640 },
    window: { title: "ANTIQUE.AlchemyShop.Title", resizable: true, icon: "fas fa-mortar-pestle" }
  };

  static PARTS = {
    main: { template: "systems/antique/templates/apps/alchemy-shop.hbs" }
  };

  /** Shared singleton so a second "Boutique d'Alchimie" click re-focuses the existing window
   *  instead of spawning a second ApplicationV2 instance with the same static id. */
  static _instance = null;

  static open() {
    AntiqueAlchemyShop._instance ??= new AntiqueAlchemyShop();
    AntiqueAlchemyShop._instance.render(true);
    return AntiqueAlchemyShop._instance;
  }

  /** @type {"name"|"priceAsc"|"priceDesc"} */
  _sortMode = "name";

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const actors = resolveShopTargetActors();
    context.targetCount = actors.length;
    context.targetNames = actors.map(a => a.name).join(", ");
    context.singleTargetGold = actors.length === 1 ? (actors[0].system.or ?? 0) : null;

    const pack = game.packs.get(ALCHIMIE_PACK_ID);
    const documents = pack ? await pack.getDocuments() : [];

    const priceOf = doc => parseFloat(doc.system.price) || 0;
    const comparator = {
      name: (a, b) => a.name.localeCompare(b.name),
      priceAsc: (a, b) => priceOf(a) - priceOf(b) || a.name.localeCompare(b.name),
      priceDesc: (a, b) => priceOf(b) - priceOf(a) || a.name.localeCompare(b.name)
    }[this._sortMode] ?? ((a, b) => a.name.localeCompare(b.name));

    context.sections = Object.entries(CONFIG.ANTIQUE.apothCategories).map(([key, cfg]) => ({
      key,
      label: game.i18n.localize(cfg.label),
      items: documents
        .filter(d => d.system.apothCategory === key)
        .sort(comparator)
        .map(d => ({
          uuid: d.uuid,
          name: d.name,
          img: d.img,
          price: d.system.price,
          description: d.system.description
        }))
    }));

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    attachBrowserRowInteractions(this);

    this.element.querySelectorAll(".shop-take").forEach(el => {
      el.addEventListener("click", ev => this._onTake(ev));
    });
    this.element.querySelectorAll(".shop-pay").forEach(el => {
      el.addEventListener("click", ev => this._onPay(ev));
    });
  }

  _onClose(options) {
    super._onClose(options);
    if (AntiqueAlchemyShop._instance === this) AntiqueAlchemyShop._instance = null;
  }

  async _onTake(event) {
    event.preventDefault();
    await withRowLock(event, async () => {
      const uuid = event.currentTarget.closest(".shop-row")?.dataset.uuid;
      const compendiumItem = uuid ? await fromUuid(uuid) : null;
      if (!compendiumItem) return;

      const actors = resolveShopTargetActors();
      if (!actors.length) {
        ui.notifications.warn(game.i18n.localize("ANTIQUE.Shop.NoTarget"));
        return;
      }

      for (const actor of actors) await grantItemToActor(actor, compendiumItem);

      if (actors.length === 1) {
        ui.notifications.info(game.i18n.format("ANTIQUE.Shop.Taken", { name: compendiumItem.name, target: actors[0].name }));
      } else {
        ui.notifications.info(game.i18n.format("ANTIQUE.Shop.TakenAll", { name: compendiumItem.name }));
      }
    });
  }

  async _onPay(event) {
    event.preventDefault();
    await withRowLock(event, async () => {
      const uuid = event.currentTarget.closest(".shop-row")?.dataset.uuid;
      const compendiumItem = uuid ? await fromUuid(uuid) : null;
      if (!compendiumItem) return;

      const actors = resolveShopTargetActors();
      if (!actors.length) {
        ui.notifications.warn(game.i18n.localize("ANTIQUE.Shop.NoTarget"));
        return;
      }

      const price = parseFloat(compendiumItem.system.price) || 0;
      let succeeded = 0;
      let singleNewGold = null;

      for (const actor of actors) {
        const gold = actor.system.or ?? 0;
        if (price > gold) continue;
        await grantItemToActor(actor, compendiumItem);
        const newGold = gold - price;
        await actor.update({ "system.or": newGold });
        succeeded++;
        if (actors.length === 1) singleNewGold = newGold;
      }

      if (actors.length === 1) {
        if (succeeded) {
          ui.notifications.info(game.i18n.format("ANTIQUE.Shop.Bought", { name: compendiumItem.name, target: actors[0].name }));
          const goldValueEl = this.element.querySelector(".shop-gold-value");
          if (goldValueEl) goldValueEl.textContent = singleNewGold;
        } else {
          ui.notifications.warn(game.i18n.format("ANTIQUE.Shop.NotEnoughGold", { name: actors[0].name }));
        }
      } else if (succeeded === actors.length) {
        ui.notifications.info(game.i18n.format("ANTIQUE.Shop.BoughtAll", { name: compendiumItem.name }));
      } else if (succeeded > 0) {
        ui.notifications.warn(game.i18n.format("ANTIQUE.Shop.FailedBuySome", { name: compendiumItem.name }));
      } else {
        ui.notifications.warn(game.i18n.format("ANTIQUE.Shop.FailedBuyAll", { name: compendiumItem.name }));
      }
    });
  }
}

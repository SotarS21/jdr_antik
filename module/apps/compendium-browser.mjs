import { resolveShopTargetActors, grantItemToActor, grantEffectToActor, attachBrowserRowInteractions, withRowLock } from "./browser-shared.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Top tabs group this system's 14 compendiums by content category rather than one tab per
 * pack — mirrors PF2e's real Compendium Browser (tabs like "Équipement"/"Sorts"/"Bestiaires"
 * aggregate several source compendiums at once, narrowed down with filters instead of one
 * tab per source). Confirmed with the user against a screenshot of the real PF2e browser.
 *
 * Each tab optionally declares how to build its filter checkboxes:
 * - `filters` + `classify(doc, packId, ctx)`: static filter list (Équipement's inventory
 *   types, Sorts' Instantané/Rituel), classify returns the matching filter key.
 * - `filterByPack: true`: filter list is derived at render time from the tab's own packs
 *   (one checkbox per source pack, labelled from `pack.metadata.label`) — used by Traits and
 *   Bestiaire, where "which compendium this came from" IS the meaningful category.
 * - `filterByFolder: true`: filter list is derived at render time from the tab's packs' own
 *   Foundry folders (one checkbox per folder, labelled from `folder.name`) — used by Historique,
 *   whose single pack is itself split into folders ("Origine" / "Bonus/Malus aléatoire").
 *
 * Any tab with at least one filter also gets a per-row "Type" column showing which filter
 * bucket that row falls into (see `showTypeColumn` in _prepareContext) — except Équipement,
 * which shows a Price column there instead (its filter categories are already visible via the
 * grouped-by-pack sections).
 */
const TABS = [
  {
    key: "equipement", label: "ANTIQUE.Browser.TabEquipement",
    packs: ["antique.armes", "antique.equipement", "antique.alchimie", "antique.tresors"],
    filters: [
      { key: "arme", label: "ANTIQUE.Browser.FilterArme" },
      { key: "arme-jet", label: "ANTIQUE.Browser.FilterArmeJet" },
      { key: "arme-distance", label: "ANTIQUE.Browser.FilterArmeDistance" },
      { key: "armure", label: "ANTIQUE.Browser.FilterArmure" },
      { key: "bouclier", label: "ANTIQUE.Browser.FilterBouclier" },
      { key: "munition", label: "ANTIQUE.Browser.FilterMunition" },
      { key: "consommable", label: "ANTIQUE.Browser.FilterConsommable" },
      { key: "tresor", label: "ANTIQUE.Browser.FilterTresor" }
    ],
    classify: (doc, packId) => classifyEquipmentItem(doc, packId)
  },
  {
    key: "traits", label: "ANTIQUE.Browser.TabTraits",
    packs: ["antique.avantages", "antique.desavantages", "antique.benedictions", "antique.avantages-divins", "antique.effets"],
    filterByPack: true
  },
  {
    key: "sorts", label: "ANTIQUE.Browser.TabSorts",
    packs: ["antique.sorts"],
    filters: [
      { key: "instant", label: "ANTIQUE.Browser.FilterSortInstant" },
      { key: "ritual", label: "ANTIQUE.Browser.FilterRituel" }
    ],
    classify: doc => doc.system?.ritual ? "ritual" : "instant"
  },
  {
    key: "bestiaire", label: "ANTIQUE.Browser.TabBestiaire",
    packs: ["antique.pnj", "antique.dieux", "antique.creatures"],
    filterByPack: true
  },
  { key: "historique", label: "ANTIQUE.Browser.TabHistorique", packs: ["antique.historique"], filterByFolder: true },
  // GM-only: these are the mechanics a GM applies to an NPC/creature, not player-facing content
  // (mirrors the NPC sheet's own isGM-gated Combat tab, see npc-sheet.mjs).
  { key: "capacites-combat", label: "ANTIQUE.Browser.TabCapacitesCombat", packs: ["antique.capacites-combat"], gmOnly: true }
];

/**
 * Classify one Équipement-tab document into a "Types d'inventaire" filter bucket.
 * - antique.armes: weapons → look up their folder ("Arme blanche"/"Arme exotique"/"Arme à deux
 *   mains" fold into the generic "arme" bucket; "Arme de jet" and "Arme à distance" get their
 *   own dedicated filters); equipment → look up its folder name ("Armure"/"Bouclier", see
 *   packs/_build-armes.js).
 * - antique.equipement: its only priced items are the 9 named Greek armor pieces → "armure".
 * - antique.alchimie: ingredients/potions → "consommable".
 * - antique.tresors: loot items (type "treasure") → "tresor".
 */
function classifyEquipmentItem(doc, packId) {
  if (packId === "antique.alchimie") return "consommable";
  if (packId === "antique.equipement") return "armure";
  if (packId === "antique.tresors") return "tresor";
  // `doc.folder` is a ForeignDocumentField: Foundry resolves it to the actual Folder document
  // (not its id string) as soon as the document is initialized — read `.name` straight off it.
  const folderName = doc.folder?.name;
  if (doc.type === "weapon") {
    if (folderName === "Arme de jet") return "arme-jet";
    if (folderName === "Arme à distance") return "arme-distance";
    return "arme";
  }
  if (folderName === "Armure") return "armure";
  if (folderName === "Bouclier") return "bouclier";
  if (folderName === "Munition") return "munition";
  return "arme";
}

/**
 * Add a button below the compendium list in the sidebar's Compendiums tab, opening the
 * general Navigateur de Compendium — distinct from the Alchimie-specific right-click shop
 * (see alchemy-shop.mjs). CompendiumDirectory has a dedicated "footer" template part
 * (templates/sidebar/directory/footer.hbs, a <footer class="directory-footer">), and its
 * generic ApplicationV2 "render" hook fires for every class in its inheritance chain —
 * i.e. "renderCompendiumDirectory" (verified in client/applications/sidebar/tabs/compendium-directory.mjs's
 * PARTS + application.mjs's #callHooks). Guarded against duplicate buttons on re-render.
 */
export function registerCompendiumBrowserFooterButton() {
  Hooks.on("renderCompendiumDirectory", (app, html) => {
    const el = html instanceof HTMLElement ? html : html[0];
    const footer = el?.querySelector(".directory-footer");
    if (!footer || footer.querySelector(".antique-compendium-browser-btn")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "antique-compendium-browser-btn";
    button.innerHTML = `<i class="fas fa-book-open" inert></i><span>${game.i18n.localize("ANTIQUE.Browser.Title")}</span>`;
    button.addEventListener("click", () => AntiqueCompendiumBrowser.open());
    footer.appendChild(button);
  });
}

export class AntiqueCompendiumBrowser extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "antique-compendium-browser",
    classes: ["antique", "sheet", "compendium-browser"],
    position: { width: 780, height: 780 },
    window: { title: "ANTIQUE.Browser.Title", resizable: true, icon: "fas fa-book-open" }
  };

  static PARTS = {
    main: { template: "systems/antique/templates/apps/compendium-browser.hbs" }
  };

  /** Shared singleton so a second click re-focuses the existing window instead of spawning
   *  a second ApplicationV2 instance with the same static id. */
  static _instance = null;

  static open() {
    AntiqueCompendiumBrowser._instance ??= new AntiqueCompendiumBrowser();
    AntiqueCompendiumBrowser._instance.render(true);
    return AntiqueCompendiumBrowser._instance;
  }

  /** @type {"name"|"priceAsc"|"priceDesc"} */
  _sortMode = "name";

  /** Persists which top tab is showing across re-renders (mirrors the actor/item sheets'
   *  own manual _activeTab pattern in this codebase). */
  _activeTab = "equipement";

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const actors = resolveShopTargetActors();
    context.targetCount = actors.length;
    context.targetNames = actors.map(a => a.name).join(", ");
    context.singleTargetGold = actors.length === 1 ? (actors[0].system.or ?? 0) : null;

    const priceOf = doc => parseFloat(doc.system?.price) || 0;
    const comparator = {
      name: (a, b) => a.name.localeCompare(b.name),
      priceAsc: (a, b) => priceOf(a) - priceOf(b) || a.name.localeCompare(b.name),
      priceDesc: (a, b) => priceOf(b) - priceOf(a) || a.name.localeCompare(b.name)
    }[this._sortMode] ?? ((a, b) => a.name.localeCompare(b.name));

    const tabs = [];
    for (const tabDef of TABS) {
      if (tabDef.gmOnly && !game.user.isGM) continue;
      const tab = { key: tabDef.key, label: game.i18n.localize(tabDef.label), active: tabDef.key === this._activeTab, sections: [] };
      const isEquipmentTab = tabDef.key === "equipement";

      tab.filters = tabDef.filters
        ? tabDef.filters.map(f => ({ key: f.key, label: game.i18n.localize(f.label) }))
        : tabDef.filterByPack
          ? tabDef.packs.map(packId => {
              const pack = game.packs.get(packId);
              return pack ? { key: packId, label: pack.metadata.label } : null;
            }).filter(Boolean)
          : tabDef.filterByFolder
            ? tabDef.packs.flatMap(packId => {
                const pack = game.packs.get(packId);
                if (!pack) return [];
                return [...pack.folders].map(folder => ({ key: folder.id, label: folder.name }));
              })
            : [];
      // Reused by the per-row "Type" column (see showTypeColumn below) to turn item.filterKind
      // into its display label, without recomputing it separately from the filter list.
      tab.filterLabels = Object.fromEntries(tab.filters.map(f => [f.key, f.label]));
      // Équipement shows a Price column instead — its filter categories are already visible via
      // the sections grouped by source pack, a Type column there would be redundant.
      tab.showTypeColumn = tab.filters.length > 0 && !isEquipmentTab;
      tab.itemColumns = tab.filters.length ? 4 : 3;

      for (const packId of tabDef.packs) {
        const pack = game.packs.get(packId);
        if (!pack) continue;
        const documents = await pack.getDocuments();

        const classify = tabDef.classify
          ? doc => tabDef.classify(doc, packId)
          : tabDef.filterByPack
            ? () => packId
            : tabDef.filterByFolder
              // `doc.folder` resolves to the actual Folder document (ForeignDocumentField),
              // not its id — read `.id` off it to match the filter checkboxes' `folder.id` keys.
              ? doc => doc.folder?.id ?? null
              : null;

        if (pack.documentName === "Item") {
          const priced = isEquipmentTab ? documents.filter(d => d.system?.price) : documents;
          tab.sections.push({
            key: packId,
            kind: "item",
            dragType: "Item",
            label: pack.metadata.label,
            items: priced
              .sort(comparator)
              .map(d => ({
                uuid: d.uuid,
                name: d.name,
                img: d.img,
                price: d.system.price || "",
                hasPrice: !!d.system.price,
                filterKind: classify ? classify(d) : null,
                description: d.system.description
              }))
          });
        } else if (pack.documentName === "ActiveEffect") {
          // Effets library: no price/quantity concept, so price/hasPrice are always empty/false
          // (the row's Take button still works — see _onTake's ActiveEffect branch).
          tab.sections.push({
            key: packId,
            kind: "item",
            dragType: "ActiveEffect",
            label: pack.metadata.label,
            items: documents
              .sort(comparator)
              .map(d => ({
                uuid: d.uuid,
                name: d.name,
                img: d.img,
                price: "",
                hasPrice: false,
                filterKind: classify ? classify(d) : null,
                description: d.description
              }))
          });
        } else if (pack.documentName === "Actor") {
          tab.sections.push({
            key: packId,
            kind: "actor",
            dragType: "Actor",
            label: pack.metadata.label,
            items: documents
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(d => ({ uuid: d.uuid, name: d.name, img: d.img, filterKind: classify ? classify(d) : null }))
          });
        } else if (pack.documentName === "RollTable") {
          tab.sections.push({
            key: packId,
            kind: "rolltable",
            dragType: "RollTable",
            label: pack.metadata.label,
            items: documents
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(d => ({ uuid: d.uuid, name: d.name, img: d.img, filterKind: classify ? classify(d) : null }))
          });
        }
      }
      tabs.push(tab);
    }
    context.tabs = tabs;

    return context;
  }

  /** All 5 tabs' content is rendered into the DOM at once (_prepareContext builds every tab,
   *  not just the active one) — switching tabs is a pure class toggle, no re-fetch needed. */
  _activateTab(tabKey) {
    this.element.querySelectorAll(".compendium-browser-tabs .item[data-tab]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabKey);
    });
    this.element.querySelectorAll(".compendium-browser-body .tab[data-tab]").forEach(panel => {
      panel.classList.toggle("active", panel.dataset.tab === tabKey);
    });
  }

  _onRender(context, options) {
    super._onRender(context, options);
    attachBrowserRowInteractions(this);

    this._activateTab(this._activeTab);
    this.element.querySelectorAll(".compendium-browser-tabs .item[data-tab]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.preventDefault();
        this._activeTab = btn.dataset.tab;
        this._activateTab(this._activeTab);
      });
    });

    this.element.querySelectorAll(".compendium-browser-body .tab[data-tab]").forEach(panel => {
      const filterBoxes = panel.querySelectorAll(".browser-filter-checkbox");
      if (!filterBoxes.length) return;
      const applyFilters = () => {
        const checked = [...filterBoxes].filter(b => b.checked).map(b => b.value);
        panel.querySelectorAll(".shop-row[data-filter-kind]").forEach(row => {
          const match = !checked.length || checked.includes(row.dataset.filterKind);
          row.style.display = match ? "" : "none";
          const descRow = row.nextElementSibling;
          if (descRow?.classList.contains("equip-desc-row") && !match) descRow.style.display = "none";
        });
      };
      filterBoxes.forEach(box => box.addEventListener("change", applyFilters));
      panel.querySelector(".browser-clear-filters")?.addEventListener("click", () => {
        filterBoxes.forEach(box => { box.checked = false; });
        applyFilters();
      });
    });

    this.element.querySelectorAll(".shop-take").forEach(el => {
      el.addEventListener("click", ev => this._onTake(ev));
    });
    this.element.querySelectorAll(".shop-pay").forEach(el => {
      el.addEventListener("click", ev => this._onPay(ev));
    });
    this.element.querySelectorAll(".shop-import").forEach(el => {
      el.addEventListener("click", ev => this._onImport(ev));
    });
    this.element.querySelectorAll(".shop-draw").forEach(el => {
      el.addEventListener("click", ev => this._onDraw(ev));
    });
  }

  _onClose(options) {
    super._onClose(options);
    if (AntiqueCompendiumBrowser._instance === this) AntiqueCompendiumBrowser._instance = null;
  }

  async _onTake(event) {
    event.preventDefault();
    await withRowLock(event, async () => {
      const uuid = event.currentTarget.closest(".shop-row")?.dataset.uuid;
      const compendiumDoc = uuid ? await fromUuid(uuid) : null;
      if (!compendiumDoc) return;

      const actors = resolveShopTargetActors();
      if (!actors.length) {
        ui.notifications.warn(game.i18n.localize("ANTIQUE.Shop.NoTarget"));
        return;
      }

      const grant = compendiumDoc.documentName === "ActiveEffect" ? grantEffectToActor : grantItemToActor;
      for (const actor of actors) await grant(actor, compendiumDoc);

      if (actors.length === 1) {
        ui.notifications.info(game.i18n.format("ANTIQUE.Shop.Taken", { name: compendiumDoc.name, target: actors[0].name }));
      } else {
        ui.notifications.info(game.i18n.format("ANTIQUE.Shop.TakenAll", { name: compendiumDoc.name }));
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

  async _onImport(event) {
    event.preventDefault();
    await withRowLock(event, async () => {
      const uuid = event.currentTarget.closest(".shop-row")?.dataset.uuid;
      const doc = uuid ? await fromUuid(uuid) : null;
      if (!doc?.pack) return;
      const pack = game.packs.get(doc.pack);
      const imported = await game.actors.importFromCompendium(pack, doc.id);
      ui.notifications.info(game.i18n.format("ANTIQUE.Browser.Imported", { name: imported.name }));
    });
  }

  async _onDraw(event) {
    event.preventDefault();
    await withRowLock(event, async () => {
      const uuid = event.currentTarget.closest(".shop-row")?.dataset.uuid;
      const table = uuid ? await fromUuid(uuid) : null;
      await table?.draw();
    });
  }
}

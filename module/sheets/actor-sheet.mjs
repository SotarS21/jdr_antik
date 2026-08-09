import { isOrphanedTokenActor } from "../helpers/actor-utils.mjs";
import { captureFocusState, restoreFocusState, preventEnterSubmit } from "../helpers/sheet-utils.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

const BACKGROUND_GROUPS_KEY = {
  alliesList: "alliesGroups",
  ennemisList: "ennemisGroups"
};

export class AntiqueActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "character"],
    position: { width: 800, height: 900 },
    window: { resizable: true },
    tabs: [],
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/character-sheet.hbs"
    }
  };

  async _processSubmitData(event, form, formData) {
    if (isOrphanedTokenActor(this.actor)) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Errors.OrphanedTokenSheet"));
      return this.close();
    }
    const focusState = captureFocusState(this.element);
    await super._processSubmitData(event, form, formData);
    await this.render({ force: true });
    restoreFocusState(this.element, focusState);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.actor = this.actor;
    context.system = system;
    context.config = CONFIG.ANTIQUE;
    context.isEditable = this.isEditable;

    context.abilityLabels = {};
    for (const [key, locKey] of Object.entries(CONFIG.ANTIQUE.abilities)) {
      context.abilityLabels[key] = game.i18n.localize(locKey);
    }

    const sign = n => (n >= 0 ? `+${n}` : `${n}`);

    context.caTooltip = `${game.i18n.localize("ANTIQUE.Combat.CABase")} ${system.ca.base} `
      + `${sign(system.ca.armure)} ${game.i18n.localize("ANTIQUE.Combat.Armure")} `
      + `${sign(system.ca.bouclier)} ${game.i18n.localize("ANTIQUE.Combat.Bouclier")} `
      + `${sign(system.ca.bonusVigueur)} ${game.i18n.localize("ANTIQUE.Combat.BonusVigueur")} `
      + `${sign(system.ca.conMod)} ${game.i18n.localize("ANTIQUE.Combat.ModCON")} `
      + `${sign(system.ca.temp)} ${game.i18n.localize("ANTIQUE.Combat.Temp")} `
      + `${sign(system.ca.equipmentBonus)} ${game.i18n.localize("ANTIQUE.Equipment.CaBonus")} = ${sign(system.ca.total)}`;

    context.savesData = {};
    for (const [key, cfg] of Object.entries(CONFIG.ANTIQUE.saves)) {
      const s = system.saves[key];
      const [ab1, ab2] = cfg.abilities;
      const base = s?.base ?? 0;
      const mod1 = s?.mod1 ?? 0;
      const mod2 = s?.mod2 ?? 0;
      const bonus = s?.bonus ?? 0;
      const temp = s?.temp ?? 0;
      const total = s?.total ?? 0;
      context.savesData[key] = {
        key,
        label: game.i18n.localize(cfg.label),
        base,
        bonus,
        temp,
        modSum: s?.modSum ?? 0,
        total,
        tooltip: `${game.i18n.localize("ANTIQUE.Saves.Base")} ${base} ${sign(mod1)} ${context.abilityLabels[ab1]} `
          + `${sign(mod2)} ${context.abilityLabels[ab2]} ${sign(bonus)} ${game.i18n.localize("ANTIQUE.Saves.Bonus")} `
          + `${sign(temp)} ${game.i18n.localize("ANTIQUE.Saves.Temp")} = ${sign(total)}`
      };
    }

    context.weaponCatsData = {};
    for (const [key, cfg] of Object.entries(CONFIG.ANTIQUE.weaponCategories)) {
      const a = system.attackBonuses[key];
      context.weaponCatsData[key] = {
        key,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon ?? "",
        abilityLabel: context.abilityLabels[cfg.ability] ?? cfg.ability,
        abilityMod: a?.abilityMod ?? 0,
        trained: a?.trained ?? false,
        skillBonus: a?.skillBonus ?? 0,
        total: a?.total ?? 0
      };
    }

    const favoriteSet = new Set(system.favoriteSkills ?? []);
    context.skillsByAbility = {};
    for (const [ab, abSkills] of Object.entries(CONFIG.ANTIQUE.skillsByAbility)) {
      context.skillsByAbility[ab] = {};
      for (const [key, cfg] of Object.entries(abSkills)) {
        const sk = system.skills[key];
        context.skillsByAbility[ab][key] = {
          key,
          labelLocalized: game.i18n.localize(cfg.label),
          icon: cfg.icon ?? "",
          trained: sk?.trained ?? false,
          bonus: sk?.bonus ?? 0,
          mod: sk?.mod ?? 0,
          total: sk?.total ?? 0,
          isFavorite: favoriteSet.has(key)
        };
      }
    }

    context.favoriteSkills = (system.favoriteSkills ?? []).map(key => {
      const cfg = CONFIG.ANTIQUE.skills[key];
      const sk = system.skills[key];
      if (!cfg || !sk) return null;
      return {
        key,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon ?? "",
        total: sk.total ?? 0
      };
    }).filter(Boolean);

    context.weapons = this.actor.items.filter(i => i.type === "weapon").map(w => {
      const linkedAmmo = w.system.linkedAmmoId
        ? this.actor.items.get(w.system.linkedAmmoId)
        : null;
      return {
        id: w.id,
        name: w.name,
        img: w.img,
        system: w.system,
        attTotal: w.system.attBonus + (system.attackBonuses[w.system.category]?.total ?? 0),
        attTotalDistance: w.system.attBonusDistance + (system.attackBonuses[w.system.categoryDistance]?.total ?? 0),
        linkedAmmoName: linkedAmmo?.name ?? null,
        linkedAmmoQty: linkedAmmo?.system.quantity ?? null
      };
    });
    context.equipment = this.actor.items.filter(i => i.type === "equipment");

    // --- Unified inventory list (weapons + equipment) shown in the Inventory tab ---
    context.inventoryItems = [
      ...this.actor.items.filter(i => i.type === "weapon").map(i => ({ item: i, kind: "weapon" })),
      ...this.actor.items.filter(i => i.type === "equipment").map(i => ({ item: i, kind: "equipment" }))
    ]
      .sort((a, b) => a.item.name.localeCompare(b.item.name))
      .map(({ item, kind }) => {
        const slotCfg = CONFIG.ANTIQUE.equipmentSlots[item.system.slot];
        return {
          id: item.id,
          kind,
          name: item.name,
          img: item.img,
          system: item.system,
          hasSlot: !!slotCfg,
          slotLabel: slotCfg ? game.i18n.localize(slotCfg.label) : ""
        };
      });

    // --- Equipment silhouette (worn items by slot) ---
    context.slotsData = Object.entries(CONFIG.ANTIQUE.equipmentSlots).map(([key, cfg]) => {
      const item = system.equippedSlots?.[key];
      let bonusLabel = "";
      if (item) {
        if (item.type === "weapon") bonusLabel = sign(item.system.attBonus ?? 0);
        else if ((item.system.caBonus ?? 0) !== 0) bonusLabel = `${sign(item.system.caBonus)} CA`;
        else if (item.system.linkedSkill && (item.system.skillBonus ?? 0) !== 0) {
          const skillLabel = game.i18n.localize(CONFIG.ANTIQUE.skills[item.system.linkedSkill]?.label ?? item.system.linkedSkill);
          bonusLabel = `${sign(item.system.skillBonus)} ${skillLabel}`;
        }
      }
      return {
        key,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon,
        item: item ? { id: item.id, name: item.name, img: item.img } : null,
        bonusLabel
      };
    });

    // --- Apothicaire tab: equipment items tagged with an apothCategory ---
    const apothItems = this.actor.items
      .filter(i => i.type === "equipment" && i.system.apothCategory)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(i => ({ id: i.id, name: i.name, img: i.img, system: i.system }));
    context.apothSections = Object.entries(CONFIG.ANTIQUE.apothCategories).map(([key, cfg]) => ({
      key,
      isPotion: key === "potion",
      label: game.i18n.localize(cfg.label),
      items: apothItems.filter(i => i.system.apothCategory === key)
    }));

    context.advantages = this._prepareTraitItems("advantage");
    context.disadvantages = this._prepareTraitItems("disadvantage");
    context.curses = this._prepareTraitItems("curse");
    context.blessings = this._prepareTraitItems("blessing");
    context.spells = this._prepareSpellItems();
    context.instantSpells = context.spells.filter(s => !s.ritual);
    context.ritualSpells = context.spells.filter(s => s.ritual);
    context.effects = this._prepareEffectItems();

    const advTotal = context.advantages.reduce((sum, t) => sum + (t.cout ?? 0), 0);
    const disTotal = context.disadvantages.reduce((sum, t) => sum + (t.cout ?? 0), 0);
    context.traitBalance = advTotal + disTotal;
    context.traitBalanced = context.traitBalance === 0;

    context.hasTraits = context.advantages.length > 0 || context.disadvantages.length > 0;
    context.hasBothTraits = context.advantages.length > 0 && context.disadvantages.length > 0;

    const resolvedAllies = await this._resolveActorRefs(system.background.alliesList ?? []);
    const resolvedEnemies = await this._resolveActorRefs(system.background.ennemisList ?? []);
    context.alliesGrouped = this._organizeByGroups(resolvedAllies, system.background.alliesGroups ?? [], system.background.alliesList ?? []);
    context.ennemisGrouped = this._organizeByGroups(resolvedEnemies, system.background.ennemisGroups ?? [], system.background.ennemisList ?? []);
    context.alliesList = resolvedAllies;
    context.ennemisList = resolvedEnemies;

    // Croyance/Aime/N'aime pas/Expressions: shown as a read-only preview with
    // an edit button that opens a small popup — never sitting open for editing.
    const enrich = html => foundry.applications.ux.TextEditor.implementation.enrichHTML(html ?? "");
    context.enrichedCroyance = await enrich(system.background.croyance);
    context.enrichedAime = await enrich(system.background.aime);
    context.enrichedNaimePas = await enrich(system.background.naimePas);
    context.enrichedExpressions = await enrich(system.background.expressions);

    return context;
  }

  _activateTab(tabName) {
    this.element.querySelectorAll(".sheet-tabs .item[data-tab]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    this.element.querySelectorAll(".sheet-body .tab[data-tab]").forEach(panel => {
      panel.classList.toggle("active", panel.dataset.tab === tabName);
    });
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // Prevent the browser's default "mouse wheel over a focused number input
    // changes its value" behavior — this silently mutates whichever numeric
    // field last had focus (e.g. CA Temp) when the user scrolls the sheet,
    // and that stray change only becomes visible on the next unrelated submit.
    this.element.querySelectorAll('input[type="number"]').forEach(el => {
      el.addEventListener("wheel", ev => ev.preventDefault(), { passive: false });
    });
    preventEnterSubmit(this.element);

    // Manual tab management
    if (!this._activeTab) this._activeTab = "identity";
    this._activateTab(this._activeTab);
    this.element.querySelectorAll(".sheet-tabs .item[data-tab]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.preventDefault();
        this._activeTab = btn.dataset.tab;
        this._activateTab(this._activeTab);
      });
    });

    if (!this.isEditable) return;

    this.element.querySelectorAll(".ability-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollAbility(ev.currentTarget.dataset.ability));
    });

    this.element.querySelectorAll(".skill-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollSkill(ev.currentTarget.dataset.skill));
    });

    this.element.querySelectorAll(".skill-trained").forEach(el => {
      el.addEventListener("click", ev => {
        const key = ev.currentTarget.dataset.skill;
        const current = this.actor.system.skills[key]?.trained ?? false;
        const newTrained = !current;
        ev.currentTarget.closest(".skill-row")?.classList.toggle("trained", newTrained);
        this.actor.update({ [`system.skills.${key}.trained`]: newTrained })
          .then(() => this.render({ force: true }));
      });
    });


    this.element.querySelectorAll(".save-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollSave(ev.currentTarget.dataset.save));
    });

    this.element.querySelectorAll(".initiative-roll").forEach(el => {
      el.addEventListener("click", () => this.actor.rollInitiativeAntique());
    });

    this.element.querySelectorAll(".long-rest").forEach(el => {
      el.addEventListener("click", () => this.actor.longRest().then(() => this.render({ force: true })));
    });

    this.element.querySelectorAll(".avantage-temp-badge").forEach(el => {
      el.addEventListener("click", () => {
        this.actor.update({ "system.avantageTemporaire": !this.actor.system.avantageTemporaire })
          .then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".header-trait-icon").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const name = el.dataset.tooltipName;
        const effect = el.dataset.tooltipEffect;
        const text = effect ? `${name} — ${effect}` : name;
        game.tooltip.activate(el, { text, cssClass: "antique-trait-tooltip" });
      });
      el.addEventListener("mouseleave", () => game.tooltip.deactivate());
      el.addEventListener("click", ev => {
        const itemId = ev.currentTarget.dataset.itemId;
        this.element.querySelector('.sheet-tabs [data-tab="traits"]')?.click();
        setTimeout(() => {
          const row = this.element.querySelector(`.tab[data-tab="traits"] .item[data-item-id="${itemId}"]`);
          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
            row.classList.add("trait-highlight");
            setTimeout(() => row.classList.remove("trait-highlight"), 1500);
          }
        }, 50);
      });
    });

    this.element.querySelectorAll(".effect-active-toggle").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.update({ "system.active": !item.system.active }).then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".item-create").forEach(el => {
      el.addEventListener("click", this._onItemCreate.bind(this));
    });

    this.element.querySelectorAll(".item-edit").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.sheet.render({force: true});
      });
    });

    this.element.querySelectorAll(".item-delete").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.delete().then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".item-equip-btn").forEach(el => {
      el.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const li = ev.currentTarget.closest("[data-item-id]");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.update({ "system.equipped": !item.system.equipped }).then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".equip-slot.filled").forEach(el => {
      el.addEventListener("click", ev => {
        if (ev.target.closest(".equip-slot-unequip")) return;
        const item = this.actor.items.get(el.dataset.itemId);
        if (item) item.sheet.render({ force: true });
      });
    });

    this.element.querySelectorAll(".equip-slot").forEach(el => {
      el.addEventListener("dragenter", () => el.classList.add("drag-over"));
      el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
      el.addEventListener("drop", () => el.classList.remove("drag-over"));
    });

    this.element.querySelectorAll(".equip-slot-unequip").forEach(el => {
      el.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const item = this.actor.items.get(el.closest("[data-item-id]").dataset.itemId);
        if (item) item.update({ "system.equipped": false }).then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".trait-row").forEach(el => {
      el.addEventListener("click", ev => {
        if (ev.target.closest("a, input, button")) return;
        el.classList.toggle("expanded");
      });
    });

    this.element.querySelectorAll(".actor-ref-group-toggle").forEach(el => {
      el.addEventListener("click", ev => {
        ev.preventDefault();
        el.closest(".actor-ref-group")?.classList.toggle("collapsed");
      });
    });

    this.element.querySelectorAll(".bg-text-edit").forEach(el => {
      el.addEventListener("click", ev => {
        ev.preventDefault();
        this._onEditBackgroundText(ev.currentTarget.dataset.field, ev.currentTarget.dataset.title);
      });
    });

    this.element.querySelectorAll(".attack-cat-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollAttackCategory(ev.currentTarget.dataset.cat));
    });

    this.element.querySelectorAll(".weapon-attack").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.rollAttack();
      });
    });

    this.element.querySelectorAll(".weapon-damage").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.rollDamage();
      });
    });

    this.element.querySelectorAll(".equip-toggle").forEach(el => {
      el.addEventListener("click", ev => {
        ev.preventDefault();
        const toggle = ev.currentTarget;
        const row = toggle.closest("tr.equip-row");
        const descRow = row?.nextElementSibling;
        toggle.classList.toggle("open");
        if (descRow) {
          const isVisible = window.getComputedStyle(descRow).display !== "none";
          descRow.style.display = isVisible ? "none" : "";
        }
      });
    });

    this.element.querySelectorAll(".spell-cast-btn").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.castSpell();
      });
    });

    this.element.querySelectorAll(".spell-chat").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.postToChat();
      });
    });

    this.element.querySelectorAll(".item-chat").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.postToChat();
      });
    });

    this.element.querySelectorAll(".item-consume").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.consume();
      });
    });

    this.element.querySelectorAll(".actor-ref-remove").forEach(el => {
      el.addEventListener("click", ev => {
        const card = ev.currentTarget.closest(".actor-ref-card");
        const uuid = card.dataset.uuid;
        const list = card.dataset.list;
        const current = foundry.utils.deepClone(this.actor.system.background[list] ?? []);
        this.actor.update({ [`system.background.${list}`]: current.filter(ref => ref.uuid !== uuid) })
          .then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".actor-ref-card .actor-ref-name").forEach(el => {
      el.addEventListener("click", async ev => {
        const uuid = ev.currentTarget.closest(".actor-ref-card").dataset.uuid;
        let actor = null;
        try { actor = await fromUuid(uuid); } catch { /* manual entry, not a real document UUID */ }
        if (actor?.sheet) actor.sheet.render({force: true});
      });
    });

    this.element.querySelectorAll(".actor-ref-create").forEach(el => {
      el.addEventListener("click", ev => {
        this._onCreateManualRef(ev.currentTarget.dataset.list);
      });
    });

    this.element.querySelectorAll(".group-create").forEach(el => {
      el.addEventListener("click", ev => {
        const listKey = ev.currentTarget.dataset.list;
        const groupsKey = BACKGROUND_GROUPS_KEY[listKey];
        const current = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        current.push({
          id: foundry.utils.randomID(),
          name: game.i18n.localize("ANTIQUE.Background.NewGroup"),
          color: "#c9a227"
        });
        this.actor.update({ [`system.background.${groupsKey}`]: current }).then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".group-delete").forEach(el => {
      el.addEventListener("click", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = BACKGROUND_GROUPS_KEY[listKey];
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const refs = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
        for (const ref of refs) {
          if (ref.groupId === groupId) ref.groupId = "";
        }
        this.actor.update({
          [`system.background.${groupsKey}`]: groups.filter(g => g.id !== groupId),
          [`system.background.${listKey}`]: refs
        }).then(() => this.render({ force: true }));
      });
    });

    this.element.querySelectorAll(".group-name-input").forEach(el => {
      el.addEventListener("change", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = BACKGROUND_GROUPS_KEY[listKey];
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const group = groups.find(g => g.id === groupId);
        if (group) {
          group.name = ev.currentTarget.value.trim() || game.i18n.localize("ANTIQUE.Background.NewGroup");
          this.actor.update({ [`system.background.${groupsKey}`]: groups }).then(() => this.render({ force: true }));
        }
      });
    });

    this.element.querySelectorAll(".group-color-input").forEach(el => {
      el.addEventListener("change", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = BACKGROUND_GROUPS_KEY[listKey];
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const group = groups.find(g => g.id === groupId);
        if (group) {
          group.color = ev.currentTarget.value;
          this.actor.update({ [`system.background.${groupsKey}`]: groups }).then(() => this.render({ force: true }));
        }
      });
    });

    this.element.querySelectorAll(".favorite-chip").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollSkill(ev.currentTarget.dataset.skill));
    });

    this.element.querySelectorAll(".favorite-chip-remove").forEach(el => {
      el.addEventListener("click", ev => {
        ev.stopPropagation();
        const skillKey = ev.currentTarget.closest(".favorite-chip").dataset.skill;
        this.actor.update({ "system.favoriteSkills": (this.actor.system.favoriteSkills ?? []).filter(k => k !== skillKey) })
          .then(() => this.render({ force: true }));
      });
    });
  }

  _onFirstRender(context, options) {
    new foundry.applications.ux.ContextMenu(this.element, ".actor-ref-card", [
      {
        label: game.i18n.localize("ANTIQUE.Background.AddComment"),
        icon: '<i class="fas fa-comment"></i>',
        onClick: (event, li) => this._onEditActorRefComment(li.dataset.uuid, li.dataset.list)
      },
      {
        label: game.i18n.localize("ANTIQUE.Background.MoveToGroup"),
        icon: '<i class="fas fa-object-group"></i>',
        onClick: (event, li) => this._onMoveActorToGroup(li.dataset.uuid, li.dataset.list)
      }
    ], { jQuery: false });

    new foundry.applications.ux.ContextMenu(this.element, ".skill-row", [
      {
        label: game.i18n.localize("ANTIQUE.Favorites.Add"),
        icon: '<i class="fas fa-star"></i>',
        visible: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          return !!key && !(this.actor.system.favoriteSkills ?? []).includes(key);
        },
        onClick: (event, li) => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          if (!key) return;
          const current = [...(this.actor.system.favoriteSkills ?? [])];
          if (!current.includes(key)) {
            current.push(key);
            this.actor.update({ "system.favoriteSkills": current })
              .then(() => this.render({ force: true }));
          }
        }
      },
      {
        label: game.i18n.localize("ANTIQUE.Favorites.Remove"),
        icon: '<i class="fas fa-star-half-alt"></i>',
        visible: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          return !!key && (this.actor.system.favoriteSkills ?? []).includes(key);
        },
        onClick: (event, li) => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          if (!key) return;
          this.actor.update({ "system.favoriteSkills": (this.actor.system.favoriteSkills ?? []).filter(k => k !== key) })
            .then(() => this.render({ force: true }));
        }
      }
    ], { jQuery: false });

    const slotMenuItems = Object.entries(CONFIG.ANTIQUE.equipmentSlots).map(([key, cfg]) => ({
      label: game.i18n.localize(cfg.label),
      icon: `<i class="${cfg.icon}"></i>`,
      visible: li => cfg.types.includes(li.dataset.kind),
      onClick: (event, li) => {
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.update({ "system.slot": key, "system.equipped": true }).then(() => this.render({ force: true }));
      }
    }));
    // fixed:true bypasses the equipment table's overflow-x:auto clipping (the menu can have
    // up to 9 entries, one per slot — the default injected/absolute-positioned menu gets cut
    // off inside the scrollable table container).
    new foundry.applications.ux.ContextMenu(this.element, ".item-equip-picker", slotMenuItems, { jQuery: false, eventName: "click", fixed: true });
  }

  _prepareTraitItems(type) {
    return this.actor.items.filter(i => i.type === type).map(item => {
      const effectLabels = [];
      for (const effect of item.effects) {
        if (effect.disabled) continue;
        for (const change of effect.changes) {
          effectLabels.push(CONFIG.ANTIQUE.getEffectChangeLabel(change));
        }
      }
      return {
        id: item.id,
        name: item.name,
        img: item.img,
        cout: item.system.cout,
        effect: item.system.effect,
        system: item.system,
        effectsSummary: effectLabels.join(", "),
        hasEffects: effectLabels.length > 0
      };
    });
  }

  _prepareSpellItems() {
    return this.actor.items.filter(i => i.type === "spell").map(item => ({
      id: item.id,
      name: item.name,
      img: item.img,
      effect: item.system.effect,
      cost: item.system.cost,
      ritual: item.system.ritual,
      costText: item.system.costText,
      limitation: item.system.limitation,
      limitationValue: item.system.limitationValue,
      range: item.system.range,
      duration: item.system.duration,
      system: item.system
    }));
  }

  _prepareEffectItems() {
    return this.actor.items.filter(i => i.type === "effect").map(item => ({
      id: item.id,
      name: item.name,
      img: item.img,
      duration: item.system.duration,
      active: item.system.active,
      system: item.system
    }));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const name = game.i18n.format("ANTIQUE.Item.New", {
      type: game.i18n.localize(`ANTIQUE.ItemType.${type.charAt(0).toUpperCase() + type.slice(1)}`)
    });
    // The "+" button in the Rituel section pre-checks system.ritual so a new spell
    // created from there doesn't need a manual toggle right after creation. Same idea
    // for the Apothicaire tab's per-category "+" buttons and system.apothCategory.
    const system = {};
    if (event.currentTarget.dataset.ritual === "true") system.ritual = true;
    if (event.currentTarget.dataset.apothCategory) system.apothCategory = event.currentTarget.dataset.apothCategory;
    const created = await this.actor.createEmbeddedDocuments("Item", [{ name, type, system }]);
    this.render({ force: true });
    return created;
  }

  async _onDropItem(event, item) {
    const slotEl = event.target.closest(".equip-slot");
    if (slotEl && item.parent?.uuid === this.actor.uuid) {
      const slotKey = slotEl.dataset.slot;
      const slotCfg = CONFIG.ANTIQUE.equipmentSlots[slotKey];
      if (!slotCfg?.types.includes(item.type)) {
        ui.notifications.warn(game.i18n.localize("ANTIQUE.Equipment.DropWrongType"));
        return null;
      }
      await item.update({ "system.slot": slotKey, "system.equipped": true });
      this.render({ force: true });
      return item;
    }
    const result = await super._onDropItem(event, item);
    this.render({ force: true });
    return result;
  }

  async _onDropActor(event, data) {
    if (!this.isEditable) return;

    const dropTarget = event.target.closest("[data-drop-target]");
    if (!dropTarget) return super._onDropActor(event, data);

    const listKey = dropTarget.dataset.dropTarget;
    if (!BACKGROUND_GROUPS_KEY[listKey]) {
      return super._onDropActor(event, data);
    }

    const actor = await fromUuid(data.uuid);
    if (!actor) return;

    if (actor.uuid === this.actor.uuid) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Background.DropSelf"));
      return;
    }

    const current = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
    const groupId = event.target.closest("[data-group-id]")?.dataset.groupId ?? "";

    const existingIndex = current.findIndex(ref => ref.uuid === data.uuid);
    if (existingIndex >= 0) {
      current[existingIndex].groupId = groupId;
    } else {
      current.push({ uuid: data.uuid, name: actor.name, groupId });
    }

    await this.actor.update({ [`system.background.${listKey}`]: current });
    this.render({ force: true });
  }

  async _onEditActorRefComment(uuid, listKey) {
    const current = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
    const ref = current.find(r => r.uuid === uuid);
    if (!ref) return;

    const content = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("ANTIQUE.Background.CommentLabel")}</label>
          <textarea name="comment" rows="3" style="width:100%">${ref.comment ?? ""}</textarea>
        </div>
      </form>`;

    await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("ANTIQUE.Background.AddComment") },
      content,
      buttons: [
        {
          action: "save",
          icon: "fas fa-check",
          label: game.i18n.localize("ANTIQUE.Background.CommentSave"),
          default: true,
          callback: (event, button, dialog) => {
            ref.comment = dialog.element.querySelector('[name="comment"]').value.trim();
            this.actor.update({ [`system.background.${listKey}`]: current }).then(() => this.render({ force: true }));
          }
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: game.i18n.localize("ANTIQUE.Background.CommentCancel")
        }
      ]
    });
  }

  /**
   * Open a small popup with a rich text editor to edit one of the background
   * narrative fields (Croyance, Aime, N'aime pas, Expressions). These fields
   * are shown as a read-only preview on the sheet and are never left open for
   * editing inline.
   * @param {string} fieldKey - Key under system.background (e.g. "croyance")
   * @param {string} titleKey - Localization key for the dialog title
   */
  async _onEditBackgroundText(fieldKey, titleKey) {
    const path = `system.background.${fieldKey}`;
    const current = this.actor.system.background[fieldKey] ?? "";

    await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize(titleKey) },
      content: '<div class="bg-edit-dialog-content"></div>',
      position: { width: 500, height: 400 },
      render: (event, dialog) => {
        const container = dialog.element.querySelector(".bg-edit-dialog-content");
        const pm = document.createElement("prose-mirror");
        pm.value = current;
        container.append(pm);
      },
      buttons: [
        {
          action: "save",
          icon: "fas fa-check",
          label: game.i18n.localize("ANTIQUE.Background.CommentSave"),
          default: true,
          callback: async (event, button, dialog) => {
            const pm = dialog.element.querySelector("prose-mirror");
            pm.save();
            await this.actor.update({ [path]: pm.value });
            this.render({ force: true });
          }
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: game.i18n.localize("ANTIQUE.Background.CommentCancel")
        }
      ]
    });
  }

  /**
   * Prompt for a name and add a manual (non-actor) entry to an Allies/Ennemis
   * list — a placeholder name you can still comment on and file into a group,
   * for entities that don't have an actual Actor document.
   */
  async _onCreateManualRef(listKey) {
    const content = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("ANTIQUE.Background.ManualName")}</label>
          <input type="text" name="name" style="width:100%" />
        </div>
      </form>`;

    await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("ANTIQUE.Background.AddManual") },
      content,
      buttons: [
        {
          action: "save",
          icon: "fas fa-check",
          label: game.i18n.localize("ANTIQUE.Background.CommentSave"),
          default: true,
          callback: async (event, button, dialog) => {
            const name = dialog.element.querySelector('[name="name"]').value.trim();
            if (!name) return;
            const current = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
            current.push({ uuid: `manual-${foundry.utils.randomID()}`, name, comment: "", groupId: "" });
            await this.actor.update({ [`system.background.${listKey}`]: current });
            this.render({ force: true });
          }
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: game.i18n.localize("ANTIQUE.Background.CommentCancel")
        }
      ]
    });
  }

  async _resolveActorRefs(refs) {
    const results = [];
    for (const ref of refs) {
      let actor = null;
      try { actor = await fromUuid(ref.uuid); } catch { /* manual entry, not a real document UUID */ }
      results.push({
        uuid: ref.uuid,
        name: actor?.name ?? ref.name,
        img: actor?.img ?? "icons/svg/mystery-man.svg",
        comment: ref.comment ?? "",
        groupId: ref.groupId ?? ""
      });
    }
    return results;
  }

  _organizeByGroups(resolvedRefs, groups, rawRefs) {
    const groupIdMap = new Map();
    for (const ref of rawRefs) {
      if (ref.groupId) groupIdMap.set(ref.uuid, ref.groupId);
    }

    const groupMap = new Map();
    for (const g of groups) {
      groupMap.set(g.id, { ...g, members: [] });
    }

    const ungrouped = [];
    for (const resolved of resolvedRefs) {
      const gid = groupIdMap.get(resolved.uuid);
      if (gid && groupMap.has(gid)) {
        groupMap.get(gid).members.push(resolved);
      } else {
        ungrouped.push(resolved);
      }
    }

    return { groups: Array.from(groupMap.values()), ungrouped };
  }

  async _onMoveActorToGroup(uuid, listKey) {
    const groupsKey = BACKGROUND_GROUPS_KEY[listKey];
    const groups = this.actor.system.background[groupsKey] ?? [];
    const refs = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
    const ref = refs.find(r => r.uuid === uuid);
    if (!ref) return;

    let options = `<option value="">${game.i18n.localize("ANTIQUE.Background.Ungrouped")}</option>`;
    for (const g of groups) {
      const selected = ref.groupId === g.id ? "selected" : "";
      options += `<option value="${g.id}" ${selected}>${g.name}</option>`;
    }

    const content = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("ANTIQUE.Background.SelectGroup")}</label>
          <select name="groupId" style="width:100%">${options}</select>
        </div>
      </form>`;

    await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("ANTIQUE.Background.MoveToGroup") },
      content,
      buttons: [
        {
          action: "save",
          icon: "fas fa-check",
          label: game.i18n.localize("ANTIQUE.Background.CommentSave"),
          default: true,
          callback: (event, button, dialog) => {
            ref.groupId = dialog.element.querySelector('[name="groupId"]').value;
            this.actor.update({ [`system.background.${listKey}`]: refs }).then(() => this.render({ force: true }));
          }
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: game.i18n.localize("ANTIQUE.Background.CommentCancel")
        }
      ]
    });
  }

}

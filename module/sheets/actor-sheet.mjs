const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "character"],
    position: { width: 800, height: 900 },
    window: { resizable: true },
    tabs: [{ group: "main", navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "identity" }],
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
      handler: async function(event, form, formData) {
        await this.document.update(formData.object);
      }
    }
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/character-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.config = CONFIG.ANTIQUE;
    context.isEditable = this.isEditable;

    context.abilityLabels = {};
    for (const [key, locKey] of Object.entries(CONFIG.ANTIQUE.abilities)) {
      context.abilityLabels[key] = game.i18n.localize(locKey);
    }

    context.savesData = {};
    for (const [key, cfg] of Object.entries(CONFIG.ANTIQUE.saves)) {
      const s = system.saves[key];
      context.savesData[key] = {
        key,
        label: game.i18n.localize(cfg.label),
        base: s?.base ?? 0,
        temp: s?.temp ?? 0,
        modSum: s?.modSum ?? 0,
        total: s?.total ?? 0
      };
    }

    context.weaponCatsData = {};
    for (const [key, cfg] of Object.entries(CONFIG.ANTIQUE.weaponCategories)) {
      const a = system.attackBonuses[key];
      context.weaponCatsData[key] = {
        key,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon ?? "",
        bonus: a?.bonus ?? 0,
        abilityMod: a?.abilityMod ?? 0,
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
        linkedAmmoName: linkedAmmo?.name ?? null,
        linkedAmmoQty: linkedAmmo?.system.quantity ?? null
      };
    });
    context.equipment = this.actor.items.filter(i => i.type === "equipment");

    context.advantages = this._prepareTraitItems("advantage");
    context.disadvantages = this._prepareTraitItems("disadvantage");
    context.blessings = this._prepareTraitItems("blessing");
    context.spells = this._prepareSpellItems();
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

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.isEditable) return;

    this.element.querySelectorAll(".ability-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollAbility(ev.currentTarget.dataset.ability));
    });

    this.element.querySelectorAll(".skill-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollSkill(ev.currentTarget.dataset.skill));
    });

    this.element.querySelectorAll(".save-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollSave(ev.currentTarget.dataset.save));
    });

    this.element.querySelectorAll(".initiative-roll").forEach(el => {
      el.addEventListener("click", () => this.actor.rollInitiativeAntique());
    });

    this.element.querySelectorAll(".long-rest").forEach(el => {
      el.addEventListener("click", () => this.actor.longRest());
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
        if (item) item.update({ "system.active": !item.system.active });
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
        if (item) item.delete();
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
        this.actor.update({ [`system.background.${list}`]: current.filter(ref => ref.uuid !== uuid) });
      });
    });

    this.element.querySelectorAll(".actor-ref-card .actor-ref-name").forEach(el => {
      el.addEventListener("click", async ev => {
        const uuid = ev.currentTarget.closest(".actor-ref-card").dataset.uuid;
        const actor = await fromUuid(uuid);
        if (actor?.sheet) actor.sheet.render({force: true});
      });
    });

    this.element.querySelectorAll(".group-create").forEach(el => {
      el.addEventListener("click", ev => {
        const listKey = ev.currentTarget.dataset.list;
        const groupsKey = listKey === "alliesList" ? "alliesGroups" : "ennemisGroups";
        const current = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        current.push({
          id: foundry.utils.randomID(),
          name: game.i18n.localize("ANTIQUE.Background.NewGroup"),
          color: "#c9a227"
        });
        this.actor.update({ [`system.background.${groupsKey}`]: current });
      });
    });

    this.element.querySelectorAll(".group-delete").forEach(el => {
      el.addEventListener("click", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = listKey === "alliesList" ? "alliesGroups" : "ennemisGroups";
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const refs = foundry.utils.deepClone(this.actor.system.background[listKey] ?? []);
        for (const ref of refs) {
          if (ref.groupId === groupId) ref.groupId = "";
        }
        this.actor.update({
          [`system.background.${groupsKey}`]: groups.filter(g => g.id !== groupId),
          [`system.background.${listKey}`]: refs
        });
      });
    });

    this.element.querySelectorAll(".group-name-input").forEach(el => {
      el.addEventListener("change", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = listKey === "alliesList" ? "alliesGroups" : "ennemisGroups";
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const group = groups.find(g => g.id === groupId);
        if (group) {
          group.name = ev.currentTarget.value.trim() || game.i18n.localize("ANTIQUE.Background.NewGroup");
          this.actor.update({ [`system.background.${groupsKey}`]: groups });
        }
      });
    });

    this.element.querySelectorAll(".group-color-input").forEach(el => {
      el.addEventListener("change", ev => {
        const groupId = ev.currentTarget.closest("[data-group-id]").dataset.groupId;
        const listKey = ev.currentTarget.closest("[data-drop-target]").dataset.dropTarget;
        const groupsKey = listKey === "alliesList" ? "alliesGroups" : "ennemisGroups";
        const groups = foundry.utils.deepClone(this.actor.system.background[groupsKey] ?? []);
        const group = groups.find(g => g.id === groupId);
        if (group) {
          group.color = ev.currentTarget.value;
          this.actor.update({ [`system.background.${groupsKey}`]: groups });
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
        this.actor.update({ "system.favoriteSkills": (this.actor.system.favoriteSkills ?? []).filter(k => k !== skillKey) });
      });
    });
  }

  _onFirstRender(context, options) {
    new foundry.applications.ux.ContextMenu(this.element, ".actor-ref-card", [
      {
        name: game.i18n.localize("ANTIQUE.Background.AddComment"),
        icon: '<i class="fas fa-comment"></i>',
        callback: li => this._onEditActorRefComment(li.dataset.uuid, li.dataset.list)
      },
      {
        name: game.i18n.localize("ANTIQUE.Background.MoveToGroup"),
        icon: '<i class="fas fa-object-group"></i>',
        callback: li => this._onMoveActorToGroup(li.dataset.uuid, li.dataset.list)
      }
    ]);

    new foundry.applications.ux.ContextMenu(this.element, ".skill-row", [
      {
        name: game.i18n.localize("ANTIQUE.Favorites.Add"),
        icon: '<i class="fas fa-star"></i>',
        condition: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          return !!key && !(this.actor.system.favoriteSkills ?? []).includes(key);
        },
        callback: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          if (!key) return;
          const current = [...(this.actor.system.favoriteSkills ?? [])];
          if (!current.includes(key)) {
            current.push(key);
            this.actor.update({ "system.favoriteSkills": current });
          }
        }
      },
      {
        name: game.i18n.localize("ANTIQUE.Favorites.Remove"),
        icon: '<i class="fas fa-star-half-alt"></i>',
        condition: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          return !!key && (this.actor.system.favoriteSkills ?? []).includes(key);
        },
        callback: li => {
          const key = li.querySelector(".skill-roll")?.dataset.skill;
          if (!key) return;
          this.actor.update({ "system.favoriteSkills": (this.actor.system.favoriteSkills ?? []).filter(k => k !== key) });
        }
      }
    ]);
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
    return this.actor.createEmbeddedDocuments("Item", [{ name, type, system: {} }]);
  }

  async _onDropActor(event, data) {
    if (!this.isEditable) return;

    const dropTarget = event.target.closest("[data-drop-target]");
    if (!dropTarget) return super._onDropActor(event, data);

    const listKey = dropTarget.dataset.dropTarget;
    if (listKey !== "alliesList" && listKey !== "ennemisList") {
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
            this.actor.update({ [`system.background.${listKey}`]: current });
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
      const actor = await fromUuid(ref.uuid);
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
    const groupsKey = listKey === "alliesList" ? "alliesGroups" : "ennemisGroups";
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
            this.actor.update({ [`system.background.${listKey}`]: refs });
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

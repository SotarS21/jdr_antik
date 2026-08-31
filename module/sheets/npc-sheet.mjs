import { buildAttackFlavor } from "../helpers/rolls.mjs";
import { isOrphanedTokenActor } from "../helpers/actor-utils.mjs";
import { captureFocusState, restoreFocusState, preventEnterSubmit } from "../helpers/sheet-utils.mjs";
import { stackOrCreateDroppedItem } from "../apps/browser-shared.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueNpcSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "npc"],
    position: { width: 600, height: 550 },
    window: { resizable: true },
    tabs: [],
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    }
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/npc-sheet.hbs"
    }
  };

  async _onDropItem(event, item) {
    // Dropped from elsewhere (compendium, another actor, the world Items directory) —
    // stack onto a matching existing item instead of letting the default drop handler
    // create a duplicate row. A drop from this same actor (reordering) is left untouched.
    if (item.parent?.uuid !== this.actor.uuid) {
      const stacked = await stackOrCreateDroppedItem(this.actor, item);
      if (stacked) {
        this.render({ force: true });
        return stacked;
      }
    }

    const result = await super._onDropItem(event, item);
    this.render({ force: true });
    return result;
  }

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
    context.isGM = game.user.isGM;
    context.hasFullAccess = game.user.isGM || this.actor.isOwner;

    context.abilityLabels = {};
    for (const [key, locKey] of Object.entries(CONFIG.ANTIQUE.abilities)) {
      context.abilityLabels[key] = game.i18n.localize(locKey);
    }

    context.weaponCatsData = {};
    for (const [key, cfg] of Object.entries(CONFIG.ANTIQUE.weaponCategories)) {
      context.weaponCatsData[key] = {
        key,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon ?? "",
        total: system.attackBonuses[key]?.total ?? 0
      };
    }

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
    context.spells = this._prepareSpellItems();
    context.instantSpells = context.spells.filter(s => !s.ritual);
    context.ritualSpells = context.spells.filter(s => s.ritual);

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
    // changes its value" behavior.
    this.element.querySelectorAll('input[type="number"]').forEach(el => {
      el.addEventListener("wheel", ev => ev.preventDefault(), { passive: false });
    });
    preventEnterSubmit(this.element);

    // Manual tab management
    if (!this._activeTab) this._activeTab = "notes";
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

    this.element.querySelectorAll(".initiative-roll").forEach(el => {
      el.addEventListener("click", ev => {
        if (ev.target.tagName === "INPUT") return;
        this.actor.rollInitiativeAntique();
      });
    });

    this.element.querySelectorAll(".attaque-roll").forEach(el => {
      el.addEventListener("click", ev => {
        if (ev.target.tagName === "INPUT") return;
        this._rollNpcAttack();
      });
    });

    this.element.querySelectorAll(".attack-cat-roll").forEach(el => {
      el.addEventListener("click", ev => this.actor.rollAttackCategory(ev.currentTarget.dataset.cat));
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

    this.element.querySelectorAll(".item-consume").forEach(el => {
      el.addEventListener("click", ev => {
        const li = ev.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        if (item) item.consume();
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
  }

  async _rollNpcAttack() {
    const roll = new Roll("1d20 + @atk", { atk: this.actor.system.attaque.value });
    await roll.evaluate();
    const flavor = buildAttackFlavor(`${this.actor.name} - Jet d'attaque`, roll.total);
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor
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

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const name = game.i18n.format("ANTIQUE.Item.New", {
      type: game.i18n.localize(`ANTIQUE.ItemType.${type.charAt(0).toUpperCase() + type.slice(1)}`)
    });
    const system = event.currentTarget.dataset.ritual === "true" ? { ritual: true } : {};
    const created = await this.actor.createEmbeddedDocuments("Item", [{ name, type, system }]);
    this.render({ force: true });
    return created;
  }
}

import { buildAttackFlavor } from "../helpers/rolls.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueNpcSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "npc"],
    position: { width: 600, height: 550 },
    window: { resizable: true },
    tabs: [{ group: "main", navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "notes" }],
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/npc-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.config = CONFIG.ANTIQUE;
    context.isEditable = this.isEditable;
    context.isGM = game.user.isGM;
    context.hasFullAccess = game.user.isGM || this.actor.isOwner;

    context.abilityLabels = {};
    for (const [key, locKey] of Object.entries(CONFIG.ANTIQUE.abilities)) {
      context.abilityLabels[key] = game.i18n.localize(locKey);
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

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
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
    return this.actor.createEmbeddedDocuments("Item", [{ name, type, system: {} }]);
  }
}

import { captureFocusState, restoreFocusState, preventEnterSubmit, refreshSheet } from "../helpers/sheet-utils.mjs";
import { getIngredientStock } from "../helpers/actor-utils.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "item"],
    position: { width: 520, height: 480 },
    window: { resizable: true },
    tabs: [],
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    }
  };

  static PARTS = {
    weapon:       { template: "systems/antique/templates/item/weapon-sheet.hbs" },
    equipment:    { template: "systems/antique/templates/item/equipment-sheet.hbs" },
    advantage:    { template: "systems/antique/templates/item/advantage-sheet.hbs" },
    disadvantage: { template: "systems/antique/templates/item/disadvantage-sheet.hbs" },
    blessing:     { template: "systems/antique/templates/item/blessing-sheet.hbs" },
    spell:        { template: "systems/antique/templates/item/spell-sheet.hbs" },
    curse:        { template: "systems/antique/templates/item/curse-sheet.hbs" },
    npcability:   { template: "systems/antique/templates/item/npcability-sheet.hbs" }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [this.item.type];
  }

  async _processSubmitData(event, form, formData) {
    const focusState = captureFocusState(this.element);
    await super._processSubmitData(event, form, formData);
    await this.render({ force: true });
    restoreFocusState(this.element, focusState);
    // Editing an embedded item (e.g. a weapon's linked ammo, or the ammo's own
    // quantity) doesn't automatically refresh the parent actor's already-open
    // sheet — force it too so tables referencing this item stay in sync.
    // Only if that sheet is already open: otherwise this would pop it open.
    const actorSheet = this.item.actor?.sheet;
    if (actorSheet?.rendered) actorSheet.render({ force: true });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.config = CONFIG.ANTIQUE;
    context.isEditable = this.isEditable;
    context.isGM = game.user.isGM;

    context.effects = [];
    for (const effect of this.item.effects) {
      const changes = [];
      for (const c of effect.changes) {
        changes.push({
          key: c.key,
          mode: c.mode,
          value: c.value,
          label: CONFIG.ANTIQUE.getEffectChangeLabel(c)
        });
      }
      context.effects.push({
        id: effect.id,
        name: effect.name,
        icon: effect.icon,
        disabled: effect.disabled,
        changes,
        changesCount: changes.length
      });
    }
    context.hasEffects = context.effects.length > 0;

    if (this.item.type === "weapon" && this.item.actor) {
      context.ammoOptions = this.item.actor.items
        .filter(i => i.type === "equipment" && i.system.consumable)
        .map(i => ({ id: i.id, name: i.name, quantity: i.system.quantity }));
    }

    if (this.item.type === "equipment") {
      context.skillOptions = Object.entries(CONFIG.ANTIQUE.skills)
        .map(([key, cfg]) => ({ key, label: game.i18n.localize(cfg.label) }))
        .sort((a, b) => a.label.localeCompare(b.label));
      context.apothCategoryOptions = Object.entries(CONFIG.ANTIQUE.apothCategories)
        .map(([key, cfg]) => ({ key, label: game.i18n.localize(cfg.label) }));

      if (this.item.system.isIngredientBag) {
        const possessed = (this.item.actor?.items ?? [])
          .filter(i => i.type === "equipment" && i.system.apothCategory && (i.system.quantity ?? 0) > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(i => ({ id: i.id, name: i.name, img: i.img, system: i.system }));
        context.possessedIngredientSections = Object.entries(CONFIG.ANTIQUE.apothCategories).map(([key, cfg]) => ({
          key,
          label: game.i18n.localize(cfg.label),
          items: possessed.filter(i => i.system.apothCategory === key)
        })).filter(section => section.items.length);
      }
    }

    if (this.item.type === "equipment" || this.item.type === "weapon") {
      context.slotOptions = Object.entries(CONFIG.ANTIQUE.equipmentSlots)
        .filter(([, cfg]) => cfg.types.includes(this.item.type))
        .map(([key, cfg]) => ({ key, label: game.i18n.localize(cfg.label) }));
    }

    if (this.item.type === "weapon") {
      context.weaponCategoryOptions = Object.entries(CONFIG.ANTIQUE.weaponCategories)
        .map(([key, cfg]) => ({ key, label: game.i18n.localize(cfg.label) }));
    }

    if (this.item.type === "npcability") {
      context.saveOptions = Object.entries(CONFIG.ANTIQUE.saves)
        .map(([key, cfg]) => ({ key, label: game.i18n.localize(cfg.label) }));
    }

    // Real stock (character's "Ingrédients" tab) matching each checklist entry
    // by name — surfaced read-only next to the row so the link between the
    // spell's declarative ingredients and the actor's actual inventory is visible.
    if (this.item.type === "spell" && this.item.actor) {
      context.ingredientStock = {};
      for (const ing of this.item.system.ingredients) {
        const count = getIngredientStock(this.item.actor, ing.name);
        context.ingredientStock[ing.id] = {
          count,
          label: game.i18n.format("ANTIQUE.Ingredients.Stock", { count }),
          insufficient: count < (ing.quantity ?? 0)
        };
      }
    }

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

    if (!this._activeTab) this._activeTab = "description";
    this._activateTab(this._activeTab);
    this.element.querySelectorAll(".sheet-tabs .item[data-tab]").forEach(btn => {
      btn.addEventListener("click", ev => {
        ev.preventDefault();
        this._activeTab = btn.dataset.tab;
        this._activateTab(this._activeTab);
      });
    });

    if (!this.isEditable) return;

    this.element.querySelector(".effect-create")?.addEventListener("click", this._onEffectCreate.bind(this));
    this.element.querySelectorAll(".effect-edit").forEach(el => el.addEventListener("click", this._onEffectEdit.bind(this)));
    this.element.querySelectorAll(".effect-delete").forEach(el => el.addEventListener("click", this._onEffectDelete.bind(this)));
    this.element.querySelectorAll(".effect-toggle").forEach(el => el.addEventListener("click", this._onEffectToggle.bind(this)));

    this.element.querySelector(".ingredient-create")?.addEventListener("click", this._onIngredientCreate.bind(this));
    this.element.querySelectorAll(".ingredient-delete").forEach(el => el.addEventListener("click", this._onIngredientDelete.bind(this)));
    this.element.querySelectorAll(".ingredient-name-input, .ingredient-quantity-input, .ingredient-possede-checkbox")
      .forEach(el => el.addEventListener("change", this._onIngredientFieldChange.bind(this)));
  }

  async _onEffectCreate(event) {
    event.preventDefault();
    const effectData = {
      name: this.item.name,
      icon: this.item.img,
      origin: this.item.uuid,
      transfer: true,
      disabled: false,
      changes: []
    };
    const created = await this.item.createEmbeddedDocuments("ActiveEffect", [effectData]);
    if (created.length) created[0].sheet.render({force: true});
    this.render({ force: true });
    // transfer:true — this effect now applies to whatever actor owns the item.
    refreshSheet(this.item.actor);
  }

  _onEffectEdit(event) {
    event.preventDefault();
    const effectId = event.currentTarget.closest(".effect-row").dataset.effectId;
    const effect = this.item.effects.get(effectId);
    if (effect) effect.sheet.render({force: true});
  }

  async _onEffectDelete(event) {
    event.preventDefault();
    const effectId = event.currentTarget.closest(".effect-row").dataset.effectId;
    const effect = this.item.effects.get(effectId);
    if (!effect) return;
    await effect.delete();
    this.render({ force: true });
    refreshSheet(this.item.actor);
  }

  async _onEffectToggle(event) {
    event.preventDefault();
    const effectId = event.currentTarget.closest(".effect-row").dataset.effectId;
    const effect = this.item.effects.get(effectId);
    if (!effect) return;
    await effect.update({ disabled: !effect.disabled });
    this.render({ force: true });
    refreshSheet(this.item.actor);
  }

  async _onIngredientCreate(event) {
    event.preventDefault();
    const ingredients = foundry.utils.deepClone(this.item.system.ingredients ?? []);
    ingredients.push({ id: foundry.utils.randomID(), name: "", quantity: 1, possede: false });
    await this.item.update({ "system.ingredients": ingredients });
    this.render({ force: true });
  }

  async _onIngredientDelete(event) {
    event.preventDefault();
    const ingredientId = event.currentTarget.closest("[data-ingredient-id]").dataset.ingredientId;
    const ingredients = foundry.utils.deepClone(this.item.system.ingredients ?? []);
    await this.item.update({ "system.ingredients": ingredients.filter(i => i.id !== ingredientId) });
    this.render({ force: true });
  }

  async _onIngredientFieldChange(event) {
    const el = event.currentTarget;
    const ingredientId = el.closest("[data-ingredient-id]").dataset.ingredientId;
    const ingredients = foundry.utils.deepClone(this.item.system.ingredients ?? []);
    const ing = ingredients.find(i => i.id === ingredientId);
    if (!ing) return;
    if (el.classList.contains("ingredient-name-input")) ing.name = el.value.trim();
    else if (el.classList.contains("ingredient-quantity-input")) ing.quantity = Math.max(0, parseInt(el.value, 10) || 0);
    else if (el.classList.contains("ingredient-possede-checkbox")) ing.possede = el.checked;
    await this.item.update({ "system.ingredients": ingredients });
    this.render({ force: true });
  }
}

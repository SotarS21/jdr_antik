const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "item"],
    position: { width: 520, height: 480 },
    window: { resizable: true },
    tabs: [{ group: "main", navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    weapon:       { template: "systems/antique/templates/item/weapon-sheet.hbs" },
    equipment:    { template: "systems/antique/templates/item/equipment-sheet.hbs" },
    advantage:    { template: "systems/antique/templates/item/advantage-sheet.hbs" },
    disadvantage: { template: "systems/antique/templates/item/disadvantage-sheet.hbs" },
    blessing:     { template: "systems/antique/templates/item/blessing-sheet.hbs" },
    spell:        { template: "systems/antique/templates/item/spell-sheet.hbs" },
    effect:       { template: "systems/antique/templates/item/effect-sheet.hbs" }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [this.item.type];
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
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

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.isEditable) return;

    this.element.querySelector(".effect-create")?.addEventListener("click", this._onEffectCreate.bind(this));
    this.element.querySelectorAll(".effect-edit").forEach(el => el.addEventListener("click", this._onEffectEdit.bind(this)));
    this.element.querySelectorAll(".effect-delete").forEach(el => el.addEventListener("click", this._onEffectDelete.bind(this)));
    this.element.querySelectorAll(".effect-toggle").forEach(el => el.addEventListener("click", this._onEffectToggle.bind(this)));
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
    if (effect) return effect.delete();
  }

  async _onEffectToggle(event) {
    event.preventDefault();
    const effectId = event.currentTarget.closest(".effect-row").dataset.effectId;
    const effect = this.item.effects.get(effectId);
    if (effect) return effect.update({ disabled: !effect.disabled });
  }
}

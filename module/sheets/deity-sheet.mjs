const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueDeitySheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "deity"],
    position: { width: 500, height: 600 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/deity-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.actor.system;
    context.isEditable = this.isEditable;
    return context;
  }
}

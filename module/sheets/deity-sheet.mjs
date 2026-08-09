import { isOrphanedTokenActor } from "../helpers/actor-utils.mjs";
import { captureFocusState, restoreFocusState, preventEnterSubmit } from "../helpers/sheet-utils.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AntiqueDeitySheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["antique", "sheet", "actor", "deity"],
    position: { width: 500, height: 600 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    }
  };

  static PARTS = {
    main: {
      template: "systems/antique/templates/actor/deity-sheet.hbs"
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
    context.actor = this.actor;
    context.system = this.actor.system;
    context.isEditable = this.isEditable;
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    preventEnterSubmit(this.element);
  }
}

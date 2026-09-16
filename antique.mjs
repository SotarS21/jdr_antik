// Import configuration
import { ANTIQUE } from "./module/helpers/config.mjs";

// Import DataModels
import { AntiqueCharacter } from "./module/data-models/actor-character.mjs";
import { AntiqueNpc } from "./module/data-models/actor-npc.mjs";
import { AntiqueDeity } from "./module/data-models/actor-deity.mjs";
import { AntiqueWeapon } from "./module/data-models/items/item-weapon.mjs";
import { AntiqueEquipment } from "./module/data-models/items/item-equipment.mjs";
import { AntiqueTreasure } from "./module/data-models/items/item-treasure.mjs";
import { AntiqueAdvantage } from "./module/data-models/items/item-advantage.mjs";
import { AntiqueDisadvantage } from "./module/data-models/items/item-disadvantage.mjs";
import { AntiqueBlessing } from "./module/data-models/items/item-blessing.mjs";
import { AntiqueSpell } from "./module/data-models/items/item-spell.mjs";
import { AntiqueCurse } from "./module/data-models/items/item-curse.mjs";
import { AntiqueNpcAbility } from "./module/data-models/items/item-npcability.mjs";

// Import Document classes
import { AntiqueActor } from "./module/documents/actor.mjs";
import { AntiqueItem } from "./module/documents/item.mjs";

// Import Sheet classes
import { AntiqueActorSheet } from "./module/sheets/actor-sheet.mjs";
import { AntiqueNpcSheet } from "./module/sheets/npc-sheet.mjs";
import { AntiqueDeitySheet } from "./module/sheets/deity-sheet.mjs";
import { AntiqueItemSheet } from "./module/sheets/item-sheet.mjs";

// Import helpers
import { registerCompendiumContextMenu } from "./module/helpers/random-tables.mjs";
import { registerMigrationSettings, migrateWorld, registerCharacterTokenLinkDefault } from "./module/helpers/migration.mjs";
import { registerVersionCheckSettings, checkSystemVersionUpdate } from "./module/helpers/version-check.mjs";
import { registerPackUpdateSettings, checkPendingPackUpdates } from "./module/helpers/pack-updates.mjs";
import { registerCompendiumBrowserFooterButton } from "./module/apps/compendium-browser.mjs";
import { registerAlchemyShopContextMenu } from "./module/apps/alchemy-shop.mjs";
import { registerHotbarMacroDrop } from "./module/helpers/hotbar-macros.mjs";
import { registerDodgeResetHook } from "./module/helpers/dodge-reset.mjs";
import { registerIngredientStockSyncHook, registerPointsChanceEffectHook } from "./module/helpers/actor-utils.mjs";
import { registerEffectsPanel } from "./module/apps/effects-panel.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("Antique | Initialisation du système Antique");

  // Store config on the global CONFIG object
  CONFIG.ANTIQUE = ANTIQUE;

  // Custom ActiveEffect application phase, applied mid-way through prepareDerivedData()
  // (see actor-character.mjs/actor-npc.mjs) — Foundry's own built-in "final" phase runs
  // only after prepareDerivedData() completes entirely, too late for a change targeting
  // system.abilities.*.mod: skills/saves/CA/attack bonuses read that same mod earlier in
  // the same pass and would otherwise never see the bonus.
  CONFIG.ActiveEffect.phases.abilities = {
    label: "Antique — Modificateurs de caractéristique",
    hint: "Appliqué après leur recalcul automatique, mais avant tout ce qui en dépend (compétences, sauvegardes, CA, initiative, bonus d'attaque)."
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = AntiqueActor;
  CONFIG.Item.documentClass = AntiqueItem;

  // Register DataModels
  CONFIG.Actor.dataModels.character = AntiqueCharacter;
  CONFIG.Actor.dataModels.npc = AntiqueNpc;
  CONFIG.Actor.dataModels.deity = AntiqueDeity;
  CONFIG.Item.dataModels.weapon = AntiqueWeapon;
  CONFIG.Item.dataModels.equipment = AntiqueEquipment;
  CONFIG.Item.dataModels.treasure = AntiqueTreasure;
  CONFIG.Item.dataModels.advantage = AntiqueAdvantage;
  CONFIG.Item.dataModels.disadvantage = AntiqueDisadvantage;
  CONFIG.Item.dataModels.blessing = AntiqueBlessing;
  CONFIG.Item.dataModels.spell = AntiqueSpell;
  CONFIG.Item.dataModels.curse = AntiqueCurse;
  CONFIG.Item.dataModels.npcability = AntiqueNpcAbility;

  // Register Actor sheets
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("antique", AntiqueActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Character"
  });
  foundry.documents.collections.Actors.registerSheet("antique", AntiqueNpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Npc"
  });
  foundry.documents.collections.Actors.registerSheet("antique", AntiqueDeitySheet, {
    types: ["deity"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Deity"
  });

  // Configure initiative formula for the combat tracker
  CONFIG.Combat.initiative = {
    formula: "1d20 + @init",
    decimals: 2
  };

  // Register Item sheets
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("antique", AntiqueItemSheet, {
    types: ["weapon", "equipment", "treasure", "advantage", "disadvantage", "blessing", "spell", "curse", "npcability"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Item"
  });

  // Register migration tracking settings
  registerMigrationSettings();
  registerVersionCheckSettings();
  registerPackUpdateSettings();

  // Hook LISTENERS only — must be attached in "init", not "ready": the compendium sidebar's
  // context-menu construction is a one-time event that fires while the UI is first built,
  // before "ready" (renderCompendiumDirectory itself fires on every render, but registering
  // early costs nothing and keeps every one of these hook registrations in one consistent
  // place). Registering here only adds a callback to Foundry's hook registry (touches no
  // game/canvas state yet), so init-time is always safe regardless.
  registerCompendiumContextMenu();
  registerAlchemyShopContextMenu();
  registerCompendiumBrowserFooterButton();
  registerHotbarMacroDrop();
  registerDodgeResetHook();
  registerIngredientStockSyncHook();
  registerPointsChanceEffectHook();
  registerEffectsPanel();
  registerCharacterTokenLinkDefault();

  // Preload Handlebars templates
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper("ifEquals", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("signedNum", function (value) {
  const n = Number(value);
  return n >= 0 ? `+${n}` : `${n}`;
});

Handlebars.registerHelper("lt", function (a, b) {
  return Number(a) < Number(b);
});

Handlebars.registerHelper("gt", function (a, b) {
  return Number(a) > Number(b);
});

// The legacy {{editor}} helper produces `.editor`/`.editor-edit` markup that only
// FormApplication v1 sheets know how to activate — DocumentSheetV2 (used by every
// sheet in this system) never wires it up, silently leaving rich text fields
// permanently non-editable. `<prose-mirror>` is the ApplicationV2-native element;
// DocumentSheetV2 already knows how to read/save it like any other named form field.
// `toggled` + `enriched`: show a read-only preview by default (click the pencil
// to actually edit) instead of an always-open editor — for fields that are read
// far more often than they're changed.
Handlebars.registerHelper("richEditor", function (path, value, options) {
  const editable = options.hash.editable ?? true;
  const toggled = options.hash.toggled ?? false;
  const enriched = options.hash.enriched ?? "";
  const escaped = Handlebars.escapeExpression(value ?? "");
  const attrs = [`name="${path}"`, `value="${escaped}"`];
  if (!editable) attrs.push("disabled");
  if (toggled) attrs.push("toggled");
  return new Handlebars.SafeString(
    `<prose-mirror ${attrs.join(" ")}>${toggled ? enriched : ""}</prose-mirror>`
  );
});

/* -------------------------------------------- */
/*  Preload Templates                           */
/* -------------------------------------------- */

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/antique/templates/actor/character-sheet.hbs",
    "systems/antique/templates/actor/parts/actor-ref-section.hbs",
    "systems/antique/templates/actor/parts/favorites-bar.hbs",
    "systems/antique/templates/actor/npc-sheet.hbs",
    "systems/antique/templates/actor/deity-sheet.hbs",
    "systems/antique/templates/item/weapon-sheet.hbs",
    "systems/antique/templates/item/equipment-sheet.hbs",
    "systems/antique/templates/item/advantage-sheet.hbs",
    "systems/antique/templates/item/disadvantage-sheet.hbs",
    "systems/antique/templates/item/blessing-sheet.hbs",
    "systems/antique/templates/item/spell-sheet.hbs",
    "systems/antique/templates/item/curse-sheet.hbs"
  ];
  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  console.log("Antique | Système prêt");

  // Run pending data migrations (GM only)
  await migrateWorld();

  // Detect a system version change since this world's last load and, if so,
  // let the GM choose whether to refresh the bundled compendiums (GM only).
  await checkSystemVersionUpdate();

  // Independent of the version-change check above: offer any not-yet-applied
  // per-compendium content fix, every GM login, until it's been applied (GM only).
  await checkPendingPackUpdates();
});

/* -------------------------------------------- */
/*  Chat Message Hooks                          */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".apply-damage");
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const damage = Number(btn.dataset.damage);
    if (!damage || damage <= 0) return;

    // Collect targets: user targets first, then selected tokens
    let tokens = [...game.user.targets];
    if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
    if (!tokens.length) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Damage.NoTarget"));
      return;
    }

    const results = [];
    for (const token of tokens) {
      const actor = token.actor;
      if (!actor || actor.system.pv === undefined) continue;
      const result = await actor.applyDamage(damage);
      results.push(`<b>${actor.name}</b> : ${result.before} → ${result.after} (-${damage})`);
    }

    if (results.length) {
      await ChatMessage.create({
        speaker: { alias: game.i18n.localize("ANTIQUE.Damage.Applied") },
        content: `<div class="antique damage-applied-message">${results.join("<br>")}</div>`
      });
    }
  });
});

// Consumable equipment with a heal amount set (ex. "Rations régénératrices de Déméter")
// — same button pattern as apply-damage, but falls back to the speaker's own actor
// when nothing is targeted/selected (the common case: healing yourself).
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".apply-heal");
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const heal = Number(btn.dataset.heal);
    if (!heal || heal <= 0) return;

    let tokens = [...game.user.targets];
    if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
    let actors = tokens.map(t => t.actor).filter(Boolean);
    if (!actors.length && message.speakerActor) actors = [message.speakerActor];
    if (!actors.length) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Damage.NoTarget"));
      return;
    }

    const results = [];
    for (const actor of actors) {
      if (actor.system.pv === undefined) continue;
      const result = await actor.applyHeal(heal);
      results.push(`<b>${actor.name}</b> : ${result.before} → ${result.after} (+${heal})`);
    }

    if (results.length) {
      await ChatMessage.create({
        speaker: { alias: game.i18n.localize("ANTIQUE.Effect.HealApplied") },
        content: `<div class="antique damage-applied-message">${results.join("<br>")}</div>`
      });
    }
  });
});

// Buff spells with a CA bonus (ex. Peau d'écorce) — same button pattern as apply-damage,
// but falls back to the caster themself when nothing is targeted/selected (the common
// case for a self-buff).
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".apply-effect");
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const amount = Number(btn.dataset.caBonus);
    const spellName = btn.dataset.spellName;
    if (!amount || !spellName) return;

    let tokens = [...game.user.targets];
    if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
    let actors = tokens.map(t => t.actor).filter(Boolean);
    if (!actors.length && message.speakerActor) actors = [message.speakerActor];
    if (!actors.length) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Damage.NoTarget"));
      return;
    }

    const results = [];
    for (const actor of actors) {
      if (actor.system.ca === undefined) continue;
      const result = await actor.applyCaBonus(amount, { name: spellName });
      results.push(`<b>${actor.name}</b> : ${result.before} → ${result.after} CA`);
    }

    if (results.length) {
      await ChatMessage.create({
        speaker: { alias: game.i18n.localize("ANTIQUE.Effect.Applied") },
        content: `<div class="antique damage-applied-message">${results.join("<br>")}</div>`
      });
    }
  });
});

// Buff spells whose bonus isn't just CA (ex. Bénédiction des Titans, +3 Force) —
// generalized counterpart to the ".apply-effect" hook above: the spell embeds its
// own ActiveEffect (transfer:false), and this applies whatever changes it holds
// instead of a single hardcoded CA number. Same target-resolution fallback. A card
// can have more than one such button (ex. solo + group version) — querySelectorAll,
// not querySelector, or every button past the first one silently does nothing.
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const buttons = element.querySelectorAll(".apply-spell-effect");
  if (!buttons.length) return;

  buttons.forEach(btn => btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const itemUuid = btn.dataset.itemUuid;
    if (!itemUuid) return;
    const item = await fromUuid(itemUuid);
    const spellEffect = btn.dataset.effectId ? item?.effects.get(btn.dataset.effectId) : item?.effects.contents[0];
    if (!spellEffect) return;

    let tokens = [...game.user.targets];
    if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
    let actors = tokens.map(t => t.actor).filter(Boolean);
    if (!actors.length && message.speakerActor) actors = [message.speakerActor];
    if (!actors.length) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Damage.NoTarget"));
      return;
    }

    const changeLabels = spellEffect.changes.map(c => CONFIG.ANTIQUE.getEffectChangeLabel(c)).join(", ");
    const results = [];
    for (const actor of actors) {
      await actor.applyEffectChanges(spellEffect.changes, { name: item.name, icon: item.img });
      results.push(`<b>${actor.name}</b> : ${changeLabels}`);
    }

    if (results.length) {
      await ChatMessage.create({
        speaker: { alias: game.i18n.localize("ANTIQUE.Effect.Applied") },
        content: `<div class="antique damage-applied-message">${results.join("<br>")}</div>`
      });
    }
  }));
});

// Area spells (ex. Brouillard) — click the chat button to drag a circular template
// onto the active scene: mousemove snaps a preview to the grid, left-click confirms
// and creates the real MeasuredTemplate, right-click cancels. Same interactive
// placement idiom used across most Foundry systems for spell templates.
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".place-template");
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!canvas.ready || !canvas.scene) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Spell.NoActiveScene"));
      return;
    }

    const radius = Number(btn.dataset.radius) || 25;
    const texture = btn.dataset.texture || undefined;
    const color = btn.dataset.color || game.user.color;

    const templateData = {
      t: "circle",
      user: game.user.id,
      distance: radius,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: color,
      texture
    };

    const doc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene });
    const templateObject = new CONFIG.MeasuredTemplate.objectClass(doc);

    const initialLayer = canvas.activeLayer;
    await templateObject.draw();
    canvas.templates.activate();
    canvas.templates.preview.addChild(templateObject);

    let lastMove = 0;
    const onMove = ev => {
      ev.stopPropagation();
      const now = Date.now();
      if (now - lastMove < 20) return;
      lastMove = now;
      const local = ev.data.getLocalPosition(canvas.templates);
      let snapped = local;
      try {
        snapped = canvas.grid.getSnappedPoint(local, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
      } catch (err) {
        // Fallback if this grid API differs on this Foundry version — place unsnapped
        // rather than breaking the whole placement interaction.
      }
      doc.updateSource({ x: snapped.x, y: snapped.y });
      templateObject.refresh();
    };

    const cleanup = () => {
      canvas.templates.preview.removeChildren();
      canvas.stage.off("mousemove", onMove);
      canvas.stage.off("mousedown", onConfirm);
      canvas.app.view.oncontextmenu = null;
      initialLayer?.activate();
    };

    const onConfirm = async ev => {
      ev.stopPropagation();
      cleanup();
      await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [doc.toObject()]);
    };

    const onCancel = ev => {
      ev.preventDefault();
      cleanup();
    };

    canvas.stage.on("mousemove", onMove);
    canvas.stage.on("mousedown", onConfirm);
    canvas.app.view.oncontextmenu = onCancel;
  });
});

// Capacité de combat PNJ avec un jet de sauvegarde (ex. Regard pétrifiant, "Robustesse DC
// 18") — le joueur visé clique lui-même ce bouton, sur son propre client, pour lancer le
// jet avec les stats de SON personnage assigné (game.user.character), pas celles de qui a
// posté le message.
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".roll-save-button");
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const saveAbility = btn.dataset.saveAbility;
    const dc = Number(btn.dataset.saveDc) || 0;
    const actor = game.user.character;
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Errors.NoAssignedCharacter"));
      return;
    }
    await actor.rollSave(saveAbility, dc);
  });
});

// Même carte de chat, bouton MJ uniquement : lance le même jet de sauvegarde pour le(s)
// token(s) actuellement sélectionné(s) sur le canevas (leur acteur respectif), plutôt que
// pour le personnage assigné du joueur qui clique — utile quand la cible est un PNJ/monstre
// sans joueur assigné. Retiré côté client pour tout non-MJ (le contenu du message est le
// même pour tout le monde, ce bouton n'a de sens que pour le MJ).
Hooks.on("renderChatMessageHTML", (message, html) => {
  const element = html;
  if (!element) return;
  const btn = element.querySelector(".roll-save-selected-button");
  if (!btn) return;

  if (!game.user.isGM) {
    btn.remove();
    return;
  }

  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const saveAbility = btn.dataset.saveAbility;
    const dc = Number(btn.dataset.saveDc) || 0;
    const tokens = canvas.tokens?.controlled ?? [];
    if (!tokens.length) {
      ui.notifications.warn(game.i18n.localize("ANTIQUE.Errors.NoTokenSelected"));
      return;
    }
    for (const token of tokens) {
      if (token.actor) await token.actor.rollSave(saveAbility, dc);
    }
  });
});

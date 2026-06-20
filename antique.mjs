// Import configuration
import { ANTIQUE } from "./module/helpers/config.mjs";

// Import DataModels
import { AntiqueCharacter } from "./module/data-models/actor-character.mjs";
import { AntiqueNpc } from "./module/data-models/actor-npc.mjs";
import { AntiqueDeity } from "./module/data-models/actor-deity.mjs";
import { AntiqueWeapon } from "./module/data-models/items/item-weapon.mjs";
import { AntiqueEquipment } from "./module/data-models/items/item-equipment.mjs";
import { AntiqueAdvantage } from "./module/data-models/items/item-advantage.mjs";
import { AntiqueDisadvantage } from "./module/data-models/items/item-disadvantage.mjs";
import { AntiqueBlessing } from "./module/data-models/items/item-blessing.mjs";
import { AntiqueSpell } from "./module/data-models/items/item-spell.mjs";
import { AntiqueEffect } from "./module/data-models/items/item-effect.mjs";

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
import { registerMigrationSettings, migrateWorld } from "./module/helpers/migration.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("Antique | Initialisation du système Antique");

  // Store config on the global CONFIG object
  CONFIG.ANTIQUE = ANTIQUE;

  // Define custom Document classes
  CONFIG.Actor.documentClass = AntiqueActor;
  CONFIG.Item.documentClass = AntiqueItem;

  // Register DataModels
  CONFIG.Actor.dataModels.character = AntiqueCharacter;
  CONFIG.Actor.dataModels.npc = AntiqueNpc;
  CONFIG.Actor.dataModels.deity = AntiqueDeity;
  CONFIG.Item.dataModels.weapon = AntiqueWeapon;
  CONFIG.Item.dataModels.equipment = AntiqueEquipment;
  CONFIG.Item.dataModels.advantage = AntiqueAdvantage;
  CONFIG.Item.dataModels.disadvantage = AntiqueDisadvantage;
  CONFIG.Item.dataModels.blessing = AntiqueBlessing;
  CONFIG.Item.dataModels.spell = AntiqueSpell;
  CONFIG.Item.dataModels.effect = AntiqueEffect;

  // Register Actor sheets
  Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  Actors.registerSheet("antique", AntiqueActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Character"
  });
  Actors.registerSheet("antique", AntiqueNpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Npc"
  });
  Actors.registerSheet("antique", AntiqueDeitySheet, {
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
  Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  Items.registerSheet("antique", AntiqueItemSheet, {
    types: ["weapon", "equipment", "advantage", "disadvantage", "blessing", "spell", "effect"],
    makeDefault: true,
    label: "ANTIQUE.Sheet.Item"
  });

  // Register migration tracking settings
  registerMigrationSettings();

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

/* -------------------------------------------- */
/*  Preload Templates                           */
/* -------------------------------------------- */

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/antique/templates/actor/character-sheet.hbs",
    "systems/antique/templates/actor/npc-sheet.hbs",
    "systems/antique/templates/actor/deity-sheet.hbs",
    "systems/antique/templates/item/weapon-sheet.hbs",
    "systems/antique/templates/item/equipment-sheet.hbs",
    "systems/antique/templates/item/advantage-sheet.hbs",
    "systems/antique/templates/item/disadvantage-sheet.hbs",
    "systems/antique/templates/item/blessing-sheet.hbs",
    "systems/antique/templates/item/spell-sheet.hbs",
    "systems/antique/templates/item/effect-sheet.hbs"
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

  registerCompendiumContextMenu();
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

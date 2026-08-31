/**
 * Dropping a weapon (from any inventory, character or PNJ) or a skill (from the
 * character sheet, via a custom "AntiqueSkillRoll" drag payload — skills aren't
 * Item documents) onto the macro hotbar creates a macro that rolls it directly,
 * instead of Foundry's default "toggle this document's sheet" macro (or, for the
 * skill case, nothing at all — Foundry has no document class for our made-up type).
 *
 * Any other drop (Actor, RollTable, Macro, non-weapon Item...) is left entirely to
 * Foundry's own default `Hotbar#_onDropData` handling, unmodified.
 */
export function registerHotbarMacroDrop() {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type === "Item") {
      createItemHotbarMacro(data, slot);
      return false;
    }
    if (data.type === "AntiqueSkillRoll") {
      createSkillHotbarMacro(data, slot);
      return false;
    }
  });
}

async function createItemHotbarMacro(data, slot) {
  const item = await fromUuid(data.uuid);
  if (!item) return;

  const macro = item.type === "weapon"
    ? await Macro.implementation.create({
        name: game.i18n.format("ANTIQUE.Macro.RollAttack", { name: item.name }),
        type: "script",
        img: item.img,
        command: `const item = await fromUuid("${item.uuid}");\nif (item) await item.rollAttack();`
      })
    // Not a weapon: reproduce Foundry's own default drop behavior verbatim (this
    // hook intercepts every "Item" drop, so anything we don't special-case must
    // keep working exactly as it did before — see Hotbar#_createDocumentSheetToggle).
    : await Macro.implementation.create({
        name: game.i18n.format("HOTBAR.ToggleSheet", { document: item.name }),
        type: "script",
        img: "icons/svg/book.svg",
        command: `await foundry.applications.ui.Hotbar.toggleDocumentSheet("${item.uuid}");`
      });

  await game.user.assignHotbarMacro(macro, slot, { fromSlot: data.slot });
}

async function createSkillHotbarMacro(data, slot) {
  const actor = await fromUuid(data.actorUuid);
  if (!actor) return;

  const label = game.i18n.localize(CONFIG.ANTIQUE.skills[data.skillKey]?.label ?? data.skillKey);
  const macro = await Macro.implementation.create({
    name: game.i18n.format("ANTIQUE.Macro.RollSkill", { name: label }),
    type: "script",
    img: "icons/svg/d20.svg",
    command: `const actor = await fromUuid("${actor.uuid}");\nif (actor) await actor.rollSkill("${data.skillKey}");`
  });

  await game.user.assignHotbarMacro(macro, slot, { fromSlot: data.slot });
}

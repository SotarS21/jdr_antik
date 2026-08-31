/**
 * Compendium context menu: create roll tables & draw random entries.
 */

/**
 * Extract the CompendiumCollection from a context menu <li> element.
 * Compatible with Foundry v12 and v13.
 */
function _getPackFromLi(li) {
  const packId = li instanceof HTMLElement ? li.dataset.pack : li.data?.("pack");
  if (!packId) {
    console.warn("Antique | random-tables: no pack id found on element");
    return null;
  }
  return game.packs.get(packId) ?? null;
}

/**
 * Create a permanent RollTable document from a compendium's contents.
 */
async function createRollTableFromCompendium(pack) {
  const index = await pack.getIndex();
  if (!index.size) {
    ui.notifications.warn(
      game.i18n.format("ANTIQUE.Compendium.ErrorEmpty", { name: pack.metadata.label })
    );
    return;
  }

  const results = [];
  let i = 1;
  for (const entry of index) {
    results.push({
      text: entry.name,
      type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
      documentCollection: pack.collection,
      documentId: entry._id,
      img: entry.img || "icons/svg/item-bag.svg",
      weight: 1,
      range: [i, i],
      drawn: false
    });
    i++;
  }

  const tableName = game.i18n.format("ANTIQUE.Compendium.TableName", { name: pack.metadata.label });
  const table = await RollTable.create({
    name: tableName,
    formula: `1d${index.size}`,
    results
  });

  ui.notifications.info(
    game.i18n.format("ANTIQUE.Compendium.TableCreated", {
      name: pack.metadata.label,
      count: index.size
    })
  );

  table.sheet.render({force: true});
}

/**
 * Draw a random entry from a compendium and post it to chat.
 */
async function drawRandomFromCompendium(pack) {
  const index = await pack.getIndex();
  if (!index.size) {
    ui.notifications.warn(
      game.i18n.format("ANTIQUE.Compendium.ErrorEmpty", { name: pack.metadata.label })
    );
    return;
  }

  const roll = new Roll(`1d${index.size}`);
  await roll.evaluate();

  const entries = Array.from(index);
  const picked = entries[roll.total - 1];

  // Load the full document for its description
  const doc = await pack.getDocument(picked._id);
  const description = doc?.system?.description ?? "";
  const img = doc?.img || picked.img || "icons/svg/item-bag.svg";
  const name = doc?.name || picked.name;
  const source = game.i18n.format("ANTIQUE.Compendium.DrawSource", { name: pack.metadata.label });

  const content = `
    <div class="antique item-chat-card">
      <header class="card-header">
        <img src="${img}" width="36" height="36" />
        <h3>${name}</h3>
      </header>
      <div class="random-draw-source">${source}</div>
      <div class="random-draw-roll">${roll.formula} = ${roll.total}</div>
      ${description ? `<div class="card-content random-draw-desc">${description}</div>` : ""}
    </div>`;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content
  });
}

/**
 * Register the two context menu options on every compendium in the sidebar.
 *
 * Foundry v14's CompendiumDirectory fires "getCompendiumContextOptions" for its per-entry
 * context menu (client/applications/sidebar/tabs/compendium-directory.mjs sets this via an
 * explicit `hookName: "getCompendiumContextOptions"` override on _createContextMenu) — not
 * "getCompendiumDirectoryEntryContext", the older name this used to listen on.
 */
export function registerCompendiumContextMenu() {
  Hooks.on("getCompendiumContextOptions", (html, options) => {
    options.push(
      {
        label: game.i18n.localize("ANTIQUE.Compendium.CreateTable"),
        icon: '<i class="fas fa-dice"></i>',
        onClick: async (event, li) => {
          const pack = _getPackFromLi(li);
          if (!pack) {
            ui.notifications.error(game.i18n.localize("ANTIQUE.Compendium.ErrorPackNotFound"));
            return;
          }
          await createRollTableFromCompendium(pack);
        }
      },
      {
        label: game.i18n.localize("ANTIQUE.Compendium.DrawRandom"),
        icon: '<i class="fas fa-question"></i>',
        onClick: async (event, li) => {
          const pack = _getPackFromLi(li);
          if (!pack) {
            ui.notifications.error(game.i18n.localize("ANTIQUE.Compendium.ErrorPackNotFound"));
            return;
          }
          await drawRandomFromCompendium(pack);
        }
      }
    );
  });
}

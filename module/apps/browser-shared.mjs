import { refreshSheet } from "../helpers/sheet-utils.mjs";

/**
 * Who receives Take/Buy: every currently controlled (owned) token's actor, falling back to
 * the user's assigned character when nothing is selected — mirrors PF2e's own Compendium
 * Browser ("Added {item} to the selected actor(s)", "Purchased {item} with all selected
 * actor(s)"), which applies Take/Buy to the whole current token selection at once rather
 * than a single target. Shared by the Alchemy Shop and the general Compendium Browser.
 */
export function resolveShopTargetActors() {
  const controlled = (canvas.tokens?.controlled ?? [])
    .map(t => t.actor)
    .filter(a => a?.isOwner);
  const unique = Array.from(new Set(controlled));
  if (unique.length) return unique;
  if (game.user.character) return [game.user.character];
  return [];
}

/** Item types that track a stackable system.quantity — everything else (advantage,
 *  disadvantage, blessing, spell) is a trait, always added as a fresh copy, never stacked. */
export const STACKABLE_TYPES = new Set(["weapon", "equipment"]);

/**
 * Add a copy of a compendium item to the target actor. For stackable types (weapon,
 * equipment), reuses/increments a matching existing item (matched by type + name +
 * apothCategory — the last is undefined for weapons/plain equipment, which is fine, both
 * sides then simply undefined and still compare equal) instead of creating a duplicate row.
 * Non-stackable traits (advantage/disadvantage/blessing/spell) are always created fresh.
 */
export async function grantItemToActor(targetActor, compendiumItem) {
  const stackable = STACKABLE_TYPES.has(compendiumItem.type);
  const existing = stackable && targetActor.items.find(i =>
    i.type === compendiumItem.type
    && i.name === compendiumItem.name
    && (i.system.apothCategory ?? null) === (compendiumItem.system.apothCategory ?? null)
  );

  if (existing) {
    await existing.update({ "system.quantity": (existing.system.quantity ?? 0) + 1 });
  } else {
    const data = compendiumItem.toObject();
    delete data._id;
    if (stackable) data.system.quantity = 1;
    await targetActor.createEmbeddedDocuments("Item", [data]);
  }
  refreshSheet(targetActor);
}

/**
 * Apply a copy of a compendium ActiveEffect (Effets library) directly onto the target actor —
 * grantItemToActor's counterpart for the Traits tab's Effets pack. No stacking concept for
 * effects, so always a fresh copy.
 */
export async function grantEffectToActor(targetActor, compendiumEffect) {
  const data = compendiumEffect.toObject();
  delete data._id;
  await targetActor.createEmbeddedDocuments("ActiveEffect", [data]);
  refreshSheet(targetActor);
}

/**
 * Handle a stackable item (weapon/equipment) dropped onto `actor` from anywhere other than
 * that same actor (compendium, another actor, the world Items directory) — reuses/increments
 * a matching existing item (same match rule as grantItemToActor) by the dropped item's own
 * quantity, instead of the sheet's default drop behavior always creating a fresh duplicate row.
 * Returns the updated existing item, or null if there was no stackable match (caller should
 * then fall through to the normal drop-creates-a-copy behavior).
 */
export async function stackOrCreateDroppedItem(actor, item) {
  if (!STACKABLE_TYPES.has(item.type)) return null;
  const existing = actor.items.find(i =>
    i.type === item.type
    && i.name === item.name
    && (i.system.apothCategory ?? null) === (item.system.apothCategory ?? null)
  );
  if (!existing) return null;
  const amount = item.system.quantity ?? 1;
  await existing.update({ "system.quantity": (existing.system.quantity ?? 0) + amount });
  refreshSheet(actor);
  return existing;
}

/**
 * Wire the search box + sort dropdown + description-toggle caret + drag-and-drop + click-image
 * -to-chat interactions shared by both browser apps. `app` just needs `.element` and (for sort)
 * a `_sortMode` field to persist across renders.
 */
export function attachBrowserRowInteractions(app) {
  const root = app.element;

  const search = root.querySelector(".ingredient-search");
  if (search) {
    search.addEventListener("input", ev => {
      const query = ev.currentTarget.value.trim().toLowerCase();
      root.querySelectorAll(".apoth-section").forEach(section => {
        let visibleCount = 0;
        section.querySelectorAll(".shop-row").forEach(row => {
          const name = row.querySelector(".equip-name")?.textContent.toLowerCase() ?? "";
          const isMatch = !query || name.includes(query);
          row.style.display = isMatch ? "" : "none";
          const descRow = row.nextElementSibling;
          if (descRow?.classList.contains("equip-desc-row") && !isMatch) descRow.style.display = "none";
          if (isMatch) visibleCount++;
        });
        section.style.display = (!query || visibleCount > 0) ? "" : "none";
      });
    });
  }

  const sortSelect = root.querySelector(".shop-sort");
  if (sortSelect && "_sortMode" in app) {
    sortSelect.value = app._sortMode;
    sortSelect.addEventListener("change", ev => {
      app._sortMode = ev.currentTarget.value;
      app.render({ force: true });
    });
  }

  root.querySelectorAll(".equip-toggle").forEach(el => {
    el.addEventListener("click", ev => {
      ev.preventDefault();
      const toggle = ev.currentTarget;
      const row = toggle.closest("tr.shop-row");
      const descRow = row?.nextElementSibling;
      toggle.classList.toggle("open");
      if (descRow) {
        const isVisible = window.getComputedStyle(descRow).display !== "none";
        descRow.style.display = isVisible ? "none" : "";
      }
    });
  });

  // Click the row's image: post the item's summary to chat (same convention as the
  // .equip-img.item-chat icon already used in the actor sheet's own Inventory tab).
  root.querySelectorAll(".shop-row .equip-img").forEach(el => {
    el.addEventListener("click", async ev => {
      const uuid = ev.currentTarget.closest(".shop-row")?.dataset.uuid;
      const doc = uuid ? await fromUuid(uuid) : null;
      if (doc?.postToChat) await doc.postToChat();
    });
  });

  // Standard Foundry drag payload ({type, uuid}) — dropping on an actor sheet adds the item
  // there via that sheet's own default drop handling, no extra code needed on our side.
  // (Dropping directly onto the Chat sidebar tab isn't a native Foundry drop target; clicking
  // the row's image above is the supported way to post an item's info to chat.)
  root.querySelectorAll(".shop-row[data-uuid]").forEach(row => {
    row.setAttribute("draggable", "true");
    row.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("text/plain", JSON.stringify({ type: row.dataset.dragType || "Item", uuid: row.dataset.uuid }));
    });
  });

  root.querySelector(".shop-refresh-target")?.addEventListener("click", () => app.render({ force: true }));
}

/**
 * Rapid double-clicks on the same row's action buttons would otherwise both read the actor's
 * quantity/gold before either write resolves, letting the second click's write clobber the
 * first. Disable just that row's action buttons for the duration of the (awaited) action.
 */
export async function withRowLock(event, action) {
  const row = event.currentTarget.closest(".shop-row");
  const buttons = row ? [...row.querySelectorAll(".shop-take, .shop-pay, .shop-import, .shop-draw")] : [event.currentTarget];
  if (buttons.some(b => b.classList.contains("shop-busy"))) return;
  buttons.forEach(b => b.classList.add("shop-busy"));
  try {
    await action();
  } finally {
    buttons.forEach(b => b.classList.remove("shop-busy"));
  }
}

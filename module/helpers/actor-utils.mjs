import { refreshSheet } from "./sheet-utils.mjs";

/**
 * True if `actor` is a synthetic token-actor whose Token no longer exists in its
 * scene (e.g. deleted from the canvas while its sheet stayed open). Document
 * updates on such an actor fail deep inside Foundry's update pipeline because
 * the parent chain can no longer be resolved — `token.parent` still returns the
 * Scene itself, so the Token's presence in the scene's collection must be checked
 * explicitly rather than just the parent's truthiness.
 */
export function isOrphanedTokenActor(actor) {
  if (!actor.isToken) return false;
  const token = actor.token;
  return !token?.parent?.tokens.has(token.id);
}

/**
 * Equipment items on `actor` tagged as an ingredient (system.apothCategory set,
 * excluding the ingredient bag itself) whose name matches `name` — exact match
 * first, falling back to a loose substring match in either direction (same
 * convention already used by the ritual costText lookup in AntiqueItem#castSpell).
 * This is what links a spell's declarative "Ingrédients" checklist to the real
 * stock shown in the character sheet's "Ingrédients" tab.
 */
export function findIngredientItems(actor, name) {
  const target = (name ?? "").trim().toLowerCase();
  if (!actor || !target) return [];
  const pool = actor.items.filter(i => i.type === "equipment" && i.system.apothCategory && !i.system.isIngredientBag);
  const exact = pool.filter(i => i.name.trim().toLowerCase() === target);
  if (exact.length) return exact;
  return pool.filter(i => {
    const n = i.name.trim().toLowerCase();
    return n.includes(target) || target.includes(n);
  });
}

/** Total real quantity of an ingredient (matched by name) currently owned by `actor`. */
export function getIngredientStock(actor, name) {
  return findIngredientItems(actor, name).reduce((sum, i) => sum + (i.system.quantity ?? 0), 0);
}

/**
 * Re-sync every spell's "Ingrédients" checklist ("possede" checkbox) on `actor`
 * with the real stock currently on hand — same formula already used after a
 * cast in AntiqueItem#castSpell, reused here so restocking an ingredient
 * outside of casting (the "+" button, a direct quantity edit, drag-stacking a
 * duplicate) auto-ticks the checkbox again instead of requiring a manual
 * re-check. Only touches an entry that actually matches a real inventory item
 * — a purely narrative entry (no real match) is left exactly as the player
 * set it.
 */
export async function syncSpellIngredientPossession(actor) {
  if (!actor) return;
  const spells = actor.items.filter(i => i.type === "spell" && (i.system.ingredients?.length ?? 0) > 0);
  for (const spell of spells) {
    let changed = false;
    const updated = spell.system.ingredients.map(ing => {
      if (!findIngredientItems(actor, ing.name).length) return ing;
      const possede = getIngredientStock(actor, ing.name) >= (ing.quantity ?? 0);
      if (possede === ing.possede) return ing;
      changed = true;
      return { ...ing, possede };
    });
    if (changed) {
      await spell.update({ "system.ingredients": updated });
      refreshSheet(spell);
    }
  }
}

/**
 * Registers the hook that triggers the sync above whenever an ingredient-tagged
 * equipment item's quantity changes on a character actor — covers every path
 * that can restock/deplete one (the "+" button, a direct edit on the item's
 * own sheet, AntiqueItem#consume(), drag-and-drop stacking), since they all
 * funnel through Item#update().
 */
export function registerIngredientStockSyncHook() {
  Hooks.on("updateItem", (item, changes) => {
    if (item.type !== "equipment" || !item.system.apothCategory || item.system.isIngredientBag) return;
    if (foundry.utils.getProperty(changes, "system.quantity") === undefined) return;
    const actor = item.actor;
    if (!actor || actor.type !== "character" || !actor.isOwner) return;
    syncSpellIngredientPossession(actor);
  });
}

/**
 * Dropping the "Point de Chance +1"/"+2" library effets (compendium Effets) directly
 * onto a character sheet would otherwise embed them as an ordinary persistent
 * ActiveEffect — same problem as AntiqueActor#applyEffectChanges() for system.pointsChance
 * (a plain freely-editable counter, not a buff: the bonus would never even show, since
 * the sheet's input reads the raw value on purpose). Intercepts any ActiveEffect about
 * to be embedded on a character whose changes exclusively target system.pointsChance,
 * applies it directly and permanently instead, and cancels the effect's own creation.
 */
export function registerPointsChanceEffectHook() {
  Hooks.on("preCreateActiveEffect", (effect, data, options, userId) => {
    const actor = effect.parent;
    if (!actor || actor.documentName !== "Actor" || actor.type !== "character") return;
    const changes = effect.system.changes;
    if (!changes.length || !changes.every(c => c.key === "system.pointsChance")) return;

    const amount = changes.reduce((sum, c) => sum + Number(c.value), 0);
    const before = actor._source.system.pointsChance ?? 0;
    actor.update({ "system.pointsChance": before + amount });
    ui.notifications.info(`${actor.name} : ${amount >= 0 ? "+" : ""}${amount} Points de Chance (${before} → ${before + amount}).`);
    return false;
  });
}

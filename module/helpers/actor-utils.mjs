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

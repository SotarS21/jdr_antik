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

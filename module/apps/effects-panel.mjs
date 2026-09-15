/**
 * Floating "Effects Panel" inspired by Pathfinder 2e's — a small strip of icons for
 * whichever token is currently controlled, shown near the hotbar rather than only on
 * demand (unlike Foundry's own Token HUD, which needs an explicit click on the token
 * and only ever lists CONFIG.statusEffects entries, not arbitrary ActiveEffects — see
 * client/applications/hud/token-hud.mjs). Deliberately a plain injected DOM element,
 * not an ApplicationV2 window: no title bar/resize handle wanted for a HUD strip.
 *
 * Only shows effects embedded directly on the actor (`actor.effects`), not effects
 * transferred from an owned Item (gear bonuses, permanent Avantage/Désavantage
 * traits) — those are structural parts of an owned item, already managed from the
 * Inventory/Traits tabs, and deleting one here would destroy it on its source item
 * instead of merely "removing a status". `actor.effects` is exactly the set created
 * by AntiqueActor#applyCaBonus()/applyEffectChanges() (spell buffs) and the Traits
 * tab's own "Effets" section (actor-effect-create) — i.e. the things a player would
 * actually think of as "a temporary status currently affecting me".
 */

let panelEl = null;

function ensurePanel() {
  if (panelEl) return panelEl;
  panelEl = document.createElement("div");
  panelEl.id = "antique-effects-panel";
  panelEl.classList.add("antique");
  panelEl.hidden = true;
  document.body.appendChild(panelEl);
  return panelEl;
}

/** Last-controlled token's actor, matching the common "most recent selection wins"
 *  convention when several tokens are controlled at once. */
function currentActor() {
  const controlled = canvas?.tokens?.controlled ?? [];
  return controlled.at(-1)?.actor ?? null;
}

function refreshEffectsPanel() {
  const el = ensurePanel();
  const actor = currentActor();
  const effects = actor ? [...actor.effects] : [];

  if (!effects.length) {
    el.hidden = true;
    el.replaceChildren();
    return;
  }

  el.hidden = false;
  el.replaceChildren();
  for (const effect of effects) {
    const icon = document.createElement("div");
    icon.className = "antique-effects-panel-icon";
    if (effect.disabled) icon.classList.add("disabled");
    icon.title = effect.name;
    const img = document.createElement("img");
    img.src = effect.img;
    icon.appendChild(img);
    // Left-click removes the effect outright — no confirmation, matching the
    // existing .actor-effect-delete pattern on the character sheet's own Traits tab.
    // .catch(): a denied delete (e.g. no permission) rejects the promise — Foundry's
    // own document layer already shows a ui.notifications.error for that, so nothing
    // more to do here, just avoid an unhandled-rejection console error.
    icon.addEventListener("click", () => effect.delete().catch(() => {}));
    el.appendChild(icon);
  }
}

export function registerEffectsPanel() {
  Hooks.on("controlToken", refreshEffectsPanel);
  Hooks.on("createActiveEffect", refreshEffectsPanel);
  Hooks.on("updateActiveEffect", refreshEffectsPanel);
  Hooks.on("deleteActiveEffect", refreshEffectsPanel);
  // No "token deselected" cascade fires when its actor is deleted outright (e.g. from
  // the Actors sidebar) while the token stays controlled on the canvas — without this,
  // the panel would keep showing that actor's last-known effects forever.
  Hooks.on("deleteActor", refreshEffectsPanel);
}

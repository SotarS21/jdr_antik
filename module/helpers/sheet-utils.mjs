/**
 * Capture which field has focus and how far the sheet body is scrolled, so both
 * can be restored after a forced re-render blows away the DOM. Without this,
 * pressing Enter (or any submitOnChange trigger) inside a scrolled-down field
 * jumps the sheet back to the top and drops keyboard focus.
 */
export function captureFocusState(element) {
  const active = document.activeElement;
  const hasFocus = active?.name && element.contains(active);
  return {
    focusName: hasFocus ? active.name : null,
    selectionStart: hasFocus ? active.selectionStart : null,
    selectionEnd: hasFocus ? active.selectionEnd : null,
    scrollTop: element.querySelector(".sheet-body")?.scrollTop ?? 0
  };
}

/**
 * Restore a state previously captured by {@link captureFocusState} after the
 * sheet has re-rendered.
 */
export function restoreFocusState(element, state) {
  const body = element.querySelector(".sheet-body");
  if (body) body.scrollTop = state.scrollTop;
  if (!state.focusName) return;
  const el = element.querySelector(`[name="${state.focusName}"]`);
  if (!el) return;
  el.focus();
  if (typeof state.selectionStart === "number" && el.setSelectionRange) {
    try { el.setSelectionRange(state.selectionStart, state.selectionEnd ?? state.selectionStart); } catch { /* not a text-selectable input */ }
  }
}

/**
 * Pressing Enter in a text/number <input> both commits a native "change" event AND
 * implicitly submits the form — with submitOnChange:true, that fires _processSubmitData
 * twice in parallel for a single keystroke. The second run can capture focus after the
 * first has already blown away the DOM (activeElement fell back to <body>), so its
 * restoreFocusState does nothing and focus is lost after the final render. Blocking the
 * key here leaves the ordinary "change" event (fired on blur/Tab) as the only trigger.
 */
export function preventEnterSubmit(element) {
  element.querySelectorAll('input[type="text"], input[type="number"]').forEach(el => {
    el.addEventListener("keydown", ev => {
      if (ev.key === "Enter") ev.preventDefault();
    });
  });
}

/**
 * Force a re-render of a document's already-open sheet after a mutation made from
 * elsewhere (a chat button, another document's roll/cast method, a document-lifecycle
 * hook) — Foundry doesn't do this automatically for a document that isn't the one
 * being edited through its own form submission (that path is handled separately by
 * _processSubmitData's own capture/render/restore sequence).
 */
export function refreshSheet(doc) {
  if (doc?.sheet?.rendered) doc.sheet.render({ force: true });
}

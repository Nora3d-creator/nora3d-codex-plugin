# Hide the Web Assistant in the plugin's document tab

This is a one-time presentation adjustment in the current Codex task's Nora3D
tab. Keep the existing Web assistant mounted and leave its conversation, drafts,
credits, connection and configuration intact. Do not modify Web code, private
application state, browser storage, CSS, DOM structure or a server setting. If
the user subsequently reopens the panel, respect that choice for this document.

## Observe, activate, verify

1. Retain the exact browser ID, tab ID and current part URL. Confirm this tab
   belongs to the current plugin workflow. Read the current live DOM before
   selecting controls. The current page exposes an Assistant button with
   `aria-expanded` and `aria-controls="partAiWrapper"`; the controlled element
   is the assistant panel. Names are translated, so use observed semantics.
2. Read the actual panel visibility and the button's expanded/disabled state.
   If both say collapsed, do nothing. A missing node or incomplete snapshot is
   not confirmation that the panel is hidden. Do not toggle while the 3D render
   view is active: that button can instead exit rendering and open the panel.
   A visible overlay, running Web turn, pending recovery or disabled control
   prevents this optional adjustment. Leave the protected work alone.
3. Use a currently documented host interaction on the observed Assistant
   button. Do not invoke a Vue method, dispatch a private event or inject code
   to bypass event handlers. Keep this click separate from context requests and
   other UI actions, with a bounded host timeout.
4. Read a fresh snapshot in the same tab. Success requires BOTH
   `aria-expanded="false"` and the actual controlled panel hidden. A resolved
   click or a timeout establishes neither. If the page navigated, cancel the
   old action plan and rediscover the current document before doing anything.
   If a host timeout resets the browser tool session, restore its documented
   bindings and inspect the same existing tab before any second click. A timed-out
   action may already have collapsed the panel; never toggle it open again by
   assuming timeout means the action did not execute. Keep slow browser calls
   separate rather than batching several actions and state reads into one deadline.
5. If a click has no visible effect, inspect a fresh screenshot or full host
   accessibility state for a blocker. A compact DOM snapshot can omit an
   operation-timeout or Refresh recovery notice. Such a notice blocks further
   panel clicks; do not dismiss it, refresh, or reinterpret it as an account
   problem. Honor the separate recovery/approval requirements for that action.
   If the page is unchanged and freshly confirmed unblocked, use at most one
   documented alternate interaction on the same freshly observed control.
   On Windows in-app browser hosts where a semantic click reports success but
   has no effect, prefer the host's documented screenshot-based tab click as
   that alternate. This path was verified on the current host. It requires a
   new screenshot and visible hit target; never reuse coordinates from another
   tab, scale or layout. Do not invent accessibility action names.
   Verify again. If still unchanged, report that automatic collapse was not
   confirmed and continue safe connection diagnosis separately. Do not loop,
   refresh, navigate away, or ask the user to change authorization to fix a
   presentation-only problem.
6. Read fresh guarded document context before modeling. Hiding the panel does
   not release a Web assistant lease or authorize model edits. The current Web
   uses visibility rather than component destruction for this panel, so its
   embedded document bridge can remain connected while hidden.

The Web connection protects busy/recovery states with capture-phase mouse and
keyboard guards. An enabled button and a successful host click can therefore
have no visible effect. Never use a synthetic interaction to evade that guard.

## Pure planner

Run [assistant-panel.cjs](../scripts/assistant-panel.cjs) with Node and JSON on
stdin through the execution tool. It performs no browser action, network access,
credential read or write. It validates observations and returns an action intent;
the host must perform supported interactions and supply fresh observations.

```json
{
  "plugin_owned": true,
  "tab": {"browser_id":"current-browser", "tab_id":"current-tab", "url":"https://app.nora3d.ai/cad/workspace/p/project/d/document?chunked=true"},
  "observation": {
    "id":"fresh-observation-1",
    "tab": {"browser_id":"current-browser", "tab_id":"current-tab", "url":"https://app.nora3d.ai/cad/workspace/p/project/d/document?chunked=true"},
    "panel":{"present":true,"visible":true},
    "toggle":{"present":true,"visible":true,"enabled":true,"expanded":true,"controls":"partAiWrapper"},
    "render_active":false,
    "busy":false,
    "recovery_pending":false,
    "blocker_visible":false
  }
}
```

Populate these fields from fresh observed UI and, when available, guarded context;
never copy example values as evidence. `plugin_owned` means the tab is part of
this task's workflow. `busy`, `recovery_pending` and `blocker_visible` must each
be explicit booleans derived from that current observation; missing/unknown
evidence cannot be defaulted to `false`. After an attempted action (including a timeout), pass its
returned `state` as `previous` and supply a NEW observation ID from an actual
new read. Only set `alternate_available` when the host documents a genuinely
different supported interaction. Preserve the planner state across this bounded
sequence; do not reset it to circumvent the retry limit. Set `cancelled` when
the operation is cancelled. No listeners, polling loops or background jobs are
created by this helper.

The `hidden` status proves only the supplied UI postconditions. A later expanded
state becomes `respect_reopened_panel`. `collapse_not_confirmed` is terminal for
that sequence. Missing/stale evidence yields no action. Do not confuse these
presentation results with document authentication, access or editability.

## Read-only observation recipe

Prefer host snapshots and element inspection. If the host documents read-only
page evaluation, the following is an observation recipe for IDs/classes already
confirmed in that tab's live DOM. It returns only UI state and the URL; it reads
no storage, cookies, tokens, private Vue state, conversation text or draft text.
Use the host's own documented wrapper and timeout, not a second browser connection.

```javascript
() => {
  const visible = element => {
    if (!element || !element.getClientRects().length) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' ||
          style.visibility === 'collapse' || Number(style.opacity) === 0) return false;
    }
    return true;
  };
  const toggle = document.getElementById('aiToggle');
  const panel = document.getElementById('partAiWrapper');
  const render = document.querySelector('button.btn-render[aria-pressed]');
  const expanded = toggle?.getAttribute('aria-expanded');
  const pressed = render?.getAttribute('aria-pressed');
  return {
    url: location.href,
    panel: {present: !!panel, visible: visible(panel)},
    toggle: {
      present: !!toggle, visible: visible(toggle),
      enabled: !!toggle && !toggle.disabled && toggle.getAttribute('aria-disabled') !== 'true',
      expanded: expanded === 'true' ? true : expanded === 'false' ? false : null,
      controls: toggle?.getAttribute('aria-controls')
    },
    render_active: pressed === 'true' ? true : pressed === 'false' ? false : null
  };
}
```

Add the current host's browser/tab IDs and a new observation ID around that read.
Inspect visible busy, recovery and overlay state separately. The absence of a
render control in a partial snapshot does not prove render mode is inactive.
Actual panel visibility is separate from the outer column: that column can also
contain the render entity tree and need not be hidden for this check to pass.

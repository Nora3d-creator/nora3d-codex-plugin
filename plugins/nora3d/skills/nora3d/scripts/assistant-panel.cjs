'use strict';

// Pure presentation planner. All browser observations and actions stay with the
// host; this module has no browser, network, storage or credential access.
function scope(tab) {
  if (!tab || typeof tab.browser_id !== 'string' || !tab.browser_id ||
      typeof tab.tab_id !== 'string' || !tab.tab_id || typeof tab.url !== 'string') return null;
  try {
    const url = new URL(tab.url);
    if (url.origin !== 'https://app.nora3d.ai' || url.username || url.password ||
        !/^\/cad\/workspace\/p\/[^/]+\/d\/[^/]+\/?$/.test(url.pathname)) return null;
    return {browser_id:tab.browser_id, tab_id:tab.tab_id, url:tab.url};
  } catch { return null; }
}

function sameScope(a, b) {
  return a && b && a.browser_id === b.browser_id && a.tab_id === b.tab_id && a.url === b.url;
}

function planAssistantPanel(input = {}) {
  const target = scope(input.tab);
  const observation = input.observation || {};
  const prior = input.previous;
  const result = (status, extra = {}) => ({status, action:null, ...extra});
  if (input.cancelled === true) return result('cancelled');
  if (!target || input.plugin_owned !== true) return result('scope_not_authorized');
  if (!sameScope(target, scope(observation.tab)) ||
      (prior && !sameScope(target, scope(prior.scope)))) return result('stale_scope');
  if (typeof observation.id !== 'string' || !observation.id.trim()) return result('fresh_observation_required');
  if (prior && (prior.observation_id === observation.id ||
      !Number.isInteger(prior.attempts) || prior.attempts < 0 || prior.attempts > 2)) {
    return result('fresh_observation_required');
  }
  const attempts = prior ? prior.attempts : 0;
  const state = (phase, count = attempts) => ({scope:target, observation_id:observation.id, attempts:count, phase});
  const panel = observation.panel || {};
  const toggle = observation.toggle || {};

  // A missing element may mean an incomplete page/snapshot, not a hidden panel.
  if (panel.present !== true || typeof panel.visible !== 'boolean' ||
      toggle.present !== true || typeof toggle.expanded !== 'boolean' ||
      toggle.controls !== 'partAiWrapper') return result('state_unknown');
  if (!panel.visible && !toggle.expanded) return result('hidden', {state:state('hidden')});
  // Once the user brings the panel back, do not fight that choice in this scope.
  if (input.user_reopened === true || (prior && prior.phase === 'hidden')) {
    return result('respect_reopened_panel', {state:state('reopened')});
  }
  if (prior && prior.phase === 'reopened') return result('respect_reopened_panel', {state:state('reopened')});
  if (prior && prior.phase === 'stopped') return result('collapse_not_confirmed', {state:state('stopped')});
  if (observation.render_active === true) return result('render_view_active');
  if (observation.render_active !== false) return result('state_unknown');
  if (observation.busy === true || observation.recovery_pending === true || observation.blocker_visible === true) {
    return result('ui_blocked');
  }
  if (observation.busy !== false || observation.recovery_pending !== false || observation.blocker_visible !== false) {
    return result('state_unknown');
  }
  if (panel.visible !== toggle.expanded) return result('state_inconsistent');
  if (toggle.visible !== true || toggle.enabled !== true) return result('control_unavailable');
  if (attempts >= 2) return result('collapse_not_confirmed', {state:state('stopped')});
  if (attempts === 1 && input.alternate_available !== true) {
    return result('collapse_not_confirmed', {state:state('stopped')});
  }
  return result(attempts ? 'alternate_required' : 'collapse_required', {
    action:'activate_observed_assistant_toggle',
    interaction:attempts ? 'documented_alternate' : 'documented_primary',
    state:state('attempted', attempts + 1),
    verify:['same_browser_tab_and_url', 'aria_expanded_false', 'assistant_panel_hidden'],
  });
}

module.exports = {planAssistantPanel};
if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', part => { data += part; });
  process.stdin.on('end', () => {
    try { process.stdout.write(JSON.stringify(planAssistantPanel(JSON.parse(data))) + '\n'); }
    catch { process.stdout.write(JSON.stringify({status:'invalid_input', action:null}) + '\n'); process.exitCode = 1; }
  });
}

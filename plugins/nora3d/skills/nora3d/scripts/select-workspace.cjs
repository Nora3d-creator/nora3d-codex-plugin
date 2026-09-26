'use strict';
// Pure routing checks only: no network, credentials, browser mutation or CAD writes.
function selectWorkspace({tab, listing, binding, context} = {}) {
  let url;
  try { url = new URL(tab?.url); } catch { return {status:'invalid_tab'}; }
  const ids = url.pathname.match(/^\/cad\/workspace\/p\/([a-zA-Z0-9_-]+)\/d\/([a-zA-Z0-9_-]+)\/?$/);
  if (url.origin !== 'https://app.nora3d.ai' || url.username || url.password || !ids || !tab.browser_id || !tab.tab_id) return {status:'invalid_tab'};
  if (listing?.deployment?.nora_url !== 'https://app.nora3d.ai' || listing?.deployment?.mcp_url !== 'https://mcp.nora3d.ai/mcp') return {status:'deployment_mismatch'};
  if (!Array.isArray(listing.workspaces)) return {status:'invalid_listing'};
  const [project, document] = ids.slice(1);
  const candidates = listing.workspaces.filter(w => w.project_id === project && w.document_id === document && w.connected === true && w.workspace_id && w.session_epoch);
  let workspace;
  if (binding) {
    if (binding.browser_id !== tab.browser_id || binding.tab_id !== tab.tab_id || binding.project_id !== project || binding.document_id !== document) return {status:'tab_changed'};
    const bound = candidates.filter(w => w.workspace_id === binding.workspace_id && w.session_epoch === binding.session_epoch);
    if (bound.length !== 1) return {status:'session_changed'};
    workspace = bound[0];
  } else {
    if (!candidates.length) return {status:'document_unavailable'};
    if (candidates.length !== 1) return {status:'ambiguous_session',count:candidates.length};
    workspace = candidates[0];
  }
  const context_arguments = {workspace_id:workspace.workspace_id,expected_project_id:project,expected_document_id:document,expected_session_epoch:workspace.session_epoch};
  if (!context) return {status:'context_required',context_arguments};
  if (context.connected !== true || context.workspace_id !== workspace.workspace_id || context.project_id !== project || context.document_id !== document || context.session_epoch !== workspace.session_epoch) return {status:'context_mismatch'};
  for (const key of ['project_id','document_id']) {
    if (context.context?.[key] !== undefined && context.context[key] !== context[key]) return {status:'context_mismatch'};
  }
  if (context.can_write !== true) return {status:'read_only',context_arguments};
  const modeling = context.context?.modeling;
  if (!modeling || typeof modeling.has_draft !== 'boolean' || typeof modeling.is_busy !== 'boolean' || typeof modeling.pending_saves !== 'number') return {status:'context_incomplete'};
  if (modeling.is_busy || modeling.has_draft || modeling.pending_saves > 0 || modeling.active_command) return {status:'document_busy',context_arguments};
  return {status:'connected',context_arguments,binding:{browser_id:tab.browser_id,tab_id:tab.tab_id,project_id:project,document_id:document,workspace_id:workspace.workspace_id,session_epoch:workspace.session_epoch}};
}

module.exports = {selectWorkspace};
if (require.main === module) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', part => {
    input += part;
    if (Buffer.byteLength(input, 'utf8') > 4 * 1024 * 1024) {
      process.stderr.write('Input exceeds 4 MiB; use the compact workspace list.\n');
      process.exit(1);
    }
  });
  process.stdin.on('end', () => {
    try { process.stdout.write(JSON.stringify(selectWorkspace(JSON.parse(input))) + '\n'); }
    catch { process.stderr.write('Invalid workspace selection input.\n'); process.exitCode = 1; }
  });
}

'use strict';

// Uses only the current user's official Codex host protocol. It never reads or
// edits credential stores, creates a server alias, or changes Web configuration.
const {spawn} = require('node:child_process');
const {isAbsolute, basename} = require('node:path');
const {existsSync} = require('node:fs');
const ENDPOINT = 'https://mcp.nora3d.ai/mcp';
const ORIGIN = 'https://mcp.nora3d.ai';
class AuthError extends Error { constructor(code) { super(code); this.code = code; } }
const fail = code => { throw new AuthError(code); };

function stopOwnedProcess(child) {
  if (child.exitCode !== null) return;
  // Keep a drain-only error handler until close: kill/pipe teardown can emit an
  // asynchronous OS error after our normal protocol listeners were detached.
  const ignore = () => {};
  const finished = () => { child.removeListener('error', ignore); child.removeListener('close', finished); child.stdin?.removeListener('error', ignore); };
  child.on('error', ignore); child.once('close', finished); child.stdin?.on('error', ignore);
  child.stdin?.destroy();
  try { child.kill(); } catch { finished(); }
}

function validateMetadata(row) {
  if (!row || typeof row.name !== 'string' || !/^[\w.@:/-]{1,200}$/.test(row.name) || row.enabled !== true ||
      !['http', 'streamable_http'].includes(row.transport?.type) || row.transport.url !== ENDPOINT) fail('unexpected_server_configuration');
  const t = row.transport;
  if (t.bearer_token_env_var || t.http_headers_helper ||
      [t.http_headers, t.env_http_headers].some(headers => headers && Object.keys(headers).some(key => /^(proxy-)?authorization$/i.test(key)))) fail('non_oauth_credentials_configured');
  return row.name;
}

function selectServer(rows) {
  if (!Array.isArray(rows)) fail('invalid_host_metadata');
  const matches = rows.filter(row => row?.enabled === true && row.transport?.url === ENDPOINT);
  if (!matches.length) fail('server_not_available_in_current_host');
  if (matches.length !== 1) fail('host_server_ambiguous');
  return validateMetadata(matches[0]);
}

function validateAuthorizationUrl(value) {
  let url;
  try { url = new URL(value); } catch { fail('unexpected_authorization_url'); }
  if (url.origin !== ORIGIN || url.username || url.password || url.hash ||
      !/^\/(authorize(?:\/|$)|connect\/[^/]+$)/.test(url.pathname)) fail('unexpected_authorization_url');
  // Only the provider entry URL may leave the helper. Callback URLs/tokens never do.
  if (['access_token', 'refresh_token', 'code', 'id_token'].some(key => url.searchParams.has(key))) fail('unexpected_authorization_url');
  return url.href;
}

// Use only an observed Continue-in-Nora3D link from this attempt and the exact
// intended document URL. This is a plan for a NEW auth-only tab, never navigation
// of the user's model tab. PKCE/state/callback protocol parameters are not edited.
function buildConsentTabUrl(continuation, document) {
  let source, target;
  try { source = new URL(continuation); target = new URL(document); } catch { fail('invalid_consent_target'); }
  if ([source, target].some(url => url.origin !== 'https://app.nora3d.ai' || url.username || url.password || url.hash) ||
      !/^\/cad\/workspace\/p\/[\w-]{1,128}\/d\/[\w-]{1,128}$/.test(target.pathname)) fail('invalid_consent_target');
  const ids = source.searchParams.getAll('codex_authorization');
  const gateways = source.searchParams.getAll('codex_gateway');
  if (ids.length !== 1 || !/^[\w-]{1,256}$/.test(ids[0]) || gateways.length !== 1 || gateways[0] !== ORIGIN ||
      ['access_token', 'refresh_token', 'code', 'id_token'].some(key => source.searchParams.has(key))) fail('invalid_consent_target');
  target.searchParams.set('codex_authorization', ids[0]); target.searchParams.set('codex_gateway', ORIGIN);
  target.searchParams.set('legacy_assistant', '1');
  return target.href;
}

async function readMetadata(cli, {spawnProcess = spawn, signal, timeoutMs = 15000} = {}) {
  return new Promise((resolve, reject) => {
    let output = '', settled = false;
    const child = spawnProcess(cli, ['mcp', 'list', '--json'], {windowsHide: true, stdio: ['ignore', 'pipe', 'ignore']});
    const finish = (error, result) => {
      if (settled) return; settled = true; clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      child.stdout.removeListener('data', data); child.removeListener('error', failed); child.removeListener('close', closed);
      stopOwnedProcess(child);
      error ? reject(new AuthError(error)) : resolve(result);
    };
    const data = chunk => { output += chunk; if (Buffer.byteLength(output) > 4 * 1024 * 1024) finish('host_metadata_limit'); };
    const failed = () => finish('host_start_failed');
    const cancel = () => finish('authorization_cancelled');
    const closed = code => {
      if (code !== 0) return finish('host_metadata_unavailable');
      try { finish(null, selectServer(JSON.parse(output))); } catch (error) { finish(error instanceof AuthError ? error.code : 'invalid_host_metadata'); }
    };
    const timer = setTimeout(() => finish('host_metadata_timeout'), timeoutMs);
    child.stdout.on('data', data); child.on('error', failed); child.on('close', closed);
    signal?.addEventListener('abort', cancel, {once: true}); if (signal?.aborted) cancel();
  });
}

class HostRpc {
  constructor(cli, {spawnProcess = spawn, signal, requestTimeoutMs = 15000} = {}) {
    this.child = spawnProcess(cli, ['app-server', '--stdio'], {windowsHide: true, stdio: ['pipe', 'pipe', 'ignore']});
    this.pending = new Map(); this.sequence = 0; this.buffer = ''; this.closed = false;
    this.signal = signal; this.requestTimeoutMs = requestTimeoutMs; this.notifications = new Set();
    this.onData = chunk => {
      this.buffer += chunk;
      if (Buffer.byteLength(this.buffer) > 4 * 1024 * 1024) return this.close('host_response_limit');
      let index;
      while ((index = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, index); this.buffer = this.buffer.slice(index + 1);
        let message; try { message = JSON.parse(line); } catch { return this.close('invalid_host_response'); }
        if (!message || typeof message !== 'object' || Array.isArray(message)) return this.close('invalid_host_response');
        if (message.method) {
          if (message.id !== undefined) return this.close('host_interaction_required');
          for (const listener of this.notifications) listener(message);
        } else {
          const job = this.pending.get(message?.id);
          if (job) { this.pending.delete(message.id); clearTimeout(job.timer);
            message.error ? job.reject(new AuthError('host_request_failed')) : job.resolve(message.result); }
        }
      }
    };
    this.onClose = () => this.close('host_closed');
    this.onAbort = () => this.close('authorization_cancelled');
    this.child.stdout.on('data', this.onData); this.child.on('error', this.onClose); this.child.on('close', this.onClose);
    this.child.stdin.on('error', this.onClose);
    signal?.addEventListener('abort', this.onAbort, {once: true}); if (signal?.aborted) this.onAbort();
  }
  send(value) { if (this.closed) fail('host_closed'); this.child.stdin.write(JSON.stringify(value) + '\n'); }
  request(method, params) {
    if (!['initialize', 'mcpServerStatus/list', 'mcpServer/oauth/login'].includes(method)) return Promise.reject(new AuthError('method_not_allowed'));
    if (this.closed) return Promise.reject(new AuthError('host_closed'));
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => this.close('host_request_timeout'), this.requestTimeoutMs);
      this.pending.set(id, {resolve, reject, timer}); this.send({id, method, params});
    });
  }
  completion(name, timeoutMs) {
    return new Promise((resolve, reject) => {
      const handler = message => {
        if (message.method !== 'mcpServer/oauthLogin/completed' || message.params?.name !== name || message.params.threadId != null) return;
        cleanup(); message.params.success === true ? resolve() : reject(new AuthError('oauth_failed_or_cancelled'));
      };
      const cleanup = () => { clearTimeout(timer); this.notifications.delete(handler); this.onCompletionFailure = null; };
      const timer = setTimeout(() => { cleanup(); reject(new AuthError('oauth_timeout')); }, timeoutMs);
      this.onCompletionFailure = code => { cleanup(); reject(new AuthError(code)); };
      this.notifications.add(handler);
    });
  }
  close(reason = 'host_closed') {
    if (this.closed) return; this.closed = true;
    for (const job of this.pending.values()) { clearTimeout(job.timer); job.reject(new AuthError(reason)); }
    this.pending.clear(); this.onCompletionFailure?.(reason); this.notifications.clear();
    this.signal?.removeEventListener('abort', this.onAbort);
    this.child.stdout.removeListener('data', this.onData); this.child.removeListener('error', this.onClose); this.child.removeListener('close', this.onClose);
    this.child.stdin.removeListener('error', this.onClose); stopOwnedProcess(this.child);
  }
}

async function run(options, dependencies = {}) {
  const {mode = 'Check', cli, timeoutSeconds = 600, consentSurfaceAvailable = false, signal} = options;
  if (!['Check', 'Login'].includes(mode) || !Number.isInteger(timeoutSeconds) || timeoutSeconds < 1 || timeoutSeconds > 600) fail('invalid_arguments');
  if (!cli || !isAbsolute(cli) || !/^codex(?:\.exe)?$/i.test(basename(cli)) || !existsSync(cli)) fail('host_cli_unavailable');
  if (mode === 'Login' && !consentSurfaceAvailable) fail('consent_surface_unavailable');
  const emit = dependencies.emit || (record => process.stdout.write(JSON.stringify(record) + '\n'));
  const name = await (dependencies.readMetadata || readMetadata)(cli, {signal});
  const rpc = (dependencies.createRpc || ((...args) => new HostRpc(...args)))(cli, {signal});
  try {
    await rpc.request('initialize', {clientInfo: {name: 'nora_account_authorization', version: '1.0.0'}});
    rpc.send({method: 'initialized'});
    let cursor, found = [], seen = new Set();
    for (let page = 0; page < 20; page++) {
      const result = await rpc.request('mcpServerStatus/list', {detail: 'toolsAndAuthOnly', limit: 100, ...(cursor ? {cursor} : {})});
      if (!Array.isArray(result?.data)) fail('invalid_host_inventory');
      found.push(...result.data.filter(row => row?.name === name));
      cursor = result.nextCursor; if (cursor == null) break;
      if (typeof cursor !== 'string' || !cursor || seen.has(cursor) || page === 19) fail('invalid_host_pagination'); seen.add(cursor);
    }
    if (found.length !== 1 || found[0].httpOrigin !== ORIGIN || found[0].runtimeStatus === 'disabled') fail('host_server_not_verified');
    if (found[0].runtimeStatus != null && !['notStarted', 'starting', 'connected', 'authenticationRequired', 'failed', 'cancelled'].includes(found[0].runtimeStatus)) fail('unknown_host_runtime_status');
    if (!['oAuth', 'notLoggedIn'].includes(found[0].authStatus)) fail('host_oauth_not_supported');
    emit({status: 'host_ready', server: name, url: ENDPOINT, auth_status: found[0].authStatus, consent_surface_verified: false});
    if (mode === 'Check') return;
    const completed = rpc.completion(name, timeoutSeconds * 1000);
    // Attach a rejection handler before requesting Login so early failure is observed.
    const completion = completed.then(() => null, error => error);
    const result = await rpc.request('mcpServer/oauth/login', {name, timeoutSecs: timeoutSeconds});
    emit({status: 'authorization_required', authorization_url: validateAuthorizationUrl(result?.authorizationUrl), requires_user_authorization: true});
    const error = await completion; if (error) throw error;
    emit({status: 'oauth_callback_completed', requires_mcp_verification: true, desktop_transport_refreshed: false});
  } finally { rpc.close(); }
}

if (require.main === module) {
  const args = process.argv.slice(2), options = {cli: process.env.CODEX_CLI_PATH};
  try {
    for (let i = 0; i < args.length; i++) {
      const key = args[i];
      if (key === '--consent-surface-available') options.consentSurfaceAvailable = true;
      else if (['--mode', '--cli', '--timeout-seconds'].includes(key) && args[i + 1]) options[{'--mode': 'mode', '--cli': 'cli', '--timeout-seconds': 'timeoutSeconds'}[key]] = key === '--timeout-seconds' ? Number(args[++i]) : args[++i];
      else fail('invalid_arguments');
    }
    const controller = new AbortController(); options.signal = controller.signal;
    const cancel = () => controller.abort(); process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
    run(options).catch(error => { process.stdout.write(JSON.stringify({status: error instanceof AuthError ? error.code : 'host_authorization_failed'}) + '\n'); process.exitCode = 1; })
      .finally(() => { process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); });
  } catch (error) { process.stdout.write(JSON.stringify({status: error instanceof AuthError ? error.code : 'invalid_arguments'}) + '\n'); process.exitCode = 1; }
}
module.exports = {run, selectServer, validateMetadata, validateAuthorizationUrl, buildConsentTabUrl, readMetadata, HostRpc, AuthError};

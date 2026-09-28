'use strict';
// Optional offline processing at a batch/task boundary. No files, network or CAD.
// Input: one raw Nora operation/batch/context JSON or MCP CallToolResult.
// CLI: node modeling-evidence.cjs compact|record < response.json
// Output is untrusted evidence summary, never an executable response or recipe.
const {createHash} = require('node:crypto');
const {isDeepStrictEqual} = require('node:util');
const MAX_BYTES = 8 * 1024 * 1024;
const BULK_KEYS = new Set(['positions','indices','vertices','normals','points','source_triangles']);
const SECRET_KEY = /^(?:authorization|proxy_authorization|cookie|set_cookie|password|api_key|apikey|access_token|refresh_token|browser_token|client_secret|bearer_token)$/i;
const LIMITS = Object.freeze({summary_only:true, requires_original:true, permits_cad_write:false,
  certifies_geometry:false, warning:'Use the original current response for CAD writes, geometry checks and omitted data. A hash does not authenticate a receipt.'});
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.length > 0;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pointer = key => String(key).replace(/~/g,'~0').replace(/\//g,'~1');

function checkJSON(value, depth = 0, seen = new Set()) {
  if (depth > 64) throw new Error('input_depth_limit');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) {
    // JSON.parse cannot preserve integer IDs beyond JavaScript's exact range.
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) throw new Error('unsafe_json_integer');
    return;
  }
  if (typeof value !== 'object' || seen.has(value)) throw new Error('invalid_json_value');
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new Error('invalid_json_value');
  seen.add(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === 'length') continue;
    if (!('value' in descriptor)) throw new Error('invalid_json_value');
    if (SECRET_KEY.test(key.replace(/-/g,'_'))) throw new Error('credential_field');
    checkJSON(descriptor.value, depth + 1, seen);
  }
  seen.delete(value);
}

function unwrap(input) {
  if (!object(input)) throw new Error('unknown_response_shape');
  if (!('structuredContent' in input) && !('content' in input)) return {receipt:input, transport:null};
  if (Object.keys(input).some(key => !['structuredContent','content','isError','_meta'].includes(key))) throw new Error('unknown_mcp_envelope');
  if (input.content !== undefined && !Array.isArray(input.content)) throw new Error('unknown_mcp_envelope');
  const content = input.content || [];
  if (content.some(item => !object(item) || !['text','image'].includes(item.type))) throw new Error('unknown_mcp_content');
  const texts = content.filter(item => item.type === 'text');
  if (texts.length > 1 || (texts[0] && typeof texts[0].text !== 'string')) throw new Error('ambiguous_mcp_content');
  let parsed;
  if (texts.length) {
    try { parsed = JSON.parse(texts[0].text); } catch { throw new Error('non_json_mcp_content'); }
  }
  if (input.structuredContent !== undefined && parsed !== undefined && !isDeepStrictEqual(input.structuredContent, parsed)) throw new Error('conflicting_mcp_content');
  const receipt = input.structuredContent === undefined ? parsed : input.structuredContent;
  const transport = Object.fromEntries(Object.entries(input).filter(([key]) => key !== 'structuredContent'));
  return {receipt, transport};
}

function receiptKind(receipt) {
  if (!object(receipt) || !['workspace_id','project_id','document_id','version_id','session_epoch'].every(key => nonempty(receipt[key]))) return null;
  if (nonempty(receipt.operation_id) && nonempty(receipt.status)) return 'operation';
  if (nonempty(receipt.batch_id) && nonempty(receipt.status) && Array.isArray(receipt.steps)) return 'batch';
  if (nonempty(receipt.context_token) && typeof receipt.connected === 'boolean') {
    if (object(receipt.context) && typeof receipt.can_write === 'boolean') return 'workspace_context';
    if (object(receipt.modeling)) return 'compact_context';
  }
  return null;
}

function numericBuffer(value) {
  return Array.isArray(value) && value.length >= 128 && value.every(item =>
    typeof item === 'number' || (Array.isArray(item) && item.length > 0 && item.length <= 4 && item.every(n => typeof n === 'number')));
}

function compact(input) {
  // Do not return raw data on malformed/unknown inputs; the caller must inspect it.
  try {
    checkJSON(input);
    if (Buffer.byteLength(JSON.stringify(input),'utf8') > MAX_BYTES) throw new Error('input_size_limit');
    const {receipt, transport} = unwrap(input);
    checkJSON(receipt);
    const kind = receiptKind(receipt);
    if (!kind) throw new Error('unknown_response_shape');
    const omitted = [];
    function omit(value, path, representation) {
      omitted.push({path, type:typeof value === 'string' ? 'string' : 'array', count:value.length,
        sha256:hash(value), requires_original:true, ...(representation ? {representation} : {})});
      return {$omitted:path};
    }
    function copy(value, path = '', key = '') {
      // Preserve every other key, including unfamiliar safety/error/accuracy fields.
      const inResult = path.startsWith('/result/') || /^\/steps\/\d+\/result\//.test(path);
      if (inResult && BULK_KEYS.has(key) && numericBuffer(value)) return omit(value,path);
      if (inResult && key === 'image' && typeof value === 'string' && /^data:image\//.test(value)) return omit(value,path);
      if (Array.isArray(value)) return value.map((item,i) => copy(item,`${path}/${i}`,String(i)));
      if (object(value)) return Object.fromEntries(Object.entries(value).map(([name,item]) => [name,copy(item,`${path}/${pointer(name)}`,name)]));
      return value;
    }
    const summary = copy(receipt);
    let transportSummary;
    if (transport) {
      transportSummary = copy(transport);
      transportSummary.content = (transport.content || []).map((item,i) => {
        if (item.type === 'text') return {...item,text:omit(item.text,`/content/${i}/text`,'receipt')};
        if (typeof item.data !== 'string') throw new Error('unknown_mcp_image');
        return {...item,data:omit(item.data,`/content/${i}/data`)};
      });
    }
    return {schema_version:1, status:'compacted', receipt_kind:kind, ...LIMITS,
      source_sha256:hash(input), receipt:summary, ...(transportSummary ? {transport:transportSummary} : {}), omitted};
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid_input';
    const known = new Set(['input_depth_limit','invalid_json_value','unsafe_json_integer','credential_field','unknown_response_shape',
      'unknown_mcp_envelope','unknown_mcp_content','ambiguous_mcp_content','non_json_mcp_content',
      'conflicting_mcp_content','input_size_limit','unknown_mcp_image']);
    return {schema_version:1,status:'needs_original',reason:known.has(reason) ? reason : 'invalid_input',...LIMITS};
  }
}

function record(input) {
  const summary = compact(input);
  return {schema_version:1,kind:'modeling_experience_candidate',
    status:summary.status === 'compacted' ? 'observed' : 'needs_original',
    promotion_state:'candidate',verified_recipe:false,source_authenticity:'not_verified',
    evidence_level:'caller_supplied_receipt_only',
    ...(summary.source_sha256 ? {candidate_id:`observed-${summary.source_sha256}`} : {}),summary};
}

module.exports = {compact,record};
if (require.main === module) {
  const mode = process.argv[2];
  if (!['compact','record'].includes(mode) || process.argv.length !== 3) {
    process.stderr.write('Usage: node modeling-evidence.cjs compact|record < response.json\n');
    process.exitCode = 1;
  } else {
    const chunks = []; let size = 0;
    process.stdin.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BYTES) { process.stderr.write('Input exceeds 8 MiB.\n'); process.exit(1); }
      chunks.push(chunk);
    });
    process.stdin.on('end', () => {
      try {
        const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        process.stdout.write(JSON.stringify((mode === 'compact' ? compact : record)(input))+'\n');
      } catch { process.stderr.write('Invalid JSON input.\n'); process.exitCode = 1; }
    });
    process.stdin.on('error', () => { process.stderr.write('Could not read input.\n'); process.exitCode = 1; });
  }
}

'use strict';
// Task-local, caller-selected JSON only. No filesystem, network, model or CAD calls.
// A manifest declares scope; neither it nor a content hash proves authorization,
// authenticity or geometry. The host must obtain task authorization before loading.
// CLI: node modeling-memory.cjs buildCandidate|retrieve < selected-input.json
const {createHash} = require('node:crypto');
const MAX_BYTES = 8 * 1024 * 1024;
const METHODS = ['box','hole','edit_extrude'];
const STATUSES = ['succeeded','failed','cancelled','partial','unknown','draft_applied','reconciling',
  'reconciled_unknown','queued','dispatched','running','pending','timed_out','aborted','needs_codex'];
const FLAGS = Object.freeze({schema_version:1,kind:'modeling_recipe_candidate',promotion_state:'candidate',
  verified_recipe:false,certifies_geometry:false,authorization_granted:false,executes_cad:false,
  source_authenticity:'not_verified',authorization_basis:'caller_declared_task_scope_only',
  requires_current_revalidation:true});
const SECRET_KEY = /^(?:authorization|proxy_authorization|cookie|set_cookie|password|api_?key|access_token|refresh_token|browser_token|client_secret|bearer_token|private_key)$/i;
const SECRET_TEXT = /\bBearer\s+\S+|-----BEGIN [A-Z ]*PRIVATE KEY-----|["']?(?:api[_-]?key|access[_-]token|refresh[_-]token|password)["']?\s*[:=]\s*\S+/i;
const RESERVED_PARAMETER = /(?:^|_)(?:id|ids|token|uuid|session|revision|path|script|code|url)(?:_|$)/i;
const REASONS = new Set(['input_depth_limit','credential_text','unsafe_json_number','invalid_json_value','credential_field',
  'input_size_limit','invalid_versions','invalid_parameters','invalid_recipe','invalid_domain','invalid_episode',
  'invalid_input','invalid_manifest','invalid_records','record_not_in_manifest','invalid_evidence_record',
  'invalid_candidate','candidate_hash_mismatch','invalid_query']);
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (v,k) => Object.prototype.hasOwnProperty.call(v,k);
const fail = reason => {throw new Error(reason);};
const token = v => typeof v === 'string' && /^[a-zA-Z][a-zA-Z0-9_.:-]{0,127}$/.test(v);
const digest = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const finite = v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e6;
const exact = (v,keys,reason) => {
  if(!object(v)||Object.keys(v).length!==keys.length||keys.some(k=>!own(v,k)))fail(reason);
};
function checkJSON(value,depth=0,seen=new Set()) {
  if(depth>48)fail('input_depth_limit');
  if(value===null||typeof value==='boolean')return;
  if(typeof value==='string'){if(SECRET_TEXT.test(value))fail('credential_text');return;}
  if(typeof value==='number'){
    if(!Number.isFinite(value)||(Number.isInteger(value)&&!Number.isSafeInteger(value)))fail('unsafe_json_number');return;
  }
  if(typeof value!=='object'||seen.has(value))fail('invalid_json_value');
  if(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value)))fail('invalid_json_value');
  if(Array.isArray(value)&&(value.length>262144||Object.keys(value).length!==value.length))fail('invalid_json_value');
  seen.add(value);
  for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))){
    if(Array.isArray(value)&&key==='length')continue;
    if(!('value' in descriptor)||!descriptor.enumerable||key==='__proto__'||key==='constructor'||key==='prototype'||
      (Array.isArray(value)&&!/^(0|[1-9]\d*)$/.test(key)))fail('invalid_json_value');
    if(SECRET_KEY.test(key.replace(/-/g,'_')))fail('credential_field');
    checkJSON(descriptor.value,depth+1,seen);
  }
  if(Object.getOwnPropertySymbols(value).length)fail('invalid_json_value');
  seen.delete(value);
}
function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(object(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function contentHash(value){
  checkJSON(value);const text=canonical(value);
  if(Buffer.byteLength(text)>MAX_BYTES)fail('input_size_limit');
  return createHash('sha256').update(text).digest('hex');
}
function tokens(value,reason){
  if(!Array.isArray(value)||value.length>32||value.some(v=>!token(v))||new Set(value).size!==value.length)fail(reason);
}
function versions(v){
  exact(v,['catalog_revision','compiler_version','verifier_version'],'invalid_versions');
  if(Object.values(v).some(x=>typeof x!=='string'||!x.length||x.length>128||!/^[a-zA-Z0-9_.:-]+$/.test(x)))fail('invalid_versions');
}
function numericMap(v){
  if(!object(v)||Object.keys(v).length===0||Object.keys(v).length>16||
    Object.entries(v).some(([k,n])=>!/^([a-z][a-z0-9_]{0,63})$/.test(k)||RESERVED_PARAMETER.test(k)||!finite(n)))fail('invalid_parameters');
}
function recipeValid(r){
  exact(r,['method','version','units','coordinate_contract','versions','parameter_domain','parameters',
    'required_capabilities','preconditions','acceptance'],'invalid_recipe');
  if(!METHODS.includes(r.method)||typeof r.version!=='string'||!/^\d+(?:\.\d+)*$/.test(r.version)||
    !['mm','inch'].includes(r.units)||!token(r.coordinate_contract))fail('invalid_recipe');
  versions(r.versions);numericMap(r.parameters);
  if(!object(r.parameter_domain)||Object.keys(r.parameter_domain).length!==Object.keys(r.parameters).length)fail('invalid_domain');
  for(const [key,n] of Object.entries(r.parameters)){
    const d=r.parameter_domain[key];exact(d,['min','max'],'invalid_domain');
    if(!finite(d.min)||!finite(d.max)||d.min>d.max||n<d.min||n>d.max)fail('invalid_domain');
  }
  for(const k of ['required_capabilities','preconditions','acceptance'])tokens(r[k],'invalid_recipe');
  if(!r.required_capabilities.length||!r.acceptance.length)fail('invalid_recipe');
}
function episodeValid(e){
  exact(e,['reported_outcome'],'invalid_episode');
  if(!['succeeded','failed','cancelled','partial','unknown'].includes(e.reported_outcome))fail('invalid_episode');
}
function selected(input,keys){
  contentHash(input);exact(input,keys,'invalid_input');
  const m=input.manifest;exact(m,['schema_version','task_scope','authorization_ref','record_hashes'],'invalid_manifest');
  if(m.schema_version!==1||!token(m.task_scope)||!token(m.authorization_ref)||!Array.isArray(m.record_hashes)||
    m.record_hashes.length>32||m.record_hashes.some(h=>!digest(h))||new Set(m.record_hashes).size!==m.record_hashes.length)fail('invalid_manifest');
  if(!Array.isArray(input.records)||!input.records.length||input.records.length>32)fail('invalid_records');
  const records=new Map();
  for(const r of input.records){const hash=contentHash(r);if(!m.record_hashes.includes(hash))fail('record_not_in_manifest');records.set(hash,r);}
  return [...records].sort(([a],[b])=>a.localeCompare(b));
}
function adverse(v,path=''){
  if(Array.isArray(v))return v.some((item,i)=>adverse(item,path+'/'+i));
  if(!object(v))return false;
  const saveAck=/^\/(?:steps\/\d+\/)?result\/saves\/\d+$/.test(path);
  if(v.error||v.ok===false||v.full_acceptance_passed===false||
    (own(v,'status')&&!['succeeded','pass','skipped'].includes(v.status)&&!(saveAck&&v.status==='saved')))return true;
  return Object.entries(v).some(([key,item])=>adverse(item,path+'/'+key.replace(/~/g,'~0').replace(/\//g,'~1')));
}
function evidenceRef(hash,r){
  if(!object(r)||r.schema_version!==1||r.kind!=='modeling_experience_candidate'||r.promotion_state!=='candidate'||
    r.verified_recipe!==false||r.source_authenticity!=='not_verified'||r.evidence_level!=='caller_supplied_receipt_only'||
    !['observed','needs_original'].includes(r.status)||!object(r.summary))fail('invalid_evidence_record');
  const s=r.summary,receipt=s.receipt;
  if(s.schema_version!==1||s.summary_only!==true||s.requires_original!==true||s.permits_cad_write!==false||s.certifies_geometry!==false||
    (r.status==='observed'&&(s.status!=='compacted'||!object(receipt)||!digest(s.source_sha256)))||
    (r.status==='needs_original'&&s.status!=='needs_original'))fail('invalid_evidence_record');
  const known=STATUSES.includes(receipt?.status),kind=['operation','batch','workspace_context','compact_context'].includes(s.receipt_kind)?s.receipt_kind:'unknown';
  return {record_sha256:hash,source_sha256:digest(s.source_sha256)?s.source_sha256:null,receipt_kind:kind,
    reported_status:known?receipt.status:'unknown',needs_original:r.status!=='observed',
    transport_error:s.transport?.isError===true,receipt_error:!!receipt?.error,
    has_adverse_steps:Array.isArray(receipt?.steps)&&receipt.steps.some((step,i)=>adverse(step,'/steps/'+i)),
    contains_adverse_evidence:!known||kind==='unknown'||r.status!=='observed'||s.transport?.isError===true||adverse(receipt)};
}
const refKeys=['record_sha256','source_sha256','receipt_kind','reported_status','needs_original','transport_error',
  'receipt_error','has_adverse_steps','contains_adverse_evidence'];
function candidateValid(c){
  exact(c,[...Object.keys(FLAGS),'scope_sha256','recipe','episode','evidence_refs','contains_adverse_evidence','candidate_id'],'invalid_candidate');
  if(Object.entries(FLAGS).some(([k,v])=>c[k]!==v)||!digest(c.scope_sha256))fail('invalid_candidate');
  recipeValid(c.recipe);episodeValid(c.episode);
  if(!Array.isArray(c.evidence_refs)||!c.evidence_refs.length||c.evidence_refs.length>32)fail('invalid_candidate');
  for(const ref of c.evidence_refs){
    exact(ref,refKeys,'invalid_candidate');
    if(!digest(ref.record_sha256)||(ref.source_sha256!==null&&!digest(ref.source_sha256))||!STATUSES.includes(ref.reported_status)||
      !['operation','batch','workspace_context','compact_context','unknown'].includes(ref.receipt_kind)||
      refKeys.slice(4).some(k=>typeof ref[k]!=='boolean')||
      ((ref.reported_status!=='succeeded'||ref.needs_original||ref.transport_error||ref.receipt_error||ref.has_adverse_steps)&&!ref.contains_adverse_evidence))fail('invalid_candidate');
  }
  if(new Set(c.evidence_refs.map(r=>r.record_sha256)).size!==c.evidence_refs.length||
    c.contains_adverse_evidence!==(c.episode.reported_outcome!=='succeeded'||c.evidence_refs.some(r=>r.contains_adverse_evidence)))fail('invalid_candidate');
  const {candidate_id,...body}=c;if(candidate_id!=='candidate-'+contentHash(body))fail('candidate_hash_mismatch');
}
function run(action){try{return action();}catch(error){
  let reason='invalid_input';try{if(REASONS.has(error?.message))reason=error.message;}catch{}
  return {...FLAGS,status:'rejected',reason};
}}
function buildCandidate(input){return run(()=>{
  const rows=selected(input,['manifest','recipe','episode','records']);recipeValid(input.recipe);episodeValid(input.episode);
  const refs=rows.map(([hash,r])=>evidenceRef(hash,r));
  const body={...FLAGS,scope_sha256:contentHash({task_scope:input.manifest.task_scope,authorization_ref:input.manifest.authorization_ref}),
    recipe:JSON.parse(JSON.stringify(input.recipe)),episode:{...input.episode},evidence_refs:refs,
    contains_adverse_evidence:input.episode.reported_outcome!=='succeeded'||refs.some(r=>r.contains_adverse_evidence)};
  return {...FLAGS,status:'candidate_built',candidate:{...body,candidate_id:'candidate-'+contentHash(body)}};
});}
function retrieve(input){return run(()=>{
  const rows=selected(input,['manifest','records','query']),q=input.query;
  exact(q,['method','recipe_version','units','coordinate_contract','versions','parameters','capabilities','limit'],'invalid_query');
  if(!METHODS.includes(q.method)||typeof q.recipe_version!=='string'||!/^\d+(?:\.\d+)*$/.test(q.recipe_version)||
    !['mm','inch'].includes(q.units)||!token(q.coordinate_contract)||!Number.isInteger(q.limit)||q.limit<1||q.limit>8)fail('invalid_query');
  versions(q.versions);numericMap(q.parameters);tokens(q.capabilities,'invalid_query');
  const matches=[],counterexamples=[],excluded=[];
  for(const [,c] of rows){
    candidateValid(c);const r=c.recipe;
    const reason=r.method!==q.method?'method_mismatch':r.version!==q.recipe_version?'recipe_version_mismatch':
      Object.keys(r.versions).some(k=>r.versions[k]!==q.versions[k])?'version_mismatch':r.units!==q.units?'unit_mismatch':
      r.coordinate_contract!==q.coordinate_contract?'coordinate_mismatch':r.required_capabilities.some(v=>!q.capabilities.includes(v))?'missing_capability':
      Object.keys(r.parameter_domain).length!==Object.keys(q.parameters).length||Object.entries(q.parameters).some(([k,v])=>
        !own(r.parameter_domain,k)||v<r.parameter_domain[k].min||v>r.parameter_domain[k].max)?'outside_parameter_domain':null;
    if(reason){excluded.push({candidate_id:c.candidate_id,reason});continue;}
    // Return only the typed reusable descriptor and hashes. Never return raw receipts,
    // stored scope strings, context/selection, IDs, arbitrary prose or executable code.
    const view={...FLAGS,candidate_id:c.candidate_id,recipe:JSON.parse(JSON.stringify(r)),episode:{...c.episode},
      evidence_refs:c.evidence_refs.map(ref=>({...ref})),contains_adverse_evidence:c.contains_adverse_evidence};
    (c.contains_adverse_evidence?counterexamples:matches).push(view);
  }
  return {...FLAGS,status:'retrieved',matches:matches.slice(0,q.limit),counterexamples:counterexamples.slice(0,q.limit),excluded,
    truncated:matches.length>q.limit||counterexamples.length>q.limit,
    totals:{matches:matches.length,counterexamples:counterexamples.length,excluded:excluded.length}};
});}
module.exports={buildCandidate,retrieve,contentHash};
if(require.main===module){
  const mode=process.argv[2];
  if(!['buildCandidate','retrieve'].includes(mode)||process.argv.length!==3){
    process.stderr.write('Usage: node modeling-memory.cjs buildCandidate|retrieve < selected-input.json\n');process.exitCode=1;
  }else{
    const chunks=[];let size=0;
    process.stdin.on('data',chunk=>{size+=chunk.length;if(size>MAX_BYTES){process.stderr.write('Input exceeds 8 MiB.\n');process.exit(1);}chunks.push(chunk);});
    process.stdin.on('end',()=>{try{
      const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      process.stdout.write(JSON.stringify((mode==='buildCandidate'?buildCandidate:retrieve)(input))+'\n');
    }catch{process.stderr.write('Invalid JSON input.\n');process.exitCode=1;}});
    process.stdin.on('error',()=>{process.stderr.write('Could not read input.\n');process.exitCode=1;});
  }
}

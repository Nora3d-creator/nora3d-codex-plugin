'use strict';
// Offline contract prototype. No provider/CAD/file access and no execution rights.
// Caller must authenticate input provenance; hashes only detect accidental drift.
const {createHash}=require('node:crypto');
const VERSION='feature-choice-2-offline-1';
const METHODS=['extrude_profile','cut_profile'];
const ROLES=['base','wall','opening','unknown'];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const canonical=o=>Array.isArray(o)?o.map(canonical):obj(o)?Object.fromEntries(Object.keys(o).sort().map(k=>[k,canonical(o[k])])):o;
const hash=o=>createHash('sha256').update(JSON.stringify(canonical(o))??'undefined').digest('hex');
const string=s=>typeof s==='string'&&s.length>0&&s.length<=256;
const exact=(o,keys)=>obj(o)&&Object.keys(o).length===keys.length&&keys.every(k=>own(o,k));
const result=(status,reason,extra={})=>({status,reason,contract_version:VERSION,executable:false,full_acceptance_passed:false,source_authenticity:'caller_responsibility',...extra});
function prepareDecision(input){
  if(!obj(input)||!exact(input.binding,['scope','source_hash','graph_hash','revision','session_epoch'])||!Object.values(input.binding).every(string)
    ||!exact(input.versions,['algorithm','tolerance','model','rubric'])||!Object.values(input.versions).every(string)
    ||!Number.isFinite(input.now_ms)||!Number.isFinite(input.deadline_ms)||input.deadline_ms<=input.now_ms||input.deadline_ms-input.now_ms>2000
    ||!Array.isArray(input.features)||input.features.length<1||input.features.length>64)return result('invalid','invalid_envelope');
  if(input.cancelled===true)return result('abstain','cancelled');
  if(input.authorized!==true)return result('invalid','authorization_not_confirmed');
  const facts=[],questions={},direct={};
  for(let i=0;i<input.features.length;i++){
    const f=input.features[i],id=`f${i}`;
    if(!exact(f,['proof','legal_methods','requires_role','role_evidence'])
      ||!exact(f.proof,['constant_section','depth','adjacency','coverage'])
      ||!['complete','partial','unknown'].includes(f.proof.coverage)
      ||!['constant_section','depth','adjacency'].every(k=>['proved','disproved','unknown'].includes(f.proof[k]))
      ||typeof f.requires_role!=='boolean'||!['closed_perimeter','broad_panel','side_opening','unknown'].includes(f.role_evidence)
      ||!Array.isArray(f.legal_methods)||f.legal_methods.length>2||new Set(f.legal_methods).size!==f.legal_methods.length
      ||!f.legal_methods.every(m=>METHODS.includes(m)))return result('invalid','invalid_feature');
    if(Object.values(f.proof).includes('disproved')||f.legal_methods.length===0)return result('unsupported','no_proved_legal_method');
    if(f.proof.coverage!=='complete'||['constant_section','depth','adjacency'].some(k=>f.proof[k]!=='proved'))return result('abstain','missing_physical_proof');
    facts.push({id,geometry_facts:f.proof,role_evidence:f.role_evidence,allowed_method_ids:[...f.legal_methods]});
    if(f.legal_methods.length===1)direct[id]={method:f.legal_methods[0]};
    else questions[`method_${id}`]={feature_id:id,instructions:`Choose a method only for features_by_id.${id}, using its proved facts and allowed_method_ids. Choose unknown if unresolved.`,options:[...f.legal_methods,'unknown']};
    if(f.requires_role)questions[`role_${id}`]={feature_id:id,instructions:`Determine the role of features_by_id.${id} from its role_evidence. Choose unknown if unresolved.`,options:ROLES};
  }
  const request={decision_contract:VERSION,features_by_id:Object.fromEntries(facts.map(f=>[f.id,f])),questions};
  const local={binding:{...input.binding},versions:{...input.versions},deadline_ms:input.deadline_ms,
    request,direct,features_sha256:hash(input.features)};
  // This is a local candidate DTO, NOT the current provider or MCP request schema.
  return result(Object.keys(questions).length?'needs_decision':'supported','offline_candidate_only',
    {local,integrity_sha256:hash(local),provider_calls_required:Object.keys(questions).length?1:0,
      ...(Object.keys(questions).length?{}:{choices:direct})});
}
function resolveDecision(prepared,response,current){
  if(!obj(prepared?.local)||prepared.integrity_sha256!==hash(prepared.local))return result('invalid','envelope_drift');
  const p=prepared.local;
  if(current?.cancelled===true)return result('abstain','cancelled');
  if(current?.authorized!==true||hash(current.binding)!==hash(p.binding)||hash(current.versions)!==hash(p.versions)
    ||hash(current.features)!==p.features_sha256)return result('invalid','stale_or_unauthorized');
  if(!Number.isFinite(current.now_ms)||current.now_ms>=p.deadline_ms)return result('abstain','deadline_expired',{usage:'unknown'});
  if(prepared.provider_calls_required===0)return result('supported','unique_proved_method',{choices:p.direct,provider_calls_required:0});
  if(!exact(response,['model_version','decisions'])||response.model_version!==p.versions.model
    ||!exact(response.decisions,Object.keys(p.request.questions)))return result('invalid','response_contract_mismatch');
  const choices=structuredClone(p.direct);
  for(const [key,q] of Object.entries(p.request.questions)){
    const d=response.decisions[key];
    if(!exact(d,['choice','probabilities'])||!q.options.includes(d.choice)||!exact(d.probabilities,q.options))return result('invalid','unknown_option_or_distribution');
    const ps=Object.values(d.probabilities);
    if(ps.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>1)||Math.abs(ps.reduce((a,b)=>a+b,0)-1)>1e-6)return result('invalid','invalid_probability');
    const selected=d.probabilities[d.choice],other=Math.max(...q.options.filter(x=>x!==d.choice).map(x=>d.probabilities[x]));
    if(d.choice==='unknown'||selected<0.95||selected-other<0.20)return result('abstain','uncertain_choice');
    choices[q.feature_id]??={};choices[q.feature_id][key.startsWith('role_')?'role':'method']=d.choice;
  }
  return result('supported','semantic_candidate_only',{choices,provider_calls_required:1});
}
module.exports={prepareDecision,resolveDecision,VERSION};

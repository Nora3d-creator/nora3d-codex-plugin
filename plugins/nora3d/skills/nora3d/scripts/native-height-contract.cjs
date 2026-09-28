'use strict';
const {createHash}=require('node:crypto');
const ALIAS_SHA256='8c560a8457e48274e92e27c10c174e749f5d4d5719855f1af380bb9ffa1bc5f7';
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
function guardedHeightAlias(capabilities){
  const rows=capabilities?.native?.operations;
  if(!Array.isArray(rows))return false;
  const found=rows.filter(x=>x?.operation==='solid.extrude.edit');
  return found.length===1&&createHash('sha256').update(JSON.stringify(canonical(found[0]))).digest('hex')===ALIAS_SHA256;
}
function guardedHeightCommit(receipt,invocation,capabilities){
  if(!guardedHeightAlias(capabilities)||!invocation||invocation.operation!=='solid.extrude.edit'
    ||invocation.operation_id!==receipt?.operation_id||receipt?.readonly!==false||receipt?.effect!==undefined)return false;
  const p=invocation.parameters,r=receipt.result;
  return p&&Object.keys(p).sort().join(',')==='feature_uuid,height,hid'&&Number.isSafeInteger(p.hid)&&p.hid>0
    &&typeof p.feature_uuid==='string'&&p.feature_uuid.length>0&&p.feature_uuid.length<=256
    &&Number.isFinite(p.height)&&p.height>0&&p.height<=1000000&&r?.edit_scope==='height_only'
    &&r.applied_patch&&Object.keys(r.applied_patch).join(',')==='height'&&r.applied_patch.height===p.height
    &&r.createdFeatureId===p.hid&&Array.isArray(receipt.context?.features)
    &&receipt.context.features.filter(f=>String(f.id)===String(p.hid)&&f.uuid===p.feature_uuid&&f.type==='Extrude').length===1;
}
module.exports={guardedHeightAlias,guardedHeightCommit};

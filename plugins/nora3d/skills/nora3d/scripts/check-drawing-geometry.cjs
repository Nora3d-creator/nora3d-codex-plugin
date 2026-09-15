#!/usr/bin/env node
'use strict';
// Offline arithmetic over explicitly selected native measurements; no CAD writes.
const fs = require('node:fs');
const finite = v => typeof v === 'number' && Number.isFinite(v);
const positive = v => { if (!finite(v) || v <= 0) throw Error('positive_value_required'); return v; };
const vec = v => { if (!Array.isArray(v) || v.length !== 3 || !v.every(finite)) throw Error('finite_vector_required'); return v; };
const sub = (a,b) => vec(a).map((v,i) => v-vec(b)[i]);
const dot = (a,b) => a.reduce((s,v,i) => s+v*b[i],0);
const norm = a => Math.hypot(...a);
const unit = a => { a=vec(a); const n=positive(norm(a)); return a.map(v=>v/n); };
const mid = (a,b) => vec(a).map((v,i)=>(v+vec(b)[i])/2);
const angle = (a,b,unoriented=false) => {
  const d=dot(unit(a),unit(b));
  return Math.acos(Math.min(1,Math.max(-1,unoriented?Math.abs(d):d)))*180/Math.PI;
};
const perpendicular = (v,axis) => norm(v.map((x,i)=>x-dot(v,axis)*axis[i]));

function measure(check) {
  const g=check.geometry, e=check.expected;
  const tol=positive(check.tolerance_mm ?? 0.01), angleTol=positive(check.tolerance_degrees ?? 0.1);
  if (check.kind==='parallel_thickness') {
    positive(e.thickness_mm);
    const separation=sub(g.plane_b.point,g.plane_a.point);
    const degrees=angle(g.plane_a.normal,g.plane_b.normal,true);
    // Non-parallel planes have no single constant thickness.
    const thickness=degrees<=angleTol ? Math.abs(dot(separation,unit(g.plane_a.normal))) : null;
    return {pass:thickness!==null && Math.abs(thickness-e.thickness_mm)<=tol,
      measured:{parallel_angle_degrees:degrees,thickness_mm:thickness}};
  }
  if (check.kind==='direction') {
    const degrees=angle(sub(g.end,g.start),e.direction);
    return {pass:degrees<=angleTol,measured:{direction_error_degrees:degrees}};
  }
  if (check.kind==='u_slot') {
    positive(e.depth_mm); positive(e.radius_mm); positive(g.radius_mm);
    const mouth=mid(g.mouth_left,g.mouth_right), join=mid(g.join_left,g.join_right);
    const axis=unit(sub(g.bottom,mouth));
    const depth=dot(sub(g.bottom,mouth),axis), straight=dot(sub(join,mouth),axis);
    const left=sub(g.join_left,g.mouth_left), right=sub(g.join_right,g.mouth_right);
    const radius=g.radius_mm, width=norm(sub(g.join_right,g.join_left));
    const residuals=[perpendicular(sub(join,mouth),axis),perpendicular(sub(g.bottom,join),axis),
      perpendicular(left,axis),perpendicular(right,axis),
      Math.abs(dot(sub(g.join_right,g.join_left),axis)),
      Math.abs(dot(sub(g.mouth_right,g.mouth_left),axis)),
      Math.abs(dot(left,axis)-straight),Math.abs(dot(right,axis)-straight),
      Math.abs(width-2*radius),Math.abs(norm(sub(g.mouth_right,g.mouth_left))-2*radius),
      Math.abs(depth-straight-radius)];
    const consistent=straight>=-tol && Math.max(...residuals)<=tol;
    return {pass:consistent && Math.abs(depth-e.depth_mm)<=tol && Math.abs(radius-e.radius_mm)<=tol,
      measured:{depth_mm:depth,straight_mm:straight,radius_mm:radius,width_mm:width,geometry_consistent:consistent}};
  }
  throw Error('unsupported_check_kind');
}

function audit(input) {
  if (!input || typeof input.document_id!=='string' || !input.document_id || typeof input.revision!=='string' || !input.revision ||
      !Array.isArray(input.checks) || !input.checks.length || input.checks.length>128) throw Error('document_revision_and_bounded_checks_required');
  const ids=new Set();
  const checks=input.checks.map(c=>{
    if (!c || typeof c.id!=='string' || !c.id || ids.has(c.id)) throw Error('unique_check_ids_required');
    ids.add(c.id);
    const base={id:c.id,kind:c.kind};
    const evidence=c.evidence;
    if (!evidence || evidence.source!=='native_geometry' || evidence.document_id!==input.document_id || evidence.revision!==input.revision ||
        !Array.isArray(evidence.object_ids) || !evidence.object_ids.length || !evidence.object_ids.every(v=>typeof v==='string' && v.length>0))
      return {...base,status:'unknown',reason:'current_native_evidence_required'};
    try {
      const r=measure(c);
      return {...base,status:r.pass?'pass':'fail',measured:r.measured,evidence};
    } catch (error) { return {...base,status:'unknown',reason:error.message}; }
  });
  return {document_id:input.document_id,revision:input.revision,status:checks.every(c=>c.status==='pass')?'pass':'not_verified',checks,
    scope:'Only supplied measurements checked; source authenticity, drawing interpretation and complete solid validity are not verified.'};
}

module.exports={audit};
if (require.main===module) {
  try {
    if (process.argv.length!==3) throw Error('Usage: node check-drawing-geometry.cjs <measurements.json>');
    const report=audit(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
    process.exitCode=report.status==='pass'?0:1;
  } catch(error) { process.stderr.write(error.message+'\n'); process.exitCode=2; }
}

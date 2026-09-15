'use strict';
// Pure planning arithmetic. No CAD, network, credentials, or saved-result claims.
const fs = require('node:fs');
const EPS = 1e-9;
const finite = x => typeof x === 'number' && Number.isFinite(x);
function vector(v) {
  if (!Array.isArray(v) || v.length !== 3 || !v.every(finite)) throw Error('Expected three finite coordinates');
  return v;
}
const add = (a,b) => a.map((v,i)=>v+b[i]);
const sub = (a,b) => a.map((v,i)=>v-b[i]);
const scale = (a,s) => a.map(v=>v*s);
const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function unit(v) { vector(v); const n=Math.hypot(...v); if(n<EPS) throw Error('Zero direction'); return scale(v,1/n); }
function rotate(v,a,theta) {
  return add(add(scale(v,Math.cos(theta)),scale(cross(a,v),Math.sin(theta))),scale(a,dot(a,v)*(1-Math.cos(theta))));
}
function hinge(input) {
  const a=unit(input.axis), from=unit(input.from_direction), to=unit(input.to_direction);
  const p=vector(input.pivot), q=vector(input.target_pivot ?? p);
  if(Math.abs(dot(a,from)-dot(a,to))>1e-7) throw Error('Directions cannot be aligned around this hinge axis');
  const u=sub(from,scale(a,dot(a,from))), v=sub(to,scale(a,dot(a,to)));
  if(Math.hypot(...u)<EPS || Math.hypot(...v)<EPS) throw Error('Direction parallel to hinge: angle is undetermined');
  const theta=Math.atan2(dot(a,cross(u,v)),dot(u,v));
  const degrees=theta*180/Math.PI;
  // p' = R p + (targetPivot - R pivot). Useful when an API rotates at the origin.
  const translation=sub(q,rotate(p,a,theta));
  const alignedAxis=a.findIndex((x,i)=>Math.abs(Math.abs(x)-1)<EPS && a.every((y,j)=>j===i||Math.abs(y)<EPS));
  return {
    kind:'hinge', angle_degrees:degrees, axis:a, pivot:p, target_pivot:q,
    origin_rotation_translation:translation,
    alias_rotation:alignedAxis<0?null:{axis:'XYZ'[alignedAxis],angle_degrees:degrees*a[alignedAxis],center:p},
    after_pivot_rotation_translation:sub(q,p),
    predicted_points:(input.points??[]).map(x=>add(rotate(sub(vector(x),p),a,theta),q)),
    aligned_direction:rotate(from,a,theta), no_rotation:Math.abs(degrees)<1e-8
  };
}
function scissor(input) {
  const {link_length:L,current_span:w0,target_span:w1,slider_min:min,slider_max:max,branch}=input;
  if(![L,w0,w1,min,max].every(finite)||L<=0||w0<0||w1<0||w0>L||w1>L||min>max||![1,-1].includes(branch))
    throw Error('Invalid scissor dimensions, slider limits, or branch');
  const s0=branch*Math.sqrt(Math.max(0,L*L-w0*w0));
  const s1=branch*Math.sqrt(Math.max(0,L*L-w1*w1));
  if(Math.min(s0,s1)<min-EPS||Math.max(s0,s1)>max+EPS) throw Error('Slider stroke exceeded');
  const angle0=Math.atan2(w0,s0),angle1=Math.atan2(w1,s1);
  return {kind:'scissor',current_slider:s0,target_slider:s1,slider_delta:s1-s0,
    link_angle_delta_degrees:(angle1-angle0)*180/Math.PI,
    near_toggle:Math.min(w0,w1,Math.abs(s0),Math.abs(s1))<EPS};
}
function plan(input) {
  if(!input||!Array.isArray(input.motions)||!input.motions.length) throw Error('motions must be a nonempty array');
  return {status:'planned_only',limitations:'Analytical target poses only; current CAD geometry, saved revision, joints and collision path require verification.',
    motions:input.motions.map(m=>{if(m.kind==='hinge')return hinge(m);if(m.kind==='scissor')return scissor(m);throw Error('Unsupported motion kind');})};
}
module.exports={plan,hinge,scissor};
if(require.main===module) {
  try { if(process.argv.length!==3)throw Error('Usage: node plan-fold-motion.cjs input.json');
    process.stdout.write(JSON.stringify(plan(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2)+'\n');
  } catch(e) { process.stderr.write(e.message+'\n');process.exitCode=2; }
}

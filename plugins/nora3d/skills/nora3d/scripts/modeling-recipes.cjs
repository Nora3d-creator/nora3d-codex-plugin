'use strict';
// Reviewed, bounded plan candidates only. No network, filesystem or CAD execution.
// Feed current raw context/catalog/evidence via stdin; execute through guarded MCP.
const {createHash}=require('node:crypto');
const {verifyGeometry}=require('./verify-modeling-recipes.cjs');
// Sorted-key hashes of reviewed, publicly returned input_schema, not an invented
// server native-contract field. Schema drift requires review and a helper update.
const SCHEMAS = {
  'ccad.cmd_box.create_box':'574352ce9353db0bc9ebbb86be3d2c99e55b171796ec4f54a23b1026dd67ebf5',
  'ccad.cmd_sketch.create_sketch':'63c2aa4c79f4b89fc71a8953ac4733aa41d521fab764080427040677438401b9',
  'ccad.cmd_center_circle.create_circle':'9fdac0acddccf6a2782c055cf709eeb88ad9e74401bbdf094a0ea939e26fa3eb',
  'ccad.cmd_exit_sketch.exit_sketch':'0425a3c96045a054f78c757d920c710f44360facba080466dc63f6edad9f60b4',
  'ccad.cmd_extrude_cut.create_extrude_cut':'bdbf8a3339dccab240fbb50c9dcad4800e8fb8fe9b8540e3127231c7ba2bd802',
  'ccad.cmd_extrude.edit_extrude':'851eaecf3b856841ceb845348da641519f7c4e5fbb5a26466655773093b194b0',
};
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?
  Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const schemaHash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const IDENTITY = ['workspace_id','project_id','document_id','version_id','session_epoch'];
const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
const text = x => typeof x === 'string' && x.length > 0;
const num = x => typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= 1000000;
const positive = x => num(x) && x > 0;
const vec = x => Array.isArray(x) && x.length === 3 && x.every(num);
const dot = (a,b) => a.reduce((n,v,i)=>n+v*b[i],0);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const near = (a,b,t=1e-6) => Math.abs(a-b)<=t;
const samePoint = (a,b,t=1e-6) => vec(a)&&vec(b)&&a.every((v,i)=>near(v,b[i],t));
const xyz = p => ({x:p[0],y:p[1],z:p[2]});
const stop = (reason, status='rejected') => {throw Object.assign(new Error(reason),{status});};
const requireFact = (yes,reason) => {if(!yes)stop(reason,'needs_probe');};
const keysOnly = (value,keys) => {if(!object(value)||Object.keys(value).some(k=>!keys.includes(k)))stop('unsupported_request_fields');};
function id(value) {
  if (typeof value==='number' && Number.isSafeInteger(value) && value>0) return String(value);
  if (typeof value==='string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))) return value;
  stop('invalid_native_id');
}

// Validate only the JSON-schema constructs used by these fixed typed parameters.
// This is not a catalog interpreter: entry IDs and reviewed schemas stay pinned.
function accepts(schema,value,root=schema) {
  if(!object(schema))return false;
  if(schema.$ref){
    if(!/^#\/\$defs\/[^/]+$/.test(schema.$ref))return false;
    return accepts(root.$defs?.[schema.$ref.split('/')[2]],value,root);
  }
  if(schema.anyOf&&!schema.anyOf.some(s=>accepts(s,value,root)))return false;
  if(schema.enum&&!schema.enum.some(v=>v===value))return false;
  if(schema.const!==undefined&&schema.const!==value)return false;
  if(schema.type==='object'){
    if(!object(value)||(schema.required||[]).some(k=>!(k in value)))return false;
    if(schema.additionalProperties!==false)return false;
    return Object.entries(value).every(([k,v])=>schema.properties?.[k]&&accepts(schema.properties[k],v,root));
  }
  if(schema.type==='array')return Array.isArray(value)&&value.length>=(schema.minItems??0)&&value.length<=(schema.maxItems??Infinity)&&value.every(v=>accepts(schema.items,v,root));
  if(schema.type==='number'||schema.type==='integer'){
    if(typeof value!=='number'||!Number.isFinite(value)||(schema.type==='integer'&&!Number.isSafeInteger(value)))return false;
    return value>=(schema.minimum??-Infinity)&&value<=(schema.maximum??Infinity)&&value>(schema.exclusiveMinimum??-Infinity)&&value<(schema.exclusiveMaximum??Infinity);
  }
  if(schema.type==='string')return typeof value==='string'&&value.length>=(schema.minLength??0)&&value.length<=(schema.maxLength??Infinity)&&!schema.pattern;
  return !!schema.enum||!!schema.anyOf;
}
function transform(p,m){return [0,1,2].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);}
function rigid(m){
  if(!Array.isArray(m)||m.length!==16||!m.every(num))return false;
  const axes=[0,4,8].map(i=>m.slice(i,i+3));
  return [3,7,11].every(i=>near(m[i],0))&&near(m[15],1)&&axes.every(a=>near(dot(a,a),1))&&
    near(dot(axes[0],axes[1]),0)&&near(dot(axes[0],axes[2]),0)&&near(dot(axes[1],axes[2]),0)&&near(dot(cross(axes[0],axes[1]),axes[2]),1);
}

function compilePlan(input) {
  const base={schema_version:1,recipe_version:1,promotion_state:'candidate',verified_recipe:false,
    executes_cad:false,authorization_granted:false,requires_live_mcp_guards:true};
  try {
    const {recipe,request:r,binding:b,context:w,catalog,capabilities,evidence={}}=input||{};
    requireFact(object(b)&&object(w)&&object(w.context),'full_current_context_required');
    if(IDENTITY.some(k=>!text(b[k])||w[k]!==b[k]))stop('document_or_session_mismatch');
    if(!text(b.context_token)||w.context_token!==b.context_token)stop('stale_context');
    const c=w.context,m=c.modeling;
    if(['project_id','document_id','version_id'].some(k=>c[k]!==w[k]))stop('nested_context_identity_mismatch');
    if(w.connected!==true||w.can_write!==true||c.can_write!==true)stop('not_live_writable');
    if(c.document_type!=='PartDocument'||!['mm','millimeter'].includes(c.units))stop('unsupported_document_or_units');
    requireFact(text(c.revision)&&object(m)&&typeof m.has_draft==='boolean'&&typeof m.is_busy==='boolean'&&
      Number.isInteger(m.pending_saves)&&typeof m.sketch_active==='boolean','incomplete_modeling_state');
    if(c.truncated||w.truncated)stop('truncated_context','needs_probe');
    if(m.pending_saves!==0||m.is_busy)stop('model_busy');
    const owned=recipe==='hole'&&['draw','exit'].includes(input.stage);
    if(owned){if(m.draft_owner!=='codex'||m.sketch_active!==true||!m.sketch_id||![null,'','CmdSketch','select'].includes(m.active_command))stop('not_owned_idle_sketch');}
    else if(m.has_draft||m.sketch_active||![null,'','select'].includes(m.active_command))stop('human_or_active_draft');
    if(evidence.pending_operations!==undefined){
      if(!Array.isArray(evidence.pending_operations)||evidence.pending_operations.some(o=>!['succeeded','failed','cancelled','draft_applied'].includes(o.status)))stop('unresolved_operation');
    }
    requireFact(object(catalog)&&text(b.catalog_revision)&&catalog.catalog_revision===b.catalog_revision&&Array.isArray(catalog.entries),'current_catalog_required');
    const steps=[],acceptance=[{check:'saved_and_displayed_revision_match'},{check:'unrelated_geometry_preserved'},{check:'saved_reload_consistency'}];
    const op=(stepId,entryId,parameters,effect,requiresSketch=false,alias)=>{
      const rows=catalog.entries.filter(e=>e.entry_id===entryId);
      requireFact(rows.length===1,'exact_live_schema_required');const e=rows[0];
      if(e.catalog_revision!==catalog.catalog_revision||e.executable!==true||e.effect!==effect||e.requires_sketch!==requiresSketch||schemaHash(e.input_schema)!==SCHEMAS[entryId])stop('unsupported_or_changed_contract');
      if(!accepts(e.input_schema,parameters))stop('parameters_rejected_by_live_schema');
      if(alias){
        const aliases=capabilities?.native?.operations?.filter(a=>a.operation===alias&&a.entry_id===entryId)||[];
        requireFact(aliases.length===1,'live_guarded_alias_required');
        if(aliases[0].read_only!==false||aliases[0].draft!==false||aliases[0].requires_sketch!==false||
          !accepts(aliases[0].input_schema,parameters))stop('alias_schema_mismatch');
      }
      steps.push({id:stepId,operation:alias||entryId,parameters});
    };
    const inspect=(stepId,query,args={},expect=[])=>{
      requireFact(capabilities?.inspectors?.includes(query),'live_inspector_required');
      steps.push({id:stepId,kind:'inspect',operation:query,parameters:args,expect});
    };
    const boundReceipt=(value,current=true)=>{
      requireFact(object(value)&&text(value.operation_id)&&object(value.result),'native_receipt_required');
      if(IDENTITY.some(k=>value[k]!==b[k])||value.status!=='succeeded'||value.result_context_is_current!==true)stop('receipt_not_confirmed_current');
      if(!text(value.receipt_context_token)||(current&&value.receipt_context_token!==b.context_token))stop('receipt_token_mismatch');
      if(value.result.ok===false||value.error)stop('failed_native_evidence');
      return value.result;
    };
    const nativeBoxMaterial=(current=true,expectedRevision=c.revision)=>{
      const receipt=current?(evidence.material_receipt||evidence.topology_receipt):evidence.topology_receipt,result=boundReceipt(receipt,current);
      const infos=result.entityInfos;
      requireFact(receipt.readonly===true&&result.ok===true&&result.detail==='native_geometry'&&
        receipt.context?.revision===expectedRevision&&Array.isArray(infos)&&!result.truncated&&!result.hasMore,
        'current_complete_native_topology_required');
      if(!object(result.data)||JSON.stringify(canonical(infos))!==JSON.stringify(canonical(result.data.entityInfos)))stop('conflicting_native_topology');
      const target=(c.entities||[]).find(e=>e.type==='solid'&&String(e.id)===id(r.body_id));
      const rows=infos.filter(info=>id(info.featureId)===id(target?.feature_id));
      requireFact(rows.length===1&&Array.isArray(rows[0].referEntities),'current_body_feature_topology_required');
      const bodies=rows[0].referEntities.filter(body=>id(body.id)===id(r.body_id));
      requireFact(bodies.length===1,'exact_native_body_required');const body=bodies[0];
      requireFact(Array.isArray(body.edges)&&body.edges.length===12&&Array.isArray(body.faces)&&body.faces.length===6,'supported_native_box_material_required');
      const points=body.edges.flatMap(e=>[e.start,e.end]).map(p=>['x','y','z'].map(k=>p?.[k]));
      if(!points.every(vec))stop('native_endpoints_required','needs_probe');
      // These are candidate extents of native line endpoints, never display bounds.
      // The independent verifier must prove all twelve edges and six full planes.
      const low=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),high=[0,1,2].map(i=>Math.max(...points.map(p=>p[i])));
      const outer={size_mm:low.map((v,i)=>high[i]-v),center_mm:low.map((v,i)=>(high[i]+v)/2)};
      const proof=verifyGeometry({body,spec:{outer},source:{query:'retrieval_scene_entity_infos',complete:true,revision:expectedRevision,units:'mm'}});
      if(!proof.passed)stop('native_box_material_not_proved','needs_probe');
      const axis=r.direction_document.findIndex(v=>v===1||v===-1),sign=r.direction_document[axis],radius=r.diameter_mm/2;
      if(axis<0||r.direction_document.some((v,i)=>i!==axis&&v!==0))stop('unsupported_material_direction');
      const entry=sign===1?low[axis]:high[axis],faceId=id(r.face_id);
      const edges=body.edges.filter(e=>e.adjacentFaceIds.map(id).includes(faceId));
      if(edges.length!==4||edges.some(e=>![e.start,e.end].every(p=>near(p[['x','y','z'][axis]],entry))))stop('face_not_material_entry');
      if(!near(r.center_document_mm[axis],entry)||[0,1,2].filter(i=>i!==axis).some(i=>
        r.center_document_mm[i]-radius<=low[i]+1e-5||r.center_document_mm[i]+radius>=high[i]-1e-5))stop('circle_not_inside_material_face');
      const span=outer.size_mm[axis];
      if(r.mode==='through'?!near(r.depth_mm,span,1e-5):r.depth_mm>=span-1e-5)stop('depth_does_not_match_native_material');
      return {body,outer,span,face_edges:edges};
    };
    const nativeFrame=(result)=>{
      const f=result.frame;
      requireFact(result.ok===true&&result.document_id===c.document_id&&object(f),'native_frame_required');
      if(f.source!=='native_sketch_matrix'||f.accuracy!=='native_parameters'||f.units!=='mm'||f.coordinate_space!=='document'||f.matrix_layout!=='column_major'||
        !rigid(f.local_to_document)||!rigid(f.document_to_local))stop('invalid_native_frame');
      if(!samePoint(f.u_axis,f.local_to_document.slice(0,3))||!samePoint(f.normal,f.local_to_document.slice(8,11)))stop('inconsistent_native_frame');
      for(const p of [[0,0,0],[1,0,0],[0,1,0],[0,0,1]])if(!samePoint(transform(transform(p,f.local_to_document),f.document_to_local),p))stop('inconsistent_frame_inverse');
      const refs=f.plane_references;
      if(refs?.WPFaceId===0||refs?.WPFaceId==='0'){
        if(!text(refs.WPFaceTopoId)||![undefined,''].includes(refs.WPInstanceId)||![undefined,0,'0'].includes(refs.WPSketchId)||
          ![undefined,''].includes(refs.WPSketchTopoId))stop('unsupported_native_face_attachment');
        const proof=nativeBoxMaterial(false,result.revision);
        if(proof.face_edges.some(e=>[e.start,e.end].some(p=>!near(transform([p.x,p.y,p.z],f.document_to_local)[2],0))))stop('frame_not_on_proved_native_face');
      }else if(id(refs?.WPFaceId)!==id(r.face_id))stop('sketch_face_mismatch');
      const local=transform(r.center_document_mm,f.document_to_local);
      if(!near(local[2],0))stop('hole_center_off_plane');
      const alignment=dot(r.direction_document,f.normal);
      if(!near(Math.abs(alignment),1))stop('cut_direction_not_normal');
      return {frame:f,local,reverse:alignment>0?0:1};
    };
    const checkedProfile=(current=true)=>{
      const p=boundReceipt(evidence.profile_receipt,current),f=nativeFrame(p),v=p.validation;
      if(evidence.profile_receipt.readonly!==true||p.source!=='native_sketch_parameters'||p.accuracy!=='analytic_with_tolerance'||p.units!=='mm'||
        !positive(p.tolerance_mm)||p.tolerance_mm>1e-5||p.issues_truncated!==false||!Array.isArray(p.issues)||p.issues.length||
        v?.status!=='pass'||v.checked_scope!=='current_sketch'||v.closed_loop_count!==1||v.outer_loop_count!==1||v.hole_loop_count!==0||
        !Array.isArray(p.curves)||p.curves.length!==1)stop('single_circle_profile_not_proved');
      const curve=p.curves[0];
      if(curve.kind!=='circle'||curve.source!=='native_curve_parameters'||!near(curve.radius_mm,r.diameter_mm/2,p.tolerance_mm)||!samePoint(curve.center_local,f.local,p.tolerance_mm))stop('profile_does_not_match_request');
      if(current&&(p.revision!==c.revision||id(p.sketch_feature_id)!==id(m.sketch_id)))stop('profile_sketch_or_revision_mismatch');
      return {profile:p,...f};
    };
    let next;
    if(recipe==='box'){
      keysOnly(r,['size_mm','center_mm','feature_name']);
      if(!vec(r.size_mm)||!r.size_mm.every(positive)||!vec(r.center_mm))stop('invalid_box_dimensions');
      op('box','ccad.cmd_box.create_box',{length:r.size_mm[1],width:r.size_mm[0],height:r.size_mm[2],direction:'X',
        position_type:2,cur_point_mode:1,position_point:xyz(r.center_mm),length_reverse:0,width_reverse:0,height_reverse:0,feature_name:r.feature_name},'commit');
      acceptance.push({check:'native_box_dimensions_and_center',size_mm:r.size_mm,center_mm:r.center_mm},{check:'one_new_solid'});next='native_verification';
    }else if(recipe==='hole'){
      keysOnly(r,['body_id','face_id','center_document_mm','diameter_mm','mode','depth_mm','direction_document','feature_name']);
      if(!vec(r.center_document_mm)||!positive(r.diameter_mm)||!positive(r.depth_mm)||!vec(r.direction_document)||!near(dot(r.direction_document,r.direction_document),1)||!['blind','through'].includes(r.mode))stop('invalid_hole_request');
      const bodyId=id(r.body_id),faceId=id(r.face_id);
      requireFact(c.entities?.some(e=>e.type==='solid'&&String(e.id)===bodyId),'current_solid_required');
      acceptance.push({check:'native_hole_axis_and_radius',center_document_mm:r.center_document_mm,direction_document:r.direction_document,radius_mm:r.diameter_mm/2},
        {check:r.mode==='through'?'through_openings_and_cylindrical_wall':'blind_depth_and_closed_bottom',depth_mm:r.depth_mm,
          limitation:'The requested execution depth is not proof of material coverage or final hole depth.'});
      if(input.stage==='start'){
        if(evidence.topology_receipt||evidence.material_receipt||r.mode==='through')nativeBoxMaterial();
        else{
          const face=boundReceipt(evidence.face_receipt);
          if(evidence.face_receipt.readonly!==true||face.ok!==true||id(face.id)!==faceId||face.kind!=='face'||face.surfaceType!=='plane')stop('selected_face_not_native_plane');
          requireFact(c.selection?.some(s=>s.type==='face'&&String(s.id)===faceId&&String(s.owner_body_id)===bodyId),'current_face_selection_required');
        }
        op('sketch','ccad.cmd_sketch.create_sketch',{sketch_wp_face_id:Number(faceId),sketch_wp_on_face:1},'draft');
        inspect('frame','sketch_frame');next='draw';
      }else if(input.stage==='draw'){
        const raw=boundReceipt(evidence.frame_receipt),{frame:f}=nativeFrame(raw);
        if(evidence.frame_receipt.readonly!==true||raw.revision!==c.revision||id(raw.sketch_feature_id)!==id(m.sketch_id))stop('frame_sketch_or_revision_mismatch');
        const onCircle=r.center_document_mm.map((v,i)=>v+f.u_axis[i]*r.diameter_mm/2);
        op('circle','ccad.cmd_center_circle.create_circle',{center_circle_radius:r.diameter_mm/2,center_circle_center_pnt:xyz(r.center_document_mm),
          center_circle_circle_pnt:xyz(onCircle),sketch_plane_normal:xyz(f.normal),center_circle_dimension_type:1},'draft',true);
        inspect('profile','profile_check',{},[{path:'validation.status',equals:'pass'},{path:'validation.closed_loop_count',equals:1},{path:'validation.hole_loop_count',equals:0}]);next='exit';
      }else if(input.stage==='exit'){
        checkedProfile();op('exit','ccad.cmd_exit_sketch.exit_sketch',{feature_name:r.feature_name},'commit',true);next='cut';
      }else if(input.stage==='cut'){
        if(r.mode==='through'||evidence.material_receipt)nativeBoxMaterial();
        const p=checkedProfile(false),saved=boundReceipt(evidence.exit_receipt);
        const exit=evidence.exit_receipt;
        if(exit.kind!=='operation'||exit.readonly!==false||exit.effect!=='commit'||exit.context_token!==evidence.profile_receipt.receipt_context_token||
          saved.saved_revision!==c.revision||saved.displayed_revision!==c.revision)stop('saved_sketch_chain_not_proved');
        const sketches=(c.entities||[]).filter(e=>e.type==='sketch'&&id(e.feature_id)===id(p.profile.sketch_feature_id));
        requireFact(sketches.length===1,'current_saved_sketch_entity_required');
        op('cut','ccad.cmd_extrude_cut.create_extrude_cut',{refer_sketches_id:id(sketches[0].id),extrude_cut_solids:[bodyId],height:r.depth_mm,reverse:p.reverse,feature_name:r.feature_name},'commit');next='native_verification';
      }else stop('unknown_hole_stage');
    }else if(recipe==='edit_extrude'){
      keysOnly(r,['feature_id','feature_uuid','height_mm']);
      if(!positive(r.height_mm))stop('invalid_height');
      const rows=(c.features||[]).filter(f=>String(f.id)===id(r.feature_id)&&f.uuid===r.feature_uuid);
      requireFact(rows.length===1&&rows[0].type==='Extrude','exact_current_extrude_required');
      const f=rows[0],p=f.parameters;
      requireFact(object(p),'complete_native_init_required');
      const modes={ExtrudeType1:0,ExtrudeType2:-1,DraftType1:-1,DraftType2:-1,OffsetType:-1,ThinType:-1,DirectionType:0,MergeType:0};
      if(Object.entries(modes).some(([k,v])=>p[k]!==v)||![0,1].includes(p.Reverse)||![0,1].includes(p.InputDataType)||
        (p.MergeSolids!=null&&(!Array.isArray(p.MergeSolids)||p.MergeSolids.length)))stop('unsupported_extrude_mode');
      const h=p.Height1;
      if(!object(h)||!positive(h.VariableValue))stop('original_height_unknown','needs_probe');
      for(const k of ['VariableName','OriginalVariableName','variableName','originalVariableName'])if(h[k]!=null&&h[k]!=='')stop('variable_bound_height');
      for(const k of ['ExternalRefFlg','externalRefFlg'])if(h[k]!=null&&![false,0].includes(h[k]))stop('external_height_reference');
      for(const k of ['Expression','expression'])if(h[k]!=null&&h[k]!==''&&String(h[k]).trim()!==String(h.VariableValue))stop('expression_driven_height');
      const refs=p.InputDataType===1?p.LoopFirstCrvIds:[p.Sketch];
      requireFact(Array.isArray(refs)&&refs.length>0&&refs.every(v=>{try{return !!id(v);}catch{return false;}}),'original_contours_required');
      if(f.suppressed===true||f.rolled_off===true)stop('inactive_target_feature');
      op('height','ccad.cmd_extrude.edit_extrude',{hid:Number(id(f.id)),feature_uuid:f.uuid,height:r.height_mm},'commit',false,'solid.extrude.edit');
      acceptance.push({check:'native_height_patch_only',feature_id:id(f.id),feature_uuid:f.uuid,height_mm:r.height_mm,
        expected_edit_scope:'height_only',preserved_native_init:p,preserved_references:f.references||[],preserved_sketch_references:f.sketch_references||[]});next='native_verification';
    }else stop('unsupported_recipe');
    return {...base,status:'ready',recipe,stage:input.stage||'build',next_stage:next,
      binding:{...b},batch:{workspace_id:b.workspace_id,context_token:b.context_token,wait_seconds:20,steps},acceptance,
      execution_rules:['Assign a stable idempotency key for this logical stage. Never replay an uncertain write.',
        'Rebind to fresh current context after each stage; retain exact document/session and inspect human changes.',
        'Resolve post-operation IDs from actual receipts/current entities. Native verification and save/reload remain required.']};
  }catch(error){return {...base,status:error.status||'rejected',reason:error.status?error.message:'invalid_input',probe_required:true};}
}
module.exports={compilePlan};
if(require.main===module){
  const chunks=[];let length=0;
  process.stdin.on('data',chunk=>{length+=chunk.length;if(length>8*1024*1024){process.stderr.write('Input exceeds 8 MiB.\n');process.exit(1);}chunks.push(chunk);});
  process.stdin.on('end',()=>{try{process.stdout.write(JSON.stringify(compilePlan(JSON.parse(Buffer.concat(chunks).toString('utf8'))))+'\n');}catch{process.stderr.write('Invalid JSON input.\n');process.exitCode=1;}});
}

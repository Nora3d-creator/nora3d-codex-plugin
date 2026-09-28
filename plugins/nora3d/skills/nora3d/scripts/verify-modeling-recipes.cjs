#!/usr/bin/env node
'use strict';

// Offline, fail-closed evidence checks for a deliberately narrow native shape.
// Input must be an unmodified, complete retrieval_scene_entity_infos solid DTO.
// Trust in the origin/completeness/revision of caller-supplied JSON is external:
// this verifies evidence consistency, not its authenticity or kernel validity.
// Native edge.center is the curve midpoint, NOT a circle's geometric center.
// Bounds, mesh-derived normals/tangents, face areas and screenshots are ignored.
// CLI: node verify-modeling-recipes.cjs geometry|persistence < evidence.json
// Exit 0: passes; 1: failed checks; 2: malformed JSON/unsupported CLI request.

const TOL = 1e-5; // Fixed millimeter tolerance; callers cannot relax acceptance.
const {guardedHeightCommit}=require('./native-height-contract.cjs');
const AXES = ['x', 'y', 'z'];
const GEOMETRY_SCOPE = 'axis_aligned_box_single_cylindrical_hole';
const IDENTITIES = ['workspace_id', 'project_id', 'document_id', 'version_id', 'session_epoch'];
const NATIVE_QUERIES = new Set(['retrieval_scene_entity_infos', 'ccad.host.retrieval_scene_entity_infos', 'retrievalEntityInfos']);
const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const finite = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => finite(a) && finite(b) && Math.abs(a - b) <= TOL;
const vector = v => Array.isArray(v) && v.length === 3 && v.every(finite);
const point = v => obj(v) && AXES.every(k => finite(v[k])) ? AXES.map(k => v[k]) : null;
const same = (a, b) => vector(a) && vector(b) && a.every((v, i) => near(v, b[i]));
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const scalarId = v => (typeof v === 'string' && v.trim().length > 0) || (Number.isSafeInteger(v) && v >= 0);
const id = v => String(v);
const revision = v => scalarId(v) && !/^(unknown|pending|draft|currentversion|null|undefined)$/i.test(id(v).trim());
const sameSet = (a, b) => a.size === b.size && [...a].every(v => b.has(v));
const keyForPlane = (axis, side) => `${axis}:${side}`;

function verifyGeometry(input) {
  const checks = [];
  const check = (checkId, pass, detail) => { checks.push({ id: checkId, pass: !!pass, detail }); return !!pass; };
  const source = obj(input?.source) ? input.source : {};
  const finish = () => ({ passed: checks.every(c => c.pass), scope: GEOMETRY_SCOPE,
    revision: revision(source.revision) ? source.revision : null, tolerance_mm: TOL, checks,
    kernel_validity_certified: false, persistence_verified: false,
    measurement_basis: 'Complete native line endpoints/lengths and closed circular boundary lengths/midpoints with full edge/face incidence. No bounding boxes, mesh measurements, face areas or normals.',
    limitation: 'Conditional on the supplied native DTO and its declared completeness/revision. No general BRep validity, feature-history editability, persistence or source authentication is certified.' });
  const exactSource = NATIVE_QUERIES.has(source.query) && source.complete === true && revision(source.revision)
    && (source.units === undefined || source.units === 'mm')
    && (source.accuracy === undefined || ['exact', 'native'].includes(source.accuracy)) && source.approximate !== true
    && !['mesh', 'render_mesh', 'bounding_box'].includes(source.measurement_basis)
    && source.truncated !== true && source.hasMore !== true;
  if (!check('native_complete_revision_source', exactSource, 'Requires a complete native entity-info query with a known revision; millimeters only.')) return finish();

  const body = input?.body, spec = input?.spec, outer = spec?.outer, hole = spec?.hole;
  if (!check('supported_outer_spec', obj(outer) && vector(outer.size_mm) && outer.size_mm.every(v => v > TOL)
    && vector(outer.center_mm), 'Three positive axis-aligned dimensions and a finite center are required.')) return finish();
  if (!check('complete_solid_dto', obj(body) && body.type === 'solid' && scalarId(body.id)
    && Array.isArray(body.edges) && Array.isArray(body.faces) && body.edges.every(obj) && body.faces.every(obj)
    && body.truncated !== true && body.hasMore !== true,
  'A single native solid with full edge and face arrays is required.')) return finish();

  const edges = body.edges, faces = body.faces;
  const ids = [...edges, ...faces].map(item => item.id);
  if (!check('unique_native_element_ids', ids.every(scalarId) && new Set(ids.map(id)).size === ids.length,
    'Edge and face record IDs must be present and globally unique. Repeated adjacency references are deduplicated.')) return finish();
  const faceById = new Map(faces.map(face => [id(face.id), face]));
  const adjacency = new Map(edges.map(edge => [id(edge.id), new Set((Array.isArray(edge.adjacentFaceIds) ? edge.adjacentFaceIds : []).map(id))]));
  if (!check('closed_manifold_incidence', edges.every(edge => {
    const adj = adjacency.get(id(edge.id));
    return Array.isArray(edge.adjacentFaceIds) && edge.adjacentFaceIds.every(scalarId)
      && adj.size === 2 && [...adj].every(faceId => faceById.has(faceId));
  }), 'Every boundary edge must reference exactly two distinct faces from this complete solid.')) return finish();
  if (!check('supported_analytic_types', edges.every(e => ['line', 'circle'].includes(e.curveType))
    && faces.every(f => ['plane', 'cylinder'].includes(f.surfaceType)),
  'Only straight exterior edges, full circular hole rings, planes and a cylindrical wall are in scope.')) return finish();

  const lines = edges.filter(e => e.curveType === 'line'), circles = edges.filter(e => e.curveType === 'circle');
  const incidence = new Map(faces.map(f => [id(f.id), new Set(edges.filter(e => adjacency.get(id(e.id)).has(id(f.id))).map(e => id(e.id)))]));
  const low = outer.center_mm.map((c, i) => c - outer.size_mm[i] / 2);
  const high = outer.center_mm.map((c, i) => c + outer.size_mm[i] / 2);
  const expectedPlanes = new Map();
  for (let a = 0; a < 3; a++) for (const side of [-1, 1]) expectedPlanes.set(keyForPlane(a, side), new Set());
  let exteriorOK = lines.length === 12;
  const matchedLineIds = new Set();
  for (let a = 0; a < 3; a++) {
    const others = [0, 1, 2].filter(i => i !== a);
    for (const side1 of [-1, 1]) for (const side2 of [-1, 1]) {
      const start = low.slice(), end = low.slice(); end[a] = high[a];
      for (const [index, side] of [[others[0], side1], [others[1], side2]]) start[index] = end[index] = side === -1 ? low[index] : high[index];
      const matches = lines.filter(e => {
        const s = point(e.start), t = point(e.end);
        return ((same(s, start) && same(t, end)) || (same(s, end) && same(t, start)))
          && near(e.length, outer.size_mm[a]);
      });
      if (matches.length !== 1) { exteriorOK = false; continue; }
      const edgeId = id(matches[0].id);
      if (matchedLineIds.has(edgeId)) exteriorOK = false;
      matchedLineIds.add(edgeId);
      expectedPlanes.get(keyForPlane(others[0], side1)).add(edgeId);
      expectedPlanes.get(keyForPlane(others[1], side2)).add(edgeId);
    }
  }
  if (!check('twelve_native_exterior_edges', exteriorOK && matchedLineIds.size === 12,
    { required_size_mm: outer.size_mm, required_center_mm: outer.center_mm, matched_edges: matchedLineIds.size })) return finish();

  const outerPlanes = new Map();
  for (const [planeKey, expected] of expectedPlanes) {
    const matches = faces.filter(f => f.surfaceType === 'plane' && sameSet(
      new Set([...incidence.get(id(f.id))].filter(edgeId => matchedLineIds.has(edgeId))), expected));
    if (matches.length === 1) outerPlanes.set(planeKey, id(matches[0].id));
  }
  if (!check('six_native_exterior_planes', outerPlanes.size === 6 && new Set(outerPlanes.values()).size === 6,
    'Each exterior plane must have its own complete four-edge rectangular boundary.')) return finish();
  const expectedFaceEdges = new Map([...outerPlanes].map(([key, faceId]) => [faceId, new Set(expectedPlanes.get(key))]));

  if (hole === undefined) {
    check('plain_box_topology', circles.length === 0 && faces.length === 6 && faces.every(f => f.surfaceType === 'plane'),
      'An unperforated box has exactly twelve straight edges and six exterior planes.');
  } else {
    let axis = -1;
    if (obj(hole) && vector(hole.axis_inward)) {
      axis = hole.axis_inward.findIndex(v => v === 1 || v === -1);
    }
    const supportedHole = obj(hole) && ['blind', 'through'].includes(hole.mode) && vector(hole.entry_center_mm)
      && finite(hole.diameter_mm) && hole.diameter_mm > 2 * TOL && finite(hole.depth_mm) && hole.depth_mm > TOL
      && axis >= 0 && hole.axis_inward.every((v, i) => i === axis ? Math.abs(v) === 1 : v === 0);
    if (!check('supported_hole_spec', supportedHole,
      'One positive-diameter circular hole, signed coordinate-axis inward direction, explicit depth and blind/through mode.')) return finish();
    const sign = hole.axis_inward[axis], radius = hole.diameter_mm / 2;
    const entry = hole.entry_center_mm;
    const bottom = entry.map((v, i) => v + hole.depth_mm * hole.axis_inward[i]);
    const fits = near(entry[axis], sign === 1 ? low[axis] : high[axis])
      && [0, 1, 2].filter(i => i !== axis).every(i => entry[i] - radius > low[i] + TOL && entry[i] + radius < high[i] - TOL)
      && (hole.mode === 'through' ? near(hole.depth_mm, outer.size_mm[axis]) : hole.depth_mm < outer.size_mm[axis] - TOL);
    if (!check('inward_hole_with_positive_walls', fits,
      'Entry must lie on the expected exterior face, the circular section must clear the side walls, and depth must match its mode.')) return finish();
    const cylinders = faces.filter(f => f.surfaceType === 'cylinder');
    if (!check('single_hole_complete_topology', circles.length === 2 && cylinders.length === 1
      && faces.length === (hole.mode === 'through' ? 7 : 8),
    'Exactly two circular boundaries and one cylindrical wall; a blind hole additionally requires one cap plane.')) return finish();
    const circleAt = (edge, location) => {
      const start = point(edge.start), end = point(edge.end), middle = point(edge.center);
      if (!start || !end || !middle || !same(start, end) || !near(edge.length, Math.PI * hole.diameter_mm)) return false;
      const circleCenter = start.map((v, i) => (v + middle[i]) / 2);
      // The circle is incident on the proved entry plane or the same cylinder.
      // Native type+closed circumference+diametric midpoint establish a full ring.
      return same(circleCenter, location) && near(distance(start, circleCenter), radius)
        && near(start[axis], location[axis]) && near(middle[axis], location[axis]);
    };
    const entryRings = circles.filter(e => circleAt(e, entry)), bottomRings = circles.filter(e => circleAt(e, bottom));
    if (!check('native_circle_radius_axis_and_depth', entryRings.length === 1 && bottomRings.length === 1
      && id(entryRings[0].id) !== id(bottomRings[0].id),
    { diameter_mm: hole.diameter_mm, entry_center_mm: entry, end_center_mm: bottom, depth_mm: hole.depth_mm })) return finish();
    const ring0 = id(entryRings[0].id), ring1 = id(bottomRings[0].id), cylinderId = id(cylinders[0].id);
    const entryPlane = outerPlanes.get(keyForPlane(axis, -sign));
    const extraPlanes = faces.filter(f => f.surfaceType === 'plane' && !expectedFaceEdges.has(id(f.id)));
    const bottomPlane = hole.mode === 'through' ? outerPlanes.get(keyForPlane(axis, sign)) : extraPlanes.length === 1 ? id(extraPlanes[0].id) : null;
    const adjacencyOK = bottomPlane !== null
      && sameSet(adjacency.get(ring0), new Set([cylinderId, entryPlane]))
      && sameSet(adjacency.get(ring1), new Set([cylinderId, bottomPlane]))
      && sameSet(incidence.get(cylinderId), new Set([ring0, ring1]));
    if (!check('shared_cylinder_and_correct_end_planes', adjacencyOK,
      'Both full rings must share exactly one cylinder; entry/through exit must meet proved outer planes, while a blind cap must be a separate plane.')) return finish();
    expectedFaceEdges.get(entryPlane).add(ring0);
    if (hole.mode === 'through') expectedFaceEdges.get(bottomPlane).add(ring1);
    else expectedFaceEdges.set(bottomPlane, new Set([ring1]));
    expectedFaceEdges.set(cylinderId, new Set([ring0, ring1]));
  }
  check('all_face_boundaries_accounted_for', expectedFaceEdges.size === faces.length && [...expectedFaceEdges].every(
    ([faceId, expected]) => sameSet(incidence.get(faceId), expected)),
  'Every face boundary is accounted for. Blind cap has only its inner ring; through ends have real exterior rectangular frames.');
  return finish();
}

function verifyPersistence(input) {
  const checks = [];
  const check = (checkId, pass, detail) => { checks.push({ id: checkId, pass: !!pass, detail }); return !!pass; };
  const receipt = input?.receipt, binding = input?.binding, context = input?.context;
  const current = obj(context?.context) ? context.context : context;
  const result = receipt?.result, saved = result?.saved_revision;
  const finish = () => ({ passed: checks.every(c => c.pass), scope: 'same_session_native_commit_ack',
    revision: revision(saved) ? saved : null, checks, geometry_verified: false, reopen_verified: false,
    limitation: 'Validates a real-shaped commit ACK against a supplied current same-session context and binding. Caller must preserve evidence provenance; this does not authenticate JSON or certify reload persistence.' });
  if (!check('commit_receipt_shape', obj(receipt) && obj(result) && scalarId(receipt.operation_id)
    && receipt.kind === 'operation' && (receipt.effect === 'commit'
      || guardedHeightCommit(receipt,input.invocation,input.capabilities)) && receipt.readonly === false
    && receipt.status === 'succeeded' && result.ok === true && receipt.error == null
    && result.draft_applied !== true && receipt.result_context_is_current === true,
  'Requires a succeeded, current, non-readonly commit with a successful host result.')) return finish();
  const identityOK = obj(binding) && obj(context) && obj(current) && obj(receipt.context)
    && IDENTITIES.every(key => revision(binding[key]) && revision(receipt[key]) && id(binding[key]) === id(receipt[key])
      && revision(context[key]) && id(binding[key]) === id(context[key])
      && (current[key] === undefined || (revision(current[key]) && id(binding[key]) === id(current[key])))
      && revision(receipt.context[key]) && id(binding[key]) === id(receipt.context[key]));
  if (!check('same_bound_document_version_session', identityOK,
    'Receipt, fresh context, nested identities and binding must agree on workspace/project/document/version/session.')) return finish();
  const revisionsOK = revision(saved) && revision(result.displayed_revision) && id(saved) === id(result.displayed_revision)
    && revision(current.revision) && id(saved) === id(current.revision)
    && revision(receipt.context.revision) && id(saved) === id(receipt.context.revision);
  check('saved_displayed_current_revision', revisionsOK,
    'Actual saved, displayed, receipt-context and fresh-context revisions must agree; placeholders are rejected.');
  const saves = result.saves;
  check('actual_save_acknowledgements', Array.isArray(saves) && saves.length > 0 && saves.every(save => obj(save)
    && save.status === 'saved' && revision(save.saved_revision) && scalarId(save.request_id)
    && scalarId(save.operation_id) && id(save.operation_id) === id(receipt.operation_id))
    && new Set(saves.map(save => id(save.request_id))).size === saves.length
    && revision(saved) && id(saves.at(-1).saved_revision) === id(saved),
  'All native save acknowledgements must be saved, belong to this operation, and finish at the displayed revision.');
  const idle = state => obj(state) && state.has_draft === false && state.is_busy === false
    && state.pending_saves === 0 && state.sketch_active === false && state.active_command == null;
  check('connected_idle_without_pending_save', context.connected === true && receipt.context.connected === true
    && (current.connected === undefined || current.connected === true)
    && idle(current.modeling) && idle(receipt.context.modeling),
  'Both receipt and fresh context must explicitly show no draft, active sketch, busy command or pending save.');
  return finish();
}

module.exports = { verifyGeometry, verifyPersistence };

if (require.main === module) {
  const mode = process.argv[2];
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { text += chunk; });
  process.stdin.on('end', () => {
    try {
      if (!['geometry', 'persistence'].includes(mode) || process.argv.length !== 3) throw new Error('Usage: verify-modeling-recipes.cjs geometry|persistence < evidence.json');
      const input = JSON.parse(text);
      const result = mode === 'geometry' ? verifyGeometry(input) : verifyPersistence(input);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      process.exitCode = result.passed ? 0 : 1;
    } catch (error) {
      process.stdout.write(JSON.stringify({ passed: false, error: error.message }) + '\n');
      process.exitCode = 2;
    }
  });
}

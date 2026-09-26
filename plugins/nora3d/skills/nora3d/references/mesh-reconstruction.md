# Mesh reconstruction (candidate Mesh API v1)

Discover `category="mesh"` and fetch exact schemas. Entries require matching
AI/Web deployments; installing a skill does not enable server capabilities.

## Workflow

### Bounded reconstruction analysis, when exposed by the connected service

Discover `nora_reconstruct_mesh` before using it. Its current `phone_case` /
`full` schema starts analysis and candidate decisions, not a finished native
model. Use the current workspace, mesh ID and context token with one stable
idempotency key. Poll its operation ID with `nora_get_operation` using bounded
waits; cancel through `nora_cancel_operation` when the user cancels. If supported,
request `include_continuation=true` to retrieve the saved profiles and source
triangle evidence for continued modeling.

`needs_codex`, `full_acceptance_passed=false`, semantic confidence or analysis
completion never prove editable CAD was created or saved. Inspect the candidate
evidence and unknown regions, reread current context and continue only justified
native operations under the existing modeling request. Do not guess missing
features, replay an interrupted run or reuse handles after a source/session
change. If evidence cannot support the requested shape, explain the missing
step or ask the necessary geometry question. Credentials stay server-side;
ordinary plugin users must not configure a provider key.

For native verification, discover the `filter_solid_topology` inspector and its
current arguments when available. Filter actual solid/feature IDs and native
curve/plane facts, respecting unsupported geometry and exact match counts.
Display bounds and semantic labels are not proof of coplanarity or dimensions.

### Direct mesh operations

1. Bind the intended current-host document and read current mesh/solid IDs.
2. `ccad.host.mesh_snapshot(mesh_id)` reads loaded triangles and instance world
   transforms. Coordinates use native millimetres; original import units may be
   unknown. If the intended physical scale is unknown, confirm it before
   modeling; read-only analysis can proceed in document coordinates. Do not
   silently rescale or repair the source.
3. Use `mesh_analyze` for topology and `mesh_recognize_features` for evidenced
   candidates. `mesh_section` accepts an explicit orthonormal `{origin,u,v}`
   world frame, with `slice` or `coplanar` boundary extraction mode.
4. `mesh_fit_profiles(section_handle)` defaults to 0.02 mm fit tolerance;
   use 0.003 mm for clean engravings. Preserve glyph contours instead of guessing
   a font. It checks vertices and source-edge radial extrema to prevent sparse
   straight edges being swallowed by arcs. The separately reported vertex and
   polyline residuals do not certify continuous 3D surface precision.
5. Retain `sketch_profile` from the fit response, create/inspect the native
   sketch frame, then pass the profile and `sketch_id` to `create_sketch_profile`.
   It accepts at most 256 straight/three-point-arc segments and 512 KiB. Local XY
   points use the explicit world frame; the host converts to native document
   coordinates and rejects off-plane or invalid geometry before dispatch.
6. This creates a Codex-owned draft, not a saved document. Exit the sketch and
   use existing native extrude/cut operations. Check actual saved/displayed
   revisions. A partial result contains segment receipts and a checkpoint;
   reconcile it before writing again. Never replay an uncertain profile.
7. Take a fresh snapshot after modeling. `compare_mesh_solid` requires an
   explicit column-major rigid transform mapping target world into source world.
   A target translated +110 mm in X needs -110 mm alignment translation. No ICP,
   inferred scaling or automatic registration is performed.
8. Read `mesh_report` pages (up to 50 items). `heatmap_image` returns a PNG with
   three projections. Other fields expose loops, feature candidates, sections
   and both directional heatmap samples with triangle provenance.

## Limits and evidence

- Handles are memory-only: eight records / 128 MiB total / 15-minute TTL. Revision,
  document, version, viewer, document generation and disconnect invalidate them.
- Workers terminate on timeout (90 seconds) or cancellation and reject stale
  results. Source hashes and source-triangle evidence accompany reports.
- Recognition's explicitly disclosed 1e-6 mm welding affects an analysis copy
  only. Exact-coordinate topology diagnostics never conceal source defects.
  Slice stitching uses at most 0.0001 mm, recorded in evidence. Thin-region
  candidates based only on face pairs retain required interior/connection
  validation; they are not verified constant-section extrusions.
- Comparison reports P99 and sampled maximum against target display triangles,
  sample count/method and unknown tessellation error. It does not certify exact
  B-rep deviation or mass properties. Volume is withheld on invalid topology;
  even closed oriented mesh volume does not certify absence of self intersection.
  Both directions include worst-sample coordinates and source triangle IDs.
  Full-source comparison retains internal mating interfaces; a fused solid can
  therefore differ even with matching exterior geometry. Do not silently filter
  interfaces or relabel a failed full-source result as a passing exterior test.
- Extrusion and slot-spacing candidates are not recovered design intent.
  Regular pitch does not establish congruent profiles; tapered slots must not be
  replaced with an identical pattern without shape verification.
- Freeform scan repair and automatic sewing are out of scope. Real-kernel
  save/reopen/undo/redo acceptance is required before production promotion.

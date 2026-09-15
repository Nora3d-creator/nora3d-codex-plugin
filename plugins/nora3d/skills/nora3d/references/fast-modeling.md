# Batches and geometry inspection

Reduce round trips through planning, caching, and batches while retaining engineering checks. Do not promise completion times that have not been measured.

## Planning and discovery

After reading the drawing, establish dimensions, units, origin, solids/holes, and dependencies. Fetch needed schemas together and reuse them when catalog_revision matches. If catalog search returns ui_matches, its exact entry_id and menu parameters are suggestions; they do not replace checks of actual current availability.

## Batch contract

`nora_execute_batch(workspace_id,context_token,idempotency_key,steps,wait_seconds=20)` accepts 1–32 steps. Each is `{id, operation, parameters, kind?="operation", expect?:[{path,equals}]}`. For `kind="inspect"`, operation is the query name. Loops, scripts, and arbitrary expressions are not supported.

Parameter references must be standalone objects, such as `{"$ref":"base.body_ids.0"}`. Reference only actual outputs of earlier steps; missing fields stop the batch. Native outputs are preserved, with entity_ids/feature_ids/body_ids aliases and entity_id_strings/feature_id_strings/body_id_strings for schemas needing strings. When native ID arrays are empty, aliases may be filled from actual created_entities/created_features. They never confuse feature-tree IDs with entity IDs or infer body_ids from all entities.

Use entity_id_ints/feature_id_ints/body_id_ints for strict integer parameters. For example, after a plane step, sketch.create can take `{"sketch_wp_face_id":{"$ref":"plane.entity_id_ints.0"}}`. Integer aliases are provided only when every ID is an integer or canonical decimal string from 1 to 9007199254740991, preserving order. Do not coerce booleans, fractions, whitespace, leading zeros, nonnumeric values, or out-of-range IDs. If any member is invalid, the entire integer alias group is omitted and its reference fails the batch. For nested inspection geometry/topology, follow the actual schema and result paths; never infer IDs from names, positions, or the feature tree. Check actual receipt structure instead of guessing what a step creates.

Sketch creation, lines/arcs, profile inspection, and exit/save can form one serial batch. After receiving saved sketch IDs, submit solid features. Step `expect` supports equality assertions: confirm the path in an actual inspect result before asserting profile count, hole loops, or dimensions. `profile_check` requires `validation.status == "pass"` by default. unknown also stops execution; do not skip validation for speed.

A completed batch returns step receipts, the last confirmed saved version, compact context, and cursor. For queued/running, use bounded get_batch waits. Even after succeeded, check saved_revision/displayed_revision for relevant commit steps. A failure preserves completed features; it does not automatically undo them. Replan from current state after human intervention and never overwrite human drafts. Reuse the same batch key for transport retries. After cancellation, do not redispatch executed or uncertain steps.

## Geometry verification

`sketch_frame` reports the actual active 2D sketch matrix, local-to-document/world and inverse transforms, and can transform multiple points. Report unavailability for inactive/3D sketches or missing matrices.

`profile_check` evaluates closure, gaps, crossings, and containment from native line/circle/arc parameters. Distinguish analytic candidates from kernel-region confirmation. Hole loops are only sketch evidence. After checking dimensions, inspect solid topology, such as cylinder-face radius, axis, and boundaries, to prove actual cutting direction and through-holes. A displayed bounding box is only an approximate shape check.

One two-lug bracket construction is: base with mounting holes, extruded/merged lug outlines, a cut between the lugs, an extruded/merged boss, its internal hole, and the through-hole across the lugs. Derive each sketch from its actual plane frame and bind cross-batch parameters to real preceding receipts. Do not reuse IDs from another document. Extruding two disjoint circles may yield one composite entity; use the actual returned solids when merging rather than assuming two bodies.

An edge's `center` in `retrieval_scene_entity_infos` is its parameter midpoint, not necessarily a circle center. Only for a confirmed complete closed circle may the closure point, parameter midpoint, and perimeter be used to calculate center/diameter. Do not apply this formula to other curves. A through-hole needs circular boundaries at both axial ends and side-face topology. A boss through-hole also needs its intersection with the lug hole and the front annular face; dark circles in a screenshot are insufficient.

## Inspection size and recovery

Start with current entity IDs, feature parameters, and necessary dimensions; query by object/edge/face type. For outer extent alone, disable `includeEdges` / `includeFaces`. Do not request every edge and face of a many-hole model at once: expanded results can exceed the gateway's 2 MB request limit.

Pagination-capable `nora_inspect(query="listSolidTopology", arguments={solidId, kinds:["face"], offset:0, limit:50})` returns `total`, `hasMore`, and `nextOffset`. Keep one document version and valid context_token across pages. If geometry changes, discard old pages and recheck. A page count is not the whole solid's total. Old pages lacking these fields do not support complete pagination: do not repeatedly reread their first 50 items. Use supported precise-target queries or explain the need for a page update. Missing pages, truncation, and approximate meshes are not complete precision acceptance.

For HTTP 413 / `read_result_too_large`, make smaller read-only queries. A `read_timeout` may permit a read-only retry. Neither requires accepting an unknown write. Real writes in `reconciling` still require reconciliation; do not apply read-only recovery rules to them. Camera movement does not mean a sketch edit or surrender of control, and does not authorize refreshing the page.

Record prepare_compile_ms, queue_ms, host_and_receipt_ms, and step_ms when returned. Distinguish actually measured planning, round trips, compilation, queues, kernel, save, and recovery times. An unseparated host time is not pure kernel time.

After a service restart, queued steps not yet dispatched are cancelled and in-flight operations enter reconciling. A receipt retained by the same page may be resent idempotently. Without persistent-save evidence, inspect state instead of assuming success. Verify browser login, document sharing, and MCP authentication separately.

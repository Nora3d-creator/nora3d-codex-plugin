# Direct modeling with Codex

Use this workflow for a connected Nora3D PartDocument. Operation names and parameters come from actual MCP capabilities; this guide does not prove that a deployment exposes an undeclared API.

## From intent to features

Prepare a short internal modeling brief: units, overall dimensions, origin and orientation, functional components, existing features to preserve, and required checks. Execute clear requests directly. Ask only for missing dimensions that materially affect function or assembly. Presentation models may use reasonable stated assumptions; do not turn assumptions into verified engineering specifications.

Separate functional components into independent solids. Plan dependencies such as sketch → extrude/cut → position → fillet/detail. Prefer a known datum plane for new parts, followed by explicit world-coordinate positioning. One sketch may contain disjoint profiles that need the same extrusion height and direction. Preserve separate solids and names for parts that must remain independently editable.

For a desk, define the tabletop, side/back panels, shelves, drawer box, drawer front, cable holes, and channels separately. Cabinets need actual cavities. Drawers need bottoms, sides, and openings, not solid boxes. An independent drawer in a multi-solid part does not imply an assembly motion joint.

Maintain a compact entity table from actual receipts:

| Semantic component | Feature hid / uuid | Object or solid ID | Dependent sketch entity IDs | Current key dimensions |
| --- | --- | --- | --- | --- |
| Real component name | From features | From entities or an actual query | From references/receipts | From parameters/geometry |

Names locate semantic targets; resolve actual IDs before execution. Do not reuse example IDs from another task. Recheck valid IDs after booleans, cuts, and transforms.

## Execution loop

1. Read capabilities, current context, and the change cursor. Verify the target document, units, and human drafts.
2. Prepare operations with geometric ambiguities resolved. Use the actual schema, latest context_token, and a unique logical key. Prefer batches and wait+compact context. Preserve a check boundary for the first uncertain direction transform; see [drawing review and local repair](drawing-review.md).
3. Prefer the submission's actual receipt. Only queued/dispatched/running work needs `nora_get_operation` or `nora_get_batch(wait_seconds=20)`. draft_applied means that sketch command finished and its owned sketch may continue; do not wait for it to save itself. Continue on succeeded; stop that operation on failed/cancelled; reconcile an uncertain result on reconciling. Avoid frequent short polling and duplicate writes.
4. When a terminal receipt includes compact context, update the token, cursor, and ID mappings directly. Read more only for missing facts or human changes. Follow next_cursor if further change pages exist; do not impose a fixed submit→poll→full-context sequence.
5. Make targeted geometry checks after a functional component or critical cut/positioning step. Finish with overall checks and a viewport image. Do not repeat full-model topology and screenshots after every low-level step.

Serialize writes to a document; never launch parallel writes with the same old context_token. After human intervention, replan unfinished steps and retain confirmed results.

For sketch creation/drawing, draft_applied confirms only the draft change. Verify persistence after exiting and saving. Continue the external workflow's own sketch only as allowed by the interface. If the user is editing or ownership is unclear, inspect the state instead of committing or cancelling the draft unilaterally.

## IDs and coordinates

- Editing a feature requires schema-appropriate `hid` and `feature_uuid` referring to that same current feature.
- Extrusion references a sketch object/entity ID, not its feature-tree index.
- `transform.*.feature_ids` actually accepts object/entity IDs. A historical field name is not sufficient evidence of semantics.
- Read the current face ID before sketching on a face. Read datum plane IDs from the current document rather than fixing an example ID such as 8.
- Follow the current sketch-plane and normal contract. Calculate coordinate intervals for symmetric structures instead of estimating millimeter offsets from a screenshot.
- Before cutting, check the sketch normal, material side, and target solid; pass direction and depth explicitly when the schema supports them. Verify actual through-depth or blind depth afterward. A visible circle does not prove a hole. Do not copy reverse=1 from another task.
- Unless name resolution is explicitly supported, do not put names into numeric ID fields.

For spheres and cones, `primitive_position_point` accepts explicit coordinates `{x,y,z}` or a point reference `{id:current_point_id}`; do not mix them. Coordinates are not entity numbers. Do not invent an ID after a positioning failure. Do not infer cone direction from unexplained `position_type` numbers: inspect the actual axis and use the same coordinate system for dependent features. Before reorienting a part, calculate the target axis and a transformed feature point rather than trying 90 degrees then correcting by 180 degrees. After transforms/booleans, use the new body_ids/feature_ids from receipts. Within a batch, query preceding outputs instead of replaced features.

Inspect visible objects before final presentation. `hideOthersSketch` hides sketches other than the selected one and requires valid sketch selection. If no auxiliary sketches are visible, skip it; it is not an unconditional hide-all command. A successful view command only updates the camera. If the model axis is wrong, check geometry instead of repeatedly switching front/isometric/fit views.

## Failure recovery

| Result | Next step |
| --- | --- |
| Parameter validation failed before dispatch | Check actual schema, IDs, and coordinates. Correct the parameters with a new logical key; do not repeat identical invalid input. |
| stale_context | Read context again, check whether human edits affect the intent, then prepare the request. |
| queued / dispatched | Check the same operation_id instead of creating another operation. |
| reconciling / connection loss | Inspect actual geometry, versions, and operation records. Follow the uncertainty-recovery contract; do not assume success or immediately undo. |
| Confirmed geometric failure | Change one evidence-backed geometric condition. If the same path fails again, use a supported alternative construction or explain the gap and use UI fallback. |
| Missing API capability | Check capabilities and relevant guidance once, choose a supported decomposition or Computer Use, and do not hide the gap by starting the native Agent. |

## Completion criteria

Check requested overall dimensions, solid count, actual holes/cavities, key relative positions, and appearance. Read a real version for the saved model; a screenshot only checks appearance. Distinguish native parameters, analytic geometry, and approximate meshes. Without load, manufacturing, or motion verification, do not describe visual completeness as production readiness or verified movement.

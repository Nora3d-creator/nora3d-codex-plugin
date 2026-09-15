# Folding and mechanism positioning

Use this guide to reposition existing stands, scissor mechanisms, and folding links, not to rebuild or compress part shapes. The normal path is one context read → necessary local geometry → one calculation → 1–2 write batches → focused verification. Reuse trustworthy motion records; identify geometry and relationships for unknown mechanisms. Never omit checks merely to reduce calls or time.

## Determine what changes

"Only narrow the width" preserves tilt and length. "Continue flattening" preserves the narrowed width. "Fully fold" changes both. Ask once only when prior context does not resolve the intent; independent read-only identification may continue while awaiting the answer. Do not ask again when the target is already specified. Width scaling or part regeneration is not mechanism folding.

## Read enough geometry

- Reuse the current visible tab and read current context/change cursor once. Check document, epoch, revision, and drafts. Rediscover only after navigation or connection changes, rather than rereading the browser tree, taking screenshots, and listing workspaces for every edit.
- Group objects by rigid motion: fixed base, moving side frames, support plate, rods, crossed links, and sliders. Distinguish entity IDs from feature IDs. Each part belongs to only one transform group for a given operation, preventing duplicate movement.
- Read hinge axes, hole centers, slot directions/travel, and necessary contact faces from native analytic geometry. Use `ccad.host.retrieval_scene_entity_infos` for the needed features together; disable faces when edges and solid summaries suffice. Do not retrieve all topology and then retrieve the same native edges again. For an unknown hole axis, read its cylindrical face instead of treating an edge parameter midpoint as the circle center.
- `listSolidTopology` can identify candidates, but displayed mesh bounds cannot precisely prove pin/hole coaxiality or safe travel. Reuse earlier measurements only while document, revision, and object mappings remain valid; otherwise reread affected groups.
- Cache schemas by catalog_revision and fetch missing entries together with `nora_get_catalog_schemas(entry_ids)`. Do not repeatedly search rotate/translate/transformation after the exact entry_id is known.

## Calculate before modifying CAD

Collect pivot P, axis a, current/target directions, motion groups, and slider limits. Calculate all moves locally before writing. [plan-fold-motion.cjs](../scripts/plan-fold-motion.cjs) is a pure Node calculator: it does not call CAD or read credentials, and its result is always `planned_only`. Run `node <current-skill-directory>/scripts/plan-fold-motion.cjs <input.json>`. One input can contain multiple motions. Use one world coordinate system and length unit.

```json
{"motions":[
  {"kind":"hinge","axis":[0,0,1],"pivot":[10,20,3],
   "from_direction":[0,1,0],"to_direction":[1,0,0],"points":[[10,20,3],[10,22,3]]},
  {"kind":"scissor","link_length":100,"current_span":80,"target_span":28,
   "slider_min":0,"slider_max":100,"branch":1}
]}
```

Hinge uses signed atan2 for the angle. Rotation about the real pivot is `x' = P + R(x-P)`; prefer `transform.rotate(center=P)` rather than rotating about the origin and visually correcting position. If the pivot also moves, supply `target_pivot`, then translate by `target_pivot-P` after rotation. `alias_rotation` applies only to the current X/Y/Z rotation aliases. It is null for an arbitrary axis: inspect an actual arbitrary-axis/matrix schema or derive supported axis rotations analytically, instead of putting a vector in an axis-name field. `origin_rotation_translation` is the total translation after origin-centered rotation; do not also apply it after pivot-centered rotation. Skip zero rotations/translations; current aliases do not accept zero actions.

Scissor assumes coplanar rigid links. For center-to-center length L, horizontal hinge-center span w, and vertical projection s, use `s = branch * sqrt(L²-w²)`. Input w is hinge-center distance, not overall width; subtract side-frame thickness and offsets first. Obtain branch ±1 from the actual current geometry, retain the mechanism branch, and do not cross a toggle. Slider bounds are signed allowed projections in the same coordinate system, already reduced for pin radius and end clearance, not the outer slot length. Calculate both links' target ends, centers, and signed angles before moving frames/sliders together. Do not apply the single-scissor formula to asymmetric, spatial, or multi-stage linkages. If near_toggle=true, check the toggle and path before submitting.

Optional points produce predicted positions for checking pivot invariance, rod length, and reachable targets before a write. Predictions are not model measurements. Example numbers are not general defaults; derive real targets from the user's request and current geometry.

## Execute and verify

Use the latest context_token. Batch rotations/translations by rigid group and bind later steps to actual receipt body_ids through `$ref`; do not retain IDs invalidated by a transform. Do not explore direction with an arbitrary test rotation. A minimal experiment is justified only by real interface/geometric uncertainty, followed by inspection before further writes. Prefer 1–2 write batches, but never batch across human edits, unknown outcomes, or unresolved verification boundaries.

Finally read relevant hole axes, pivots, and slot ends for each motion group. Check pivot/pin coaxiality, preserved link lengths, slider travel/clearance, requested preserved angle/width, and folded outer shape. For contact or collision verification, use available native geometry queries. Bounds only identify candidates, and a screenshot cannot prove no interference. Final-pose changes do not establish constraint solving or continuous collision detection; do not claim the physical path is verified. Check unresolved collision concerns locally or report the verification boundary.

Verify commit saved_revision/displayed_revision. Usually one final screenshot suffices. Presentation and hiding helpers can be batched, but view receipts do not prove a save. After failure, consume completed results/cursors without replaying the entire motion.

## Reuse on the next request

Keep a compact task motion record: document_id, session_epoch, saved_revision, catalog_revision, current body IDs and corresponding feature IDs by rigid group, world hinge axes/pivots, width/tilt/slider limits, current pose, and completed checks. An existing writable task directory may store this as JSON; never put user model IDs in the public Skill. Update the record with returned mappings and final native measurements after every successful transform.

Next time, read changes since the cursor. Reuse geometry/schema only for the same document with no relevant changes. Human moves, regeneration, topology changes, and changed IDs after reconnect require refreshing affected facts. Without trustworthy records in a new task, reconstruct motion relationships read-only rather than guessing from screenshots or old chat IDs. The plugin supplies algorithms and verification procedures; automatic persistence/discovery of template motion metadata across tasks is not currently implemented.

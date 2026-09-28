# Desktop execution core and fast path

Read this core once for every modeling/geometry-inspection task, including
complex routes. Explicit basic shapes, a single-target color/parameter edit,
a simple planar hole or a bounded native query can proceed with this compact
route; other tasks add the triggered topics below. It reduces repeated discovery
and planning; it grants no new operation, access or geometry guarantee.

## Establish the task once

Retain the user's goal, target, dimensions with units and sources, protected
geometry, and acceptance conditions. For a follow-up, change only the affected
requirements. Keep supplied dimensions and authorization across voice/text
handoffs; do not ask again merely because execution is beginning. Ask about
essential missing/conflicting information while doing independent work. Never
invent a dimension or silently approximate. Analysis-only requests remain reads.

A drawing, additional view or shape correction requires [drawing review](drawing-review.md)
before geometric writes. Complex/multi-solid dependencies require
[direct modeling](direct-modeling.md). Threads, lofts and sweeps use
[threads and lofts](thread-and-loft.md); mechanisms use [folding](folding.md);
meshes use [mesh reconstruction](mesh-reconstruction.md). Library insertion,
unfamiliar topology or an unresolved failure uses the [playbook](modeling-playbook.md).
Do not load unrelated topics. Read [batches](fast-modeling.md) before the first
batch, output-reference chain or paginated topology inspection in this task.

## Bind, discover, then reuse

- Keep the exact verified browser/tab, project/document, workspace and session.
  Check live status, deployment origins, actual permission and current modeling
  state. A URL grants no access. Follow [connection](buttonless-connection.md)
  on first use or a binding change, not before every command. A missing document
  is not proof of an account mismatch. Never choose the newest session by guess.
- Read capabilities once for a binding/deployment and fetch only missing schemas,
  preferably together with `nora_get_catalog_schemas`. Cache schemas by deployment
  and `catalog_revision`; refresh affected data on a mismatch, reconnection or
  capability error. The live catalog is authoritative; never assume an entry count.
- Keep complete tool data in the current host's available orchestration state.
  Return task-relevant identity, status, context, IDs, verification, save evidence
  and errors to the model instead of repeatedly printing full catalog/wrapper
  data. Mark omitted/truncated data and retain access to its original; do not
  strip permission, human-work, pending-write, approximate or pagination fields.
  Do not discard native output needed by a subsequent step just to shorten text.
- Use actual terminal receipts and `changes.next_cursor`. A receipt context is
  reusable only for the still-current binding and when it provides the required
  current token/state with no false/unknown currentness, human change or pending
  state. Otherwise get fresh guarded context. Never treat a historic success as
  a current token. Do not impose an extra full-context read after every receipt
  when the current receipt already supplies the necessary state.
- Human drafts, busy state and Web assistant leases stop conflicting writes.
  Continue a draft only when both service and page confirm `draft_owner=codex`
  and permit continuation. Never clear a lease or use UI to bypass the guard.
  Camera navigation alone is not a model edit. A changed document/session revokes
  cached context and object bindings; retain the requirements, not old IDs.

## Execute at real decision boundaries

For an explicit box, a single planar hole or a located extrusion-height edit,
consult [bounded recipe candidates](modeling-recipes.md). The optional local
planner can compute a reviewable batch from the current raw context and schemas.
Use it only when its preconditions match; `needs_probe` or `rejected` is not an
executable plan. Other geometry continues through the task routes above.

Before a group, state the intended change briefly. Compute known parameters and
dependencies together. Use declared fully parameterized operations through MCP;
menu activation is not finished modeling. Do not start another native reasoning
agent, enable delegation, change Web settings or switch deployments for speed.

Batch deterministic serial steps (maximum 32) with real earlier output `$ref`
values and focused `expect` assertions. Independent reads may run together when
they use the same valid document state; writes to one document remain serial.
Existing batch references are not arithmetic, loops or arbitrary scripts. Stop
at a missing frame, unresolved target, unknown check or human intervention;
resolve that uncertainty before constructing the next group. Failure/cancellation
preserves already applied steps and is not automatic rollback.

For each logical write keep one stable idempotency key. Prefer supported bounded
waits with context included (`wait_seconds=20` on operation reads); poll again
only when still queued/dispatched/running. A timeout never authorizes a new key
for the same uncertain write. `reconciling` stops further writes until actual
receipt/geometry evidence and the reconciliation contract resolve the outcome.
Only a confirmed pre-dispatch validation failure can be corrected as a new
logical operation. For recovery use [task recovery](assistant-workflow.md).

## Geometry is still mandatory

Keep entity/body IDs, feature IDs/UUIDs, sketch IDs and face/edge IDs distinct.
Use actual outputs and schema types. Never derive an ID from a name, tree index
or old model; bind new topology after a modifying operation.

For sketches read the actual `sketch_frame` origin/u/v/normal and transform
coordinates. Plane names do not prove orientation. Before solid extrusion or
cutting require `profile_check.validation.status=pass`; unknown stops. Check
closure, crossings, intended loop count and dimensions. After a hole, inspect
the solid's native diameter, axis, boundaries and termination/depth. A circle
in a sketch or a dark patch in a screenshot does not prove a hole.

For a color edit verify the intended object's resulting color and save receipt;
for a parameter edit verify actual recomputed geometry and affected dependencies.
An unchanged variable label is not measurement. Use precise native parameters,
analytic geometry or relevant topology for dimensions. Mesh bounds and rendering
are approximate; retain their provenance and uncertainty.

Inspect only needed objects/faces/edges. A 413/read_result_too_large or read_timeout
is a read failure: narrow or boundedly retry the read, not the preceding write.
Pagination is complete only with explicit terminal-page evidence in one document
version; never mistake 50 returned faces for a whole large model.

## Complete once, with evidence

Check each functional group's critical invariants, then all task requirements.
Repair known mismatches and remeasure. Draft/view/session success is not a saved
model. For commits verify actual `saved_revision` and `displayed_revision`, no
unknown/pending save, and that the visible state matches the accepted result.
Persisted completion must not be inferred from the last successful camera step.

Use supported final hide/fit operations when appropriate and normally one final
visual check for the latest user goal. Avoid screenshots/full topology after
every minor operation. A screenshot does not substitute for dimensions or save
proof. Never reload a human draft to verify saving; a controlled save/reopen
acceptance test belongs in an idle disposable document or an authorized workflow.

Report what changed, measured results and saved state. Mark incomplete or unknown
requirements explicitly. Do not promise a speedup or completion time from a fast
single operation. Log returned timing fields without calling host time pure
kernel time or adding nested save time twice.

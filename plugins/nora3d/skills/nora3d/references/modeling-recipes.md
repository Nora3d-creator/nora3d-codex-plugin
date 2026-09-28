# Bounded desktop recipe candidates

These optional pure local helpers reduce repeated parameter planning. They do
not call CAD, acquire permissions, search private history or certify a recipe.
Use the host's existing Node runtime; import the helper once in an available
orchestration runtime or pass JSON through stdin. Do not add a shell round trip
after every CAD step. Always execute through the existing guarded MCP tools.

## Plan against live contracts

`scripts/modeling-recipes.cjs` exports `compilePlan(input)`. Supply `recipe`,
`request`, the exact current `binding`, raw full `context`, fetched `catalog`
and needed `capabilities`/native `evidence`. The returned `batch` is a candidate
only when status is `ready`; use one stable caller-owned idempotency key for each
logical batch. No history IDs, document binding or context token from a past run
may be substituted for current facts. Preserve the returned acceptance items.

- `box`: explicit `size_mm:[X,Y,Z]`, `center_mm:[x,y,z]`, `feature_name`.
  The reviewed direction X maps width to world X and length to world Y.
- `hole`: one current body and planar face, explicit document-space center,
  inward direction, diameter, mode and depth. Stop to read the actual sketch
  frame; draw a circle using its native U axis; require analytic profile pass;
  exit and cut only from the actual saved sketch. Through cuts additionally
  need the supported native material-span evidence. A requested depth or bbox
  is not proof of a through-hole. Follow the helper's staged result contract.
- `edit_extrude`: a located native feature ID/UUID and supported original
  parameters are required before changing its height. Missing feature parameters
  require a focused native probe. Never fill unknown values with defaults.

Inspect the helper's input checks before use. Unsupported schemas, units,
topology, draft ownership or stages require another supported method or a probe;
do not weaken a guard to obtain a plan. A failed batch retains completed work.
Unknown dispatch/save outcomes still require reconciliation before another write.

## Independent acceptance

`scripts/verify-modeling-recipes.cjs` separates `verifyGeometry` from
`verifyPersistence`. Its geometry scope is deliberately limited to an
axis-aligned rectangular body with at most one cylindrical hole. Supply complete
current native `retrieval_scene_entity_infos` geometry, its source/revision and
the target dimensions. It checks outer native edges and circular boundaries
with cylindrical-wall/plane adjacency. Mesh bounds, face area estimates and
successful input parameters do not prove dimensions. Native edge `center` is
a parameter midpoint, not a circle center.

The persistence checker needs an actual commit receipt and the matching current
context. It proves the supported same-session save/display conditions only.
For controlled reopen acceptance, reload only an idle authorized test document,
discover its new session, and independently inspect the saved geometry again.
Never relabel an old save receipt as fresh-session verification.

One successful run is evidence for that run, not universal recipe certification.
Keep failures and parameter variants with the recipe version. Promotion still
requires independent replay, boundary/negative cases and unchanged quality.
See [experience reuse](modeling-experience.md).

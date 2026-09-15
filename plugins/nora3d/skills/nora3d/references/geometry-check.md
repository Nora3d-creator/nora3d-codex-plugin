# Offline geometry checks

Run `scripts/check-drawing-geometry.cjs measurements.json` with Node. The script has no third-party dependencies, does not access services, and does not modify models. Discover Node through the host's actual runtime. If Node is unavailable, calculate the same formulas directly rather than installing a runtime for a simple check.

The top-level `document_id` and `revision` must come from current MCP context. `checks` must be a nonempty array. Each item contains a unique `id`, `kind`, `expected`, `geometry`, and `evidence`. Evidence requires `source:"native_geometry"`, matching `document_id/revision`, and actual `object_ids` as strings. Missing evidence, an old revision, mesh/planned values, or invalid geometry produce unknown, not a pass. The script cannot independently prove evidence authenticity: Codex must convert actual native query results and retain the original receipts. Derive expected values from the drawing before testing; never change them to match an incorrect model.

Convert all lengths to mm. Three-dimensional points and directions use `[x,y,z]` in one document coordinate system. Defaults are 0.01 mm linear error and 0.1 degrees angular error. Supply `tolerance_mm` and `tolerance_degrees` when the drawing defines tolerances. Do not loosen them to hide failures.

| kind | expected | geometry |
| --- | --- | --- |
| parallel_thickness | `{thickness_mm:6.35}` | `plane_a` and `plane_b`, each `{point:[...],normal:[...]}`, measured on the extended planar section, excluding root fillets. Opposite normal directions are allowed. Nonparallel planes return null thickness. |
| u_slot | `{depth_mm:12.7,radius_mm:6.35}` | `mouth_left/right` are the opening ends, `join_left/right` are the straight-to-semicircle junctions, `bottom` is the deepest point, and `radius_mm` comes from the native arc. Checks width, direction, centering, and depth=straight length+radius. It does not prove curve connectivity or a completed cut. |
| direction | `{direction:[1,0,0]}` | Actual feature vector defined by `{start:[...],end:[...]}`. Signed orientation must retain a 180-degree reversal error; do not substitute the absolute dot product used for plane parallelism. |

This is only a field example. Replace document, revision, and face IDs with actual current values:

```json
{"document_id":"current-document","revision":"current-revision","checks":[
  {"id":"ear-thickness","kind":"parallel_thickness",
   "expected":{"thickness_mm":6.35},
   "geometry":{"plane_a":{"point":[0,0,0],"normal":[0,1,0]},"plane_b":{"point":[0,6.35,0],"normal":[0,-1,0]}},
   "evidence":{"source":"native_geometry","document_id":"current-document","revision":"current-revision","object_ids":["actual-face-a","actual-face-b"]}}
]}
```

Exit code 0 means only that the supplied checks passed, 1 means failure or unknown, and 2 means invalid input/invocation. Do not promote this to complete-part acceptance. Holes, root angles/fillets, cylinder walls, symmetry, and other requirements still need their own native checks.

# Drawing interpretation and local repair

Read this guide before the first geometric write for a drawing-based task. A simple part may use a short dimension table rather than a long process. Accurate correspondence is the default; the user need not request it again. The drawing and user's requirements determine geometry. Do not reuse the example dimensions for unrelated parts.

## Inspect the whole drawing before choosing a section

First inspect the entire original image: orthographic views, isometric/3D illustration, sections, auxiliary views, and details. Then enlarge relevant regions. Do not crop only dimension-dense orthographic views and overlook a 3D view in a corner. Briefly record which views establish shape, which annotations establish dimensions, and which relationships remain uncertain. Saying "I looked at the 3D view" is insufficient: identify what it supports or excludes.

Dimension lines establish size and position. The 3D view provides evidence of planar/curved surfaces, edges, inside/outside, orientation, connectivity, and openings. Lack of a section view does not automatically make the section unknowable: first match visible isometric faces and edges to projections, hidden lines, and radius leaders. Perspective, lighting, and mesh segments do not prove precise dimensions. Resolve conflicts between the 3D view and dimensions/projections instead of ignoring a view.

Before creating a bent strip, ring, handle, or sweep solid, reconstruct its closed section perpendicular to the local path. List lines/arcs in order, width, thickness, centers, tangencies, and orientation toward the part's inside/outside/up/down. Solve section shape separately from the longitudinal path. A straight section top does not mean the whole curved part has one planar top. Bind each R label to the actual path bend, end contour, section arc, or edge fillet. R20 and 40 alone do not establish a diameter-40 round bar or a full-perimeter fillet.

Project each candidate section into every relevant view: expected broad faces, sidewalls, sharp edges, arcs, and hidden lines. Do not submit the candidate while an obvious contradiction remains. Do not present two incorrect candidates as an exhaustive choice for the user. Derive what the complete drawing supports; ask only for a specific unresolved relationship that changes geometry.

Curved-ring section example: a broad top face, distinct inner edge and sidewall, together with projected 40 and lower R20, support a local section with a straight top of width 40, upper vertical sides of height 20, a lower semicircle R20, and total thickness 40. This differs from a diameter-40 round bar or a section curved outside but flat inside. Those alternatives can match outer bounds while narrowing the top and changing visible edges. Here 20 is derived as total thickness 40 minus radius 20, not a default for other parts. Verify actual boundaries rather than merely mentioning the 3D view.

Build and check one representative section/short segment, including orientation, before extending, mirroring, or patterning it. Final acceptance must compare the drawing's 3D illustration with actual section evidence. Outer width/thickness, coincident connecting edges, and successful saving do not prove section shape. If the final screenshot is missing or has unresolved overlapping shapes, report visual verification as incomplete rather than claiming an appearance match.

## Bind dimensions to features and segments

Build a compact evidence table: `feature/segment → view and annotation → original unit and conversion → geometric relationship → verification method`. Separate explicit, derived, and assumed dimensions. Keep confirmed original units consistent. Convert inches by multiplying lengths by 25.4; angles are not converted. Treat a decimal comma as a decimal point. Do not override dimension lines with rendering proportions.

Trace both arrow/extension-line ends, measurement direction, datum, and associated contour for every dimension. Distinguish vertical thickness, normal thickness, recess depth, overall height, local height, theoretical pre-fillet intersection, and post-fillet tangent point. Enlarge crowded leaders and cross-check other views; proximity to a number is not evidence of what it measures. Register all drawing constraints, including counts, fillets, tangency, equal thickness, and symmetry, not only convenient outer dimensions.

An unclear dimension is not automatic permission to approximate. Try enlargement and geometric inference first. If uncertainty still affects size/shape, ask a specific question while continuing independent work. Until the user accepts approximation, do not replace explicit dimensions with visual estimates or alter curves/thickness just to avoid an API failure.

Chair example: 36 mm is the middle armrest's vertical distance between upper/lower contours, not the upper arc's sag. 618 mm is measured from the ground to that middle upper contour, not the highest corner. Thus its middle lower contour is 618−36=582 mm. The 24 mm leg thickness must follow its own measurement direction, not necessarily vertical. The R690 upper arc and inner/outer R34 corners must satisfy tangency together; fixing one middle point is insufficient. This illustrates identifying the measured object before solving geometry, not default chair parameters.

## Acceptance covers annotations, not just resemblance

Match the initial dimension table to final verification: `annotation/relationship → target → actual value → direction and objects measured → data source/revision → pass/mismatch/unverified`. Separate numeric error from manufacturing tolerance. Never enlarge tolerance afterward to turn failure into a pass. Do not invent a tolerance class when none is specified.

Use current native parameters or analytic geometry for checks. Input dimensions and planned coordinates are targets, not proof of a built model. Repair known mismatches and remeasure instead of announcing completion and waiting for a request for precision. If work cannot continue, report what remains incomplete. Keep assumptions/unverified items separate from passed checks. Saving, resemblance, and correct solid counts do not replace dimensional/shape acceptance. Use a concept-model approximation scope only when the user has actually chosen it.

For a section angle, trace its two extension lines and determine whether it constrains a root, extended segment, or whole part. Model a constant-thickness extension, root transition, and connecting fillet as separate features. Project the interpretation into another view and check parallel edges, thickness, tangency, and symmetry. Resolve contradictions before adding the component to a batch. Ask only about ambiguity that changes topology or important dimensions and cannot be resolved from the drawing; do not ask the user to approve every explicit dimension.

Lug example: the 8-degree A–A annotation constrains a root transition, not draft along the entire extended lug plate. Extended plates marked 2×0.25 inches should be constant-thickness 6.35 mm. An approximately 8-degree angle between their side normals means a wedge, not a viewing artifact. With oppositely oriented normals, use the absolute dot product for parallelism, then measure plane distance. Exclude fillet faces from extended-plate thickness checks.

For a U-slot, distinguish round-bottom radius from full depth. Along its centerline, `total depth = straight distance from mouth to semicircle junction + bottom radius`, not radius or diameter alone. A depth of 0.5 inches with R0.25 inches needs a 0.25-inch straight segment. Cutting only a semicircle reaches 0.25 inches. Auxiliary-view depth and front-view width must both match. Obtain radius, straight length, and depth from actual edges/arcs or a section, not planned coordinates.

## Handles and sweeps: path, section, and attachment

Do not assume a closed-sketch extrusion for a handle, tube, or rounded rod solely from its side outline. Inspect local/moved sections, top-view width, and the isometric illustration. Determine whether the section is circular, elliptical, rectangular, or rounded rectangular, whether side lines are boundaries or a center path, and which centers/endpoints each dimension constrains. If a section clearly shows a rounded profile, use a matching sweep without waiting for the user to point out a flat extruded appearance.

Cup-handle example: top-view width 6 and concentric side radii R9/R12 imply radial thickness 3 and center-path radius 10.5. A rounded section supports a 6×3 ellipse, not a rectangular strip extruded merely because width is 6. The value 3 is derived, not explicitly dimensioned. Do not apply this inference to nonconcentric radii, an unclear section, or a nonconstant profile. For R15, follow the leader to its concave/convex side before applying half-section thickness to obtain the path radius; do not always add or subtract. Bind 33, 36, 17, and bottom offset 2 to their actual centers/datums. A positional 2 is not cup-bottom wall thickness. List unspecified wall thickness as a separate assumption.

Before sweeping, check path endpoint continuity, tangency, curvature direction, and centers. Place the section plane at the actual path endpoint normal to its tangent, with ellipse axes matching top/side views. A path can be an open chain; do not apply closed-profile requirements to it. The section must be closed. `profile_check` supports analytic closure and axis/sample consistency for one complete native ellipse. Elliptical arcs and mixed profiles may remain unknown; do not remove unknown protection to force a sweep. Check actual section size/shape, inner/outer bend radii, attachment positions, and inner openings afterward. One solid does not prove a clean inner wall. Cup-handle roots should enter the wall without intruding into the cavity; plan their endpoints accordingly and preplan any necessary cavity trimming.

At minimum, verify section type/width/thickness, path centers/radii, tangent continuity, root positions, cavity intrusion, and saved version. Cup height, diameter, and handle width alone do not validate the entire drawing. Screenshots check appearance and construction choice; actual geometry checks dimensions. Neither replaces the other.

A point-normal datum plane has two modes: `datum_percentage_of_length=1` requires a real curve ID and a percentage from 0..100. Mode 0 also requires a valid reference point. A path-start section can use percentage 0. After exiting the sketch, reread actual curve IDs; do not derive them from tree order or temporary IDs. Use a returned datum entity ID, without assuming it appears in a body array. If parameter preparation fails with a receipt explicitly stating `mutation_applied=false`, refresh references, correct parameters, and continue with a new key. No page refresh or "accept current state" is needed. Dispatched operations or unknown saves still require the existing reconciliation process.

## Verify one lug before copying

Before rotation/mirroring, calculate an off-axis feature point's expected position, pivot, and axis. Read actual command semantics. Check the real transformed hole center/endpoint for quadrant, axis, and left/right relationships. If the transform contract is uncertain, verify one part before copying/merging; do not combine two unchecked rotations and subsequent irreversible booleans in one large batch. Do not infer rotation sign from the observer's left/right.

Record created entity IDs, feature hid/uuid, and the new revision. For a direction error, prefer editing the transform feature or applying its measured inverse. Shared Undo is appropriate only when the target history and saved state are clear; one Undo does not necessarily undo an entire batch.

## Investigating a reported discrepancy

Treat the user's concern as a hypothesis to verify. Read exact geometry and align the view before deciding whether the issue is projection or geometry. Do not first dismiss it as perspective. Review all related dimensions of that component, not one convenient explanation. In the lug example, check extension parallelism/thickness, root angle 8 degrees and fillets, U-slot depth/radius, lug holes, and symmetry together.

Record adjacent geometry and the saved revision to preserve. Prefer editing the originating sketch/feature. If that would break downstream references, use a bounded local cut with an explicit repair feature. Remeasure affected parts and neighboring holes/cylinder walls afterward; do not carry old measurements across revisions. If only two planes were checked, report parallelism and thickness, not all dimensions. Mark unsupported claims as unverified.

For parallelism, U-slot depth, or direction calculations, use the [geometry-check guide](geometry-check.md). The helper only calculates supplied native measurements. It does not interpret the drawing, connect to the model, or select the correct measurement faces for you.

## A timeout does not prove geometry is too complex

Distinguish tool transport, CAD command execution, save ACK, and viewport-image failures. An unavailable screenshot channel does not imply disconnected MCP or kernel. With valid CAD context, continue authorized deterministic work and geometry checks, while accurately reporting display verification limits.

For an unknown result, inspect the same operation_id and save receipts; do not retry the write with a new key. Reuse the user's existing authorization for the same document and action scope. Ask for missing confirmation only when the interface or actual approval system requires it. Never evade an approval rejection by rephrasing, scripting, or changing tools. Inspect uncertain draft ownership. If the user has already approved taking over the same work, use supported continuation without requesting the same approval again.

After a confirmed failure, check actual tool parameter contracts and receipts, not another version's behavior. `boolean_entity_a_ids` accepts exactly one target; `boolean_entity_b_ids` may contain multiple cutters. Both use current solid IDs. Process multiple targets separately. Report incompatibility if declared and actual behavior differ. Updating a guide cannot replace a service update or exclude kernel/save timeouts.

If state is established and the same path still fails, use an explained UI fallback or a supported extrusion-cut construction. Browser calls must use signatures actually provided in the session. After a signature error, reread documentation/state instead of guessing variants of click calls. Verify actual geometry and save receipts after fallback too.

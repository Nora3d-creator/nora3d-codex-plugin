# Real threads and variable-section handles

## Feature selection and lofting

Sweep a constant section along a path; loft sections that vary along the path. Cut real thread geometry along a helix, or create a separate swept cutting solid followed by boolean subtraction. A shaft loft and a subsequent thread sweep-cut are independent steps. Failure in one does not prove the other is unsupported; inspect each receipt separately.

The current external create_loft exposes ordered sections and merging, but not guide-curve/centerline constraints. A few sections do not guarantee an exact radius transition. Before reducing sections, compare actual intermediate sections, curvature, and design tolerance; do not automatically place dozens of uniformly spaced profiles.

Calculate the centerline and cumulative arc length s before calculating diameter. Diameter taper 1:20 means D(s)=D0-s/20 and radius change s/40, not taper based on horizontal projected length. The path point and normal-plane origin may differ. Read sketch_frame and project the actual path point into u/v instead of placing circles at every plane's (0,0).

## Plan the thread once

1. Establish internal/external type, diameter, pitch, handedness, starts, effective length, relief, and chamfers. State assumptions for missing parameters. Decorative threads do not replace real tooth geometry.
2. Calculate the blank, helix, and closed cutting profile together. Lead equals pitch for a single start and starts × pitch for multiple starts. Check the current API's height/step/revolution relationship and starting direction.
3. Place the profile in an axial/radial plane through the helix start and verify local-to-world coordinates. Use only necessary radial overrun into the blank. Keep the cutter's full axial width smaller than adjacent-turn spacing with positive clearance, avoiding self-intersection. Do not enlarge the profile blindly to find a working cut.
4. Check start/end points, turn count, and profile closure before cutting. After success, verify actual groove continuity, pitch, major/minor diameters, effective length, and save receipt. A displayed curve or texture does not prove thread geometry.
5. If a deployment's direct cut is known to be incompatible, use a separate swept cutting solid + boolean_subtract. Verify the preceding step before continuing. Reconcile unknown results; do not repeatedly retry with different keys.

## Simplified M8×1.25 geometry example (not a tolerance standard)

Example: single-start pitch 1.25, blank radius 4, root radius 3.233206675, root-flat width 0.208333335, and a simplified section with straight 60-degree flanks. A cutter outer radius of 4.01 gives full axial width 1.105297, below the pitch. Radius 4.2 gives width 1.324690, above the pitch, risking intersection between adjacent turns.

These numbers only illustrate geometric relationships. Determine tolerance class, root arcs, and fit clearances separately. Do not claim that this simplified geometry is a standards-compliant thread.

## Parameter traps

- Sketch/face profile mode must match the native interface's Radius={}. Do not carry a circular-profile radius together with a sketch profile. Check current schema and actual receipts to avoid the wrong cutting type.
- LoopCurves denotes profile boundary edges, not the sweep path. Use an empty collection when the whole sketch is SweepProfile; do not repeat the helix path there. If an older schema forbids an empty list, explain the limitation instead of substituting unrelated path edges.
- Preserve native distinctions between modifying and omitting a parameter. Verify creation and editing capabilities separately. Recover uncertain results from receipts; do not refresh a page containing a draft merely to continue.

New dimensions, handedness, and kernel versions still need geometry verification. First-pass success is a goal, not a guarantee for arbitrary geometry.

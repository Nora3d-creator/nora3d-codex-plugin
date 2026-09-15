# Modeling methods for Codex

This guide covers design intent, decomposition, positioning, inspection, and repair. Executable operations are limited to the current MCP capabilities. Using these methods does not require a CAD development environment.

## Applying the methods

| Modeling stage | How Codex should apply it |
| --- | --- |
| CAD brief | Convert text, images, and drawings into dimensions, datums, functions, assumptions, and checks. Explicit dimensions take precedence over image proportions; do not silently resolve conflicts by guessing. |
| decomposition / planning | Separate actual functional and manufactured components rather than piling up outer shapes. Distinguish parts, cavities, openings, and connections. |
| builder / coder | Derive coordinates from a small set of named parameters and preserve dependencies for later editing. Use native features; do not assume undeclared code-execution capabilities. |
| positioning | Establish the origin, datum planes, axes, and mating relationships before deriving positions. Use consistent parameter formulas for symmetry and repetition. |
| auditor / structural review | Check function: hollow drawers, through-holes, contact between legs and a tabletop, and unintentionally merged parts. Report unknown when evidence is insufficient. |
| debugger / repair loop | Make local repairs based on actual errors and geometry. Preserve successful components instead of regenerating the entire model because one fillet failed. |
| parameter / rollback | Record the target and its current key parameters before editing. Check affected geometry afterward. Shared undo history may include user actions, so follow the user's actual intent. |
| DFM / DfAM | Identify checks required by manufacturing requests. Report wall thickness, clearance, or other conclusions only when measurements or analyses support them. Do not invent evaluation values. |

When independent review is useful and subagents are available and permitted, a Codex subagent may review the design and already obtained geometry facts. The primary executor still writes to a document serially; multiple agents must not modify it concurrently.

## Capability boundaries

Follow `nora_get_capabilities` and its actual execution policy. Use direct CAD operations by default rather than automatically delegating to another generation service. Do not put names into fields requiring entity IDs, or use file paths as library model_id values.

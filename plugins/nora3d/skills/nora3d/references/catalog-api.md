# Catalog operations

Use the catalog actually returned by the current deployment. Discover entries through `nora_list_catalog_entries` and `nora_get_catalog_entry`, and submit them through `nora_execute_operation`. There is no tool that accepts arbitrary native scripts.

1. Search by functional keywords or a returned category, with pagination. Retrieve only relevant entries.
2. Read the exact entry's input_schema, requires_sketch, effect, limitations, and catalog_revision. Dimensions must satisfy the schema, and IDs must come from the current model. Check whether a parameter accepts coordinates or point/edge/face references.
3. Obtain the workspace's current context_token. Submit `{operation: entry_id, parameters: ...}` with a logical idempotency key. If catalog versions differ, update the service/page as appropriate; do not fall back to assembling raw actions.
4. Wait for the operation's terminal state. read/view/session effects do not require a model save. draft_applied is an intermediate draft result. A commit requires actual saved/displayed receipts.
5. Read the updated context before continuing. After human intervention, use the new context to reassess draft ownership.

Menu and toolbar entries have different effects. Among the 83 `set_menu_mode` values, some open parameter panels while others execute commands. Invalid face/edge selection, active tools, or editing modes should produce precondition_failed. Resolve the actual precondition instead of repeatedly clicking. Activating a tool does not complete geometry; fully parameterized modeling operations are better suited to continuous execution.

For datum points, coordinate systems, surface trimming, surface stitching, combined curves, and split lines, verify that all required references exist and their counts are complete. Three coordinate-system points must not be collinear. Trimming and splitting use actual kernel preview regions. A trim without a selected region returns `region_selection_required` and candidates, not a saved receipt. Pass the selected-region parameters accepted by the current schema; never reuse preview indices after the model changes. A split line uses all valid regions of its own preview, not trim-region selection parameters.

`ccad.host.capture_view_img` produces a viewport image, not a precision measurement. Provenance records origin; it does not prove that geometry edited later still matches the imported original. `save_snapshot` saves a modeling-context snapshot, not the CAD document.

If tools are missing, check host MCP discovery and the current service version. If an API fails, inspect its receipt. Explain a concrete API gap before using Computer Use, protect human drafts, and do not count UI execution as API acceptance. Native Agent delegation is disabled by default.

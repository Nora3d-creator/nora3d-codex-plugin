# Workspace guide and browser fallback

Nora3D's workspace guide is distributed with the Web build and identified by `ui_revision`. Read compact `ui_state` at task start. When a region, tool, submode, or field needs clarification, call `nora_get_workspace_guide(query, module, ui_revision)` as needed rather than traversing the whole interface for every modeling request.

The static guide covers declared tools and menus in workspace, part, sketch, transform, datums, menus, other_documents, and workflows. It records Chinese/English interface labels, tool groups, submodes, exact Catalog APIs when available, and locator guidance. A static entry does not prove that the account has permission, the menu is visible, or an operation will succeed. Verify current enablement and document prerequisites.

- `route=api`: prefer the exact API in the entry. Read its current schema and supply real model references and parameters.
- `route=ui_only`: no corresponding API is currently declared. Explain the gap, then use browser fallback in the same visible document when authorized.
- `route=unavailable`: the current plugin does not support the entry, or it is hidden while Codex is controlling the workspace. Do not treat it as executable.
- `stale_ui_guide`: check guide and page versions; do not continue with outdated positions or instructions.

Prefer actual visible DOM roles and accessible names, `data-nora-action`, `data-nora-field`, entity IDs (`data-nora-entity-id`), and feature IDs (`data-nora-feature-id`). These two ID types are distinct. Do not memorize random menu IDs, list positions, old entity IDs, or fixed screen coordinates. Tool-row text activates the tool; the icon opens its submenu when one exists. Respect displayed units; do not enter millimeter values unchanged into centimeter fields.

Existing APIs can hide datum planes, select an isometric view, and fit the model. Query `workflow.present` instead of repeatedly clicking. Prefer fully parameterized modeling APIs over commands that merely open a tool.

Keep live modeling in the same visible document. Do not copy browser credentials, take over the document through a second hidden session, or start another browser reasoning loop.

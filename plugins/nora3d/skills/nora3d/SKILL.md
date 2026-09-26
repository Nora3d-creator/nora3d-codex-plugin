---
name: nora3d
description: Create and edit CAD models in Nora3D. Connect the intended account and document, then use MCP modeling tools.
---

# Nora3D Online Beta

## Language

Follow the user's language and explicit preferences. English instructions do not
force English replies or change website language. Images and plugin mentions do
not override the conversation language. Default to English only when no language
is established. Read the modeling playbook only for actual modeling work.

## Connect and continue

Every registered Nora3D account is eligible. Reuse the plugin's valid installation
OAuth. The new Web assistant automatically connects its document and has no MCP
button. Read [buttonless connection](references/buttonless-connection.md) before
connecting; this desktop guide supersedes older button-based connection sections
in the shared playbook and older tool descriptions for already accessible sessions.

1. Discover Nora3D tools. Reuse the intended page in the current conversation's
   browser, retaining exact browser/tab IDs. When available, use host
   `metadata.codexSessionId` to identify this task's browser. Read the real URL's
   project/document; never select a document simply because it is newest/online.
   If there is no suitable page, open `https://app.nora3d.ai/?nora_host=codex` in
   the intended browser and let the user sign in. Preserve the page and drafts.
2. Read `nora_list_workspaces` from `https://mcp.nora3d.ai/mcp`. For the new page,
   match its exact project/document to one accessible live session, then call
   `nora_get_context` with all project/document/session guards. Check the returned
   identity, liveness, permissions and modeling state before writing. The bundled
   selection helper makes these checks deterministic. No button, connection-code
   lookup or `nora_verify_connection` call is required for this existing access.
3. Keep a verified binding only while this tab/document/session remains current.
   Multiple matching live sessions require disambiguation, not a timestamp guess.
   A valid delegated workspace remains usable without account-switch prompts.
   An unavailable document is not proof of an account mismatch. Never create
   access, change token subjects or force the page to use an old plugin account.
4. Respect Web assistant leases and human drafts. On `assistant_busy`, wait for
   current work to finish; never stop or reconfigure the Web assistant. After
   reconnect, read fresh context before resuming the original modeling request.
5. Recover browser timeouts by reading the existing tab inventory and documented
   alternate DOM snapshot once, without opening duplicates, refreshing or
   navigating to connection links. No code control on a new page is normal:
   do not wait on it or search More/settings for a missing MCP button. Only use
   the older code/button flow when those controls actually exist on an old page.

An install grants no access by itself when its one-time OAuth has not completed.
Never read, request, copy or fill passwords, cookies, browser storage credentials
or token files. Never approve a consent page for the user, substitute another
account, change a token's subject, or use a local server as a production fallback.
A request to diagnose only permits checks; do not change geometry without a
modeling request.

## Modeling and verification

For any modeling task, first read [task completion and recovery](references/assistant-workflow.md).
Interpretation and planning are progress, not completion: continue authorized
work through geometry checks and saved-state verification in the same turn.
Preserve explicit analysis-only requests and necessary dimension questions.

For mesh reverse engineering, read [mesh reconstruction](references/mesh-reconstruction.md).
Mesh API v1 is a candidate capability. Discover the live catalog first; an
installed guide does not upgrade the connected Web or gateway.

Before modeling or inspecting geometry, read the [modeling playbook](references/modeling-playbook.md).
Preserve its drawing-review, draft-ownership, coordinate, batch, topology, thread,
library, and recovery rules, including relevant linked references.
Codex plans and executes through MCP/API. Native Agent delegation is off by default.
Explain concrete API gaps before Computer Use fallback. Read current context,
honor human edits and stable idempotency keys, and never replay an unknown write.
Camera navigation is not a model edit. Validate actual geometry and saved/displayed
revisions; a screenshot or approximate bounding box is not a dimensional check.

## Public templates and management access

Registered users can insert available public templates into their own editable
documents. Template insertion does not require template-management permission.
The Import template and Parametric entries publish or manage library content and
are only available to accounts with template-management permission. Do not ask an
ordinary user to obtain management access to insert an existing public template.
If insertion fails, inspect the actual error, publication availability, and current
document state. Do not reinterpret a generic insertion failure as an OAuth problem
or request repeated sign-in without evidence. Verify the inserted geometry and
saved revision before reporting success.

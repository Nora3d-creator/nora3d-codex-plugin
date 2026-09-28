---
name: nora3d
description: Create and edit CAD models in Nora3D. Connect the intended account and document, then use MCP modeling tools.
---

# Nora3D Online Beta

## Language

Follow the user's language and explicit preferences. English instructions do not
force English replies or change website language. Images and plugin mentions do
not override the conversation language. Default to English only when no language
is established. Load modeling guidance by the task routes below, only when needed.

## Connect and continue

Every registered Nora3D account is eligible. Reuse the plugin's valid installation
OAuth. The new Web assistant automatically connects its document and has no MCP
button. Read [buttonless connection](references/buttonless-connection.md) on first
binding, reconnection, document/session change or an actual connection mismatch;
reuse a verified current binding for follow-up work. Do not repeat browser
inventory, workspace listing, panel collapse or authorization on every edit.
The desktop connection and account-authorization guides supersede
older button-based connection and recovery sections in the shared playbook and
tool descriptions. Do not combine the new flow with older settings/CLI loops.

1. Discover Nora3D tools. Reuse the intended page in the current conversation's
   browser, retaining exact browser/tab IDs. When available, use host
   `metadata.codexSessionId` to identify this task's browser. Read the real URL's
   project/document; never select a document simply because it is newest/online.
   If there is no suitable page, open `https://app.nora3d.ai/` in
   the intended browser and let the user sign in. Preserve the page and drafts.
   In a plugin-owned in-app document tab, follow [assistant panel](references/assistant-panel.md)
   to collapse the expanded Web Assistant through its visible toolbar. Verify
   both the button's collapsed state and the actual panel hidden. Respect busy,
   recovery, render and overlay guards. A failed optional collapse must not become
   an account-switch loop. Keep the Web assistant and its bridge mounted.
2. Read `nora_list_workspaces` from `https://mcp.nora3d.ai/mcp`. For the new page,
   match its exact project/document to one accessible live session, then call
   `nora_get_context` with all project/document/session guards. Check the returned
   identity, liveness, permissions and modeling state before writing. The bundled
   selection helper makes these checks deterministic. No button, connection-code
   lookup or `nora_verify_connection` call is required for this existing access.
3. Keep a verified binding only while this tab/document/session remains current.
   Multiple matching live sessions require disambiguation, not a timestamp guess.
   A valid delegated workspace remains usable without account-switch prompts.
   Report an unlisted target as not listed, not offline: the top-level connection
   status describes the caller's listed workspaces, not an absent target document.
   Compare the caller account with an account visibly shown by the website only
   when needed; never infer the website account from a URL or another task.
   An unavailable document is not proof of an account mismatch. Never create
   access, change token subjects or force the page to use an old plugin account.
   For confirmed missing/different authorization, follow
   [account authorization](references/account-authorization.md). Preserve the model
   tab and use the same browser profile for the temporary consent page. The user
   completes sign-in/consent; a callback alone does not prove the active MCP
   transport changed. Recheck the caller and exact document before resuming.
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

For modeling, read [task completion and recovery](references/assistant-workflow.md)
once per loaded plugin version, retaining it for follow-up work in this task.
Interpretation and planning are progress, not completion: continue authorized
work through geometry checks and saved-state verification in the same turn.
Preserve explicit analysis-only requests and necessary dimension questions.

For all modeling and geometry inspection, read the
[desktop execution core and fast path](references/modeling-fast-path.md) once.
Its core rules apply to every route. Explicit basic shapes, single-target
color/parameter edits, simple planar holes and bounded native inspection can
use this compact route directly. Its task routes replace unconditional
loading of the shared playbook on this desktop host; they do not waive geometry,
human-work, authorization or persistence checks. Read already loaded guides again
only after a version change or when the retained content is unavailable.

For modeling from a drawing, or a new drawing/shape correction, read
[drawing review](references/drawing-review.md) before geometric writes. For
complex/multi-solid work, read [direct modeling](references/direct-modeling.md);
for threads, helices, loft/sweep and variable-section parts read
[threads and lofts](references/thread-and-loft.md); for mechanism motion read
[folding](references/folding.md). Use the full
[modeling playbook](references/modeling-playbook.md) for tasks outside these
routes, unfamiliar topology, library insertion or an unresolved modeling failure.
Load its linked topics only when their stated triggers apply. A drawing may be
simple, but its explicit dimensions and projection checks still apply.

For mesh reverse engineering, read [mesh reconstruction](references/mesh-reconstruction.md)
and the playbook. Mesh API v1 is a candidate capability: discover live support.
Jev choices and needs_codex are not completed native geometry or full acceptance.
An installed guide does not upgrade the connected Web or gateway.

Codex plans and executes through MCP/API. Native Agent delegation is off by default.
Explain concrete API gaps before Computer Use fallback. Read current context,
honor human edits and stable idempotency keys, and never replay an unknown write.
Camera navigation is not a model edit. Validate actual geometry and saved/displayed
revisions; a screenshot or approximate bounding box is not a dimensional check.

Use [experience reuse](references/modeling-experience.md) when reusing an earlier
plan or recording a completed attempt. Historical success is not current-model
evidence; the optional local helper records candidates, never certified recipes.
When the user requests experience accumulation, retain both successes and failures
in the task's authorized local artifact folder using that candidate index. Reuse
an explicitly selected existing index before replanning a supported method.
Validate the current model each time; never update global instructions or promote
a method automatically from one result. State where the index was saved.

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

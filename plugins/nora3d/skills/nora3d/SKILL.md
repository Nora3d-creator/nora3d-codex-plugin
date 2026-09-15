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

Every registered Nora3D account is eligible. The installed marketplace requests
OAuth on installation. Use the existing grant; the user should not have to find
MCP settings, run terminal commands, copy connection codes, or say "go on" after
a successful connection. Complete the requested modeling task once verified.

1. Discover Nora3D tools and call `nora_list_workspaces` before opening another
   login page. The production endpoint is `https://mcp.nora3d.ai/mcp`. Read its
   `account`, deployment and fresh workspace state; website login and plugin OAuth
   are independent, and neither an empty list nor an old document proves a mismatch.
2. Honor the user's intended document and browser. Otherwise inspect current-host
   browser tabs and reuse the Nora3D page used during installation/authorization.
   OAuth may have opened the system browser; blindly opening the built-in browser
   creates a separate login session. Do not select a document on another computer
   just because it is the only/newest online workspace in the account-wide list.
   If no suitable local page exists, open `https://app.nora3d.ai/?nora_host=codex`
   in the available browser. Preserve document and OAuth query parameters. Keep
   the modeling page open, protect drafts, and never claim it opened without evidence.
3. Read the intended page's project/document identity and connection details. For
   a visible connection request, expand it and call `nora_verify_connection` with
   its short-lived code automatically. Use browser tools to read the control;
   do not ask the user to copy it when the host can read it. A verified result
   identifies the exact workspace; read `nora_get_context` before editing.
   A same-account current-context read also verifies the shared document.
4. For missing OAuth, or a confirmed website/plugin account mismatch, start the
   real host OAuth flow as part of the user's request to connect/use this document.
   Briefly identify the target account, then act. **Do not add a separate chat
   approval question such as "May I switch?" or cite this skill as a reason to
   pause.** The user signs in and approves access in the actual OAuth page; starting
   that page is not approving it. Respect any explicit instruction not to change
   the connection. Read [connection recovery](references/connection-recovery.md)
   and use the packaged Windows helper if no callable host login action exists.
5. Keep the original modeling request and document. After OAuth completes, call
   the tools afresh and reverify that document. Callback success alone is not proof
   the current MCP connection picked up the account. Resume automatically on a
   match. Start only one login attempt per connection problem; cancellation,
   refusal, timeout, or persistent mismatch ends that attempt without a retry loop.

When accounts match but the document is missing, inspect that page's sharing and
liveness; use its supported connect action and check at most three times over
30 seconds. Never disconnect a working page, refresh a draft, choose an unrelated
workspace, or switch OAuth for a same-account document change. Refresh an expired
connection request once on the same page. If the verification tool is absent,
use fresh account/document checks and report a host discovery limitation precisely;
never invent a settings control or repeatedly request reinstall/new tasks.

An install grants no access by itself when OAuth has not completed. Never read,
request, copy or fill passwords, cookies, browser storage credentials or token
files. Never approve the consent page for the user, substitute another account,
silently change a token's subject, or use a local server as a production fallback.
A request to diagnose only permits checks; do not initiate OAuth if the user asks
only to inspect, or change geometry without a modeling request.

## Modeling and verification

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

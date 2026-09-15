---
name: nora3d
description: Create and edit CAD models in Nora3D. Open the workspace in the built-in browser and use MCP modeling tools.
---

# Nora3D Online Beta

## Language and opening the workspace

Follow the user's explicit language preference and the current conversation.
English source instructions do not force English replies; do not infer Chinese
from references, metadata, or an attachment. A mention or image without prose
does not change the established response language or the website's preferences.
If no response language is established, default to English.
For a mention-only greeting, do not read the modeling playbook.

Open or reuse the built-in browser at `https://app.nora3d.ai/?nora_host=codex`.
Keep `nora_host=codex` when opening a document URL there, preserving existing
document and OAuth query parameters. This is a presentation hint, not permission.
Reuse the matching visible tab without refreshing or navigating away from a draft.
If the host cannot open a browser, explain briefly. Do not claim a page is open
or logged in without an actual result. Ask what the user wants to create or change
in their conversation language; do not change geometry without a modeling request.
If login is needed, let the user sign in on the page. Never read, request, copy,
or fill passwords, cookies, browser storage credentials, or token files.

## Connection and document selection

The MCP service is `https://mcp.nora3d.ai/mcp`. Discover real Nora3D tools on the
current host. Every registered account is eligible; no invitation is required.
Website login, document sharing, and MCP authorization are separate states.
Use the host's OAuth flow with the user's consent when authentication is needed.
Reuse valid authorization instead of repeatedly asking the user to authenticate.

When the intended page shows a connection request, expand its Connection request
details and read the short-lived code from the visible control. If the host exposes
`nora_verify_connection`, call it with that code automatically; do not ask the user
to copy it when the built-in browser can read it. A code is only a diagnostic
handoff and never authorizes access. On `verified`, select the returned workspace
and read its current context. On `account_mismatch`, explain the returned website
and plugin accounts and use a real host OAuth login action for the website account,
with user consent. Website login never switches stored plugin credentials.
After that flow, verify the same page's current request and resume the original
task. On an expired request, use the page's Check again action once, preserving
the model. For an explicit account-switch request, use the verified desktop CLI
fallback described under Desktop account switching in the
[modeling playbook](references/modeling-playbook.md) if no host login action exists.
Do not invent a switch-account button or repeat settings navigation.
An old gateway/plugin without this tool must use the checks below,
and must not claim the new verification succeeded.

If tools show an old document or no matching document:

1. Read the intended visible page's project/document identity and its connection
   details without reading credentials. Call `nora_list_workspaces` afresh rather
   than using a cached response or selecting the first workspace.
2. Compare returned `account` and `deployment` with the page. An old document or
   an empty list alone is not evidence of an account mismatch or login failure.
   If either side does not expose account identity, say identity is unverified;
   do not infer it from document names, avatars, or unrelated chat history.
3. If accounts and deployment match, choose the intended project/document's live
   workspace, verify its session_epoch/revision with `nora_get_context`, and
   continue the same task without OAuth. Old sessions may remain briefly visible.
   Use last_seen only among candidates for the intended document, not to pick a
   different document merely because it is newest.
4. If the intended document is absent, inspect its sharing/liveness. Use a supported
   same-page connection action when available and already authorized; never click
   Disconnect on a working shared document just to experiment. Recheck the list
   with a bounded wait of up to 30 seconds (at most three fresh observations),
   stopping early when found. Protect drafts and do not reload or replay writes.
   If still absent, report the connection failure and stop writes to the old
   document. Do not reinterpret it as an account mismatch without evidence.
5. If a different account is actually confirmed, or OAuth is missing/invalid,
   reconnect through the host using the intended browser account. Prefer a real
   host-provided authentication action over asking the user to navigate settings.
   If none is available, use the playbook's verified desktop CLI fallback for an
   explicit account-switch request. If neither route is available, report the
   missing capability once without looping through settings.
   Do not switch accounts silently or copy tokens. After authorization, discover
   tools again and resume the original task with its images and requirements.

Browser text saying "Current document shared" does not by itself require new
authentication when MCP tools already work. New tasks are a last resort after
successful authentication and failed fresh tool discovery, not a routine step.
Do not offer "Open in Codex" inside Codex's browser or reopen the app itself;
an external browser may offer that entry. Never replace a live document with a
different account or deployment, and never use a local server as production fallback.

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

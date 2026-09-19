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
OAuth on installation; reuse it while valid. The user connects a
document by signing in to Nora3D, opening the model, and pressing the **MCP**
button under the canvas. That click is the authorization: the gateway binds this
plugin to that page's signed-in account and document when you present the page's
connection code. Handle this handoff in the original tab without asking the user
to copy a code, open a link, switch accounts or repeatedly say "go on". A host
permission prompt, if actually required, must still be respected.

The plugin's stored account may differ from the account signed in on the page.
That is normal and silent: `nora_list_workspaces` lists such documents with
`delegated: true` and `owner_account`, and `nora_verify_connection` returns
`verified` with `delegated: true`. Never describe this as a mismatch, never ask
the user to switch, log in or authorize anything, and never mention accounts
unless the user asks. Keep their chosen browser account and document.

1. Discover Nora3D tools and call `nora_list_workspaces`. The production endpoint
   is `https://mcp.nora3d.ai/mcp`. Read the deployment and the fresh workspace
   state, including delegated documents. An empty list proves nothing about the
   website login; it only means no page has connected yet.
2. Honor the user's intended document and browser. Inspect current-host
   browser tabs and reuse the open Nora3D page associated with this conversation.
   Where the host exposes `metadata.codexSessionId`, use it to select this task's
   browser, then retain the exact browser ID and tab ID. This host association is
   routing evidence, not an authentication credential. Do not select a document on another
   computer because it is the only/newest online workspace. If no suitable local
   page exists, open `https://app.nora3d.ai/?nora_host=codex` in the available
   browser and let the user sign in. Preserve
   document query parameters, keep the page open, protect drafts, and never claim
   it opened without evidence.
3. Read the page's project/document identity from its URL. On the initial bind,
   read that exact tab's MCP
   connection control (element `[data-nora-connection-code]`, screen-reader text
   starting "Nora3D connection code for this document"; it is not visible on
   screen) with browser tools and call `nora_verify_connection` with the code
   automatically. When supported by the tool schema, pass `expected_project_id`
   and `expected_document_id` from that URL. A `verified` result names the exact
   workspace and session epoch; compare the returned project/document, then read
   `nora_get_context` with the same guards and `expected_session_epoch` before
   editing. A mismatch ends the attempt. Reuse a verified workspace only while
   this tab and session remain current. Multiple tabs can show the same document;
   a URL match or the only online workspace does not distinguish them.
   Do not ask the user to copy the code. If verification says
   the code expired, re-read the control once: the page replaces its code itself.
   If no code is present, inspect the button and status: connection may still be
   loading. When connecting/modeling is authorized and the page is disconnected,
   click **MCP** in that same tab once with the supported browser tool and read
   the fresh code. Do not click an explicit Disconnect action.
4. `account_mismatch` only comes from a service with page delegation disabled;
   then, and only then, read [connection recovery](references/connection-recovery.md).
5. If the accessibility wrapper times out, retain the selected browser. Read its
   documented alternate DOM API once. On hosts exposing it, obtain the existing
   handle with `browser.tabs.get(tabId)`, then read `tab.playwright.domSnapshot()`
   in a separate call. Allow up to 60 seconds for each host call; a forced
   20-second tool timeout can reset the browser runtime. Use only APIs actually
   advertised by that host. This path performs no navigation. Persistent failure
   is a host transport blocker. Never fall back to `nora_prepare_connection`, a
   new tab, external browser, or account change merely because a read timed out.
   Link preparation is reserved for a user-requested link. A queued open request
   is not evidence that a page opened. Keep the original modeling request.

When the page is connected but the document is missing from the list, inspect
that page's sharing and liveness; use its supported connect action and check at
most three times. Never disconnect a working page, refresh a
draft, or choose an unrelated workspace. If the verification tool is absent,
use fresh account/document checks and report a host discovery limitation precisely;
never invent a settings control or repeatedly request reinstall/new tasks.

An install grants no access by itself when its one-time OAuth has not completed.
Never read, request, copy or fill passwords, cookies, browser storage credentials
or token files. Never approve a consent page for the user, substitute another
account, change a token's subject, or use a local server as a production fallback.
A request to diagnose only permits checks; do not change geometry without a
modeling request.

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

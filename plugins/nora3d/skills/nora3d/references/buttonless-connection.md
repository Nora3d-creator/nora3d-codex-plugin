# Connect to the current document without an MCP button

## Current Web assistant

The current Nora3D Web assistant starts an embedded document bridge when its
panel mounts. The external MCP button and the old connection-code control are
absent. Their absence is normal. Do not search More/settings for a button, ask
the user to add one, or activate `legacy_assistant` to bring it back. Do not
change Web configuration, the embedded assistant, its conversation or its draft.

Desktop OAuth still identifies the plugin caller. An automatically registered
workspace can be used only if the service lists it for this caller (same account
or an existing valid delegation). A document URL grants no additional access.

1. Read the current conversation's exact browser/tab using supported host APIs.
   Retain both IDs and read the actual part URL's project/document IDs. Preserve
   its query parameters and drafts. Confirm the document/assistant panel has
   loaded. If the existing Assistant panel is closed and the document is idle,
   opening that existing panel is sufficient to start its bridge; do not send a
   chat message, spend Web assistant credits or start another modeling agent.
2. Call `nora_list_workspaces` fresh. Check production deployment origins and
   filter by BOTH project and document from that tab. Ignore offline sessions.
   On first use, select only when exactly one matching accessible live session
   exists. Never use the sole/newest workspace from a different document.
   Multiple live sessions for the same document are ambiguous: preserve an
   already verified binding if it still matches, otherwise ask which session is
   intended. Do not disconnect or choose one by timestamp. A URL does not prove
   a browser session, and this route is not cryptographic tab attestation.
3. Read `nora_get_context` with the selected `workspace_id`,
   `expected_project_id`, `expected_document_id` and `expected_session_epoch`.
   Compare the returned identity/session and require a live connection. Read
   actual permissions, draft, pending-save and busy state before edits. Keep the
   resulting binding with this exact browser/tab. This guarded context read,
   not a connection code, is the binding check for an already accessible session.
4. Use the latest context token for modeling. A Web assistant turn owns a lease;
   `assistant_busy` must stop desktop writes until it finishes. Do not cancel
   the Web task, clear its lease, bypass busy checks or use UI writes to evade it.
   Human drafts also remain protected. Keep recovery bounded and never replay an
   uncertain write. Resume only after a fresh guarded read proves it is safe.
5. Re-read the current URL/session after reconnection or document switching.
   Discard an obsolete binding and repeat discovery. A missing/changed session
   must not send old operations to another workspace. Preserve the modeling
   request and continue once a fresh binding is established.

For deterministic filtering, run the bundled [selection helper](../scripts/select-workspace.cjs)
with Node and JSON on stdin using Codex's execution tool, without asking users
to install a runtime or copy output. It performs no network request or write.
Input fields are `tab: {browser_id, tab_id, url}`, the fresh tool `listing`,
optional previous verified `binding`, and optionally the fresh `context` result.
`context_required` returns the exact guarded read arguments; only `connected`
confirms a checked editable context. Save its binding, not credentials. The
helper cannot authenticate, grant access, prove a tab's ownership or override
the service's lease checks. Its conservative `document_busy` result never grants
permission to finish or cancel a draft; handle any verified Codex-owned draft
through the existing playbook rules after reading fresh state.

## No matching accessible document

Observe the page's loading/connection state and retry the fresh list at most
three times while it starts. An empty list does not prove login failure. If the
page shows a connection error, report that error precisely. Do not guess an
account mismatch from a missing document. An explicitly confirmed OAuth problem
uses the host's supported authorization UI; the user approves access there.
Never ask them to switch the website to an old cached plugin account.

The new page does not expose the old cross-account pairing control. If the
plugin account cannot access the page's document and no valid delegation exists,
this plugin alone cannot create one. Explain that specific authorization gap;
do not read browser tokens, use private embedded-service keys, forge a code,
claim automatic account switching or promise that reinstalling fixes it.

## Browser timeouts are separate from document authorization

Opening a tab can time out after the page actually opened. Inspect the same
host's tab inventory once and obtain its existing tab; do not create duplicates.
When accessibility inspection fails, use the host's documented alternate DOM
snapshot once in that same tab. Keep tab acquisition and DOM reads in separate
calls with an appropriate bounded host timeout (up to 60 seconds). Use only the
APIs currently documented by the host. Do not click an unobserved More button,
run several speculative actions together, or wait on a nonexistent code locator.
Persistent DOM/transport failure is a browser-host limitation, not an OAuth
failure or evidence that a model was edited. Never refresh a draft to recover it.

## Older pages

If the exact page actually exposes a connection-code control, the existing
`nora_verify_connection` path remains supported with project/document/session
guards. An old disconnected page may visibly expose an MCP button: use it only
when present, connecting is authorized and no consent/Disconnect action is being
substituted. Do not make either control a prerequisite on the new Web assistant.
The desktop connection sections in the shared playbook describe this older flow;
this host-specific guide takes precedence for the buttonless page.

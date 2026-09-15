# Connect the intended document through native OAuth

The account in the user's intended browser document is authoritative. A stored
plugin grant identifies its previous authorization; never ask the user to sign
the website into that old account. Preserve the current model page and drafts.

## Confirm and start

Read the intended page's fresh connection request using available browser tools
and call `nora_verify_connection`. An old workspace list alone does not establish
an account mismatch. When accounts match, read the returned workspace context
and continue the original task without another login.

A confirmed mismatch returns a standard OAuth error result with
`_meta["mcp/www_authenticate"]`. Supported Codex desktop hosts display their native
**Reconnect** prompt. Tell the user to click that prompt and then approve access
in the original Nora3D document page. Do not add a separate chat approval question.
Do not run `connect-codex.ps1`, attempt sandbox-external execution, edit settings,
delete credentials, reinstall, or invent a host tool as the normal recovery path.
The host starts OAuth itself and refreshes its MCP connection after completion.

The request contains a short-lived document selector. The server validates the
original browser account, document and session and shows consent there. If the
system browser also opens a connection page, leave the model page open; approval
belongs in the original document, without another account login. Only the user
may approve consent. The selector is not an access token or a modeling permission.

First-time installation with no open document still uses the host's normal OAuth
consent. Installation does not replace required user consent. A diagnostic-only
request permits inspection, not approval or account changes.

## Verify and continue

After host OAuth completion, read fresh MCP account/workspace state and verify
the intended page again. Refresh an expired page connection request once if needed.
Read `nora_get_context` for that verified workspace and resume the user's original
modeling task. Callback success alone does not prove refreshed MCP identity.

Use one authorization attempt at a time. Cancellation, refusal or timeout stops
the attempt. If Reconnect does not appear, report that the host did not surface
the native OAuth challenge; do not loop through settings or shell alternatives.
If OAuth completes but MCP still reports the old account, report that exact host
refresh failure and keep geometry unchanged. Do not repeat login indefinitely.

The packaged Windows helper is retained for explicitly requested legacy support
in hosts that permit it; it is not an automatic fallback. An earlier execution
denial must never be retried through another runtime or permission change.

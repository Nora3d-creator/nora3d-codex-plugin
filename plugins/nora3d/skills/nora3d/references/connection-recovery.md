# Connection recovery

The normal path has no recovery step. The user signs in to Nora3D, opens the
model and presses **Codex** under the canvas; the page carries a hidden
connection code; you call `nora_verify_connection` with it and the gateway binds
this plugin to that page's account and document for the life of that page
session (`delegated: true`). The plugin's own account is unchanged and never
matters to the user. Do not mention accounts, Reconnect, consent or settings.

## Silent cases

- **Code expired** (`connection_check_expired`): the page replaces its code by
  itself. Re-read `[data-nora-connection-code]` once and verify again.
- **No code on the page**: the page is not connected. Ask the user to press
  **Codex** on that page once, then read the control again.
- **Page reloaded or reopened**: it is a new page session with a new code and
  a new workspace; the old workspace disappears from the list. Verify the new
  code; nothing else changes.
- **Workspace already listed**: a connected workspace whose project and
  document match the page needs no verification. Read `nora_get_context`.
- **Read-only document**: writes fail with `read_only`; the page's account has
  no edit right on this document. Report that; do not ask for another account.

## Legacy service without page delegation

Only a gateway whose `/health` reports `document_delegation: 0` still returns
`account_mismatch` with a native OAuth challenge (`_meta["mcp/www_authenticate"]`).
Supported Codex desktop hosts then display their native **Reconnect** prompt.
Tell the user once to click the new prompt from this check and approve access in
the original Nora3D document page; the selector stays valid for 30 minutes while
that page stays open. Only the user may approve consent. Do not run
`connect-codex.ps1`, attempt sandbox-external execution, edit settings, delete
credentials, reinstall or invent a host tool. After completion, read fresh MCP
workspace state and verify the page's current code before modeling. Use one
attempt; cancellation, refusal or timeout ends it.

First-time installation still uses the host's normal one-time OAuth consent.
A diagnostic-only request permits inspection, not approval or account changes.
The packaged Windows helper is retained for explicitly requested legacy support
in hosts that permit it; it is not an automatic fallback. An earlier execution
denial must never be retried through another runtime or permission change.

# Account authorization on the current Codex host

Use this recovery only for a confirmed account mismatch without valid document
delegation, or missing/expired plugin authorization. An unlisted document is not
proof of a mismatch. Keep the intended account and original modeling tab; never
ask the user to log the website into a previously saved plugin account.

The same account with valid access needs no authorization step. Compare stable
user IDs where available. A username and an email may identify the same account;
different display labels alone are insufficient evidence.

## Host-owned OAuth, no settings loop

The helper `scripts/authorize-account.cjs` uses the installed host's documented
`mcpServer/oauth/login` protocol. It returns the provider authorization URL and
waits for `mcpServer/oauthLogin/completed`. The host owns PKCE, callback validation,
and token storage. The helper never opens the system browser, logs out, edits
configuration, reads token stores, copies Web credentials or starts an AI task.

1. Resolve the actual current host Codex executable from its supplied
   `CODEX_CLI_PATH`, or the unique running host executable. Do not guess a bundled
   version or change `CODEX_HOME`. Use the host's available Node runtime.
2. Run `node <skill>/scripts/authorize-account.cjs --mode Check --cli <absolute-codex-path>`.
   This reads exact configured server metadata and the app-server inventory. It
   emits `host_ready` only for the production endpoint and supported OAuth state.
   It does not identify the Nora account or prove document access. If execution
   requires permission, use only the host's normal approval mechanism. An actual
   denial ends this route; no alternate runtime or configuration bypass.
3. Verify that this deployed Web version supports the isolated consent page below.
   A normal new-assistant page does **not** offer consent: its embedded connection
   ignores OAuth request IDs. Never start Login and wait on that page indefinitely.
4. Once account recovery is authorized and the consent surface is supported, run
   `node <skill>/scripts/authorize-account.cjs --mode Login --cli <absolute-codex-path> --consent-surface-available`.
   Keep this one foreground execution session alive while interacting with the
   browser. It emits `authorization_required` and waits up to 600 seconds. Poll
   the existing session, not another helper. Do not launch concurrent logins.
5. Open only the emitted provider URL in a new, temporary authorization tab in
   the **same in-app browser/profile** as the intended model. Read its actual
   Continue-in-Nora3D link. Never reconstruct OAuth URLs, change scopes, PKCE,
   state or redirect URIs, or use a URL from another attempt.
6. Follow the isolated consent page below. Let the user inspect the account and
   approve **Authorize and connect**. Never approve consent, enter credentials,
   or read/copy a callback URL on the user's behalf. Follow the existing
   **Return to Codex** (or **Return to your MCP agent to finish connecting**) link
   immediately after approval if that page requires it; do not print its URL or
   reuse it elsewhere. Treat consent and callback as two separate steps: a page
   saying that the document is shared does not mean the host received its callback.
   If the helper times out, stop using that attempt's links. Only start a new
   bounded attempt when the user is ready; never reuse an expired callback.
7. `oauth_callback_completed` means the host stored the new grant, **not** that
   this desktop task reloaded it. Close only the temporary auth tab, then read a
   fresh `nora_list_workspaces` and guarded context for the original tab. Confirm
   caller identity/document permissions before resuming. If this task still uses
   the old grant, say that its connection has not reloaded; use an actually
   available native refresh control or one new task. Never repeat OAuth to hide
   stale transport state, reinstall the plugin, or change the website account.

## Isolated consent page using existing Web compatibility

This is a temporary authorization surface, never the modeling workspace mode.
The existing Web supports `legacy_assistant=1` as a per-URL switch. It exposes the
existing external connection consent without changing source code, Web service
configuration, saved preferences, the original tab, or the new Web assistant
service. Successful authorization creates a grant and a temporary workspace
connection; it is not a read-only operation. Do not set
this flag on the original model tab and do not submit any legacy assistant task.

Use `buildConsentTabUrl(continuationUrl, documentUrl)` from the helper to construct
the **temporary auth tab's** document URL. Inputs must be the observed Continue
link from this attempt and the exact original model URL. The function accepts
only production Nora origins, one authorization request ID, the production
gateway and a valid document route. It copies only the existing request ID and
gateway into that document URL, plus the compatibility flag. It does not modify
the OAuth protocol request or grant access. Keep the original model tab open.

In the temporary tab, verify the intended account and rendered client/scopes
before requesting human approval. If the page redirects to a different document,
account, lacks consent, or is busy, stop this attempt. Do not expose its connection
as the selected modeling session. Once the callback completes, close this
helper-created tab so its extra workspace disconnects; reselect only the original
tab's live session. Do not close any tab the user had open before recovery.

If the installed Web no longer supports this exact consent route, report
`consent_surface_unavailable`. A plugin cannot silently make one account's OAuth
token represent another account or fabricate a server grant. Preserve the model
and provide the concrete missing capability rather than a repeated login loop.

## Cancellation and completion

Cancellation, timeout, invalid host metadata and host RPC failure terminate this
single attempt and close only its owned helper process. Raw RPC errors, tokens,
server configuration and callback URLs are never emitted. Close the temporary
authorization tab after cancellation; do not act on delayed results. A successful
grant must still pass fresh live MCP identity and exact-document verification.

Supported host contracts:
- https://learn.chatgpt.com/docs/app-server
- https://learn.chatgpt.com/docs/extend/mcp?surface=cli

Read-only host checks and isolated protocol fixtures do not prove a real human
OAuth grant, current-task credential refresh, modeling or save/reopen success.

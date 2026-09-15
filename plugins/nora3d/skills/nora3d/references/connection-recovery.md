# Complete connection recovery in the current task

Use this only when OAuth is missing/invalid or a fresh connection check confirms
different website/plugin user IDs. An old document, an empty list or an email in
pasted text alone is not evidence. The target is the account on the user's
intended document, not an account chosen from unrelated chat history.

## One authorization step

A request to connect Nora3D, fix this connection, or model in the intended page
authorizes initiating the necessary host login flow. Say briefly that you are
opening authorization for the identified account and start it. Do not ask another
"May I switch accounts?" question. The user signs in and approves the actual OAuth
consent page. Do not approve it yourself or enter/read credentials. If the user
asks only for a diagnostic report, run checks only.

The website's Switch Nora3D account button is a manual request-copy fallback. It
does not itself start OAuth. Do not click/copy it when this task already has the
verified mismatch and can initiate host login. Do not send the user to settings
or a terminal when you can perform the necessary action with available tools.

## Windows desktop helper

Prefer an actual callable host OAuth action when available. Otherwise use the
current task's shell on the affected computer with the packaged script:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<this-skill>/scripts/connect-codex.ps1" -Mode Check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<this-skill>/scripts/connect-codex.ps1" -Mode Login -ConnectionCode "<fresh-page-connection-code>"
```

Resolve `<this-skill>` from the installed skill path. It is not a literal path.
The helper finds the current host's actual Codex CLI, checks that its enabled
`nora3d` server points exactly at the production MCP URL, then runs `mcp login
nora3d`. It does not change config/home, add a duplicate server, read credentials,
log out ChatGPT, revoke unrelated grants or reinstall the plugin. A missing CLI
on PATH is handled by the host-provided path or current-session process path.

`Check` is read-only. On `host_ready`, run `Login` once for this connection issue.
If a sandbox blocks access, use the host's normal execution approval mechanism;
do not reinterpret permission denial as a broken Nora3D account.

The login command stays running while the callback listener is needed. Yield the
shell tool normally and poll its returned session at intervals no longer than
30 seconds; do not stop the process while the user is authorizing. The helper
has a five-minute limit and cleans up its own login process on exit. On refusal,
cancellation, timeout or failure, do not silently launch another attempt.

## Approve in the original document

Read the fresh connection code automatically from the intended model page and pass
it to the helper. This restricts the real host PKCE request to the page's server-
verified user, document and browser session. The original page displays consent
automatically. Keep that page visible and tell the user to approve there. Do not
approve for them. A second browser cannot approve this document-bound request.

The CLI may also open a system-browser tab. Do not use that tab to sign in again.
The bound request's landing page directs the user back to their existing document.
The helper emits `awaiting_document_consent` after binding. If binding fails or is
unavailable, do not silently fall back to an unbound request or retry indefinitely.
Only an initial host install flow with no existing document can use unbound OAuth.

The user confirms the identified account on the authorization page. If the page
shows another account, let them switch/sign in there; do not silently authorize
the other account. A localhost callback must open on the same computer that ran
the login helper, and the listener must remain running.

## Verify and resume without another prompt

`oauth_callback_completed` means only that the CLI completed its flow. Call
`nora_list_workspaces` afresh and use the intended page's current
`nora_verify_connection` request. If expired, regenerate the request once on
that page. Read the verified workspace's `nora_get_context`, then continue the
original modeling task without asking the user to say "continue" again.

If the callback succeeds but MCP still reports the old account, report that exact
host credential-refresh limitation. Do not claim success, trigger another login,
delete token stores, change server URLs or select the old account's document.
Use a real exposed host reconnect action if available. If none exists, explain
the remaining host action once rather than inventing UI controls.

If no host login action or local shell is available, say that this host cannot
initiate OAuth from the task. Do not claim a webpage can run local commands or
that installing a plugin eliminates first-time account consent.

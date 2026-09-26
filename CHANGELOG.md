# 0.2.0-beta.25 — unreleased account and panel candidate

- Distinguish an unlisted target document from explicitly offline sessions.
- Collapse the Web Assistant through its existing toolbar in plugin-owned tabs;
  verify the UI result and preserve the mounted bridge and Web task state.
- Detect no-effect browser interactions and keep automation failure separate
  from page failure and account identity. Do not infer access from a URL.
- Add a host-owned OAuth helper that preserves the original document and uses
  an isolated consent tab in the same in-app browser. Keep credentials with the
  host and require human consent plus fresh MCP identity/document verification.
- Bound authorization and presentation recovery with cancellation, stale-result
  checks and cleanup. Never substitute a successful click or OAuth callback for
  the actual resulting UI or active MCP account.
- Real host discovery, human consent and OAuth callback completed successfully.
  Live panel collapse and subsequent guarded document reads also passed without
  changing the model revision. The authorization test used the same account;
  switching between distinct accounts and refreshing an existing desktop
  transport remain acceptance items. Focused regression tests pass.

# 0.2.0-beta.24

- Use the new Web assistant's automatically registered, already accessible
  document connection. No MCP button or hidden connection-code lookup is required.
- Match the current task tab's exact project/document, require a unique live
  session or retained binding, then validate guarded fresh context before edits.
- Preserve Web assistant leases, human drafts, account authorization and session
  boundaries; do not switch the page to the legacy assistant or change Web code.
- Add a deterministic, read-only workspace-selection helper and timeout guidance.
- The live buttonless page and its guarded model context were read successfully.
  Cross-account access without an existing grant is not silently created. Browser
  host transport failures remain distinct. Full modeling acceptance is pending.

# 0.2.0-beta.23

- Align task completion, reference continuity and progress with the Nora3D Web
  assistant release 20260925.1, using desktop-appropriate recovery.
- Continue authorized image modeling through native checks and saved-state
  verification; preserve analysis-only requests and necessary dimension questions.
- Document capability-gated mesh analysis and reconstruction continuation.
  Analysis results are not completed or saved native models.
- Keep the 13 shared modeling references/helpers byte-identical to the selected
  Web knowledge bundle. Preserve current-tab account/document delegation.
- Codex-only test package. No Web, shared gateway or Cursor runtime changes.
  Desktop installation, live modeling and save/reopen acceptance remain required.

# 0.2.0-beta.22

- Bind through the current conversation's existing browser tab, without opening
  another connection link or changing the browser account after a timeout.
- Use the documented alternate DOM reader when the accessibility wrapper fails.
- Verify the exact page workspace/session and pass document guards where the
  gateway supports them. A matching URL alone cannot distinguish two tabs.
- The current-tab handoff was exercised on Codex desktop. The new package and
  optional gateway guards still require release acceptance; this does not claim
  exclusive server-side conversation authorization or offline agent wake-up.

# 0.2.0-beta.21

- Pressing Codex on the signed-in Nora3D page connects that document silently:
  no Reconnect prompt, consent dialog, account comparison or visible code.
- Documents connected from a page signed in as another account are used through
  a page-session delegation; the plugin's own authorization is unchanged.
- The page replaces an expired connection code itself; the assistant reuses a
  listed workspace matching the page or reads the hidden code once.
- Requires the matching gateway (page delegation) and website release. First
  installation still uses the host's one-time account consent.

# 0.2.0-beta.20

- Keep the native Reconnect document target valid for 30 minutes while the
  intended page stays open.
- If the page check expires, press Retry check; pending consent still appears.
- Use only the new Reconnect prompt from the current connection check.
- Requires the matching native authorization service with a 30-minute target
  window. Affected-computer acceptance remains separate.

# 0.2.0-beta.19

- Recover account mismatches through the native Codex Reconnect prompt.
- Bind authorization to the account and session in the intended document page.
- Keep current model pages open; verify refreshed MCP identity before continuing.
- Remove shell execution from the normal recovery flow and preserve consent.
- Require the matching native authorization service; affected-computer acceptance
  remains separate from automated contract verification.

# 0.2.0-beta.18

- Bind host OAuth requests to the initiating user, document and browser session.
- Display consent in the original model page; reject approval from another session.
- Preserve the original document through consent and verify fresh MCP access afterward.
- Requires the matching gateway and website release.

# 0.2.0-beta.17

- Inspect authorization before opening another browser login.
- Initiate necessary OAuth without a redundant chat approval; preserve actual user consent.
- Add a Windows host CLI helper with timeout, safe output and concurrent-flow prevention.
- Require fresh account/document verification after the callback and resume the task.
- Keep technical modeling guides and both geometry algorithms unchanged.

# Changelog

## 0.2.0-beta.16 — 2026-09-13

- Local test candidate; not yet published to GitHub.
- Add public repository metadata, the Nora3D icon, and Git installation/update guidance.
- Correct the packaged skill checksum inventory after entry-point/playbook separation.
- Remove private source paths, internal Git baselines, and development postmortems.
- Keep modeling guidance, public API contracts, and both offline geometry helpers.
- Align the entry point and modeling playbook with the conversation language.
- Translate every bundled guide into English while retaining technical meaning.
- Diagnose document freshness, sharing, and account identity before suggesting OAuth.
- Use a short-lived page connection request to verify the actual plugin account.
- Stop settings loops when the host lacks an account-switch action.
- Add a confirmed-mismatch switch request and a verified desktop CLI login fallback.
- Keep the existing nora3d-production marketplace and nora3d plugin identifiers.
- Distinguish ordinary public-template insertion from privileged library management.
- Default to English when no conversation language or preference is established.

No backend deployment or CAD document change is included in this release.

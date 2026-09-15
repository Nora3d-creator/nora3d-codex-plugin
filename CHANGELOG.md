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

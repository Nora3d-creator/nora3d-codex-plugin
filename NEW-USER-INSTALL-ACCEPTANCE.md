# New-user installation: status and acceptance

Checked on 2026-10-08 against main commit `49fcec49d9da6cddfcdb99a93e8fd43678f87ba7` before this documentation change. Observations below are not a production certification.

## Observed status

| Layer | Evidence | Conclusion and limit |
| --- | --- | --- |
| Repository access | GitHub metadata reports public; anonymous HTTPS request returned 200 without credentials | No invitation or repository access request is necessary. Anonymous Git clone also succeeded. |
| Package | `plugins/nora3d/.codex-plugin/plugin.json`: version `0.2.0-beta.28`, display name `Nora3D Online Beta` | Package version confirmed; installed desktop version was not inspected. |
| Git marketplace | `.agents/plugins/marketplace.json`: display name `Nora3D Beta`, local source `./plugins/nora3d`, installation `AVAILABLE`, authentication `ON_INSTALL` | Repository-defined installation entry exists. Desktop Add/Install interaction was not executed. The internal name `nora3d-production` does not certify production readiness. |
| Public directory | No listing acceptance evidence obtained | Official public plugin-directory inclusion is unverified; do not advertise it as confirmed. |
| Release readiness | Root `release.json`: `channel=test`, `production_verified=false`; GitHub Releases API returned `[]` | Public source distribution remains a test package. A version in a manifest is not a published GitHub Release. |
| MCP protection | Anonymous GET to `https://mcp.nora3d.ai/mcp`: 401 with authentication-required challenge | Endpoint reachable and protected; a 401 before login is not an installation failure. Follow the challenge's exact resource metadata URL. |
| OAuth discovery | Authorization-server metadata returned 200 and advertises authorization code, refresh token, PKCE S256, registration, token and revocation endpoints; scopes `nora:read`, `nora:write`, `nora:agent` | Discovery is available. Metadata alone does not prove client registration, user consent, callback, token exchange, refresh or revocation works. |
| Website entry | `https://app.nora3d.ai` and `https://nora3d.ai/codex` returned 200 | Reachability only; account creation, sign-in and document access remain untested here. |
| Existing test evidence | `TEST-CHECKLIST.md` records a same-account human consent/callback test; distinct-account switching and stale-transport refresh remain pending | Prior repository-reported result, not a new independent run or clean-account certification. |
| Marketing instructions | Rendered `/codex` page says beta.22 and tells users to click MCP | Stale relative to beta.28's buttonless workflow. Website correction is needed in its owning project; this repository change does not update the deployed site. |

The unqualified protected-resource URL returned 404; the MCP challenge supplies the path-specific `/.well-known/oauth-protected-resource/mcp`. The path-specific metadata returned 200, identifies `https://mcp.nora3d.ai/mcp` as the resource and the Nora3D authorization server, and advertises header bearer tokens. Clients must follow the challenge rather than infer that discovery is unavailable from the root URL.

## Minimal first-install path

1. Add this public repository as a Git marketplace in a plugin-capable Codex desktop app; use `main` and leave Sparse paths empty.
2. Install `Nora3D Online Beta` from `Nora3D Beta`.
3. Review and complete the host's Nora3D authorization once, using the intended account. Wait for host authentication completion.
4. Start a new task, mention the plugin, and open or reuse the intended Nora3D document in that task's built-in browser. Sign in there only if necessary.
5. Require fresh account and exact-document confirmation before modeling.

No GitHub access application, clone, ZIP download, local CAD server, manual token copying, MCP configuration or MCP-button click belongs in this default path. A separate website sign-in may still be required because the plugin grant and browser session are different. Reauthorization is conditional on evidence of an access problem, not on an empty workspace list alone.

## Test setup and recording

Use a clean Codex profile with no Nora3D plugin, marketplace or cached grant, and a fresh Nora3D account without test allowlisting. Do not clear a real user's credentials to simulate this. Use disposable documents and get the tester's own consent. Record desktop build, OS, plugin version, source commit, test time/timezone, account cohort, expected/actual result, elapsed time and sanitized error codes. Never record credentials, tokens, callback URLs, authorization codes or session-bound consent links.

Run Windows and macOS desktop installations with English and Japanese account/browser settings, covering the target US/European and Japanese user cohorts. Record actual region and network; do not infer regional acceptance from one run. Linux and other hosts should be marked untested unless independently exercised.

All live cases below are **NOT RUN in this audit**. Fill in PASS / FAIL / BLOCKED, evidence and a defect reference per run. Anonymous access and configuration inspection above are separate checks.

| ID | Action | Required result |
| --- | --- | --- |
| N01 | Open repository logged out of GitHub; add marketplace using README fields | Repository visible; marketplace loads without invitation, collaborator approval or private-repository credentials. |
| N02 | Inspect marketplace and install plugin | Correct plugin and version shown; adding marketplace is visibly distinct from installing; host starts account authorization. |
| N03 | First-time OAuth using a non-allowlisted account | Intended account/client and requested scopes shown; user approves; host receives callback and reports completion; authenticated read verifies caller. No manual token handling. |
| N04 | Cancel or reject consent, close consent tab, or let request expire | Host reports incomplete authorization; no modeling or claim of connection; bounded retry uses a fresh request and never reuses expired links. |
| N05 | Start new task; open/create intended part in built-in browser | Browser sign-in occurs only if needed; exact project/document/live session verified; no MCP-button, invitation or extra authorization loop. Empty fresh-account workspace list is not treated as account mismatch. |
| N06 | Read before write, then create 80 x 50 x 6 mm plate with centered diameter-10 mm through-hole | Correct account/document; native dimensions and one solid verified; saved/displayed receipts obtained. Reopen after idle/save and verify persistence separately. |
| N07 | Continue same verified session; change thickness to 8 mm | Hole preserved; no redundant browser inventory or OAuth; saved geometry remains correct. |
| N08 | Website and plugin use different accounts, without delegation | No access from URL alone; no edits before identity/access is resolved. Conditional recovery preserves original document, obtains user consent once, then checks fresh MCP caller/context. |
| N09 | Callback succeeds but current task still has old grant | Report stale transport distinctly; use supported refresh or one new task; no repeated OAuth, account switching or reinstall loop. |
| N10 | Revoke test grant; attempt read/write; then reconnect | Revoked access rejected; clear recovery guidance; reconnect restores only approved access. Test refresh-token behavior after expiry separately. |
| N11 | Close document, leave historical sessions, or open two matching live sessions | Offline records ignored; ambiguous sessions require explicit selection; unrelated document never substituted. |
| N12 | Upgrade from a known older beta through Git marketplace | New source and installed version verified separately; new task loads update; unchanged main causes no false update claim. This audit does not create a release to manufacture this test. |
| N13 | Follow README and marketing page in English/Japanese without developer help | Labels match deployed client; no obsolete MCP-button step; failures actionable; no unsupported guarantee of official-directory availability. |

## Release decision

Do not change `production_verified` to true based on repository visibility, discovery metadata, demo videos or an existing-account success. Require recorded clean-account install, consent/callback/authenticated identity, exact-document access, modeling/save/reopen, cancellation, account-boundary and recovery results on each advertised platform. Separately obtain evidence for any claimed official-directory listing. Failed, blocked and untested cases remain visible.

## Website copy to apply in the owning project

Replace the beta.22 MCP-button instruction with:

> Codex checks your current document and its live connection before modeling. The beta.28 workflow does not require an MCP button. Keep your intended document tab open. If the connection cannot be verified, follow the reported recovery step; do not copy tokens or repeatedly reinstall.

Replace the version help text with:

> Public Git marketplace, test package 0.2.0-beta.28. No GitHub invitation is required. Complete Nora3D account authorization when prompted. Clean-account installation acceptance and official public-directory inclusion have not been independently verified in this audit.

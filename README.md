# Nora3D for Codex

Create, inspect, and edit CAD models in [Nora3D](https://app.nora3d.ai).
Every registered Nora3D account is eligible; there is no invitation review.
The plugin follows your conversation language.

## Install the private test

1. In Codex, add a plugin marketplace with Source
   `https://github.com/Nora3d-creator/nora3d-codex-plugin`, Git ref `main`,
   and empty Sparse paths. Your GitHub account needs access to this private repository.
2. Install **Nora3D Online Beta** from **Nora3D Beta** and complete the account
   authorization opened by Codex. Sign in to the Nora3D account you intend to use.
3. Confirm version **0.2.0-beta.17** and start a new task using the plugin.

GitHub access downloads the private package; Nora3D authorization connects your CAD
account. They are separate. Public availability has not been enabled.

For the ZIP alternative, extract it fully, use the folder containing `.agents` and
`plugins` as Source, and leave Git ref and Sparse paths empty. Local sources do not
support Git upgrades. Keep only one Online Beta source installed; save your document
before migrating an older local installation to this Git source.

## Start modeling

Mention **@Nora3D Online Beta** and describe the model, for example:

> Create an 80 x 50 x 6 mm plate with a centered 10 mm through-hole.

The assistant checks the existing connection first and reuses the intended authorized
document where the current host can identify and control it. It avoids opening a
second browser login blindly. Keep the modeling page open.

If your intended page and plugin use different accounts, the assistant explains the
target account and starts the supported authorization flow directly. You sign in and
approve access on the actual authorization page. There is no extra chat approval
or requirement to type commands. A successful account/document check must follow
the OAuth callback before modeling resumes.

The included Windows recovery helper uses Codex's actual installed CLI, with bounded
waiting, duplicate-flow prevention and no credential-store edits. This requires a
host that permits local shell execution. If the host blocks execution, lacks a login
action, or keeps an old OAuth identity in memory, the assistant must explain that
specific remaining host action. The package does not bypass those host restrictions.

## Update

For a Git installation, use the marketplace **Upgrade** action, check the installed
plugin version, and install the updated plugin if it still shows an older version.
Start a new task so its skill instructions are refreshed. Automatic background updates
are not guaranteed. Remote MCP service updates and installed plugin updates are separate.

## Connection checks

- Website sharing alone is not completed plugin authorization.
- The assistant uses the page's fresh connection request and `nora_verify_connection`.
- A missing workspace alone does not prove different accounts.
- Same-account document changes should rediscover the intended document without OAuth.
- OAuth completion alone is not proof that the current task has refreshed credentials.
- An expired or cancelled authorization must not trigger an endless retry loop.

## Package contents and validation

This repository includes the manifest, English guides, geometry helpers, Windows
connection helper, brand icon and marketplace catalog. The service endpoint is
`https://mcp.nora3d.ai/mcp`. Backend code, user documents and credentials are excluded.

Checksums are in `release.json`. Automated helper tests and package validation are
separate from the new-computer acceptance steps in [TEST-CHECKLIST.md](TEST-CHECKLIST.md).
This release does not claim that the new-computer OAuth/model/save workflow has
already passed. First-time account consent is still required.

Support: [nora3d.ai@gmail.com](mailto:nora3d.ai@gmail.com).

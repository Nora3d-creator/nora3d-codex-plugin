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
3. Confirm version **0.2.0-beta.21** and start a new task using the plugin.

GitHub access downloads the private package; Nora3D authorization connects your CAD
account. They are separate. Public availability has not been enabled.

For the ZIP alternative, extract it fully, use the folder containing `.agents` and
`plugins` as Source, and leave Git ref and Sparse paths empty. Local sources do not
support Git upgrades. Keep only one Online Beta source installed; save your document
before migrating an older local installation to this Git source.

## Start modeling

Mention **@Nora3D Online Beta** and describe the model, for example:

> Create an 80 x 50 x 6 mm plate with a centered 10 mm through-hole.

Sign in to Nora3D with the account you want to work as, open the model, and press
the **Codex** button under the canvas. That click connects this document to the
plugin: the assistant reads the page's hidden connection code, verifies it, and
starts modeling. No Reconnect prompt, consent dialog, account comparison, code
copying, settings page or command line is involved, even when the plugin was
originally authorized with a different Nora3D account. Access is limited to that
document while its page stays open; reloading the page and pressing **Codex**
again reconnects it. Keep the modeling page open.

This release requires the matching gateway (page delegation enabled) and website
release. First-time installation still uses the host's one-time account consent.

## Update

For a Git installation, use the marketplace **Upgrade** action, check the installed
plugin version, and install the updated plugin if it still shows an older version.
Start a new task so its skill instructions are refreshed. Automatic background updates
are not guaranteed. Remote MCP service updates and installed plugin updates are separate.

## Connection checks

- Pressing **Codex** on the page is the authorization; the assistant verifies the
  page's hidden connection code with `nora_verify_connection` or reuses the listed
  workspace that matches the page's document.
- A document connected from a page signed in as another account appears as
  `delegated` in the workspace list; the plugin's own authorization is unchanged.
- A missing workspace only means that page has not been connected yet.
- An expired code is replaced by the page itself; a persistent failure is reported
  once with the exact tool error, never as an endless retry loop.

## Package contents and validation

This repository includes the manifest, English guides, geometry helpers, Windows
connection helper, brand icon and marketplace catalog. The service endpoint is
`https://mcp.nora3d.ai/mcp`. Backend code, user documents and credentials are excluded.

Checksums are in `release.json`. Automated helper tests and package validation are
separate from the new-computer acceptance steps in [TEST-CHECKLIST.md](TEST-CHECKLIST.md).
This release does not claim that the new-computer connect/model/save workflow has
already passed. First-time account consent is still required.

Support: [nora3d.ai@gmail.com](mailto:nora3d.ai@gmail.com).

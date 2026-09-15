# Nora3D for Codex

Create, inspect, and edit 3D CAD models in [Nora3D](https://app.nora3d.ai) with Codex.
Every registered Nora3D account can connect. No invitation or approval is required.

## Install from this private Git marketplace

This repository is private for owner testing. Sign Git into GitHub as
**Nora3d-creator** on the testing computer. GitHub repository access downloads the
plugin; Nora3D OAuth separately authorizes access to your CAD documents.

1. In Codex, open **Plugins → Add → Add a marketplace**.
2. Set **Source** to **`https://github.com/Nora3d-creator/nora3d-codex-plugin.git`**.
3. Set **Git ref** to **`main`**. Leave **Sparse paths** empty.
4. Add the marketplace, install **Nora3D Online Beta**, and confirm **0.2.0-beta.16**.
5. Start a new task to load the plugin instructions.

If GitHub authentication is requested, use the repository owner's GitHub account.
A browser login alone may not configure the Git credentials used by Codex.
A private repository can appear as "not found" to a client that lacks access.
Do not paste passwords or access tokens into a task or the marketplace URL.

If the old ZIP-based Nora3D Beta marketplace is still configured, save your CAD
document, remove that old marketplace entry, then add this Git source. If an
installed copy prevents migration, uninstall that Online Beta copy and reinstall
from this source. Do not remove unrelated marketplaces or the cloud document.

This is Nora3D's own marketplace, not a listing in the official public directory.
It connects to the existing production Nora3D service; this private repository does
not create an isolated backend. Use separate test documents for modeling acceptance.

## Connect and create

Complete the plugin's **Authenticate** step, sign in or register with Nora3D, and
open a part document. Review the requested access, choose **Authorize**, and finish
the return to Codex until **Authentication complete** appears. Keep Codex and the
modeling page open. Then mention **@Nora3D Online Beta**, for example:

> Create an 80 × 50 × 6 mm plate with a 10 mm through-hole at the center.

The plugin follows your conversation language. Account eligibility does not grant
access to documents until you consent. Existing document permissions still apply.

## Update

After changes are pushed to **main**, use the marketplace
settings' **Upgrade** for **Nora3D Beta**, then check the installed plugin's version.
If it still shows an older version, install the updated plugin from that marketplace.
Start a new task to load updated skill instructions. The current version is **0.2.0-beta.16**.

Automatic background upgrades are not guaranteed. Updating the remote MCP service
is separate from updating the files installed in Codex.

### Moving from an extracted ZIP

The old local-folder source cannot be upgraded from Git. Remove that local marketplace
entry from Marketplace settings, then add this Git source and install its plugin.
If the existing plugin prevents migration, uninstall that plugin and reinstall it
from this source. You may need to authenticate again. Keep your Nora3D document saved
and open; removing a plugin is not a request to delete its cloud documents.
Do not enable the Local Dev and Online Beta plugins together.

## Connection help

The new connection verification requires the matching website and gateway update.
Installing this package does not deploy those services or switch stored OAuth accounts.
With the updated services, the plugin reads the page connection request and calls
`nora_verify_connection` before using the document. Only a verified account/document
connection receives the green indicator. On older services, use the checks below.

Only a confirmed account mismatch shows **Switch Nora3D account** on the updated
website. Click it and paste the copied request into the current Codex task. The
plugin starts OAuth through a supported host action or the verified desktop CLI
configuration, then lets you sign in and approve access. The page cannot launch
local commands itself. Clipboard access is optional: the request remains visible
for manual copying. Successful authorization is followed by an account/document
check before modeling resumes. Same-account connections never need this action.

- Missing tools: use the host authentication action when it is available. Do not
  repeatedly navigate settings when no Authenticate control is present. After
  successful authentication, retry tool discovery.
- **Current document shared** confirms browser sharing, not completed OAuth.
- A refused local callback needs a fresh **Authenticate** attempt. Do not repeatedly
  reload an old callback URL.
- If tools show an old document, first compare the current page's document and
  account with a fresh workspace list. For the same account, select the matching
  live document instead of authenticating again. A missing or old document alone
  does not prove an account mismatch. Check sharing/liveness before reauthorization.
- If the two accounts actually differ, authenticate the plugin with the intended
  Nora3D account. Keep the target document open throughout the consent flow.

Support: [nora3d.ai@gmail.com](mailto:nora3d.ai@gmail.com).

## Package and service

This repository contains the plugin manifest, skills, offline geometry helpers,
brand icon, and marketplace catalog. The remote service is
`https://mcp.nora3d.ai/mcp`; backend source, credentials, and user documents are not
part of this package. Currently Codex is supported; other client packages are planned.

Release checksums are in `release.json`. This private test release has packaging checks but
is not a claim that every CAD workflow or automatic update scenario has passed
end-to-end acceptance.

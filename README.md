# Nora3D for Codex

**Your next part. Built with Codex.**

Create CAD from a prompt or drawing, with your Nora3D document right beside the conversation. Describe it. Build it. Keep editing.

https://github.com/user-attachments/assets/662a4fe1-233d-455e-a2f2-801eb7dc509e

**39-second demo — from a prompt to “fold it.”** Edited recording; wait times removed and some steps sped up.

https://github.com/user-attachments/assets/c744116a-a96f-41f2-8805-9bb3e53cfd1d

**25-second demo — from a drawing to a CAD model.** Edited recording; modeling steps sped up.

## Install

**Public repository, test release.** The repository is public; you do not need a GitHub invitation or repository access approval. The current package is **0.2.0-beta.28**, with `channel=test` and `production_verified=false`. This repository supplies a Git marketplace; it is not evidence of a listing in the official public plugin directory or a fully accepted new-user installation flow. See the [installation status and acceptance cases](NEW-USER-INSTALL-ACCEPTANCE.md).

You need a **Codex desktop app with plugin support**, internet access, and a **Nora3D account**. No local CAD server is required. The workflow below is the documented beta installation path; end-to-end clean-account acceptance remains pending.

1. In Codex, go to **Plugins → Add → Add a marketplace**.
2. Enter the following, leaving **Sparse paths** empty:

   | Field | Value |
   | --- | --- |
   | Source | `https://github.com/Nora3d-creator/nora3d-codex-plugin` |
   | Git ref | `main` |

3. Install **Nora3D Online Beta** from **Nora3D Beta**. Adding the marketplace alone does not install the plugin. When prompted, sign in to your intended Nora3D account and review the requested access before approving. Keep Codex open until the host confirms authentication has completed, then start a new task.

GitHub repository access and Nora3D account authorization are separate. Public repository access does not authorize access to your CAD documents. Do not request a GitHub invitation, copy tokens, configure a local MCP server, or reinstall the plugin as routine first-install steps.

## Build your first part

Mention **@Nora3D Online Beta** and ask it to open [Nora3D](https://app.nora3d.ai) in the task’s built-in browser. Sign in to the intended account if needed, then open or create a part document. Use an existing intended document tab when available. The beta.28 workflow checks the exact document and its connection before editing; it does not require an MCP button. Keep the document tab open.

> In the current document, create an 80 × 50 × 6 mm plate with a centered 10 mm through-hole. Check the dimensions and save it.

Keep the document tab open and continue with follow-up requests. Replies follow your language.

If authorization is missing or expired, or a confirmed account mismatch prevents document access, the beta includes a recovery flow using a temporary consent tab. This is conditional recovery, not another mandatory installation step. Review the account and requested access yourself. A consent success page alone does not prove Codex received the callback or refreshed its connection: require host authentication completion and a fresh account/document check. Different-account recovery and stale-connection refresh still need acceptance. Do not repeatedly authorize or reinstall to hide a failed connection. See [account authorization](plugins/nora3d/skills/nora3d/references/account-authorization.md).

## Updates

To check for changes on `main`, use **Upgrade** on the Git marketplace, then install the updated plugin if the installed version is still older. Confirm the version in plugin Information and start a new task after updating. Git update behavior still needs clean-client acceptance; `main` is a moving beta source, not a stable release pin. As checked on 2026-10-08, GitHub's Releases API contains no published release entries.

Test package: **0.2.0-beta.28**. The repository records selected geometry, save and reload checks; these do not certify every new-user installation or modeling scenario. Full Jev reconstruction and general recipe certification remain pending. See the [changelog](CHANGELOG.md) and [desktop acceptance checklist](TEST-CHECKLIST.md).

[Website](https://nora3d.ai/codex) · [Changelog](CHANGELOG.md) · [Support](mailto:nora3d.ai@gmail.com)

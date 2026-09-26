# Nora3D for Codex

**Your next part. Built with Codex.**

Create CAD from a prompt or drawing, with your Nora3D document right beside the conversation. Describe it. Build it. Keep editing.

https://github.com/user-attachments/assets/662a4fe1-233d-455e-a2f2-801eb7dc509e

**39-second demo — from a prompt to “fold it.”** Edited recording; wait times removed and some steps sped up.

https://github.com/user-attachments/assets/c744116a-a96f-41f2-8805-9bb3e53cfd1d

**25-second demo — from a drawing to a CAD model.** Edited recording; modeling steps sped up.

## Install

You need the **Codex desktop app** and a **Nora3D account**. No invitation or local CAD server required.

1. In Codex, go to **Plugins → Add → Add a marketplace**.
2. Enter the following, leaving **Sparse paths** empty:

   | Field | Value |
   | --- | --- |
   | Source | `https://github.com/Nora3d-creator/nora3d-codex-plugin` |
   | Git ref | `main` |

3. Install **Nora3D Online Beta** from **Nora3D Beta** and complete the Nora3D authorization. Keep Codex open until authentication finishes, then start a new task.

During private testing, your GitHub account needs access to this repository.

## Build your first part

Mention **@Nora3D Online Beta** and ask it to open [Nora3D](https://app.nora3d.ai) in the task’s built-in browser. Sign in, then open or create a part document. Keep the existing **Assistant** panel open. The plugin finds the document’s available connection and checks it before editing; no MCP button is needed.

> In the current document, create an 80 × 50 × 6 mm plate with a centered 10 mm through-hole. Check the dimensions and save it.

Keep the document tab open and continue with follow-up requests. Replies follow your language.

## Updates

Use **Upgrade** on the Git marketplace, then install the updated plugin if the installed version is still older. Start a new task after updating. Current package: **0.2.0-beta.24**. See the changelog for test status.

[Website](https://nora3d.ai/codex) · [Changelog](CHANGELOG.md) · [Support](mailto:nora3d.ai@gmail.com)

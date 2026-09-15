# Nora3D 0.2.0-beta.21: new-computer acceptance

Install from Git or the extracted local folder using README.md. Confirm **0.2.0-beta.21**
in plugin Information before testing. Keep only one Online Beta plugin enabled.

1. **First use:** start a new task, mention Nora3D and check the response follows
   your conversation language. Test an English conversation and a Chinese one.
2. **Connect:** sign in to Nora3D, create a separate test part document and press
   **Codex** under the canvas. The page must show no panel, account text, code or
   button beyond the Codex button itself. Confirm a real MCP call reads that document.
3. **Model:** request an 80 × 50 × 6 mm plate with a centered 10 mm through-hole.
   Confirm actual dimensions, one solid, and a real through-hole.
4. **Save/reopen:** ask for saved-version verification. Once idle and saved, close
   and reopen the document, press **Codex** again. Confirm geometry and the feature
   history remain and the assistant continues without any prompt.
5. **Continue editing:** change plate thickness to 8 mm; verify the same model is
   edited, the hole remains, and the new version persists after reopening.
6. **Connection recovery:** while idle with a saved model, briefly disconnect the
   test computer's network, restore it, and request the current model state.
   Confirm recovery without duplicate modeling or any consent.
7. **Helpers when applicable:** exercise thickness/direction checks and, in a
   separate suitable mechanism document, folding. Planning output alone is not
   proof that a model moved correctly or has no collisions.
8. **Switch documents:** open and connect a second test document with **Codex**.
   Ask Codex to identify its document before any write. It should use the live
   workspace matching the page, not write to the old document. If it fails,
   record the visible document identity and the non-secret workspace-list result.
9. **Different website account (main case):** with the plugin authorized as
   account A, sign the website in as account B, open B's document, press **Codex**
   and start a new task. No Reconnect toast, consent dialog, account comparison or
   code may appear anywhere. The assistant must read B's document, model, save and
   reopen it. `nora_list_workspaces` may list it as `delegated`; the assistant must
   not mention accounts or ask for any authorization. Open A's own document in
   another tab and confirm B's delegation does not expose it, and that closing B's
   page ends access to B's document.

Record the plugin version, step, expected/actual outcome and error text. Avoid
sharing passwords, tokens or OAuth callback URLs. Use test documents, not originals.
Also test Git marketplace Upgrade and new-task instruction pickup. The ZIP cannot
establish that Git updating works. Test a page left open for more than five
minutes before the task starts: the code is replaced silently and the assistant
still connects. A read-only document must fail writes with a clear read-only
message, not an account request.

Legacy service only: if `https://mcp.nora3d.ai/health` reports
`document_delegation: 0`, the native Reconnect flow applies instead: the prompt
must appear once, consent must appear in B's original page, and the refreshed
MCP identity must be verified before modeling.

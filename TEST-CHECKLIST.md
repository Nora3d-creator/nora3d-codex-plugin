# Nora3D 0.2.0-beta.18: new-computer acceptance

Install from Git or the extracted local folder using README.md. Confirm **0.2.0-beta.18**
in plugin Information before testing. Keep only one Online Beta plugin enabled.

1. **First use:** start a new task, mention Nora3D and check the response follows
   your conversation language. Test an English conversation and a Chinese one.
2. **Connect:** sign in to Nora3D, create a separate test part document, complete
   Authenticate and consent, and confirm a real MCP call can read that document.
   Browser sharing alone is not proof that OAuth completed.
3. **Model:** request an 80 × 50 × 6 mm plate with a centered 10 mm through-hole.
   Confirm actual dimensions, one solid, and a real through-hole.
4. **Save/reopen:** ask for saved-version verification. Once idle and saved, close
   and reopen the document. Confirm geometry and the feature history remain.
5. **Continue editing:** change plate thickness to 8 mm; verify the same model is
   edited, the hole remains, and the new version persists after reopening.
6. **Connection recovery:** while idle with a saved model, briefly disconnect the
   test computer's network, restore it, and request the current model state.
   Confirm recovery without duplicate modeling or unnecessary repeated consent.
7. **Helpers when applicable:** exercise thickness/direction checks and, in a
   separate suitable mechanism document, folding. Planning output alone is not
   proof that a model moved correctly or has no collisions.
8. **Switch documents:** with one authorized Nora3D account, open and share a second
   test document. Ask Codex to identify its document before any write. It should
   rediscover the matching live workspace, not write to the old document or ask
   for OAuth merely because the workspace changed. If it fails, record both visible
   document identity and the non-secret workspace-list result.
9. **Account mismatch:** when intentionally testing a different Nora3D account,
   verify that the plugin explains a confirmed mismatch and starts the host OAuth
   flow without another chat approval. The user approves the actual consent page
   for that account. Verify a fresh MCP identity and document check before resuming; It must not silently switch identities or use another user's model.

Record the plugin version, step, expected/actual outcome and error text. Avoid
sharing passwords, tokens or OAuth callback URLs. Use test documents, not originals.
Also test Git marketplace Upgrade and new-task instruction pickup. The ZIP cannot
establish that Git updating works. Test cancellation, timeout, and an already-running
authorization: no duplicate flow, no writes, and no hidden retry. Test a different
system-browser account from the intended document browser. A callback with a stale
host identity must be reported accurately rather than called success.

Document-bound recovery: keep the original document open under account B while the
plugin uses account A. Consent must appear in B's original page without another
login. Approval from A, a second B document or a replaced session must fail. Cancel
must stop approval. After approval, verify the refreshed MCP account and exact
document, create a test plate, save and reopen it. A callback alone is insufficient.

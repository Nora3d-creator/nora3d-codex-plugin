---
name: nora3d
description: Create and edit CAD models in Nora3D. Connect the intended account and document, then use MCP modeling tools.
---

# Nora3D Online Beta

Follow the user's language and explicit preferences. English guides do not force
English replies or change website language. Retain the current modeling request
and dimensions across follow-ups, login, reconnection and voice/text handoffs.

## Read only the current route

For ordinary modeling/inspection read [execution core](references/modeling-fast-path.md)
once per loaded version. This entry and that core contain normal connection,
batch, geometry and completion rules; do not preload every linked guide.
Retain already read content across turns. If an actual read was truncated, fetch
only its missing part. Project instructions still apply to repository changes;
a CAD request alone does not require scanning unrelated project documentation.

Add [drawing review](references/drawing-review.md) for a drawing, new view or shape
correction; [direct modeling](references/direct-modeling.md) for complex/multi-solid
work; [threads and lofts](references/thread-and-loft.md) for threads, helices,
loft/sweep or variable sections; [folding](references/folding.md) for mechanisms.
Use the [playbook](references/modeling-playbook.md) for library insertion,
unfamiliar topology, tasks outside those routes or an unresolved modeling failure.
For meshes also read [mesh reconstruction](references/mesh-reconstruction.md).
Jev choices and needs_codex are not completed geometry or full acceptance;
an installed guide cannot upgrade a connected Web or gateway.

## Connect once, then continue

Every registered account is eligible. Reuse valid installation OAuth. The new
Web assistant connects automatically and has no MCP button. These desktop rules
supersede older button/code instructions in shared guides and tool descriptions.

1. Discover Nora3D tools. Reuse the intended page in this conversation's browser,
   retaining browser/tab IDs. Use host metadata.codexSessionId when available to
   identify this task's browser. Read the actual URL's project and document.
   Never substitute the newest/only online workspace for the intended tab.
   If no suitable page exists, open https://app.nora3d.ai/ in the intended browser.
   Let the user complete sign-in. Request needed login promptly, then prepare
   schemas independently; do not finish all modeling preparation before asking.
2. Fetch nora_list_workspaces and check deployment origins. Match BOTH project
   and document and require exactly one accessible live session. Multiple live
   matches require disambiguation, never a timestamp guess. Valid delegated
   sessions remain usable. Read nora_get_context with expected_project_id,
   expected_document_id and expected_session_epoch. Check returned identity,
   liveness, permission, draft/busy state and pending saves before any write.
   This guarded context is the binding check; no connection code is needed.
3. Retain the verified binding, context and cursor while tab/document/session
   remain current. Do not repeat inventory, workspace listing, panel collapse or
   OAuth for each command. Reconnection/document switching invalidates old tokens
   and object bindings; retain requirements.
4. In this task's plugin-owned tab, collapse an expanded Web Assistant once
   through its observed visible toolbar only if idle, rendered and free of
   busy/recovery/overlay guards. Verify both the button's collapsed state and
   actual hidden panel. Respect a panel the user subsequently reopens.
   If the action has no effect use [panel recovery](references/assistant-panel.md)
   for at most one documented alternate interaction. Do not loop, refresh,
   inject CSS, change private state or unmount the assistant/bridge. Optional
   presentation failure does not prevent safe MCP work or justify OAuth.
5. An unlisted target is not known offline or evidence of account mismatch.
   For missing/ambiguous sessions, browser timeouts, failed reconnect or older
   visible connection controls read [connection recovery](references/buttonless-connection.md).
   For confirmed authorization problems read [account authorization](references/account-authorization.md).
   Observe website identity only through normal visible UI when needed; never
   infer it from a URL. A callback does not prove the MCP transport changed:
   recheck caller and exact document. Do not repeat OAuth on a still-old transport.

Never read, request, copy or fill passwords, cookies, browser storage credentials
or token files. Never approve user consent, substitute accounts, change token
subjects, manufacture access or use a local server as a production fallback.
Respect Web assistant leases and human drafts: assistant_busy stops conflicting
writes. Do not stop/reconfigure the Web assistant or clear leases. A diagnosis
request permits reads, not geometry changes.

## Complete the authorized request

Interpretation/planning is progress: continue in the same turn through geometry
checks, repairs and actual saved-state verification. Do not ask for a redundant
"continue". Honor analysis-only requests, cancellation and essential dimension
questions. If the user explicitly requests defaults, choose and state reasonable
example dimensions before execution; do not invent missing drawing dimensions.

Use references actually supplied for this task; retain original requirements.
Do not read another task's attachments/history or unsent drafts unless the user
explicitly selects them. An old reference is not permission to rebuild. Read
[workflow recovery](references/assistant-workflow.md) for failures, lost reference
continuity or uncertain outcomes; never replay an unknown write or discard a
draft automatically. Web automatic recovery does not resume desktop tasks.
Recover from actual operation results and fresh context.

Codex plans and executes through MCP/API; native Agent delegation is off by
default. Explain concrete API gaps before Computer Use fallback. Use one final
visual check when appropriate; screenshots and approximate bounds do not prove
dimensions. Verify commit save/display revisions, not camera-operation success.

## Reuse and public templates

For experience requested by the user read [experience reuse](references/modeling-experience.md),
retain successes and failures in the authorized artifact folder, and explicitly
select a candidate index before reuse. Do not scan other tasks or rewrite global
instructions. Old success is not current-model evidence. Report the index path;
candidates never become certified automatically.

Registered users may insert available public templates into editable documents.
Import template and Parametric management entries require management permission;
ordinary insertion does not. On failure inspect the actual error, publication
availability and document state. A generic failure is not an OAuth diagnosis.
Verify inserted geometry and saved revision before reporting completion.

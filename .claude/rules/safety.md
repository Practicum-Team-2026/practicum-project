# Safety Rules

## Non-Negotiable Stop Conditions
Stop the workflow immediately when any condition below is true:
- Current branch is main
- Current branch is dev
- Repository state is ambiguous or unsafe
- Morning sync finds uncommitted local changes
- Merge conflict exists
- Tests or required checks fail
- Secret detection check fails
- Forbidden file detection check fails
- Push fails
- Required verification fails

After stopping:
- Explain the reason clearly.
- Perform no further automatic actions.

## Forbidden Automatic Recovery
Do not use destructive commands merely to force success.
Disallowed without explicit, separate approval:
- git reset --hard
- git clean -fd
- force push

Do not attempt speculative recovery such as rewriting history, discarding work, or bypassing checks.

## Conflict Handling Policy
- Never auto-resolve merge conflicts.
- Report conflict status and affected files when available.
- Wait for developer intervention.

## Morning Working Tree Policy
Morning sync requires a clean tree.
If local changes exist, stop and request developer action first.
Do not stash, reset, discard, or overwrite changes automatically.

## Night Commit Safety Policy
Before commit/push:
1. Inspect change set.
2. Run safety checks.
3. Block on secrets or forbidden files.
4. Stage only appropriate files.
5. Use meaningful commit message.

Do not create commits for empty changes.
Do not use meaningless commit messages like update, changes, stuff, or work.

If no changes exist for night_sync, report explicit no-op and stop without commit/push.

## Verification Requirements
Minimum required verification:
- Branch validity
- Repository-state validity
- Merge result status (when merge performed)
- Test result status
- Push result status (night sync)

Do not report successful readiness unless required checks have passed.

## Quality Gate Enforcement
Quality gate execution is required before state-changing operations.
Detailed verification sequence is defined in .claude/hooks/quality-gate.md.
Policy authority remains in this file and .claude/rules/branching.md.

# Quality Gate

## Purpose
This file defines reusable verification sequences for daily workflows.
It is an enforcement helper and checklist, not the canonical source of branch or safety policy.

Canonical policy authority:
- .claude/rules/branching.md
- .claude/rules/safety.md

## Enforcement Contract
Before any state-changing Git operation, the orchestrator must run the relevant verification sequence below.
If any check fails, stop immediately and report the failure.

## Morning Sync Verification Sequence
Goal: verify safety before and after merging dev into the current task branch.

Pre-merge checks:
1. Branch eligibility passes according to .claude/rules/branching.md.
2. Repository state is safe and unambiguous according to .claude/rules/safety.md.
3. Working tree is clean.
4. Latest dev has been fetched successfully.

Merge checks:
1. Merge operation succeeds.
2. No unresolved conflicts remain.

Post-merge checks:
1. Required tests/checks pass.
2. Repository remains in a valid state.

If all checks pass, morning_sync may report readiness.

## Night Sync Verification Sequence
Goal: verify safety before commit and push of the current task branch.

Pre-commit checks:
1. Branch eligibility passes according to .claude/rules/branching.md.
2. Repository state is safe and unambiguous according to .claude/rules/safety.md.
3. Changes exist; if no changes exist, return explicit no-op and stop.
4. Secret detection passes.
5. Forbidden-file detection passes.
6. Required tests/checks pass.

Commit/push checks:
1. Commit is meaningful and non-empty.
2. Push of current task branch succeeds.
3. Push result is verified.

If all checks pass, night_sync may report success.

## Conflict and Failure Handling
On any failure condition, stop and perform no speculative or destructive recovery.
At minimum, this includes:
- branch is main or dev
- repository state unsafe or ambiguous
- merge conflict exists
- tests/checks fail
- secrets detected
- forbidden files detected
- push fails

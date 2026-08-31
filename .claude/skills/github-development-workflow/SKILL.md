---
name: github-development-workflow
description: Shared Git and GitHub workflow knowledge for safe morning_sync and night_sync orchestration.
---

# Skill: github-development-workflow

## Purpose
Provide shared, reusable Git/GitHub operational knowledge used by git-workflow-agent.

## Scope
This skill defines:
- Repository and branch model interpretation
- Local Git operation priorities
- GitHub-level operation boundaries
- Safety and verification principles
- Morning and Night workflow execution knowledge

This skill does not define trigger routing. Trigger ownership belongs to .claude/agents/git-workflow-agent.md.

## Canonical Policy Boundary
Branch and safety policy are canonical in:
- .claude/rules/branching.md
- .claude/rules/safety.md

This file provides operational methods and command guidance, not policy authority.

## Branching Model
Expected branch roles:
- main: protected integration/release branch
- dev: protected team integration branch
- feature/<task>: task branch for daily work

Daily workflows are allowed only on task branches.

## Tooling Boundary
### Local Git first
Use local Git for repository-local checks and operations, including:
- status
- diff
- branch and tracking state
- fetch
- merge
- add/commit
- push

### GitHub MCP minimal usage
Use GitHub-level operations only when local Git is insufficient and only when MCP is configured and necessary.
If MCP is unavailable, continue with local Git capability and report the limitation clearly.

Decision tree:
1. Can this be answered/executed with local Git reliably?
	- Yes: use local Git.
	- No: use MCP if configured.
2. If MCP is not configured/available:
	- Do not fake MCP usage.
	- Continue with local capability when safe.
	- Report exactly what could not be validated via MCP.

MCP capability boundary (minimum useful set for this architecture):
- Repository metadata read (default branch, branch existence, visibility)
- Branch metadata read (protection, status context where available)
- Optional PR-related metadata read when integration workflow is introduced

Preferred MCP usage points (when available):
- Validate default branch and branch existence before sensitive branch-policy decisions.
- Read branch protection state for governance visibility.
- Validate remote branch head metadata if local view is ambiguous.

Out of scope for current daily workflows:
- Direct content editing through MCP
- Broad organization-wide mutation capabilities
- Any MCP action that duplicates reliable local Git behavior

## Token Efficiency Guidance
Decision rule:
- Prefer local Git for high-frequency daily operations (status/fetch/merge/add/commit/push).
- Use MCP only for GitHub-level facts or actions not available reliably from local Git.

Rationale:
- Local Git operations are concise, deterministic, and generally cheaper in token overhead.
- MCP calls are valuable for remote policy/metadata visibility but should stay minimal to avoid unnecessary context expansion.

## Repository-State Interpretation
State categories:
- Clean: no tracked/untracked changes affecting workflow safety
- Dirty: local modifications present
- Ambiguous: detached HEAD, missing upstream context, inconsistent refs, unresolved merge state, or unknown remote state

Ambiguous state must trigger stop.

## Morning Sync Knowledge
- Requires clean working tree.
- Verifies task-branch eligibility.
- Sync source is dev.
- If dev did not advance, merge may be skipped.
- If merge attempted, conflict must halt workflow.
- No auto-conflict resolution.
- Post-merge quality gate is mandatory.

## Night Sync Knowledge
- Requires task-branch eligibility.
- Detects whether changes exist.
- Applies safety checks before staging/commit.
- Prevents commit/push on failed safety checks.
- Commit message must summarize actual work.
- No commit when no changes.
- Pushes current task branch only.
- Does not auto-merge feature to dev.
- Does not push dev.
- Does not auto-delete task branch.

## Safety Knowledge
Canonical policy source: .claude/rules/branching.md and .claude/rules/safety.md define authoritative branch/safety rules; this section is shared execution guidance.

- Never use destructive remediation to force success.
- Disallow hard reset, aggressive clean, and force push unless explicitly requested and approved.
- Stop on secret or forbidden-file detection.

## Verification Knowledge
Minimum verifications:
- Branch validity
- Repository-state validity
- Merge outcome (if merge occurred)
- Test result status
- Push outcome (for night sync)

Reference verification sequence:
- .claude/hooks/quality-gate.md

## Operational Command Patterns
Useful command patterns retained from legacy workflow knowledge:
- Ensure origin URL is expected team repository.
- Fetch latest dev before morning merge evaluation.
- Merge origin/dev into current task branch only when required.
- Stage only intended files for commit.
- Push current task branch and verify remote update.

Exact command selection is context-dependent and must obey canonical rule files.

## Outputs
The agent should produce explicit status reports for:
- Morning success
- Night success
- Night no-op
- Stopped workflow

## Non-Goals
- No trigger routing.
- No canonical policy ownership.
- No instruction to run destructive recovery.

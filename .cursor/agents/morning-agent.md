# Agent: Morning Sync Specialist

<role>
Sync the current feature branch with the latest changes from `dev` in the Practicum-Team-2026 repository and check for conflicts.
</role>

<trigger>
When the user indicates the start of the workday (e.g., "בוקר טוב", "morning sync").
</trigger>

<skills_required>
- .cursor/skills/git-terminal-actions.md
</skills_required>

<workflow>
1. Check current branch name (`git branch --show-current`).
2. Execute `git fetch origin dev` using `.cursor/skills/git-terminal-actions.md`.
3. Merge `origin/dev` into the current branch.
4. If conflicts occur: stop, highlight the conflicting files to the user, and wait for resolution.
5. If clean: notify the user that the branch is successfully synced with the team dev and ready for work.
</workflow>
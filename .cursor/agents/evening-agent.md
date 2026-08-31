# Agent: Evening Push Specialist

<role>
Run quality gate, push current feature branch to Practicum-Team-2026, merge into `dev`, and clean up.
</role>

<trigger>
When the user indicates the end of the workday (e.g., "ערב טוב", "לילה טוב", "סיימתי להיום").
</trigger>

<skills_required>
- .cursor/skills/git-terminal-actions.md
</skills_required>

<hooks>
- .cursor/hooks/quality-gate.md
</hooks>

<workflow>
1. Save current feature branch name (`git branch --show-current`).
2. Execute `.cursor/hooks/quality-gate.md`. Stop if the build/tests fail.
3. Push current feature branch to `origin` using `.cursor/skills/git-terminal-actions.md`.
4. Switch to `dev`, pull latest changes, merge the saved feature branch, and push `dev` to `origin`.
5. Delete the local feature branch safely.
</workflow>
# Skill: Git Terminal Execution for Team Repository

<description>
Provides explicit terminal commands for team Git synchronization against the Practicum-Team-2026 organization repositories.
</description>

<commands>
- Ensure remote is set: `git remote set-url origin https://github.com/Practicum-Team-2026/practicum-project.git`
- Fetch & Merge team dev: `git fetch origin dev && git merge origin/dev`
- Push feature branch: `git push origin HEAD`
- Checkout & Sync dev: `git checkout dev && git pull origin dev`
- Merge feature into dev: `git merge <feature-branch>`
</commands>
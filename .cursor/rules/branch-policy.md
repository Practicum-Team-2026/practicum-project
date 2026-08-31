# Rule: Git Branch Policy

<rules>
1. `main` / `dev`: Integration branches. No direct feature development or commits directly into them.
2. `feature/*`: Every small task or fix must be developed in a new, dedicated local feature branch created from `dev`.
3. Daily sync: Always pull and merge from `dev` at the start of the day to prevent conflicts.
4. Cleanup: Always delete local feature branches after a successful merge into `dev`.
</rules>
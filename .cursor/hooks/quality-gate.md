# Hook: Quality Gate

<description>
Ensures code compilation, tests, and basic linting pass before pushing or merging code.
</description>

<steps>
1. Run local build / test checks.
2. If any error or failing test is detected, abort the push/merge process immediately and report the error to the user.
3. If clean, proceed with the Git workflow.
</steps>
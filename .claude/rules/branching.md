# Branching Rules

## Branch Roles
- main: stable integration/release branch.
- dev: team integration branch.
- feature/<task>: canonical task-branch pattern for daily development.
- Equivalent approved task naming patterns may be allowed only with explicit developer approval.

## Daily Workflow Eligibility
For morning_sync and night_sync:
- Allowed: task branches only.
- Disallowed: main.
- Disallowed: dev.
- Disallowed: unknown, detached, or ambiguous branch identity.

## Stop Requirements
The workflow must stop immediately when:
- current branch is main
- current branch is dev
- branch identity cannot be determined confidently
- branch is not eligible for daily workflow operations

## Branch Behavior Expectations
- Developer performs daily work on task branch.
- Morning sync updates the task branch from dev when needed.
- Night sync commits and pushes only from the task branch.
- Integration from task branch into dev is a separate explicit workflow, not an implicit night_sync side effect.
- Task branch cleanup (deletion) is allowed only after successful integration to dev is verified.

## Protected Branch Constraint
- Daily workflows must never perform direct commit, merge, or push operations on main.
- Daily workflows must never perform direct commit, merge, or push operations on dev.
- Integration into dev or release branching from main belongs to separate controlled workflows.

## Notes
Branch-policy exceptions require explicit developer approval and should not be assumed automatically.
This file is canonical branch-policy authority for Claude workflow governance.

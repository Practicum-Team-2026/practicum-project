# GitHub Daily Sync Skill

## Overview
This skill defines the operational logic for daily developer synchronization with GitHub.

## Workflows

### 1. Morning Workflow ("בוקר טוב")
When the user indicates the start of the workday:
1. Trigger the morning synchronization tool (`git_morning_sync`).
2. Fetch latest changes from the `dev` branch.
3. Merge `origin/dev` into the current working branch.
4. Report the outcome clearly to the user.

### 2. Evening Workflow ("סיימתי להיום")
When the user indicates the end of the workday:
1. Prompt for or extract a summary of completed tasks.
2. Trigger the evening push tool (`git_evening_push`) with a structured commit message.
3. Automatically open a Pull Request to merge the feature branch into `dev` using `create_pull_request`.
4. Return the Pull Request URL to the user.
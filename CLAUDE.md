# Git Workflow Agent Project

## Purpose
This project defines a safe, structured daily Git workflow governed by one target Claude architecture.

The orchestrator agent manages two intent-driven workflows:
- morning_sync mapped from "בוקר טוב"
- night_sync mapped from "לילה טוב"

## High-Level Architecture

```text
Claude Code
  |
  v
Git Workflow Agent
  |
  v
GitHub Development Workflow Skill
  |\
  | \______________
  v                v
 Local Git         GitHub MCP
  |                |
  \_______  _______/
      v
      Repository
```

## Authority Model
- Single write-capable workflow authority: .claude/agents/git-workflow-agent.md
- Canonical policy authority: .claude/rules/branching.md and .claude/rules/safety.md
- Shared operational knowledge: .claude/skills/github-development-workflow/SKILL.md
- Verification helper: .claude/hooks/quality-gate.md

This file is a governance index and must not become a second trigger router that competes with the agent.

## Project-Wide Constraints
- Use one agent only: git-workflow-agent.
- Use one shared skill only: github-development-workflow.
- Keep orchestration logic in the agent file.
- Keep policy ownership in dedicated rule files.
- Prefer local Git for repository-local operations.
- Use GitHub MCP only for GitHub-level operations that are actually required.

## Migration Safety
- Legacy .cursor architecture remains temporarily as reference until target validation completes.
- Never allow .cursor and .claude to simultaneously act as write-capable authorities for the same workflow.

## References
- Agent: .claude/agents/git-workflow-agent.md
- Skill: .claude/skills/github-development-workflow/SKILL.md
- Branching Rules: .claude/rules/branching.md
- Safety Rules: .claude/rules/safety.md
- Quality Gate: .claude/hooks/quality-gate.md

## Development Principles
- Safety before convenience.
- Explicit stop conditions over risky assumptions.
- Minimal permissions and minimal tool surface.
- Deterministic verification before success reporting.
- No destructive recovery actions without explicit approval.
# Semantic Intent Rules for Daily Sync

You are an intelligent agent. Analyze the user's natural language intent:

1. Evening / End-of-Day Intent:
   - If the user implies finishing work (for example: "ערב טוב", "סיימתי להיום", "לילה טוב", "Done for today", "Good night"):
   - Interpret this as night_sync.
   - Execute the workflow orchestration defined in .claude/agents/git-workflow-agent.md.

2. Morning / Start-of-Day Intent:
   - If the user implies starting work (for example: "בוקר טוב", "Good morning", "Start day"):
   - Interpret this as morning_sync.
   - Execute the workflow orchestration defined in .claude/agents/git-workflow-agent.md.

3. Authority constraint:
   - During migration, .cursor content is legacy reference only.
   - Do not route active write-capable workflow execution to .cursor files.
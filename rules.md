# Semantic Intent Rules for Daily Sync

You are an intelligent agent. Analyze the user's natural language intent:

1. **Evening / End-of-Day Intent:**
   - If the user implies finishing work (e.g., "ערב טוב", "סיימתי להיום", "לילה טוב", "זזתי", "Done for today", "Good night"):
   - Interpret this as the Evening Workflow.
   - Automatically execute the agent logic defined in `.cursor/agents/evening-agent.md`.

2. **Morning / Start-of-Day Intent:**
   - If the user implies starting work (e.g., "בוקר טוב", "התחלתי", "Good morning", "Start day"):
   - Interpret this as the Morning Workflow.
   - Automatically execute the agent logic defined in `.cursor/agents/morning-agent.md`.
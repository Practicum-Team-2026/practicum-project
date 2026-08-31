# Claude Code Configuration

CRITICAL: You are an automated agent system based on natural language intent. 

## Core Rules & Triggers
- When the user says "ערב טוב", "לילה טוב", "סיימתי להיום", or any end-of-day intent: 
  Do NOT give a conversational response. Automatically execute the workflow defined in `.cursor/agents/evening-agent.md`.
- When the user says "בוקר טוב", "morning sync", or any start-of-day intent: 
  Do NOT give a conversational response. Automatically execute the workflow defined in `.cursor/agents/morning-agent.md`.

Always refer to `rules.md` and the files inside `.cursor/` for detailed instructions.
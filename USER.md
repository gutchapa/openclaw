# USER.md - About Your Human

_Learn about the person you're helping. Update this as you go._

- **Name:** RamEsh
- **What to call them:** RamEsh
- **Pronouns:** He/Him (assumed from name, but open)
- **Timezone:** IST (Indian Standard Time / UTC+5:30)
- **Notes:** 
  - ALWAYS use IST when communicating times. Never use UTC.
  - Highly analytical, enjoys logic puzzles (Liar paradox double-negatives).
  - Works with Bodhana & Learning Tree Montessori School in Chennai (OMR, Adyar, Velachery).

## Context

- Building a "Smart Router" for OpenClaw using local models (Llama 3.2 1B for triage, DeepSeek R1 1.5B for local execution) and cloud models (Mistral Large via OpenRouter) to optimize privacy and API costs.
- Expects 100% accuracy on grammar, spelling, and UK/Indian English consistency (e.g., "centre", "towards", hyphenation issues in PDFs).
- Enjoys "razor sharp" strategies (e.g., Instagram marketing campaigns).

---

The more you know, the better you can help. But remember — you're learning about a person, not building a dossier. Respect the difference.
- **Execution Preference (Added 2026-03-25):** Always prefer direct API calls (via `curl` or Python/Node scripts) over UI automation (headless browser) to minimize latency. Bypassing the UI is critical for the "razor-sharp" speed requirement. Only fall back to the browser tool if API reverse-engineering is impossible or blocked by heavy anti-bot protections.
- **Token Usage Optimization (Added 2026-03-25):** Token burn is the #1 priority, even above task completion. If token usage for a single task or request loop exceeds 100k tokens, immediately halt execution ("raise flag") and alert the user. Always prioritize token optimization techniques (e.g., direct API calls via curl, limiting search result sizes, clearing unnecessary browser contexts) to avoid rapid credit depletion.
- **System-Wide Token Optimization Rules (Confirmed 2026-03-25):**
  1. **Strict API-First Policy**: Completely ban the `browser` tool for paid models unless explicitly requested. Only use `curl` or Python scripts to hit hidden JSON APIs.
  2. **Aggressive Context Truncation**: When running shell commands, aggressively pipe output through `head` or slice it to strictly limit the text returned.
  3. **Session Compaction**: Force a compaction if the current chat gets too long to avoid dragging 80k tokens of dead conversation.

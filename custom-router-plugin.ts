import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "custom-router",
  name: "Smart Router",
  description: "Smart Context Engine Middleware with Ollama Triage",
  configSchema: {},
  register(api) {
    api.on("gateway_start", () => {
      console.log("[SmartRouter] Ready to route context using local Ollama (tinydolphin).");
    });

    api.on("before_prompt_build", async (event) => {
      const messages = event.messages as any[];
      if (!messages || messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      const prompt = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : JSON.stringify(lastMessage.content || "");
      
      // Step 0: EMERGENCY TOKEN BLOAT FIX (Intercept massive tool results)
      if (lastMessage.role === 'tool' || lastMessage.role === 'user') {
        const isMassivePayload = prompt.length > 50000; // ~12k tokens
        if (isMassivePayload) {
          console.log(`[SmartRouter] 🚨 Massive payload detected (${prompt.length} chars). Forcing history strip!`);
          
          const stripped = messages.filter((m, i) => 
            m.role === 'system' || 
            m === lastMessage || 
            i === messages.length - 2
          );
          
          messages.length = 0;
          messages.push(...stripped);
          return;
        }
      }

      if (lastMessage.role !== 'user') return;
      
      // Step 1: Privacy check override
      if (/confidential|secret|internal|ssn/i.test(prompt)) {
        console.log("[SmartRouter] 🔒 Sensitive data detected. Dropping history to force local constraints.");
        const stripped = messages.filter((m: any) => m.role === 'system' || m === lastMessage);
        messages.length = 0;
        messages.push(...stripped);
        return;
      }

      // Step 2: Semantic Triage via Ollama
      try {
        const triagePrompt = `Evaluate if this query can be answered by a simple local AI without past conversation history (e.g. summarization, formatting, simple logic, IP address). \nIf it requires internet access, deep factual knowledge, complex coding, or past chat history context, reply NO.\nQuery: "${prompt}"\nCan it be handled locally without context? Reply YES or NO.`;
        
        console.log("[SmartRouter] Asking local Ollama for semantic triage...");
        
        const res = await fetch("http://host.docker.internal:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "tinydolphin",
            prompt: triagePrompt,
            system: "You are a strict routing AI. You must reply with exactly one word: 'YES' or 'NO'.",
            stream: false,
            options: { num_predict: 10 }
          })
        });

        if (res.ok) {
          const data = await res.json() as any;
          const responseText = (data.response || "").toUpperCase();
          const canHandleLocally = responseText.includes("YES");
          
          if (canHandleLocally) {
            console.log("[SmartRouter] ✅ Ollama Triage says YES. Dropping 179k context history.");
            const stripped = messages.filter((m: any) => m.role === 'system' || m === lastMessage);
            messages.length = 0;
            messages.push(...stripped);
          } else {
            console.log(`[SmartRouter] ❌ Ollama Triage says NO (${responseText}). Keeping full context for Cloud routing.`);
          }
        } else {
          console.error("[SmartRouter] Ollama triage failed with status:", res.status);
        }
      } catch(e) {
        console.error("[SmartRouter] Ollama triage network error:", e);
      }
    });
  }
});

const { getLlama, LlamaChatSession } = require("node-llama-cpp");

module.exports = {
  id: "custom-router-plugin",
  name: "Smart Router",
  version: "1.0.0",
  
  async register(api) {
    let llamaCore = null;
    let triageModel = null;
    let triageContext = null;

    api.on("gateway_start", async () => {
      console.log("[SmartRouter] Loading local Llama 3.2 1B model for semantic triage...");
      try {
        llamaCore = await getLlama();
        const modelPath = "/home/node/.node-llama-cpp/models/Llama-3.2-1B-Instruct-Q4_K_M.gguf";
        triageModel = await llamaCore.loadModel({ modelPath });
        triageContext = await triageModel.createContext();
        console.log("[SmartRouter] Llama 3.2 Triage Model loaded successfully.");
      } catch (e) {
        console.error("[SmartRouter] Failed to load triage model:", e);
      }
    });

    api.on("before_prompt_build", async (event, ctx) => {
      const messages = event.messages;
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      const prompt = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content || "");
      
      // Step 0: EMERGENCY TOKEN BLOAT FIX (Intercept massive tool results)
      if (lastMessage.role === 'tool' || lastMessage.role === 'user') {
          const isMassivePayload = prompt.length > 50000; // ~12k tokens
          if (isMassivePayload) {
              console.log(`[SmartRouter] 🚨 Massive payload detected (${prompt.length} chars). Forcing history strip!`);
              
              // Find the system prompt and keep only that + this last message (and maybe the preceding assistant tool call)
              const newMessages = messages.filter((m, i) => 
                  m.role === 'system' || 
                  m === lastMessage || 
                  i === messages.length - 2
              );
              
              // Mutate the original array!
              messages.length = 0;
              messages.push(...newMessages);
              return;
          }
      }

      if (lastMessage.role !== 'user') return;
      
      // Step 1: Privacy check override
      if (/confidential|secret|internal|ssn/i.test(prompt)) {
          console.log("[SmartRouter] 🔒 Sensitive data detected. Dropping history to force local constraints.");
          const newMessages = messages.filter(m => m.role === 'system' || m === lastMessage);
          messages.length = 0;
          messages.push(...newMessages);
          return;
      }

      // Step 2: Semantic Triage via Llama 3.2 1B
      if (triageContext) {
          try {
            const session = new LlamaChatSession({ 
                contextSequence: triageContext.getSequence(),
                systemPrompt: "You are a strict routing AI. You must reply with exactly one word: 'YES' or 'NO'."
            });
            const triagePrompt = `Evaluate if this query can be answered by a simple local AI without past conversation history (e.g. summarization, formatting, simple logic, IP address). \nIf it requires internet access, deep factual knowledge, complex coding, or past chat history context, reply NO.\nQuery: "${prompt}"\nCan it be handled locally without context? Reply YES or NO.`;
            
            const response = await session.prompt(triagePrompt, { maxTokens: 10 });
            const canHandleLocally = response.toUpperCase().includes("YES");
            
            if (canHandleLocally) {
                console.log("[SmartRouter] ✅ Llama 3.2 Triage says YES. Dropping 179k context history.");
                const newMessages = messages.filter(m => m.role === 'system' || m === lastMessage);
                messages.length = 0;
                messages.push(...newMessages);
            } else {
                console.log("[SmartRouter] ❌ Llama 3.2 Triage says NO. Keeping full context for Cloud routing.");
            }
          } catch(e) {
            console.error("[SmartRouter] Llama triage failed:", e);
          }
      }
    });
  }
};

import { getLlama, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import os from "os";

// We'll initialize Llama once globally to avoid reloading the model for every Triage step.
let llamaCore = null;
let triageModel = null;
let triageContext = null;

let execModel = null;
let execContext = null;

async function getLlamaCore() {
    if (!llamaCore) {
        llamaCore = await getLlama();
    }
    return llamaCore;
}

// 1. Semantic Triage Router (Llama 3.2 1B Instruct)
async function askLlamaIfItCanHandle(prompt) {
    const llama = await getLlamaCore();
    if (!triageModel) {
        const modelPath = "/home/dell/.node-llama-cpp/models/Llama-3.2-1B-Instruct-Q4_K_M.gguf";
        console.log("--> 🚀 Loading Llama 3.2 1B (Triage Classifier)...");
        triageModel = await llama.loadModel({ modelPath });
        triageContext = await triageModel.createContext();
    }
    
    const session = new LlamaChatSession({ 
        contextSequence: triageContext.getSequence(),
        systemPrompt: "You are a strict routing AI. You must reply with exactly one word: 'YES' or 'NO'." 
    });
    
    const triagePrompt = `Evaluate if this query can be answered by a simple local AI (e.g. summarization, formatting, simple logic, IP address, text manipulation, grammar). 
If it requires internet access, deep factual knowledge, complex coding, or massive context, reply NO.
Query: "${prompt}"
Can it be handled locally? Reply YES or NO.`;
    
    console.log("--> 🧠 Asking Llama 3.2 Triage (Fast CPU inference)...");
    const response = await session.prompt(triagePrompt, { maxTokens: 10 });
    
    console.log(`[Llama 3.2 1B Output]: ${response.trim()}`);
    
    if (response.toUpperCase().includes("YES")) return true;
    return false;
}

// 2. Local DeepSeek Execution (DeepSeek R1 1.5B)
async function runLocal(prompt) {
    console.log("--> 🛡️ ROUTING TO LOCAL EXECUTION (DeepSeek 1.5B via CPU)...");
    const llama = await getLlamaCore();
    if (!execModel) {
        const modelPath = "/home/dell/.openclaw/workspace/models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf";
        console.log("--> 🚀 Loading DeepSeek 1.5B (Heavy Reasoner)...");
        execModel = await llama.loadModel({ modelPath });
        execContext = await execModel.createContext();
    }
    
    const session = new LlamaChatSession({ contextSequence: execContext.getSequence() });
    
    console.log("--> ⏳ Local DeepSeek inference started (max 500 tokens)...");
    const response = await session.prompt(prompt, { maxTokens: 500 });
    
    let cleaned = response;
    if (cleaned.includes("</think>")) {
        cleaned = cleaned.split("</think>")[1];
    }
    
    if (!cleaned || cleaned.trim() === "") {
         return "[The local model could not complete its reasoning within 500 tokens.]";
    }
    return cleaned.trim();
}

// 3. Cloud Mistral Execution (Mistral Large via OpenRouter)
async function runCloud(prompt) {
    console.log("--> ☁️ ROUTING TO CLOUD (Mistral Large via OpenRouter API)...");
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY environment variable is missing!");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-large-2407",
            messages: [{ role: "user", content: prompt }]
        })
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function main() {
    const prompt = process.argv.slice(2).join(" ");
    if (!prompt) {
        console.log("Usage: node smart_router.mjs <your prompt here>");
        return;
    }
    
    try {
        let route = "UNKNOWN";
        // Step 1: Privacy Override Check
        if (/confidential|secret|internal|ssn/i.test(prompt)) {
            console.log("🔒 Sensitive data detected. Forcing LOCAL execution.");
            route = "LOCAL";
        } else {
            // Step 2: Semantic Triage Step using Llama 3.2 1B
            const canHandleLocally = await askLlamaIfItCanHandle(prompt);
            if (canHandleLocally) {
                console.log("✅ Llama 3.2 Triage answered YES. Routing to LOCAL DeepSeek.");
                route = "LOCAL";
            } else {
                console.log("❌ Llama 3.2 Triage answered NO. Routing to CLOUD Mistral.");
                route = "CLOUD";
            }
        }
        
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Execution timed out after 90 seconds.")), 90000);
        });
        
        let executionPromise;
        if (route === "LOCAL") {
            executionPromise = runLocal(prompt);
        } else {
            executionPromise = runCloud(prompt);
        }
        
        const result = await Promise.race([executionPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        
        console.log("\n================ [ RESULT ] ================\n");
        console.log(result);
        console.log("\n============================================");
    } catch (e) {
        console.error("\n================ [ ERROR ] ================\n");
        console.error(e.message);
        console.error("\n============================================");
    } finally {
        process.exit(0);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

# 🧠 Multi-Agent Smart Router Plugin for OpenClaw

## 📌 What is this?
A custom Context Engine plugin for OpenClaw that permanently fixes "Context Bloat" and API latency when using cloud LLMs (like Mistral Large or GPT-4o) over an orchestration framework. 

By default, OpenClaw sends your **entire conversation history** (often 150k+ tokens) to the cloud for every single query. If you ask a simple question like "What is your IP?", the cloud model has to read 300 pages of text before answering, causing 10-15 seconds of latency and massive API costs.

## ⚙️ How It Works (The "Semantic Triage" Architecture)
This plugin implements a local, multi-agent routing step:
1. **The Triage Agent (Llama 3.2 1B Instruct):** Runs instantly on your local CPU. It analyzes your query and decides (with a simple YES/NO) if the question requires past conversation history to answer.
2. **The NO Path (Fast Track):** If Llama 3.2 decides context is not needed, the plugin violently strips the 150k+ token history from the OpenClaw payload. Only your isolated query is sent to Mistral Large, resulting in sub-second API response times and near-zero cost.
3. **The YES Path:** If the query references past context (e.g. "Draft a response to that email"), the plugin passes the full conversation history to the cloud LLM.
4. **The Privacy Override:** If your query contains sensitive keywords (`confidential`, `secret`, `internal`, `ssn`), the plugin forces execution on a local reasoning model (like DeepSeek 1.5B), guaranteeing your private data never leaves the Docker container.

## 🚀 Setup & Installation

### 1. Download the Triage Model
You must download a tiny, CPU-friendly classifier model. We recommend **Llama 3.2 1B Instruct (GGUF format)**.
```bash
# In your OpenClaw Docker container
mkdir -p /home/node/.node-llama-cpp/models
curl -L "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf" -o /home/node/.node-llama-cpp/models/Llama-3.2-1B-Instruct-Q4_K_M.gguf
```

### 2. Install the Plugin
Copy the `custom-router-plugin.ts` file from your workspace into OpenClaw's official plugins directory:
```bash
cp /home/node/.openclaw/workspace/custom-router-plugin.ts ~/.openclaw/plugins/
```

### 3. Restart the Container
OpenClaw must recompile the TypeScript plugin and hook it into the core daemon router. From your host machine:
```bash
docker restart <openclaw-container-id>
```

## 📝 The Code (`custom-router-plugin.ts`)
The full TypeScript source code for the plugin is maintained locally in your workspace at `/home/node/.openclaw/workspace/custom-router-plugin.ts`.

## 🧠 Why Llama 3.2 1B instead of DeepSeek?
We originally tested DeepSeek R1 1.5B for the Triage step. However, reasoning models (R1) are hardwired to generate `<think>` chains and cannot reliably follow strict formatting instructions like "Output exactly one word: YES or NO". Llama 3.2 1B perfectly obeys zero-shot formatting constraints while parsing language in under 1 second on a CPU.

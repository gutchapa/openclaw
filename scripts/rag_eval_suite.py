import os
import time
import statistics
import json
import re
from secrets_loader import get_google_api_key

# LangChain Imports
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_core.runnables import RunnableConfig
import shutil
import langfuse
from ragas import evaluate
from ragas.metrics import Faithfulness, AnswerRelevancy, AnswerCorrectness, ContextPrecision

# Configuration
os.environ["GOOGLE_API_KEY"] = get_google_api_key()
GT_FILE = "/root/.openclaw/workspace/RAG_GROUND_TRUTH.json"

class RAGEvaluator:
    def __init__(self):
        print("DEBUG: Initializing HYBRID RAGEvaluator...")
        self.results = []
        self.latencies = []
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        persist_directory = "/root/.openclaw/workspace/chroma_db_semantic_v3"
        
        try:
            from langchain_chroma import Chroma
        except ImportError:
            from langchain_community.vectorstores import Chroma
            
        self.vectorstore = Chroma(persist_directory=persist_directory, embedding_function=self.embeddings)
        self.llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", temperature=0, convert_system_message_to_human=True)
        self.judge_llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", temperature=0)

        prompt = ChatPromptTemplate.from_messages([
            ("human", """You are a helpful assistant. Context: {context} Question: {input}""")
        ])
        self.document_chain = create_stuff_documents_chain(self.llm, prompt)
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 20})

        with open(GT_FILE, 'r') as f:
            self.ground_truth = json.load(f)

    def calculate_semantic_similarity(self, text1, text2):
        if not text1 or not text2: return 0.0
        try:
            embeddings = self.embeddings.embed_documents([text1, text2])
            return sum(e1 * e2 for e1, e2 in zip(embeddings[0], embeddings[1]))
        except: return 0.0

    def evaluate_query(self, gt_entry):
        query = gt_entry['query']
        time.sleep(1)
        start_time = time.time()
        
        # 1. Pipeline
        retrieved_docs = self.retriever.invoke(query)
        answer = self.document_chain.invoke({"input": query, "context": retrieved_docs})
        latency = time.time() - start_time
        
        # 2. Hybrid Evaluation
        gt_answer = gt_entry.get('ground_truth_answer', '')
        sem_sim = self.calculate_semantic_similarity(answer, gt_answer)
        
        # LLM Judge with reasoning
        judge_score, reasoning = self.run_advanced_judge(query, answer, gt_answer)
        
        # FINAL CORRELATION: (Similarity + Logical Correctness)
        # If Sim is high but Judge is low, it flags a "Phrasing mismatch"
        hybrid_score = (sem_sim * 0.5) + (judge_score * 0.5)
        
        self.results.append({
            "sem_sim": sem_sim,
            "judge_score": judge_score,
            "hybrid": hybrid_score,
            "latency": latency
        })
        
        print(f"\n🧪 Testing: '{query[:50]}...'")
        print(f"   ⭐ Semantic Similarity: {sem_sim:.3f}")
        print(f"   ⚖️ LLM Judge Score:     {judge_score:.2f}")
        print(f"   📝 Judge Reasoning:     {reasoning}")
        print(f"   🚀 HYBRID CORRECTNESS:  {hybrid_score*100:.1f}%")
        return self.results[-1]

    def run_advanced_judge(self, query, answer, gt):
        prompt = f"""
        Compare Generated Answer to Ground Truth. 
        Score 1.0 if they mean the same thing logically. 
        Score 0.0 ONLY if they contradict.
        
        Query: {query}
        Generated: {answer}
        Ground Truth: {gt}
        
        Return JSON ONLY: {{"score": float, "reasoning": "text"}}
        """
        try:
            res = self.judge_llm.invoke(prompt).content
            res_clean = res.replace("```json", "").replace("```", "").strip()
            data = json.loads(res_clean)
            return float(data.get("score", 0.0)), data.get("reasoning", "N/A")
        except Exception as e:
            return 0.0, f"Judge Error: {str(e)}"

    def print_summary(self):
        print(f"\n========================================")
        print(f"📊 **RAG HYBRID CORRELATION REPORT**")
        print(f"========================================")
        print(f"1. Avg Semantic Similarity: {statistics.mean(r['sem_sim'] for r in self.results):.3f}")
        print(f"2. Avg LLM Judge Score:     {statistics.mean(r['judge_score'] for r in self.results):.3f}")
        print(f"3. FINAL CORRELATED SCORE:  {statistics.mean(r['hybrid'] for r in self.results)*100:.1f}%")
        print(f"========================================")

if __name__ == "__main__":
    evaluator = RAGEvaluator()
    for gt in evaluator.ground_truth: evaluator.evaluate_query(gt)
    evaluator.print_summary()

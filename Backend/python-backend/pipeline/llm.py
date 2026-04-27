import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY", "")
LLM_ENDPOINT = os.getenv("LLM_ENDPOINT", "https://api.featherless.ai/v1/chat/completions")

def generate_answer(question: str, context_chunks: list) -> str:
    if not context_chunks:
        return "You do not have authorized data to answer the question."
        
    context_text = "\n\n---\n\n".join([f"Document {c.get('doc_id')}:\n{c.get('text')}" for c in context_chunks])
    
    prompt = f"""You are a secure AI assistant. Answer the user's question using ONLY the provided document context below.
If the context does not contain the answer, or if you cannot find enough information, reply exactly with: "You do not have authorized data to answer the question."
Do not use outside knowledge.

CONTEXT:
{context_text}

QUESTION:
{question}
"""

    if not FEATHERLESS_API_KEY:
        logger.warning("FEATHERLESS_API_KEY not set. Returning prompt instead of calling LLM.")
        return f"[MOCK LLM RESPONSE - Set FEATHERLESS_API_KEY to connect to real model]\n\nBased on the context, here is the answer to: {question}"

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {FEATHERLESS_API_KEY}"
        }
        
        payload = {
            "model": "google/gemma-4-31B-it",
            "messages": [
                {"role": "system", "content": "You are a secure AI assistant. Answer using only the provided context."},
                {"role": "user", "content": prompt}
            ],
            "presence_penalty": 0.5,
            "frequency_penalty": 0.5,
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 500  # increased to 500 for better answers, but matching other parameters
        }

        response = requests.post(LLM_ENDPOINT, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
            
        return str(data)
        
    except Exception as e:
        logger.error(f"LLM API failed: {e}")
        return f"Error contacting LLM: {str(e)}"

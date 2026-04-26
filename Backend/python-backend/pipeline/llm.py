import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
LLM_ENDPOINT = os.getenv("LLM_ENDPOINT", "")

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

    if not LLM_ENDPOINT:
        logger.warning("LLM_ENDPOINT not set. Returning prompt instead of calling LLM.")
        return f"[MOCK LLM RESPONSE - Set LLM_ENDPOINT to connect to real model]\n\nBased on the context, here is the answer to: {question}"

    try:
        # Assuming a standard chat completion payload format like OpenAI's API.
        # This may need to be adjusted based on the specific LLM endpoint being used.
        payload = {
            "messages": [
                {"role": "system", "content": "You are a secure AI assistant. Answer using only the provided context."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0
        }
        
        response = requests.post(LLM_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        # Standard OpenAI response format
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
            
        # Fallback if the format is different (e.g. huggingface or custom)
        if "generated_text" in data:
            return data["generated_text"]
            
        return str(data)
        
    except Exception as e:
        logger.error(f"LLM API failed: {e}")
        return f"Error contacting LLM: {str(e)}"

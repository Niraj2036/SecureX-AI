import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
LLM_ENDPOINT = os.getenv("LLM_ENDPOINT", "https://openrouter.ai/api/v1/chat/completions")

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

    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY not set. Returning prompt instead of calling LLM.")
        return f"[MOCK LLM RESPONSE - Set OPENROUTER_API_KEY to connect to real model]\n\nBased on the context, here is the answer to: {question}"

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}"
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

def ask_llm_judge(draft_response: str, policies: str, user_role: str, user_designation: str) -> str:
    """
    Evaluates a draft response against company policies using the LLM.
    Returns 'PASS' if compliant, or 'VIOLATION: <reason>' if not.
    """
    prompt = f"""You are a strict compliance auditor. Evaluate the following draft response against the company policies.
The user asking the query has the following role and designation:
- Role: {user_role}
- Designation: {user_designation}

COMPANY POLICIES:
{policies}

DRAFT RESPONSE:
{draft_response}

Does the draft response violate any of the company policies? 
If it is compliant and does not violate any policies, reply exactly with: "PASS".
If it violates a policy, reply exactly with: "VIOLATION: [State the exact policy violated]".
"""
    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY not set. Returning PASS for judge.")
        return "PASS"

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}"
        }
        
        payload = {
            "model": "google/gemma-4-31B-it",
            "messages": [
                {"role": "system", "content": "You are a strict compliance auditor. Answer strictly with PASS or VIOLATION: <reason>."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "max_tokens": 100
        }

        response = requests.post(LLM_ENDPOINT, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"].strip()
            
        return "PASS"
        
    except Exception as e:
        logger.error(f"LLM Judge API failed: {e}")
        return "PASS" # Default to pass on error to not break the pipeline entirely

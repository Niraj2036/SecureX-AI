import os
import re
import glob
from scipy.spatial.distance import cosine
import logging

from pipeline.llm import ask_llm_judge

logger = logging.getLogger(__name__)

POLICIES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "policies")

def load_company_policies() -> str:
    """Loads all markdown policies from the policies directory."""
    policies_text = ""
    if not os.path.exists(POLICIES_DIR):
        return policies_text
    
    for filepath in glob.glob(os.path.join(POLICIES_DIR, "*.md")):
        with open(filepath, "r", encoding="utf-8") as f:
            policies_text += f"\n--- {os.path.basename(filepath)} ---\n"
            policies_text += f.read() + "\n"
    return policies_text

def privacy_token_check(response_text: str) -> dict:
    """
    Checks the response for pseudonymization tokens.
    For demonstration, if we find more than 5 PII tokens, we block.
    """
    # Look for tokens like USR_xxxx, FIN_xxxx, etc.
    tokens = re.findall(r"[A-Z]{3}_\d+", response_text)
    
    if len(tokens) > 5:
        return {"status": "VIOLATION", "reason": f"Too many sensitive tokens exposed ({len(tokens)} found)."}
    return {"status": "PASS", "reason": f"Token count ({len(tokens)}) is within acceptable limits."}

import math

def semantic_verification(response_embedding: list, query_embedding: list, chunk_embeddings: list) -> dict:
    """
    Computes grounding and relevance scores.
    """
    if not response_embedding or not query_embedding or not chunk_embeddings:
        return {"grounding_score": 0.0, "relevance_score": 0.0, "status": "FAIL"}

    # Relevance score
    relevance_dist = cosine(response_embedding, query_embedding)
    relevance_score = 1.0 - relevance_dist if not math.isnan(relevance_dist) else 0.0

    # Grounding score (max cosine similarity with any chunk)
    max_grounding = 0.0
    for chunk_emb in chunk_embeddings:
        dist = cosine(response_embedding, chunk_emb)
        sim = 1.0 - dist
        if sim > max_grounding:
            max_grounding = sim

    # Using default thresholds as proposed
    grounding_pass = max_grounding >= 0.75
    relevance_pass = relevance_score >= 0.70

    status = "PASS"
    if not grounding_pass:
        status = "FAIL"
    elif not relevance_pass:
        status = "FLAG"

    return {
        "grounding_score": max_grounding,
        "relevance_score": relevance_score,
        "status": status
    }

def run_compliance_pipeline(raw_answer: str, question_embedding: list, chunks: list, user_details, response_embedding: list) -> dict:
    """
    Runs the full compliance pipeline:
    1. Guardrail Policy Check
    2. Privacy Token Check
    3. Semantic Verification
    """
    policies = load_company_policies()
    
    # 1. Company Policy Guardrail (LLM-as-a-Judge)
    user_role = user_details.role if hasattr(user_details, 'role') else "Unknown Role"
    user_designation = user_details.designation if hasattr(user_details, 'designation') else "Unknown Designation"
    
    judge_result = ask_llm_judge(raw_answer, policies, user_role, user_designation)
    if "VIOLATION" in judge_result.upper():
        return {
            "terminal_decision": "BLOCK",
            "action_taken": f"Response blocked due to Company Policy violation: {judge_result}",
            "guardrail_result": judge_result,
            "privacy_result": "SKIPPED",
            "grounding_score": None,
            "relevance_score": None
        }

    # 2. Privacy Token Check
    privacy_res = privacy_token_check(raw_answer)
    if privacy_res["status"] == "VIOLATION":
        return {
            "terminal_decision": "BLOCK",
            "action_taken": f"Response blocked due to Data Privacy rules: {privacy_res['reason']}",
            "guardrail_result": "PASS",
            "privacy_result": privacy_res["status"],
            "grounding_score": None,
            "relevance_score": None
        }

    # 3. Semantic Verification
    chunk_embeddings = [c["embedding"] for c in chunks if "embedding" in c]
    semantic_res = semantic_verification(response_embedding, question_embedding, chunk_embeddings)
    
    terminal_decision = "ALLOW"
    action_taken = "Response allowed."
    if semantic_res["status"] == "FAIL":
        terminal_decision = "BLOCK"
        action_taken = "Response blocked. Insufficient authorized data to answer (hallucination risk)."
    elif semantic_res["status"] == "FLAG":
        terminal_decision = "FLAG"
        action_taken = "[WARNING: Low relevance detected]\n" + raw_answer

    return {
        "terminal_decision": terminal_decision,
        "action_taken": action_taken,
        "guardrail_result": "PASS",
        "privacy_result": "PASS",
        "grounding_score": semantic_res["grounding_score"],
        "relevance_score": semantic_res["relevance_score"]
    }

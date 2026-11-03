import os
import re
import glob
import math
import logging
import numpy as np

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

def _cosine_similarity(vec_a: list, vec_b: list) -> float:
    if not vec_a or not vec_b:
        return 0.0
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    sim = np.dot(a, b) / (norm_a * norm_b)
    if np.isnan(sim):
        return 0.0
    return float(sim)

GROUNDING_THRESHOLD = float(os.getenv("GROUNDING_THRESHOLD", "0.60"))
RELEVANCE_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.50"))

def semantic_verification(response_embedding: list, query_embedding: list, chunk_embeddings: list) -> dict:
    """
    Computes grounding and relevance scores.
    """
    if not response_embedding or not query_embedding or not chunk_embeddings:
        logger.warning(
            f"Semantic verification missing embeddings: "
            f"response={bool(response_embedding)}, query={bool(query_embedding)}, chunks={len(chunk_embeddings) if chunk_embeddings else 0}"
        )
        return {"grounding_score": 0.0, "relevance_score": 0.0, "status": "FAIL"}

    # Relevance score
    relevance_score = _cosine_similarity(response_embedding, query_embedding)

    # Grounding score (max cosine similarity with any chunk)
    max_grounding = 0.0
    for chunk_emb in chunk_embeddings:
        if chunk_emb:
            sim = _cosine_similarity(response_embedding, chunk_emb)
            if sim > max_grounding:
                max_grounding = sim

    grounding_pass = max_grounding >= GROUNDING_THRESHOLD
    relevance_pass = relevance_score >= RELEVANCE_THRESHOLD

    status = "PASS"
    if not grounding_pass:
        status = "FAIL"
    elif not relevance_pass:
        status = "FLAG"

    logger.info(
        f"Semantic verification — Max Grounding: {max_grounding:.4f} (req >= {GROUNDING_THRESHOLD}), "
        f"Relevance: {relevance_score:.4f} (req >= {RELEVANCE_THRESHOLD}) -> Status: {status}"
    )

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
    # If the answer is already a standard authorization refusal, pass it through directly
    if "you do not have authorized data to answer" in raw_answer.lower():
        return {
            "terminal_decision": "ALLOW",
            "action_taken": raw_answer,
            "guardrail_result": "PASS",
            "privacy_result": "PASS",
            "grounding_score": 0.0,
            "relevance_score": 0.0
        }

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
    chunk_embeddings = [c["embedding"] for c in chunks if isinstance(c, dict) and "embedding" in c and c["embedding"]]
    semantic_res = semantic_verification(response_embedding, question_embedding, chunk_embeddings)
    
    terminal_decision = "ALLOW"
    action_taken = raw_answer
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

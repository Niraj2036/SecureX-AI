# SecureX AI - Comprehensive Compliance Module Flow (V2)

Based on your feedback, a purely mathematical or token-based check isn't enough. An enterprise AI must understand and obey actual **Company Policies** (e.g., "Never disclose executive salaries", "Do not give legal advice unless authorized", "Always decline questions about internal audits"). 

Here is an updated, robust flow that introduces an **AI Policy Guardrail** to enforce real-world company policies alongside data privacy and factual grounding.

## Complete Execution Flow

### 1. Pre-requisite: Retrieval & Generation
- **Input Query:** User submits a query.
- **Retrieval:** The system retrieves vector chunks based on Attribute-Based Access Control (ABAC) filters.
- **Draft Generation:** The Domain-Specific LLM generates a *draft* response based on the authorized chunks.

---

### 2. Stage 1: Company Policy Guardrail (LLM-as-a-Judge)
Before the user sees the response, it is evaluated against the organization's written policies.
- **Policy Retrieval:** The system fetches the active written **Company Policies** for the specific department or organization (e.g., from a database).
- **Guardrail Evaluation:** A fast evaluator LLM (or a strict prompt to the existing LLM) is given the draft response and the Company Policies. It is asked a simple binary question: *"Does this response violate any of the following company policies? Yes or No. If Yes, specify which one."*
- **Decision:**
  - If **Yes** (Violation): The system issues a **BLOCK**. The draft is discarded, and the user receives a message: *"This request cannot be fulfilled as it violates company policy: [Policy Name]."*
  - If **No** (Compliant): The response moves to Stage 2.

---

### 3. Stage 2: Data Privacy & Token Engine
This stage ensures sensitive data (Personally Identifiable Information - PII) isn't accidentally leaked in large quantities.
- **Token Extraction:** The engine scans the draft response for pseudonymization tokens (e.g., `USR_8891`, `FIN_202`).
- **Rule Check:** It checks technical rules (e.g., "Do not expose more than 2 financial tokens in a single response to Level 1 employees").
- **Decision:**
  - If a rule is violated: **BLOCK** (or redact the tokens).
  - If compliant: Pass to Stage 3.

---

### 4. Stage 3: Semantic Verification (Anti-Hallucination)
This ensures the AI didn't make things up (hallucinate) and actually answered the question.
- **Grounding Check:** Calculates Cosine Similarity between the **Response Embedding** and **Retrieved Context Embeddings**. (Did the AI use the provided documents?)
- **Relevance Check:** Calculates Cosine Similarity between the **Response Embedding** and the **Original Query Embedding**. (Did the AI answer the user's question?)
- **Threshold Evaluation:** If the scores are below a certain threshold (e.g., 0.75), the response is flagged or blocked for being ungrounded.

---

### 5. Decision Routing & Audit
| Policy Guardrail | Privacy Token Check | Grounding/Relevance | Terminal Decision | Action Taken |
| :--- | :--- | :--- | :--- | :--- |
| **Violation** | *Skipped* | *Skipped* | **BLOCK** | "Response blocked due to Company Policy violation." |
| **Pass** | **Violation** | *Skipped* | **BLOCK** | "Response blocked due to Data Privacy rules." |
| **Pass** | **Pass** | **Fail** | **FLAG/BLOCK** | "Insufficient authorized data to answer." |
| **Pass** | **Pass** | **Pass** | **ALLOW** | Deliver response safely to user. |

- **Audit Log:** Every step (Policy evaluated, Tokens found, Similarity Scores) is saved to the Governance Database to prove to auditors *why* an answer was allowed or blocked.

import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pydantic import ValidationError

from models.schemas import IngestPayload
from pipeline.orchestrator import run_pipeline

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)


@app.route("/ingest", methods=["POST"])
def ingest():
    try:
        body = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        payload = IngestPayload(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation failed", "details": e.errors()}), 422

    if not payload.documents:
        return jsonify({"error": "No documents provided"}), 400

    logger.info(
        f"Ingestion request from user={payload.user_details.id}, "
        f"org={payload.user_details.orgId}, "
        f"documents={len(payload.documents)}"
    )

    try:
        result = run_pipeline(payload)
    except Exception as e:
        logger.exception("Pipeline failed")
        return jsonify({"error": "Pipeline execution failed", "details": str(e)}), 500

    status_code = 200 if result["failed"] == 0 else 207
    return jsonify(result), status_code


@app.route("/query", methods=["POST"])
def query():
    try:
        body = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        from models.schemas import QueryPayload
        payload = QueryPayload(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation failed", "details": e.errors()}), 422

    user = payload.user_details
    question = payload.question

    logger.info(f"Query request from user={user.id}, org={user.orgId}")

    try:
        from pipeline.embedder import embed_texts
        import uuid
        
        # 1. Authorize: Get doc_ids user is allowed to see
        from pipeline.retriever import get_authorized_doc_ids, retrieve_chunks
        authorized_docs = get_authorized_doc_ids(user)
        authorized_doc_ids = [d["doc_id"] for d in authorized_docs]
        
        if not authorized_doc_ids:
            # User has no documents, skip embedding and vector search
            answer = "You do not have authorized data to answer the question."
            chunks = []
        else:
            # 2. Embed the question
            req_id = f"query_{uuid.uuid4().hex[:8]}"
            # embed_texts expects a list and returns a list of embeddings
            question_embeddings = embed_texts([question], req_id)
            if not question_embeddings:
                raise ValueError("Failed to embed the question.")
            question_embedding = question_embeddings[0]
            
            # 3. Retrieve chunks with vector search (filtered by access)
            chunks = retrieve_chunks(question_embedding, authorized_doc_ids, limit=5)
            
            # 4. Generate answer
            from pipeline.llm import generate_answer
            answer = generate_answer(question, chunks)
            
        # 5. Log audit
        from pipeline.auditor import log_query
        query_id = log_query(user, question, answer, chunks)
        
        return jsonify({
            "query_id": query_id,
            "answer": answer,
            "sources": [{"chunk_id": c.get("chunk_id"), "doc_id": c.get("doc_id")} for c in chunks]
        }), 200

    except Exception as e:
        logger.exception("Query failed")
        return jsonify({"error": "Query execution failed", "details": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

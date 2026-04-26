import uuid
import logging
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

from models.schemas import IngestPayload, Document, UserDetails
from pipeline.extractor import extract_text
from pipeline.anonymizer import anonymize_text
from pipeline.chunker import chunk_text
from pipeline.embedder import embed_texts
from db.mongo import get_chunks_collection, get_documents_collection

logger = logging.getLogger(__name__)

MAX_WORKERS = 6


def run_pipeline(payload: IngestPayload) -> dict:
    job_id = str(uuid.uuid4())
    user = payload.user_details
    documents = payload.documents

    results = []
    errors = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_doc = {}
        for doc in documents:
            future = executor.submit(_process_single_document, doc, user, job_id)
            future_to_doc[future] = doc

        for future in as_completed(future_to_doc):
            doc = future_to_doc[future]
            try:
                result = future.result()
                results.append(result)
                logger.info(f"Document '{doc.name}' processed: {result['chunks_created']} chunks")
            except Exception as e:
                logger.error(f"Document '{doc.name}' failed: {e}")
                errors.append({
                    "document": doc.name,
                    "error": str(e)
                })

    return {
        "job_id": job_id,
        "status": "completed" if not errors else "completed_with_errors",
        "total_documents": len(documents),
        "processed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }


def _process_single_document(doc: Document, user: UserDetails, job_id: str) -> dict:
    doc_id = str(uuid.uuid4())

    doc_metadata = {
        "doc_id": doc_id,
        "doc_name": doc.name,
        "url": doc.url,
        "access": doc.access.model_dump(),
        "org_id": user.orgId,
        "created_by": user.id,
        "job_id": job_id,
        "created_at": datetime.now(timezone.utc)
    }
    get_documents_collection().insert_one(doc_metadata)

    logger.info(f"[{doc_id}] Extracting text from '{doc.name}'...")
    raw_text = extract_text(doc.url, doc.name)

    if not raw_text or not raw_text.strip():
        raise ValueError(f"No text could be extracted from document '{doc.name}'")

    logger.info(f"[{doc_id}] Extracted {len(raw_text)} characters. Anonymizing...")
    anonymized_text = anonymize_text(raw_text, user.orgId, doc_id)

    logger.info(f"[{doc_id}] Chunking text...")
    chunks = chunk_text(anonymized_text)

    if not chunks:
        raise ValueError(f"No chunks produced from document '{doc.name}'")

    logger.info(f"[{doc_id}] Generated {len(chunks)} chunks. Embedding...")
    chunk_texts = [c["text"] for c in chunks]

    request_id = f"{doc_id}_{uuid.uuid4().hex[:8]}"
    embeddings = embed_texts(chunk_texts, request_id)

    logger.info(f"[{doc_id}] Storing {len(chunks)} chunks in MongoDB...")
    chunks_col = get_chunks_collection()

    chunk_docs = []
    for chunk, embedding in zip(chunks, embeddings):
        chunk_doc = {
            "chunk_id": str(uuid.uuid4()),
            "doc_id": doc_id,
            "chunk_seq": chunk["chunk_seq"],
            "text": chunk["text"],
            "token_count": chunk["token_count"],
            "embedding": embedding,
            "created_at": datetime.now(timezone.utc),
        }
        chunk_docs.append(chunk_doc)

    if chunk_docs:
        chunks_col.insert_many(chunk_docs)

    return {
        "doc_id": doc_id,
        "doc_name": doc.name,
        "chunks_created": len(chunk_docs),
        "total_tokens": sum(c["token_count"] for c in chunks),
    }

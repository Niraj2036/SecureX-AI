import uuid
from datetime import datetime, timezone
from models.schemas import UserDetails
from db.mongo import get_audit_collection

def log_query(user: UserDetails, question: str, answer: str, accessed_chunks: list) -> str:
    col = get_audit_collection()
    
    query_id = str(uuid.uuid4())
    
    unique_doc_ids = list({c.get("doc_id") for c in accessed_chunks if c.get("doc_id")})
    
    audit_doc = {
        "query_id": query_id,
        "user_details": user.model_dump(),
        "question": question,
        "answer": answer,
        "accessed_doc_ids": unique_doc_ids,
        "num_chunks_retrieved": len(accessed_chunks),
        "timestamp": datetime.now(timezone.utc)
    }
    
    col.insert_one(audit_doc)
    return query_id

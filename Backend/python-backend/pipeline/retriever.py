import logging
from typing import List
from models.schemas import UserDetails
from db.mongo import get_documents_collection, get_chunks_collection

logger = logging.getLogger(__name__)

def get_authorized_doc_ids(user: UserDetails) -> List[str]:
    """
    Find all document IDs that this user is authorized to access based on their
    employee ID, team, department, or role.
    """
    col = get_documents_collection()
    
    query = {
        "org_id": user.orgId,
        "$or": [
            {"access.employees": user.id},
            {"access.teams": user.teamId},
            {"access.depts": user.deptId},
            {"access.roles": user.role}
        ]
    }
    
    # If the user is an admin or we allow empty access arrays as public, we could adjust logic here.
    # For now, strict matching: user must be explicitly in one of the access lists.
    
    docs = col.find(query, {"doc_id": 1, "doc_name": 1})
    
    authorized = []
    for d in docs:
        authorized.append({
            "doc_id": d["doc_id"],
            "doc_name": d.get("doc_name", "Unknown")
        })
        
    return authorized

def retrieve_chunks(query_embedding: List[float], authorized_doc_ids: List[str], limit: int = 5) -> List[dict]:
    """
    Perform an Atlas Vector Search on the chunks collection, filtering ONLY by authorized docs.
    """
    if not authorized_doc_ids:
        return []
        
    col = get_chunks_collection()
    
    # Standard Atlas Vector Search pipeline
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": limit * 10,
                "limit": limit,
                "filter": {
                    "doc_id": { "$in": authorized_doc_ids }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "chunk_id": 1,
                "doc_id": 1,
                "text": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }
    ]
    
    try:
        results = list(col.aggregate(pipeline))
        return results
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        # Fallback to standard match if vector index doesn't exist yet (for testing)
        # Note: Standard match won't sort by similarity!
        logger.warning("Falling back to standard find (no semantic similarity)")
        fallback_docs = list(col.find({"doc_id": {"$in": authorized_doc_ids}}, {"_id": 0, "text": 1, "doc_id": 1, "chunk_id": 1}).limit(limit))
        return fallback_docs

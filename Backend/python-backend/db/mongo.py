import os
import certifi
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None


def get_client():
    global _client
    if _client is None:
        uri = os.getenv("MONGO_URI")
        if not uri:
            raise RuntimeError("MONGO_URI not set in environment")
        _client = MongoClient(uri, tls=True, tlsAllowInvalidCertificates=True)
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()["securex"]
    return _db


def get_chunks_collection():
    col = get_db()["chunks"]
    col.create_index([("doc_id", ASCENDING), ("chunk_seq", ASCENDING)])
    return col


def get_pseudonyms_collection():
    col = get_db()["pseudonyms"]
    col.create_index([("original_name", ASCENDING)], unique=True)
    return col


def get_documents_collection():
    col = get_db()["documents"]
    col.create_index([("doc_id", ASCENDING)], unique=True)
    return col


def get_audit_collection():
    col = get_db()["audit"]
    return col

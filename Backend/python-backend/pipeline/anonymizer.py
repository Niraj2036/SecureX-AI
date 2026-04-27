import spacy
from db.mongo import get_pseudonyms_collection

_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_lg")
    return _nlp


def anonymize_text(text: str, org_id: str, doc_id: str) -> str:
    nlp = _get_nlp()
    doc = nlp(text)

    person_entities = []
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            person_entities.append(ent)

    if not person_entities:
        return text

    unique_names = list({ent.text for ent in person_entities})

    pseudonym_map = {}
    for name in unique_names:
        pseudonym_map[name] = _get_or_create_pseudonym(name)

    sorted_entities = sorted(person_entities, key=lambda e: e.start_char, reverse=True)

    anonymized = text
    for ent in sorted_entities:
        pseudo = pseudonym_map[ent.text]
        anonymized = anonymized[:ent.start_char] + pseudo + anonymized[ent.end_char:]

    return anonymized


def _get_or_create_pseudonym(original_name: str) -> str:
    col = get_pseudonyms_collection()

    existing = col.find_one({"original_name": original_name})

    if existing:
        return existing["pseudonym"]

    count = col.count_documents({})
    pseudonym = f"PERSON_{count + 1}"

    col.insert_one({
        "original_name": original_name,
        "pseudonym": pseudonym,
    })

    return pseudonym

def anonymize_query(query_text: str) -> str:
    """Replaces original names in the query with their pseudonyms from the DB."""
    col = get_pseudonyms_collection()
    # Fetch all, sort by length of original_name descending to replace longer matches first
    all_pseudos = list(col.find({}, {"original_name": 1, "pseudonym": 1, "_id": 0}))
    all_pseudos.sort(key=lambda x: len(x["original_name"]), reverse=True)
    
    anonymized = query_text
    for p in all_pseudos:
        # Simple string replacement (case-sensitive for exact name matches)
        anonymized = anonymized.replace(p["original_name"], p["pseudonym"])
        
    return anonymized

import re

def deanonymize_text(text: str) -> str:
    """Finds PERSON_N pseudonyms in text and replaces them with the original names."""
    if not text:
        return text
        
    col = get_pseudonyms_collection()
    
    # Find all unique PERSON_N matches in the text
    matches = set(re.findall(r"PERSON_\d+", text))
    
    if not matches:
        return text
        
    # Fetch original names from DB for those matches
    pseudos = list(col.find({"pseudonym": {"$in": list(matches)}}))
    pseudo_map = {p["pseudonym"]: p["original_name"] for p in pseudos}
    
    deanonymized = text
    # Replace starting with longest string or just replace directly
    for pseudo, original in pseudo_map.items():
        deanonymized = deanonymized.replace(pseudo, original)
        
    return deanonymized

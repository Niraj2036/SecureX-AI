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

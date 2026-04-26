import tiktoken
import spacy

_nlp = None
_encoder = None

TARGET_TOKENS = 200
OVERLAP_RATIO = 0.20
OVERLAP_TOKENS = int(TARGET_TOKENS * OVERLAP_RATIO)


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def _get_encoder():
    global _encoder
    if _encoder is None:
        _encoder = tiktoken.get_encoding("cl100k_base")
    return _encoder


def count_tokens(text: str) -> int:
    return len(_get_encoder().encode(text))


def chunk_text(text: str) -> list:
    nlp = _get_nlp()
    nlp.max_length = max(len(text) + 1000, nlp.max_length)
    doc = nlp(text)

    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

    if not sentences:
        return []

    sentence_tokens = []
    for sent in sentences:
        tok_count = count_tokens(sent)
        sentence_tokens.append((sent, tok_count))

    chunks = []
    chunk_seq = 0
    i = 0

    while i < len(sentence_tokens):
        current_chunk_sentences = []
        current_token_count = 0

        while i < len(sentence_tokens):
            sent_text, sent_tokens = sentence_tokens[i]

            if current_token_count + sent_tokens > TARGET_TOKENS and current_chunk_sentences:
                break

            current_chunk_sentences.append((sent_text, sent_tokens))
            current_token_count += sent_tokens
            i += 1

        chunk_text_str = " ".join([s[0] for s in current_chunk_sentences])

        chunks.append({
            "chunk_seq": chunk_seq,
            "text": chunk_text_str,
            "token_count": current_token_count
        })
        chunk_seq += 1

        overlap_token_budget = OVERLAP_TOKENS
        overlap_sentences = 0

        for j in range(len(current_chunk_sentences) - 1, -1, -1):
            _, stok = current_chunk_sentences[j]
            if overlap_token_budget - stok >= 0:
                overlap_token_budget -= stok
                overlap_sentences += 1
            else:
                break

        if overlap_sentences > 0 and i < len(sentence_tokens):
            i -= overlap_sentences

    return chunks

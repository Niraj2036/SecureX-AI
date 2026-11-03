# import tiktoken
# import spacy

# _nlp = None
# _encoder = None

# TARGET_TOKENS = 200
# OVERLAP_RATIO = 0.20
# OVERLAP_TOKENS = int(TARGET_TOKENS * OVERLAP_RATIO)


# def _get_nlp():
#     global _nlp
#     if _nlp is None:
#         _nlp = spacy.load("en_core_web_sm")
#     return _nlp


# def _get_encoder():
#     global _encoder
#     if _encoder is None:
#         _encoder = tiktoken.get_encoding("cl100k_base")
#     return _encoder


# def count_tokens(text: str) -> int:
#     return len(_get_encoder().encode(text))


# def chunk_text(text: str, row_size: int = 25, structured_rows: bool = False) -> list:
#     if structured_rows:
#         return _chunk_rows(text, row_size)

#     nlp = _get_nlp()
#     nlp.max_length = max(len(text) + 1000, nlp.max_length)
#     doc = nlp(text)

#     sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

#     if not sentences:
#         return []

#     sentence_tokens = []
#     for sent in sentences:
#         tok_count = count_tokens(sent)
#         sentence_tokens.append((sent, tok_count))

#     chunks = []
#     chunk_seq = 0
#     i = 0

#     while i < len(sentence_tokens):
#         current_chunk_sentences = []
#         current_token_count = 0

#         while i < len(sentence_tokens):
#             sent_text, sent_tokens = sentence_tokens[i]

#             if current_token_count + sent_tokens > TARGET_TOKENS and current_chunk_sentences:
#                 break

#             current_chunk_sentences.append((sent_text, sent_tokens))
#             current_token_count += sent_tokens
#             i += 1

#         chunk_text_str = " ".join([s[0] for s in current_chunk_sentences])

#         chunks.append({
#             "chunk_seq": chunk_seq,
#             "text": chunk_text_str,
#             "token_count": current_token_count
#         })
#         chunk_seq += 1

#         overlap_token_budget = OVERLAP_TOKENS
#         overlap_sentences = 0

#         for j in range(len(current_chunk_sentences) - 1, -1, -1):
#             _, stok = current_chunk_sentences[j]
#             if overlap_token_budget - stok >= 0:
#                 overlap_token_budget -= stok
#                 overlap_sentences += 1
#             else:
#                 break

#         if overlap_sentences > 0 and i < len(sentence_tokens):
#             i -= overlap_sentences

#     return chunks


# def _chunk_rows(text: str, row_size: int) -> list:
#     if row_size < 1:
#         raise ValueError("row_size must be a positive integer")

#     rows = [line.strip() for line in text.splitlines() if line.strip()]
#     if not rows:
#         return []

#     chunks = []
#     chunk_seq = 0

#     for start in range(0, len(rows), row_size):
#         row_block = rows[start:start + row_size]
#         chunk_text_str = "\n".join(row_block)

#         chunks.append({
#             "chunk_seq": chunk_seq,
#             "text": chunk_text_str,
#             "token_count": count_tokens(chunk_text_str),
#             "row_count": len(row_block),
#         })
#         chunk_seq += 1

#     return chunks
import re
import tiktoken

_encoder = None

TARGET_TOKENS = 200
OVERLAP_RATIO = 0.20
OVERLAP_TOKENS = int(TARGET_TOKENS * OVERLAP_RATIO)


def _get_encoder():
    global _encoder

    if _encoder is None:
        _encoder = tiktoken.get_encoding("cl100k_base")

    return _encoder


def count_tokens(text: str) -> int:
    return len(_get_encoder().encode(text))


def chunk_text(
    text: str,
    row_size: int = 25,
    structured_rows: bool = False
) -> list:

    if structured_rows:
        return _chunk_rows(text, row_size)

    # Simple sentence splitting
    sentences = [
        s.strip()
        for s in re.split(r'(?<=[.!?])\s+', text)
        if s.strip()
    ]

    if not sentences:
        return []

    sentence_tokens = [
        (sent, count_tokens(sent))
        for sent in sentences
    ]

    chunks = []
    chunk_seq = 0
    i = 0

    while i < len(sentence_tokens):
        start_i = i
        current_chunk = []
        current_tokens = 0

        while i < len(sentence_tokens):
            sent_text, sent_tokens = sentence_tokens[i]

            if (
                current_tokens + sent_tokens > TARGET_TOKENS
                and current_chunk
            ):
                break

            current_chunk.append((sent_text, sent_tokens))
            current_tokens += sent_tokens
            i += 1

        chunk_text_str = " ".join(
            s[0] for s in current_chunk
        )

        chunks.append({
            "chunk_seq": chunk_seq,
            "text": chunk_text_str,
            "token_count": current_tokens
        })

        chunk_seq += 1

        # 20% overlap calculation
        overlap_tokens = OVERLAP_TOKENS
        overlap_sentences = 0

        for j in range(len(current_chunk) - 1, -1, -1):
            _, stok = current_chunk[j]

            if overlap_tokens - stok >= 0:
                overlap_tokens -= stok
                overlap_sentences += 1
            else:
                break

        # Never rewind the entire chunk; ensure at least 1 sentence of forward progress
        max_overlap = max(0, len(current_chunk) - 1)
        overlap_sentences = min(overlap_sentences, max_overlap)

        if overlap_sentences > 0 and i < len(sentence_tokens):
            i -= overlap_sentences

        # Safety guard to prevent infinite loops under any conditions
        if i <= start_i:
            i = start_i + 1

    return chunks


def _chunk_rows(text: str, row_size: int) -> list:

    if row_size < 1:
        raise ValueError(
            "row_size must be a positive integer"
        )

    rows = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not rows:
        return []

    chunks = []
    chunk_seq = 0

    for start in range(0, len(rows), row_size):

        row_block = rows[start:start + row_size]

        chunk_text_str = "\n".join(row_block)

        chunks.append({
            "chunk_seq": chunk_seq,
            "text": chunk_text_str,
            "token_count": count_tokens(chunk_text_str),
            "row_count": len(row_block),
        })

        chunk_seq += 1

    return chunks



    
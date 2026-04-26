import io
import tempfile
import requests
import fitz
from docx import Document as DocxDocument


def extract_text(url: str, doc_name: str) -> str:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    content = response.content

    ext = _detect_extension(doc_name, response.headers.get("content-type", ""))

    if ext == "pdf":
        return _extract_pdf(content)
    elif ext == "docx":
        return _extract_docx(content)
    elif ext == "txt":
        return content.decode("utf-8", errors="replace")
    else:
        return _extract_pdf(content)


def _detect_extension(name: str, content_type: str) -> str:
    name_lower = name.lower()
    if name_lower.endswith(".pdf"):
        return "pdf"
    elif name_lower.endswith(".docx"):
        return "docx"
    elif name_lower.endswith(".txt"):
        return "txt"

    ct = content_type.lower()
    if "pdf" in ct:
        return "pdf"
    elif "wordprocessingml" in ct or "msword" in ct:
        return "docx"
    elif "text/plain" in ct:
        return "txt"

    return "pdf"


def _extract_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    pages = []
    for page in doc:
        text = page.get_text("text")
        if text.strip():
            pages.append(text)
    doc.close()
    return "\n\n".join(pages)


def _extract_docx(content: bytes) -> str:
    buf = io.BytesIO(content)
    doc = DocxDocument(buf)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)

import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self):
        # We split text into chunks of 1000 characters, with 200 characters of overlap.
        # Overlap ensures that a sentence split between two chunks keeps its context.
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def extract_text_from_pdf(self, file_bytes: bytes) -> list:
        """
        Extracts all text from a PDF file using a temporary file.
        Returns a list of dicts containing text and page number.
        """
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            
        try:
            doc = fitz.open(tmp_path)
            pages_data = []
            for i, page in enumerate(doc):
                pages_data.append({
                    "text": page.get_text(),
                    "page": i + 1
                })
            return pages_data
        finally:
            doc.close()
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def chunk_text(self, pages_data: list) -> list:
        """
        Splits text into chunks while preserving page numbers.
        Returns a list of dicts.
        """
        chunks = []
        for p in pages_data:
            if not p["text"].strip():
                continue
            page_chunks = self.text_splitter.split_text(p["text"])
            for c in page_chunks:
                chunks.append({
                    "text": c,
                    "page": p["page"]
                })
        return chunks

document_processor = DocumentProcessor()

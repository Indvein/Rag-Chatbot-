from sqlalchemy.orm import Session
from models import DocumentChunk
from services.embedding_service import embedding_service
from typing import Tuple, List, Dict

class RAGService:
    def retrieve_context(self, query: str, db: Session, limit: int = 10) -> Tuple[str, List[Dict[str, str]]]:
        """
        Embeds the user's query and performs a similarity search 
        to find the most relevant chunks from the database.
        Returns a tuple of (context_string, list_of_sources).
        """
        # 1. Embed the query
        query_embedding = embedding_service.generate_embedding(query)
        
        # 2. Search pgvector using cosine distance (<=> operator)
        results = db.query(DocumentChunk).order_by(
            DocumentChunk.embedding.cosine_distance(query_embedding)
        ).limit(limit).all()
        
        # 3. Combine the retrieved text into a single context string
        context = "\n\n".join([chunk.text_content for chunk in results])
        
        # 4. Extract unique source filenames, page numbers, and text
        sources_dict = {}
        for chunk in results:
            if chunk.document:
                source_name = f"{chunk.document.filename} (Page {chunk.page_number})"
                if source_name not in sources_dict:
                    sources_dict[source_name] = chunk.text_content
                    
        sources = [{"name": name, "text": text} for name, text in sources_dict.items()]
        
        return context, sources

rag_service = RAGService()

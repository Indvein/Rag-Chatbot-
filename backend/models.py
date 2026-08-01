from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    content_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to chunks
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index = Column(Integer)
    page_number = Column(Integer, default=1)
    text_content = Column(Text)
    
    # The vector column storing the embeddings. all-MiniLM-L6-v2 produces 384 dimensions.
    embedding = Column(Vector(384))
    
    # Relationship back to the document
    document = relationship("Document", back_populates="chunks")

class IPTokenUsage(Base):
    __tablename__ = "ip_token_usage"

    ip_address = Column(String, primary_key=True, index=True)
    tokens_used = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


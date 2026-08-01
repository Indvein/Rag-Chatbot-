from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from models import Document, DocumentChunk
from services.document_processor import document_processor
from services.embedding_service import embedding_service

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("/")
async def list_documents(db: Session = Depends(get_db)):
    docs = (
        db.query(Document, func.count(DocumentChunk.id).label("chunk_count"))
        .outerjoin(DocumentChunk)
        .group_by(Document.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    result = []
    for d, chunk_count in docs:
        result.append({
            "id": d.id,
            "filename": d.filename,
            "uploaded_at": d.uploaded_at,
            "chunk_count": chunk_count
        })
    return result

@router.delete("/{doc_id}")
async def delete_document(doc_id: int, db: Session = Depends(get_db)):
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        db.delete(doc)
        db.commit()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported.")
    
    # Read the file bytes
    file_bytes = await file.read()
    
    try:
        # Extract text from the PDF with page numbers
        pages_data = document_processor.extract_text_from_pdf(file_bytes)
        
        # Split text into chunks
        chunks = document_processor.chunk_text(pages_data)
        
        # Save the Document metadata to the database
        db_document = Document(filename=file.filename, content_type=file.content_type)
        db.add(db_document)
        db.flush()
        
        # Generate embeddings in batches instead of one model call per chunk.
        chunk_texts = [chunk_data["text"] for chunk_data in chunks]
        embedding_vectors = embedding_service.generate_embeddings(chunk_texts)
        
        db_chunks = []
        for i, (chunk_data, embedding_vector) in enumerate(zip(chunks, embedding_vectors)):
            db_chunks.append(DocumentChunk(
                document_id=db_document.id,
                chunk_index=i,
                page_number=chunk_data["page"],
                text_content=chunk_data["text"],
                embedding=embedding_vector
            ))
        
        # Commit all the chunks to the database
        db.add_all(db_chunks)
        db.commit()
        db.refresh(db_document)
        
        return {
            "message": "Document processed successfully",
            "document_id": db_document.id,
            "total_chunks_created": len(chunks)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

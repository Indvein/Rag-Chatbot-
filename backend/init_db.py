import os
from database import engine, Base
import models
from sqlalchemy import text

def init_db():
    print("Initializing the database...")
    
    with engine.connect() as conn:
        # Enable the pgvector extension
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            print("pgvector extension is ready.")
        except Exception as e:
            print(f"Note: Could not automatically enable pgvector. Please enable it in the Supabase Dashboard under Database -> Extensions. Error: {e}")
    
    # Create the tables
    print("Creating tables (documents, document_chunks)...")
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()

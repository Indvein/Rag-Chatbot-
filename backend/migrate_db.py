from sqlalchemy import text
from database import engine

def migrate():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE document_chunks ADD COLUMN page_number INTEGER DEFAULT 1;"))
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed or already applied: {e}")

if __name__ == "__main__":
    migrate()

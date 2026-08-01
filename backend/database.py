import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in .env file. Please check your Supabase connection string.")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "?pgbouncer=true" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("?pgbouncer=true", "")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

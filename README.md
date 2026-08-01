# Enterprise AI Workspace

<img src="frontend/public/image.png" width="400" alt="Enterprise Workspace AI" />

## The Story & Use Case

This project addresses the challenge of information accessibility. Legal contracts, academic papers, and financial reports are often difficult to understand due to dense jargon and language barriers.

The AI Workspace is an Enterprise-grade RAG (Retrieval-Augmented Generation) application built to break down these barriers:
- Extracts and indexes text from complex PDF documents.
- Performs vector similarity search to find precise context.
- Translates and summarizes answers into English, Hindi, or Hinglish.
- Integrates browser-native Text-to-Speech (TTS) for audio accessibility.

## Features

- **Universal API Architecture**: Integrates `litellm` for dynamic AI provider routing. Users can bring their own API keys to connect with OpenAI, Anthropic, Google Gemini, or Groq.
- **Enterprise RAG System**: Utilizes `sentence-transformers` for intelligent chunking and Supabase `pgvector` for scalable semantic similarity search.
- **Multilingual Support & Voice Synthesis**: Automatically translates complex document answers and reads them aloud.
- **Transparent Citations**: Mitigates AI hallucinations by providing strict source tracking. Users can hover over citations to view the exact raw text extracted from the source PDF.
- **SaaS Onboarding & Trial**: Implements an IP-based token tracking system, offering a built-in 5,000 token free trial before requiring a custom API key.

## The Global Knowledge Base (Test Subject)

The live deployment operates as a Global Shared Knowledge Base to serve as a demonstrative test subject.
- Documents uploaded to the workspace are indexed in the central Supabase vector store.
- Visitors can query the AI against existing documents without uploading their own.
- Visitors can upload new documents or delete existing ones to curate the workspace environment.

## Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy + Alembic
- Supabase (PostgreSQL + pgvector)
- LiteLLM (Universal LLM Routing)
- PyPDF & Sentence-Transformers

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui

## Run it Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
GROQ_API_KEY=gsk_your_groq_key_here
```

Initialize the database and run the server:
```bash
python init_db.py
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

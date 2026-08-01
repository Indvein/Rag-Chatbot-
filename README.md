# 🚀 Enterprise AI Workspace

<img src="frontend/public/image.png" width="400" alt="Enterprise Workspace AI" />

## 📖 The Story & Use Case

This project was built to solve a real-world problem: **Information Accessibility**. 

Every day, people are confronted with incredibly dense, complex PDF documents—legal contracts, medical research, academic papers, and financial reports. For many, language barriers and technical jargon make these documents impossible to understand.

**The AI Workspace** is an Enterprise-grade RAG (Retrieval-Augmented Generation) tool that completely breaks down these barriers. By leveraging advanced vector similarity search, it allows users to upload any PDF and instantly chat with it. More importantly, it features native **Multilingual Support and Voice Synthesis**, translating complex documents into simple **English, Hindi, or Hinglish** and reading them aloud. 

It is designed to be an accessible, lightning-fast educational companion for anyone in the world.

---

## ✨ Features

- 🧠 **Lightning Fast Llama 3.1**: Powered by Groq's LPUs, delivering near-instant AI responses and deep document comprehension.
- 📚 **Enterprise RAG Architecture**: Uses `sentence-transformers` for intelligent document chunking and **Supabase `pgvector`** for semantic similarity search.
- 🌐 **Multilingual & Voice-Enabled**: Instantly translates answers into Hindi or Hinglish, complete with browser-native Text-to-Speech (TTS) to read answers aloud.
- 🔒 **BYOK SaaS Onboarding**: Features a true SaaS "Bring Your Own Key" architecture. Users can securely plug in their own Groq API keys, or utilize the built-in **5,000 Token IP-based Free Trial**!
- 🔗 **Transparent Citations**: AI hallucinations are mitigated through strict source tracking. Hover over any citation pill to view the exact, raw text extracted from the PDF.
- 🎨 **Stunning UI**: Built with React, TailwindCSS, and `shadcn/ui` components for a premium, responsive, and glassmorphism-inspired aesthetic.

---

## 🧪 The "Global Brain" Test Subject

The live deployment of this application currently operates as a **Global Shared Knowledge Base**. 

When you upload a document, it is added to the central Supabase vector store. This allows anyone visiting the site to immediately test the AI without needing to upload their own files! You can ask the AI about any of the existing documents in the workspace, upload your own to teach the AI something new, or use the delete button to manage and curate the workspace.

---

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy + Alembic
- Supabase (PostgreSQL + pgvector)
- Groq Cloud API (Llama 3.1)
- PyPDF & Sentence-Transformers (`all-MiniLM-L6-v2`)

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS + `shadcn/ui`
- React Markdown

---

## 💻 Run it Locally

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
Initialize the Database & Run:
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

Open `http://localhost:5173` in your browser and enjoy the workspace!

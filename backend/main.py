from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Workspace API",
    description="Backend for the AI Workspace",
    version="1.0.0"
)

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite dev server default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the AI Workspace API!"}

# Include routers
from routers import documents, chat
app.include_router(documents.router)
app.include_router(chat.router)

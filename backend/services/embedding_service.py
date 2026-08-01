import os

# These must be set before importing torch/sentence-transformers so native
# math libraries do not fan out across every CPU core for small requests.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import torch
from sentence_transformers import SentenceTransformer

torch.set_num_threads(1)
torch.set_num_interop_threads(1)

class EmbeddingService:
    def __init__(self):
        # We load the lightweight, free model here.
        # It downloads the first time it runs and caches it locally.
        print("Loading embedding model (all-MiniLM-L6-v2)...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded successfully!")

    def generate_embedding(self, text: str) -> list[float]:
        """
        Generates a 384-dimensional vector embedding for the given text.
        """
        # encode() returns a numpy array, we convert it to a standard python list
        # so it can be safely stored in the database.
        embedding = self.model.encode(text, show_progress_bar=False)
        return embedding.tolist()

    def generate_embeddings(self, texts: list[str], batch_size: int = 16) -> list[list[float]]:
        """
        Generates embeddings in batches. This is much faster and keeps CPU usage
        lower than calling encode once for every chunk.
        """
        if not texts:
            return []

        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
        )
        return embeddings.tolist()

# Create a singleton instance so we don't load the model into memory multiple times
embedding_service = EmbeddingService()

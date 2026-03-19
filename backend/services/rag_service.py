import os
import logging
import chromadb
from sentence_transformers import SentenceTransformer
import requests

logger = logging.getLogger(__name__)

# Initialize ChromaDB Local Client
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "ai_memory", "chroma")
os.makedirs(CHROMA_DB_PATH, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = chroma_client.get_or_create_collection(name="sentinel_knowledge_base")

# Load Fallback Local Embedder Lazy Loader
_local_embedder = None

def get_local_embedder():
    global _local_embedder
    if _local_embedder is None:
        logger.info("Loading sentence-transformers fallback...")
        _local_embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _local_embedder

NVIDIA_NIM_API_KEY = os.getenv("NVIDIA_NIM_API_KEY")

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Attempts to get embeddings using NVIDIA NIM API.
    Falls back to local sentence-transformers if failure or rate limit occurs.
    """
    if NVIDIA_NIM_API_KEY:
        try:
            # NVIDIA NV-EmbedQA E5 V5 (Free tier available)
            invoke_url = "https://ai.api.nvidia.com/v1/retrieval/nvidia/nv-embedqa-e5-v5"
            headers = {
                "Authorization": f"Bearer {NVIDIA_NIM_API_KEY}",
                "Accept": "application/json",
            }
            payload = {
                "input": texts,
                "input_type": "passage",
                "encoding_format": "float",
                "truncate": "NONE"
            }
            res = requests.post(invoke_url, headers=headers, json=payload, timeout=10)
            if res.ok:
                data = res.json()
                return [item["embedding"] for item in data.get("data", [])]
            else:
                logger.warning(f"NVIDIA NIM failed ({res.status_code}), triggering fallback.")
        except Exception as e:
            logger.error(f"NVIDIA NIM Exception: {e}")

    # Fallback Mechanism
    logger.info("Using local sentence-transformers fallback.")
    model = get_local_embedder()
    return model.encode(texts).tolist()

def chunk_text(text: str, word_limit: int = 500) -> list[str]:
    words = text.split()
    chunks = [" ".join(words[i:i + word_limit]) for i in range(0, len(words), word_limit)]
    return chunks

def deduplicate_and_store(article_id: str, title: str, content: str, url: str) -> dict:
    """
    Queries ChromaDB before saving. If similarity is > 85%, returns update loop signal.
    """
    chunks = chunk_text(content)
    if not chunks:
        return {"status": "empty"}

    embeddings = get_embeddings(chunks)

    # Check first chunk for severe duplication
    results = collection.query(
        query_embeddings=[embeddings[0]],
        n_results=1
    )

    if results["distances"] and results["distances"][0]:
        # ChromaDB uses L2 distance or Cosine (depending on setup).
        # We roughly map distance < 0.3 as > 85% similarity (heuristic)
        best_distance = results["distances"][0][0]
        if best_distance < 0.3:
            logger.warning(f"Semantic Deduplication Triggered! Distance: {best_distance}")
            return {
                "status": "duplicate",
                "confidence": 1.0 - best_distance,
                "target_article_id": results["metadatas"][0][0].get("article_id")
            }

    # Store in memory if unique
    ids = [f"{article_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"article_id": article_id, "title": title, "url": url} for _ in chunks]
    
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )

    return {"status": "unique"}

"""Text embedding utilities.

Provides a unified interface for generating text embeddings, shared by
pipelines.write_consumers and utils.reconciliation modules.

Uses sentence-transformers for real semantic vectors (384-dim).
Falls back to deterministic hash vectors when the model is unavailable
(same text produces the same vector, but without semantic similarity).
Model instances are globally cached to avoid repeated loading.
"""

import asyncio
import hashlib
import logging
from typing import List

logger = logging.getLogger(__name__)

# Global shared embedding model instance (lazy-loaded)
_embedding_model = None
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_EMBEDDING_DIM = 384


def _get_embedding_model(model_name: str = DEFAULT_EMBEDDING_MODEL):
    """Get or lazy-load the sentence-transformers model instance.

    Returns None on failure; callers should fall back to hash vectors.
    """
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer(model_name)
            logger.info("Loaded embedding model: %s", model_name)
        except Exception as e:
            logger.warning("Failed to load embedding model: %s", e)
            return None
    return _embedding_model


async def generate_embedding(
    text: str,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[float]:
    """Generate a text embedding vector.

    Uses sentence-transformers for real semantic vectors (384-dim).
    Falls back to deterministic hash vectors when the model is unavailable.

    Args:
        text: Text to embed.
        model_name: Model name (only used on first load).

    Returns:
        List of floats (default 384 dimensions).
    """
    model = _get_embedding_model(model_name)
    if model is not None:
        try:
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                None,
                lambda: model.encode(text, show_progress_bar=False),
            )
            return embedding.tolist()
        except Exception as e:
            logger.warning(
                "Embedding model failed, falling back to hash: %s", e
            )
    return _hash_embedding(text, DEFAULT_EMBEDDING_DIM)


async def generate_embeddings_batch(
    texts: List[str],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[List[float]]:
    """Generate embeddings for a batch of texts.

    Args:
        texts: List of texts to embed.
        model_name: Model name.

    Returns:
        List of embedding vectors.
    """
    if not texts:
        return []
    model = _get_embedding_model(model_name)
    if model is not None:
        try:
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None,
                lambda: model.encode(texts, show_progress_bar=False),
            )
            return embeddings.tolist()
        except Exception as e:
            logger.warning(
                "Batch embedding failed, falling back to hash: %s", e
            )
    return [_hash_embedding(t, DEFAULT_EMBEDDING_DIM) for t in texts]


def generate_embedding_sync(
    text: str, model_name: str = DEFAULT_EMBEDDING_MODEL
) -> List[float]:
    """Generate a text embedding synchronously.

    Used by Bytewax in synchronous contexts. Same behavior as generate_embedding().
    """
    model = _get_embedding_model(model_name)
    if model is not None:
        try:
            embedding = model.encode(text, show_progress_bar=False)
            return embedding.tolist()
        except Exception as e:
            logger.warning(
                "Sync embedding failed, falling back to hash: %s", e
            )
    return _hash_embedding(text, DEFAULT_EMBEDDING_DIM)


def _hash_embedding(
    text: str, dim: int = DEFAULT_EMBEDDING_DIM
) -> List[float]:
    """Generate a deterministic hash-based embedding (fallback only).

    Same text always produces the same vector, but vectors have no
    semantic similarity properties. Used only when the real model
    is unavailable.
    """
    hash_obj = hashlib.sha256(text.encode("utf-8"))
    hash_bytes = hash_obj.digest()
    return [(hash_bytes[i % 32] / 255.0 - 0.5) * 2 for i in range(dim)]


def reset_embedding_model() -> None:
    """Reset the global embedding model cache (for testing)."""
    global _embedding_model
    _embedding_model = None

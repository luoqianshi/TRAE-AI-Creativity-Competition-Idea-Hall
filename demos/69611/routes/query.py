"""Natural Language Query API — ask questions in plain language.

Translates NL questions to Cypher or ES queries, executes them, and returns
answers with citations.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from utils.auth import verify_api_key
from utils.query_translator import get_query_translator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intelligence", tags=["intelligence-query"])


@router.post("/ask")
async def ask_question(
    question: str = Query(
        ..., min_length=3, max_length=500,
        description="Natural language question",
    ),
    query_type: Optional[str] = Query(
        None,
        description='Force query type: "graph" or "search". Auto-detected if omitted.',
    ),
    _=Depends(verify_api_key),
):
    """Ask a natural language question about the intelligence data.

    Examples:
    - "What entities are related to OpenAI?"
    - "Recent news about AI regulation"
    - "Show me all critical events this week"
    - "What is the relationship between company A and company B?"
    - "Find documents mentioning supply chain disruptions"

    Returns structured result with generated query, raw data, and NL answer.
    """
    if query_type and query_type not in ("graph", "search"):
        raise HTTPException(
            status_code=400,
            detail='query_type must be "graph", "search", or null for auto-detect',
        )

    try:
        translator = get_query_translator()
        result = await translator.ask(question, query_type=query_type)
    except Exception as e:
        logger.error("Query translation failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Query processing failed: {str(e)[:200]}",
        )

    return {
        "question": result.question,
        "query_type": result.query_type,
        "generated_query": result.generated_query,
        "answer": result.answer,
        "sources": result.sources,
        "result_count": len(result.raw_results),
        "error": result.error,
    }


@router.get("/ask/examples")
async def get_example_questions(_=Depends(verify_api_key)):
    """Return example questions to help users get started."""
    return {
        "examples": [
            {"question": "What companies are related to AI technology?", "type": "graph"},
            {"question": "Recent news about OpenAI", "type": "search"},
            {"question": "Show critical events this week", "type": "graph"},
            {"question": "Find documents about supply chain disruptions", "type": "search"},
            {"question": "What entities have the highest criticality scores?", "type": "graph"},
            {"question": "Who are the key persons mentioned in recent articles?", "type": "graph"},
        ]
    }

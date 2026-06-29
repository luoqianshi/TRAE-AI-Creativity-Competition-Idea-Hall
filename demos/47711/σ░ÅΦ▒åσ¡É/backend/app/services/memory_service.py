from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.schemas.memory import MemoryOut


def create_memory(
    db: Session,
    *,
    user_id: int,
    session_id: int | None,
    oc_id: str | None,
    oc_name: str,
    oc_emoji: str | None,
    text: str,
    metadata: dict | None = None,
) -> Memory:
    memory = Memory(
        user_id=user_id,
        session_id=session_id,
        oc_id=oc_id,
        oc_name=oc_name,
        oc_emoji=oc_emoji,
        text=text,
        extra_meta=metadata or {},
    )
    db.add(memory)
    db.flush()
    return memory


def serialize_memory(memory: Memory) -> MemoryOut:
    return MemoryOut(
        id=memory.id,
        text=memory.text,
        oc=memory.oc_name,
        emoji=memory.oc_emoji,
        date=memory.created_at.strftime("%Y-%m-%d"),
        session_id=memory.session_id,
        oc_id=memory.oc_id,
        metadata=memory.extra_meta or {},
        created_at=memory.created_at,
    )


def list_memories(db: Session, *, user_id: int, limit: int = 50) -> list[MemoryOut]:
    records = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc(), Memory.id.desc())
        .limit(limit)
        .all()
    )
    return [serialize_memory(item) for item in records]


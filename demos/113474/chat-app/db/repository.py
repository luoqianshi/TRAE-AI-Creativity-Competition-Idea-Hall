"""数据库 CRUD 操作"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import and_, case, or_, select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import AIBot, Friendship, MediaAsset, Message, User


# ===== 用户 =====

async def create_user(
    session: AsyncSession,
    user_id: str,
    username: str,
    password_hash: str | None = None,
    nickname: str | None = None,
    avatar: str | None = None,
    is_bot: bool = False,
) -> User:
    user = User(
        id=user_id,
        username=username,
        password_hash=password_hash,
        nickname=nickname or username,
        avatar=avatar,
        is_bot=is_bot,
    )
    session.add(user)
    await session.flush()
    return user


async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    result = await session.execute(
        select(User).where(User.username == username)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: str) -> User | None:
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession, keyword: str, limit: int = 20
) -> list[User]:
    """按用户名或昵称搜索（精确匹配用户名或模糊匹配昵称）"""
    result = await session.execute(
        select(User)
        .where(
            or_(
                User.username == keyword,
                User.nickname.ilike(f"%{keyword}%"),
            )
        )
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_bot_user(session: AsyncSession, user_id: str) -> User | None:
    """获取 bot 用户（含 is_bot 校验）"""
    result = await session.execute(
        select(User).where(and_(User.id == user_id, User.is_bot == True))  # noqa: E712
    )
    return result.scalar_one_or_none()


# ===== 好友关系 =====

async def create_friend_request(
    session: AsyncSession, user_id: str, friend_id: str
) -> Friendship:
    fp = Friendship(user_id=user_id, friend_id=friend_id, status="pending")
    session.add(fp)
    await session.flush()
    return fp


async def accept_friend_request(
    session: AsyncSession, friendship_id: int
) -> bool:
    """接受好友请求：原记录改 accepted + 插入反向记录"""
    result = await session.execute(
        select(Friendship).where(Friendship.id == friendship_id)
    )
    fp = result.scalar_one_or_none()
    if fp is None or fp.status != "pending":
        return False

    fp.status = "accepted"
    fp.accepted_at = datetime.now(timezone.utc)

    # 反向记录（若不存在）
    rev_result = await session.execute(
        select(Friendship).where(
            and_(
                Friendship.user_id == fp.friend_id,
                Friendship.friend_id == fp.user_id,
            )
        )
    )
    if rev_result.scalar_one_or_none() is None:
        reverse = Friendship(
            user_id=fp.friend_id,
            friend_id=fp.user_id,
            status="accepted",
            accepted_at=datetime.now(timezone.utc),
        )
        session.add(reverse)

    await session.flush()
    return True


async def reject_friend_request(
    session: AsyncSession, friendship_id: int
) -> bool:
    result = await session.execute(
        select(Friendship).where(Friendship.id == friendship_id)
    )
    fp = result.scalar_one_or_none()
    if fp is None:
        return False
    fp.status = "blocked"
    await session.flush()
    return True


async def list_friends(session: AsyncSession, user_id: str) -> list[User]:
    """列出已接受的好友"""
    result = await session.execute(
        select(User)
        .join(Friendship, Friendship.friend_id == User.id)
        .where(
            and_(
                Friendship.user_id == user_id,
                Friendship.status == "accepted",
            )
        )
        .order_by(User.nickname)
    )
    return list(result.scalars().all())


async def list_pending_requests(
    session: AsyncSession, user_id: str
) -> list[dict[str, Any]]:
    """列出收到的待处理好友请求"""
    result = await session.execute(
        select(Friendship, User)
        .join(User, Friendship.user_id == User.id)
        .where(
            and_(
                Friendship.friend_id == user_id,
                Friendship.status == "pending",
            )
        )
        .order_by(Friendship.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "friendship_id": fp.id,
            "user_id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "avatar": u.avatar,
            "is_bot": u.is_bot,
            "created_at": fp.created_at.isoformat() if fp.created_at else None,
        }
        for fp, u in rows
    ]


async def is_friend(
    session: AsyncSession, user_id: str, friend_id: str
) -> bool:
    result = await session.execute(
        select(Friendship).where(
            and_(
                Friendship.user_id == user_id,
                Friendship.friend_id == friend_id,
                Friendship.status == "accepted",
            )
        )
    )
    return result.scalar_one_or_none() is not None


async def get_friendship(
    session: AsyncSession, user_id: str, friend_id: str
) -> Friendship | None:
    result = await session.execute(
        select(Friendship).where(
            and_(
                Friendship.user_id == user_id,
                Friendship.friend_id == friend_id,
            )
        )
    )
    return result.scalar_one_or_none()


# ===== 消息 =====

async def save_message(
    session: AsyncSession,
    sender_id: str,
    receiver_id: str,
    msg_type: str = "text",
    content: str | None = None,
    media_path: str | None = None,
    status: str = "sent",
    llm_model: str | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
) -> Message:
    msg = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        msg_type=msg_type,
        content=content,
        media_path=media_path,
        status=status,
        llm_model=llm_model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )
    session.add(msg)
    await session.flush()
    return msg


async def get_conversation_history(
    session: AsyncSession,
    user_a: str,
    user_b: str,
    limit: int = 50,
    before_id: int | None = None,
) -> list[Message]:
    """获取两人的对话历史（按时间正序返回）"""
    stmt = (
        select(Message)
        .where(
            or_(
                and_(
                    Message.sender_id == user_a,
                    Message.receiver_id == user_b,
                ),
                and_(
                    Message.sender_id == user_b,
                    Message.receiver_id == user_a,
                ),
            )
        )
        .order_by(Message.id.desc())
        .limit(limit)
    )
    if before_id is not None:
        stmt = stmt.where(Message.id < before_id)

    result = await session.execute(stmt)
    msgs = list(result.scalars().all())
    msgs.reverse()  # 正序返回
    return msgs


async def mark_messages_read(
    session: AsyncSession, reader_id: str, peer_id: str
) -> int:
    """标记对方发来的消息为已读，返回更新行数"""
    result = await session.execute(
        update(Message)
        .where(
            and_(
                Message.sender_id == peer_id,
                Message.receiver_id == reader_id,
                Message.status != "read",
            )
        )
        .values(status="read", read_at=datetime.now(timezone.utc))
    )
    await session.flush()
    return result.rowcount


async def update_message_status(
    session: AsyncSession, message_id: int, status: str
) -> bool:
    await session.execute(
        update(Message).where(Message.id == message_id).values(status=status)
    )
    await session.flush()
    return True


async def get_recent_conversations(
    session: AsyncSession, user_id: str
) -> list[dict[str, Any]]:
    """获取会话列表（按最后消息时间排序）"""
    # 子查询：每个对方的最后消息 id
    sub = (
        select(
            func.max(Message.id).label("last_id"),
        )
        .where(
            or_(
                Message.sender_id == user_id,
                Message.receiver_id == user_id,
            )
        )
        .group_by(
            case(
                (Message.sender_id == user_id, Message.receiver_id),
                else_=Message.sender_id,
            )
        )
        .subquery()
    )

    result = await session.execute(
        select(Message, User)
        .join(sub, Message.id == sub.c.last_id)
        .join(
            User,
            User.id == case(
                (Message.sender_id == user_id, Message.receiver_id),
                else_=Message.sender_id,
            ),
        )
        .order_by(Message.id.desc())
    )
    rows = result.all()
    return [
        {
            "peer_id": u.id,
            "peer_username": u.username,
            "peer_nickname": u.nickname,
            "peer_avatar": u.avatar,
            "peer_is_bot": u.is_bot,
            "last_message": {
                "id": m.id,
                "content": m.content,
                "msg_type": m.msg_type,
                "media_path": m.media_path,
                "sender_id": m.sender_id,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            },
        }
        for m, u in rows
    ]


async def get_unread_count(
    session: AsyncSession, user_id: str
) -> int:
    result = await session.execute(
        select(func.count(Message.id)).where(
            and_(
                Message.receiver_id == user_id,
                Message.status != "read",
            )
        )
    )
    return int(result.scalar() or 0)


# ===== AI Bot =====

async def create_ai_bot(
    session: AsyncSession,
    user_id: str,
    name: str,
    provider: str,
    base_url: str,
    model: str,
    api_key: str | None = None,
    system_prompt: str | None = None,
    max_history: int = 10,
    temperature: float = 0.7,
    max_tokens: int = 256,
    image_gen_enabled: bool = True,
    created_by: str | None = None,
) -> AIBot:
    bot = AIBot(
        user_id=user_id,
        name=name,
        provider=provider,
        api_key=api_key,
        base_url=base_url,
        model=model,
        system_prompt=system_prompt,
        max_history=max_history,
        temperature=temperature,
        max_tokens=max_tokens,
        image_gen_enabled=image_gen_enabled,
        created_by=created_by,
    )
    session.add(bot)
    await session.flush()
    return bot


async def get_ai_bot_by_user_id(
    session: AsyncSession, user_id: str
) -> AIBot | None:
    result = await session.execute(
        select(AIBot).where(AIBot.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_ai_bot_by_id(
    session: AsyncSession, bot_id: int
) -> AIBot | None:
    result = await session.execute(
        select(AIBot).where(AIBot.id == bot_id)
    )
    return result.scalar_one_or_none()


async def list_ai_bots(
    session: AsyncSession, creator_id: str | None = None
) -> list[AIBot]:
    stmt = select(AIBot).order_by(AIBot.id.desc())
    if creator_id is not None:
        stmt = stmt.where(
            or_(AIBot.created_by == creator_id, AIBot.created_by.is_(None))
        )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_ai_bot(
    session: AsyncSession, bot_id: int, **fields
) -> bool:
    if not fields:
        return False
    await session.execute(
        update(AIBot).where(AIBot.id == bot_id).values(**fields)
    )
    await session.flush()
    return True


# ===== 媒体 =====

async def find_media_by_sha256(
    session: AsyncSession, sha256: str
) -> MediaAsset | None:
    result = await session.execute(
        select(MediaAsset).where(MediaAsset.sha256 == sha256)
    )
    return result.scalar_one_or_none()


async def save_media_asset(
    session: AsyncSession,
    sha256: str,
    local_path: str,
    media_type: str = "image",
) -> MediaAsset:
    asset = MediaAsset(
        sha256=sha256,
        local_path=local_path,
        media_type=media_type,
    )
    session.add(asset)
    await session.flush()
    return asset

from collections.abc import Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.forum_comment import ForumComment
from app.models.forum_like import ForumLike
from app.models.forum_post import ForumPost
from app.models.user import User
from app.schemas.forum import (
    ForumCommentCreateRequest,
    ForumCommentOut,
    ForumLikeTogglePayload,
    ForumPostCreateRequest,
    ForumPostDetail,
    ForumPostListItem,
)
from app.schemas.pagination import PageParams, build_page_data


TAG_SEPARATOR = "|"


def _build_tags_text(tags: Sequence[str]) -> str:
    cleaned = [tag.strip() for tag in tags if tag.strip()]
    if not cleaned:
        return ""
    return f"{TAG_SEPARATOR}{TAG_SEPARATOR.join(cleaned)}{TAG_SEPARATOR}"


def _parse_tags(tags_text: str) -> list[str]:
    if not tags_text:
        return []
    return [tag for tag in tags_text.split(TAG_SEPARATOR) if tag]


def _tag_filter_like(tag: str) -> str:
    return f"%{TAG_SEPARATOR}{tag}{TAG_SEPARATOR}%"


def _get_post_or_404(db: Session, post_id: int) -> ForumPost:
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if post is None:
        raise NotFoundException("帖子不存在")
    return post


def _get_comment_or_404(db: Session, comment_id: int) -> ForumComment:
    comment = db.query(ForumComment).filter(ForumComment.id == comment_id).first()
    if comment is None:
        raise NotFoundException("评论不存在")
    return comment


def _build_post_like_count_map(db: Session, post_ids: Sequence[int]) -> dict[int, int]:
    if not post_ids:
        return {}
    rows = (
        db.query(ForumLike.post_id, func.count(ForumLike.id))
        .filter(ForumLike.post_id.in_(post_ids))
        .group_by(ForumLike.post_id)
        .all()
    )
    return {post_id: count for post_id, count in rows if post_id is not None}


def _build_comment_count_map(db: Session, post_ids: Sequence[int]) -> dict[int, int]:
    if not post_ids:
        return {}
    rows = (
        db.query(ForumComment.post_id, func.count(ForumComment.id))
        .filter(ForumComment.post_id.in_(post_ids))
        .group_by(ForumComment.post_id)
        .all()
    )
    return {post_id: count for post_id, count in rows}


def _build_liked_post_ids(db: Session, post_ids: Sequence[int], user_id: int) -> set[int]:
    if not post_ids:
        return set()
    rows = (
        db.query(ForumLike.post_id)
        .filter(ForumLike.user_id == user_id, ForumLike.post_id.in_(post_ids))
        .all()
    )
    return {post_id for (post_id,) in rows if post_id is not None}


def _build_comment_like_count_map(
    db: Session, comment_ids: Sequence[int]
) -> dict[int, int]:
    if not comment_ids:
        return {}
    rows = (
        db.query(ForumLike.comment_id, func.count(ForumLike.id))
        .filter(ForumLike.comment_id.in_(comment_ids))
        .group_by(ForumLike.comment_id)
        .all()
    )
    return {comment_id: count for comment_id, count in rows if comment_id is not None}


def _build_liked_comment_ids(
    db: Session, comment_ids: Sequence[int], user_id: int
) -> set[int]:
    if not comment_ids:
        return set()
    rows = (
        db.query(ForumLike.comment_id)
        .filter(ForumLike.user_id == user_id, ForumLike.comment_id.in_(comment_ids))
        .all()
    )
    return {comment_id for (comment_id,) in rows if comment_id is not None}


def _serialize_comment(
    comment: ForumComment,
    *,
    liked_comment_ids: set[int],
    comment_like_counts: dict[int, int],
) -> ForumCommentOut:
    return ForumCommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        author_name=comment.author_name,
        author_avatar=comment.author_avatar,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        like_count=comment_like_counts.get(comment.id, 0),
        liked_by_me=comment.id in liked_comment_ids,
    )


def _serialize_post(
    post: ForumPost,
    *,
    current_user_id: int,
    liked_post_ids: set[int],
    post_like_counts: dict[int, int],
    comment_counts: dict[int, int],
) -> ForumPostListItem:
    return ForumPostListItem(
        id=post.id,
        user_id=post.user_id,
        author_name=post.author_name,
        author_avatar=post.author_avatar,
        content=post.content,
        tags=_parse_tags(post.tags_text),
        created_at=post.created_at,
        updated_at=post.updated_at,
        like_count=post_like_counts.get(post.id, 0),
        comment_count=comment_counts.get(post.id, 0),
        liked_by_me=post.id in liked_post_ids,
        can_delete=post.user_id == current_user_id,
    )


def list_forum_posts(
    db: Session,
    *,
    params: PageParams,
    current_user: User,
    tag: str | None = None,
):
    query = db.query(ForumPost)
    if tag:
        query = query.filter(ForumPost.tags_text.like(_tag_filter_like(tag.strip())))

    query = query.order_by(ForumPost.created_at.desc(), ForumPost.id.desc())
    total = query.count()
    posts = query.offset(params.offset).limit(params.size).all()

    post_ids = [post.id for post in posts]
    post_like_counts = _build_post_like_count_map(db, post_ids)
    comment_counts = _build_comment_count_map(db, post_ids)
    liked_post_ids = _build_liked_post_ids(db, post_ids, current_user.id)

    items = [
        _serialize_post(
            post,
            current_user_id=current_user.id,
            liked_post_ids=liked_post_ids,
            post_like_counts=post_like_counts,
            comment_counts=comment_counts,
        )
        for post in posts
    ]
    return build_page_data(items, total=total, params=params)


def get_forum_post_detail(
    db: Session,
    *,
    post_id: int,
    current_user: User,
) -> ForumPostDetail:
    post = _get_post_or_404(db, post_id)
    comments = (
        db.query(ForumComment)
        .filter(ForumComment.post_id == post_id)
        .order_by(ForumComment.created_at.asc(), ForumComment.id.asc())
        .all()
    )
    comment_ids = [comment.id for comment in comments]

    post_like_counts = _build_post_like_count_map(db, [post_id])
    comment_counts = {post_id: len(comments)}
    liked_post_ids = _build_liked_post_ids(db, [post_id], current_user.id)
    comment_like_counts = _build_comment_like_count_map(db, comment_ids)
    liked_comment_ids = _build_liked_comment_ids(db, comment_ids, current_user.id)

    return ForumPostDetail(
        **_serialize_post(
            post,
            current_user_id=current_user.id,
            liked_post_ids=liked_post_ids,
            post_like_counts=post_like_counts,
            comment_counts=comment_counts,
        ).model_dump(),
        comments=[
            _serialize_comment(
                comment,
                liked_comment_ids=liked_comment_ids,
                comment_like_counts=comment_like_counts,
            )
            for comment in comments
        ],
    )


def create_forum_post(
    db: Session,
    *,
    payload: ForumPostCreateRequest,
    current_user: User,
) -> ForumPostDetail:
    post = ForumPost(
        user_id=current_user.id,
        author_name=payload.author_name,
        author_avatar=payload.author_avatar,
        content=payload.content,
        tags_text=_build_tags_text(payload.tags),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return get_forum_post_detail(db, post_id=post.id, current_user=current_user)


def delete_forum_post(db: Session, *, post_id: int, current_user: User) -> None:
    post = _get_post_or_404(db, post_id)
    if post.user_id != current_user.id:
        raise ForbiddenException("只有作者本人可以删除帖子")
    db.delete(post)
    db.commit()


def toggle_forum_post_like(
    db: Session,
    *,
    post_id: int,
    current_user: User,
) -> ForumLikeTogglePayload:
    _get_post_or_404(db, post_id)
    like = (
        db.query(ForumLike)
        .filter(ForumLike.post_id == post_id, ForumLike.user_id == current_user.id)
        .first()
    )

    liked = like is None
    if like is None:
        db.add(ForumLike(user_id=current_user.id, post_id=post_id))
    else:
        db.delete(like)
    db.commit()

    like_count = (
        db.query(func.count(ForumLike.id))
        .filter(ForumLike.post_id == post_id)
        .scalar()
        or 0
    )
    return ForumLikeTogglePayload(
        target_id=post_id,
        liked=liked,
        like_count=like_count,
    )


def add_forum_comment(
    db: Session,
    *,
    post_id: int,
    payload: ForumCommentCreateRequest,
    current_user: User,
) -> ForumCommentOut:
    _get_post_or_404(db, post_id)
    comment = ForumComment(
        post_id=post_id,
        user_id=current_user.id,
        author_name=payload.author_name,
        author_avatar=payload.author_avatar,
        content=payload.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return ForumCommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        author_name=comment.author_name,
        author_avatar=comment.author_avatar,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        like_count=0,
        liked_by_me=False,
    )


def toggle_forum_comment_like(
    db: Session,
    *,
    comment_id: int,
    current_user: User,
) -> ForumLikeTogglePayload:
    _get_comment_or_404(db, comment_id)
    like = (
        db.query(ForumLike)
        .filter(
            ForumLike.comment_id == comment_id,
            ForumLike.user_id == current_user.id,
        )
        .first()
    )

    liked = like is None
    if like is None:
        db.add(ForumLike(user_id=current_user.id, comment_id=comment_id))
    else:
        db.delete(like)
    db.commit()

    like_count = (
        db.query(func.count(ForumLike.id))
        .filter(ForumLike.comment_id == comment_id)
        .scalar()
        or 0
    )
    return ForumLikeTogglePayload(
        target_id=comment_id,
        liked=liked,
        like_count=like_count,
    )

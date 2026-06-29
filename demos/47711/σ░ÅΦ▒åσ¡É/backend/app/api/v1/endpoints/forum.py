from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.forum import (
    ForumCommentCreateRequest,
    ForumCommentOut,
    ForumLikeTogglePayload,
    ForumPostCreateRequest,
    ForumPostDetail,
    ForumPostListItem,
)
from app.schemas.pagination import PageData, PageParams
from app.schemas.response import ApiResponse, success_response
from app.services.forum_service import (
    add_forum_comment,
    create_forum_post,
    delete_forum_post,
    get_forum_post_detail,
    list_forum_posts,
    toggle_forum_comment_like,
    toggle_forum_post_like,
)


router = APIRouter(prefix="/forum", tags=["forum"])


@router.get("/posts", response_model=ApiResponse[PageData[ForumPostListItem]])
def get_posts(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    size: int = Query(
        settings.default_page_size,
        ge=1,
        le=settings.max_page_size,
        description="每页数量",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    tag: str | None = Query(None, description="按标签筛选"),
) -> ApiResponse[PageData[ForumPostListItem]]:
    pagination = PageParams(page=page, size=size)
    data = list_forum_posts(
        db,
        params=pagination,
        current_user=current_user,
        tag=tag,
    )
    return success_response(data)


@router.post("/posts", response_model=ApiResponse[ForumPostDetail])
def create_post(
    payload: ForumPostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ForumPostDetail]:
    post = create_forum_post(db, payload=payload, current_user=current_user)
    return success_response(post, message="发布成功")


@router.get("/posts/{post_id}", response_model=ApiResponse[ForumPostDetail])
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ForumPostDetail]:
    post = get_forum_post_detail(db, post_id=post_id, current_user=current_user)
    return success_response(post)


@router.delete("/posts/{post_id}", response_model=ApiResponse[None])
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[None]:
    delete_forum_post(db, post_id=post_id, current_user=current_user)
    return success_response(message="删除成功")


@router.post("/posts/{post_id}/like", response_model=ApiResponse[ForumLikeTogglePayload])
def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ForumLikeTogglePayload]:
    payload = toggle_forum_post_like(db, post_id=post_id, current_user=current_user)
    return success_response(payload)


@router.post("/posts/{post_id}/comments", response_model=ApiResponse[ForumCommentOut])
def create_comment(
    post_id: int,
    payload: ForumCommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ForumCommentOut]:
    comment = add_forum_comment(
        db,
        post_id=post_id,
        payload=payload,
        current_user=current_user,
    )
    return success_response(comment, message="评论成功")


@router.post(
    "/comments/{comment_id}/like",
    response_model=ApiResponse[ForumLikeTogglePayload],
)
def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ForumLikeTogglePayload]:
    payload = toggle_forum_comment_like(
        db,
        comment_id=comment_id,
        current_user=current_user,
    )
    return success_response(payload)

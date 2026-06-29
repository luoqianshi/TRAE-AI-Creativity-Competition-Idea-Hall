from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.commission import (
    CommissionApplyRequest,
    CommissionCreateRequest,
    CommissionDashboardOut,
    CommissionOut,
)
from app.schemas.response import ApiResponse, success_response
from app.services.commission_service import (
    accept_commission_application,
    apply_commission,
    create_commission,
    delete_commission,
    get_commission_dashboard,
    get_commission_detail,
    list_commissions,
    reject_commission_application,
)


router = APIRouter(tags=["commissions"])
optional_bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None or not credentials.credentials:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
    except UnauthorizedException:
        return None

    subject = payload.get("sub")
    if not subject:
        return None

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        return None

    return db.query(User).filter(User.id == user_id).first()


@router.get("/commissions", response_model=ApiResponse[list[CommissionOut]])
def read_commissions(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ApiResponse[list[CommissionOut]]:
    return success_response(list_commissions(db, current_user), message="获取约稿列表成功")


@router.post("/commissions", response_model=ApiResponse[CommissionOut])
def post_commission(
    payload: CommissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CommissionOut]:
    return success_response(
        create_commission(db, current_user, payload),
        message="发布约稿成功",
    )


@router.get("/commissions/{commission_id}", response_model=ApiResponse[CommissionOut])
def read_commission_detail(
    commission_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ApiResponse[CommissionOut]:
    return success_response(
        get_commission_detail(db, commission_id, current_user),
        message="获取约稿详情成功",
    )


@router.delete("/commissions/{commission_id}", response_model=ApiResponse[dict[str, str]])
def remove_commission(
    commission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[dict[str, str]]:
    delete_commission(db, commission_id, current_user)
    return success_response({"status": "ok"}, message="约稿已删除")


@router.post("/commissions/{commission_id}/apply", response_model=ApiResponse[CommissionOut])
def post_commission_apply(
    commission_id: int,
    payload: CommissionApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CommissionOut]:
    return success_response(
        apply_commission(db, commission_id, current_user, payload),
        message="申请已提交",
    )


@router.post(
    "/commissions/{commission_id}/applications/{application_id}/accept",
    response_model=ApiResponse[CommissionOut],
)
def post_accept_application(
    commission_id: int,
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CommissionOut]:
    return success_response(
        accept_commission_application(
            db=db,
            commission_id=commission_id,
            application_id=application_id,
            current_user=current_user,
        ),
        message="已接受申请",
    )


@router.post(
    "/commissions/{commission_id}/applications/{application_id}/reject",
    response_model=ApiResponse[CommissionOut],
)
def post_reject_application(
    commission_id: int,
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CommissionOut]:
    return success_response(
        reject_commission_application(
            db=db,
            commission_id=commission_id,
            application_id=application_id,
            current_user=current_user,
        ),
        message="已拒绝申请",
    )


@router.get("/me/commission-dashboard", response_model=ApiResponse[CommissionDashboardOut])
def read_my_commission_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CommissionDashboardOut]:
    return success_response(
        get_commission_dashboard(db, current_user),
        message="获取约稿工作台成功",
    )


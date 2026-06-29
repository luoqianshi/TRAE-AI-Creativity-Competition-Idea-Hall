from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.models.commission import Commission
from app.models.commission_application import CommissionApplication
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.commission import (
    CommissionApplicationOut,
    CommissionApplyRequest,
    CommissionCreateRequest,
    CommissionDashboardOut,
    CommissionOut,
)


def _commission_query(db: Session):
    return db.query(Commission).options(selectinload(Commission.applicants))


def _get_commission_or_404(db: Session, commission_id: int) -> Commission:
    commission = _commission_query(db).filter(Commission.id == commission_id).first()
    if commission is None:
        raise NotFoundException("约稿信息不存在")
    return commission


def _find_profile(db: Session, user_id: int) -> UserProfile | None:
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


def _display_name(current_user: User, profile: UserProfile | None) -> str:
    nickname = (profile.nickname if profile else "") or ""
    nickname = nickname.strip()
    return nickname or current_user.username


def _display_avatar(payload_avatar: str) -> str:
    if payload_avatar:
        return payload_avatar
    return "👤"


def _to_application_out(application: CommissionApplication) -> CommissionApplicationOut:
    return CommissionApplicationOut(
        id=application.id,
        user_id=application.user_id,
        name=application.name,
        msg=application.msg,
        time=application.time,
        status=application.status,
    )


def _to_commission_out(
    commission: Commission,
    current_user: User | None = None,
) -> CommissionOut:
    my_application_id = None
    if current_user is not None:
        for app in commission.applicants:
            if app.user_id == current_user.id:
                my_application_id = app.id
                break

    return CommissionOut(
        id=commission.id,
        type=commission.type,
        avatar=commission.avatar or "👤",
        author=commission.author,
        title=commission.title,
        desc=commission.desc,
        styles=list(commission.styles or []),
        priceRange=commission.price_range or "面议",
        turnaround=commission.turnaround or "待商议",
        samples=list(commission.samples or []),
        status=commission.status,
        time=commission.created_at,
        applicants=[_to_application_out(app) for app in commission.applicants],
        ownedByMe=current_user is not None and commission.publisher_user_id == current_user.id,
        appliedByMe=my_application_id is not None,
        myApplicationId=my_application_id,
    )


def _ensure_publisher(commission: Commission, current_user: User) -> None:
    if commission.publisher_user_id != current_user.id:
        raise ForbiddenException("只有发布者可以执行此操作")


def _find_application_or_404(
    commission: Commission,
    application_id: int,
) -> CommissionApplication:
    target = next((app for app in commission.applicants if app.id == application_id), None)
    if target is None:
        raise NotFoundException("申请记录不存在")
    return target


def _refresh_commission(db: Session, commission_id: int) -> Commission:
    return _get_commission_or_404(db, commission_id)


def list_commissions(db: Session, current_user: User | None = None) -> list[CommissionOut]:
    commissions = _commission_query(db).order_by(Commission.created_at.desc()).all()
    return [_to_commission_out(item, current_user) for item in commissions]


def get_commission_detail(
    db: Session,
    commission_id: int,
    current_user: User | None = None,
) -> CommissionOut:
    commission = _get_commission_or_404(db, commission_id)
    return _to_commission_out(commission, current_user)


def create_commission(
    db: Session,
    current_user: User,
    payload: CommissionCreateRequest,
) -> CommissionOut:
    profile = _find_profile(db, current_user.id)
    item = Commission(
        publisher_user_id=current_user.id,
        type=payload.type,
        avatar=_display_avatar(payload.avatar or ""),
        author=_display_name(current_user, profile),
        title=payload.title.strip(),
        desc=payload.desc.strip(),
        styles=payload.styles,
        price_range=payload.priceRange.strip() or "面议",
        turnaround=payload.turnaround.strip() or "待商议",
        samples=payload.samples,
        status="open",
    )
    db.add(item)
    db.commit()
    item = _refresh_commission(db, item.id)
    return _to_commission_out(item, current_user)


def delete_commission(db: Session, commission_id: int, current_user: User) -> None:
    commission = _get_commission_or_404(db, commission_id)
    _ensure_publisher(commission, current_user)
    db.delete(commission)
    db.commit()


def apply_commission(
    db: Session,
    commission_id: int,
    current_user: User,
    payload: CommissionApplyRequest,
) -> CommissionOut:
    commission = _get_commission_or_404(db, commission_id)
    if commission.publisher_user_id == current_user.id:
        raise BadRequestException("不能申请自己发布的约稿")
    if commission.status != "open":
        raise BadRequestException("该约稿已关闭，暂不可申请")
    if any(app.user_id == current_user.id for app in commission.applicants):
        raise ConflictException("你已申请过该约稿，不能重复申请")

    profile = _find_profile(db, current_user.id)
    db.add(
        CommissionApplication(
            commission_id=commission.id,
            user_id=current_user.id,
            name=_display_name(current_user, profile),
            msg=payload.msg,
            status="pending",
        )
    )
    db.commit()
    commission = _refresh_commission(db, commission.id)
    return _to_commission_out(commission, current_user)


def accept_commission_application(
    db: Session,
    commission_id: int,
    application_id: int,
    current_user: User,
) -> CommissionOut:
    commission = _get_commission_or_404(db, commission_id)
    _ensure_publisher(commission, current_user)
    target = _find_application_or_404(commission, application_id)

    for app in commission.applicants:
        app.status = "accepted" if app.id == target.id else "rejected"
    commission.status = "closed"

    db.commit()
    commission = _refresh_commission(db, commission.id)
    return _to_commission_out(commission, current_user)


def reject_commission_application(
    db: Session,
    commission_id: int,
    application_id: int,
    current_user: User,
) -> CommissionOut:
    commission = _get_commission_or_404(db, commission_id)
    _ensure_publisher(commission, current_user)
    target = _find_application_or_404(commission, application_id)
    target.status = "rejected"

    if any(app.status == "accepted" for app in commission.applicants):
        commission.status = "closed"
    else:
        commission.status = "open"

    db.commit()
    commission = _refresh_commission(db, commission.id)
    return _to_commission_out(commission, current_user)


def get_commission_dashboard(db: Session, current_user: User) -> CommissionDashboardOut:
    commissions = _commission_query(db).order_by(Commission.created_at.desc()).all()

    received_applications: list[CommissionOut] = []
    in_progress_as_client: list[CommissionOut] = []
    in_progress_as_artist: list[CommissionOut] = []
    pending_outgoing: list[CommissionOut] = []

    for commission in commissions:
        mine = commission.publisher_user_id == current_user.id
        my_app = next((app for app in commission.applicants if app.user_id == current_user.id), None)
        has_pending = any(app.status == "pending" for app in commission.applicants)
        has_accepted = any(app.status == "accepted" for app in commission.applicants)
        my_accepted = my_app is not None and my_app.status == "accepted"
        my_pending = my_app is not None and my_app.status == "pending"
        out = _to_commission_out(commission, current_user)

        if mine and has_pending:
            received_applications.append(out)

        if (mine and commission.type == "seeker" and has_accepted) or (
            (not mine) and commission.type == "artist" and my_accepted
        ):
            in_progress_as_client.append(out)

        if ((not mine) and commission.type == "seeker" and my_accepted) or (
            mine and commission.type == "artist" and has_accepted
        ):
            in_progress_as_artist.append(out)

        if (not mine) and my_pending:
            pending_outgoing.append(out)

    return CommissionDashboardOut(
        received_applications=received_applications,
        in_progress_as_client=in_progress_as_client,
        in_progress_as_artist=in_progress_as_artist,
        pending_outgoing=pending_outgoing,
    )

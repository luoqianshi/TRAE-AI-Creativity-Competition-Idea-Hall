from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.home import HomeDashboardOut
from app.schemas.response import ApiResponse, success_response
from app.services.home_service import get_home_dashboard


router = APIRouter(prefix="/home", tags=["home"])


@router.get("/dashboard", response_model=ApiResponse[HomeDashboardOut])
def read_home_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[HomeDashboardOut]:
    return success_response(
        get_home_dashboard(db, current_user=current_user),
        message="获取首页数据成功",
    )

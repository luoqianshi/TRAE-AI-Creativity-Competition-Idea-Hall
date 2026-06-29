from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.file import DeleteFileResult, FileUploadPolicy, StoredFile
from app.schemas.response import ApiResponse, success_response
from app.services.file_service import file_storage_service, get_upload_policy


router = APIRouter(prefix="/file", tags=["file"])


@router.get("/policy", response_model=ApiResponse[FileUploadPolicy])
def read_upload_policy() -> ApiResponse[FileUploadPolicy]:
    return success_response(
        get_upload_policy(),
        message="获取上传策略成功",
    )


@router.post("/upload", response_model=ApiResponse[StoredFile])
def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("common"),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[StoredFile]:
    _ = current_user
    stored_file = file_storage_service.save(file, folder=folder)
    return success_response(stored_file, message="文件上传成功")


@router.delete("/{storage_key:path}", response_model=ApiResponse[DeleteFileResult])
def delete_file(
    storage_key: str,
    current_user: User = Depends(get_current_user),
) -> ApiResponse[DeleteFileResult]:
    _ = current_user
    result = file_storage_service.delete(storage_key)
    return success_response(result, message="文件删除成功")

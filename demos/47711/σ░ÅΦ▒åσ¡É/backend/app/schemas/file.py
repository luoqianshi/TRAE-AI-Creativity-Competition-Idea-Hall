from pydantic import BaseModel, Field


class FileUploadPolicy(BaseModel):
    field_name: str = "file"
    folder_field_name: str = "folder"
    max_size_mb: int
    allowed_extensions: list[str]


class StoredFile(BaseModel):
    filename: str
    original_filename: str
    storage_key: str
    url: str
    content_type: str | None = None
    size: int = Field(ge=0)


class DeleteFileResult(BaseModel):
    storage_key: str

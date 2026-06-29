from typing import Generic, TypeVar

from pydantic import BaseModel


DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    code: int = 0
    message: str = "success"
    data: DataT | None = None


def success_response(
    data: DataT | None = None,
    message: str = "success",
) -> ApiResponse[DataT]:
    return ApiResponse(code=0, message=message, data=data)

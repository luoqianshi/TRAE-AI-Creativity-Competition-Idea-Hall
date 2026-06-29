from fastapi import HTTPException, status

from app.schemas.common import ErrorCode


class AppException(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: int | None = None,
        data: object | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or status_code
        self.data = data


class BadRequestException(AppException):
    def __init__(self, message: str, *, data: object | None = None) -> None:
        super().__init__(
            message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCode.BAD_REQUEST,
            data=data,
        )


class BusinessException(AppException):
    def __init__(
        self,
        message: str,
        *,
        error_code: int = 40000,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        data: object | None = None,
    ) -> None:
        super().__init__(
            message,
            status_code=status_code,
            error_code=error_code,
            data=data,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "未授权", *, data: object | None = None) -> None:
        super().__init__(
            message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=ErrorCode.UNAUTHORIZED,
            data=data,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "无权访问", *, data: object | None = None) -> None:
        super().__init__(
            message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ErrorCode.FORBIDDEN,
            data=data,
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "资源不存在", *, data: object | None = None) -> None:
        super().__init__(
            message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=ErrorCode.NOT_FOUND,
            data=data,
        )


class ConflictException(AppException):
    def __init__(self, message: str, *, data: object | None = None) -> None:
        super().__init__(
            message,
            status_code=status.HTTP_409_CONFLICT,
            error_code=ErrorCode.CONFLICT,
            data=data,
        )


def http_exception(message: str, status_code: int) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)

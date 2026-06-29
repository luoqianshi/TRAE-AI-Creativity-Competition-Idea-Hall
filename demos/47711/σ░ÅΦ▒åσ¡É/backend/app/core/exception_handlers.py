from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import AppException
from app.schemas.common import ApiResponse, ErrorCode


def build_error_response(
    *,
    message: str,
    status_code: int,
    error_code: int | None = None,
    data: object | None = None,
) -> JSONResponse:
    payload = ApiResponse(
        code=error_code or status_code,
        message=message,
        data=data,
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump())


def normalize_validation_errors(errors: list[dict] | None) -> list[dict]:
    if not errors:
        return []
    normalized: list[dict] = []
    for item in errors:
        location = item.get("loc", [])
        normalized.append(
            {
                "field": ".".join(str(part) for part in location if part != "body"),
                "message": item.get("msg", "参数错误"),
                "type": item.get("type", "validation_error"),
            }
        )
    return normalized


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    def handle_app_exception(request: Request, exc: AppException) -> JSONResponse:
        return build_error_response(
            message=exc.message,
            status_code=exc.status_code,
            error_code=exc.error_code,
            data=exc.data
            or {
                "path": request.url.path,
                "method": request.method,
            },
        )

    @app.exception_handler(HTTPException)
    def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
        return build_error_response(
            message=str(exc.detail),
            status_code=exc.status_code,
            error_code=exc.status_code,
            data={"path": request.url.path, "method": request.method},
        )

    @app.exception_handler(RequestValidationError)
    @app.exception_handler(ValidationError)
    def handle_validation_exception(request: Request, exc: Exception) -> JSONResponse:
        errors = exc.errors() if hasattr(exc, "errors") else None
        return build_error_response(
            message="请求参数校验失败",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=ErrorCode.VALIDATION_ERROR,
            data={
                "path": request.url.path,
                "method": request.method,
                "errors": normalize_validation_errors(errors),
            },
        )

    @app.exception_handler(SQLAlchemyError)
    def handle_sqlalchemy_exception(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        return build_error_response(
            message="数据库操作失败",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code=ErrorCode.INTERNAL_ERROR,
            data={
                "path": request.url.path,
                "method": request.method,
                "detail": str(exc.__class__.__name__),
            },
        )

    @app.exception_handler(Exception)
    def handle_unexpected_exception(request: Request, exc: Exception) -> JSONResponse:
        return build_error_response(
            message="服务器内部异常",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code=ErrorCode.INTERNAL_ERROR,
            data={
                "path": request.url.path,
                "method": request.method,
                "detail": str(exc.__class__.__name__),
            },
        )

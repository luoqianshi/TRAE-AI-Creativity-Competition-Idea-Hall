from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router, pending_domains, registered_domains
from app.core.config import settings
from app.core.exception_handlers import register_exception_handlers
from app.core.init_db import init_db
from app.schemas.response import ApiResponse, success_response


app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
)
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.mount(
    "/uploads",
    StaticFiles(directory=settings.upload_path, check_dir=False),
    name="uploads",
)


@app.get("/", response_model=ApiResponse[dict[str, object]])
def root() -> ApiResponse[dict[str, object]]:
    return success_response(
        {
            "service": settings.project_name,
            "registered_domains": registered_domains,
            "pending_domains": pending_domains,
        },
        message=f"{settings.project_name} is running",
    )


@app.get("/health", response_model=ApiResponse[dict[str, str]])
def health() -> ApiResponse[dict[str, str]]:
    return success_response({"status": "ok"}, message="ok")


app.include_router(api_router, prefix=settings.api_v1_prefix)

"""FastAPI 应用入口"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.bootstrap import shutdown, startup
from app.config import get_settings
from app.logging import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup()
    yield
    await shutdown()


app = FastAPI(
    title="IM 聊天应用",
    description="独立 IM 聊天软件：加好友 / 发消息发图片 / AI 自动化对话",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS（允许跨域，方便手机调试）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件
static_dir = Path(__file__).parent.parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# 媒体文件
media_dir = Path(__file__).parent.parent / "media"
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")


# ===== 路由注册 =====
from api.auth_routes import router as auth_router  # noqa: E402
from api.bot_routes import router as bot_router  # noqa: E402
from api.friend_routes import router as friend_router  # noqa: E402
from api.message_routes import router as message_router  # noqa: E402
from api.ws_routes import router as ws_router  # noqa: E402

app.include_router(auth_router, prefix="/api")
app.include_router(friend_router, prefix="/api")
app.include_router(message_router, prefix="/api")
app.include_router(bot_router, prefix="/api")
app.include_router(ws_router)  # WS 不加 /api 前缀


# ===== 全局异常处理 =====

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"未捕获异常: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": str(exc)},
    )


# ===== 健康检查 =====

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "chat-app", "version": "1.0.0"}


# ===== 首页（SPA） =====

@app.get("/", response_class=HTMLResponse, tags=["page"])
async def index():
    index_file = static_dir / "index.html"
    return index_file.read_text(encoding="utf-8")


# ===== 启动 =====

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    print(f"\n  IM 聊天应用启动中...")
    print(f"  访问地址: http://localhost:{settings.port}")
    print(f"  手机访问: http://<本机IP>:{settings.port}（需在同一局域网）")
    print(f"  按 Ctrl+C 停止\n")
    uvicorn.run(
        "api.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level.lower(),
        reload=False,
    )

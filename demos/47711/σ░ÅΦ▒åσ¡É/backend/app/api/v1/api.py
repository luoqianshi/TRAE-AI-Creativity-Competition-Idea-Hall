from importlib import import_module

from fastapi import APIRouter


DOMAIN_ROUTERS: tuple[tuple[str, str], ...] = (
    ("auth", "app.api.v1.endpoints.auth"),
    ("me", "app.api.v1.endpoints.me"),
    ("user", "app.api.v1.endpoints.user"),
    ("oc", "app.api.v1.endpoints.oc"),
    ("chat", "app.api.v1.endpoints.chat"),
    ("memories", "app.api.v1.endpoints.memories"),
    ("forum", "app.api.v1.endpoints.forum"),
    ("collabs", "app.api.v1.endpoints.collabs"),
    ("activities", "app.api.v1.endpoints.activities"),
    ("activity", "app.api.v1.endpoints.activity"),
    ("commission", "app.api.v1.endpoints.commission"),
    ("vip", "app.api.v1.endpoints.vip"),
    ("shop", "app.api.v1.endpoints.shop"),
    ("generate", "app.api.v1.endpoints.generate"),
    ("file", "app.api.v1.endpoints.file"),
    ("watermark", "app.api.v1.endpoints.watermarks"),
    ("media", "app.api.v1.endpoints.media"),
)


def load_router(module_path: str):
    try:
        module = import_module(module_path)
    except ModuleNotFoundError as exc:
        if exc.name == module_path:
            return None
        raise
    router = getattr(module, "router", None)
    if router is None:
        raise RuntimeError(f"{module_path} 未暴露 router")
    return router


api_router = APIRouter()
registered_domains: list[str] = []
pending_domains: list[str] = []

for domain, module_path in DOMAIN_ROUTERS:
    router = load_router(module_path)
    if router is None:
        pending_domains.append(domain)
        continue
    api_router.include_router(router)
    registered_domains.append(domain)

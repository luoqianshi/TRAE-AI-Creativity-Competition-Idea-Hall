"""Authentication and authorization module.

Provides API Key verification, JWT token handling, permission checking,
and distributed rate limiting via Redis sorted-set sliding windows.
"""

import hashlib
import hmac
import logging
import secrets
import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from utils.timezone import utc_now_naive

logger = logging.getLogger(__name__)


# ============================================================
# Configuration
# ============================================================

class AuthConfig:
    """Authentication configuration loaded from environment."""

    API_KEY_HEADER_NAME = "X-API-Key"
    API_KEYS: Dict[str, Dict[str, Any]] = {}
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: int = 100  # requests per minute

    @classmethod
    def load_from_env(cls):
        """Load authentication configuration from environment variables.

        API Keys are stored as SHA256 hashes. Since API Keys are 43+ character
        high-entropy random strings (secrets.token_urlsafe(32)), SHA256 is
        sufficient and bcrypt/scrypt slow hashing is unnecessary.

        Verification uses hmac.compare_digest for constant-time comparison
        to prevent timing attacks.
        """
        import os
        import json

        env_keys = os.getenv("API_KEYS", "")
        if env_keys:
            try:
                cls.API_KEYS = json.loads(env_keys)
            except json.JSONDecodeError:
                logger.error("Failed to parse API_KEYS environment variable")

        cls.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", cls.JWT_SECRET_KEY)
        cls.JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", cls.JWT_EXPIRE_HOURS))
        cls.RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
        cls.RATE_LIMIT_DEFAULT = int(os.getenv("RATE_LIMIT_DEFAULT", cls.RATE_LIMIT_DEFAULT))


# ============================================================
# API Key models
# ============================================================

class APIKeyInfo(BaseModel):
    """Information about a verified API Key."""
    key_hash: str
    name: str
    permissions: List[str]
    rate_limit: int
    classification_level: str = "internal"


api_key_header = APIKeyHeader(name=AuthConfig.API_KEY_HEADER_NAME, auto_error=False)


# ============================================================
# API Key verification
# ============================================================

def verify_api_key(
    api_key: Optional[str] = Security(api_key_header),
) -> APIKeyInfo:
    """Verify an API Key from the request header.

    Uses SHA256 hash comparison with hmac.compare_digest for constant-time
    verification to prevent timing side-channel attacks.

    Args:
        api_key: The API Key from the X-API-Key request header.

    Returns:
        APIKeyInfo with the key's metadata.

    Raises:
        HTTPException 401: If the API Key is missing or invalid.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Provide it via the X-API-Key header.",
        )

    if not AuthConfig.API_KEYS:
        AuthConfig.load_from_env()

    if not AuthConfig.API_KEYS:
        raise RuntimeError(
            "No API Keys configured. Set the API_KEYS environment variable "
            "with at least one key, or use generate_api_key() to create one "
            "and add its SHA256 hash to the environment."
        )

    key_hash = hashlib.sha256(api_key.encode()).hexdigest()

    for stored_hash, key_info in AuthConfig.API_KEYS.items():
        if hmac.compare_digest(key_hash, stored_hash):
            return APIKeyInfo(
                key_hash=stored_hash,
                name=key_info.get("name", "unknown"),
                permissions=key_info.get("permissions", ["read"]),
                rate_limit=key_info.get("rate_limit", AuthConfig.RATE_LIMIT_DEFAULT),
                classification_level=key_info.get("classification_level", "internal"),
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API Key.",
    )


# ============================================================
# Classification-based access control
# ============================================================

def require_classification(required_level: str):
    """Dependency factory: require a minimum classification level.

    Returns an async FastAPI dependency that checks the API Key's
    classification level against the required minimum.
    """
    from utils.classification import get_classifier

    classifier = get_classifier()

    async def classification_checker(
        auth_info: APIKeyInfo = Depends(verify_api_key),
    ) -> APIKeyInfo:
        if not classifier.can_access(auth_info.classification_level, required_level):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient classification level: "
                    f"{auth_info.classification_level} < {required_level}"
                ),
            )
        return auth_info

    return classification_checker


# ============================================================
# JWT Authentication (optional)
# ============================================================

http_bearer = HTTPBearer(auto_error=False)


class JWTToken(BaseModel):
    """Decoded JWT token information."""
    sub: str
    permissions: List[str]
    exp: datetime


def create_jwt_token(subject: str, permissions: List[str]) -> str:
    """Create a signed JWT token.

    Args:
        subject: User identifier.
        permissions: List of permission strings.

    Returns:
        Encoded JWT token string.
    """
    expire = utc_now_naive() + timedelta(hours=AuthConfig.JWT_EXPIRE_HOURS)

    payload = {
        "sub": subject,
        "permissions": permissions,
        "exp": expire,
        "iat": utc_now_naive(),
    }

    token = jwt.encode(
        payload,
        AuthConfig.JWT_SECRET_KEY,
        algorithm=AuthConfig.JWT_ALGORITHM,
    )

    return token


async def verify_jwt_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(http_bearer),
) -> JWTToken:
    """Verify a JWT Bearer token from the Authorization header.

    Args:
        credentials: Bearer token credentials.

    Returns:
        Decoded JWTToken.

    Raises:
        HTTPException 401: If the token is missing, expired, or invalid.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            AuthConfig.JWT_SECRET_KEY,
            algorithms=[AuthConfig.JWT_ALGORITHM],
        )
        return JWTToken(
            sub=payload["sub"],
            permissions=payload.get("permissions", []),
            exp=datetime.fromtimestamp(payload["exp"]),
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ============================================================
# Permission control
# ============================================================

def require_permission(permission: str):
    """Dependency factory: require a specific permission.

    Returns an async FastAPI dependency that checks the authenticated
    principal has the required permission.
    """
    async def permission_checker(
        api_key_info: APIKeyInfo = Depends(verify_api_key),
    ) -> APIKeyInfo:
        if permission not in api_key_info.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}",
            )
        return api_key_info

    return permission_checker


def check_permission(auth_info, permission: str) -> bool:
    """Check whether an authenticated principal has a given permission.

    Args:
        auth_info: An APIKeyInfo or JWTToken instance.
        permission: The permission string to check.

    Returns:
        True if the permission is granted.
    """
    if isinstance(auth_info, (APIKeyInfo, JWTToken)):
        return permission in auth_info.permissions
    return False


# ============================================================
# Rate limiting (Redis distributed sliding window)
# ============================================================

_RATE_LIMIT_KEY_PREFIX = "omnilog:rate_limit:"


class RateLimiter:
    """Distributed rate limiter using Redis sorted-set sliding windows.

    Uses per-key sorted sets to track request timestamps. Cleanup, count,
    and insert are pipelined atomically. Falls back to fail-closed (deny)
    when Redis is unavailable.
    """

    def __init__(self):
        self._redis = None

    async def _get_redis(self):
        """Get a Redis connection from the project connection pool."""
        if self._redis is None:
            from utils.db_pool import get_pool_manager
            pool = get_pool_manager()
            self._redis = await pool.redis.get_connection()
        return self._redis

    def _key(self, key: str) -> str:
        return f"{_RATE_LIMIT_KEY_PREFIX}{key}"

    async def is_allowed(self, key: str, limit: int, window: int = 60) -> bool:
        """Check whether a request is allowed under the rate limit.

        修复: 被拒绝的请求不应占用窗口配额. 原实现无论是否允许都会 zadd,
        导致 limit 达上限后所有后续请求都被拒绝直到窗口过期, 被拒请求
        也填满了窗口. 现在先检查, 仅在允许时才添加.

        Args:
            key: Rate limit key (e.g., API Key hash).
            limit: Maximum requests allowed in the window.
            window: Window size in seconds.

        Returns:
            True if the request is allowed.
        """
        try:
            redis = await self._get_redis()
            now = time.time()
            window_start = now - window

            # Step 1: 清理过期 + 计数 (不添加当前请求)
            pipe = redis.pipeline()
            pipe.zremrangebyscore(self._key(key), 0, window_start)
            pipe.zcard(self._key(key))
            results = await pipe.execute()
            current_count = results[1]  # zcard result (清理后, 添加前)

            if current_count >= limit:
                return False  # 拒绝, 不占用配额

            # Step 2: 仅在允许时才添加当前请求时间戳
            pipe = redis.pipeline()
            pipe.zadd(self._key(key), {str(now): now})
            pipe.expire(self._key(key), window + 10)
            await pipe.execute()
            return True
        except Exception as e:
            logger.warning("Redis rate limit check failed: %s", e)
            # Fail-closed: deny on Redis failure
            return False

    async def remaining(self, key: str, limit: int, window: int = 60) -> int:
        """Get the remaining request quota for a key.

        Args:
            key: Rate limit key.
            limit: Maximum requests allowed.
            window: Window size in seconds.

        Returns:
            Number of remaining requests. Returns 0 on Redis failure.
        """
        try:
            redis = await self._get_redis()
            now = time.time()
            window_start = now - window

            pipe = redis.pipeline()
            pipe.zremrangebyscore(self._key(key), 0, window_start)
            pipe.zcard(self._key(key))
            results = await pipe.execute()
            current_count = results[-1]
            return max(0, limit - current_count)
        except Exception as e:
            logger.warning("Redis remaining quota check failed: %s", e)
            return 0


rate_limiter = RateLimiter()


async def check_rate_limit(auth_info: APIKeyInfo) -> bool:
    """Check and enforce rate limiting for an API Key.

    Args:
        auth_info: The authenticated API Key info.

    Returns:
        True if the request is allowed.

    Raises:
        HTTPException 429: If the rate limit has been exceeded.
    """
    if not AuthConfig.RATE_LIMIT_ENABLED:
        return True

    allowed = await rate_limiter.is_allowed(
        key=auth_info.key_hash,
        limit=auth_info.rate_limit,
        window=60,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please retry later.",
            headers={
                "X-RateLimit-Limit": str(auth_info.rate_limit),
                "X-RateLimit-Remaining": "0",
                "Retry-After": "60",
            },
        )

    return True


# ============================================================
# Helper functions
# ============================================================

def generate_api_key(
    name: str,
    permissions: List[str] = None,
    classification_level: str = "internal",
) -> str:
    """Generate a new API Key and store its SHA256 hash.

    Args:
        name: Human-readable name for this key.
        permissions: List of permissions (default: ["read"]).
        classification_level: Data classification level.

    Returns:
        The plaintext API Key (only shown once).
    """
    if permissions is None:
        permissions = ["read"]

    api_key = f"omnilog_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()

    AuthConfig.API_KEYS[key_hash] = {
        "name": name,
        "permissions": permissions,
        "rate_limit": AuthConfig.RATE_LIMIT_DEFAULT,
        "classification_level": classification_level,
    }

    return api_key


def hash_api_key(api_key: str) -> str:
    """Hash an API Key for logging purposes.

    Returns the first 16 hex characters of the SHA256 hash as a log-safe
    identifier. Not used for verification.
    """
    return hashlib.sha256(api_key.encode()).hexdigest()[:16]


def init_auth():
    """Initialize authentication by loading config from environment.

    Called by main.py after all routes are registered.
    """
    AuthConfig.load_from_env()
    logger.info("Auth initialized: %d API keys configured", len(AuthConfig.API_KEYS))

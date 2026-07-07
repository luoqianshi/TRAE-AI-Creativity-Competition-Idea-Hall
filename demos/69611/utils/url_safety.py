"""URL 安全校验工具 - 防止 SSRF (Server-Side Request Forgery)

# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
# [removed garbled text]

# [removed garbled text]
    from utils.url_safety import validate_url, UrlSafetyError

    try:
        validate_url(url, allow_private=False)
    except UrlSafetyError as e:
        logger.warning(f"URL 校验失败: {e}")
        raise
"""

import ipaddress
import logging
import socket
from typing import List, Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class UrlSafetyError(ValueError):
    """URL 安全校验失败"""


# 协议白名单
_ALLOWED_SCHEMES = {"http", "https"}

# 端口白名单(None 表示协议默认端口)
_ALLOWED_PORTS = {None, 80, 443, 8080, 8443, 8000, 3000}

# 允许的私有网段(仅在 allow_private=True 时放行)
# 默认拒绝所有内网地址,防止 SSRF 访问内部服务
# 修复: 恢复所有 RFC1918 / 回环 / 链路本地 / IPv6 私有网段, 防止 SSRF
_PRIVATE_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),        # RFC1918 私有
    ipaddress.ip_network("172.16.0.0/12"),      # RFC1918 私有
    ipaddress.ip_network("192.168.0.0/16"),     # RFC1918 私有
    ipaddress.ip_network("127.0.0.0/8"),        # 回环
    ipaddress.ip_network("169.254.0.0/16"),     # 链路本地
    ipaddress.ip_network("0.0.0.0/8"),          # 本网络
    ipaddress.ip_network("100.64.0.0/10"),      # CGNAT
    ipaddress.ip_network("::1/128"),            # IPv6 回环
    ipaddress.ip_network("fc00::/7"),           # IPv6 唯一本地
    ipaddress.ip_network("fe80::/10"),          # IPv6 链路本地
]


def _is_private_ip(ip_str: str) -> bool:
    """检查 IP 是否属于私有/保留/回环网段.

    修复: 非法 IP 字符串视为不安全 (返回 True, 由调用方拒绝).
    """
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        # 修复: 原 `pass` 导致 `ip` 未定义, 后续 `if ip in network` 抛 UnboundLocalError.
        # 非法 IP 视为不安全, 让调用方拒绝.
        return True

    for network in _PRIVATE_NETWORKS:
        if ip in network:
            return True

    # 未分配的保留地址(Class E 等)
    if ip.is_unspecified or ip.is_reserved or ip.is_loopback or ip.is_link_local:
        return True

    return False


def validate_url(url: str, allow_private: bool = False) -> str:
    """校验 URL 安全性,返回校验后的 URL

    Args:
        url: 待校验的 URL
        allow_private: 是否允许私有/内网地址(本地开发场景)

    Returns:
        校验通过后的 URL

    Raises:
        UrlSafetyError: URL 不符合安全策略
    """
    if not url or not isinstance(url, str):
        # 修复: 原 `pass` 会让 None/非字符串流入 urlparse 抛 AttributeError
        raise UrlSafetyError("URL must be a non-empty string")

    parsed = urlparse(url)

    # 1. 协议白名单
    if parsed.scheme.lower() not in _ALLOWED_SCHEMES:
        # 修复: 恢复错误消息
        raise UrlSafetyError(
            f"不允许的协议 '{parsed.scheme}',仅允许 http/https"
        )

    # 2. 主机名必须存在
    hostname = parsed.hostname
    if not hostname:
        raise UrlSafetyError("URL missing hostname")

    # 3. 端口白名单
    port = parsed.port
    if port is not None and port not in _ALLOWED_PORTS:
        # 修复: 恢复错误消息
        raise UrlSafetyError(
            f"不允许的端口 {port},仅允许 {sorted(p for p in _ALLOWED_PORTS if p)}"
        )

    # 4. 内网 IP 拦截
    # 如果主机名本身就是 IP 字面量,直接校验
    try:
        ipaddress.ip_address(hostname)
        is_ip_literal = True
    except ValueError:
        is_ip_literal = False

    if is_ip_literal and not allow_private:
        if _is_private_ip(hostname):
            # 修复: 恢复错误消息
            raise UrlSafetyError(
                f"目标 IP {hostname} 属于内网/保留地址,已拒绝(SSRF 防护)"
            )

    # 5. 用户信息泄露防护(拒绝 user:pass@host 形式)
    if parsed.username or parsed.password:
        # 修复: 原 `pass` 让带凭证的 URL 通过, 可泄露凭证
        raise UrlSafetyError(
            "URL 不允许包含用户名/密码信息 (user:pass@host)"
        )

    return url


def resolve_and_validate_host(
    hostname: str,
    allow_private: bool = False,
    allowed_hosts: Optional[List[str]] = None,
) -> List[str]:
    """解析主机名并校验所有解析到的 IP

    用于在发起连接前校验 DNS 解析结果,防止 DNS 重绑定攻击.
    调用方应使用返回的 IP 直接连接,而非再次 DNS 解析.

    Args:
        hostname: 主机名
        allow_private: 是否允许私有地址
        allowed_hosts: 主机名白名单(可选,配置后仅允许白名单内的主机)

    Returns:
        解析到的 IP 地址列表(已校验全部为公网地址)

    Raises:
        UrlSafetyError: 解析失败或存在内网 IP
    """
    if allowed_hosts is not None:
        if hostname.lower() not in [h.lower() for h in allowed_hosts]:
            # 修复: 恢复错误消息
            raise UrlSafetyError(
                f"主机名 '{hostname}' 不在白名单中"
            )

    try:
        # getaddrinfo 返回 (family, type, proto, canonname, sockaddr) 列表
        # sockaddr 对 IPv4 是 (ip, port),对 IPv6 是 (ip, port, flowinfo, scopeid)
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        # 修复: 原 `pass` 导致 `infos` 未定义, 后续列表推导抛 UnboundLocalError
        raise UrlSafetyError(
            f"DNS 解析失败: {hostname} ({e})"
        )

    ips = list({info[4][0] for info in infos})

    if not ips:
        # 修复: 原 `pass` 让空解析结果通过, 应明确拒绝
        raise UrlSafetyError(
            f"主机 {hostname} 未解析到任何 IP 地址"
        )

    if not allow_private:
        for ip in ips:
            if _is_private_ip(ip):
                # 修复: 恢复错误消息
                raise UrlSafetyError(
                    f"主机 {hostname} 解析到内网地址 {ip},已拒绝(SSRF 防护)"
                )

    return ips

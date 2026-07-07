"""文本清洗工具 - 去除 HTML, 多余空格, 特殊字符"""

import re
import html


# 预编译正则
_HTML_TAG_RE = re.compile(r"<[^>]+>")
_HTML_ENTITY_RE = re.compile(r"&[a-zA-Z0-9#]+;")
_MULTI_SPACE_RE = re.compile(r"[ \t]+")
_MULTI_NEWLINE_RE = re.compile(r"\n{3,}")
_SPECIAL_CHAR_RE = re.compile(r"[^\w\s\u4e00-\u9fff.,;:!?@#$%&*()\-+=\[\]{}'\"/\\|<>~`^]")
_URL_RE = re.compile(r"https?://\S+")


def clean_text(text: str, keep_urls: bool = False) -> str:
    """Clean Text"""
    if not text:
        return ""

    # HTML 实体解码
    text = html.unescape(text)

    # 去除 HTML 标签
    text = _HTML_TAG_RE.sub(" ", text)

    # 去除 URL
    if not keep_urls:
        text = _URL_RE.sub(" ", text)

    # 合并多余空格(保留中文间的空格)
    text = _MULTI_SPACE_RE.sub(" ", text)

    # 合并多余换行
    text = _MULTI_NEWLINE_RE.sub("\n\n", text)

    # 去除控制字符(保留换行和制表符)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # 去除首尾空白
    text = text.strip()

    return text


def normalize_whitespace(text: str) -> str:
    """标准化空白字符"""
    if not text:
        return ""
    text = _MULTI_SPACE_RE.sub(" ", text)
    text = _MULTI_NEWLINE_RE.sub("\n", text)
    return text.strip()


def extract_plain_text(html_content: str) -> str:
    """从 HTML 内容提取纯文本"""
    if not html_content:
        return ""
    text = html.unescape(html_content)
    text = _HTML_TAG_RE.sub(" ", text)
    text = _MULTI_SPACE_RE.sub(" ", text)
    return text.strip()

"""OmniLog Intelligence 报告生成模块"""

# Lazy imports to avoid cascading failures from report_generator.py corruption
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from reporting.report_generator import ReportGenerator, generate_daily_report


def _get_report_generator():
    from reporting.report_generator import ReportGenerator
    return ReportGenerator


def _get_generate_daily():
    from reporting.report_generator import generate_daily_report
    return generate_daily_report


__all__ = [
    "_get_report_generator",
    "_get_generate_daily",
]

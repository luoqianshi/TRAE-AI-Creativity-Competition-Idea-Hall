"""内置策略集合"""
from .moving_average import MovingAverageCrossStrategy
from .rsi_strategy import RSIStrategy
from .multifactor import MultiFactorStrategy
from .multifactor_v3 import MultiFactorV3Strategy
from .multifactor_v4 import MultiFactorV4Strategy
from .news_enhanced import NewsEnhancedMAStrategy

__all__ = [
    "MovingAverageCrossStrategy",
    "RSIStrategy",
    "MultiFactorStrategy",
    "MultiFactorV3Strategy",
    "MultiFactorV4Strategy",
    "NewsEnhancedMAStrategy",
]

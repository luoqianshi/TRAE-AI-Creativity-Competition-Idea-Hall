"""数据接入层"""
from .tiger_data import TigerDataProvider, tiger_provider
from .sample_data import generate_sample_data

__all__ = ["TigerDataProvider", "tiger_provider", "generate_sample_data"]

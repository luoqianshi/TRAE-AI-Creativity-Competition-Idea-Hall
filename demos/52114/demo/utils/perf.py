import time
from typing import Tuple

try:
    import psutil  # type: ignore
except Exception:
    psutil = None


class PerfMonitor:
    def __init__(self):
        self.process = psutil.Process() if psutil else None
        self.last_time = time.time()

    def sample(self) -> Tuple[float, float]:
        fps_placeholder = 0.0
        cpu_percent = 0.0
        if self.process:
            try:
                cpu_percent = self.process.cpu_percent(interval=0.0)
            except Exception:
                cpu_percent = 0.0
        return fps_placeholder, cpu_percent

    def gpu_usage(self) -> float:
        return 0.0

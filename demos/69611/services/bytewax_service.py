"""Bytewax stream processing background service management.

Provides start/stop lifecycle management for Bytewax dataflow execution
as a background daemon thread with graceful shutdown support.

- start_bytewax() launches Bytewax run_main in a daemon thread
- stop_bytewax() triggers graceful Bytewax shutdown by injecting
  KeyboardInterrupt into the worker thread
- atexit registration ensures automatic stop_bytewax() on process exit
"""

import atexit
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)

bytewax_thread: Optional[threading.Thread] = None
bytewax_running = False
_stop_lock = threading.Lock()


def _async_raise(tid: int, exc_type: type) -> None:
    """Inject an exception into a target thread for graceful interrupt.

    Uses the standard ctypes.pythonapi.PyThreadState_SetAsyncExc pattern
    to raise KeyboardInterrupt inside the Bytewax thread, triggering
    Bytewax's built-in graceful shutdown sequence.
    """
    import ctypes

    res = ctypes.pythonapi.PyThreadState_SetAsyncExc(
        ctypes.c_ulong(tid), ctypes.py_object(exc_type)
    )
    if res == 0:
        raise ValueError("Invalid thread ID")
    elif res > 1:
        # If more than one thread was affected, undo the damage
        ctypes.pythonapi.PyThreadState_SetAsyncExc(
            ctypes.c_ulong(tid), None
        )
        raise SystemError("PyThreadState_SetAsyncExc affected multiple threads")


def stop_bytewax() -> None:
    """Stop Bytewax stream processing gracefully.

    Injects KeyboardInterrupt into the Bytewax worker thread and waits
    up to 30 seconds for the dataflow to flush buffers and ACK in-flight
    messages before final shutdown.
    """
    global bytewax_running, bytewax_thread

    with _stop_lock:
        if not bytewax_thread or not bytewax_thread.is_alive():
            bytewax_running = False
            return

        bytewax_running = False
        logger.info("Stopping Bytewax stream processing (injecting KeyboardInterrupt)...")

        tid = bytewax_thread.ident
        if tid is None:
            logger.warning("Cannot get Bytewax thread ID, skipping interrupt")
            return

        try:
            _async_raise(tid, KeyboardInterrupt)
        except (ValueError, SystemError) as e:
            logger.warning(
                "Failed to inject interrupt signal: %s, waiting for thread to end naturally",
                e,
            )

        bytewax_thread.join(timeout=30)
        if bytewax_thread.is_alive():
            logger.warning(
                "Bytewax thread did not finish within 30s, operations may be incomplete"
            )
        else:
            logger.info("Bytewax stream processing stopped gracefully")


def get_bytewax_running() -> bool:
    """Return whether Bytewax stream processing is currently running."""
    return bytewax_running


atexit.register(stop_bytewax)

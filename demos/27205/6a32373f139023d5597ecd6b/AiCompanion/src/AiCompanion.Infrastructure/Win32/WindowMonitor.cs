using System.Diagnostics;
using System.Text;
using static AiCompanion.Infrastructure.Win32.NativeMethods;

namespace AiCompanion.Infrastructure.Win32;

/// <summary>
/// 前台窗口监控服务——使用 WinEvent Hook + 自适应轮询
/// 注意：所有窗口数据仅存于内存，不落盘、不上传（隐私保护）
/// </summary>
public class WindowMonitor : IDisposable
{
    private IntPtr _hookHandle;
    private WinEventDelegate? _delegate;
    private System.Timers.Timer? _pollingTimer;
    private int _currentIntervalMs = 2000;
    private string _lastProcessName = "";
    private readonly Dictionary<uint, string> _processNameCache = new();
    private DateTime _lastCacheRefresh = DateTime.MinValue;

    public event EventHandler<WindowChangeEventArgs>? ForegroundWindowChanged;

    public void Start()
    {
        // 方式1：WinEvent Hook（零CPU开销，系统推送）
        _delegate = WinEventProc;
        _hookHandle = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND,
            IntPtr.Zero, _delegate, 0, 0, WINEVENT_OUTOFCONTEXT);

        // 方式2：自适应轮询（检测标题变化等Hook无法捕获的事件）
        _pollingTimer = new System.Timers.Timer(_currentIntervalMs);
        _pollingTimer.Elapsed += OnPollingTick;
        _pollingTimer.AutoReset = true;
        _pollingTimer.Start();
    }

    public void Stop()
    {
        _pollingTimer?.Stop();
        if (_hookHandle != IntPtr.Zero)
        {
            UnhookWinEvent(_hookHandle);
            _hookHandle = IntPtr.Zero;
        }
    }

    private void WinEventProc(IntPtr hWinEventHook, uint eventType,
        IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
    {
        ProcessForegroundWindow(hwnd);
    }

    private void OnPollingTick(object? sender, System.Timers.ElapsedEventArgs e)
    {
        var hwnd = GetForegroundWindow();
        ProcessForegroundWindow(hwnd);
        AdjustPollingInterval();
    }

    private void ProcessForegroundWindow(IntPtr hwnd)
    {
        var title = new StringBuilder(256);
        GetWindowText(hwnd, title, title.Capacity);
        GetWindowThreadProcessId(hwnd, out uint pid);

        var processName = GetProcessNameById(pid);
        var titleStr = title.ToString();

        // 去重：同一个进程名 + 窗口标题不变则不重复触发
        if (processName == _lastProcessName && titleStr == _lastTitle)
            return;

        _lastProcessName = processName;
        _lastTitle = titleStr;

        ForegroundWindowChanged?.Invoke(this, new WindowChangeEventArgs
        {
            WindowTitle = titleStr,
            ProcessName = processName,
            ProcessId = pid,
            Timestamp = DateTime.Now
        });
    }
    private string _lastTitle = "";

    private string GetProcessNameById(uint pid)
    {
        // 缓存刷新
        if ((DateTime.Now - _lastCacheRefresh).TotalSeconds > 30)
        {
            _processNameCache.Clear();
            _lastCacheRefresh = DateTime.Now;
        }

        if (_processNameCache.TryGetValue(pid, out var cached))
            return cached;

        try
        {
            var process = Process.GetProcessById((int)pid);
            var name = process.ProcessName;
            _processNameCache[pid] = name;
            return name;
        }
        catch
        {
            return "Unknown";
        }
    }

    private void AdjustPollingInterval()
    {
        int newInterval = _lastProcessName switch
        {
            var n when IsGameProcess(n) => 1000,
            var n when n != "Idle" && n != "explorer" => 500,
            _ => 2000
        };

        if (newInterval != _currentIntervalMs)
        {
            _currentIntervalMs = newInterval;
            if (_pollingTimer != null)
                _pollingTimer.Interval = newInterval;
        }
    }

    private static bool IsGameProcess(string name) =>
        name.Contains("League", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("VALORANT", StringComparison.OrdinalIgnoreCase);

    public void Dispose()
    {
        Stop();
        _pollingTimer?.Dispose();
    }
}

public class WindowChangeEventArgs : EventArgs
{
    public string WindowTitle { get; init; } = "";
    public string ProcessName { get; init; } = "";
    public uint ProcessId { get; init; }
    public DateTime Timestamp { get; init; }
}

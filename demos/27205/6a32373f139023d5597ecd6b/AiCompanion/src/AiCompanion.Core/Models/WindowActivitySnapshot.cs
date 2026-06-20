namespace AiCompanion.Core.Models;

/// <summary>
/// 窗口活动快照——前台窗口的瞬时状态
/// 注意：此数据仅存于内存，不落盘、不上传
/// </summary>
public class WindowActivitySnapshot
{
    /// <summary>窗口标题</summary>
    public string WindowTitle { get; init; } = "";

    /// <summary>进程文件名（如 "League of Legends.exe"）</summary>
    public string ProcessName { get; init; } = "";

    /// <summary>进程 ID</summary>
    public uint ProcessId { get; init; }

    /// <summary>时间戳</summary>
    public DateTime Timestamp { get; init; } = DateTime.Now;

    /// <summary>人类可读的当前活动描述</summary>
    public string ActivityDescription => string.IsNullOrWhiteSpace(WindowTitle)
        ? ProcessName
        : $"{ProcessName} - {WindowTitle}";
}

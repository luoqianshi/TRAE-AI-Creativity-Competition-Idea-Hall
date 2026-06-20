using System.Diagnostics;
using System.Text;
using static AiCompanion.Infrastructure.Win32.NativeMethods;

namespace AiCompanion.Infrastructure.Win32;

/// <summary>
/// 进程信息辅助工具
/// </summary>
public static class ProcessHelper
{
    /// <summary>
    /// 根据进程 ID 获取完整进程名（含 .exe）
    /// </summary>
    public static string GetFullProcessName(uint pid)
    {
        try
        {
            var process = Process.GetProcessById((int)pid);
            return process.ProcessName + ".exe";
        }
        catch
        {
            return "Unknown";
        }
    }

    /// <summary>
    /// 根据进程 ID 获取窗口标题
    /// </summary>
    public static string GetWindowTitle(uint pid)
    {
        try
        {
            var process = Process.GetProcessById((int)pid);
            return process.MainWindowTitle;
        }
        catch
        {
            return "";
        }
    }

    /// <summary>
    /// 检查指定名称的进程是否正在运行
    /// </summary>
    public static bool IsProcessRunning(string processName)
    {
        return Process.GetProcessesByName(processName.Replace(".exe", "")).Length > 0;
    }

    /// <summary>
    /// 获取当前已运行的游戏进程
    /// </summary>
    public static List<string> GetRunningGameProcesses(List<string> gameProcessNames)
    {
        var running = new List<string>();
        foreach (var name in gameProcessNames)
        {
            if (IsProcessRunning(name))
                running.Add(name);
        }
        return running;
    }
}

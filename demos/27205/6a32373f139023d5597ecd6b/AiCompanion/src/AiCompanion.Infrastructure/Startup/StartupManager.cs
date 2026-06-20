using Microsoft.Win32;

namespace AiCompanion.Infrastructure.Startup;

/// <summary>
/// 开机自启管理——通过注册表 HKCU Run 键实现
/// 用户权限即可，无需管理员权限
/// </summary>
public static class StartupManager
{
    private const string RunKeyPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
    private const string AppName = "AIC Companion";

    /// <summary>
    /// 是否已设置开机自启
    /// </summary>
    public static bool IsStartupEnabled()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: false);
            return key?.GetValue(AppName) != null;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// 启用开机自启
    /// </summary>
    public static void EnableStartup()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: true);
        if (key == null)
        {
            using var createdKey = Registry.CurrentUser.CreateSubKey(RunKeyPath);
            createdKey?.SetValue(AppName, GetStartupCommand());
            return;
        }
        key.SetValue(AppName, GetStartupCommand());
    }

    /// <summary>
    /// 禁用开机自启
    /// </summary>
    public static void DisableStartup()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: true);
        key?.DeleteValue(AppName, throwOnMissingValue: false);
    }

    /// <summary>
    /// 生成带参数的启动命令（区分开机自启和手动启动）
    /// </summary>
    private static string GetStartupCommand()
    {
        var exePath = Environment.ProcessPath ??
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AiCompanion.exe");
        return $"\"{exePath}\" --autostart --minimized";
    }
}

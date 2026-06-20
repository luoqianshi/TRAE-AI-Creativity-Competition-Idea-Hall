namespace AiCompanion.Core.Services;

/// <summary>
/// 行为引擎——根据窗口活动规则调度行为
/// </summary>
public interface IBehaviorEngine
{
    event EventHandler<string>? ReactionTriggered;
    void OnWindowActivityChanged(string processName, string windowTitle);
    void OnGameDetected(string gameName);
    void OnGameExited(string gameName);
    bool IsInGame { get; }
    string? CurrentGame { get; }
}

namespace AiCompanion.Core.Services;

/// <summary>
/// 主动对话触发调度器——根据用户行为决定是否主动发起对话
/// </summary>
public interface IConversationTrigger
{
    event EventHandler<string>? ProactiveConversationShouldStart;
    void Start();
    void Stop();
    void UpdateContext(string processName, string windowTitle);
    void Pause();
    void Resume();
}

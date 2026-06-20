namespace AiCompanion.Core.Services;

/// <summary>
/// 提示词构建服务接口
/// </summary>
public interface IPromptBuilder
{
    string BuildSystemPrompt(string? activityContext = null);
    string GetRandomGreeting();
    string GetContextualGreeting(string processName, string? windowTitle = null);
}

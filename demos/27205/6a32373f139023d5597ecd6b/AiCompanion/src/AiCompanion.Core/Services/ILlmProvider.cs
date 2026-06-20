using AiCompanion.Core.Models;

namespace AiCompanion.Core.Services;

/// <summary>
/// LLM 提供器统一接口
/// </summary>
public interface ILlmProvider
{
    string ProviderName { get; }
    string CurrentModel { get; }
    IAsyncEnumerable<string> ChatStreamAsync(List<ChatMessage> history, CancellationToken ct);
    Task<bool> IsAvailableAsync();
    Task<List<string>> GetAvailableModelsAsync();
}

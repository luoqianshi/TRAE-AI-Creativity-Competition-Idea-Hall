namespace AiCompanion.Core.Services;

/// <summary>
/// LLM 服务管理器——管理 LLM Provider 的切换与统一调用
/// </summary>
public class LlmService
{
    private ILlmProvider _activeProvider;
    private readonly ILlmProvider? _fallbackProvider;

    public ILlmProvider ActiveProvider => _activeProvider;
    public event EventHandler<ILlmProvider>? ProviderChanged;
    public event EventHandler<string>? ProviderStatusChanged;

    public LlmService(ILlmProvider primaryProvider, ILlmProvider? fallbackProvider = null)
    {
        _activeProvider = primaryProvider;
        _fallbackProvider = fallbackProvider;
    }

    /// <summary>
    /// 切换到指定 Provider，失败则回退
    /// </summary>
    public async Task<bool> SwitchProviderAsync(ILlmProvider newProvider)
    {
        if (await newProvider.IsAvailableAsync())
        {
            _activeProvider = newProvider;
            ProviderChanged?.Invoke(this, _activeProvider);
            ProviderStatusChanged?.Invoke(this, $"已切换到 {newProvider.ProviderName}");
            return true;
        }

        ProviderStatusChanged?.Invoke(this, $"{newProvider.ProviderName} 不可用");
        return false;
    }

    /// <summary>
    /// 检测并自动切换到可用的 Provider
    /// </summary>
    public async Task AutoDetectAndSwitchAsync()
    {
        if (await _activeProvider.IsAvailableAsync())
        {
            ProviderStatusChanged?.Invoke(this, $"当前使用: {_activeProvider.ProviderName}");
            return;
        }

        if (_fallbackProvider != null && await _fallbackProvider.IsAvailableAsync())
        {
            _activeProvider = _fallbackProvider;
            ProviderChanged?.Invoke(this, _activeProvider);
            ProviderStatusChanged?.Invoke(this, $"自动切换到: {_fallbackProvider.ProviderName}");
        }
        else
        {
            ProviderStatusChanged?.Invoke(this, "无可用 AI 后端，请检查配置");
        }
    }
}

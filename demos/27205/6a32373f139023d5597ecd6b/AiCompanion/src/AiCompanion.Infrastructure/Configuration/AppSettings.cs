namespace AiCompanion.Infrastructure.Configuration;

/// <summary>
/// 应用强类型配置
/// </summary>
public class AppSettings
{
    /// <summary>Ollama 服务地址</summary>
    public string OllamaUrl { get; set; } = "http://localhost:11434";

    /// <summary>Ollama 模型名</summary>
    public string OllamaModel { get; set; } = "qwen2.5:7b";

    /// <summary>OpenAI API Key（用户自行填入）</summary>
    public string OpenAiApiKey { get; set; } = "";

    /// <summary>OpenAI 兼容 API 端点</summary>
    public string OpenAiApiUrl { get; set; } = "https://api.openai.com/v1";

    /// <summary>云端模型名</summary>
    public string OpenAiModel { get; set; } = "gpt-4o-mini";

    /// <summary>当前使用的 Provider 类型: "ollama" | "openai"</summary>
    public string ActiveProvider { get; set; } = "ollama";

    /// <summary>开机自启</summary>
    public bool AutoStart { get; set; }

    /// <summary>是否启用窗口监控</summary>
    public bool EnableWindowMonitoring { get; set; } = true;

    /// <summary>主动对话间隔（分钟）</summary>
    public int ProactiveIntervalMinutes { get; set; } = 5;

    /// <summary>游戏进行中是否降低主动对话频率</summary>
    public bool QuietDuringGame { get; set; } = true;
}

using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using AiCompanion.Core.Models;

namespace AiCompanion.Core.Services;

/// <summary>
/// Ollama 本地 LLM Provider——通过 Ollama REST API 交互
/// </summary>
public class OllamaLlmProvider : ILlmProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private string _model;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public string ProviderName => "Ollama (本地)";
    public string CurrentModel => _model;

    public OllamaLlmProvider(string baseUrl = "http://localhost:11434", string model = "qwen2.5:7b")
    {
        _baseUrl = baseUrl;
        _model = model;
        _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromMinutes(5),
            BaseAddress = new Uri(_baseUrl)
        };
    }

    public void SetModel(string model) => _model = model;

    public async IAsyncEnumerable<string> ChatStreamAsync(
        List<ChatMessage> history,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var ollamaMessages = history.Select(m => new
        {
            role = m.Role,
            content = m.Content
        });

        var requestBody = new
        {
            model = _model,
            messages = ollamaMessages,
            stream = true,
            options = new { temperature = 0.7, top_p = 0.9 }
        };

        var json = JsonSerializer.Serialize(requestBody, JsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/chat") { Content = content };
        using var response = await _httpClient.SendAsync(request,
            HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;

            try
            {
                using var doc = JsonDocument.Parse(line);
                var root = doc.RootElement;

                if (root.TryGetProperty("done", out var done) && done.GetBoolean())
                    break;

                if (root.TryGetProperty("message", out var msg) &&
                    msg.TryGetProperty("content", out var contentEl))
                {
                    var text = contentEl.GetString();
                    if (!string.IsNullOrEmpty(text))
                        yield return text;
                }
            }
            catch { /* skip malformed lines */ }
        }
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/tags");
            return response.IsSuccessStatusCode;
        }
        catch { return false; }
    }

    public async Task<List<string>> GetAvailableModelsAsync()
    {
        try
        {
            var response = await _httpClient.GetStringAsync("/api/tags");
            using var doc = JsonDocument.Parse(response);
            var models = new List<string>();

            if (doc.RootElement.TryGetProperty("models", out var modelsArray))
            {
                foreach (var model in modelsArray.EnumerateArray())
                {
                    if (model.TryGetProperty("name", out var name))
                        models.Add(name.GetString() ?? "");
                }
            }
            return models;
        }
        catch { return new List<string>(); }
    }
}

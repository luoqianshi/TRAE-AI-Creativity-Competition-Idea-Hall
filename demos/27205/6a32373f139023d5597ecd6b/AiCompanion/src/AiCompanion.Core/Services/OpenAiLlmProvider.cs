using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using AiCompanion.Core.Models;

namespace AiCompanion.Core.Services;

/// <summary>
/// OpenAI 兼容 LLM Provider——支持 OpenAI 及任何兼容 API 端点
/// </summary>
public class OpenAiLlmProvider : ILlmProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly string _baseUrl;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public string ProviderName => $"云端 ({_model})";
    public string CurrentModel => _model;

    public OpenAiLlmProvider(string apiKey, string model = "gpt-4o-mini",
        string baseUrl = "https://api.openai.com/v1")
    {
        _apiKey = apiKey;
        _model = model;
        _baseUrl = baseUrl;
        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async IAsyncEnumerable<string> ChatStreamAsync(
        List<ChatMessage> history,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var openAiMessages = history.Select(m => new
        {
            role = m.Role,
            content = m.Content
        });

        var requestBody = new
        {
            model = _model,
            messages = openAiMessages,
            stream = true,
            temperature = 0.7,
            max_tokens = 500
        };

        var json = JsonSerializer.Serialize(requestBody, JsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"{_baseUrl.TrimEnd('/')}/chat/completions";
        var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };

        using var response = await _httpClient.SendAsync(request,
            HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;
            if (!line.StartsWith("data: ")) continue;

            var data = line[6..];
            if (data == "[DONE]") break;

            try
            {
                using var doc = JsonDocument.Parse(data);
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0) continue;

                var delta = choices[0].GetProperty("delta");
                if (delta.TryGetProperty("content", out var contentEl))
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
            var url = $"{_baseUrl.TrimEnd('/')}/models";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch { return false; }
    }

    public async Task<List<string>> GetAvailableModelsAsync()
    {
        try
        {
            var url = $"{_baseUrl.TrimEnd('/')}/models";
            var json = await _httpClient.GetStringAsync(url);
            using var doc = JsonDocument.Parse(json);
            var models = new List<string>();

            if (doc.RootElement.TryGetProperty("data", out var dataArray))
            {
                foreach (var item in dataArray.EnumerateArray())
                {
                    if (item.TryGetProperty("id", out var id))
                        models.Add(id.GetString() ?? "");
                }
            }
            return models;
        }
        catch { return new List<string>(); }
    }
}

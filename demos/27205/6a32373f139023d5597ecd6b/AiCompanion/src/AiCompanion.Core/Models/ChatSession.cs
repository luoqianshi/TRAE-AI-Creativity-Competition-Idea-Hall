using System.Text.Json.Serialization;

namespace AiCompanion.Core.Models;

/// <summary>
/// 对话会话
/// </summary>
public class ChatSession
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    [JsonPropertyName("character_id")]
    public string CharacterId { get; set; } = "";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// 对话摘要（用于列表展示）
    /// </summary>
    [JsonPropertyName("summary")]
    public string Summary { get; set; } = "新对话";
}

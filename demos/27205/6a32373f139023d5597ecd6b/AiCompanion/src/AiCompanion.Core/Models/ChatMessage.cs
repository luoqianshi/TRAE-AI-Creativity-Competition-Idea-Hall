using System.Text.Json.Serialization;

namespace AiCompanion.Core.Models;

/// <summary>
/// 聊天消息
/// </summary>
public class ChatMessage
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    [JsonPropertyName("role")]
    public string Role { get; set; } = "user"; // user / assistant / system

    [JsonPropertyName("content")]
    public string Content { get; set; } = "";

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.Now;

    [JsonPropertyName("session_id")]
    public string SessionId { get; set; } = "";

    /// <summary>
    /// 关联的表情状态（仅角色消息有效）
    /// </summary>
    [JsonPropertyName("expression")]
    public string? Expression { get; set; }
}

using System.Text.Json;
using AiCompanion.Core.Models;

namespace AiCompanion.Infrastructure.Storage;

/// <summary>
/// 聊天记录本地持久化——使用 JSON 文件
/// </summary>
public class ChatHistoryRepository
{
    private readonly string _dataDir;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ChatHistoryRepository(string? dataDir = null)
    {
        _dataDir = dataDir ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data");
        if (!Directory.Exists(_dataDir))
            Directory.CreateDirectory(_dataDir);
    }

    /// <summary>
    /// 保存会话的所有消息
    /// </summary>
    public void SaveMessages(string sessionId, List<ChatMessage> messages)
    {
        var path = GetSessionFilePath(sessionId);
        var json = JsonSerializer.Serialize(messages, JsonOptions);
        File.WriteAllText(path, json);
    }

    /// <summary>
    /// 加载会话的所有消息
    /// </summary>
    public List<ChatMessage> LoadMessages(string sessionId)
    {
        var path = GetSessionFilePath(sessionId);
        if (!File.Exists(path))
            return new List<ChatMessage>();

        try
        {
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<List<ChatMessage>>(json, JsonOptions)
                   ?? new List<ChatMessage>();
        }
        catch
        {
            return new List<ChatMessage>();
        }
    }

    /// <summary>
    /// 获取所有会话
    /// </summary>
    public List<ChatSession> GetAllSessions()
    {
        var sessionsFile = Path.Combine(_dataDir, "sessions.json");
        if (!File.Exists(sessionsFile))
            return new List<ChatSession>();

        try
        {
            var json = File.ReadAllText(sessionsFile);
            return JsonSerializer.Deserialize<List<ChatSession>>(json, JsonOptions)
                   ?? new List<ChatSession>();
        }
        catch
        {
            return new List<ChatSession>();
        }
    }

    /// <summary>
    /// 保存会话元数据
    /// </summary>
    public void SaveSessions(List<ChatSession> sessions)
    {
        var path = Path.Combine(_dataDir, "sessions.json");
        var json = JsonSerializer.Serialize(sessions, JsonOptions);
        File.WriteAllText(path, json);
    }

    /// <summary>
    /// 删除会话及其消息
    /// </summary>
    public void DeleteSession(string sessionId)
    {
        var path = GetSessionFilePath(sessionId);
        if (File.Exists(path))
            File.Delete(path);
    }

    private string GetSessionFilePath(string sessionId) =>
        Path.Combine(_dataDir, $"chat_{sessionId}.json");
}

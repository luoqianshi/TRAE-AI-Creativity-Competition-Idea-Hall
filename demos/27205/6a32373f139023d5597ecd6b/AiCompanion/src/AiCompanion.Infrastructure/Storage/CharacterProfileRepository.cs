using System.Text.Json;
using AiCompanion.Core.Models;

namespace AiCompanion.Infrastructure.Storage;

/// <summary>
/// 角色档案本地持久化
/// </summary>
public class CharacterProfileRepository
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public CharacterProfileRepository(string? dataDir = null)
    {
        var dir = dataDir ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data");
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        _filePath = Path.Combine(dir, "characters.json");
    }

    public List<CharacterProfile> LoadAll()
    {
        if (!File.Exists(_filePath))
            return new List<CharacterProfile>();

        try
        {
            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<CharacterProfile>>(json, JsonOptions)
                   ?? new List<CharacterProfile>();
        }
        catch
        {
            return new List<CharacterProfile>();
        }
    }

    public void SaveAll(List<CharacterProfile> profiles)
    {
        var json = JsonSerializer.Serialize(profiles, JsonOptions);
        File.WriteAllText(_filePath, json);
    }
}

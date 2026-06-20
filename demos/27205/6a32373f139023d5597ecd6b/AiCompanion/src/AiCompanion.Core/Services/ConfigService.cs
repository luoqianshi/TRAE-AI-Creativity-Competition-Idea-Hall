using System.Text.Json;
using System.Text.Json.Serialization;

namespace AiCompanion.Core.Services;

/// <summary>
/// 配置服务实现——基于 JSON 文件的配置读写
/// </summary>
public class ConfigService : IConfigService
{
    private readonly string _configDir;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public ConfigService(string? configDir = null)
    {
        _configDir = configDir ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data");
        if (!Directory.Exists(_configDir))
            Directory.CreateDirectory(_configDir);
    }

    public string GetConfigDir() => _configDir;

    public T? Load<T>(string fileName) where T : class
    {
        var path = Path.Combine(_configDir, fileName);
        if (!File.Exists(path)) return null;

        try
        {
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    public void Save<T>(string fileName, T config) where T : class
    {
        var path = Path.Combine(_configDir, fileName);
        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);

        var json = JsonSerializer.Serialize(config, JsonOptions);
        File.WriteAllText(path, json);
    }
}

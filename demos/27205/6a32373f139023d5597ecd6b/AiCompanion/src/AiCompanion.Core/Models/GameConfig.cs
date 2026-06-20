using System.Text.Json.Serialization;

namespace AiCompanion.Core.Models;

/// <summary>
/// 游戏检测配置
/// </summary>
public class GameConfig
{
    [JsonPropertyName("games")]
    public List<GameDefinition> Games { get; set; } = new();
}

public class GameDefinition
{
    [JsonPropertyName("processName")]
    public string ProcessName { get; set; } = "";

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = "";

    [JsonPropertyName("ocrRegion")]
    public OcrRegion? OcrRegion { get; set; }

    [JsonPropertyName("events")]
    public List<GameEventDefinition> Events { get; set; } = new();
}

public class OcrRegion
{
    [JsonPropertyName("xRatio")] public double XRatio { get; set; } = 0.3;
    [JsonPropertyName("yRatio")] public double YRatio { get; set; } = 0.75;
    [JsonPropertyName("wRatio")] public double WRatio { get; set; } = 0.4;
    [JsonPropertyName("hRatio")] public double HRatio { get; set; } = 0.08;
}

public class GameEventDefinition
{
    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; } = new();

    [JsonPropertyName("reactions")]
    public List<string> Reactions { get; set; } = new();
}

/// <summary>
/// 检测到的游戏事件
/// </summary>
public class GameEvent
{
    public string GameName { get; set; } = "";
    public string Keyword { get; set; } = "";
    public string Reaction { get; set; } = "";
    public DateTime Timestamp { get; set; } = DateTime.Now;
}

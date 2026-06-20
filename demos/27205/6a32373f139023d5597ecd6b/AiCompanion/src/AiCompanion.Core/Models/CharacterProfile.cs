using System.Text.Json.Serialization;

namespace AiCompanion.Core.Models;

/// <summary>
/// 角色档案——定义虚拟角色的完整人设
/// </summary>
public class CharacterProfile
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    [JsonPropertyName("name")]
    public string Name { get; set; } = "小萤";

    [JsonPropertyName("age")]
    public int Age { get; set; } = 21;

    [JsonPropertyName("gender")]
    public string Gender { get; set; } = "female";

    [JsonPropertyName("personality")]
    public string Personality { get; set; } = "活泼开朗、爱撒娇、偶尔毒舌";

    [JsonPropertyName("identity")]
    public string Identity { get; set; } = "来自异世界的见习魔法师";

    [JsonPropertyName("relationship")]
    public string Relationship { get; set; } = "女友";

    [JsonPropertyName("traits")]
    public List<string> Traits { get; set; } = new() { "主动", "好奇心强", "爱吐槽" };

    [JsonPropertyName("appearance")]
    public CharacterAppearance Appearance { get; set; } = new();

    [JsonPropertyName("voice_style")]
    public string VoiceStyle { get; set; } = "活泼少女音";

    /// <summary>
    /// 生成 System Prompt 中使用的角色描述
    /// </summary>
    public string GetSystemPromptDescription()
    {
        return $"你叫{Name}，是一个{Age}岁的{GetGenderText()}。{Identity}。" +
               $"性格{Personality}。你们的关系是{Relationship}。" +
               $"说话风格：{VoiceStyle}。";
    }

    private string GetGenderText() => Gender switch
    {
        "female" => "女孩",
        "male" => "男孩",
        _ => "人"
    };

    public CharacterProfile Clone()
    {
        return new CharacterProfile
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Name = Name,
            Age = Age,
            Gender = Gender,
            Personality = Personality,
            Identity = Identity,
            Relationship = Relationship,
            Traits = new List<string>(Traits),
            Appearance = new CharacterAppearance
            {
                AvatarPath = Appearance.AvatarPath,
                HairColor = Appearance.HairColor,
                EyeColor = Appearance.EyeColor
            },
            VoiceStyle = VoiceStyle
        };
    }
}

public class CharacterAppearance
{
    [JsonPropertyName("avatar_path")]
    public string AvatarPath { get; set; } = "default_01";

    [JsonPropertyName("hair_color")]
    public string HairColor { get; set; } = "银色";

    [JsonPropertyName("eye_color")]
    public string EyeColor { get; set; } = "紫色";
}

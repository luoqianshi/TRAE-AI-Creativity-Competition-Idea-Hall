using AiCompanion.Core.Models;

namespace AiCompanion.Core.Utils;

/// <summary>
/// 角色随机生成器——从模板库中随机组合生成角色
/// </summary>
public class CharacterGenerator
{
    private static readonly Random _rng = new();

    private static readonly string[] FirstNames = { "小萤", "小樱", "小灵", "小雪", "小月", "小星", "小梦", "小晴", "小璃", "小瑶" };
    private static readonly string[] Personalities = { "活泼开朗", "温柔体贴", "清冷傲娇", "元气满满", "慵懒随性", "认真严谨", "古灵精怪" };
    private static readonly string[] Identities = { "来自异世界的见习魔法师", "自称是人工智能生命体", "来自未来的时间旅行者", "正在实习的小护士", "退役的女武神", "迷路的精灵族少女", "热爱游戏的宅女", "自称是你的守护灵" };
    private static readonly string[] Relationships = { "女友", "青梅竹马", "搭档", "学姐", "同居室友" };
    private static readonly string[][] TraitGroups =
    {
        new[] { "主动", "好奇心强", "爱吐槽", "打游戏时会变热血" },
        new[] { "温柔", "善于倾听", "偶尔撒娇", "会为你着想" },
        new[] { "傲娇", "毒舌", "口是心非", "其实很关心你" },
        new[] { "元气", "话多", "永远正能量", "喜欢鼓励人" },
        new[] { "慵懒", "佛系", "喜欢摸鱼", "偶尔蹦出金句" },
        new[] { "严谨", "有条理", "乐于助人", "有点老妈子属性" },
        new[] { "调皮", "爱恶作剧", "充满好奇心", "脑洞大开" }
    };
    private static readonly string[] HairColors = { "银色", "粉色", "蓝色", "黑色", "金色", "棕色", "紫色" };
    private static readonly string[] EyeColors = { "紫色", "蓝色", "绿色", "红色", "金色", "棕色", "灰色" };
    private static readonly string[] VoiceStyles = { "活泼少女音", "温柔御姐音", "傲娇少女音", "元气少女音", "慵懒少女音" };

    /// <summary>
    /// 从预设角色库创建一个角色
    /// </summary>
    public static CharacterProfile CreatePreset(int index)
    {
        return index switch
        {
            1 => new CharacterProfile
            {
                Name = "小雪", Age = 20, Gender = "female",
                Personality = "清冷傲娇、毒舌但内心温柔",
                Identity = "退役的女武神，因为无聊所以跑来当你桌面助手",
                Relationship = "学姐",
                Traits = new List<string> { "傲娇", "毒舌", "口是心非", "其实很关心你" },
                Appearance = new CharacterAppearance { HairColor = "银色", EyeColor = "蓝色" },
                VoiceStyle = "傲娇少女音"
            },
            2 => new CharacterProfile
            {
                Name = "小晴", Age = 22, Gender = "female",
                Personality = "元气满满、永远充满能量",
                Identity = "自称是你的守护灵，存在的意义就是让你开心",
                Relationship = "搭档",
                Traits = new List<string> { "元气", "话多", "永远正能量", "喜欢鼓励人" },
                Appearance = new CharacterAppearance { HairColor = "粉色", EyeColor = "绿色" },
                VoiceStyle = "元气少女音"
            },
            _ => CreateRandom()
        };
    }

    /// <summary>
    /// 随机生成一个角色
    /// </summary>
    public static CharacterProfile CreateRandom()
    {
        var traitIndex = _rng.Next(TraitGroups.Length);
        return new CharacterProfile
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Name = FirstNames[_rng.Next(FirstNames.Length)],
            Age = _rng.Next(18, 26),
            Gender = "female",
            Personality = Personalities[_rng.Next(Personalities.Length)],
            Identity = Identities[_rng.Next(Identities.Length)],
            Relationship = Relationships[_rng.Next(Relationships.Length)],
            Traits = new List<string>(TraitGroups[traitIndex]),
            Appearance = new CharacterAppearance
            {
                HairColor = HairColors[_rng.Next(HairColors.Length)],
                EyeColor = EyeColors[_rng.Next(EyeColors.Length)]
            },
            VoiceStyle = VoiceStyles[traitIndex % VoiceStyles.Length]
        };
    }
}

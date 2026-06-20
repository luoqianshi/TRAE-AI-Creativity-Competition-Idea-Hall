namespace AiCompanion.Core.Utils;

/// <summary>
/// 简单情绪分析器——根据文本关键词推断角色应展示的表情
/// </summary>
public static class EmotionAnalyzer
{
    private static readonly Dictionary<string, string[]> EmotionKeywords = new()
    {
        ["happy"] = new[] { "哈哈", "好开心", "太棒了", "喜欢", "嘿嘿", "(*^▽^*)" },
        ["surprised"] = new[] { "天哪", "不会吧", "真的吗", "什么", "居然", "Σ(⊙▽⊙" },
        ["sad"] = new[] { "难过", "伤心", "呜呜", "哭", "生气", "(╥﹏╥)" },
        ["angry"] = new[] { "过分", "可恶", "气死", "哼", "不行", "ヽ(≧Д≦)ノ" },
        ["blush"] = new[] { "害羞", "不好意思", "讨厌", "///", "(〃▽〃)" }
    };

    /// <summary>
    /// 根据文本内容推断情绪
    /// </summary>
    public static string Analyze(string text)
    {
        foreach (var (emotion, keywords) in EmotionKeywords)
        {
            if (keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase)))
                return emotion;
        }
        return "idle"; // 默认无表情
    }
}

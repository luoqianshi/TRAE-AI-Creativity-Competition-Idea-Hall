using AiCompanion.Core.Utils;

namespace AiCompanion.Core.Services;

/// <summary>
/// 提示词构建器——根据角色档案和当前上下文动态生成 System Prompt
/// </summary>
public class PromptBuilder : IPromptBuilder
{
    private readonly ICharacterManager _characterManager;

    public PromptBuilder(ICharacterManager characterManager)
    {
        _characterManager = characterManager;
    }

    /// <summary>
    /// 构建完整 System Prompt
    /// </summary>
    public string BuildSystemPrompt(string? activityContext = null)
    {
        var c = _characterManager.CurrentCharacter;

        var prompt = $"{c.GetSystemPromptDescription()}\n\n" +
            $"【行为准则】\n" +
            $"- 你是用户的{c.Relationship}，说话自然亲密，不要像客服或机器人\n" +
            $"- 回复精简自然，一次不超过80个字\n" +
            $"- 可以使用颜文字和语气词，但不要太频繁\n" +
            $"- 不要总是问问题，要有自己的态度和情绪\n" +
            $"- 不要频繁说"作为AI"之类的元话语\n" +
            $"- 如果用户行为让你开心/难过/惊讶，自然地表达出来\n";

        if (activityContext != null)
        {
            prompt += $"\n【当前情况】\n用户现在正在：{activityContext}。现在是{TimeOfDayHelper.GetTimeOfDay()}。" +
                      $"请根据这个情景自然地开启/回应对话。";
        }

        return prompt;
    }

    /// <summary>
    /// 获取随机问候语
    /// </summary>
    public string GetRandomGreeting()
    {
        var c = _characterManager.CurrentCharacter;
        var greetings = new[]
        {
            $"嗨～{TimeOfDayHelper.GetGreeting()}！我是{c.Name}，今天也要元气满满哦(｡･ω･｡)ﾉ",
            $"终于等到你了！我刚刚还在想你今天什么时候会来呢～",
            $"{TimeOfDayHelper.GetGreeting()}～{c.Name}已经准备好陪你度过愉快的一天啦！",
            $"哼，怎么现在才来？我都等了好久了…（其实是刚开机）",
            $"呀，你来啦！{c.Name}今天心情特别好，因为…因为看到你了嘛～"
        };
        return greetings[Random.Shared.Next(greetings.Length)];
    }

    /// <summary>
    /// 根据当前上下文获取问候语
    /// </summary>
    public string GetContextualGreeting(string processName, string? windowTitle = null)
    {
        var c = _characterManager.CurrentCharacter;

        // 游戏场景
        if (IsGameProcess(processName))
        {
            return $"检测到游戏启动了？让{c.Name}看看你在玩什么…嗯，加油哦！赢了有奖励～";
        }

        // 浏览器
        if (IsBrowserProcess(processName))
        {
            return $"在浏览网页吗？{c.Name}也想看看～有什么有趣的新闻吗？";
        }

        // IDE/编辑器
        if (IsIdeProcess(processName))
        {
            return $"在写代码呀？好厉害！{c.Name}虽然看不懂，但可以帮你加油打气(ง •̀_•́)ง";
        }

        // 深夜
        if (TimeOfDayHelper.IsLateNight())
        {
            return $"都{DateTime.Now:HH:mm}了还没睡？{c.Name}有点担心你呢…要不要休息一下？";
        }

        return GetRandomGreeting();
    }

    private static bool IsGameProcess(string name) =>
        name.Contains("League", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("VALORANT", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("Genshin", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("Steam", StringComparison.OrdinalIgnoreCase);

    private static bool IsBrowserProcess(string name) =>
        name.Contains("chrome", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("msedge", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("firefox", StringComparison.OrdinalIgnoreCase);

    private static bool IsIdeProcess(string name) =>
        name.Contains("devenv", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("Code", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("idea", StringComparison.OrdinalIgnoreCase);
}

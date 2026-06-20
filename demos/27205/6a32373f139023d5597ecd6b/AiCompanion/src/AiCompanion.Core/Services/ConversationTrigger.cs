using AiCompanion.Core.Utils;

namespace AiCompanion.Core.Services;

/// <summary>
/// 主动对话触发调度器——基于定时器 + 概率 + 上下文决定是否主动开口
/// </summary>
public class ConversationTrigger : IConversationTrigger
{
    private readonly IPromptBuilder _promptBuilder;
    private readonly System.Timers.Timer _triggerTimer;
    private readonly Random _rng = new();
    private string _currentProcessName = "";
    private string _currentWindowTitle = "";
    private DateTime _lastConversationTime = DateTime.MinValue;
    private bool _isPaused;
    private DateTime _startTime = DateTime.Now;
    private bool _firstGreetingSent;

    public event EventHandler<string>? ProactiveConversationShouldStart;

    public ConversationTrigger(IPromptBuilder promptBuilder, int intervalMinutes = 3)
    {
        _promptBuilder = promptBuilder;
        _triggerTimer = new System.Timers.Timer(TimeSpan.FromMinutes(intervalMinutes).TotalMilliseconds);
        _triggerTimer.Elapsed += OnTriggerTick;
        _triggerTimer.AutoReset = true;
    }

    public void Start()
    {
        _startTime = DateTime.Now;
        _firstGreetingSent = false;
        _triggerTimer.Start();
    }

    public void Stop() => _triggerTimer.Stop();
    public void Pause() => _isPaused = true;
    public void Resume() => _isPaused = false;

    public void UpdateContext(string processName, string windowTitle)
    {
        _currentProcessName = processName;
        _currentWindowTitle = windowTitle;
    }

    private void OnTriggerTick(object? sender, System.Timers.ElapsedEventArgs e)
    {
        if (_isPaused) return;
        if ((DateTime.Now - _lastConversationTime).TotalMinutes < 3) return; // 冷却

        // 启动后第一时间打招呼
        if (!_firstGreetingSent && (DateTime.Now - _startTime).TotalSeconds > 5)
        {
            _firstGreetingSent = true;
            var greeting = _promptBuilder.GetContextualGreeting(_currentProcessName, _currentWindowTitle);
            ProactiveConversationShouldStart?.Invoke(this, greeting);
            _lastConversationTime = DateTime.Now;
            return;
        }

        // 概率触发
        var probability = CalculateTriggerProbability();
        if (_rng.NextDouble() < probability)
        {
            var greeting = _promptBuilder.GetContextualGreeting(_currentProcessName, _currentWindowTitle);
            ProactiveConversationShouldStart?.Invoke(this, greeting);
            _lastConversationTime = DateTime.Now;
        }
    }

    private double CalculateTriggerProbability()
    {
        double baseProbability = 0.15; // 基准 15%

        // 深夜概率翻倍
        if (TimeOfDayHelper.IsLateNight())
            baseProbability *= 2.0;

        // 游戏进行中概率减半
        if (IsGameProcess(_currentProcessName))
            baseProbability *= 0.5;

        return Math.Min(baseProbability, 0.6);
    }

    private static bool IsGameProcess(string name) =>
        name.Contains("League", StringComparison.OrdinalIgnoreCase) ||
        name.Contains("VALORANT", StringComparison.OrdinalIgnoreCase);
}

using AiCompanion.Core.Events;
using AiCompanion.Core.Models;

namespace AiCompanion.Core.Services;

/// <summary>
/// 行为引擎——检测用户行为并触发对应反应
/// </summary>
public class BehaviorEngine : IBehaviorEngine
{
    private readonly IConfigService _configService;
    private GameConfig? _gameConfig;
    private string? _lastProcessName;
    private DateTime _lastSwitchTime = DateTime.Now;
    private int _switchCount;
    private readonly System.Timers.Timer _idleCheckTimer;
    private DateTime _lastUserActivity = DateTime.Now;
    private bool _isIdleDetected;

    public event EventHandler<string>? ReactionTriggered;
    public bool IsInGame { get; private set; }
    public string? CurrentGame { get; private set; }

    public BehaviorEngine(IConfigService configService)
    {
        _configService = configService;
        _gameConfig = _configService.Load<GameConfig>("game_config.json") ?? new GameConfig();

        _idleCheckTimer = new System.Timers.Timer(60_000); // 每分钟检查一次
        _idleCheckTimer.Elapsed += OnIdleCheck;
        _idleCheckTimer.AutoReset = true;
    }

    public void Start() => _idleCheckTimer.Start();
    public void Stop() => _idleCheckTimer.Stop();

    public void OnWindowActivityChanged(string processName, string windowTitle)
    {
        _lastUserActivity = DateTime.Now;
        _isIdleDetected = false;

        // 检测应用切换频率
        if (processName != _lastProcessName)
        {
            _switchCount++;
            if (_switchCount > 10 && (DateTime.Now - _lastSwitchTime).TotalMinutes < 1)
            {
                ReactionTriggered?.Invoke(this, "频繁切换");
                _switchCount = 0;
                _lastSwitchTime = DateTime.Now;
            }
            _lastProcessName = processName;
        }

        // 检测游戏进程
        if (!IsInGame && IsGameProcess(processName))
        {
            IsInGame = true;
            CurrentGame = GetGameDisplayName(processName);
            ReactionTriggered?.Invoke(this, $"进入游戏:{CurrentGame}");
        }
        else if (IsInGame && !IsGameProcess(processName))
        {
            var exitedGame = CurrentGame;
            IsInGame = false;
            CurrentGame = null;
            ReactionTriggered?.Invoke(this, $"退出游戏:{exitedGame}");
        }
    }

    public void OnGameDetected(string gameName)
    {
        IsInGame = true;
        CurrentGame = gameName;
    }

    public void OnGameExited(string gameName)
    {
        IsInGame = false;
        CurrentGame = null;
    }

    private void OnIdleCheck(object? sender, System.Timers.ElapsedEventArgs e)
    {
        if (_isIdleDetected || IsInGame) return;

        var idleSeconds = (DateTime.Now - _lastUserActivity).TotalSeconds;
        if (idleSeconds > 300) // 5 分钟
        {
            _isIdleDetected = true;
            ReactionTriggered?.Invoke(this, "发呆超时");
        }
    }

    private bool IsGameProcess(string name)
    {
        return _gameConfig?.Games.Any(g =>
            g.ProcessName.Equals(name, StringComparison.OrdinalIgnoreCase)) ?? false;
    }

    private string GetGameDisplayName(string processName)
    {
        var game = _gameConfig?.Games.FirstOrDefault(g =>
            g.ProcessName.Equals(processName, StringComparison.OrdinalIgnoreCase));
        return game?.DisplayName ?? processName;
    }
}

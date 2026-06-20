using System.Windows;
using AiCompanion.App.ViewModels;
using AiCompanion.App.Views;
using AiCompanion.Animation;
using AiCompanion.Core.Services;
using AiCompanion.Infrastructure.Configuration;
using AiCompanion.Infrastructure.Startup;
using AiCompanion.Infrastructure.Win32;
using Microsoft.Extensions.DependencyInjection;

namespace AiCompanion.App;

public partial class App : Application
{
    private IServiceProvider? _serviceProvider;
    private WindowMonitor? _windowMonitor;
    private IBehaviorEngine? _behaviorEngine;
    private IConversationTrigger? _conversationTrigger;
    private RenderLayerWindow? _renderWindow;
    private InteractionLayerWindow? _interactionWindow;

    private void OnStartup(object sender, StartupEventArgs e)
    {
        var isAutoStart = e.Args.Contains("--autostart");
        var isMinimized = e.Args.Contains("--minimized");

        _serviceProvider = ConfigureServices();

        // 初始化核心服务
        InitializeCoreServices();

        // 创建悬浮角色窗口
        CreateOverlayWindows();

        if (isAutoStart && isMinimized)
        {
            // 开机自启：仅显示悬浮窗，最小化其他窗口
        }
    }

    private IServiceProvider ConfigureServices()
    {
        var services = new ServiceCollection();

        // === Infrastructure ===
        services.AddSingleton<WindowMonitor>();
        services.AddSingleton(new AppSettings());

        // === Core ===
        var configSvc = new ConfigService(
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data"));
        services.AddSingleton<IConfigService>(configSvc);
        services.AddSingleton<ICharacterManager>(new CharacterManager(configSvc));
        services.AddSingleton<IPromptBuilder, PromptBuilder>();
        services.AddSingleton<IBehaviorEngine, BehaviorEngine>();
        services.AddSingleton<IConversationTrigger>(sp =>
        {
            var promptBuilder = sp.GetRequiredService<IPromptBuilder>();
            return new ConversationTrigger(promptBuilder, intervalMinutes: 5);
        });

        // LLM Provider - 默认 Ollama
        services.AddSingleton<ILlmProvider>(sp =>
        {
            var settings = sp.GetRequiredService<AppSettings>();
            return new OllamaLlmProvider(settings.OllamaUrl, settings.OllamaModel);
        });

        services.AddSingleton(sp =>
        {
            var settings = sp.GetRequiredService<AppSettings>();
            var primary = sp.GetRequiredService<ILlmProvider>();
            var fallback = new OpenAiLlmProvider(settings.OpenAiApiKey,
                settings.OpenAiModel, settings.OpenAiApiUrl);
            return new LlmService(primary, fallback);
        });

        // === ViewModels ===
        services.AddSingleton<MainViewModel>();
        services.AddTransient<ChatViewModel>();
        services.AddTransient<SettingsViewModel>();

        return services.BuildServiceProvider();
    }

    private void InitializeCoreServices()
    {
        var charMgr = _serviceProvider!.GetRequiredService<ICharacterManager>();
        charMgr.LoadFromStorage();

        _behaviorEngine = _serviceProvider.GetRequiredService<IBehaviorEngine>();
        _conversationTrigger = _serviceProvider.GetRequiredService<IConversationTrigger>();

        // 窗口监控
        var settings = _serviceProvider.GetRequiredService<AppSettings>();
        if (settings.EnableWindowMonitoring)
        {
            _windowMonitor = _serviceProvider.GetRequiredService<WindowMonitor>();
            _windowMonitor.ForegroundWindowChanged += OnWindowChanged;
            _windowMonitor.Start();
        }

        // 行为引擎事件
        _behaviorEngine.ReactionTriggered += OnBehaviorReaction;

        // 主动对话触发
        _conversationTrigger.ProactiveConversationShouldStart += OnProactiveConversation;
        _conversationTrigger.Start();

        // 开机自启
        if (settings.AutoStart)
            StartupManager.EnableStartup();
    }

    private void CreateOverlayWindows()
    {
        var charMgr = _serviceProvider!.GetRequiredService<ICharacterManager>();
        var mainVm = _serviceProvider.GetRequiredService<MainViewModel>();

        // 底层：角色渲染窗口（透明，鼠标穿透）
        _renderWindow = new RenderLayerWindow
        {
            Left = SystemParameters.PrimaryScreenWidth - 350,
            Top = SystemParameters.PrimaryScreenHeight - 500,
            Width = 300,
            Height = 400
        };

        // 顶层：交互层
        _interactionWindow = new InteractionLayerWindow
        {
            Left = _renderWindow.Left,
            Top = _renderWindow.Top,
            Width = 300,
            Height = 400
        };

        // 绑定 ViewModel
        mainVm.Initialize(
            _serviceProvider.GetRequiredService<LlmService>(),
            _serviceProvider.GetRequiredService<IPromptBuilder>(),
            _renderWindow,
            _interactionWindow);

        _renderWindow.Show();
        _interactionWindow.Show();

        // 显示开机问候
        var promptBuilder = _serviceProvider.GetRequiredService<IPromptBuilder>();
        mainVm.TriggerProactiveGreeting(promptBuilder.GetRandomGreeting());
    }

    private async void OnWindowChanged(object? sender, WindowChangeEventArgs e)
    {
        await Dispatcher.InvokeAsync(() =>
        {
            _behaviorEngine?.OnWindowActivityChanged(e.ProcessName, e.WindowTitle);
            _conversationTrigger?.UpdateContext(e.ProcessName, e.WindowTitle);
        });
    }

    private async void OnBehaviorReaction(object? sender, string reaction)
    {
        await Dispatcher.InvokeAsync(() =>
        {
            var mainVm = _serviceProvider!.GetRequiredService<MainViewModel>();

            if (reaction.StartsWith("进入游戏:"))
            {
                var game = reaction["进入游戏:".Length..];
                mainVm.OnGameEntered(game);
            }
            else if (reaction.StartsWith("退出游戏:"))
            {
                var game = reaction["退出游戏:".Length..];
                mainVm.OnGameExited(game);
            }
            else if (reaction == "发呆超时")
            {
                _conversationTrigger?.Pause();
                var promptBuilder = _serviceProvider.GetRequiredService<IPromptBuilder>();
                var greeting = promptBuilder.GetContextualGreeting("idle", "发呆中");
                mainVm.TriggerProactiveGreeting(greeting);
                _conversationTrigger?.Resume();
            }
            else if (reaction == "频繁切换")
            {
                var promptBuilder = _serviceProvider.GetRequiredService<IPromptBuilder>();
                mainVm.TriggerProactiveGreeting(
                    "感觉你很焦虑呢，一直在切换窗口...遇到什么问题了吗？");
            }
        });
    }

    private async void OnProactiveConversation(object? sender, string message)
    {
        await Dispatcher.InvokeAsync(() =>
        {
            var mainVm = _serviceProvider!.GetRequiredService<MainViewModel>();
            mainVm.TriggerProactiveGreeting(message);
        });
    }

    private void OnExit(object sender, ExitEventArgs e)
    {
        _windowMonitor?.Dispose();
        _conversationTrigger?.Stop();
        _behaviorEngine?.Stop();

        var charMgr = _serviceProvider?.GetRequiredService<ICharacterManager>();
        charMgr?.SaveToStorage();
    }
}

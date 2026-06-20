using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Windows;
using AiCompanion.App.Views;
using AiCompanion.Core.Models;
using AiCompanion.Core.Services;

namespace AiCompanion.App.ViewModels;

/// <summary>
/// 主 ViewModel——协调悬浮窗、对话框、LLM 交互
/// </summary>
public class MainViewModel
{
    private RenderLayerWindow? _renderWindow;
    private InteractionLayerWindow? _interactionWindow;
    private ChatDialogWindow? _chatWindow;

    private LlmService? _llmService;
    private IPromptBuilder? _promptBuilder;
    private ICharacterManager? _charMgr;

    private readonly List<ChatMessage> _conversationHistory = new();
    private CancellationTokenSource? _chatCts;

    public CharacterProfile CurrentCharacter { get; private set; } = null!;

    public void Initialize(LlmService llmService, IPromptBuilder promptBuilder,
        RenderLayerWindow renderWindow, InteractionLayerWindow interactionWindow,
        ICharacterManager? charMgr = null)
    {
        _llmService = llmService;
        _promptBuilder = promptBuilder;
        _renderWindow = renderWindow;
        _interactionWindow = interactionWindow;
        _charMgr = charMgr;

        CurrentCharacter = _charMgr?.CurrentCharacter ?? new CharacterProfile();

        // 创建头像占位图
        CreatePlaceholderImage();

        // 绑定交互事件
        _interactionWindow.ChatRequested += OpenChatDialog;
        _interactionWindow.SettingsRequested += OpenSettings;
        _interactionWindow.CloseRequested += () => Environment.Exit(0);
        _interactionWindow.RefreshRequested += RegenerateCharacter;

        // 显示初始状态
        _renderWindow.ShowNameTag(CurrentCharacter.Name);
        _renderWindow.SetCharacterImage(
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
                "Assets/Lottie/expressions/character_placeholder.png"));
    }

    private void CreatePlaceholderImage()
    {
        var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
            "Assets/Lottie/expressions");
        Directory.CreateDirectory(path);

        var placeholderPath = Path.Combine(path, "character_placeholder.png");
        if (!File.Exists(placeholderPath))
        {
            // 创建一个简单的占位图片（彩色圆 + 初始文字）
            using var bmp = new System.Drawing.Bitmap(256, 384);
            using var g = System.Drawing.Graphics.FromImage(bmp);
            g.Clear(System.Drawing.Color.FromArgb(0, 0, 0, 0));

            // 绘制角色剪影
            using var brush = new System.Drawing.Drawing2D.LinearGradientBrush(
                new System.Drawing.Point(0, 0), new System.Drawing.Point(256, 384),
                System.Drawing.Color.FromArgb(200, 255, 107, 181),
                System.Drawing.Color.FromArgb(200, 130, 80, 200));
            g.FillEllipse(brush, 28, 20, 200, 200); // 头部
            g.FillRectangle(brush, 48, 220, 160, 164); // 身体

            // 文字
            using var font = new System.Drawing.Font("Microsoft YaHei", 16, System.Drawing.FontStyle.Bold);
            using var textBrush = new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb(240, 255, 255, 255));
            g.DrawString(CurrentCharacter.Name, font, textBrush, new System.Drawing.PointF(80, 300));

            bmp.Save(placeholderPath, System.Drawing.Imaging.ImageFormat.Png);
        }
    }

    public void TriggerProactiveGreeting(string message)
    {
        _renderWindow?.ShowBubble(message, 6000);
    }

    public void OnGameEntered(string gameName)
    {
        _renderWindow?.ShowBubble($"{(CurrentCharacter?.Name ?? "她")}发现你在玩{gameName}！给你加油～", 4000);
    }

    public void OnGameExited(string gameName)
    {
        TriggerProactiveGreeting($"{(CurrentCharacter?.Name ?? "她")}: {gameName}打完了？怎么样赢了没？");
    }

    public void RegenerateCharacter()
    {
        if (_charMgr == null) return;
        _charMgr.RandomGenerate();
        CurrentCharacter = _charMgr.CurrentCharacter;
        _renderWindow?.ShowNameTag(CurrentCharacter.Name);
        _renderWindow?.ShowBubble($"新角色生成啦！我是{CurrentCharacter.Name}，请多指教～", 4000);
    }

    private void OpenChatDialog()
    {
        if (_chatWindow == null)
        {
            _chatWindow = new ChatDialogWindow();
            _chatWindow.Closed += (_, _) => _chatWindow = null;
            _chatWindow.MessageSent += OnUserMessageSent;
        }

        if (!_chatWindow.IsVisible)
        {
            _chatWindow.Left = _renderWindow!.Left - 400;
            _chatWindow.Top = _renderWindow.Top - 100;
            _chatWindow.Show();
        }
        _chatWindow.Focus();
    }

    private async void OnUserMessageSent(string message)
    {
        if (_llmService == null || _promptBuilder == null) return;

        var chat = _chatWindow;
        if (chat == null) return;

        // 构建对话历史
        if (_conversationHistory.Count == 0)
        {
            _conversationHistory.Add(new ChatMessage
            {
                Role = "system",
                Content = _promptBuilder.BuildSystemPrompt("正在和用户聊天")
            });
        }

        _conversationHistory.Add(new ChatMessage { Role = "user", Content = message });
        _chatWindow?.SetTyping(true);

        _chatCts?.Cancel();
        _chatCts = new CancellationTokenSource();

        var aiResponse = "";
        try
        {
            await foreach (var chunk in _llmService.ActiveProvider.ChatStreamAsync(
                _conversationHistory, _chatCts.Token))
            {
                aiResponse += chunk;
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            aiResponse = $"（连接失败: {ex.Message}）";
        }

        _conversationHistory.Add(new ChatMessage { Role = "assistant", Content = aiResponse });
        chat.AddMessage("assistant", aiResponse);
        chat.SetTyping(false);

        // 气泡 + 表情联动
        var shortText = aiResponse.Length > 50 ? aiResponse[..50] + "…" : aiResponse;
        _renderWindow?.ShowBubble(shortText, 5000);
    }

    private void OpenSettings()
    {
        // 设置窗口将由外部管理
    }
}

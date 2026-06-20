using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AiCompanion.Core.Models;
using AiCompanion.Core.Services;
using System.Collections.ObjectModel;

namespace AiCompanion.App.ViewModels;

/// <summary>
/// 聊天 ViewModel
/// </summary>
public partial class ChatViewModel : ObservableObject
{
    private readonly LlmService _llmService;
    private readonly IPromptBuilder _promptBuilder;
    private readonly List<ChatMessage> _history = new();
    private CancellationTokenSource? _cts;

    [ObservableProperty] private string _inputText = "";
    [ObservableProperty] private bool _isTyping;
    [ObservableProperty] private string _statusText = "";

    public ObservableCollection<ChatMessageViewModel> Messages { get; } = new();

    public ChatViewModel(LlmService llmService, IPromptBuilder promptBuilder)
    {
        _llmService = llmService;
        _promptBuilder = promptBuilder;
        _statusText = $"当前: {_llmService.ActiveProvider.ProviderName}";
    }

    [RelayCommand]
    public async Task SendMessage()
    {
        var text = InputText.Trim();
        if (string.IsNullOrWhiteSpace(text)) return;

        Messages.Add(new ChatMessageViewModel { IsUser = true, Content = text });
        InputText = "";
        IsTyping = true;

        if (_history.Count == 0)
        {
            _history.Add(new ChatMessage
            {
                Role = "system",
                Content = _promptBuilder.BuildSystemPrompt("正在和用户聊天")
            });
        }

        _history.Add(new ChatMessage { Role = "user", Content = text });

        _cts?.Cancel();
        _cts = new CancellationTokenSource();

        var response = "";
        try
        {
            await foreach (var chunk in _llmService.ActiveProvider.ChatStreamAsync(
                _history, _cts.Token))
            {
                response += chunk;
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            response = $"（错误: {ex.Message}）";
        }

        _history.Add(new ChatMessage { Role = "assistant", Content = response });
        Messages.Add(new ChatMessageViewModel { IsUser = false, Content = response });
        IsTyping = false;
    }

    public void LoadHistory(List<ChatMessage> history)
    {
        Messages.Clear();
        foreach (var msg in history)
        {
            Messages.Add(new ChatMessageViewModel
            {
                IsUser = msg.Role == "user",
                Content = msg.Content
            });
            _history.Add(msg);
        }
    }
}

public class ChatMessageViewModel
{
    public bool IsUser { get; set; }
    public string Content { get; set; } = "";
    public string Alignment => IsUser ? "Right" : "Left";
}

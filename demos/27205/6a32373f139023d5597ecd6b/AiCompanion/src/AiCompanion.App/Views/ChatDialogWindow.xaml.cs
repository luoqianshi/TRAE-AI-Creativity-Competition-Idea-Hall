using System.Windows;
using System.Windows.Input;

namespace AiCompanion.App.Views;

/// <summary>
/// 聊天对话框窗口——显示消息列表和发送输入
/// </summary>
public partial class ChatDialogWindow : Window
{
    private bool _isDragging;
    private Point _dragStartPoint;

    public event Action<string>? MessageSent;

    public ChatDialogWindow()
    {
        InitializeComponent();
        Loaded += (_, _) => InputBox.Focus();
    }

    /// <summary>添加一条消息到列表</summary>
    public void AddMessage(string role, string content)
    {
        MessagesList.Items.Add(new { Role = role, Content = content });
        MessagesScroll.ScrollToEnd();
    }

    /// <summary>清空输入框</summary>
    public void ClearInput() => InputBox.Clear();

    /// <summary>设置打字中状态</summary>
    public void SetTyping(bool isTyping)
    {
        if (isTyping)
        {
            SendButton.IsEnabled = false;
            SendButton.Content = "…";
        }
        else
        {
            SendButton.IsEnabled = true;
            SendButton.Content = "➤";
        }
    }

    private void OnSendClick(object sender, RoutedEventArgs e) => DoSend();
    private void OnInputKeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter && Keyboard.Modifiers != ModifierKeys.Shift)
        {
            e.Handled = true;
            DoSend();
        }
    }

    private void DoSend()
    {
        var text = InputBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(text)) return;

        AddMessage("user", text);
        MessageSent?.Invoke(text);
        ClearInput();
    }

    private void OnTitleBarDragStart(object sender, MouseButtonEventArgs e)
    {
        _isDragging = true;
        _dragStartPoint = e.GetPosition(this);
        this.CaptureMouse();
        this.MouseMove += OnDragMove;
        this.MouseLeftButtonUp += OnDragEnd;
    }

    private void OnDragMove(object sender, MouseEventArgs e)
    {
        if (!_isDragging) return;
        var pos = e.GetPosition(this);
        this.Left += pos.X - _dragStartPoint.X;
        this.Top += pos.Y - _dragStartPoint.Y;
    }

    private void OnDragEnd(object sender, MouseButtonEventArgs e)
    {
        _isDragging = false;
        this.ReleaseMouseCapture();
        this.MouseMove -= OnDragMove;
        this.MouseLeftButtonUp -= OnDragEnd;
    }

    private void OnCloseClick(object sender, RoutedEventArgs e) => Hide();
}

using System.Windows;
using System.Windows.Input;
using System.Windows.Threading;
using static AiCompanion.Infrastructure.Win32.NativeMethods;

namespace AiCompanion.App.Views;

/// <summary>
/// 底层角色渲染窗口——完全透明、鼠标穿透
/// 负责显示角色动画/图片和对话气泡
/// </summary>
public partial class RenderLayerWindow : Window
{
    private readonly DispatcherTimer _bubbleTimer;
    private IAnimationController? _animationController;

    public RenderLayerWindow()
    {
        InitializeComponent();

        _bubbleTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(5)
        };
        _bubbleTimer.Tick += (_, _) => HideBubble();
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;

        // 设置扩展样式：分层 + 透明穿透 + 工具窗口 + 不获取焦点
        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
        exStyle |= WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE;
        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);

        // 置顶但不激活
        SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0,
            SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_NOMOVE | SWP_NOSIZE);
    }

    private void OnLoaded(object sender, RoutedEventArgs e) { }

    /// <summary>设置角色图片</summary>
    public void SetCharacterImage(string imagePath)
    {
        if (File.Exists(imagePath))
        {
            CharacterImage.Source = new System.Windows.Media.Imaging.BitmapImage(new Uri(imagePath));
        }
    }

    /// <summary>显示角色名字标签</summary>
    public void ShowNameTag(string name)
    {
        CharacterNameLabel.Text = name;
        NameTag.Visibility = Visibility.Visible;
    }

    public void HideNameTag() => NameTag.Visibility = Visibility.Collapsed;

    /// <summary>显示对话气泡</summary>
    public void ShowBubble(string text, int durationMs = 5000)
    {
        BubbleText.Text = text;
        SpeechBubble.Visibility = Visibility.Visible;
        _bubbleTimer.Interval = TimeSpan.FromMilliseconds(durationMs);
        _bubbleTimer.Stop();
        _bubbleTimer.Start();
    }

    /// <summary>隐藏对话气泡</summary>
    public void HideBubble()
    {
        SpeechBubble.Visibility = Visibility.Collapsed;
    }

    /// <summary>设置动画控制器</summary>
    public void SetAnimationController(IAnimationController controller) =>
        _animationController = controller;

    /// <summary>获取动画控制器</summary>
    public IAnimationController? GetAnimationController() => _animationController;
}

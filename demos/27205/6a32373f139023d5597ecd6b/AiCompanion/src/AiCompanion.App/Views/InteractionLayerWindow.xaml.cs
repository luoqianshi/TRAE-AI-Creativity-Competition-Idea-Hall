using System.Windows;
using System.Windows.Input;
using static AiCompanion.Infrastructure.Win32.NativeMethods;

namespace AiCompanion.App.Views;

/// <summary>
/// 顶层交互窗口——局部可点击，处理拖拽和按钮点击
/// </summary>
public partial class InteractionLayerWindow : Window
{
    private bool _isDragging;
    private System.Windows.Point _dragStartPoint;

    public event Action? ChatRequested;
    public event Action? SettingsRequested;
    public event Action? RefreshRequested;
    public event Action? CloseRequested;

    public InteractionLayerWindow()
    {
        InitializeComponent();
        this.MouseLeftButtonDown += OnWindowDragStart;
        this.MouseLeftButtonUp += OnWindowDragEnd;
        this.MouseMove += OnWindowDragMove;
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;

        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
        exStyle |= WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE;
        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);
        SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0,
            SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_NOMOVE | SWP_NOSIZE);
    }

    public void SyncPosition(double left, double top)
    {
        this.Left = left;
        this.Top = top;
    }

    private void OnWindowDragStart(object sender, MouseButtonEventArgs e)
    {
        _isDragging = true;
        _dragStartPoint = e.GetPosition(this);
        this.CaptureMouse();
    }

    private void OnWindowDragMove(object sender, MouseEventArgs e)
    {
        if (!_isDragging) return;
        var pos = e.GetPosition(this);
        this.Left += pos.X - _dragStartPoint.X;
        this.Top += pos.Y - _dragStartPoint.Y;
    }

    private void OnWindowDragEnd(object sender, MouseButtonEventArgs e)
    {
        _isDragging = false;
        this.ReleaseMouseCapture();
    }

    private void OnChatClick(object sender, RoutedEventArgs e) =>
        ChatRequested?.Invoke();

    private void OnSettingsClick(object sender, RoutedEventArgs e) =>
        SettingsRequested?.Invoke();

    private void OnRefreshClick(object sender, RoutedEventArgs e) =>
        RefreshRequested?.Invoke();

    private void OnCloseClick(object sender, RoutedEventArgs e) =>
        CloseRequested?.Invoke();
}

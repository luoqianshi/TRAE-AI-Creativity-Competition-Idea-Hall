using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace AiCompanion.Animation;

/// <summary>
/// 序列帧动画控制器——在不依赖 LottieSharp 时的降级方案
/// 使用 WriteableBitmap + DispatcherTimer 逐帧渲染
/// </summary>
public class SpriteAnimationController : IAnimationController
{
    private readonly Image _renderTarget;
    private DispatcherTimer? _frameTimer;
    private int _currentFrame;
    private string? _currentAnimation;
    private bool _loop;
    private double _speed = 1.0;

    // 动画名 -> (帧图片列表, 帧间隔ms)
    private readonly Dictionary<string, (List<BitmapSource> Frames, int IntervalMs)> _animations = new();

    public string? CurrentAnimation => _currentAnimation;
    public event EventHandler<string>? AnimationCompleted;

    public SpriteAnimationController(Image renderTarget)
    {
        _renderTarget = renderTarget;
    }

    public void LoadAnimation(string animationName, string basePath)
    {
        var frames = new List<BitmapSource>();
        int i = 0;
        while (File.Exists(Path.Combine(basePath, $"{animationName}_{i:D3}.png")))
        {
            var path = Path.Combine(basePath, $"{animationName}_{i:D3}.png");
            frames.Add(new BitmapImage(new Uri(path)));
            i++;
        }
        if (frames.Count > 0)
            _animations[animationName] = (frames, 42); // ~24fps
    }

    public void Play(string animationName, bool loop = false)
    {
        if (!_animations.TryGetValue(animationName, out var anim)) return;

        _currentAnimation = animationName;
        _loop = loop;
        _currentFrame = 0;

        _frameTimer?.Stop();
        _frameTimer = new DispatcherTimer(
            TimeSpan.FromMilliseconds(anim.IntervalMs / _speed),
            DispatcherPriority.Render,
            OnFrameTick,
            _renderTarget.Dispatcher);
        _frameTimer.Start();
    }

    public void Stop()
    {
        _frameTimer?.Stop();
    }

    public void PlayIdle() => Play("idle", true);

    public void PlayExpression(string expression) => Play(expression);

    public void PlayAction(string action) => Play(action);

    public void SetSpeed(double speed) => _speed = Math.Max(0.1, Math.Min(3.0, speed));

    private void OnFrameTick(object? sender, EventArgs e)
    {
        if (!_animations.TryGetValue(_currentAnimation ?? "", out var anim)) return;

        _renderTarget.Source = anim.Frames[_currentFrame];
        _currentFrame++;

        if (_currentFrame >= anim.Frames.Count)
        {
            if (_loop)
            {
                _currentFrame = 0;
            }
            else
            {
                _frameTimer?.Stop();
                AnimationCompleted?.Invoke(this, _currentAnimation ?? "");
            }
        }
    }
}

using System.Windows.Controls;
using System.Windows.Media.Imaging;

namespace AiCompanion.Animation;

/// <summary>
/// 静态图片控制器——当没有任何动画资源时的最终降级方案
/// 根据表情切换不同的静态图片
/// </summary>
public class StaticImageController : IAnimationController
{
    private readonly Image _renderTarget;
    private readonly string _basePath;
    private string? _currentAnimation;

    public string? CurrentAnimation => _currentAnimation;
    public event EventHandler<string>? AnimationCompleted;

    public StaticImageController(Image renderTarget, string basePath)
    {
        _renderTarget = renderTarget;
        _basePath = basePath;
    }

    public void LoadAnimation(string animationName, string filePath) { }

    public void Play(string animationName, bool loop = false)
    {
        _currentAnimation = animationName;

        // 尝试加载对应表情的静态图片
        var path = Path.Combine(_basePath, $"{animationName}.png");
        if (File.Exists(path))
        {
            _renderTarget.Source = new BitmapImage(new Uri(path));
        }

        if (!loop)
        {
            // 非循环模式：延迟一下触发完成
            Task.Delay(1500).ContinueWith(_ =>
                AnimationCompleted?.Invoke(this, animationName));
        }
    }

    public void Stop() { }

    public void PlayIdle() => Play("idle", true);

    public void PlayExpression(string expression) => Play(expression);

    public void PlayAction(string action) => Play(action);

    public void SetSpeed(double speed) { }
}

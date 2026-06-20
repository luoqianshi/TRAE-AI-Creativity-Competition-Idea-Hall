namespace AiCompanion.Animation;

/// <summary>
/// 动画控制器接口——抽象 Lottie/序列帧等不同动画实现
/// </summary>
public interface IAnimationController
{
    /// <summary>加载动画资源</summary>
    void LoadAnimation(string animationName, string filePath);

    /// <summary>播放指定动画（表情或动作）</summary>
    void Play(string animationName, bool loop = false);

    /// <summary>停止当前动画</summary>
    void Stop();

    /// <summary>切换到待机动画</summary>
    void PlayIdle();

    /// <summary>播放表情动画</summary>
    void PlayExpression(string expression);

    /// <summary>播放动作动画</summary>
    void PlayAction(string action);

    /// <summary>设置动画播放速度</summary>
    void SetSpeed(double speed);

    /// <summary>获取当前正在播放的动画名称</summary>
    string? CurrentAnimation { get; }

    /// <summary>动画完成事件</summary>
    event EventHandler<string>? AnimationCompleted;
}

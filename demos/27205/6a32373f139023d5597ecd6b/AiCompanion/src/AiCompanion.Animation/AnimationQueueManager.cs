using System.Windows.Threading;

namespace AiCompanion.Animation;

/// <summary>
/// 动画队列管理器——管理动画播放顺序和过渡
/// </summary>
public class AnimationQueueManager
{
    private readonly IAnimationController _controller;
    private readonly DispatcherTimer _queueTimer;
    private readonly Queue<AnimationCommand> _queue = new();
    private AnimationCommand? _current;
    private bool _isProcessing;

    private record AnimationCommand(string Name, bool Loop, TimeSpan Duration);

    public AnimationQueueManager(IAnimationController controller)
    {
        _controller = controller;
        _queueTimer = new DispatcherTimer();
        _queueTimer.Tick += OnQueueTick;
    }

    /// <summary>
    /// 将动画加入队列
    /// </summary>
    public void Enqueue(string animationName, bool loop = false, TimeSpan? duration = null)
    {
        _queue.Enqueue(new AnimationCommand(animationName, loop, duration ?? TimeSpan.FromSeconds(3)));
        if (!_isProcessing)
            ProcessNext();
    }

    /// <summary>
    /// 立即播放并清空队列
    /// </summary>
    public void PlayImmediate(string animationName, bool loop = false)
    {
        _queue.Clear();
        _isProcessing = false;
        _queueTimer.Stop();
        _controller.Play(animationName, loop);
        _current = new AnimationCommand(animationName, loop, TimeSpan.FromSeconds(3));
    }

    /// <summary>
    /// 清空队列并播放待机
    /// </summary>
    public void ResetToIdle()
    {
        _queue.Clear();
        _isProcessing = false;
        _queueTimer.Stop();
        _controller.PlayIdle();
    }

    private void ProcessNext()
    {
        if (!_queue.TryDequeue(out var cmd))
        {
            _isProcessing = false;
            _controller.PlayIdle();
            return;
        }

        _isProcessing = true;
        _current = cmd;
        _controller.Play(cmd.Name, cmd.Loop);

        _queueTimer.Interval = cmd.Duration;
        _queueTimer.Start();
    }

    private void OnQueueTick(object? sender, EventArgs e)
    {
        _queueTimer.Stop();
        if (!_current?.Loop ?? false)
        {
            ProcessNext();
        }
    }
}

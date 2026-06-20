using System.Drawing;
using System.Drawing.Imaging;
using static AiCompanion.Infrastructure.Win32.NativeMethods;

namespace AiCompanion.Infrastructure.Win32;

/// <summary>
/// 屏幕截图辅助——用于游戏事件 OCR 检测
/// </summary>
public static class ScreenCaptureHelper
{
    /// <summary>
    /// 截取指定窗口的指定区域
    /// </summary>
    public static Bitmap? CaptureWindowRegion(IntPtr hwnd, int xOffset, int yOffset, int width, int height)
    {
        try
        {
            if (hwnd == IntPtr.Zero) return null;

            GetWindowRect(hwnd, out RECT rect);
            int windowWidth = rect.Width;
            int windowHeight = rect.Height;

            if (windowWidth <= 0 || windowHeight <= 0) return null;

            int captureX = rect.Left + xOffset;
            int captureY = rect.Top + yOffset;
            int captureW = Math.Min(width, windowWidth - xOffset);
            int captureH = Math.Min(height, windowHeight - yOffset);

            if (captureW <= 0 || captureH <= 0) return null;

            var bitmap = new Bitmap(captureW, captureH, PixelFormat.Format32bppArgb);
            using var graphics = Graphics.FromImage(bitmap);
            graphics.CopyFromScreen(captureX, captureY, 0, 0, new Size(captureW, captureH));

            return bitmap;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// 根据比例截取窗口区域
    /// </summary>
    public static Bitmap? CaptureWindowRegionByRatio(IntPtr hwnd,
        double xRatio, double yRatio, double wRatio, double hRatio)
    {
        if (hwnd == IntPtr.Zero) return null;
        GetWindowRect(hwnd, out RECT rect);

        int x = (int)(rect.Width * xRatio);
        int y = (int)(rect.Height * yRatio);
        int w = (int)(rect.Width * wRatio);
        int h = (int)(rect.Height * hRatio);

        return CaptureWindowRegion(hwnd, x, y, w, h);
    }
}

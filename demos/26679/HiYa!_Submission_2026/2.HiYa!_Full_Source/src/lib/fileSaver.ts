/**
 * Native-first file saver using Capacitor plugins.
 * Writes to Cache directory then invokes the system Share panel.
 * Falls back to Web APIs when running in the browser.
 */
import { Capacitor } from '@capacitor/core';

/** Helper: is this running inside a Capacitor native shell? */
const isNative = () => Capacitor.isNativePlatform();

/**
 * Share or save a file (JSON backup etc).
 * Native: write to Cache → Share panel.
 * Web: navigator.share → download link → clipboard.
 */
export const saveFile = async (options: {
  fileName: string;
  data: string;
  mimeType: string;
}): Promise<{ success: boolean; message: string }> => {
  const { fileName, data, mimeType } = options;

  // ── Native path ──
  if (isNative()) {
    try {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: fileName,
        url: writeResult.uri,
        dialogTitle: '保存或分享数据备份',
      });

      return { success: true, message: '已通过系统分享面板导出！' };
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
        return { success: true, message: '已取消分享' };
      }
      console.error('[fileSaver] native saveFile error:', err);
      return { success: false, message: '保存失败，请重试' };
    }
  }

  // ── Web fallback ──
  if (navigator.share && navigator.canShare) {
    try {
      const blob = new Blob([data], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return { success: true, message: '分享成功！' };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return { success: true, message: '已取消分享' };
    }
  }

  try {
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    return { success: true, message: '下载已开始' };
  } catch {
    // ignore
  }

  if (mimeType.includes('json')) {
    try {
      await navigator.clipboard.writeText(data);
      return { success: true, message: '已复制到剪贴板，请粘贴到备忘录保存' };
    } catch {
      return { success: false, message: '保存失败，请重试' };
    }
  }

  return { success: false, message: '保存失败' };
};

/**
 * Share a canvas image via system share panel.
 * Native: write base64 to Cache → Share panel.
 * Web: navigator.share → download link.
 */
export const saveCanvasAsImage = async (
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<{ success: boolean; message: string }> => {
  if (isNative()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: '嗨呀！分享图',
        text: '来看看我的嗨呀记录！',
        url: writeResult.uri,
        dialogTitle: '保存或分享图片',
      });

      return { success: true, message: '已通过系统分享面板导出！' };
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
        return { success: true, message: '已取消分享' };
      }
      console.error('[fileSaver] native saveCanvasAsImage error:', err);
      return { success: false, message: '图片保存失败，请重试' };
    }
  }

  // ── Web fallback ──
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1.0)
  );
  if (!blob) return { success: false, message: '图片生成失败' };

  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '嗨呀！分享图',
          text: '来看看我的嗨呀记录！',
        });
        return { success: true, message: '分享成功！' };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return { success: true, message: '已取消分享' };
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    return { success: true, message: '下载已开始' };
  } catch {
    return { success: false, message: '图片保存失败' };
  }
};

/**
 * Save canvas image directly to device storage (Documents/Pictures).
 * Native: request permissions → write to Documents.
 * Web: trigger download.
 */
export const saveCanvasToLocal = async (
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<{ success: boolean; message: string }> => {
  if (isNative()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');

      // Check and request permissions
      let perms = await Filesystem.checkPermissions();
      if (perms.publicStorage !== 'granted') {
        perms = await Filesystem.requestPermissions();
        if (perms.publicStorage !== 'granted') {
          return {
            success: false,
            message: '存储权限被拒绝，请前往系统设置 → 应用 → 嗨呀 → 权限，开启存储权限后重试',
          };
        }
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });

      return { success: true, message: `✅ 已成功保存到手机 Documents 目录！` };
    } catch (err: any) {
      console.error('[fileSaver] native saveCanvasToLocal error:', err);
      return { success: false, message: '保存失败，请检查存储权限后重试' };
    }
  }

  // ── Web fallback: download ──
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1.0)
  );
  if (!blob) return { success: false, message: '图片生成失败' };

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    return { success: true, message: '下载已开始' };
  } catch {
    return { success: false, message: '图片保存失败' };
  }
};

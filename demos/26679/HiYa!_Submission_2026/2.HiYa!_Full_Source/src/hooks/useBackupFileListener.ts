import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '@/context/AppContext';

/**
 * Listens for file-association launches (e.g. user opens a .json backup
 * from a file manager, WeChat, QQ, etc.). Uses @capacitor/app's appUrlOpen event.
 * 
 * Validates by content structure (not filename). Supports content://, file://, 
 * and plain paths — passes raw URL directly to Filesystem.readFile.
 */
export const useBackupFileListener = () => {
  const { importData } = useApp();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { Filesystem, Encoding } = await import('@capacitor/filesystem');

        const listener = await App.addListener('appUrlOpen', async (event) => {
          const url = event.url;
          if (!url) return;

          try {
            // Pass the raw URL directly to Filesystem — it handles content://, file://, etc.
            const contents = await Filesystem.readFile({ 
              path: url, 
              encoding: Encoding.UTF8 
            });
            const text = typeof contents.data === 'string'
              ? contents.data
              : new TextDecoder().decode(contents.data as unknown as ArrayBuffer);

            // Content-based validation (no filename checking)
            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch {
              alert('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
              return;
            }

            if (!parsed.entries || !Array.isArray(parsed.entries)) {
              alert('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
              return;
            }

            const count = parsed.entries.length;
            const confirmed = confirm(`✅ 发现有效备份数据（共 ${count} 条记录），是否立即覆盖导入？`);
            if (!confirmed) return;

            const success = importData(text);
            if (success) {
              alert('✅ 导入成功！正在刷新...');
              setTimeout(() => window.location.reload(), 500);
            } else {
              alert('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
            }
          } catch (err) {
            console.error('[backupFileListener] failed to read file:', err);
            alert('❌ 无法读取文件');
          }
        });

        cleanup = () => listener.remove();
      } catch (err) {
        console.log('[backupFileListener] @capacitor/app not available:', err);
      }
    })();

    return () => cleanup?.();
  }, [importData]);
};

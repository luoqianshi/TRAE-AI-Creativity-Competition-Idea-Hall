import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Info, Check, Eye, VolumeX, Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import CandyBackground from '@/components/CandyBackground';
import BounceTitle from '@/components/BounceTitle';
import BubbleCard from '@/components/BubbleCard';
import BubbleButton from '@/components/BubbleButton';
import coffeeQrcode from '@/assets/coffee-qrcode.png';
import { getThemeById } from '@/lib/themes';
import { Switch } from '@/components/ui/switch';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, exportData, importData, getDaysUsed, entries } = useApp();
  
  const [userId, setUserId] = useState(settings.userId);
  const [saved, setSaved] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isSoundMuted') === 'true');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentTheme = getThemeById(settings.currentTheme || 'orange');
  const isNeonTheme = settings.currentTheme === 'black';
  const isHoloTheme = settings.currentTheme === 'white';
  
  const handleSaveId = () => {
    updateSettings({ userId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleMute = (checked: boolean) => {
    // checked = true means muted
    setIsMuted(checked);
    localStorage.setItem('isSoundMuted', String(checked));
    if (checked) {
      toast('🔇 已进入闭嘴模式');
    } else {
      toast('🔊 嗨呀！音效已开启！');
    }
  };
  
  const handleExport = async () => {
    const data = exportData();
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const userName = settings.userId || 'HiYa';
    const fileName = `HiYa_Backup_${userName}_${dateStr}.json`;

    // Step 1: Save to Documents first (native) or download (web)
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        // Check permissions
        let perms = await Filesystem.checkPermissions();
        if (perms.publicStorage !== 'granted') {
          perms = await Filesystem.requestPermissions();
          if (perms.publicStorage !== 'granted') {
            toast.error('存储权限被拒绝，请前往系统设置开启存储权限');
            return;
          }
        }

        await Filesystem.writeFile({
          path: fileName,
          data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        toast.success('✅ 备份已成功保存至手机 Documents 文件夹');

        // Step 2: Ask if user wants to share
        const wantShare = confirm('备份已保存！是否还要发送/分享到其他应用？');
        if (wantShare) {
          const { Share } = await import('@capacitor/share');
          // Write a copy to cache for sharing
          const cacheResult = await Filesystem.writeFile({
            path: fileName,
            data,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
          });
          await Share.share({
            title: fileName,
            url: cacheResult.uri,
            dialogTitle: '分享数据备份',
          });
        }
      } catch (err: any) {
        if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
          return;
        }
        console.error('[export] native error:', err);
        toast.error('保存失败，请重试');
      }
    } else {
      // Web fallback: download
      try {
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('✅ 下载已开始');
      } catch {
        toast.error('保存失败');
      }
    }
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Content-based validation
      try {
        const parsed = JSON.parse(content);
        if (!parsed.entries || !Array.isArray(parsed.entries)) {
          toast.error('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
          return;
        }
        const count = parsed.entries.length;
        const confirmed = confirm(`✅ 发现有效备份数据（共 ${count} 条记录），是否立即覆盖导入？`);
        if (!confirmed) return;
        
        const success = importData(content);
        if (success) {
          toast.success('✅ 导入成功！正在刷新...');
          setTimeout(() => window.location.reload(), 800);
        } else {
          toast.error('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
        }
      } catch {
        toast.error('❌ 导入失败：该文件不是有效的 HiYa 备份数据。');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleShowWelcome = () => {
    navigate('/welcome');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen max-w-md mx-auto pt-safe pb-safe relative"
    >
      <CandyBackground />

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="p-3 rounded-full shadow-lg text-primary-foreground"
          style={{
            background: isNeonTheme 
              ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
              : isHoloTheme
              ? 'linear-gradient(135deg, #EF4444 0%, #F97316 20%, #FBBF24 40%, #22C55E 60%, #3B82F6 80%, #8B5CF6 100%)'
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
            boxShadow: isNeonTheme 
              ? '0 0 20px hsl(142 71% 45% / 0.5)'
              : '0 4px 15px hsl(var(--primary) / 0.4)',
          }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
        </motion.button>
        <BounceTitle className="text-xl">
          设置
        </BounceTitle>
      </header>
      
      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* User ID */}
        <BubbleCard delay={0.1}>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'hsl(var(--primary))' }}>你的嗨呀名！</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="分享页面会显示嗨呀名呀！"
              className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none text-card-foreground"
              style={{
                background: isNeonTheme 
                  ? 'hsl(222 47% 15%)'
                  : 'linear-gradient(145deg, hsl(var(--accent) / 0.8) 0%, hsl(var(--card)) 100%)',
                border: '2px solid hsl(var(--primary) / 0.3)',
              }}
            />
            <BubbleButton
              onClick={handleSaveId}
              size="sm"
              data-testid="button-save-id"
            >
              {saved ? <Check className="w-4 h-4" /> : '保存'}
            </BubbleButton>
          </div>
        </BubbleCard>

        {/* Mute Toggle */}
        <BubbleCard delay={0.12}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
                {isMuted ? <VolumeX className="w-4 h-4 inline mr-1" /> : <Volume2 className="w-4 h-4 inline mr-1" />}
                嗨呀！太吵了！
              </h2>
              <p className="text-xs text-muted-foreground mt-1">不要鬼叫！静音！</p>
            </div>
            <Switch
              checked={isMuted}
              onCheckedChange={handleToggleMute}
              data-sfx="off"
            />
          </div>
        </BubbleCard>
        
        {/* Stats */}
        <BubbleCard glow delay={0.15}>
          <h2 className="text-sm font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>使用统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <motion.p 
                className="text-3xl sm:text-4xl font-black"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: 'hsl(var(--primary))' }}
              >
                {getDaysUsed()}
              </motion.p>
              <p className="text-xs sm:text-sm text-muted-foreground">使用天数</p>
            </div>
            <div className="text-center">
              <motion.p 
                className="text-3xl sm:text-4xl font-black"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                style={{ color: 'hsl(var(--primary))' }}
              >
                {entries.length}
              </motion.p>
              <p className="text-xs sm:text-sm text-muted-foreground">记录条数</p>
            </div>
          </div>
        </BubbleCard>
        
        {/* Data Management */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>数据管理</h2>
          
          <BubbleCard delay={0.2} onClick={handleExport}>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl text-primary-foreground"
                style={{ 
                  background: isNeonTheme 
                    ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
                    : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
                }}
              >
                <Download className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>导出数据</p>
                <p className="text-xs text-muted-foreground">备份所有记录到文件</p>
              </div>
            </div>
          </BubbleCard>
          
          <BubbleCard delay={0.25} onClick={() => fileInputRef.current?.click()}>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl text-primary-foreground"
                style={{ 
                  background: isNeonTheme 
                    ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
                    : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
                }}
              >
                <Upload className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>导入数据</p>
                <p className="text-xs text-muted-foreground">从备份文件恢复记录</p>
              </div>
            </div>
          </BubbleCard>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* View Welcome Page */}
        <BubbleCard delay={0.3} onClick={handleShowWelcome}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl text-primary-foreground"
              style={{ 
                background: isNeonTheme 
                  ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
                  : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
              }}
            >
              <Eye className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>再看看嗨呀！欢迎页</p>
          </div>
        </BubbleCard>

        {/* About */}
        <BubbleCard delay={0.35} onClick={() => setShowAbout(true)}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl text-primary-foreground"
              style={{ 
                background: isNeonTheme 
                  ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
                  : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
              }}
            >
              <Info className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>关于嗨呀！</p>
          </div>
        </BubbleCard>
      </div>
      
      {/* About Modal - Theme-aware */}
      {showAbout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAbout(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto overflow-x-hidden"
            style={{
              background: isNeonTheme 
                ? 'linear-gradient(145deg, hsl(222 47% 11%) 0%, hsl(222 47% 8%) 100%)'
                : 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--accent)) 100%)',
              boxShadow: isNeonTheme 
                ? '0 0 60px hsl(142 71% 45% / 0.3)'
                : '0 20px 60px hsl(var(--primary) / 0.3), 0 10px 30px hsl(var(--primary) / 0.2)',
              border: isNeonTheme 
                ? '3px solid hsl(142 71% 45% / 0.5)'
                : '3px solid hsl(var(--primary) / 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 text-4xl opacity-30"
              >
                <span role="img" aria-label="decoration">{currentTheme?.decorations[0] || '🍊'}</span>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -left-2 text-3xl opacity-20"
              >
                <span role="img" aria-label="decoration">{currentTheme?.decorations[1] || '☀️'}</span>
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 -right-6 text-2xl opacity-20"
              >
                <span role="img" aria-label="decoration">{currentTheme?.decorations[2] || '🍊'}</span>
              </motion.div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4">
                <motion.span 
                  className="text-4xl font-black inline-block"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  嗨呀！
                </motion.span>
                <span className="text-2xl ml-1">✨</span>
              </div>
              
              <p className="text-lg mb-2 leading-relaxed text-muted-foreground">
                只会帮助你记住开心的事 <span className="text-xl">🌈</span>，
              </p>
              
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                className="mb-4"
              >
                <span className="text-2xl font-black" style={{ color: 'hsl(var(--primary))' }}>
                  一定要嗨呀呀！
                </span>
                <span className="text-xl ml-1">{currentTheme?.decorations.slice(0,3).join('')}</span>
              </motion.div>
              
              <div 
                className="mb-4 p-4 rounded-2xl"
                style={{ 
                  background: isNeonTheme 
                    ? 'hsl(222 47% 15%)'
                    : 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--accent) / 0.5) 100%)',
                  border: '2px solid hsl(var(--primary) / 0.3)',
                }}
              >
                <p className="text-sm mb-3 font-medium text-muted-foreground">
                  嗨呀！你还可以请@HiYaJoHn喝杯咖啡豆浆！
                </p>
                <img 
                  src={coffeeQrcode} 
                  alt="打赏二维码" 
                  className="w-40 h-auto mx-auto rounded-xl shadow-md"
                  style={{ border: '3px solid hsl(var(--primary) / 0.3)' }}
                />
              </div>
              
              <BubbleButton
                onClick={() => setShowAbout(false)}
                size="lg"
                data-testid="button-close-about"
              >
                好呀！
              </BubbleButton>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default SettingsPage;

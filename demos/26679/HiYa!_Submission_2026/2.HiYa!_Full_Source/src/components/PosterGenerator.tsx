import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveCanvasAsImage, saveCanvasToLocal } from '@/lib/fileSaver';
import { Entry } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatLocalDateForZh } from '@/lib/date';

interface PosterGeneratorProps {
  entry: Entry;
  userId: string;
  onClose: () => void;
}

const RATING_EMOJIS = ['', '😊', '😆', '🤩'];
const RATING_LABELS = ['', '嗨呀！', '嗨呀呀！！', '嗨呀嗨呀！！！'];

const getThemeDecorations = (themeId: string) => {
  const decos: Record<string, { accent: string; deco: string; pattern: string }> = {
    red:    { accent: '#FCA5A5', deco: '🔥', pattern: '❤️' },
    orange: { accent: '#FDBA74', deco: '🍊', pattern: '✨' },
    yellow: { accent: '#FDE68A', deco: '🌻', pattern: '⭐' },
    green:  { accent: '#86EFAC', deco: '🍀', pattern: '🌿' },
    cyan:   { accent: '#67E8F9', deco: '🧊', pattern: '💎' },
    blue:   { accent: '#93C5FD', deco: '🌊', pattern: '🦋' },
    purple: { accent: '#C4B5FD', deco: '🔮', pattern: '🪻' },
    pink:   { accent: '#FBCFE8', deco: '🌸', pattern: '💗' },
    black:  { accent: '#4ADE80', deco: '⚡', pattern: '🖤' },
    white:  { accent: '#A3A3A3', deco: '🤍', pattern: '🕊️' },
  };
  return decos[themeId] || decos.orange;
};

const PosterGenerator = ({ entry, userId, onClose }: PosterGeneratorProps) => {
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { settings } = useApp();

  const themeId = settings.currentTheme || 'orange';
  const isNeonTheme = themeId === 'black';
  const isHoloTheme = themeId === 'white';
  const isYellowTheme = themeId === 'yellow';
  const themeDeco = getThemeDecorations(themeId);

  const getThemeGradient = () => {
    const gradients: Record<string, string> = {
      red:    'linear-gradient(160deg, #FCA5A5 0%, #EF4444 40%, #DC2626 70%, #B91C1C 100%)',
      orange: 'linear-gradient(160deg, #FDBA74 0%, #FB923C 40%, #F97316 70%, #EA580C 100%)',
      yellow: 'linear-gradient(160deg, #FDE68A 0%, #FBBF24 40%, #F59E0B 70%, #D97706 100%)',
      green:  'linear-gradient(160deg, #86EFAC 0%, #4ADE80 40%, #22C55E 70%, #16A34A 100%)',
      cyan:   'linear-gradient(160deg, #67E8F9 0%, #22D3EE 40%, #06B6D4 70%, #0891B2 100%)',
      blue:   'linear-gradient(160deg, #93C5FD 0%, #60A5FA 40%, #3B82F6 70%, #2563EB 100%)',
      purple: 'linear-gradient(160deg, #C4B5FD 0%, #A78BFA 40%, #8B5CF6 70%, #7C3AED 100%)',
      pink:   'linear-gradient(160deg, #FBCFE8 0%, #F9A8D4 40%, #EC4899 70%, #DB2777 100%)',
      black:  'linear-gradient(160deg, #1E293B 0%, #0F172A 50%, #020617 100%)',
      white:  'linear-gradient(160deg, #FAFAFA 0%, #F5F5F5 40%, #E5E5E5 70%, #FAFAFA 100%)',
    };
    return gradients[themeId] || gradients.orange;
  };

  const getTextColor = () => {
    if (isYellowTheme || isHoloTheme) return '#78350F';
    if (isNeonTheme) return '#4ADE80';
    return '#FFFFFF';
  };

  const getSubTextColor = () => {
    if (isYellowTheme || isHoloTheme) return '#92400E';
    if (isNeonTheme) return '#86EFAC';
    return 'rgba(255,255,255,0.75)';
  };

  const getContentBoxBg = () => {
    if (isNeonTheme) return 'rgba(30, 41, 59, 0.6)';
    if (isHoloTheme) return 'rgba(255, 255, 255, 0.35)';
    return 'rgba(255, 255, 255, 0.25)';
  };

  const getContentBoxBorder = () => {
    if (isNeonTheme) return '2px solid rgba(74, 222, 128, 0.4)';
    if (isHoloTheme) return '1px solid rgba(0,0,0,0.08)';
    return '1px solid rgba(255, 255, 255, 0.3)';
  };

  const getContentTextColor = () => {
    if (isNeonTheme) return '#E2E8F0';
    if (isYellowTheme || isHoloTheme) return '#44403C';
    return '#FFFFFF';
  };

  useEffect(() => { document.fonts.ready.then(() => setFontsLoaded(true)); }, []);

  const formatDate = (dateStr: string) => {
    return formatLocalDateForZh(dateStr, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  const generateCanvas = async () => {
    if (!hiddenContainerRef.current || !fontsLoaded) return null;
    await new Promise(resolve => setTimeout(resolve, 100));
    return html2canvas(hiddenContainerRef.current, {
      scale: 3, backgroundColor: null, useCORS: true, allowTaint: true, logging: false,
    });
  };

  const handleShare = async () => {
    setIsGenerating(true);
    toast('正在生成专属嗨呀时刻...');
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const result = await saveCanvasAsImage(canvas, `HiYa_Share_${Date.now()}.png`);
      if (!result.success) toast.error(result.message);
    } catch (error) {
      console.error('Failed to generate poster:', error);
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLocal = async () => {
    setIsGenerating(true);
    toast('正在保存到本地...');
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const result = await saveCanvasToLocal(canvas, `HiYa_Share_${Date.now()}.png`);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to save poster:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const titleStyle: React.CSSProperties = isNeonTheme
    ? { color: '#4ADE80', textShadow: '0 0 30px #4ADE80, 0 0 60px #4ADE80' }
    : isHoloTheme
    ? { background: 'linear-gradient(90deg, #EF4444, #F97316, #FBBF24, #22C55E, #3B82F6, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
    : { color: getTextColor(), textShadow: '3px 3px 0 rgba(0,0,0,0.15)' };

  const PosterContent = ({ scale = 1 }: { scale?: number }) => {
    const s = (v: number) => v * scale;
    return (
      <div style={{
        width: `${s(1080)}px`,
        height: `${s(1440)}px`,
        background: getThemeGradient(),
        display: 'flex',
        flexDirection: 'column',
        padding: `${s(60)}px`,
        fontFamily: 'system-ui, -apple-system, "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: s(30), left: s(30), fontSize: `${s(36)}px`, opacity: 0.4 }}>{themeDeco.pattern}</div>
        <div style={{ position: 'absolute', top: s(30), right: s(30), fontSize: `${s(36)}px`, opacity: 0.4 }}>{themeDeco.pattern}</div>
        <div style={{ position: 'absolute', bottom: s(30), left: s(30), fontSize: `${s(36)}px`, opacity: 0.4 }}>{themeDeco.pattern}</div>
        <div style={{ position: 'absolute', bottom: s(30), right: s(30), fontSize: `${s(36)}px`, opacity: 0.4 }}>{themeDeco.pattern}</div>

        {/* === HEADER === */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          {/* Date */}
          <div style={{ paddingBottom: s(20), paddingTop: s(10) }}>
            <div style={{ fontSize: `${s(28)}px`, fontWeight: 600, color: getSubTextColor(), letterSpacing: `${s(2)}px` }}>
              {formatDate(entry.date)}
            </div>
          </div>
          {/* Title + Emoji */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${s(8)}px` }}>
            <div style={{ fontSize: `${s(60)}px`, fontWeight: 900, ...titleStyle }}>
              {RATING_LABELS[entry.rating] || '嗨呀！'}
            </div>
            <div style={{ fontSize: `${s(64)}px` }}>
              {RATING_EMOJIS[entry.rating] || '😊'}
            </div>
            <div style={{ fontSize: `${s(18)}px`, opacity: 0.5, color: getTextColor() }}>
              {themeDeco.deco} {themeDeco.deco} {themeDeco.deco}
            </div>
          </div>
        </div>

        {/* === MIDDLE — flex-1 centered content === */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${s(24)}px 0`,
        }}>
          <div style={{
            width: '88%',
            borderRadius: `${s(28)}px`,
            padding: `${s(44)}px ${s(48)}px`,
            background: getContentBoxBg(),
            border: getContentBoxBorder(),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: isNeonTheme ? '0 0 30px rgba(74, 222, 128, 0.15)' : '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            <p style={{
              fontSize: `${s(44)}px`,
              lineHeight: 2,
              color: getContentTextColor(),
              textAlign: 'center',
              margin: 0,
              wordBreak: 'break-word',
              fontWeight: 500,
            }}>
              {entry.content || '今天没有写什么...'}
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <div style={{ flexShrink: 0, textAlign: 'center', paddingBottom: s(10) }}>
          <div style={{
            fontSize: `${s(28)}px`, fontWeight: 700,
            color: isNeonTheme ? '#F472B6' : getSubTextColor(),
            textShadow: isNeonTheme ? '0 0 20px #F472B6' : 'none',
          }}>
            {themeDeco.pattern} {userId ? `@${userId}` : '@HiYa'} {themeDeco.pattern}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {/* Hidden render target for html2canvas */}
      <div ref={hiddenContainerRef} style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <PosterContent scale={1} />
      </div>

      <motion.div
        key="poster-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          key="poster-card"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-3xl overflow-hidden max-w-xs w-full"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview */}
          <div className="w-full relative" style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '1080px', height: '1440px',
              transform: 'scale(var(--poster-scale))',
              transformOrigin: 'top left',
            }} ref={(el) => {
              if (el) {
                const parent = el.parentElement;
                if (parent) {
                  const scale = parent.offsetWidth / 1080;
                  el.style.setProperty('--poster-scale', String(scale));
                  const ro = new ResizeObserver(() => {
                    el.style.setProperty('--poster-scale', String(parent.offsetWidth / 1080));
                  });
                  ro.observe(parent);
                }
              }
            }}>
              <PosterContent scale={1} />
            </div>
          </div>

          {/* Action buttons */}
          <div
            className="p-3 flex gap-3"
            style={{ background: isNeonTheme ? '#0F172A' : 'hsl(var(--primary))' }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-sm"
              style={{
                background: isNeonTheme ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.9)',
                color: isNeonTheme ? '#4ADE80' : 'hsl(var(--primary))',
                border: isNeonTheme ? '2px solid #4ADE80' : 'none',
              }}
            >
              <X className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveToLocal}
              disabled={isGenerating || !fontsLoaded}
              className="flex-1 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
              style={{
                background: isNeonTheme ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.9)',
                color: isNeonTheme ? '#4ADE80' : 'hsl(var(--primary))',
                border: isNeonTheme ? '2px solid #4ADE80' : 'none',
              }}
            >
              <Download className="w-4 h-4" /> 保存到相册
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              disabled={isGenerating || !fontsLoaded}
              className="flex-1 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
              style={{
                background: isNeonTheme
                  ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                  : isHoloTheme
                  ? 'linear-gradient(135deg, #EF4444, #F97316, #FBBF24, #22C55E, #3B82F6, #8B5CF6, #EC4899)'
                  : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))',
                color: isYellowTheme ? '#78350F' : '#FFFFFF',
                border: isNeonTheme ? '2px solid #4ADE80' : 'none',
                boxShadow: isNeonTheme ? '0 0 20px rgba(74,222,128,0.3)' : '0 4px 15px hsl(var(--primary) / 0.3)',
              }}
            >
              <Share2 className="w-4 h-4" /> 分享
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PosterGenerator;

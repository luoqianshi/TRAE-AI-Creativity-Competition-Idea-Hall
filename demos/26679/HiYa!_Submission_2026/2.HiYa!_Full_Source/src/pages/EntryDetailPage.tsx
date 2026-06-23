import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, Edit3, History, Share2, X } from 'lucide-react';
import { EntryHistoryItem, useApp } from '@/context/AppContext';
import SmileRating from '@/components/SmileRating';
import PosterGenerator from '@/components/PosterGenerator';
import CandyBackground from '@/components/CandyBackground';
import BubbleCard from '@/components/BubbleCard';
import BounceTitle from '@/components/BounceTitle';
import { getThemeById } from '@/lib/themes';
import { formatLocalDateForZh } from '@/lib/date';
import BubbleButton from '@/components/BubbleButton';

const EntryDetailPage = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { getEntryByDate, settings, updateEntry } = useApp();
  
  const [showPoster, setShowPoster] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(2);
  const [editContent, setEditContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const entry = date ? getEntryByDate(date) : null;
  
  const themeId = settings.currentTheme || 'orange';
  const isNeonTheme = themeId === 'black';
  const isHoloTheme = themeId === 'white';
  const isYellowTheme = themeId === 'yellow';

  useEffect(() => {
    if (!entry) return;
    setEditRating(entry.rating);
    setEditContent(entry.content);
  }, [entry?.id, entry?.rating, entry?.content]);
  
  const getButtonStyle = () => ({
    background: isNeonTheme 
      ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
      : isHoloTheme
      ? 'linear-gradient(135deg, #EF4444 0%, #F97316 20%, #FBBF24 40%, #22C55E 60%, #3B82F6 80%, #8B5CF6 100%)'
      : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
    boxShadow: isNeonTheme 
      ? '0 0 20px hsl(142 71% 45% / 0.5)'
      : '0 4px 15px hsl(var(--primary) / 0.4)',
  });
  
  const getIconColor = () => isNeonTheme ? '#0F172A' : isYellowTheme ? '#78350F' : '#FFFFFF';
  const getTextColor = () => isNeonTheme ? '#4ADE80' : isYellowTheme ? '#78350F' : 'hsl(var(--primary))';

  const getInputStyle = () => {
    if (isNeonTheme) {
      return {
        background: 'linear-gradient(145deg, hsl(222 47% 15%) 0%, hsl(222 47% 10%) 100%)',
        border: '2px solid hsl(142 71% 45% / 0.45)',
        color: '#E2E8F0',
        boxShadow: '0 0 24px hsl(142 71% 45% / 0.12)',
      };
    }

    if (isHoloTheme) {
      return {
        background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 100%)',
        border: '2px solid rgba(139, 92, 246, 0.22)',
        color: '#374151',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.12)',
      };
    }

    return {
      background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--accent) / 0.78) 100%)',
      border: '2px solid hsl(var(--primary) / 0.28)',
      color: 'hsl(var(--card-foreground))',
      boxShadow: '0 8px 30px hsl(var(--primary) / 0.12)',
    };
  };

  const getHistoryItemStyle = () => {
    if (isNeonTheme) {
      return {
        background: 'linear-gradient(145deg, hsl(222 47% 14% / 0.9) 0%, hsl(222 47% 9% / 0.86) 100%)',
        border: '1px solid hsl(142 71% 45% / 0.28)',
      };
    }

    if (isHoloTheme) {
      return {
        background: 'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(245,245,245,0.82) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.16)',
      };
    }

    return {
      background: 'linear-gradient(145deg, hsl(var(--accent) / 0.45) 0%, hsl(var(--card) / 0.76) 100%)',
      border: '1px solid hsl(var(--primary) / 0.18)',
    };
  };
  
  if (!entry) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex items-center justify-center pt-safe pb-safe relative">
        <CandyBackground />
        <div className="text-center relative z-10">
          <p className="mb-4 text-muted-foreground">找不到这条记录</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/history')}
            className="px-6 py-3 rounded-2xl font-bold"
            style={{
              ...getButtonStyle(),
              color: getIconColor(),
            }}
          >
            返回历史
          </motion.button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateStr: string) => {
    return formatLocalDateForZh(dateStr, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };
  
  const formatTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const handleStartEdit = () => {
    if (!entry) return;
    setEditRating(entry.rating);
    setEditContent(entry.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!entry) return;
    setEditRating(entry.rating);
    setEditContent(entry.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!date) return;
    const saved = updateEntry(date, {
      rating: editRating,
      content: editContent,
    });
    if (saved) {
      setIsEditing(false);
      setShowHistory(true);
    }
  };

  const historyItems = [...(entry.history ?? [])].reverse();
  const hasChanges = entry.rating !== editRating || entry.content !== editContent;

  const renderHistoryItem = (item: EntryHistoryItem, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl p-3 space-y-3"
      style={getHistoryItemStyle()}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: getTextColor() }}>
          <Clock3 className="w-3.5 h-3.5" />
          旧版本 {historyItems.length - index}
        </div>
        <span className="text-[11px] text-muted-foreground">
          保存于 {formatFullTime(item.archivedAt)}
        </span>
      </div>
      <SmileRating value={item.rating} onChange={() => {}} readonly size="sm" />
      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-card-foreground">
        {item.content || '这版没有写什么...'}
      </p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen max-w-md mx-auto pt-safe pb-safe relative"
    >
      <CandyBackground />

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/history')}
            className="p-3 rounded-full shadow-lg"
            style={getButtonStyle()}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: getIconColor() }} />
          </motion.button>
          <BounceTitle className="text-xl">
            这天嗨呀！
          </BounceTitle>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -6 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStartEdit}
              className="p-3 rounded-full shadow-lg"
              style={getButtonStyle()}
              data-testid="button-edit-entry"
              aria-label="修改日记"
            >
              <Edit3 className="w-5 h-5" style={{ color: getIconColor() }} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPoster(true)}
            className="p-3 rounded-full shadow-lg"
            style={getButtonStyle()}
            data-testid="button-share"
            aria-label="分享日记"
          >
            <Share2 className="w-5 h-5" style={{ color: getIconColor() }} />
          </motion.button>
        </div>
      </header>
      
      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Date and Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: getTextColor() }}>
            {formatDate(entry.date)}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            记录于 {formatTime(entry.createdAt)}
            {entry.updatedAt ? ` · 修改于 ${formatTime(entry.updatedAt)}` : ''}
          </p>
        </motion.div>

        {isEditing ? (
          <BubbleCard glow delay={0.2}>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-black" style={{ color: getTextColor() }}>
                  修改这天嗨呀！
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelEdit}
                  className="p-2 rounded-full"
                  style={getInputStyle()}
                  aria-label="取消修改"
                >
                  <X className="w-4 h-4" style={{ color: getTextColor() }} />
                </motion.button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-center" style={{ color: getTextColor() }}>
                  这天的心情
                </p>
                <SmileRating value={editRating} onChange={setEditRating} size="lg" />
                <p className="text-center text-sm font-bold" style={{ color: getTextColor() }}>
                  {['', '嗨呀！', '嗨呀呀！！', '嗨呀嗨呀！！！'][editRating]}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold" style={{ color: getTextColor() }}>
                  这天发生了什么？
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value.slice(0, 200))}
                  className="w-full h-36 rounded-3xl p-4 resize-none text-sm sm:text-base focus:outline-none"
                  style={getInputStyle()}
                  placeholder="重新写一下这天的开心事..."
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>保存后，当前内容会进入修改历史。</span>
                  <span>{editContent.length}/200</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <BubbleButton onClick={handleCancelEdit} variant="secondary" size="md" className="w-full">
                  不改了
                </BubbleButton>
                <BubbleButton onClick={handleSaveEdit} disabled={!hasChanges} size="md" className="w-full">
                  保存修改
                </BubbleButton>
              </div>
            </div>
          </BubbleCard>
        ) : (
          <>
            {/* Rating */}
            <BubbleCard glow delay={0.2}>
              <SmileRating value={entry.rating} onChange={() => {}} readonly size="lg" />
              <motion.p 
                className="text-center text-sm mt-3 font-bold"
                style={{ color: getTextColor() }}
              >
                {['', '嗨呀！', '嗨呀呀！！', '嗨呀嗨呀！！！'][entry.rating]}
              </motion.p>
            </BubbleCard>
            
            {/* Content */}
            <BubbleCard delay={0.3}>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-card-foreground">
                {entry.content || '这天没有写什么...'}
              </p>
            </BubbleCard>
          </>
        )}

        <BubbleCard delay={0.35} onClick={() => setShowHistory(!showHistory)}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={getButtonStyle()}>
                <History className="w-4 h-4" style={{ color: getIconColor() }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: getTextColor() }}>修改历史</p>
                <p className="text-xs text-muted-foreground">
                  {historyItems.length > 0 ? `保留了 ${historyItems.length} 个旧版本` : '还没有修改记录'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: getTextColor() }}>
              {showHistory ? '收起' : '查看'}
            </span>
          </div>
        </BubbleCard>

        {showHistory && historyItems.length > 0 && (
          <div className="space-y-3">
            {historyItems.map(renderHistoryItem)}
          </div>
        )}
      </div>
      
      {/* Poster Modal */}
      {showPoster && (
        <PosterGenerator
          entry={entry}
          userId={settings.userId}
          onClose={() => setShowPoster(false)}
        />
      )}
    </motion.div>
  );
};

export default EntryDetailPage;

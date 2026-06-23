import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SmileRating from '@/components/SmileRating';
import PosterGenerator from '@/components/PosterGenerator';
import { Entry } from '@/context/AppContext';
import { useSearchParams } from 'react-router-dom';
import CandyBackground from '@/components/CandyBackground';
import BounceTitle from '@/components/BounceTitle';
import BubbleCard from '@/components/BubbleCard';
import BubbleButton from '@/components/BubbleButton';
import { formatLocalDate, parseLocalDate } from '@/lib/date';

const RecordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addEntry, settings } = useApp();
  
  const [rating, setRating] = useState(2);
  const [content, setContent] = useState('');
  const [showPoster, setShowPoster] = useState(false);
  const [savedEntry, setSavedEntry] = useState<Entry | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const urlDate = searchParams.get('date');
  const targetDate = urlDate ? parseLocalDate(urlDate) : new Date();
  const dateStr = formatLocalDate(targetDate);
  const isBackfill = !!urlDate;
  
  const formatDate = () => {
    return targetDate.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = () => {
    const entry = addEntry({
      date: dateStr,
      rating,
      content,
    });
    setSavedEntry(entry);
    setShowPoster(true);
  };

  const handleClosePoster = () => {
    setShowPoster(false);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen max-w-md mx-auto flex flex-col pt-safe pb-safe"
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
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
            boxShadow: '0 4px 15px hsl(var(--primary) / 0.4)',
          }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <BounceTitle className="text-xl">
            {isBackfill ? '补充嗨呀！' : '记录今天'}
          </BounceTitle>
          <span className="text-sm text-muted-foreground">{formatDate()}</span>
        </div>
      </header>
      
      {/* Content */}
      <div className="relative z-10 flex-1 p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Rating Section */}
        <BubbleCard glow delay={0.1}>
          <h2 className="text-base sm:text-lg font-bold text-center mb-4" style={{ color: 'hsl(var(--primary))' }}>
            今天的心情
          </h2>
          <SmileRating value={rating} onChange={setRating} />
          <motion.p 
            key={rating}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm mt-4 font-bold"
            style={{ color: 'hsl(var(--primary))' }}
          >
            {['', '嗨呀！', '嗨呀呀！！', '嗨呀嗨呀！！！'][rating]}
          </motion.p>
        </BubbleCard>
        
        {/* Text Input - Bubble Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
            今天发生了什么？
          </label>
          <motion.div
            animate={isFocused ? { 
              boxShadow: '0 0 30px hsl(var(--primary) / 0.4), 0 10px 40px hsl(var(--primary) / 0.2)',
              scale: 1.01,
            } : {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              scale: 1,
            }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--accent) / 0.9) 100%)',
              border: isFocused ? '3px solid hsl(var(--primary) / 0.5)' : '3px solid hsl(var(--border) / 0.5)',
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="记录一下今天的心情和事情...✨"
              className="w-full h-32 sm:h-40 p-4 sm:p-5 bg-transparent resize-none text-sm sm:text-base focus:outline-none text-card-foreground placeholder:text-muted-foreground"
            />
          </motion.div>
          <div className="text-right text-xs text-muted-foreground">
            {content.length}/200
          </div>
        </motion.div>
      </div>
      
      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 p-4 sm:p-6"
      >
        <BubbleButton
          onClick={handleSubmit}
          size="xl"
          className="w-full"
          data-testid="button-submit"
        >
          嗨呀！✨
        </BubbleButton>
      </motion.div>
      
      {/* Poster Modal */}
      {showPoster && savedEntry && (
        <PosterGenerator
          entry={savedEntry}
          userId={settings.userId}
          onClose={handleClosePoster}
        />
      )}
    </motion.div>
  );
};

export default RecordPage;

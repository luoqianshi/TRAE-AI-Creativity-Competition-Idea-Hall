import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import BubbleButton from '@/components/BubbleButton';

interface ThemeLockScreenProps {
  daysRecorded: number;
  onClose: () => void;
}

const ThemeLockScreen = ({ daysRecorded, onClose }: ThemeLockScreenProps) => {
  const navigate = useNavigate();
  const remainingDays = 20 - daysRecorded;
  const progress = Math.min((daysRecorded / 20) * 100, 100);

  const handleGoRecord = () => {
    onClose();
    navigate('/');
  };

  const handleBackdropClick = () => {
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Candy gradient backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md" 
        style={{
          background: 'linear-gradient(135deg, rgba(255,237,213,0.9) 0%, rgba(254,215,170,0.9) 50%, rgba(253,186,116,0.9) 100%)',
        }}
        onClick={handleBackdropClick} 
      />
      
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: 360 }}
          transition={{ y: { duration: 4, repeat: Infinity }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
          className="absolute top-[10%] right-[10%] text-4xl opacity-40"
        >
          🍊
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-[20%] left-[8%] text-3xl opacity-30"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[5%] text-2xl opacity-25"
        >
          ☀️
        </motion.div>
      </div>
      
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        className="absolute left-4 top-6 z-50 p-3 rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
          boxShadow: '0 4px 20px rgba(251, 146, 60, 0.5)',
        }}
        data-testid="button-lock-back"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </motion.button>
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-3xl p-6 max-w-sm w-full overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,251,245,0.95) 100%)',
          boxShadow: '0 20px 60px rgba(251, 146, 60, 0.3), 0 0 40px rgba(251, 146, 60, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: '3px solid rgba(251, 146, 60, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glossy highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
            borderRadius: 'inherit',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Animated lock with seedling */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative inline-block mb-4"
          >
            <span className="text-6xl">🌱</span>
            <motion.div
              className="absolute -right-2 -bottom-1"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Lock className="w-6 h-6" style={{ color: '#EA580C' }} />
            </motion.div>
          </motion.div>
          
          {/* Title */}
          <motion.h2 
            className="text-2xl font-black mb-2"
            style={{ color: '#EA580C' }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            嗨呀！惊喜正在酝酿中...
          </motion.h2>
          
          {/* Subtitle */}
          <p className="text-sm mb-4" style={{ color: '#9A3412' }}>
            心理学发现，21天能重塑大脑的快乐回路。
          </p>
          
          {/* Motivation text */}
          <p className="mb-6" style={{ color: '#78350F' }}>
            你已经坚持了 <span className="font-black" style={{ color: '#EA580C' }}>{daysRecorded}</span> 天！
            再坚持 <span className="font-black" style={{ color: '#EA580C' }}>{remainingDays}</span> 天，
            独家主题库将为你开通！
          </p>
          
          {/* Progress bar */}
          <div className="mb-6">
            <div 
              className="relative h-8 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(254,237,213,0.8) 0%, rgba(255,251,245,0.9) 100%)',
                border: '2px solid rgba(251, 146, 60, 0.3)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #FB923C 0%, #EA580C 50%, #C2410C 100%)',
                  boxShadow: '0 0 20px rgba(251, 146, 60, 0.5)',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 w-1/2"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                  }}
                />
              </motion.div>
              
              {/* Progress text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black" style={{ color: '#9A3412' }}>
                  {daysRecorded} / 20
                </span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <BubbleButton
            onClick={handleGoRecord}
            size="lg"
            className="w-full"
            data-testid="button-go-record"
          >
            去记录今天的开心！
          </BubbleButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeLockScreen;

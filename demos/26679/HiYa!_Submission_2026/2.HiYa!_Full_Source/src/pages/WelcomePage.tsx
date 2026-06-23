import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playHaiya } from '@/lib/sfx';
import CandyBackground from '@/components/CandyBackground';
import BubbleButton from '@/components/BubbleButton';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    playHaiya();
    localStorage.setItem('haiya_welcome_seen', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-safe pt-safe relative overflow-hidden">
      <CandyBackground />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Breathing glasses smile icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="text-8xl sm:text-9xl mb-8"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(251, 146, 60, 0.4))',
          }}
        >
          🤓
        </motion.div>

        {/* Title with bounce animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl font-black mb-2"
          style={{ color: '#EA580C' }}
        >
          <motion.span
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            嗨呀！
          </motion.span>
        </motion.h1>

        {/* Welcome text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg mb-6 text-center font-medium"
          style={{ color: '#9A3412' }}
        >
          ✨ 你来到了专属于你的"嗨呀时刻"！😋
        </motion.p>

        {/* Comic speech bubble quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="relative mb-6 max-w-sm"
        >
          {/* Speech bubble */}
          <div 
            className="relative rounded-3xl px-6 py-5 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,251,245,0.9) 100%)',
              boxShadow: '0 10px 40px rgba(251, 146, 60, 0.25), 0 0 30px rgba(251, 146, 60, 0.15)',
              border: '3px solid rgba(251, 146, 60, 0.3)',
            }}
          >
            {/* Tail of speech bubble */}
            <div 
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '20px solid rgba(255,255,255,0.95)',
              }}
            />
            <p className="text-sm leading-relaxed" style={{ color: '#78350F' }}>
              <span className="font-bold" style={{ color: '#EA580C' }}>@HiYaJoHn 说：</span>
              <br />
              "在这里，所有的开心与数据，
              <br />
              都只属于你自己！🔐"
            </p>
          </div>
        </motion.div>

        {/* Data storage reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-10 max-w-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(254,237,213,0.8) 100%)',
            border: '2px solid rgba(251, 146, 60, 0.2)',
          }}
        >
          <motion.span 
            className="text-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📦
          </motion.span>
          <p className="text-xs leading-relaxed" style={{ color: '#9A3412' }}>
            <span className="font-bold">小提醒：</span> 本软件的所有数据都存储在本地，换手机记得备份导出哦！🏠
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <BubbleButton
            onClick={handleStart}
            size="xl"
            className="w-full"
            data-testid="button-start"
          >
            来嗨呀！
          </BubbleButton>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;

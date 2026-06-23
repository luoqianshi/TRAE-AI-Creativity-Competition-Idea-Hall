import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import qrcode from '@/assets/qrcode.png';

interface UnlockCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnlockCelebration = ({ isOpen, onClose }: UnlockCelebrationProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-3xl max-w-xs w-full shadow-2xl"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)) 55%, hsl(var(--primary) / 0.14) 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <Heart className="w-8 h-8 text-primary" />
            </div>

            <div className="relative z-10 p-8 text-center">
              {/* Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-1)) 100%)',
                  boxShadow: '0 10px 26px hsl(var(--primary) / 0.22)',
                }}
              >
                <span className="text-4xl">🎉</span>
              </motion.div>

              {/* Title */}
              <h2 
                className="text-xl font-bold mb-3 text-foreground leading-relaxed"
              >
                嗨呀！你已经度过了嗨呀的20天！
              </h2>

              {/* Message */}
              <p 
                className="text-base mb-6 leading-relaxed text-muted-foreground"
              >
                感受<span className="font-bold text-primary">【嗨呀!】</span>给你带来的变化吧！
              </p>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <img 
                  src={qrcode} 
                  alt="打赏二维码" 
                  className="w-24 h-24 rounded-lg mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  你也可以请HiYaJoHn喝杯咖啡豆浆！
                </p>
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-3 rounded-full font-bold text-primary-foreground shadow-lg bg-gradient-to-br from-primary to-chart-1"
              >
                好嗨呀！🧡
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockCelebration;

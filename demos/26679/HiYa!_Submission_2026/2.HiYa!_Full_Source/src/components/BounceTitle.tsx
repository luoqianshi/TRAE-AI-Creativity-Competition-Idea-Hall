import { motion } from 'framer-motion';

interface BounceTitleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const BounceTitle = ({ children, className = '', delay = 0 }: BounceTitleProps) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
      }}
      transition={{ delay }}
      className={`font-black ${className}`}
      style={{ color: 'hsl(var(--primary))' }}
    >
      <motion.span
        animate={{ 
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </motion.h1>
  );
};

export default BounceTitle;

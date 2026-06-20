import React from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-900 select-none">
      {/* Immersive Scenic Background with Parallax Feel */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-70 scale-105 transition-transform duration-[6000ms] ease-out"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhBI9Xis8-jO9H_hga2F0t4oNh63TcvisMpgw1Cc6s3u0JG6zAAOTS9mRYwgQC7u8F2awW2RwHcpgAxpqbHIUpJjdb9GXp5ig9XYT5nRzdsrvy7cTisCxrd6qx_hurNt1_k02M8THnrwozeSyb-DYdfP10muE_ETLxZzh5RyxoOvxcifMGE9r2DMPXHykJPAOc0iGWaAgdqY6T6qoPPRdcNBUyR2DCPBuQ7hZzC9IhhSCcJPNH0fKfzYEylASYfFjzuR5cBZCZfJjB"
          alt="Ethereal quiet mountain twilight landscape"
          referrerPolicy="no-referrer"
        />
        {/* Soft Linear/Radial Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/60 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10" />
      </div>

      {/* Pulsing Light Glow Orb Behind Content */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-400/20 blur-[100px] animate-pulse-glow" style={{ animationDuration: '6s' }} />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none z-1">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Brand content */}
      <div className="relative z-10 text-center flex flex-col justify-between items-center h-full min-h-[500px] max-w-lg px-8 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="p-1 rounded-full border border-violet-300/20"
            >
              <Compass className="w-10 h-10 text-violet-200/80 stroke-[1.2]" />
            </motion.div>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-light tracking-[0.3em] text-white drop-shadow-md">
            LUMINA
          </h1>
          <p className="font-sans text-sm md:text-base font-light tracking-[0.25em] text-slate-300 opacity-80">
            觉察内在之光 · 呼吸生成画作
          </p>
        </motion.header>

        {/* Central Orb Showcase */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.8, type: 'spring' }}
          className="my-10 relative flex items-center justify-center group"
        >
          <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-violet-300/10 blur-3xl animate-pulse" />
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-36 h-36 md:w-48 md:h-48 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-500 group-hover:scale-105"
          >
            {/* Glossy Core overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-violet-500/10" />
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/10 bg-white/5 shadow-inner flex items-center justify-center">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-violet-100/90 animate-pulse stroke-[1.2]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Action button */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
          className="w-full space-y-6"
        >
          <button
            onClick={onStart}
            className="w-full py-5 rounded-full bg-gradient-to-r from-violet-250 to-indigo-950 text-white font-sans text-lg tracking-[0.15em] border border-white/15 backdrop-blur-md shadow-2xl shadow-violet-500/10 active:scale-95 duration-200 transition-transform relative group overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              开启浮光之旅
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <p className="text-xs tracking-[0.2em] text-slate-400 font-semibold uppercase opacity-60">
            寻找你的平静中心
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

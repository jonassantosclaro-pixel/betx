import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Flame, Trophy, Coins } from "lucide-react";

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    // Elegant progression from 0% to 100% over 5.4 seconds, leaving 0.6 seconds for fadeOut
    const duration = 5400; 
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, 6000); // 6 seconds total

    return () => {
      clearInterval(timer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  // Handle subtle synthesizer audio sound cue (on click or gesture if compatible, or just an ambient vibe option)
  const triggerBeep = () => {
    if (soundPlayed) return;
    setSoundPlayed(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sweep tone 1 - Bass drop
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      // Sweep tone 2 - Futuristic laser chord
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.8);
        
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.8);
      }, 300);

    } catch (e) {
      // AudioContext blocked / unsupported
    }
  };

  return (
    <div 
      onClick={triggerBeep}
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
    >
      {/* Background Neon Lasers / Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12)_0%,rgba(0,0,0,0)_70%)]" />
      
      {/* Laser scanning vertical line */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40 blur-[1px]"
      />

      {/* Floating sports betting particle accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-gradient-to-tl from-emerald-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main Logo Card Presentation */}
      <div className="relative flex flex-col items-center max-w-lg px-6 text-center">
        {/* Decorative Golden / Silver circular portal */}
        <div className="absolute -inset-10 rounded-full border border-blue-500/25 animate-spin-slow pointer-events-none" />
        <div className="absolute -inset-6 rounded-full border border-dashed border-emerald-500/15 animate-spin-reverse pointer-events-none" />
        
        {/* Glow halo behind the logo */}
        <div className="absolute -inset-4 rounded-full bg-blue-600/15 blur-2xl animate-pulse" />

        {/* The Premium Logo Container with Motion Effects */}
        <motion.div
          initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            scale: { type: "spring", stiffness: 90, damping: 12 },
            rotate: { type: "spring", stiffness: 80, damping: 15 },
            opacity: { duration: 1.2, ease: "easeOut" }
          }}
          className="relative z-10 w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-slate-950/60 p-4 rounded-3xl border-2 border-blue-500/40 shadow-2xl shadow-blue-500/15"
        >
          {/* Neon border corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />

          <img 
            src="https://i.postimg.cc/k4Wszn56/Chat-GPT-Image-26-de-mai-de-2026-13-03-24.png" 
            alt="PH BET LOGO" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(37,99,235,0.45)]"
          />
        </motion.div>

        {/* Professional Real-time status / bet loaders */}
        <div className="mt-12 w-64 md:w-80 space-y-4">
          {/* Progress loader bar */}
          <div className="w-full h-[6px] bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-slate-500 uppercase font-black px-1">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              Sincronizando Banco
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Ambient watermark at footer / corner styling */}
      <div className="absolute bottom-8 left-0 right-0 text-center font-mono text-[9px] tracking-[0.3em] text-slate-600 uppercase font-bold">
        SISTEMA DE GESTÃO ESPORTIVA PH • SEGURO & CRIPTOGRAFADO
      </div>
    </div>
  );
};

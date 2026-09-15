import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles } from 'lucide-react';

export interface BalloonReward {
  type: 'wool' | 'horns' | 'fever' | 'clover';
  amount?: number;
  label: string;
}

interface MysteryBalloonProps {
  onCollectReward: (reward: BalloonReward) => void;
  woolPerClick: number;
  woolPerSecond: number;
}

export const MysteryBalloon: React.FC<MysteryBalloonProps> = ({
  onCollectReward,
  woolPerClick,
  woolPerSecond,
}) => {
  const [balloon, setBalloon] = useState<{
    id: number;
    yPercent: number;
    color: string;
    reward: BalloonReward;
  } | null>(null);

  const [poppedReward, setPoppedReward] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const colors = [
    'from-rose-400 to-red-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-blue-500',
    'from-purple-400 to-indigo-500',
    'from-pink-400 to-rose-500',
  ];

  useEffect(() => {
    let timeoutId: number;

    const scheduleBalloon = () => {
      // Spawn every 45-75 seconds
      const delay = 45000 + Math.random() * 30000;
      timeoutId = window.setTimeout(() => {
        const roll = Math.random();
        let reward: BalloonReward;

        if (roll < 0.45) {
          // Bonus Wool
          const bonus = Math.max(250, Math.round(woolPerClick * 35 + woolPerSecond * 15));
          reward = {
            type: 'wool',
            amount: bonus,
            label: `+${bonus.toLocaleString('ru-RU')} шерсти! 🧶`,
          };
        } else if (roll < 0.70) {
          // Fever Mode
          reward = {
            type: 'fever',
            label: '⚡ ЗОЛОТАЯ ЛИХОРАДКА x5! (10с)',
          };
        } else if (roll < 0.90) {
          // Golden Horn
          reward = {
            type: 'horns',
            amount: 1,
            label: '+1 Золотой Рог! 📯',
          };
        } else {
          // Golden Clover
          reward = {
            type: 'clover',
            label: '🍀 Золотой Клевер x3! (12с)',
          };
        }

        const pickedColor = colors[Math.floor(Math.random() * colors.length)];

        setBalloon({
          id: Date.now(),
          yPercent: 18 + Math.random() * 16, // Top 18% to 34% of screen (safe below header)
          color: pickedColor,
          reward,
        });
      }, delay);
    };

    scheduleBalloon();

    return () => clearTimeout(timeoutId);
  }, [woolPerClick, woolPerSecond]);

  const handlePop = (e: React.MouseEvent) => {
    if (!balloon) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    });

    const rewardToGive = balloon.reward;
    setBalloon(null);

    setPoppedReward({
      text: rewardToGive.label,
      x,
      y,
    });

    setTimeout(() => {
      setPoppedReward(null);
    }, 2000);

    onCollectReward(rewardToGive);
  };

  return (
    <>
      <AnimatePresence>
        {balloon && (
          <motion.div
            key={balloon.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: '100vw', opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{
              duration: 26,
              ease: 'linear',
            }}
            onAnimationComplete={() => setBalloon(null)}
            style={{ top: `${balloon.yPercent}%` }}
            className="absolute z-20 pointer-events-auto cursor-pointer"
            onClick={handlePop}
          >
            <motion.div
              animate={{ y: [-4, 6, -4], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center group active:scale-90 transition-transform"
            >
              {/* Balloon Body */}
              <div
                className={`relative w-14 h-16 sm:w-16 sm:h-18 rounded-[50%] bg-gradient-to-b ${balloon.color} shadow-lg flex items-center justify-center border-2 border-white/80`}
              >
                {/* Highlight gleam */}
                <div className="absolute top-2 left-2.5 w-3.5 h-6 bg-white/40 rounded-full rotate-[-25deg]" />
                <Sparkles className="w-5 h-5 text-white/90 drop-shadow-sm animate-pulse" />

                {/* Knot at bottom */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-1.5 bg-slate-700/60 rounded-sm" />
              </div>

              {/* String */}
              <div className="w-0.5 h-6 bg-slate-600/70" />

              {/* Hanging Gift Box */}
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400 border border-amber-600 shadow-md text-amber-950">
                <Gift className="w-4 h-4 fill-amber-100" />
              </div>

              {/* Tap Hint */}
              <span className="text-[9px] font-black tracking-wide text-white bg-slate-900/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full mt-1 opacity-90 group-hover:opacity-100 uppercase">
                Лопни!
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Popped Reward Banner */}
      <AnimatePresence>
        {poppedReward && (
          <motion.div
            initial={{ opacity: 1, scale: 0.8, y: 0 }}
            animate={{ opacity: 0, scale: 1.15, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{ left: poppedReward.x, top: poppedReward.y }}
            className="fixed -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none px-3.5 py-1.5 rounded-full bg-slate-900/90 text-yellow-300 font-extrabold text-sm sm:text-base border border-yellow-400/80 shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 fill-yellow-300 animate-spin" />
            <span>{poppedReward.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

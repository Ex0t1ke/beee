import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playGoldenChime } from '../utils/sound';

interface GoldenCloverEventProps {
  onCollect: () => void;
  soundEnabled: boolean;
}

export const GoldenCloverEvent: React.FC<GoldenCloverEventProps> = ({ onCollect, soundEnabled }) => {
  const [cloverPos, setCloverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Spawn every 35-65 seconds
    const scheduleNext = () => {
      const delay = 35000 + Math.random() * 30000;
      return setTimeout(() => {
        // Random paddock position (keeping within pasture view)
        const randX = 15 + Math.random() * 70; // percentage
        const randY = 25 + Math.random() * 50; // percentage
        setCloverPos({ x: randX, y: randY });

        // Clover stays for 9 seconds then floats away
        setTimeout(() => {
          setCloverPos(null);
          timerRef.current = scheduleNext();
        }, 9000);
      }, delay);
    };

    const timerRef = { current: scheduleNext() };
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) {
      playGoldenChime();
    }

    // Confetti celebration
    confetti({
      particleCount: 45,
      spread: 60,
      origin: {
        x: (cloverPos?.x ?? 50) / 100,
        y: (cloverPos?.y ?? 50) / 100,
      },
      colors: ['#facc15', '#fbbf24', '#f59e0b', '#34d399', '#ffffff'],
    });

    setCloverPos(null);
    onCollect();
  };

  return (
    <AnimatePresence>
      {cloverPos && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: 1,
            rotate: [0, 15, -15, 0],
            y: [-10, 10, -10],
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            left: `${cloverPos.x}%`,
            top: `${cloverPos.y}%`,
          }}
          onClick={handleClick}
          className="fixed z-25 cursor-pointer select-none group"
        >
          {/* Glowing pulse ring */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-lg animate-ping pointer-events-none" />

          {/* Golden 4-leaf clover badge */}
          <div className="relative flex flex-col items-center justify-center p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-100 border-2 border-yellow-200 shadow-[0_8px_20px_rgba(234,179,8,0.5)] transform hover:scale-125 transition-transform">
            <span className="text-3xl filter drop-shadow">🍀</span>
            <div className="absolute -bottom-5 bg-amber-950/80 text-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
              Бонус! Жми!
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

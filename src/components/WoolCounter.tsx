import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface WoolCounterProps {
  wool: number;
  woolPerSecond: number;
  woolPerClick: number;
  isGoldenMode?: boolean;
}

export const WoolCounter: React.FC<WoolCounterProps> = ({
  wool,
  woolPerSecond,
  woolPerClick,
  isGoldenMode = false,
}) => {
  // Format numbers nicely: 1 234 or 12.5k or 1.2M
  const formatNumber = (num: number): string => {
    if (num < 1000) {
      return Math.floor(num).toLocaleString('ru-RU');
    }
    if (num < 1000000) {
      return (num / 1000).toFixed(1).replace('.0', '') + ' тыс.';
    }
    return (num / 1000000).toFixed(2).replace('.00', '') + ' млн.';
  };

  return (
    <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 select-none">
      <motion.div
        animate={{
          scale: isGoldenMode ? [1, 1.04, 1] : 1,
        }}
        transition={{ duration: 1.2, repeat: isGoldenMode ? Infinity : 0 }}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md shadow-xl border transition-all ${
          isGoldenMode
            ? 'bg-gradient-to-r from-amber-500/90 to-yellow-400/90 text-amber-950 border-yellow-200 shadow-yellow-500/30'
            : 'bg-white/90 text-slate-800 border-emerald-200/80 shadow-emerald-950/10'
        }`}
      >
        {/* Animated Wool Ball Icon */}
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200 shadow-inner flex-shrink-0"
        >
          {/* Wool skein SVG */}
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            {/* Skein background puff */}
            <circle cx="18" cy="18" r="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx="14" cy="15" rx="8" ry="6" fill="#ffffff" />
            <ellipse cx="22" cy="16" rx="7" ry="5" fill="#f1f5f9" />
            {/* Yarn yarn winding wraps */}
            <path
              d="M8,16 C10,9 26,9 28,16 C30,23 14,27 10,21"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M12,12 C18,8 24,18 20,24 C16,28 10,22 14,14"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Loose thread hanging */}
            <path
              d="M23,24 C27,27 26,31 31,32"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {isGoldenMode && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1 text-amber-600"
            >
              <Sparkles className="w-4 h-4 fill-amber-300" />
            </motion.div>
          )}
        </motion.div>

        {/* Counter Numbers & Substats */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight font-['Comfortaa',sans-serif]">
              {formatNumber(wool)}
            </span>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
              шерсти
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold mt-0.5">
            <span
              className={`flex items-center gap-1 ${
                isGoldenMode ? 'text-amber-900 font-bold' : 'text-emerald-700'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              +{woolPerSecond.toLocaleString('ru-RU')}/сек
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              +{woolPerClick.toLocaleString('ru-RU')} клик
            </span>
          </div>
        </div>

        {/* Golden Mode Banner Tag */}
        {isGoldenMode && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-600 text-amber-50 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider">
            Золотой клевер x3! ✨
          </div>
        )}
      </motion.div>
    </div>
  );
};

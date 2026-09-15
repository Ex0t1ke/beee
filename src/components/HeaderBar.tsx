import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Gauge, Volume2, VolumeX, Zap } from 'lucide-react';
import { WeatherState } from '../types';

interface HeaderBarProps {
  wool: number;
  woolPerSecond: number;
  woolPerClick: number;
  combo: number;
  fps: number;
  isGoldenMode?: boolean;
  isFeverMode?: boolean;
  weather: WeatherState;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  wool,
  woolPerSecond,
  woolPerClick,
  combo,
  fps,
  isGoldenMode = false,
  isFeverMode = false,
  weather,
  soundEnabled,
  onToggleSound,
}) => {
  const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toLocaleString('ru-RU');
    if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + ' тыс.';
    return (num / 1000000).toFixed(2).replace('.00', '') + ' млн.';
  };

  return (
    <header className="absolute top-0 inset-x-0 z-30 px-2 sm:px-4 pt-2.5 sm:pt-3 select-none pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Compact, High-Contrast Wool Counter */}
        <motion.div
          animate={{
            scale: isFeverMode ? [1, 1.03, 1] : isGoldenMode ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 0.8, repeat: isFeverMode || isGoldenMode ? Infinity : 0 }}
          className={`pointer-events-auto relative flex items-center gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl backdrop-blur-md shadow-md border transition-all ${
            isFeverMode
              ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white border-amber-300 shadow-orange-500/40 ring-2 ring-yellow-400'
              : isGoldenMode
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-yellow-200 shadow-yellow-500/25'
              : 'bg-white/95 text-slate-800 border-emerald-200/90 shadow-emerald-950/10'
          }`}
        >
          {/* Animated Wool Skein Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200 shadow-inner flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
              <circle cx="18" cy="18" r="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="14" cy="15" rx="8" ry="6" fill="#ffffff" />
              <ellipse cx="22" cy="16" rx="7" ry="5" fill="#f1f5f9" />
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
              <path
                d="M23,24 C27,27 26,31 31,32"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {(isGoldenMode || isFeverMode) && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 -right-1 text-amber-600"
              >
                <Sparkles className="w-3 h-3 fill-amber-300" />
              </motion.div>
            )}
          </div>

          {/* Wool Numbers & Substats */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-lg sm:text-2xl font-black tracking-tight">
                {formatNumber(wool)}
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider opacity-75">
                шерсти
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold mt-0.5 leading-none">
              <span
                className={`flex items-center gap-0.5 whitespace-nowrap ${
                  isFeverMode
                    ? 'text-yellow-100 font-extrabold'
                    : isGoldenMode
                    ? 'text-amber-950 font-bold'
                    : 'text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                +{woolPerSecond.toLocaleString('ru-RU')}/с
              </span>
              <span className="opacity-40">•</span>
              <span className="opacity-80 whitespace-nowrap">
                +{woolPerClick.toLocaleString('ru-RU')} клик
              </span>
            </div>
          </div>

          {/* Active Status Badge */}
          {isFeverMode ? (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-yellow-100 text-[8px] sm:text-[9px] font-black px-2 py-0.2 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
              <Zap className="w-2.5 h-2.5 fill-yellow-300" />
              ЛИХОРАДКА x5!
            </div>
          ) : isGoldenMode ? (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-amber-50 text-[8px] sm:text-[9px] font-black px-2 py-0.2 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider">
              Клевер x3! ✨
            </div>
          ) : null}
        </motion.div>

        {/* Right Section: Compact Weather & Sound Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Weather Widget */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-md text-slate-800">
            <span className="text-lg sm:text-xl animate-bounce leading-none">{weather.icon}</span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 truncate max-w-[70px] sm:max-w-[110px]">
                  {weather.name}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded-md">
                  {weather.duration}с
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold leading-none mt-0.5 truncate">
                {weather.woolMultiplier > 1 ? `x${weather.woolMultiplier} шерсть` : ''}
                {weather.clickMultiplier > 1 ? `x${weather.clickMultiplier} клик` : ''}
                {weather.woolMultiplier === 1 && weather.clickMultiplier === 1 ? 'Ясно' : ''}
              </span>
            </div>
          </div>

          {/* Quick Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-bar: Combo Meter & Refresh Rate (Non-overlapping, discrete) */}
      <div className="max-w-4xl mx-auto flex items-center gap-2 mt-1.5 px-1">
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: -10 }}
              className="pointer-events-auto flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] sm:text-[11px] font-extrabold shadow-md border border-orange-300/40"
            >
              <Flame className="w-3 h-3 fill-yellow-200 animate-bounce" />
              <span>Комбо x{(1 + combo * 0.05).toFixed(2)}</span>
              <span className="text-[9px] bg-white/20 px-1 rounded-full">{combo}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {fps > 45 && (
          <div
            className="pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md text-emerald-300 text-[9px] sm:text-[10px] font-mono font-bold shadow-sm border border-emerald-500/20"
            title="Частота обновления экрана"
          >
            <Gauge className="w-2.5 h-2.5 text-emerald-400" />
            <span>{fps} Hz</span>
          </div>
        )}
      </div>
    </header>
  );
};


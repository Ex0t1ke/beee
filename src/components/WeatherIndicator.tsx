import React from 'react';
import { WeatherState } from '../types';

interface WeatherIndicatorProps {
  weather: WeatherState;
}

/**
 * Top pasture weather banner showing current climate condition,
 * multiplier buffs, and time left.
 */
export const WeatherIndicator: React.FC<WeatherIndicatorProps> = ({ weather }) => {
  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 select-none flex items-center gap-2">
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/70 shadow-lg text-slate-800 text-xs md:text-sm font-semibold">
        <span className="text-xl md:text-2xl animate-bounce">{weather.icon}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900">{weather.name}</span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
              {weather.duration}с
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">
            {weather.woolMultiplier > 1 ? `шерсть x${weather.woolMultiplier} ` : ''}
            {weather.clickMultiplier > 1 ? `клик x${weather.clickMultiplier}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

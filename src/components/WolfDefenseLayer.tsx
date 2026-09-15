import React, { useState, useEffect } from 'react';
import { WolfEncounter } from '../types';
import { playSheepBaa } from '../utils/sound';

interface WolfDefenseLayerProps {
  wolf: WolfEncounter | null;
  onTapWolf: (e: React.MouseEvent) => void;
  soundEnabled: boolean;
}

/**
 * Interactive Pasture Defense Mini-game:
 * A sneaky wolf sneaks into the pasture! Players must tap/click the wolf rapidly
 * before the timer expires to defend the flock and earn a massive bounty + Golden Horn!
 */
export const WolfDefenseLayer: React.FC<WolfDefenseLayerProps> = ({
  wolf,
  onTapWolf,
  soundEnabled,
}) => {
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    if (wolf && soundEnabled) {
      // Alert bleat
      playSheepBaa(1.4);
    }
  }, [wolf?.id, soundEnabled]);

  if (!wolf) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHit(true);
    setTimeout(() => setIsHit(false), 140);
    onTapWolf(e);
  };

  const percentLeft = Math.max(0, Math.min(100, (wolf.timeLeft / 15) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Top Banner Alert */}
      <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none animate-bounce">
        <div className="px-5 py-2 rounded-2xl bg-rose-600/90 text-white font-black text-sm md:text-base border-2 border-rose-300 shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <span className="text-xl">🐺</span>
          <span>ТРЕВОГА! Волк пробрался в загон! Нажимай на него!</span>
          <span className="bg-rose-950/60 px-2 py-0.5 rounded-lg text-rose-200 text-xs font-mono">
            {wolf.timeLeft.toFixed(1)}с
          </span>
        </div>
      </div>

      {/* Sneaky Wolf Character on Pasture */}
      <div
        className="absolute pointer-events-auto cursor-pointer transition-all duration-75"
        style={{
          left: `${wolf.x}%`,
          top: `${wolf.y}%`,
          transform: `translate(-50%, -50%) scale(${isHit ? 0.85 : 1})`,
        }}
        onClick={handleClick}
      >
        {/* Health / Clicks progress ring */}
        <div className="flex flex-col items-center">
          <div className="w-20 bg-black/60 backdrop-blur-sm rounded-full h-2.5 p-0.5 border border-white/40 mb-1 overflow-hidden shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-100"
              style={{
                width: `${(wolf.clicksRemaining / wolf.clicksRequired) * 100}%`,
              }}
            />
          </div>

          <span className="text-[11px] font-black text-white bg-rose-900/80 px-2 py-0.5 rounded-md border border-rose-400/50 shadow mb-1">
            {wolf.clicksRemaining} {wolf.clicksRemaining === 1 ? 'удар!' : 'ударов!'}
          </span>

          {/* Animated Wolf Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-4 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center justify-center text-4xl md:text-5xl animate-pulse">
              🐺
            </div>

            {/* Tap prompt hint */}
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-slate-900 shadow font-sans">
                КЛИКАЙ!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

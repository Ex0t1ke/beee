import React from 'react';
import { FloatingParticle } from '../types';

interface FloatingWoolParticlesProps {
  particles: FloatingParticle[];
}

/**
 * High-performance Click Particles (Step 4)
 * - Zero Framer Motion / AnimatePresence overhead
 * - Pure GPU compositor CSS animation (@keyframes float-up)
 * - Drastically reduces mobile CPU & battery usage during fast tap combos
 */
export const FloatingWoolParticles: React.FC<FloatingWoolParticlesProps> = ({ particles }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute flex items-center gap-1 font-extrabold drop-shadow-md animate-float-up pointer-events-none"
          style={
            {
              left: `${p.x}px`,
              top: `${p.y}px`,
              // Pass random horizontal drift via CSS variable for natural physics
              '--particle-drift': `${((p.id % 7) - 3) * 6}px`,
            } as React.CSSProperties
          }
        >
          {/* Fluffy wool particle icon */}
          <div className="w-5 h-5 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center text-[10px]">
            🧶
          </div>
          <span
            className={`text-lg md:text-xl font-black ${
              p.isCrit ? 'text-amber-500 text-2xl font-black drop-shadow' : 'text-emerald-700'
            }`}
          >
            {p.text}
          </span>
        </div>
      ))}
    </div>
  );
};

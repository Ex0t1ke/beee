import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingParticle } from '../types';

interface FloatingWoolParticlesProps {
  particles: FloatingParticle[];
}

export const FloatingWoolParticles: React.FC<FloatingWoolParticlesProps> = ({ particles }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              scale: 0.6,
              x: p.x - 20,
              y: p.y - 20,
            }}
            animate={{
              opacity: 0,
              scale: [0.6, 1.25, 1],
              y: p.y - 110,
              x: p.x + (Math.random() * 40 - 20),
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: 'easeOut',
            }}
            className="absolute flex items-center gap-1 font-extrabold select-none drop-shadow-md"
          >
            {/* Fluffy wool particle icon */}
            <div className="w-5 h-5 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center text-[10px]">
              🧶
            </div>
            <span
              className={`text-lg md:text-xl font-black ${
                p.isCrit ? 'text-amber-500 text-2xl font-black' : 'text-emerald-700'
              }`}
            >
              {p.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

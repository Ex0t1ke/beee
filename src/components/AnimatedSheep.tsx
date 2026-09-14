import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { playSheepBaa, playShearSnip, playWoolPop } from '../utils/sound';

interface AnimatedSheepProps {
  onShear: (e: React.MouseEvent<HTMLDivElement>) => void;
  soundEnabled: boolean;
  activeAccessory?: string;
  isGoldenMode?: boolean;
}

export const AnimatedSheep: React.FC<AnimatedSheepProps> = ({
  onShear,
  soundEnabled,
  activeAccessory = 'none',
  isGoldenMode = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const controls = useAnimationControls();

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Play sounds
    if (soundEnabled) {
      playShearSnip();
      playWoolPop();
      // Occasionally or 1 in 3 clicks, the sheep bleats joyfully!
      if (Math.random() < 0.35) {
        setTimeout(() => playSheepBaa(isGoldenMode ? 1.3 : 1.0), 40);
      }
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 220);

    // Random jump rotation angle for lively variation
    const tilt = (Math.random() - 0.5) * 16;
    const jumpHeight = -80 - Math.random() * 20;

    // Trigger bouncy jump sequence
    controls.stop();
    controls.start({
      y: [0, 8, jumpHeight, -15, 6, 0],
      scaleX: [1, 1.14, 0.92, 1.05, 0.98, 1],
      scaleY: [1, 0.86, 1.15, 0.95, 1.03, 1],
      rotate: [0, -tilt * 0.4, tilt, -tilt * 0.3, 0],
      transition: {
        duration: 0.55,
        times: [0, 0.12, 0.45, 0.72, 0.88, 1],
        ease: 'easeOut',
      },
    });

    onShear(e);
  };

  return (
    <div className="relative flex flex-col items-center select-none cursor-pointer">
      {/* Interactive Sheep Container */}
      <motion.div
        animate={controls}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="relative group p-4"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Soft shadow on the grass under sheep */}
        <motion.div
          animate={{
            scale: isClicked ? 0.65 : 1,
            opacity: isClicked ? 0.25 : 0.45,
          }}
          transition={{ duration: 0.25 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 bg-emerald-950/40 rounded-full blur-md"
        />

        {/* Golden Mode Aura */}
        {isGoldenMode && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-yellow-300/30 blur-2xl -z-10"
          />
        )}

        {/* SVG SHEEP CHARACTER */}
        <svg
          width="270"
          height="230"
          viewBox="0 0 270 230"
          className="overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          <defs>
            {/* Wool Body Gradients */}
            <radialGradient id="woolGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={isGoldenMode ? '#fef08a' : '#ffffff'} />
              <stop offset="70%" stopColor={isGoldenMode ? '#fde047' : '#f8fafc'} />
              <stop offset="100%" stopColor={isGoldenMode ? '#eab308' : '#e2e8f0'} />
            </radialGradient>

            <radialGradient id="faceGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* --- LEGS --- */}
          <g id="sheep-legs">
            {/* Back Left Leg */}
            <motion.rect
              animate={{ y: isClicked ? -6 : 0, rotate: isClicked ? -8 : 0 }}
              x="62"
              y="155"
              width="18"
              height="48"
              rx="8"
              fill="url(#legGrad)"
            />
            {/* Back Right Leg */}
            <motion.rect
              animate={{ y: isClicked ? -6 : 0, rotate: isClicked ? 8 : 0 }}
              x="178"
              y="155"
              width="18"
              height="48"
              rx="8"
              fill="url(#legGrad)"
            />

            {/* Front Left Leg */}
            <motion.g animate={{ y: isClicked ? -12 : 0, rotate: isClicked ? 12 : 0 }}>
              <rect x="86" y="162" width="20" height="48" rx="8" fill="url(#legGrad)" />
              {/* Hoof highlight */}
              <rect x="86" y="196" width="20" height="14" rx="4" fill="#0f172a" />
            </motion.g>

            {/* Front Right Leg */}
            <motion.g animate={{ y: isClicked ? -12 : 0, rotate: isClicked ? -12 : 0 }}>
              <rect x="152" y="162" width="20" height="48" rx="8" fill="url(#legGrad)" />
              {/* Hoof highlight */}
              <rect x="152" y="196" width="20" height="14" rx="4" fill="#0f172a" />
            </motion.g>
          </g>

          {/* --- CUTE FLUFFY TAIL --- */}
          <motion.circle
            animate={{
              rotate: [0, 18, -18, 12, 0],
              scale: isClicked ? 1.25 : 1,
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            cx="32"
            cy="125"
            r="16"
            fill="url(#woolGrad)"
            stroke={isGoldenMode ? '#eab308' : '#cbd5e1'}
            strokeWidth="2.5"
          />

          {/* --- MAIN FLUFFY WOOL BODY (Layered puffy clouds) --- */}
          <g id="sheep-wool-body">
            {/* Background cloud puffs for 3D fullness */}
            <circle cx="65" cy="115" r="34" fill="url(#woolGrad)" />
            <circle cx="95" cy="85" r="36" fill="url(#woolGrad)" />
            <circle cx="140" cy="80" r="38" fill="url(#woolGrad)" />
            <circle cx="185" cy="90" r="36" fill="url(#woolGrad)" />
            <circle cx="210" cy="120" r="32" fill="url(#woolGrad)" />
            <circle cx="195" cy="150" r="34" fill="url(#woolGrad)" />
            <circle cx="150" cy="165" r="36" fill="url(#woolGrad)" />
            <circle cx="105" cy="165" r="36" fill="url(#woolGrad)" />
            <circle cx="68" cy="148" r="32" fill="url(#woolGrad)" />

            {/* Central massive puff core */}
            <ellipse cx="135" cy="128" rx="72" ry="54" fill="url(#woolGrad)" />

            {/* Soft decorative cloud curl highlights inside fleece */}
            <path
              d="M95,115 Q105,100 115,112"
              fill="none"
              stroke={isGoldenMode ? '#ca8a04' : '#cbd5e1'}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M140,110 Q152,98 162,112"
              fill="none"
              stroke={isGoldenMode ? '#ca8a04' : '#cbd5e1'}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M120,145 Q132,135 144,146"
              fill="none"
              stroke={isGoldenMode ? '#ca8a04' : '#cbd5e1'}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M75,138 Q85,128 95,140"
              fill="none"
              stroke={isGoldenMode ? '#ca8a04' : '#cbd5e1'}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* --- HEAD & FACE --- */}
          <g id="sheep-head" transform="translate(145, 60)">
            {/* Drooping Cute Ears */}
            {/* Left Ear */}
            <motion.path
              animate={{
                rotate: isClicked ? [-15, 25, -5] : [0, 8, 0],
              }}
              transition={{ duration: 0.6 }}
              d="M 5,32 C -24,30 -32,54 -12,56 C 2,58 10,42 5,32 Z"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Inner pink ear */}
            <path d="M 0,35 C -18,34 -22,49 -8,51 C 2,52 6,42 0,35 Z" fill="#f472b6" opacity="0.6" />

            {/* Right Ear */}
            <motion.path
              animate={{
                rotate: isClicked ? [15, -25, 5] : [0, -8, 0],
              }}
              transition={{ duration: 0.6 }}
              d="M 65,32 C 94,30 102,54 82,56 C 68,58 60,42 65,32 Z"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Inner pink ear */}
            <path d="M 70,35 C 88,34 92,49 78,51 C 68,52 64,42 70,35 Z" fill="#f472b6" opacity="0.6" />

            {/* Face Oval Body */}
            <ellipse cx="35" cy="48" rx="34" ry="38" fill="url(#faceGrad)" />

            {/* Rosy Cheeks */}
            <circle cx="12" cy="58" r="8" fill="#fb7185" opacity="0.55" />
            <circle cx="58" cy="58" r="8" fill="#fb7185" opacity="0.55" />

            {/* Eyes */}
            {isBlinking || isClicked ? (
              // Happy squinting crescent eyes ^_^
              <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 18,44 Q 25,36 31,44" />
                <path d="M 40,44 Q 46,36 53,44" />
              </g>
            ) : (
              // Big sparkling curious eyes
              <g>
                {/* Left Eye */}
                <ellipse cx="24" cy="42" rx="6.5" ry="8" fill="#ffffff" />
                <ellipse cx="24" cy="42" rx="4.5" ry="6" fill="#0f172a" />
                <circle cx="22" cy="39" r="2.2" fill="#ffffff" />
                <circle cx="26" cy="44" r="1.1" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="46" cy="42" rx="6.5" ry="8" fill="#ffffff" />
                <ellipse cx="46" cy="42" rx="4.5" ry="6" fill="#0f172a" />
                <circle cx="44" cy="39" r="2.2" fill="#ffffff" />
                <circle cx="48" cy="44" r="1.1" fill="#ffffff" />
              </g>
            )}

            {/* Cute Snout & Gentle Smile */}
            <g transform="translate(35, 63)">
              {/* Nose */}
              <path d="M -5,-3 Q 0,2 5,-3 Q 0,-6 -5,-3 Z" fill="#f472b6" />
              {/* Mouth line */}
              <line x1="0" y1="-1" x2="0" y2="6" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M -7,4 Q -4,8 0,6 Q 4,8 7,4"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Fluffy Forehead Fleece Tufts (Head Bangs) */}
            <g id="head-wool">
              <circle cx="16" cy="16" r="13" fill="url(#woolGrad)" />
              <circle cx="35" cy="11" r="15" fill="url(#woolGrad)" />
              <circle cx="54" cy="16" r="13" fill="url(#woolGrad)" />
              <circle cx="26" cy="14" r="12" fill="url(#woolGrad)" />
              <circle cx="44" cy="14" r="12" fill="url(#woolGrad)" />
            </g>

            {/* =================================================== */}
            {/* ACCESSORIES ATTACHMENT */}
            {/* =================================================== */}

            {/* 1. Flower Crown */}
            {activeAccessory === 'flower' && (
              <g transform="translate(10, 0)">
                {/* Daisy 1 */}
                <circle cx="6" cy="12" r="6" fill="#f472b6" />
                <circle cx="6" cy="12" r="2.5" fill="#facc15" />
                {/* Daisy 2 */}
                <circle cx="25" cy="6" r="7" fill="#ffffff" />
                <circle cx="25" cy="6" r="3" fill="#facc15" />
                {/* Daisy 3 */}
                <circle cx="44" cy="11" r="6" fill="#60a5fa" />
                <circle cx="44" cy="11" r="2.5" fill="#facc15" />
              </g>
            )}

            {/* 2. Pasture Bell on Ribbon */}
            {activeAccessory === 'bell' && (
              <g transform="translate(35, 78)">
                {/* Red ribbon collar */}
                <path d="M -22,-6 Q 0,4 22,-6" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                {/* Golden Bell */}
                <motion.g
                  animate={{ rotate: isClicked ? [-25, 25, -15, 10, 0] : [0, 4, -4, 0] }}
                  transition={{ duration: 0.8 }}
                  className="origin-top"
                >
                  <path d="M -8,0 Q -9,12 -12,15 L 12,15 Q 9,12 8,0 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="0" cy="16" r="3" fill="#ca8a04" />
                </motion.g>
              </g>
            )}

            {/* 3. Straw Farmer Hat */}
            {activeAccessory === 'hat' && (
              <g transform="translate(0, -18)">
                {/* Hat Brim */}
                <ellipse cx="35" cy="22" rx="36" ry="9" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
                {/* Hat Crown */}
                <path d="M 18,20 L 22,2 Q 35,-1 48,2 L 52,20 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                {/* Blue ribbon band */}
                <path d="M 19,16 L 51,16" stroke="#3b82f6" strokeWidth="4" />
              </g>
            )}

            {/* 4. Cool Sunglasses */}
            {activeAccessory === 'sunglasses' && (
              <g transform="translate(10, 36)">
                {/* Left Lens */}
                <path d="M 5,0 L 22,0 C 24,10 18,16 5,14 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                {/* Right Lens */}
                <path d="M 28,0 L 45,0 C 47,10 41,16 28,14 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                {/* Bridge */}
                <line x1="22" y1="4" x2="28" y2="4" stroke="#0f172a" strokeWidth="3" />
                {/* Lens Reflections */}
                <line x1="8" y1="3" x2="16" y2="11" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
                <line x1="31" y1="3" x2="39" y2="11" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
              </g>
            )}

            {/* 5. Royal Crown */}
            {activeAccessory === 'crown' && (
              <g transform="translate(15, -16)">
                <polygon
                  points="0,18 4,2 14,10 21,-2 28,10 38,2 42,18"
                  fill="#facc15"
                  stroke="#ca8a04"
                  strokeWidth="2"
                />
                {/* Crown jewels */}
                <circle cx="4" cy="2" r="2" fill="#ef4444" />
                <circle cx="21" cy="-2" r="2.5" fill="#3b82f6" />
                <circle cx="38" cy="2" r="2" fill="#ef4444" />
              </g>
            )}
          </g>
        </svg>

        {/* Hover hint badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-900/80 text-amber-100 text-xs font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap pointer-events-none">
          Тыкни овечку! ✂️
        </div>
      </motion.div>
    </div>
  );
};

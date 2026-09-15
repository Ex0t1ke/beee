import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetDefinition, OwnedPet } from '../types';
import { playPetSound, playPetFeedSound, playWoolPop } from '../utils/sound';

interface AnimatedPetsLayerProps {
  pets: PetDefinition[];
  ownedPets: OwnedPet[];
  soundEnabled: boolean;
  onFeedPet: (petId: string) => { success: boolean; woolBonus: number };
}

interface PetBubble {
  text: string;
  id: number;
}

// Preset visual locations and roaming bounds in the farm paddock
const PET_SETTINGS: Record<
  string,
  {
    baseBottom: number; // percentage from bottom
    baseLeft: number; // percentage from left
    roamX: number; // px roam range
    jumpHeight: number;
  }
> = {
  pet_bunny: { baseBottom: 16, baseLeft: 18, roamX: 45, jumpHeight: 22 },
  pet_chick: { baseBottom: 12, baseLeft: 34, roamX: 30, jumpHeight: 16 },
  pet_dog: { baseBottom: 20, baseLeft: 76, roamX: 55, jumpHeight: 20 },
  pet_cat: { baseBottom: 28, baseLeft: 14, roamX: 35, jumpHeight: 18 },
  pet_piglet: { baseBottom: 14, baseLeft: 64, roamX: 50, jumpHeight: 15 },
};

export const AnimatedPetsLayer: React.FC<AnimatedPetsLayerProps> = ({
  pets,
  ownedPets,
  soundEnabled,
  onFeedPet,
}) => {
  const [bubbles, setBubbles] = useState<Record<string, PetBubble>>({});
  const [hearts, setHearts] = useState<
    Array<{ id: number; petId: string; x: number; y: number; text: string }>
  >([]);

  // Interact with pet: pet reaction, sound, floating hearts, speech bubble
  const handlePetInteraction = (
    pet: PetDefinition,
    owned: OwnedPet,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // Trigger sound
    if (soundEnabled) {
      playPetSound(pet.species);
    }

    // Try feeding / petting
    const feedResult = onFeedPet(pet.id);
    if (feedResult.success && soundEnabled) {
      setTimeout(() => playPetFeedSound(), 60);
      setTimeout(() => playWoolPop(), 160);
    }

    // Speech dialogue
    const randomLine =
      pet.dialogueLines[Math.floor(Math.random() * pet.dialogueLines.length)];
    setBubbles((prev) => ({
      ...prev,
      [pet.id]: {
        text: feedResult.success ? `Вкуснятина! +${feedResult.woolBonus} 🧶` : randomLine,
        id: Date.now(),
      },
    }));

    // Floating heart effect
    const heartId = Date.now() + Math.random();
    setHearts((prev) => [
      ...prev.slice(-10),
      {
        id: heartId,
        petId: pet.id,
        x: e.clientX,
        y: e.clientY - 30,
        text: feedResult.success ? `❤️ +${feedResult.woolBonus}` : '❤️',
      },
    ]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1000);

    setTimeout(() => {
      setBubbles((prev) => {
        const next = { ...prev };
        delete next[pet.id];
        return next;
      });
    }, 3200);
  };

  const activeOwned = ownedPets.filter((op) => op.level > 0);

  if (activeOwned.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {activeOwned.map((owned) => {
        const def = pets.find((p) => p.id === owned.id);
        if (!def) return null;

        const config = PET_SETTINGS[def.id] || {
          baseBottom: 15,
          baseLeft: 50,
          roamX: 40,
          jumpHeight: 20,
        };

        const currentBubble = bubbles[def.id];

        return (
          <div
            key={def.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              bottom: `${config.baseBottom}%`,
              left: `${config.baseLeft}%`,
            }}
            onClick={(e) => handlePetInteraction(def, owned, e)}
          >
            {/* Thought/Speech Bubble */}
            <AnimatePresence>
              {currentBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-2xl bg-white/95 text-stone-800 text-xs font-bold shadow-xl border border-amber-200 whitespace-nowrap z-20 flex items-center gap-1.5"
                >
                  <span>{currentBubble.text}</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-amber-200" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Living, breathing & roaming pet */}
            <motion.div
              animate={{
                x: [-config.roamX, config.roamX, -config.roamX * 0.5, 0],
                y: [0, -config.jumpHeight, 0, -config.jumpHeight * 0.6, 0],
                rotate: [0, 4, -4, 0],
                scaleX: [1, 1.05, 0.95, 1],
              }}
              transition={{
                duration: 6 + (def.species === 'bunny' ? 2 : 4),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="relative group flex flex-col items-center"
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-4 bg-emerald-950/30 rounded-full blur-sm" />

              {/* Render Cute Animated Vector Pet */}
              <div className="relative">
                {renderPetVector(def.species, owned.happiness)}

                {/* Level / Status badge on hover */}
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-sm">
                  ур.{owned.level}
                </div>
              </div>

              {/* Name hint under pet */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-900/60 backdrop-blur-xs text-white text-[10px] font-bold opacity-75 group-hover:opacity-100 transition-opacity">
                {def.name}
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* Floating Pet Hearts / Feed effects */}
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0.6, x: h.x, y: h.y }}
            animate={{ opacity: 0, scale: 1.3, y: h.y - 70 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed pointer-events-none z-40 text-pink-600 font-black text-sm drop-shadow-md flex items-center gap-1"
          >
            {h.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Procedural vector illustration for each pet species
function renderPetVector(species: string, happiness: number) {
  if (species === 'bunny') {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-md">
        {/* Long Bunny Ears */}
        <motion.path
          animate={{ rotate: [0, 6, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          d="M 22,25 C 16,5 24,0 27,12 C 28,18 26,22 25,25 Z"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <path d="M 23,22 C 20,9 24,6 26,14 Z" fill="#f472b6" opacity="0.6" />

        <motion.path
          animate={{ rotate: [0, -6, 4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          d="M 36,25 C 42,5 34,0 31,12 C 30,18 32,22 33,25 Z"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <path d="M 35,22 C 38,9 34,6 32,14 Z" fill="#f472b6" opacity="0.6" />

        {/* Fluffy Body */}
        <ellipse cx="30" cy="42" rx="16" ry="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="30" cy="28" r="13" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Rosy Cheeks */}
        <circle cx="21" cy="31" r="3" fill="#fb7185" opacity="0.6" />
        <circle cx="39" cy="31" r="3" fill="#fb7185" opacity="0.6" />
        {/* Eyes */}
        <circle cx="24" cy="27" r="2" fill="#1e293b" />
        <circle cx="36" cy="27" r="2" fill="#1e293b" />
        {/* Nose & Smile */}
        <polygon points="28,31 32,31 30,33" fill="#f472b6" />
        {/* Fluffy tail */}
        <circle cx="14" cy="42" r="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    );
  }

  if (species === 'chick') {
    return (
      <svg width="50" height="50" viewBox="0 0 50 50" className="drop-shadow-md">
        {/* Tiny Feathers on head */}
        <path d="M 24,14 Q 25,6 28,11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Body */}
        <ellipse cx="25" cy="32" rx="14" ry="13" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="25" cy="20" r="11" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
        {/* Tiny Wing */}
        <motion.path
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          d="M 16,28 C 10,28 14,36 20,34 Z"
          fill="#fde047"
        />
        {/* Eyes */}
        <circle cx="21" cy="18" r="1.8" fill="#1e293b" />
        <circle cx="29" cy="18" r="1.8" fill="#1e293b" />
        {/* Orange Beak */}
        <polygon points="22,22 28,22 25,26" fill="#f97316" />
        {/* Tiny feet */}
        <line x1="20" y1="44" x2="20" y2="48" stroke="#f97316" strokeWidth="2" />
        <line x1="28" y1="44" x2="28" y2="48" stroke="#f97316" strokeWidth="2" />
      </svg>
    );
  }

  if (species === 'dog') {
    return (
      <svg width="65" height="65" viewBox="0 0 65 65" className="drop-shadow-md">
        {/* Flapping floppy ears */}
        <motion.ellipse
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          cx="17"
          cy="26"
          rx="5"
          ry="12"
          fill="#b45309"
        />
        <motion.ellipse
          animate={{ rotate: [10, -10, 10] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          cx="47"
          cy="26"
          rx="5"
          ry="12"
          fill="#b45309"
        />
        {/* Body */}
        <ellipse cx="32" cy="46" rx="16" ry="14" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="32" cy="28" r="15" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        {/* Eye patch */}
        <circle cx="25" cy="25" r="5" fill="#d97706" opacity="0.4" />
        {/* Eyes */}
        <circle cx="26" cy="25" r="2.2" fill="#1e293b" />
        <circle cx="38" cy="25" r="2.2" fill="#1e293b" />
        {/* Snout */}
        <ellipse cx="32" cy="33" rx="7" ry="5" fill="#fef3c7" />
        <ellipse cx="32" cy="31" rx="3.5" ry="2.5" fill="#1e293b" />
        {/* Tongue sticking out happily */}
        <motion.path
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          d="M 30,35 Q 32,41 34,35 Z"
          fill="#ef4444"
        />
        {/* Red Bandana */}
        <polygon points="22,39 42,39 32,47" fill="#dc2626" />
        {/* Wagging tail */}
        <motion.line
          animate={{ rotate: [-20, 20, -20] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          x1="18"
          y1="46"
          x2="8"
          y2="38"
          stroke="#b45309"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (species === 'cat') {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-md">
        {/* Pointy Ears */}
        <polygon points="18,22 23,10 28,20" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
        <polygon points="20,20 23,13 26,19" fill="#fda4af" />
        <polygon points="32,20 37,10 42,22" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
        <polygon points="34,19 37,13 40,20" fill="#fda4af" />
        {/* Body */}
        <ellipse cx="30" cy="42" rx="15" ry="13" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="30" cy="26" r="13" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" />
        {/* Cheerful cat closed eyes or open */}
        <path d="M 23,24 Q 26,21 28,24" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 32,24 Q 34,21 37,24" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Pink nose */}
        <polygon points="29,27 31,27 30,29" fill="#f43f5e" />
        {/* Whiskers */}
        <line x1="16" y1="28" x2="24" y2="28" stroke="#78350f" strokeWidth="1" />
        <line x1="16" y1="31" x2="24" y2="30" stroke="#78350f" strokeWidth="1" />
        <line x1="36" y1="28" x2="44" y2="28" stroke="#78350f" strokeWidth="1" />
        <line x1="36" y1="30" x2="44" y2="31" stroke="#78350f" strokeWidth="1" />
        {/* Swishing tail */}
        <motion.path
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          d="M 43,45 Q 52,38 50,30"
          stroke="#ea580c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  // Piglet
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-md">
      {/* Floppy pig ears */}
      <ellipse cx="18" cy="20" rx="4" ry="7" fill="#f43f5e" />
      <ellipse cx="42" cy="20" rx="4" ry="7" fill="#f43f5e" />
      {/* Round pink body */}
      <ellipse cx="30" cy="40" rx="16" ry="14" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="30" cy="26" r="14" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
      {/* Cute Pig Snout */}
      <ellipse cx="30" cy="30" rx="7" ry="5" fill="#f472b6" />
      <circle cx="28" cy="30" r="1.5" fill="#831843" />
      <circle cx="32" cy="30" r="1.5" fill="#831843" />
      {/* Sparkling eyes */}
      <circle cx="23" cy="23" r="2" fill="#1e293b" />
      <circle cx="37" cy="23" r="2" fill="#1e293b" />
      {/* Curly tail */}
      <path d="M 15,44 Q 10,40 12,36 Q 14,32 10,34" stroke="#f472b6" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FarmPenBackground } from './components/FarmPenBackground';
import { AnimatedSheep } from './components/AnimatedSheep';
import { WoolCounter } from './components/WoolCounter';
import { UpgradesPanel } from './components/UpgradesPanel';
import { FloatingWoolParticles } from './components/FloatingWoolParticles';
import { GoldenCloverEvent } from './components/GoldenCloverEvent';
import { AnimatedPetsLayer } from './components/AnimatedPetsLayer';
import { INITIAL_UPGRADES, ACCESSORIES, ACHIEVEMENTS, PET_DEFINITIONS } from './data/gameData';
import { Upgrade, FloatingParticle, Achievement, OwnedPet } from './types';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'sheep_clicker_save_v2';

export default function App() {
  // --- Game State ---
  const [wool, setWool] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.wool === 'number' ? parsed.wool : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [totalWoolGathered, setTotalWoolGathered] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.totalWoolGathered === 'number' ? parsed.totalWoolGathered : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [clicks, setClicks] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.clicks === 'number' ? parsed.clicks : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true;
      } catch {
        return true;
      }
    }
    return true;
  });

  const [activeAccessory, setActiveAccessory] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.activeAccessory || 'none';
      } catch {
        return 'none';
      }
    }
    return 'none';
  });

  // Upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.upgrades)) {
          return INITIAL_UPGRADES.map((def) => {
            const match = parsed.upgrades.find((u: Upgrade) => u.id === def.id);
            if (match) {
              return {
                ...def,
                owned: match.owned || 0,
                cost: match.cost || def.cost,
              };
            }
            return def;
          });
        }
      } catch {
        return INITIAL_UPGRADES;
      }
    }
    return INITIAL_UPGRADES;
  });

  // Owned Pets state
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.ownedPets)) {
          return parsed.ownedPets;
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.achievements)) {
          return ACHIEVEMENTS.map((a) => {
            const match = parsed.achievements.find((m: Achievement) => m.id === a.id);
            return match ? { ...a, unlocked: !!match.unlocked } : a;
          });
        }
      } catch {
        return ACHIEVEMENTS;
      }
    }
    return ACHIEVEMENTS;
  });

  // Golden clover frenzy multiplier
  const [isGoldenMode, setIsGoldenMode] = useState(false);
  const goldenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Click Combo Frenzy mechanic
  const [combo, setCombo] = useState(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // High Refresh Rate (90Hz / 120Hz+) Display Gauge
  const [fps, setFps] = useState(60);
  const fpsFrameCount = useRef(0);
  const fpsLastTime = useRef(performance.now());

  // Floating particles
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const particleIdCounter = useRef(0);

  // Mutable refs for requestAnimationFrame game loop (prevents stale closures & memory thrashing)
  const woolRef = useRef(wool);
  woolRef.current = wool;
  const totalWoolRef = useRef(totalWoolGathered);
  totalWoolRef.current = totalWoolGathered;

  // Calculate Wool Per Click (Upgrades + Pet bonuses + Combo)
  const comboMultiplier = 1 + combo * 0.05; // Each combo point gives +5% click power
  const woolPerClick = React.useMemo(() => {
    let base = 1;
    for (const u of upgrades) {
      if (u.type === 'click') {
        base += u.owned * u.power;
      }
    }

    // Pet click bonuses
    let petMultiplier = 1;
    for (const op of ownedPets) {
      if (op.level > 0) {
        const def = PET_DEFINITIONS.find((p) => p.id === op.id);
        if (def) {
          petMultiplier += def.clickBonusMultiplier * op.level;
        }
      }
    }

    const calculated = Math.round(base * petMultiplier * comboMultiplier);
    return isGoldenMode ? calculated * 3 : calculated;
  }, [upgrades, ownedPets, comboMultiplier, isGoldenMode]);

  // Calculate Wool Per Second (Paddock buildings + Active pets)
  const woolPerSecond = React.useMemo(() => {
    let base = 0;
    for (const u of upgrades) {
      if (u.type === 'passive') {
        base += u.owned * u.power;
      }
    }

    // Active pets passive contribution
    for (const op of ownedPets) {
      if (op.level > 0) {
        const def = PET_DEFINITIONS.find((p) => p.id === op.id);
        if (def) {
          base += def.woolPerSecondBonus * op.level;
        }
      }
    }

    return isGoldenMode ? base * 3 : base;
  }, [upgrades, ownedPets, isGoldenMode]);

  const woolPerSecondRef = useRef(woolPerSecond);
  woolPerSecondRef.current = woolPerSecond;

  // 1. HIGH REFRESH RATE (90Hz, 120Hz, 144Hz+) REQUEST ANIMATION FRAME LOOP
  // Uses delta-time (dt) for butter-smooth ticks regardless of monitor refresh rate
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let accumulatedAccum = 0;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1); // Clamp dt to prevent tab-switching jumps
      lastTimestamp = now;

      // Real-time FPS / Refresh Rate measurement
      fpsFrameCount.current += 1;
      if (now - fpsLastTime.current >= 600) {
        const calculatedFps = Math.round(
          (fpsFrameCount.current * 1000) / (now - fpsLastTime.current)
        );
        setFps(calculatedFps);
        fpsFrameCount.current = 0;
        fpsLastTime.current = now;
      }

      // Passive wool accumulation with delta time (dt)
      const currentWps = woolPerSecondRef.current;
      if (currentWps > 0) {
        const generated = currentWps * dt;
        accumulatedAccum += generated;

        // Commit integer chunks or smooth fractions to avoid excessive re-render churn
        if (accumulatedAccum >= 0.1 || accumulatedAccum >= 1) {
          const toAdd = accumulatedAccum;
          accumulatedAccum = 0;
          setWool((prev) => prev + toAdd);
          setTotalWoolGathered((prev) => prev + toAdd);
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Debounced auto-save to localStorage (every 2 seconds or on major state change)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const dataToSave = {
        wool,
        totalWoolGathered,
        clicks,
        soundEnabled,
        activeAccessory,
        upgrades: upgrades.map((u) => ({ id: u.id, owned: u.owned, cost: u.cost })),
        ownedPets,
        achievements: achievements.map((a) => ({ id: a.id, unlocked: a.unlocked })),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch {
        // ignore storage quota errors
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [wool, totalWoolGathered, clicks, soundEnabled, activeAccessory, upgrades, ownedPets, achievements]);

  // Achievement checker
  useEffect(() => {
    const activePetsCount = ownedPets.filter((p) => p.level > 0).length;

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.unlocked) return ach;
        let unlocked = false;
        if (ach.type === 'totalWool' && totalWoolGathered >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'clicks' && clicks >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'pets' && activePetsCount >= ach.target) {
          unlocked = true;
        }
        if (unlocked) {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { x: 0.5, y: 0.7 },
          });
        }
        return unlocked ? { ...ach, unlocked: true } : ach;
      })
    );
  }, [totalWoolGathered, clicks, ownedPets]);

  // Click on sheep handler with Combo Frenzy
  const handleShear = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const clickVal = woolPerClick;

      setWool((prev) => prev + clickVal);
      setTotalWoolGathered((prev) => prev + clickVal);
      setClicks((prev) => prev + 1);

      // Increase combo streak (up to x20)
      setCombo((prev) => Math.min(prev + 1, 20));
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setCombo(0);
      }, 1600);

      // Spawn floating numbers at cursor or centered
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      const isCritHit = isGoldenMode || combo >= 5 || Math.random() < 0.12;
      const newParticle: FloatingParticle = {
        id: ++particleIdCounter.current,
        x: clickX,
        y: clickY,
        text: `+${clickVal}`,
        isCrit: isCritHit,
      };

      setParticles((prev) => [...prev.slice(-12), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 850);
    },
    [woolPerClick, isGoldenMode, combo]
  );

  // Buy upgrade handler
  const handleBuyUpgrade = (upgradeId: string) => {
    setUpgrades((prev) =>
      prev.map((item) => {
        if (item.id === upgradeId && wool >= item.cost) {
          setWool((w) => w - item.cost);
          const nextCost = Math.round(item.cost * item.costMultiplier);
          return {
            ...item,
            owned: item.owned + 1,
            cost: nextCost,
          };
        }
        return item;
      })
    );
  };

  // Buy Pet handler
  const handleBuyPet = (petId: string) => {
    const petDef = PET_DEFINITIONS.find((p) => p.id === petId);
    if (!petDef || wool < petDef.cost) return;

    setWool((w) => w - petDef.cost);
    setOwnedPets((prev) => {
      const existing = prev.find((p) => p.id === petId);
      if (existing) {
        return prev.map((p) => (p.id === petId ? { ...p, level: p.level + 1 } : p));
      }
      return [
        ...prev,
        {
          id: petId,
          level: 1,
          happiness: 100,
          lastFed: Date.now(),
        },
      ];
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.5, y: 0.8 },
    });
  };

  // Pet Feeding / Petting Interaction (brings instant bonus wool & happiness)
  const handleFeedPet = (petId: string) => {
    const petDef = PET_DEFINITIONS.find((p) => p.id === petId);
    if (!petDef) return { success: false, woolBonus: 0 };

    const bonus = Math.max(10, Math.round(petDef.woolPerSecondBonus * 4) + woolPerClick);
    setWool((w) => w + bonus);
    setTotalWoolGathered((w) => w + bonus);

    setOwnedPets((prev) =>
      prev.map((p) =>
        p.id === petId
          ? { ...p, happiness: Math.min(100, p.happiness + 20), lastFed: Date.now() }
          : p
      )
    );

    return { success: true, woolBonus: bonus };
  };

  // Golden clover collect bonus
  const handleGoldenCloverCollect = () => {
    const bonus = Math.max(60, Math.round(woolPerSecond * 25) + woolPerClick * 20);
    setWool((w) => w + bonus);
    setTotalWoolGathered((w) => w + bonus);

    // 15-second frenzy
    setIsGoldenMode(true);
    if (goldenTimerRef.current) clearTimeout(goldenTimerRef.current);
    goldenTimerRef.current = setTimeout(() => {
      setIsGoldenMode(false);
    }, 15000);
  };

  // Spacebar key to click sheep
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        const centerEl = document.getElementById('main-sheep-character');
        if (centerEl) {
          centerEl.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-['Nunito',sans-serif]">
      {/* 1. SCENIC CORRAL / PADDOCK BACKGROUND */}
      <FarmPenBackground />

      {/* 2. ANIMATED LIVING PETS ON PASTURE BACKGROUND */}
      <AnimatedPetsLayer
        pets={PET_DEFINITIONS}
        ownedPets={ownedPets}
        soundEnabled={soundEnabled}
        onFeedPet={handleFeedPet}
      />

      {/* 3. WOOL COUNTER, COMBO FRENZY & HIGH REFRESH RATE GAUGE */}
      <WoolCounter
        wool={wool}
        woolPerSecond={woolPerSecond}
        woolPerClick={woolPerClick}
        combo={combo}
        fps={fps}
        isGoldenMode={isGoldenMode}
      />

      {/* 4. CENTER PADDOCK: ANIMATED JUMPING SHEEP CHARACTER */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-20 md:pb-28 pointer-events-none">
        <div id="main-sheep-character" className="relative flex flex-col items-center pointer-events-auto">
          <AnimatedSheep
            onShear={handleShear}
            soundEnabled={soundEnabled}
            activeAccessory={activeAccessory}
            isGoldenMode={isGoldenMode}
          />

          {/* Cheerful pasture instruction pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-950/35 backdrop-blur-sm text-white/95 text-xs md:text-sm font-semibold tracking-wide border border-white/20 shadow-sm flex items-center gap-2">
            <span>Нажимай на овечку, чтобы собрать шерсть!</span>
            <span className="hidden sm:inline opacity-75 font-normal">
              (или клавиша Пробел)
            </span>
          </div>
        </div>
      </div>

      {/* 5. FLOATING PARTICLES ON CLICK */}
      <FloatingWoolParticles particles={particles} />

      {/* 6. LUCKY GOLDEN CLOVER RANDOM EVENT */}
      <GoldenCloverEvent
        onCollect={handleGoldenCloverCollect}
        soundEnabled={soundEnabled}
      />

      {/* 7. CORRAL SHOP & UPGRADES DRAWER (Стрижка, Загон, Питомцы, Гардероб, Награды) */}
      <UpgradesPanel
        wool={wool}
        upgrades={upgrades}
        accessories={ACCESSORIES}
        achievements={achievements}
        pets={PET_DEFINITIONS}
        ownedPets={ownedPets}
        activeAccessory={activeAccessory}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onBuyUpgrade={handleBuyUpgrade}
        onSelectAccessory={(accId) => setActiveAccessory(accId)}
        onBuyPet={handleBuyPet}
        onFeedPet={handleFeedPet}
      />
    </div>
  );
}

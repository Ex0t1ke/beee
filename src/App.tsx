import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FarmPenBackground } from './components/FarmPenBackground';
import { AnimatedSheep } from './components/AnimatedSheep';
import { WoolCounter } from './components/WoolCounter';
import { UpgradesPanel } from './components/UpgradesPanel';
import { FloatingWoolParticles } from './components/FloatingWoolParticles';
import { GoldenCloverEvent } from './components/GoldenCloverEvent';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { INITIAL_UPGRADES, ACCESSORIES, ACHIEVEMENTS } from './data/gameData';
import { Upgrade, FloatingParticle, Achievement } from './types';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'sheep_clicker_save_v1';

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

  // Floating particles
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const particleIdCounter = useRef(0);

  // Calculate Wool Per Click
  const woolPerClick = React.useMemo(() => {
    let base = 1;
    for (const u of upgrades) {
      if (u.type === 'click') {
        base += u.owned * u.power;
      }
    }
    return isGoldenMode ? base * 3 : base;
  }, [upgrades, isGoldenMode]);

  // Calculate Wool Per Second
  const woolPerSecond = React.useMemo(() => {
    let base = 0;
    for (const u of upgrades) {
      if (u.type === 'passive') {
        base += u.owned * u.power;
      }
    }
    return isGoldenMode ? base * 3 : base;
  }, [upgrades, isGoldenMode]);

  // Save to localStorage
  useEffect(() => {
    const dataToSave = {
      wool,
      totalWoolGathered,
      clicks,
      soundEnabled,
      activeAccessory,
      upgrades: upgrades.map((u) => ({ id: u.id, owned: u.owned, cost: u.cost })),
      achievements: achievements.map((a) => ({ id: a.id, unlocked: a.unlocked })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // ignore
    }
  }, [wool, totalWoolGathered, clicks, soundEnabled, activeAccessory, upgrades, achievements]);

  // Passive generation loop (10 times per second for smooth ticker)
  useEffect(() => {
    if (woolPerSecond <= 0) return;

    const interval = setInterval(() => {
      const inc = woolPerSecond / 10;
      setWool((prev) => prev + inc);
      setTotalWoolGathered((prev) => prev + inc);
    }, 100);

    return () => clearInterval(interval);
  }, [woolPerSecond]);

  // Achievement checker
  useEffect(() => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.unlocked) return ach;
        let unlocked = false;
        if (ach.type === 'totalWool' && totalWoolGathered >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'clicks' && clicks >= ach.target) {
          unlocked = true;
        }
        if (unlocked) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { x: 0.5, y: 0.7 },
          });
        }
        return unlocked ? { ...ach, unlocked: true } : ach;
      })
    );
  }, [totalWoolGathered, clicks]);

  // Click on sheep handler
  const handleShear = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const clickVal = woolPerClick;

      setWool((prev) => prev + clickVal);
      setTotalWoolGathered((prev) => prev + clickVal);
      setClicks((prev) => prev + 1);

      // Spawn floating numbers at cursor or centered
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      const newParticle: FloatingParticle = {
        id: ++particleIdCounter.current,
        x: clickX,
        y: clickY,
        text: `+${clickVal}`,
        isCrit: isGoldenMode || Math.random() < 0.1,
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]);

      // Remove after animation completes
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 900);
    },
    [woolPerClick, isGoldenMode]
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

  // Golden clover collect bonus
  const handleGoldenCloverCollect = () => {
    // Instant bonus wool (at least 50 or 20 seconds of passive production)
    const bonus = Math.max(50, Math.round(woolPerSecond * 25) + woolPerClick * 20);
    setWool((w) => w + bonus);
    setTotalWoolGathered((w) => w + bonus);

    // Trigger 15-second 3x frenzy
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
      {/* 1. SCENIC CORRAL / PADDOCK BACKGROUND (НА ФОНЕ ЗАГОН) */}
      <FarmPenBackground />

      {/* 2. WOOL COUNTER IN THE CORNER (СЧЕТЧИК ШЕРСТИ В УГЛУ) */}
      <WoolCounter
        wool={wool}
        woolPerSecond={woolPerSecond}
        woolPerClick={woolPerClick}
        isGoldenMode={isGoldenMode}
      />

      {/* PWA / INSTALL AS APP BANNER & BUTTON */}
      <PWAInstallBanner />

      {/* 3. CENTER PADDOCK: ANIMATED JUMPING SHEEP CHARACTER (ОВЕЧКА С АНИМИРОВАННЫМИ ПРЫЖКАМИ) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-20 md:pb-28">
        <div id="main-sheep-character" className="relative flex flex-col items-center">
          <AnimatedSheep
            onShear={handleShear}
            soundEnabled={soundEnabled}
            activeAccessory={activeAccessory}
            isGoldenMode={isGoldenMode}
          />

          {/* Cheerful pasture instruction pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-950/30 backdrop-blur-sm text-white/95 text-xs md:text-sm font-semibold tracking-wide border border-white/20 shadow-sm flex items-center gap-2">
            <span>Нажимай на овечку, чтобы собрать шерсть!</span>
            <span className="hidden sm:inline opacity-75 font-normal">
              (или клавиша Пробел)
            </span>
          </div>
        </div>
      </div>

      {/* 4. FLOATING PARTICLES ON CLICK */}
      <FloatingWoolParticles particles={particles} />

      {/* 5. LUCKY GOLDEN CLOVER RANDOM EVENT */}
      <GoldenCloverEvent
        onCollect={handleGoldenCloverCollect}
        soundEnabled={soundEnabled}
      />

      {/* 6. CORRAL SHOP & UPGRADES DRAWER */}
      <UpgradesPanel
        wool={wool}
        upgrades={upgrades}
        accessories={ACCESSORIES}
        achievements={achievements}
        activeAccessory={activeAccessory}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onBuyUpgrade={handleBuyUpgrade}
        onSelectAccessory={(accId) => setActiveAccessory(accId)}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FarmPenBackground } from './components/FarmPenBackground';
import { AnimatedSheep } from './components/AnimatedSheep';
import { WoolCounter } from './components/WoolCounter';
import { UpgradesPanel } from './components/UpgradesPanel';
import { FloatingWoolParticles } from './components/FloatingWoolParticles';
import { GoldenCloverEvent } from './components/GoldenCloverEvent';
import { AnimatedPetsLayer } from './components/AnimatedPetsLayer';
import { WolfDefenseLayer } from './components/WolfDefenseLayer';
import { WeatherIndicator } from './components/WeatherIndicator';
import {
  INITIAL_UPGRADES,
  ACCESSORIES,
  ACHIEVEMENTS,
  PET_DEFINITIONS,
  INITIAL_PRESTIGE_UPGRADES,
  WEATHER_PRESETS,
  INITIAL_DAILY_QUESTS,
} from './data/gameData';
import {
  Upgrade,
  FloatingParticle,
  Achievement,
  OwnedPet,
  PrestigeUpgrade,
  WeatherState,
  WolfEncounter,
  DailyQuest,
} from './types';
import confetti from 'canvas-confetti';
import { playChimeSuccess, playWoolPop, playSheepBaa } from './utils/sound';

const STORAGE_KEY = 'sheep_clicker_save_v2';

/**
 * Robust initial state loader & offline progress calculator
 */
function getInitialGameState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  let parsed: any = null;
  if (saved) {
    try {
      parsed = JSON.parse(saved);
    } catch {
      parsed = null;
    }
  }

  // Upgrades
  const upgrades: Upgrade[] = INITIAL_UPGRADES.map((def) => {
    if (parsed && Array.isArray(parsed.upgrades)) {
      const match = parsed.upgrades.find((u: Upgrade) => u.id === def.id);
      if (match) {
        return {
          ...def,
          owned: match.owned || 0,
          cost: match.cost || def.cost,
        };
      }
    }
    return def;
  });

  // Owned pets
  const ownedPets: OwnedPet[] =
    parsed && Array.isArray(parsed.ownedPets) ? parsed.ownedPets : [];

  // Prestige Upgrades
  const prestigeUpgrades: PrestigeUpgrade[] = INITIAL_PRESTIGE_UPGRADES.map((pu) => {
    if (parsed && Array.isArray(parsed.prestigeUpgrades)) {
      const match = parsed.prestigeUpgrades.find((m: PrestigeUpgrade) => m.id === pu.id);
      if (match) {
        return { ...pu, level: match.level || 0 };
      }
    }
    return pu;
  });

  // Daily quests
  const dailyQuests: DailyQuest[] = INITIAL_DAILY_QUESTS.map((q) => {
    if (parsed && Array.isArray(parsed.dailyQuests)) {
      const match = parsed.dailyQuests.find((m: DailyQuest) => m.id === q.id);
      if (match) {
        return {
          ...q,
          current: match.current || 0,
          completed: !!match.completed,
          claimed: !!match.claimed,
        };
      }
    }
    return q;
  });

  // Prestige currency
  const goldenHorns = parsed && typeof parsed.goldenHorns === 'number' ? parsed.goldenHorns : 0;
  const prestigeCount = parsed && typeof parsed.prestigeCount === 'number' ? parsed.prestigeCount : 0;

  // Initial passive income calculation
  let initialWps = 0;
  for (const u of upgrades) {
    if (u.type === 'passive') {
      initialWps += u.owned * u.power;
    }
  }
  for (const op of ownedPets) {
    if (op.level > 0) {
      const def = PET_DEFINITIONS.find((p) => p.id === op.id);
      if (def) {
        initialWps += def.woolPerSecondBonus * op.level;
      }
    }
  }

  // Prestige horn bonus (+25% per level)
  const hornMultiplierUpgrade = prestigeUpgrades.find((p) => p.id === 'prestige_horn_multiplier');
  const hornMult = 1 + (hornMultiplierUpgrade ? hornMultiplierUpgrade.level * 0.25 : 0);

  // Prestige offline efficiency boost
  const offlineUpgrade = prestigeUpgrades.find((p) => p.id === 'prestige_offline_boost');
  const offlineMult = 1 + (offlineUpgrade ? offlineUpgrade.level * 0.3 : 0);

  // Offline Progress Calculation
  let offlineWoolGathered = 0;
  let offlineSecondsElapsed = 0;
  let baseWool = parsed && typeof parsed.wool === 'number' ? parsed.wool : 0;
  let baseTotal =
    parsed && typeof parsed.totalWoolGathered === 'number'
      ? parsed.totalWoolGathered
      : 0;

  if (parsed && typeof parsed.lastSaveTime === 'number' && initialWps > 0) {
    const elapsedMs = Date.now() - parsed.lastSaveTime;
    const elapsedSeconds = Math.max(0, Math.min(Math.floor(elapsedMs / 1000), 604800));
    if (elapsedSeconds >= 3) {
      offlineSecondsElapsed = elapsedSeconds;
      offlineWoolGathered = Math.floor(elapsedSeconds * initialWps * hornMult * offlineMult);
      baseWool += offlineWoolGathered;
      baseTotal += offlineWoolGathered;
    }
  }

  return {
    wool: baseWool,
    totalWoolGathered: baseTotal,
    clicks: parsed && typeof parsed.clicks === 'number' ? parsed.clicks : 0,
    goldenHorns,
    prestigeCount,
    soundEnabled:
      parsed && typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    activeAccessory: parsed && parsed.activeAccessory ? parsed.activeAccessory : 'none',
    upgrades,
    ownedPets,
    prestigeUpgrades,
    dailyQuests,
    achievements: ACHIEVEMENTS.map((a) => {
      if (parsed && Array.isArray(parsed.achievements)) {
        const match = parsed.achievements.find((m: Achievement) => m.id === a.id);
        return match ? { ...a, unlocked: !!match.unlocked } : a;
      }
      return a;
    }),
    offlineWoolGathered,
    offlineSecondsElapsed,
  };
}

export default function App() {
  const initial = useRef(getInitialGameState()).current;

  // --- Core Game State ---
  const [wool, setWool] = useState<number>(initial.wool);
  const [totalWoolGathered, setTotalWoolGathered] = useState<number>(initial.totalWoolGathered);
  const [clicks, setClicks] = useState<number>(initial.clicks);
  const [goldenHorns, setGoldenHorns] = useState<number>(initial.goldenHorns);
  const [prestigeCount, setPrestigeCount] = useState<number>(initial.prestigeCount);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initial.soundEnabled);
  const [activeAccessory, setActiveAccessory] = useState<string>(initial.activeAccessory);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initial.upgrades);
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>(initial.ownedPets);
  const [prestigeUpgrades, setPrestigeUpgrades] = useState<PrestigeUpgrade[]>(initial.prestigeUpgrades);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(initial.dailyQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initial.achievements);

  // Weather state (dynamic climate cycle)
  const [weather, setWeather] = useState<WeatherState>({
    ...WEATHER_PRESETS[0],
    duration: 45,
  });

  // Wolf defense encounter state
  const [wolf, setWolf] = useState<WolfEncounter | null>(null);

  // Offline report modal banner state
  const [offlineReport, setOfflineReport] = useState<{
    wool: number;
    seconds: number;
  } | null>(() => {
    if (initial.offlineWoolGathered > 0) {
      return {
        wool: initial.offlineWoolGathered,
        seconds: initial.offlineSecondsElapsed,
      };
    }
    return null;
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

  // Floating particles (Optimized: pure DOM + CSS float-up animation)
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const particleIdCounter = useRef(0);

  // State ref for synchronous autosave
  const stateRef = useRef({
    wool,
    totalWoolGathered,
    clicks,
    goldenHorns,
    prestigeCount,
    soundEnabled,
    activeAccessory,
    upgrades,
    ownedPets,
    prestigeUpgrades,
    dailyQuests,
    achievements,
  });

  useEffect(() => {
    stateRef.current = {
      wool,
      totalWoolGathered,
      clicks,
      goldenHorns,
      prestigeCount,
      soundEnabled,
      activeAccessory,
      upgrades,
      ownedPets,
      prestigeUpgrades,
      dailyQuests,
      achievements,
    };
  }, [
    wool,
    totalWoolGathered,
    clicks,
    goldenHorns,
    prestigeCount,
    soundEnabled,
    activeAccessory,
    upgrades,
    ownedPets,
    prestigeUpgrades,
    dailyQuests,
    achievements,
  ]);

  // -------------------------------------------------------------
  // MULTIPLIER & POWER CALCULATIONS
  // -------------------------------------------------------------

  // Prestige Horn Multiplier
  const hornMultiplierUpgrade = prestigeUpgrades.find((p) => p.id === 'prestige_horn_multiplier');
  const hornGlobalMultiplier = 1 + (hornMultiplierUpgrade ? hornMultiplierUpgrade.level * 0.25 : 0);

  // Prestige Crit Chance
  const prestigeCritUpgrade = prestigeUpgrades.find((p) => p.id === 'prestige_crit_chance');
  const prestigeCritChance = prestigeCritUpgrade ? prestigeCritUpgrade.level * 0.05 : 0;

  // Active accessory bonus
  const equippedAccessory = ACCESSORIES.find((a) => a.id === activeAccessory);
  const accessoryClickBonus =
    equippedAccessory && equippedAccessory.bonusType === 'clickBonus'
      ? equippedAccessory.bonusValue || 0
      : 0;
  const accessoryPassiveBonus =
    equippedAccessory && equippedAccessory.bonusType === 'passiveBonus'
      ? equippedAccessory.bonusValue || 0
      : 0;

  // Combo multiplier
  const comboMultiplier = 1 + combo * 0.05;

  // Calculate Wool Per Click
  const woolPerClick = React.useMemo(() => {
    let base = 1;
    for (const u of upgrades) {
      if (u.type === 'click') {
        base += u.owned * u.power;
      }
    }

    let petMultiplier = 1;
    for (const op of ownedPets) {
      if (op.level > 0) {
        const def = PET_DEFINITIONS.find((p) => p.id === op.id);
        if (def) {
          petMultiplier += def.clickBonusMultiplier * op.level;
        }
      }
    }

    const calculated = Math.round(
      base *
        petMultiplier *
        comboMultiplier *
        hornGlobalMultiplier *
        (1 + accessoryClickBonus) *
        weather.clickMultiplier
    );

    return isGoldenMode ? calculated * 3 : calculated;
  }, [
    upgrades,
    ownedPets,
    comboMultiplier,
    hornGlobalMultiplier,
    accessoryClickBonus,
    weather.clickMultiplier,
    isGoldenMode,
  ]);

  // Calculate Wool Per Second
  const woolPerSecond = React.useMemo(() => {
    let base = 0;
    for (const u of upgrades) {
      if (u.type === 'passive') {
        base += u.owned * u.power;
      }
    }

    for (const op of ownedPets) {
      if (op.level > 0) {
        const def = PET_DEFINITIONS.find((p) => p.id === op.id);
        if (def) {
          base += def.woolPerSecondBonus * op.level;
        }
      }
    }

    const calculated = Math.round(
      base * hornGlobalMultiplier * (1 + accessoryPassiveBonus) * weather.woolMultiplier
    );
    return isGoldenMode ? calculated * 3 : calculated;
  }, [
    upgrades,
    ownedPets,
    hornGlobalMultiplier,
    accessoryPassiveBonus,
    weather.woolMultiplier,
    isGoldenMode,
  ]);

  const woolPerSecondRef = useRef(woolPerSecond);
  woolPerSecondRef.current = woolPerSecond;

  // -------------------------------------------------------------
  // DYNAMIC WEATHER ENGINE
  // Changes every 45-60 seconds with distinct bonuses & mood
  // -------------------------------------------------------------
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setWeather((prev) => {
        if (prev.duration > 1) {
          return { ...prev, duration: prev.duration - 1 };
        }
        // Pick new random weather different from current
        const otherWeathers = WEATHER_PRESETS.filter((w) => w.type !== prev.type);
        const randomPreset = otherWeathers[Math.floor(Math.random() * otherWeathers.length)];
        return {
          ...randomPreset,
          duration: Math.floor(40 + Math.random() * 25),
        };
      });
    }, 1000);

    return () => clearInterval(weatherTimer);
  }, []);

  // -------------------------------------------------------------
  // INTERACTIVE MINI-GAME: WOLF ENCOUNTER (Defend the flock!)
  // Spawns every 80-140 seconds
  // -------------------------------------------------------------
  useEffect(() => {
    const spawnWolf = () => {
      // Pick random position in pasture safe area
      const randomX = 25 + Math.random() * 50;
      const randomY = 40 + Math.random() * 25;
      const clicksNeeded = 5 + Math.floor(Math.random() * 4);
      const bountyValue = Math.max(100, Math.floor(woolPerClick * 25 + woolPerSecond * 10));

      setWolf({
        id: Date.now(),
        x: randomX,
        y: randomY,
        clicksRequired: clicksNeeded,
        clicksRemaining: clicksNeeded,
        timeLeft: 14,
        bounty: bountyValue,
      });
    };

    const wolfInterval = setInterval(() => {
      if (!wolf && Math.random() < 0.6) {
        spawnWolf();
      }
    }, 45000);

    return () => clearInterval(wolfInterval);
  }, [wolf, woolPerClick, woolPerSecond]);

  // Wolf timer countdown
  useEffect(() => {
    if (!wolf) return;
    const timer = setInterval(() => {
      setWolf((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 0.2) {
          // Wolf escaped!
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 0.2 };
      });
    }, 200);

    return () => clearInterval(timer);
  }, [wolf]);

  // Tap wolf event
  const handleTapWolf = useCallback(
    (e: React.MouseEvent) => {
      if (!wolf) return;

      playWoolPop();

      setWolf((prev) => {
        if (!prev) return null;
        const nextClicks = prev.clicksRemaining - 1;
        if (nextClicks <= 0) {
          // Wolf Defeated!
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { x: prev.x / 100, y: prev.y / 100 },
          });

          if (soundEnabled) playChimeSuccess();

          // Reward bounty
          setWool((w) => w + prev.bounty);
          setTotalWoolGathered((tw) => tw + prev.bounty);

          // Chance for bonus Golden Horn
          if (Math.random() < 0.35) {
            setGoldenHorns((gh) => gh + 1);
          }

          // Advance quest
          setDailyQuests((quests) =>
            quests.map((q) =>
              q.id === 'quest_defend_wolf'
                ? {
                    ...q,
                    current: Math.min(q.target, q.current + 1),
                    completed: q.current + 1 >= q.target,
                  }
                : q
            )
          );

          return null;
        }
        return { ...prev, clicksRemaining: nextClicks };
      });
    },
    [wolf, soundEnabled]
  );

  // -------------------------------------------------------------
  // GAME LOOP (Optimized RAF: commits only >= 1 integer)
  // -------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let accumulatedAccum = 0;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      // Real-time FPS measurement
      fpsFrameCount.current += 1;
      if (now - fpsLastTime.current >= 600) {
        const calculatedFps = Math.round(
          (fpsFrameCount.current * 1000) / (now - fpsLastTime.current)
        );
        setFps(calculatedFps);
        fpsFrameCount.current = 0;
        fpsLastTime.current = now;
      }

      // Passive wool accumulation
      const currentWps = woolPerSecondRef.current;
      if (currentWps > 0) {
        accumulatedAccum += currentWps * dt;

        if (accumulatedAccum >= 1) {
          const wholeUnits = Math.floor(accumulatedAccum);
          accumulatedAccum -= wholeUnits;

          setWool((prev) => prev + wholeUnits);
          setTotalWoolGathered((prev) => prev + wholeUnits);
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // -------------------------------------------------------------
  // AUTOSAVE & PERSISTENCE
  // -------------------------------------------------------------
  const saveToStorage = useCallback(() => {
    const s = stateRef.current;
    const dataToSave = {
      wool: s.wool,
      totalWoolGathered: s.totalWoolGathered,
      clicks: s.clicks,
      goldenHorns: s.goldenHorns,
      prestigeCount: s.prestigeCount,
      soundEnabled: s.soundEnabled,
      activeAccessory: s.activeAccessory,
      upgrades: s.upgrades.map((u) => ({ id: u.id, owned: u.owned, cost: u.cost })),
      ownedPets: s.ownedPets,
      prestigeUpgrades: s.prestigeUpgrades.map((pu) => ({ id: pu.id, level: pu.level })),
      dailyQuests: s.dailyQuests,
      achievements: s.achievements.map((a) => ({ id: a.id, unlocked: a.unlocked })),
      lastSaveTime: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Storage quota safety
    }
  }, []);

  // 5000ms debounced autosave
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [
    wool,
    totalWoolGathered,
    clicks,
    goldenHorns,
    prestigeCount,
    soundEnabled,
    activeAccessory,
    upgrades,
    ownedPets,
    prestigeUpgrades,
    dailyQuests,
    achievements,
    saveToStorage,
  ]);

  // Synchronous beforeunload / pagehide listener
  useEffect(() => {
    const handleUnload = () => {
      saveToStorage();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [saveToStorage]);

  // Achievement tracker
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
        } else if (ach.type === 'prestige' && prestigeCount >= ach.target) {
          unlocked = true;
        }
        if (unlocked) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { x: 0.5, y: 0.7 },
          });
        }
        return unlocked ? { ...ach, unlocked: true } : ach;
      })
    );
  }, [totalWoolGathered, clicks, ownedPets, prestigeCount]);

  // -------------------------------------------------------------
  // SHEEP SHEAR CLICK HANDLER
  // -------------------------------------------------------------
  const handleShear = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const clickVal = woolPerClick;

      setWool((prev) => prev + clickVal);
      setTotalWoolGathered((prev) => prev + clickVal);
      setClicks((prev) => prev + 1);

      // Advance daily clicks quest
      setDailyQuests((quests) =>
        quests.map((q) =>
          q.id === 'quest_clicks'
            ? {
                ...q,
                current: Math.min(q.target, q.current + 1),
                completed: q.current + 1 >= q.target,
              }
            : q
        )
      );

      // Increase combo streak
      setCombo((prev) => {
        const next = Math.min(prev + 1, 20);
        if (next >= 10) {
          setDailyQuests((quests) =>
            quests.map((q) =>
              q.id === 'quest_combo'
                ? {
                    ...q,
                    current: Math.max(q.current, next),
                    completed: true,
                  }
                : q
            )
          );
        }
        return next;
      });

      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setCombo(0);
      }, 1600);

      // Spawn floating numbers at cursor
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      const isCritHit =
        isGoldenMode || combo >= 5 || Math.random() < 0.12 + prestigeCritChance;
      const newParticleId = ++particleIdCounter.current;
      const newParticle: FloatingParticle = {
        id: newParticleId,
        x: clickX,
        y: clickY,
        text: `+${clickVal}`,
        isCrit: isCritHit,
      };

      setParticles((prev) => [...prev.slice(-10), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticleId));
      }, 850);
    },
    [woolPerClick, isGoldenMode, combo, prestigeCritChance]
  );

  // Keyboard Spacebar listener to shear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const fakeEvent = {
          currentTarget: {
            getBoundingClientRect: () => ({
              left: window.innerWidth / 2 - 100,
              top: window.innerHeight / 2,
              width: 200,
              height: 200,
            }),
          },
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        } as unknown as React.MouseEvent<HTMLDivElement>;

        handleShear(fakeEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleShear]);

  // Buy regular upgrade
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    setUpgrades((prev) =>
      prev.map((item) => {
        if (item.id === upgradeId) {
          setWool((currentWool) => {
            if (currentWool < item.cost) return currentWool;
            return currentWool - item.cost;
          });
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
  }, []);

  // Buy Pet
  const handleBuyPet = useCallback((petId: string) => {
    const def = PET_DEFINITIONS.find((p) => p.id === petId);
    if (!def) return;

    setOwnedPets((prev) => {
      const existing = prev.find((p) => p.id === petId);
      const currentLevel = existing ? existing.level : 0;
      const cost = Math.round(def.cost * Math.pow(1.6, currentLevel));

      let purchased = false;
      setWool((currentWool) => {
        if (currentWool >= cost) {
          purchased = true;
          return currentWool - cost;
        }
        return currentWool;
      });

      if (!purchased) return prev;

      if (existing) {
        return prev.map((p) =>
          p.id === petId
            ? { ...p, level: p.level + 1, happiness: Math.min(100, p.happiness + 20) }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: petId,
            level: 1,
            happiness: 100,
            lastFed: Date.now(),
          },
        ];
      }
    });
  }, []);

  // Feed Pet
  const handleFeedPet = useCallback((petId: string) => {
    const feedCost = 50;
    let fed = false;

    setWool((currentWool) => {
      if (currentWool >= feedCost) {
        fed = true;
        return currentWool - feedCost;
      }
      return currentWool;
    });

    if (fed) {
      setOwnedPets((prev) =>
        prev.map((p) =>
          p.id === petId
            ? { ...p, happiness: Math.min(100, p.happiness + 35), lastFed: Date.now() }
            : p
        )
      );

      // Advance feed pet daily quest
      setDailyQuests((quests) =>
        quests.map((q) =>
          q.id === 'quest_feed_pet'
            ? {
                ...q,
                current: Math.min(q.target, q.current + 1),
                completed: q.current + 1 >= q.target,
              }
            : q
        )
      );
    }
    return { success: fed, woolBonus: 0 };
  }, []);

  // Golden Clover Catch Event
  const handleGoldenCloverCollect = useCallback(() => {
    setIsGoldenMode(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (goldenTimerRef.current) clearTimeout(goldenTimerRef.current);
    goldenTimerRef.current = setTimeout(() => {
      setIsGoldenMode(false);
    }, 12000);
  }, []);

  // -------------------------------------------------------------
  // PRESTIGE EXECUTION ("Золотое Возрождение")
  // -------------------------------------------------------------
  const handlePerformPrestige = useCallback(() => {
    if (wool < 5000) return;

    const hornsEarned = Math.max(1, Math.floor(Math.pow(wool / 2000, 0.45)));

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
    });

    if (soundEnabled) playChimeSuccess();

    setGoldenHorns((prev) => prev + hornsEarned);
    setPrestigeCount((prev) => prev + 1);

    // Reset base progression, but KEEP Golden Horns, Prestige Upgrades, Achievements & Pets
    setWool(0);
    setUpgrades(INITIAL_UPGRADES);

    // Give visual celebration
    alert(`🎉 Золотое Возрождение совершено!\n\nВы получили ${hornsEarned} 📯 Золотых Рогов! Ваша овечка стала сильнее навсегда!`);
  }, [wool, soundEnabled]);

  // Buy Prestige Upgrade with Golden Horns
  const handleBuyPrestigeUpgrade = useCallback((upgradeId: string) => {
    setPrestigeUpgrades((prev) =>
      prev.map((pu) => {
        if (pu.id === upgradeId && pu.level < pu.maxLevel) {
          let bought = false;
          setGoldenHorns((gh) => {
            if (gh >= pu.cost) {
              bought = true;
              return gh - pu.cost;
            }
            return gh;
          });
          if (bought) {
            return { ...pu, level: pu.level + 1 };
          }
        }
        return pu;
      })
    );
  }, []);

  // Claim Daily Quest Reward
  const handleClaimQuestReward = useCallback(
    (questId: string) => {
      const targetQuest = dailyQuests.find((q) => q.id === questId);
      if (!targetQuest || !targetQuest.completed || targetQuest.claimed) return;

      if (soundEnabled) playChimeSuccess();

      if (targetQuest.rewardType === 'goldenHorns') {
        setGoldenHorns((gh) => gh + targetQuest.rewardAmount);
      } else {
        setWool((w) => w + targetQuest.rewardAmount);
        setTotalWoolGathered((tw) => tw + targetQuest.rewardAmount);
      }

      setDailyQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
      );

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    },
    [dailyQuests, soundEnabled]
  );

  const formatOfflineTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) return `${hours} ч. ${minutes} мин.`;
    if (minutes > 0) return `${minutes} мин. ${seconds} сек.`;
    return `${seconds} сек.`;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 select-none">
      {/* 1. OPTIMIZED FARM PADDOCK BACKGROUND */}
      <FarmPenBackground />

      {/* 2. LIVING PETS ON PASTURE BACKGROUND */}
      <AnimatedPetsLayer
        pets={PET_DEFINITIONS}
        ownedPets={ownedPets}
        soundEnabled={soundEnabled}
        onFeedPet={handleFeedPet}
      />

      {/* 3. DYNAMIC WEATHER & CLIMATE INDICATOR */}
      <WeatherIndicator weather={weather} />

      {/* 4. WOOL COUNTER, COMBO FRENZY & REFRESH RATE GAUGE */}
      <WoolCounter
        wool={wool}
        woolPerSecond={woolPerSecond}
        woolPerClick={woolPerClick}
        combo={combo}
        fps={fps}
        isGoldenMode={isGoldenMode}
      />

      {/* 5. CENTER PADDOCK: ANIMATED JUMPING SHEEP */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-20 md:pb-28 pointer-events-none">
        <div id="main-sheep-character" className="relative flex flex-col items-center pointer-events-auto">
          <AnimatedSheep
            onShear={handleShear}
            soundEnabled={soundEnabled}
            activeAccessory={activeAccessory}
            isGoldenMode={isGoldenMode}
          />

          {/* Pasture instruction pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-950/35 backdrop-blur-sm text-white/95 text-xs md:text-sm font-semibold tracking-wide border border-white/20 shadow-sm flex items-center gap-2">
            <span>Нажимай на овечку, чтобы собрать шерсть!</span>
            <span className="hidden sm:inline opacity-75 font-normal">
              (или клавиша Пробел)
            </span>
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE MINI-GAME: WOLF DEFENSE */}
      <WolfDefenseLayer wolf={wolf} onTapWolf={handleTapWolf} soundEnabled={soundEnabled} />

      {/* 7. FLOATING PARTICLES */}
      <FloatingWoolParticles particles={particles} />

      {/* 8. LUCKY GOLDEN CLOVER RANDOM EVENT */}
      <GoldenCloverEvent
        onCollect={handleGoldenCloverCollect}
        soundEnabled={soundEnabled}
      />

      {/* 9. OFFLINE PROGRESS MODAL BANNER */}
      {offlineReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-amber-50 border-4 border-amber-300 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-2">🌾🐑✨</div>
            <h2 className="text-2xl font-black text-amber-950 mb-1">С возвращением!</h2>
            <p className="text-amber-800 text-sm mb-4">
              Пока вас не было (<span className="font-bold">{formatOfflineTime(offlineReport.seconds)}</span>), овечки усердно трудились в загоне:
            </p>
            <div className="bg-white/90 border border-amber-200 rounded-2xl py-3 px-4 mb-5 shadow-inner flex items-center justify-center gap-3">
              <span className="text-3xl">🧶</span>
              <span className="text-3xl font-black text-amber-600">
                +{offlineReport.wool.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-amber-800">шерсти</span>
            </div>
            <button
              onClick={() => setOfflineReport(null)}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              Забрать в закрома!
            </button>
          </div>
        </div>
      )}

      {/* 10. CORRAL SHOP & UPGRADES DRAWER (Стрижка, Загон, Питомцы, Квесты, Возрождение, Гардероб, Награды) */}
      <UpgradesPanel
        wool={wool}
        goldenHorns={goldenHorns}
        prestigeCount={prestigeCount}
        upgrades={upgrades}
        accessories={ACCESSORIES}
        achievements={achievements}
        pets={PET_DEFINITIONS}
        ownedPets={ownedPets}
        prestigeUpgrades={prestigeUpgrades}
        dailyQuests={dailyQuests}
        activeAccessory={activeAccessory}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onBuyUpgrade={handleBuyUpgrade}
        onSelectAccessory={(accId) => setActiveAccessory(accId)}
        onBuyPet={handleBuyPet}
        onFeedPet={handleFeedPet}
        onBuyPrestigeUpgrade={handleBuyPrestigeUpgrade}
        onPerformPrestige={handlePerformPrestige}
        onClaimQuestReward={handleClaimQuestReward}
      />
    </div>
  );
}

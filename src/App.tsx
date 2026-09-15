import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FarmPenBackground } from './components/FarmPenBackground';
import { AnimatedSheep } from './components/AnimatedSheep';
import { HeaderBar } from './components/HeaderBar';
import { UpgradesPanel } from './components/UpgradesPanel';
import { FloatingWoolParticles } from './components/FloatingWoolParticles';
import { GoldenCloverEvent } from './components/GoldenCloverEvent';
import { AnimatedPetsLayer } from './components/AnimatedPetsLayer';
import { WolfDefenseLayer } from './components/WolfDefenseLayer';
import { MysteryBalloon, BalloonReward } from './components/MysteryBalloon';
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

  // Golden Sheep Fever (Лихорадка x5)
  const [isFeverMode, setIsFeverMode] = useState(false);
  const feverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // In-game prestige celebration toast (replaces window.alert)
  const [prestigeToast, setPrestigeToast] = useState<{ horns: number } | null>(null);

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

  // State ref continuously synchronized for tick loops, intervals & autosave (no useEffect = no re-render loops!)
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
  const feverMultiplier = isFeverMode ? 5 : 1;

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
        feverMultiplier *
        hornGlobalMultiplier *
        (1 + accessoryClickBonus) *
        weather.clickMultiplier
    );

    return isGoldenMode ? calculated * 3 : calculated;
  }, [
    upgrades,
    ownedPets,
    comboMultiplier,
    feverMultiplier,
    hornGlobalMultiplier,
    accessoryClickBonus,
    weather.clickMultiplier,
    isGoldenMode,
  ]);

  const woolPerClickRef = useRef(woolPerClick);
  woolPerClickRef.current = woolPerClick;

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

    const passiveFeverMultiplier = isFeverMode ? 2 : 1;
    const calculated = Math.round(
      base * hornGlobalMultiplier * (1 + accessoryPassiveBonus) * weather.woolMultiplier * passiveFeverMultiplier
    );
    return isGoldenMode ? calculated * 3 : calculated;
  }, [
    upgrades,
    ownedPets,
    hornGlobalMultiplier,
    accessoryPassiveBonus,
    weather.woolMultiplier,
    isGoldenMode,
    isFeverMode,
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
      const bountyValue = Math.max(
        100,
        Math.floor(woolPerClickRef.current * 25 + woolPerSecondRef.current * 10)
      );

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
  }, [wolf !== null]);

  // Wolf timer countdown (runs cleanly with interval without tearing down on each tick)
  useEffect(() => {
    if (!wolf) return;
    const timer = setInterval(() => {
      setWolf((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 0.2) {
          // Wolf escaped!
          return null;
        }
        return { ...prev, timeLeft: Number((prev.timeLeft - 0.2).toFixed(1)) };
      });
    }, 200);

    return () => clearInterval(timer);
  }, [wolf?.id]);

  // Tap wolf event - cleanly structured outside nested state setters
  const handleTapWolf = useCallback(
    (e: React.MouseEvent) => {
      if (!wolf) return;

      playWoolPop();

      const nextClicks = wolf.clicksRemaining - 1;
      if (nextClicks <= 0) {
        // Wolf Defeated!
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { x: wolf.x / 100, y: wolf.y / 100 },
        });

        if (soundEnabled) playChimeSuccess();

        const bounty = wolf.bounty;
        setWool((w) => w + bounty);
        setTotalWoolGathered((tw) => tw + bounty);

        if (Math.random() < 0.35) {
          setGoldenHorns((gh) => gh + 1);
        }

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

        setWolf(null);
      } else {
        setWolf((prev) => (prev ? { ...prev, clicksRemaining: nextClicks } : null));
      }
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

  // Periodic 5000ms autosave using latest stateRef (clean interval, no timer thrashing)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveToStorage();
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [saveToStorage]);

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

  // Safe periodic achievement tracker (every 1.5s, eliminates infinite loops completely!)
  useEffect(() => {
    const checkAchievements = () => {
      const {
        totalWoolGathered: tw,
        clicks: cl,
        ownedPets: op,
        prestigeCount: pc,
        achievements: currAch,
      } = stateRef.current;
      const activePetsCount = op.filter((p) => p.level > 0).length;

      let anyNewUnlocked = false;
      const updated = currAch.map((ach) => {
        if (ach.unlocked) return ach;
        let unlocked = false;
        if (ach.type === 'totalWool' && tw >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'clicks' && cl >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'pets' && activePetsCount >= ach.target) {
          unlocked = true;
        } else if (ach.type === 'prestige' && pc >= ach.target) {
          unlocked = true;
        }
        if (unlocked) {
          anyNewUnlocked = true;
          return { ...ach, unlocked: true };
        }
        return ach;
      });

      if (anyNewUnlocked) {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { x: 0.5, y: 0.65 },
        });
        setAchievements(updated);
      }
    };

    const interval = setInterval(checkAchievements, 1500);
    return () => clearInterval(interval);
  }, []);

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
      const currentCombo = combo;
      const nextCombo = Math.min(currentCombo + 1, 20);
      setCombo(nextCombo);

      if (nextCombo >= 10) {
        setDailyQuests((quests) =>
          quests.map((q) =>
            q.id === 'quest_combo'
              ? {
                  ...q,
                  current: Math.max(q.current, nextCombo),
                  completed: true,
                }
              : q
          )
        );
      }

      // If player hits 15 combo: activate Golden Sheep Fever for 8s!
      if (nextCombo >= 15 && !isFeverMode) {
        setIsFeverMode(true);
        if (soundEnabled) playChimeSuccess();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
        });

        if (feverTimerRef.current) clearTimeout(feverTimerRef.current);
        feverTimerRef.current = setTimeout(() => {
          setIsFeverMode(false);
        }, 8000);
      }

      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setCombo(0);
      }, 1600);

      // Spawn floating numbers at cursor
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      const isCritHit =
        isFeverMode || isGoldenMode || combo >= 5 || Math.random() < 0.12 + prestigeCritChance;
      const newParticleId = ++particleIdCounter.current;
      const newParticle: FloatingParticle = {
        id: newParticleId,
        x: clickX,
        y: clickY,
        text: isFeverMode ? `+${clickVal} 🔥` : `+${clickVal}`,
        isCrit: isCritHit,
      };

      setParticles((prev) => [...prev.slice(-10), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticleId));
      }, 850);
    },
    [woolPerClick, isGoldenMode, isFeverMode, combo, prestigeCritChance, soundEnabled]
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
    const item = stateRef.current.upgrades.find((u) => u.id === upgradeId);
    if (!item || stateRef.current.wool < item.cost) return;

    const itemCost = item.cost;
    const nextCost = Math.round(item.cost * item.costMultiplier);

    setWool((w) => w - itemCost);
    setUpgrades((prev) =>
      prev.map((u) =>
        u.id === upgradeId ? { ...u, owned: u.owned + 1, cost: nextCost } : u
      )
    );
  }, []);

  // Buy Pet
  const handleBuyPet = useCallback((petId: string) => {
    const def = PET_DEFINITIONS.find((p) => p.id === petId);
    if (!def) return;

    const existing = stateRef.current.ownedPets.find((p) => p.id === petId);
    const currentLevel = existing ? existing.level : 0;
    const cost = Math.round(def.cost * Math.pow(1.6, currentLevel));

    if (stateRef.current.wool < cost) return;

    setWool((w) => w - cost);
    setOwnedPets((prev) => {
      const match = prev.find((p) => p.id === petId);
      if (match) {
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
    if (stateRef.current.wool < feedCost) return { success: false, woolBonus: 0 };

    setWool((w) => w - feedCost);
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

    return { success: true, woolBonus: 0 };
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

  // Mystery Balloon Reward Collector
  const handleBalloonReward = useCallback(
    (reward: BalloonReward) => {
      if (soundEnabled) playChimeSuccess();

      if (reward.type === 'wool' && reward.amount) {
        setWool((w) => w + reward.amount!);
        setTotalWoolGathered((tw) => tw + reward.amount!);
      } else if (reward.type === 'horns' && reward.amount) {
        setGoldenHorns((gh) => gh + reward.amount!);
      } else if (reward.type === 'fever') {
        setIsFeverMode(true);
        if (feverTimerRef.current) clearTimeout(feverTimerRef.current);
        feverTimerRef.current = setTimeout(() => {
          setIsFeverMode(false);
        }, 10000);
      } else if (reward.type === 'clover') {
        handleGoldenCloverCollect();
      }
    },
    [soundEnabled, handleGoldenCloverCollect]
  );

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

    // Set non-blocking celebration toast (no window.alert iframe bugs)
    setPrestigeToast({ horns: hornsEarned });
  }, [wool, soundEnabled]);

  // Buy Prestige Upgrade with Golden Horns
  const handleBuyPrestigeUpgrade = useCallback((upgradeId: string) => {
    const item = stateRef.current.prestigeUpgrades.find((pu) => pu.id === upgradeId);
    if (!item || item.level >= item.maxLevel || stateRef.current.goldenHorns < item.cost) return;

    const cost = item.cost;
    setGoldenHorns((gh) => gh - cost);
    setPrestigeUpgrades((prev) =>
      prev.map((pu) => (pu.id === upgradeId ? { ...pu, level: pu.level + 1 } : pu))
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

      {/* 3. UNIFIED HEADER: WOOL COUNTER, WEATHER, COMBO & FPS */}
      <HeaderBar
        wool={wool}
        woolPerSecond={woolPerSecond}
        woolPerClick={woolPerClick}
        combo={combo}
        fps={fps}
        isGoldenMode={isGoldenMode}
        isFeverMode={isFeverMode}
        weather={weather}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* 4. PASTURE MYSTERY BALLOON (Fever, Wool, Golden Horns) */}
      <MysteryBalloon
        onCollectReward={handleBalloonReward}
        woolPerClick={woolPerClick}
        woolPerSecond={woolPerSecond}
      />

      {/* 5. CENTER PADDOCK: ANIMATED JUMPING SHEEP WITH GUARANTEED CLEARANCE */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 md:pb-24 pointer-events-none">
        <div id="main-sheep-character" className="relative flex flex-col items-center pointer-events-auto">
          <AnimatedSheep
            onShear={handleShear}
            soundEnabled={soundEnabled}
            activeAccessory={activeAccessory}
            isGoldenMode={isGoldenMode || isFeverMode}
          />

          {/* Pasture instruction pill */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-950/40 backdrop-blur-sm text-white/95 text-xs md:text-sm font-semibold tracking-wide border border-white/20 shadow-sm flex items-center gap-2">
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

      {/* PRESTIGE CELEBRATION MODAL */}
      {prestigeToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-amber-50 border-4 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-2 animate-bounce">📯✨🐑</div>
            <h2 className="text-2xl font-black text-amber-950 mb-2">Золотое Возрождение!</h2>
            <p className="text-amber-800 text-sm mb-4">
              Вы успешно переродили отару и получили вечное благословение золотого руна!
            </p>
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-300 rounded-2xl py-3 px-4 mb-5 shadow-inner flex items-center justify-center gap-3">
              <span className="text-3xl">📯</span>
              <span className="text-3xl font-black text-amber-700">
                +{prestigeToast.horns}
              </span>
              <span className="text-sm font-bold text-amber-900">Золотых Рогов</span>
            </div>
            <button
              onClick={() => setPrestigeToast(null)}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              Продолжить с новой силой!
            </button>
          </div>
        </div>
      )}

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

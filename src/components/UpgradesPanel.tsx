import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors,
  Sparkles,
  Zap,
  Crown,
  Wand2,
  Flower2,
  Box,
  Bell,
  Home,
  Heart,
  Repeat,
  CloudRain,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Volume2,
  VolumeX,
  Trophy,
  Check,
  Lock,
  PawPrint,
  Utensils,
  RefreshCw,
  Moon,
  ListTodo,
} from 'lucide-react';
import {
  Upgrade,
  Accessory,
  Achievement,
  PetDefinition,
  OwnedPet,
  PrestigeUpgrade,
  DailyQuest,
} from '../types';
import { playChimeSuccess, playPetSound, playPetFeedSound } from '../utils/sound';

interface UpgradesPanelProps {
  wool: number;
  goldenHorns: number;
  prestigeCount: number;
  upgrades: Upgrade[];
  accessories: Accessory[];
  achievements: Achievement[];
  pets: PetDefinition[];
  ownedPets: OwnedPet[];
  prestigeUpgrades: PrestigeUpgrade[];
  dailyQuests: DailyQuest[];
  activeAccessory: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onSelectAccessory: (accessoryId: string) => void;
  onBuyPet: (petId: string) => void;
  onFeedPet: (petId: string) => { success: boolean; woolBonus: number };
  onBuyPrestigeUpgrade: (upgradeId: string) => void;
  onPerformPrestige: () => void;
  onClaimQuestReward: (questId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Scissors,
  Sparkles,
  Zap,
  Crown,
  Wand2,
  Flower2,
  Box,
  Bell,
  Home,
  Heart,
  Repeat,
  CloudRain,
  Moon,
};

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  wool,
  goldenHorns,
  prestigeCount,
  upgrades,
  accessories,
  achievements,
  pets,
  ownedPets,
  prestigeUpgrades,
  dailyQuests,
  activeAccessory,
  soundEnabled,
  onToggleSound,
  onBuyUpgrade,
  onSelectAccessory,
  onBuyPet,
  onFeedPet,
  onBuyPrestigeUpgrade,
  onPerformPrestige,
  onClaimQuestReward,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'click' | 'passive' | 'pets' | 'quests' | 'prestige' | 'wardrobe' | 'achievements'
  >('click');

  const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toLocaleString('ru-RU');
    if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + ' тыс.';
    return (num / 1000000).toFixed(2).replace('.00', '') + ' млн.';
  };

  const handleBuy = (upgradeId: string, cost: number) => {
    if (wool >= cost) {
      if (soundEnabled) playChimeSuccess();
      onBuyUpgrade(upgradeId);
    }
  };

  const handleBuyPetClick = (petId: string, cost: number) => {
    if (wool >= cost) {
      if (soundEnabled) playChimeSuccess();
      onBuyPet(petId);
    }
  };

  // Potential Golden Horns gained on prestige (formula: Math.floor(Math.sqrt(total / 5000)))
  const potentialHorns = Math.max(1, Math.floor(Math.pow(wool / 2000, 0.45)));
  const canPrestige = wool >= 5000;

  const clickUpgrades = upgrades.filter((u) => u.type === 'click');
  const passiveUpgrades = upgrades.filter((u) => u.type === 'passive');

  // Count uncompleted quests for badge
  const readyQuestsCount = dailyQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <>
      {/* Toggle Button on bottom right */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-xl shadow-amber-950/20 border-2 border-amber-300 backdrop-blur-md cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-amber-100" />
          <span className="text-sm md:text-base">Лавка Пастуха</span>

          {/* Badge for quests or affordable items */}
          {readyQuestsCount > 0 ? (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center border-2 border-white animate-pulse">
              {readyQuestsCount}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}

          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-slate-900/95 backdrop-blur-xl border-l border-amber-500/20 shadow-2xl z-50 flex flex-col text-slate-100 select-none"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
                  🏡
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-amber-400">
                    Ярмарка Фермера
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Шерсть:</span>
                    <span className="font-extrabold text-amber-300 font-mono">
                      {formatNumber(wool)} 🧶
                    </span>
                    {goldenHorns > 0 && (
                      <span className="font-extrabold text-yellow-400 flex items-center gap-0.5">
                        | 📯 {goldenHorns}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSound}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex px-3 py-2 gap-1 bg-slate-950/70 border-b border-slate-800 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('click')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'click'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✂️ Стрижка
              </button>
              <button
                onClick={() => setActiveTab('passive')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'passive'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🌾 Загон
              </button>
              <button
                onClick={() => setActiveTab('pets')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pets'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🐾 Питомцы
              </button>
              <button
                onClick={() => setActiveTab('quests')}
                className={`relative flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quests'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                📜 Квесты
                {readyQuestsCount > 0 && (
                  <span className="ml-1 w-2 h-2 inline-block rounded-full bg-rose-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('prestige')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'prestige'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-yellow-400/80 hover:text-yellow-300 hover:bg-slate-800'
                }`}
              >
                ✨ Возрождение
              </button>
              <button
                onClick={() => setActiveTab('wardrobe')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'wardrobe'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                👒 Гардероб
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'achievements'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🏆 Награды
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* 1. CLICK UPGRADES */}
              {activeTab === 'click' &&
                clickUpgrades.map((item) => {
                  const IconComp = ICON_MAP[item.icon] || Scissors;
                  const canAfford = wool >= item.cost;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleBuy(item.id, item.cost)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        canAfford
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-amber-500/30 hover:border-amber-400 active:scale-[0.98]'
                          : 'bg-slate-900/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-100">{item.name}</span>
                            {item.owned > 0 && (
                              <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                ур. {item.owned}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-snug line-clamp-1">
                            {item.description}
                          </p>
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            +{item.power} шерсти / клик
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <div
                          className={`font-black text-sm font-mono ${
                            canAfford ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {formatNumber(item.cost)} 🧶
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 2. PASSIVE BUILDINGS */}
              {activeTab === 'passive' &&
                passiveUpgrades.map((item) => {
                  const IconComp = ICON_MAP[item.icon] || Flower2;
                  const canAfford = wool >= item.cost;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleBuy(item.id, item.cost)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        canAfford
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-emerald-500/30 hover:border-emerald-400 active:scale-[0.98]'
                          : 'bg-slate-900/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-100">{item.name}</span>
                            {item.owned > 0 && (
                              <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                ур. {item.owned}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-snug line-clamp-1">
                            {item.description}
                          </p>
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            +{item.power} шерсти / сек
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <div
                          className={`font-black text-sm font-mono ${
                            canAfford ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {formatNumber(item.cost)} 🧶
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 3. LIVING PETS */}
              {activeTab === 'pets' &&
                pets.map((def) => {
                  const owned = ownedPets.find((p) => p.id === def.id);
                  const level = owned ? owned.level : 0;
                  const cost = Math.round(def.cost * Math.pow(1.6, level));
                  const canAfford = wool >= cost;

                  return (
                    <div
                      key={def.id}
                      className="p-4 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800/90 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                            {def.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-100">{def.name}</span>
                              {level > 0 && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                  Уровень {level}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{def.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                        <div className="text-emerald-400 font-bold">
                          +{def.woolPerSecondBonus * Math.max(1, level)} шерсти/сек
                        </div>
                        <div className="flex items-center gap-2">
                          {level > 0 && (
                            <button
                              onClick={() => onFeedPet(def.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Кормить (50 🧶)</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleBuyPetClick(def.id, cost)}
                            disabled={!canAfford}
                            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {level === 0 ? 'Приютить' : 'Улучшить'}: {formatNumber(cost)} 🧶
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 4. DAILY QUESTS */}
              {activeTab === 'quests' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <p className="font-extrabold text-amber-300 text-sm mb-0.5">
                      📜 Ежедневные Поручения Пастуха
                    </p>
                    Выполняйте задания, чтобы заработать горы шерсти и редкие Золотые Рога!
                  </div>

                  {dailyQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        quest.claimed
                          ? 'bg-slate-900/40 border-slate-800 opacity-50'
                          : quest.completed
                          ? 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-950/20 shadow-lg'
                          : 'bg-slate-800/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                          {quest.icon}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-100">{quest.title}</span>
                          <p className="text-xs text-slate-400">{quest.description}</p>
                          <div className="w-32 bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-700">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (quest.current / quest.target) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        {quest.claimed ? (
                          <span className="text-xs font-bold text-slate-500">Забрано ✓</span>
                        ) : quest.completed ? (
                          <button
                            onClick={() => onClaimQuestReward(quest.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs shadow hover:bg-emerald-600 transition-transform active:scale-95 cursor-pointer animate-pulse"
                          >
                            Забрать: +{quest.rewardAmount}{' '}
                            {quest.rewardType === 'goldenHorns' ? '📯' : '🧶'}
                          </button>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {quest.current}/{quest.target}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. PRESTIGE SYSTEM ("ЗОЛОТОЕ ВОЗРОЖДЕНИЕ") */}
              {activeTab === 'prestige' && (
                <div className="space-y-4">
                  {/* Prestige Altar Card */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-2 border-yellow-500/40 text-center">
                    <div className="text-4xl mb-2">📯✨</div>
                    <h3 className="text-lg font-black text-yellow-300">
                      Золотое Возрождение Пастбища
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xs mx-auto">
                      Начните заново с чистым загоном, но взамен обретите вечные{' '}
                      <span className="font-bold text-yellow-300">Золотые Рога</span>! Каждый рог
                      дарует постоянные усиления.
                    </p>

                    <div className="my-3 py-2 px-4 rounded-2xl bg-black/40 border border-yellow-500/30 flex items-center justify-around">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Всего возрождений
                        </span>
                        <span className="text-lg font-black text-white">{prestigeCount}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Золотые Рога
                        </span>
                        <span className="text-lg font-black text-yellow-400">
                          {goldenHorns} 📯
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onPerformPrestige}
                      disabled={!canPrestige}
                      className={`w-full py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                        canPrestige
                          ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canPrestige
                        ? `Возродиться и получить +${potentialHorns} 📯!`
                        : 'Требуется накопить 5 000 🧶'}
                    </button>
                  </div>

                  {/* Prestige Upgrades */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                      Вечные Улучшения Рогов
                    </h4>

                    {prestigeUpgrades.map((pu) => {
                      const canAffordHorn = goldenHorns >= pu.cost && pu.level < pu.maxLevel;
                      const isMax = pu.level >= pu.maxLevel;

                      return (
                        <div
                          key={pu.id}
                          className="p-3.5 rounded-2xl bg-slate-800/80 border border-yellow-500/20 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-lg">
                              📯
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-100">{pu.name}</span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                                  {pu.level}/{pu.maxLevel}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{pu.description}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => onBuyPrestigeUpgrade(pu.id)}
                            disabled={!canAffordHorn || isMax}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              isMax
                                ? 'bg-slate-800 text-slate-500'
                                : canAffordHorn
                                ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 active:scale-95'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isMax ? 'МАКС' : `${pu.cost} 📯`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. ACCESSORIES / WARDROBE */}
              {activeTab === 'wardrobe' && (
                <div className="grid grid-cols-2 gap-3">
                  {accessories.map((acc) => {
                    const isUnlocked = wool >= acc.unlockedAtWool;
                    const isEquipped = activeAccessory === acc.id;

                    return (
                      <div
                        key={acc.id}
                        onClick={() => isUnlocked && onSelectAccessory(acc.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center cursor-pointer ${
                          isEquipped
                            ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                            : isUnlocked
                            ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                            : 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-3xl mb-1">{acc.icon}</div>
                        <span className="font-extrabold text-xs text-slate-100">{acc.name}</span>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {acc.description}
                        </p>
                        <div className="mt-2 text-[10px] font-bold">
                          {isEquipped ? (
                            <span className="text-amber-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Надето
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400">Надеть</span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <Lock className="w-3 h-3" /> {formatNumber(acc.unlockedAtWool)} 🧶
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 7. ACHIEVEMENTS */}
              {activeTab === 'achievements' && (
                <div className="space-y-2.5">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                        ach.unlocked
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-slate-900/40 border-slate-800 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${
                          ach.unlocked ? 'bg-amber-500/20' : 'bg-slate-800'
                        }`}
                      >
                        {ach.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{ach.title}</span>
                          {ach.unlocked && (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                              Получено!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

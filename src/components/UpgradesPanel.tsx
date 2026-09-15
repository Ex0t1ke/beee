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
} from 'lucide-react';
import { Upgrade, Accessory, Achievement, PetDefinition, OwnedPet } from '../types';
import { playChimeSuccess, playPetSound, playPetFeedSound } from '../utils/sound';

interface UpgradesPanelProps {
  wool: number;
  upgrades: Upgrade[];
  accessories: Accessory[];
  achievements: Achievement[];
  pets: PetDefinition[];
  ownedPets: OwnedPet[];
  activeAccessory: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onSelectAccessory: (accessoryId: string) => void;
  onBuyPet: (petId: string) => void;
  onFeedPet: (petId: string) => { success: boolean; woolBonus: number };
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
};

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  wool,
  upgrades,
  accessories,
  achievements,
  pets,
  ownedPets,
  activeAccessory,
  soundEnabled,
  onToggleSound,
  onBuyUpgrade,
  onSelectAccessory,
  onBuyPet,
  onFeedPet,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'click' | 'passive' | 'pets' | 'wardrobe' | 'achievements'
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

  const handleFeedClick = (pet: PetDefinition) => {
    const res = onFeedPet(pet.id);
    if (res.success && soundEnabled) {
      playPetFeedSound();
      playPetSound(pet.species);
    }
  };

  const clickUpgrades = upgrades.filter((u) => u.type === 'click');
  const passiveUpgrades = upgrades.filter((u) => u.type === 'passive');

  // Count available affordable upgrades & affordable unowned pets for notification badge
  const affordableUpgrades = upgrades.filter((u) => wool >= u.cost).length;
  const affordablePets = pets.filter((p) => {
    const owned = ownedPets.find((op) => op.id === p.id);
    const isUnowned = !owned || owned.level === 0;
    return isUnowned && wool >= p.cost;
  }).length;
  const affordableCount = affordableUpgrades + affordablePets;

  return (
    <>
      {/* Desktop / Mobile Toggle Button */}
      <div className="fixed bottom-4 right-4 md:top-6 md:right-6 md:bottom-auto z-30 flex items-center gap-2 select-none">
        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          className="p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Shop / Upgrades toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xl border border-emerald-400/50 transition-transform active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="hidden sm:inline">Загон и Магазин</span>
          <span className="sm:hidden">Магазин</span>
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}

          {/* Affordable notification bubble */}
          {affordableCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center animate-bounce shadow-md">
              {affordableCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-in Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-35 md:hidden"
            />

            {/* Panel Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-stone-50/95 backdrop-blur-xl z-40 shadow-2xl border-l border-amber-200 flex flex-col select-none overflow-hidden"
            >
              {/* Panel Header */}
              <div className="p-4 bg-amber-800 text-amber-50 flex items-center justify-between border-b border-amber-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-700/70 flex items-center justify-center text-xl">
                    🌾
                  </div>
                  <div>
                    <h2 className="font-bold text-lg font-['Comfortaa',sans-serif]">Лавка Пастуха</h2>
                    <p className="text-xs text-amber-200">Улучшения, питомцы и аксессуары</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-amber-700 hover:bg-amber-600 flex items-center justify-center text-amber-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs Navigation (Стрижка, Загон, Питомцы, Гардероб, Награды) */}
              <div className="flex border-b border-amber-200 bg-amber-100/60 p-1.5 gap-1 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('click')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === 'click'
                      ? 'bg-white text-amber-950 shadow-sm'
                      : 'text-amber-800 hover:bg-amber-200/50'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Стрижка</span>
                </button>

                <button
                  onClick={() => setActiveTab('passive')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === 'passive'
                      ? 'bg-white text-amber-950 shadow-sm'
                      : 'text-amber-800 hover:bg-amber-200/50'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Загон</span>
                </button>

                {/* 2. ПИТОМЦЫ ТАБ */}
                <button
                  onClick={() => setActiveTab('pets')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap relative ${
                    activeTab === 'pets'
                      ? 'bg-white text-amber-950 shadow-sm'
                      : 'text-amber-800 hover:bg-amber-200/50'
                  }`}
                >
                  <PawPrint className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Питомцы</span>
                  {affordablePets > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('wardrobe')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === 'wardrobe'
                      ? 'bg-white text-amber-950 shadow-sm'
                      : 'text-amber-800 hover:bg-amber-200/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span>Гардероб</span>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === 'achievements'
                      ? 'bg-white text-amber-950 shadow-sm'
                      : 'text-amber-800 hover:bg-amber-200/50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Награды</span>
                </button>
              </div>

              {/* Tab Content List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* 1. Click Upgrades */}
                {activeTab === 'click' && (
                  <>
                    <div className="text-xs text-stone-500 mb-2 px-1">
                      Каждое улучшение повышает количество шерсти за один клик по овечке.
                    </div>
                    {clickUpgrades.map((item) => {
                      const IconComponent = ICON_MAP[item.icon] || Scissors;
                      const canAfford = wool >= item.cost;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            canAfford
                              ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-400'
                              : 'bg-stone-100/70 border-stone-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                canAfford
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-stone-800">{item.name}</h4>
                                {item.owned > 0 && (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                    ур. {item.owned}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                              <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                                +{item.power} шерсти/клик
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuy(item.id, item.cost)}
                            disabled={!canAfford}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow ${
                              canAfford
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            <span>{formatNumber(item.cost)}</span>
                            <span>🧶</span>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 2. Passive Upgrades */}
                {activeTab === 'passive' && (
                  <>
                    <div className="text-xs text-stone-500 mb-2 px-1">
                      Постройки и удобства в загоне приносят шерсть автоматически каждую секунду.
                    </div>
                    {passiveUpgrades.map((item) => {
                      const IconComponent = ICON_MAP[item.icon] || Home;
                      const canAfford = wool >= item.cost;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            canAfford
                              ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-400'
                              : 'bg-stone-100/70 border-stone-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                canAfford
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-stone-800">{item.name}</h4>
                                {item.owned > 0 && (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    ур. {item.owned}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                              <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                                +{item.power} шерсти/сек
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuy(item.id, item.cost)}
                            disabled={!canAfford}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow ${
                              canAfford
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            <span>{formatNumber(item.cost)}</span>
                            <span>🧶</span>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 3. PETS TAB / МАГАЗИН ПИТОМЦЕВ */}
                {activeTab === 'pets' && (
                  <>
                    <div className="text-xs text-stone-500 mb-2 px-1">
                      Купленные питомцы гуляют по загону на заднем фоне! Нажимайте на них или кормите, чтобы они приносили бонусную шерсть и радовали трюками.
                    </div>
                    {pets.map((pet) => {
                      const owned = ownedPets.find((op) => op.id === pet.id);
                      const isOwned = owned && owned.level > 0;
                      const canAfford = wool >= pet.cost;

                      return (
                        <div
                          key={pet.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isOwned
                              ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                              : canAfford
                              ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-400'
                              : 'bg-stone-100/70 border-stone-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
                                {pet.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-stone-800">{pet.name}</h4>
                                  {isOwned && (
                                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      В загоне
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-stone-600 mt-0.5">{pet.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-emerald-600">
                                    +{pet.woolPerSecondBonus} шерсти/сек
                                  </span>
                                  <span className="text-[11px] text-amber-700 font-semibold">
                                    (+{Math.round(pet.clickBonusMultiplier * 100)}% к клику)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isOwned ? (
                              <button
                                onClick={() => handleBuyPetClick(pet.id, pet.cost)}
                                disabled={!canAfford}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow ${
                                  canAfford
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                }`}
                              >
                                <span>{formatNumber(pet.cost)}</span>
                                <span>🧶</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFeedClick(pet)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black transition-all shadow active:scale-95 flex items-center gap-1"
                                title="Покормить питомца для бонуса шерсти"
                              >
                                <Utensils className="w-3.5 h-3.5" />
                                <span>Угостить</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 4. Wardrobe (Accessories) */}
                {activeTab === 'wardrobe' && (
                  <>
                    <div className="text-xs text-stone-500 mb-2 px-1">
                      Украшения открываются по мере сбора шерсти и сразу отображаются на овечке.
                    </div>
                    {accessories.map((item) => {
                      const isEquipped = activeAccessory === item.id;
                      const isUnlocked = wool >= item.unlockedAtWool || item.unlockedAtWool === 0;

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isEquipped
                              ? 'bg-amber-100/70 border-amber-400 shadow-sm'
                              : isUnlocked
                              ? 'bg-white border-stone-200'
                              : 'bg-stone-100/60 border-stone-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-stone-800">{item.name}</h4>
                              <p className="text-xs text-stone-500">{item.description}</p>
                              {!isUnlocked && (
                                <div className="text-[11px] font-semibold text-amber-700 mt-0.5 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Нужно {formatNumber(item.unlockedAtWool)} шерсти
                                </div>
                              )}
                            </div>
                          </div>

                          {isEquipped ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow">
                              <Check className="w-3.5 h-3.5" /> Надето
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => onSelectAccessory(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow active:scale-95"
                            >
                              Надеть
                            </button>
                          ) : (
                            <div className="p-2 rounded-xl bg-stone-200 text-stone-400">
                              <Lock className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 5. Achievements */}
                {activeTab === 'achievements' && (
                  <>
                    <div className="text-xs text-stone-500 mb-2 px-1">
                      Достижения фермы за сбор шерсти, питомцев и заботу об овечке.
                    </div>
                    {achievements.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          item.unlocked
                            ? 'bg-amber-50/80 border-amber-200 shadow-sm'
                            : 'bg-stone-100/60 border-stone-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${
                            item.unlocked
                              ? 'bg-amber-200/70 border border-amber-300'
                              : 'bg-stone-200 grayscale'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-stone-800">{item.title}</h4>
                            {item.unlocked && (
                              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                                Выполнено!
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

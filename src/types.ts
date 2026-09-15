export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  type: 'click' | 'passive';
  power: number; // wool per click OR wool per second
  owned: number;
  icon: string;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  unlockedAtWool: number;
  icon: string;
  color?: string;
  bonusType?: 'clickBonus' | 'passiveBonus' | 'critChance';
  bonusValue?: number;
}

export interface PetDefinition {
  id: string;
  name: string;
  species: 'bunny' | 'chick' | 'dog' | 'cat' | 'piglet';
  description: string;
  cost: number;
  woolPerSecondBonus: number;
  clickBonusMultiplier: number; // e.g. +5% crit or +bonus
  icon: string;
  dialogueLines: string[];
}

export interface OwnedPet {
  id: string; // matches PetDefinition id
  level: number;
  happiness: number; // 0 to 100
  lastFed: number;
}

export interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  type: 'totalWool' | 'clicks' | 'upgrades' | 'pets' | 'prestige';
  unlocked: boolean;
  icon: string;
}

export interface GoldenCloverBuff {
  active: boolean;
  timeLeft: number;
  multiplier: number;
}

// --- New Mechanics Types ---

// 1. Prestige / Reincarnation (Возрождение пастбища)
export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number; // In Golden Horns
  level: number;
  maxLevel: number;
  effectType: 'allWoolMultiplier' | 'clickCritRate' | 'offlineEfficiency' | 'cloverFrequency';
  valuePerLevel: number;
  icon: string;
}

// 2. Weather Engine
export type WeatherType = 'sunny' | 'rainbow' | 'rain' | 'night' | 'windy';

export interface WeatherState {
  type: WeatherType;
  name: string;
  description: string;
  icon: string;
  duration: number; // seconds remaining
  woolMultiplier: number;
  clickMultiplier: number;
  colorFilter?: string;
}

// 3. Mini-game: Wolf defense / Shepherd alert
export interface WolfEncounter {
  id: number;
  x: number; // percentage across pasture
  y: number; // percentage down pasture
  clicksRequired: number;
  clicksRemaining: number;
  timeLeft: number; // seconds until wolf steals wool
  bounty: number; // reward in wool
}

// 4. Daily Shepherd Quests
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: 'wool' | 'goldenHorns';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

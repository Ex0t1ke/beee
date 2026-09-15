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
  type: 'totalWool' | 'clicks' | 'upgrades' | 'pets';
  unlocked: boolean;
  icon: string;
}

export interface GoldenCloverBuff {
  active: boolean;
  timeLeft: number;
  multiplier: number;
}

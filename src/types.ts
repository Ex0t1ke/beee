export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  type: 'click' | 'passive';
  power: number; // wool per click OR wool per second
  owned: number;
  icon: string; // Lucide icon name or emoji
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  unlockedAtWool: number;
  icon: string;
  color?: string;
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
  type: 'totalWool' | 'clicks' | 'upgrades';
  unlocked: boolean;
  icon: string;
}

export interface GameState {
  wool: number;
  totalWoolGathered: number;
  woolPerClick: number;
  woolPerSecond: number;
  clicks: number;
  activeAccessory: string;
  soundEnabled: boolean;
}

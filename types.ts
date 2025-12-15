
export interface LevelStats {
  level: number;
  tapCount: number;
  maxCombo: number;
  timeTaken: number;
  enemiesKilled: number;
  damageTaken: number;
}

export interface GameState {
  level: number;
  currentHp: number; // Base HP (lives)
  maxHp: number;
  combo: number;
  score: number;
  isPlaying: boolean;
  isPaused: boolean;
  levelStartTime: number | null;
  enemiesKilledThisLevel: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER',
  UPGRADING = 'UPGRADING' // New status for picking upgrades
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  text: string;
  hp: number;
  maxHp: number;
  speed: number;
  isBoss: boolean;
  frozen?: boolean;
  lastHitTime?: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId?: number; // Optional: Only present if homing
  speed: number;
  damage: number;
  isCrit: boolean;
  type: 'NORMAL' | 'SPLIT' | 'LASER';
  vx?: number; // Velocity X for non-homing
  vy?: number; // Velocity Y for non-homing
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
  rotation: number;
  color?: string;
  scale?: number;
}

export interface HitEffect {
  id: number;
  x: number;
  y: number;
  isCrit: boolean;
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface PlayerStats {
  attackDamage: number;
  attackSpeed: number; // Attacks per second
  projectileSpeed: number;
  critChance: number; // 0-1
  critMultiplier: number;
  multiShotChance: number; // 0-1
  knockback: number;
}

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  apply: (stats: PlayerStats) => PlayerStats;
}

export enum MaterialType {
  WOOD = 'WOOD',
  COPPER = 'COPPER',
  IRON = 'IRON',
  STEEL = 'STEEL',
  DIAMOND = 'DIAMOND'
}

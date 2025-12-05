
export interface LevelStats {
  level: number;
  tapCount: number;
  maxCombo: number;
  timeTaken: number; // in seconds
  totalDamage: number; // Added to track actual worry/hp reduced
  damageHistory: { time: number; damage: number }[];
}

export interface GameState {
  level: number;
  currentHp: number;
  maxHp: number;
  combo: number;
  tapCount: number;
  isPlaying: boolean;
  levelStartTime: number | null;
  lastTapTime: number;
  maxComboThisLevel: number;
  damageDealtThisLevel: number; // Added to track damage accumulator for the current level
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED', // Added PAUSED status
  VICTORY = 'VICTORY', // Level complete
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
  rotation: number;
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export enum MaterialType {
  WOOD = 'WOOD',
  COPPER = 'COPPER',
  IRON = 'IRON',
  STEEL = 'STEEL',
  DIAMOND = 'DIAMOND'
}

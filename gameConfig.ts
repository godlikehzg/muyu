
import { MaterialType, PlayerStats, UpgradeOption } from './types';

export interface WaveConfig {
  material: MaterialType;
  totalEnemies: number;
  spawnInterval: number; // ms
  enemySpeed: number;
  enemyHp: number;
  bossChance: number;
  difficultyText: string;
}

// 基础玩家属性
export const INITIAL_PLAYER_STATS: PlayerStats = {
  attackDamage: 10,
  attackSpeed: 1.0, // 1 shot per second
  projectileSpeed: 8,
  critChance: 0.05,
  critMultiplier: 1.5,
  multiShotChance: 0,
  knockback: 0
};

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    material: MaterialType.WOOD,
    totalEnemies: 20,
    spawnInterval: 1500,
    enemySpeed: 0.8,
    enemyHp: 20,
    bossChance: 0,
    difficultyText: "初动凡心"
  },
  {
    material: MaterialType.COPPER,
    totalEnemies: 30,
    spawnInterval: 1200,
    enemySpeed: 1.0,
    enemyHp: 40,
    bossChance: 0.05,
    difficultyText: "杂念丛生"
  },
  {
    material: MaterialType.IRON,
    totalEnemies: 40,
    spawnInterval: 1000,
    enemySpeed: 1.2,
    enemyHp: 80,
    bossChance: 0.1,
    difficultyText: "心魔乱舞"
  },
  {
    material: MaterialType.STEEL,
    totalEnemies: 60,
    spawnInterval: 800,
    enemySpeed: 1.5,
    enemyHp: 150,
    bossChance: 0.15,
    difficultyText: "业障重重"
  },
  {
    material: MaterialType.DIAMOND,
    totalEnemies: 100,
    spawnInterval: 600,
    enemySpeed: 1.8,
    enemyHp: 300,
    bossChance: 0.2,
    difficultyText: "万法归一"
  }
];

export const ENEMY_WORDS = [
  "焦虑", "加班", "脱发", "贫穷", "内卷", "房贷", "失眠", "水逆", 
  "单身", "催婚", "甲方", "改稿", "背锅", "肥胖", "剧透", "断网"
];

export const BOSS_WORDS = [
  "贪", "嗔", "痴", "慢", "疑"
];

export const UPGRADES: UpgradeOption[] = [
  {
    id: 'dmg_up',
    name: '佛法无边',
    description: '基础伤害 +50%',
    rarity: 'COMMON',
    apply: (s) => ({ ...s, attackDamage: Math.floor(s.attackDamage * 1.5) })
  },
  {
    id: 'spd_up',
    name: '念力加速',
    description: '攻击速度 +20%',
    rarity: 'COMMON',
    apply: (s) => ({ ...s, attackSpeed: s.attackSpeed * 1.2 })
  },
  {
    id: 'crit_up',
    name: '金刚怒目',
    description: '暴击率 +10%',
    rarity: 'RARE',
    apply: (s) => ({ ...s, critChance: Math.min(1.0, s.critChance + 0.1) })
  },
  {
    id: 'multi_up',
    name: '千手观音',
    description: '20% 几率双重射击',
    rarity: 'EPIC',
    apply: (s) => ({ ...s, multiShotChance: Math.min(1.0, s.multiShotChance + 0.2) })
  },
  {
    id: 'knock_up',
    name: '狮子吼',
    description: '击退距离提升',
    rarity: 'RARE',
    apply: (s) => ({ ...s, knockback: s.knockback + 20 })
  },
  {
    id: 'proj_spd',
    name: '大乘佛法',
    description: '功德金光飞行速度 +50%',
    rarity: 'COMMON',
    apply: (s) => ({ ...s, projectileSpeed: s.projectileSpeed * 1.5 })
  }
];

export const MATERIAL_NAME_MAP: Record<MaterialType, string> = {
  [MaterialType.WOOD]: "沉香木",
  [MaterialType.COPPER]: "紫金铜",
  [MaterialType.IRON]: "玄铁",
  [MaterialType.STEEL]: "精钢",
  [MaterialType.DIAMOND]: "舍利"
};
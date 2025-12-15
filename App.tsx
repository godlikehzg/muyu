
import React, { useState, useEffect, useRef, useCallback } from 'react';
import WoodenFish from './components/WoodenFish';
import GameCompleteModal from './components/GameCompleteModal';
import PauseModal from './components/PauseModal';
import LevelInfoModal from './components/LevelInfoModal';
import LevelFailedModal from './components/LevelFailedModal';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';

import { GameState, GameStatus, LevelStats, FloatingText, HitEffect, Ripple, Enemy, Projectile, PlayerStats, UpgradeOption, EnemyType } from './types';
import { playTapSound, playBreakSound, initAudio } from './utils/audio';
import { WAVE_CONFIGS, INITIAL_PLAYER_STATS, ENEMY_WORDS_NORMAL, ENEMY_WORDS_FAST, ENEMY_WORDS_TANK, BOSS_WORDS } from './gameConfig';

const BASE_HP = 3; // Base Player lives

const App: React.FC = () => {
  // --- State ---
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    currentHp: BASE_HP,
    maxHp: BASE_HP,
    combo: 0,
    score: 0,
    isPlaying: false,
    isPaused: false,
    levelStartTime: null,
    enemiesKilledThisLevel: 0
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [gameHistory, setGameHistory] = useState<LevelStats[]>([]);
  
  // Entities
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  
  // Visuals
  const [isHit, setIsHit] = useState(false);

  // Modals
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Refs for Loop
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const enemiesSpawnedCountRef = useRef<number>(0);
  
  // Random rotation for hearts to look hand-placed
  const heartRotations = useRef<number[]>([]);
  
  // Initial Load Effect
  useEffect(() => {
    if (heartRotations.current.length === 0) {
        heartRotations.current = Array.from({length: 20}, () => (Math.random() - 0.5) * 20);
    }
    
    // Simulate loading assets/fonts
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // --- Derived ---
  const getCurrentWaveConfig = () => WAVE_CONFIGS[Math.min(gameState.level - 1, WAVE_CONFIGS.length - 1)];

  // --- Helper: Spawning ---
  const spawnFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, x, y, text, opacity: 1, rotation: (Math.random()-0.5)*25, color, scale }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const spawnHitEffect = (x: number, y: number, isCrit: boolean) => {
    const id = Date.now() + Math.random();
    setHitEffects(prev => [...prev, { id, x, y, isCrit }]);
    setTimeout(() => {
      setHitEffects(prev => prev.filter(h => h.id !== id));
    }, 300);
  };

  const spawnRipple = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, 500); 
  };

  const spawnEnemy = (config: any) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight) * 0.7; // Spawn further outside
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    // Determine Enemy Type
    const rand = Math.random();
    let type = EnemyType.NORMAL;
    let isBoss = false;

    if (rand < config.bossChance) {
        type = EnemyType.BOSS;
        isBoss = true;
    } else if (rand < 0.25) { // 25% chance for FAST
        type = EnemyType.FAST;
    } else if (rand < 0.45) { // 20% chance for TANK
        type = EnemyType.TANK;
    }

    // Determine Attributes based on Type
    let wordList = ENEMY_WORDS_NORMAL;
    let hpMultiplier = 1;
    let speedMultiplier = 1;

    switch (type) {
        case EnemyType.BOSS:
            wordList = BOSS_WORDS;
            hpMultiplier = 5;
            speedMultiplier = 0.5;
            break;
        case EnemyType.FAST:
            wordList = ENEMY_WORDS_FAST;
            hpMultiplier = 0.5; // Fragile
            speedMultiplier = 1.4; // Fast
            break;
        case EnemyType.TANK:
            wordList = ENEMY_WORDS_TANK;
            hpMultiplier = 2.5; // Durable
            speedMultiplier = 0.6; // Slow
            break;
        case EnemyType.NORMAL:
        default:
            wordList = ENEMY_WORDS_NORMAL;
            break;
    }

    const text = wordList[Math.floor(Math.random() * wordList.length)];
    
    const enemy: Enemy = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      hp: config.enemyHp * hpMultiplier,
      maxHp: config.enemyHp * hpMultiplier,
      speed: config.enemySpeed * speedMultiplier,
      type,
      isBoss
    };
    
    setEnemies(prev => [...prev, enemy]);
    enemiesSpawnedCountRef.current += 1;
  };

  const shootProjectile = (target: Enemy | null, type: 'NORMAL' | 'SPLIT' = 'NORMAL') => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const isCrit = Math.random() < playerStats.critChance;
    const damage = isCrit ? playerStats.attackDamage * playerStats.critMultiplier : playerStats.attackDamage;

    // Check if target is visible on screen (with a small buffer)
    const padding = 50;
    const isTargetVisible = target && 
                            target.x > -padding && target.x < window.innerWidth + padding &&
                            target.y > -padding && target.y < window.innerHeight + padding;

    let projectile: Projectile;

    if (isTargetVisible && target) {
        // HOMING MODE: Target is visible
        projectile = {
            id: Date.now() + Math.random(),
            x: centerX,
            y: centerY,
            targetId: target.id,
            speed: playerStats.projectileSpeed,
            damage,
            isCrit,
            type
        };
    } else {
        // RANDOM MODE: Target is off-screen or null
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * playerStats.projectileSpeed;
        const vy = Math.sin(angle) * playerStats.projectileSpeed;

        projectile = {
            id: Date.now() + Math.random(),
            x: centerX,
            y: centerY,
            // No targetId -> Non-homing
            vx, 
            vy,
            speed: playerStats.projectileSpeed,
            damage,
            isCrit,
            type
        };
    }

    setProjectiles(prev => [...prev, projectile]);
  };

  // --- Game Loop ---
  const update = useCallback((time: number) => {
    // Check Pause Status directly
    if (gameStatus !== GameStatus.PLAYING) {
      lastTimeRef.current = 0; // Reset time ref when paused so we don't jump on resume
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    if (lastTimeRef.current === 0 || (time - lastTimeRef.current) > 1000) {
        lastTimeRef.current = time;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const config = getCurrentWaveConfig();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 1. Spawning
    if (enemiesSpawnedCountRef.current < config.totalEnemies) {
      if (time - lastSpawnTimeRef.current > config.spawnInterval) {
        spawnEnemy(config);
        lastSpawnTimeRef.current = time;
      }
    }

    // 3. Move Enemies
    setEnemies(prev => prev.map(e => {
       const dx = centerX - e.x;
       const dy = centerY - e.y;
       const dist = Math.sqrt(dx*dx + dy*dy);
       
       if (dist < 90) return e; // Reached center radius (increased collision radius)

       const vx = (dx / dist) * e.speed * (deltaTime / 16);
       const vy = (dy / dist) * e.speed * (deltaTime / 16);
       
       return { ...e, x: e.x + vx, y: e.y + vy };
    }));

    // 4. Move Projectiles & Collision
    setProjectiles(currentProjectiles => {
       const activeProjectiles: Projectile[] = [];
       const hitEvents: {enemyId: number, damage: number, isCrit: boolean}[] = [];

       currentProjectiles.forEach(p => {
         let newX = p.x;
         let newY = p.y;
         let hitEnemyId: number | null = null;
         
         if (p.targetId !== undefined) {
             // --- HOMING LOGIC ---
             const target = enemies.find(e => e.id === p.targetId);
             if (!target) {
                // Target dead, fizzle out
                return; 
             }

             const dx = target.x - p.x;
             const dy = target.y - p.y;
             const dist = Math.sqrt(dx*dx + dy*dy);

             if (dist < 20) {
               // HIT specific target
               hitEnemyId = target.id;
             } else {
               // Move towards target
               const vx = (dx / dist) * p.speed * (deltaTime / 16);
               const vy = (dy / dist) * p.speed * (deltaTime / 16);
               newX += vx;
               newY += vy;
             }
         } else {
             // --- RANDOM/LINEAR LOGIC ---
             if (p.vx !== undefined && p.vy !== undefined) {
                 newX += p.vx * (deltaTime / 16);
                 newY += p.vy * (deltaTime / 16);
                 
                 // Remove if off-screen (with buffer)
                 if (newX < -100 || newX > window.innerWidth + 100 || newY < -100 || newY > window.innerHeight + 100) {
                     return;
                 }

                 // Check collision with ANY enemy
                 // Simple circle collision check (radius ~20px for projectile, ~30px for enemy)
                 const hit = enemies.find(e => {
                     const dx = e.x - newX;
                     const dy = e.y - newY;
                     return (dx*dx + dy*dy) < 1600; // 40px combined radius squared
                 });

                 if (hit) {
                     hitEnemyId = hit.id;
                 }
             }
         }

         if (hitEnemyId) {
             hitEvents.push({ enemyId: hitEnemyId, damage: p.damage, isCrit: p.isCrit });
         } else {
             activeProjectiles.push({ ...p, x: newX, y: newY });
         }
       });

       // Apply Damage
       if (hitEvents.length > 0) {
         // Trigger visual effects
         hitEvents.forEach(h => {
             const target = enemies.find(e => e.id === h.enemyId);
             if (target) {
                 spawnHitEffect(target.x, target.y, h.isCrit);
             }
         });

         setEnemies(prev => {
            return prev.map(e => {
                const hits = hitEvents.filter(h => h.enemyId === e.id);
                if (hits.length === 0) return e;

                let totalDamage = 0;
                hits.forEach(h => {
                    totalDamage += h.damage;
                    // Visual feedback - Simplified calls here, standardizing colors
                    const color = h.isCrit ? "text-red-500" : "text-yellow-500";
                    const text = h.isCrit ? `暴击 ${Math.floor(h.damage)}!` : `-${Math.floor(h.damage)}`;
                    // Use scale for size differentiation: Normal=1, Crit=1.5
                    spawnFloatingText(e.x, e.y - 20, text, color, h.isCrit ? 1.5 : 1);
                });

                // Knockback based on enemy type resistance
                let kbMultiplier = 1;
                if (e.type === EnemyType.TANK) kbMultiplier = 0.5;
                if (e.type === EnemyType.BOSS) kbMultiplier = 0.2;
                if (e.type === EnemyType.FAST) kbMultiplier = 1.2;

                const dx = e.x - centerX;
                const dy = e.y - centerY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const kbX = (dx/dist) * playerStats.knockback * kbMultiplier;
                const kbY = (dy/dist) * playerStats.knockback * kbMultiplier;

                return { 
                    ...e, 
                    hp: e.hp - totalDamage, 
                    x: e.x + kbX, 
                    y: e.y + kbY,
                    lastHitTime: Date.now() // Record hit time for flash effect
                };
            }).filter(e => {
                if (e.hp <= 0) {
                    // Enemy Dead
                    playBreakSound();
                    // Clean scale call for kill text
                    spawnFloatingText(e.x, e.y, "破!", "text-gray-800", 2.2);
                    setGameState(gs => ({ 
                        ...gs, 
                        enemiesKilledThisLevel: gs.enemiesKilledThisLevel + 1,
                        score: gs.score + (e.isBoss ? 100 : 10)
                    }));
                    return false;
                }
                return true;
            });
         });
       }

       return activeProjectiles;
    });

    // 5. Check Player Damage (Enemy reached center)
    setEnemies(prev => {
        let hpLoss = 0;
        const remaining = prev.filter(e => {
            const dx = centerX - e.x;
            const dy = centerY - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 90) { // Touching fish radius
                hpLoss += 1;
                // Simplified call
                spawnFloatingText(centerX, centerY - 80, "心乱!", "text-red-600", 2.5);
                return false; // Remove enemy
            }
            return true;
        });

        if (hpLoss > 0) {
            setGameState(gs => {
                const newHp = Math.max(0, gs.currentHp - hpLoss);
                if (newHp <= 0) {
                    setGameStatus(GameStatus.GAME_OVER);
                }
                return { ...gs, currentHp: newHp };
            });
            setIsHit(true);
            setTimeout(() => setIsHit(false), 100);
        }
        return remaining;
    });

    // 6. Check Win Condition
    if (enemiesSpawnedCountRef.current >= config.totalEnemies && enemies.length === 0 && gameStatus === GameStatus.PLAYING) {
        handleLevelComplete();
    }

    requestRef.current = requestAnimationFrame(update);
  }, [enemies, gameStatus, gameState.level, playerStats]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // --- Actions ---

  const startGame = () => {
    initAudio(); // Initialize audio context on first gesture
    enemiesSpawnedCountRef.current = 0;
    setGameState({
      level: 1,
      currentHp: BASE_HP,
      maxHp: BASE_HP,
      combo: 0,
      score: 0,
      isPlaying: true,
      isPaused: false,
      levelStartTime: Date.now(),
      enemiesKilledThisLevel: 0
    });
    setPlayerStats(INITIAL_PLAYER_STATS);
    setEnemies([]);
    setProjectiles([]);
    setHitEffects([]);
    setGameStatus(GameStatus.PLAYING);
    setShowPauseModal(false);
  };

  const handleLevelComplete = () => {
    setGameHistory(prev => [...prev, {
        level: gameState.level,
        tapCount: 0, // Not tracking taps anymore, could track shots
        maxCombo: 0,
        timeTaken: (Date.now() - (gameState.levelStartTime || Date.now())) / 1000,
        enemiesKilled: gameState.enemiesKilledThisLevel,
        damageTaken: gameState.maxHp - gameState.currentHp
    }]);
    setGameStatus(GameStatus.UPGRADING);
  };

  const handleUpgradeSelect = (option: UpgradeOption) => {
    setPlayerStats(prev => option.apply(prev));
    // Next Level
    if (gameState.level < WAVE_CONFIGS.length) {
        setGameState(prev => ({
            ...prev,
            level: prev.level + 1,
            enemiesKilledThisLevel: 0,
            levelStartTime: Date.now()
        }));
        enemiesSpawnedCountRef.current = 0;
        setEnemies([]);
        setProjectiles([]);
        setGameStatus(GameStatus.PLAYING);
    } else {
        setGameStatus(GameStatus.VICTORY);
    }
  };

  const handleManualTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameStatus !== GameStatus.PLAYING) return;
    
    // Play sound and visual effect
    playTapSound(getCurrentWaveConfig().material);
    setIsHit(true);
    setTimeout(() => setIsHit(false), 50);

    const rect = e.currentTarget.getBoundingClientRect();
    spawnRipple(e.clientX - rect.left, e.clientY - rect.top);

    // Manual Attack logic
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    let closestDist = Infinity;
    let closestEnemy: Enemy | null = null;
    
    enemies.forEach(e => {
        const dx = e.x - centerX;
        const dy = e.y - centerY;
        const dist = dx*dx + dy*dy;
        if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = e;
        }
    });

    // Fire logic: Always fire, whether we have a target or not
    // shootProjectile handles visibility checks internally to decide tracking vs random
    shootProjectile(closestEnemy);
    
    // Multishot Logic
    if (Math.random() < playerStats.multiShotChance && enemies.length > 1 && closestEnemy) {
        const others = enemies.filter(en => en.id !== closestEnemy!.id);
        if (others.length > 0) {
            const secondTarget = others[Math.floor(Math.random() * others.length)];
            shootProjectile(secondTarget, 'SPLIT');
        }
    }

    // Manual Tap Shockwave (Optional small pushback for nearby enemies on tap)
    setEnemies(prev => prev.map(en => {
        const dx = en.x - centerX;
        const dy = en.y - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 250) { // Shockwave radius
            const vx = (dx/dist) * 40;
            const vy = (dy/dist) * 40;
            return { ...en, x: en.x + vx, y: en.y + vy };
        }
        return en;
    }));
  };

  const togglePause = () => {
    if (gameStatus === GameStatus.PLAYING) {
        setGameStatus(GameStatus.PAUSED);
        setShowPauseModal(true);
    } else if (gameStatus === GameStatus.PAUSED) {
        setGameStatus(GameStatus.PLAYING);
        setShowPauseModal(false);
    }
  };

  // --- UI Helpers ---
  const getEnemyStyle = (type: EnemyType, isHit: boolean) => {
    // Base classes common to all
    let containerClass = "relative flex flex-col items-center justify-center border-2 border-black border-sketchy shadow-[3px_3px_0px_rgba(0,0,0,0.15)] transition-all duration-100 animate-float-slight ";
    let textClass = "font-black tracking-widest whitespace-nowrap font-hand leading-none ";
    let barColor = "bg-gray-800";
    let baseRotation = "1deg";

    if (isHit) {
        containerClass += "brightness-125 saturate-150 ";
    }

    switch (type) {
        case EnemyType.BOSS:
            containerClass += "bg-yellow-100 px-6 py-3 min-w-[110px] border-4 border-red-900 shadow-[5px_5px_0px_rgba(50,0,0,0.2)]";
            textClass += "text-3xl text-red-900 mb-2 drop-shadow-sm";
            barColor = "bg-red-600";
            baseRotation = "-2deg";
            break;

        case EnemyType.TANK:
            // Heavy, blocky, dark
            containerClass += "bg-stone-200 px-5 py-4 min-w-[100px] border-[3px] rounded-none";
            textClass += "text-xl text-stone-800 mb-1.5 font-sans font-extrabold";
            barColor = "bg-stone-600";
            baseRotation = "0deg";
            break;

        case EnemyType.FAST:
            // Small, erratic, scrap paper
            containerClass += "bg-orange-50 px-3 py-1.5 min-w-[60px] rounded-[50%] border-dashed border-orange-800";
            textClass += "text-base text-orange-900 mb-1";
            barColor = "bg-orange-500";
            baseRotation = `${(Math.random() - 0.5) * 10}deg`; // Random jagged rotation
            break;

        case EnemyType.NORMAL:
        default:
            // Standard paper note
            containerClass += "bg-white px-4 py-2 min-w-[80px]";
            textClass += "text-xl text-gray-900 mb-1.5";
            barColor = "bg-gray-800";
            baseRotation = "1deg";
            break;
    }

    return { containerClass, textClass, barColor, baseRotation };
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-4 overflow-hidden">
      
      {/* Loading Overlay */}
      {isLoading && <Loader />}

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-transparent to-transparent" />
      
      {/* --- HUD HEADER --- */}
      <header className="fixed top-0 left-0 w-full p-4 z-50 flex flex-col pointer-events-none space-y-4">
          
          {/* Top Row: Level Info & Menu Buttons */}
          <div className="flex justify-between items-start w-full">
             
             {/* Left: Level Info (Enlarged & Sketchy) - Compacted */}
             <div className="pointer-events-auto bg-white border-2 border-black px-3 py-2 border-sketchy flex flex-col items-start transform -rotate-1 origin-top-left hover:scale-105 transition-transform max-w-[60%]">
                 <div className="flex flex-row items-baseline gap-2">
                     <span className="font-black text-2xl italic tracking-tighter text-black leading-none whitespace-nowrap">
                        第{gameState.level}劫
                     </span>
                     <div className="w-0.5 h-4 bg-gray-300 rounded-full"></div>
                     <span className="text-base font-bold text-gray-500 leading-none whitespace-nowrap">
                        {getCurrentWaveConfig().difficultyText}
                     </span>
                 </div>
             </div>

             {/* Right: Menu Buttons (Enlarged & Sketchy) */}
             <div className="flex gap-3 pointer-events-auto">
                 <button 
                    onClick={() => setShowLevelInfo(true)}
                    className="bg-white border-2 border-black w-14 h-14 flex items-center justify-center border-sketchy-sm shadow-md hover:bg-gray-50 active:translate-y-1 active:shadow-none transition-all transform rotate-2"
                 >
                    <span className="text-2xl">📖</span>
                 </button>
                 <button 
                    onClick={togglePause}
                    className="bg-white border-2 border-black w-14 h-14 flex items-center justify-center border-sketchy-sm shadow-md hover:bg-gray-50 active:translate-y-1 active:shadow-none transition-all transform -rotate-2"
                 >
                    <span className="text-2xl">{gameStatus === GameStatus.PAUSED ? '▶️' : '⏸️'}</span>
                 </button>
             </div>
          </div>

          {/* Center: Progress Bar (Thicker & Sketchy) */}
          <div className="w-full max-w-md mx-auto pointer-events-auto mt-[-10px]">
             <div className="flex justify-between text-xs font-black uppercase text-gray-500 mb-1 px-1 tracking-widest">
                <span>WAVE PROGRESS</span>
                <span>{gameState.enemiesKilledThisLevel} / {getCurrentWaveConfig().totalEnemies}</span>
             </div>
             <div className="h-5 bg-white border-2 border-black rounded-full overflow-hidden relative shadow-sm border-sketchy-sm transform -rotate-1">
                 <div 
                    className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, (gameState.enemiesKilledThisLevel / getCurrentWaveConfig().totalEnemies) * 100)}%` }}
                 >
                     {/* Pattern overlay for style */}
                     <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.3)_50%,rgba(255,255,255,.3)_75%,transparent_75%,transparent)] bg-[length:0.5rem_0.5rem]"></div>
                 </div>
             </div>
          </div>
      </header>

      {/* --- HUD FOOTER (New Location for Stats/HP) --- */}
      <div className="fixed bottom-0 left-0 w-full p-4 pb-6 z-40 pointer-events-none flex flex-col items-center justify-end">
          
          {/* Combined Stats & Hearts (Capsule) */}
          <div className="pointer-events-auto bg-[#fffae0] border-2 border-black px-6 py-3 shadow-sm flex items-center gap-5 transform rotate-1 transition-transform hover:scale-105 border-sketchy-md">
               {/* Attack */}
               <div className="flex items-center gap-2">
                  <span className="text-xl">⚔️</span>
                  <span className="font-black text-xl text-gray-900">{playerStats.attackDamage}</span>
               </div>
               
               {/* Divider */}
               <div className="w-0.5 h-6 bg-black/10 rounded-full"></div>
               
               {/* Speed */}
               <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-black text-xl text-gray-900">{playerStats.projectileSpeed.toFixed(1)}</span>
               </div>

               {/* Divider */}
               <div className="w-0.5 h-6 bg-black/10 rounded-full"></div>

               {/* Hearts Display */}
               <div className="flex items-center gap-1">
                   {Array.from({length: gameState.maxHp}).map((_, i) => (
                       <span 
                         key={i} 
                         className={`text-3xl leading-none transition-all duration-300 ${i < gameState.currentHp ? 'text-red-500 scale-100 filter drop-shadow-sm' : 'text-gray-300 scale-75 opacity-30 grayscale'}`}
                         style={{ transform: `rotate(${heartRotations.current[i] || 0}deg)` }}
                       >
                          ♥
                       </span>
                   ))}
               </div>
          </div>
      </div>

      {/* Main Game Area */}
      <main className="fixed inset-0 flex items-center justify-center overflow-hidden">
        
        {/* Enemies */}
        {enemies.map(e => {
            // Check if enemy was recently hit for flash effect
            const isHitRecently = Date.now() - (e.lastHitTime || 0) < 150;
            const { containerClass, textClass, barColor, baseRotation } = getEnemyStyle(e.type, isHitRecently);
            
            return (
            <div
                key={e.id}
                className="absolute flex flex-col items-center justify-center transition-transform will-change-transform"
                style={{ 
                    left: e.x, 
                    top: e.y, 
                    transform: `translate(-50%, -50%) ${isHitRecently ? 'scale(1.15)' : 'scale(1)'}`, // Pop scale on hit
                    zIndex: e.isBoss ? 20 : 10
                }}
            >
                {/* Enemy Paper Container - Dynamic */}
                <div 
                    className={containerClass}
                    style={{ '--base-rot': baseRotation } as React.CSSProperties}
                >
                    <span 
                        className={textClass}
                        style={{ textShadow: e.isBoss ? '1px 1px 0px rgba(200,0,0,0.1)' : 'none' }}
                    >
                        {e.text}
                    </span>
                    
                    {/* Enemy HP Bar - Sketchy Style */}
                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden border border-black/20 relative">
                        <div 
                            className={`h-full transition-all duration-100 relative ${barColor}`} 
                            style={{width: `${(e.hp / e.maxHp) * 100}%`}}
                        >
                            {/* Texture overlay for the bar */}
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 origin-bottom-left w-[120%]"></div>
                        </div>
                    </div>
                    
                    {/* Boss Stamp */}
                    {e.isBoss && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full border-2 border-black flex items-center justify-center text-white text-[10px] font-bold shadow-sm transform rotate-12 z-20 border-sketchy-sm">
                            魔
                        </div>
                    )}
                    {/* Tank Stamp (Weight) */}
                    {e.type === EnemyType.TANK && (
                         <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-stone-700 rounded-sm border-2 border-black flex items-center justify-center text-white text-[8px] font-bold shadow-sm transform -rotate-12 z-20">
                            重
                        </div>
                    )}
                    {/* Fast Stamp (Lightning) */}
                    {e.type === EnemyType.FAST && (
                         <div className="absolute -top-2 -right-1 w-5 h-5 bg-orange-500 rounded-full border border-black flex items-center justify-center text-white text-[10px] font-bold shadow-sm transform rotate-6 z-20">
                            ⚡
                        </div>
                    )}
                </div>
            </div>
        )})}

        {/* Projectiles */}
        {projectiles.map(p => (
            <div
                key={p.id}
                className="absolute z-30 flex items-center justify-center pointer-events-none"
                style={{ 
                    left: p.x, 
                    top: p.y, 
                    transform: 'translate(-50%, -50%)' 
                }}
            >
               <div className="animate-[spin_1s_linear_infinite]">
                   {p.type === 'NORMAL' ? (
                       <div className="relative flex items-center justify-center w-14 h-14">
                           {/* Golden Glow */}
                           <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-70 scale-110"></div>
                           {/* Symbol */}
                           <span className="relative text-yellow-600 font-black text-5xl drop-shadow-md leading-none" style={{ marginTop: '-4px' }}>卍</span>
                       </div>
                   ) : (
                       <div className="relative flex items-center justify-center w-10 h-10">
                           {/* Blue Glow */}
                           <div className="absolute inset-0 bg-cyan-300 rounded-full blur-md opacity-70 scale-125"></div>
                           <span className="relative text-cyan-600 font-black text-4xl drop-shadow-md leading-none">✨</span>
                       </div>
                   )}
               </div>
            </div>
        ))}
        
        {/* Hit Effects - Explosion visuals */}
        {hitEffects.map(h => (
            <div
                key={h.id}
                className="absolute z-30 pointer-events-none animate-hit-pop"
                style={{ left: h.x, top: h.y }}
            >
                <svg width="80" height="80" viewBox="0 0 100 100" className="overflow-visible">
                    {h.isCrit ? (
                        <path 
                            d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" 
                            fill="#ef4444" 
                            stroke="black" 
                            strokeWidth="3"
                            className="drop-shadow-lg"
                        />
                    ) : (
                        <path 
                            d="M50 15 Q65 15 80 25 Q90 40 85 60 Q75 85 50 85 Q25 85 15 60 Q10 40 20 25 Q35 15 50 15 Z" 
                            fill="#facc15" 
                            stroke="black" 
                            strokeWidth="3"
                            className="drop-shadow-md"
                        />
                    )}
                </svg>
            </div>
        ))}

        {/* Floating Texts - Optimized for Pop Effect */}
        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className={`absolute pointer-events-none select-none font-black animate-float-pop ${ft.color} z-40 whitespace-nowrap`}
            style={{ 
                left: ft.x, 
                top: ft.y,
                fontSize: '2.5rem', // Base size (approx text-4xl)
                '--rot': `${ft.rotation}deg`,
                '--scale': ft.scale || 1
            } as React.CSSProperties}
          >
            {ft.text}
          </div>
        ))}

        {/* Turret (Wooden Fish) */}
        <div className="relative z-30">
            {/* Range Indicator (Subtle Sketchy) */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-2 border-black/5 rounded-[45%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-spin-slow"></div>

            <WoodenFish 
              hpPercentage={(gameState.currentHp / gameState.maxHp) * 100} 
              onClick={handleManualTap}
              isHit={isHit}
              material={getCurrentWaveConfig().material}
            />
            
            {/* Ripple Effects - Sketchy */}
            {ripples.map(r => (
                <div 
                    key={r.id}
                    className="absolute top-0 left-0 border-2 border-yellow-500 rounded-[35%_65%_45%_55%/45%_55%_35%_65%] pointer-events-none animate-ripple box-border z-0 bg-transparent"
                    style={{ left: r.x, top: r.y }}
                />
            ))}
        </div>
        
        {/* Start Prompt */}
        {!isLoading && gameStatus === GameStatus.IDLE && (
            <div className="absolute top-[72%] flex flex-col items-center animate-bounce z-50 pointer-events-auto">
                <button 
                    onClick={startGame}
                    className="bg-black text-white text-3xl font-black py-4 px-12 border-2 border-white shadow-lg border-sketchy-btn hover:scale-105 active:scale-95 transition-all transform -rotate-1"
                >
                    开始渡劫
                </button>
                <p className="mt-4 text-gray-600 font-bold bg-white/60 px-4 py-2 border border-black/10 border-sketchy-sm">点击木鱼发射金光，抵御心魔</p>
            </div>
        )}
      </main>

      {/* Modals with increased Z-Index */}
      {gameStatus === GameStatus.UPGRADING && (
          <UpgradeModal level={gameState.level} onSelect={handleUpgradeSelect} />
      )}

      {showLevelInfo && (
          <LevelInfoModal onClose={() => setShowLevelInfo(false)} />
      )}
      
      {showPauseModal && (
          <PauseModal 
            onResume={togglePause}
            onRestartLevel={startGame}
            onPrevLevel={() => {}} // Not implemented for TD
            showPrevLevel={false}
            onGiveUp={() => { setShowPauseModal(false); setGameStatus(GameStatus.GAME_OVER); }}
          />
      )}

      {gameStatus === GameStatus.VICTORY && (
          <GameCompleteModal history={gameHistory} onRestart={() => setGameStatus(GameStatus.IDLE)} />
      )}

      {gameStatus === GameStatus.GAME_OVER && (
          <LevelFailedModal 
             level={gameState.level} 
             onRetry={startGame} 
             onExit={() => setGameStatus(GameStatus.IDLE)} 
          />
      )}
    </div>
  );
};

export default App;

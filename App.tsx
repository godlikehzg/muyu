
import React, { useState, useEffect, useRef, useCallback } from 'react';
import WoodenFish from './components/WoodenFish';
import LevelCompleteModal from './components/LevelCompleteModal';
import GameCompleteModal from './components/GameCompleteModal';
import PauseModal from './components/PauseModal';
import { GameState, GameStatus, LevelStats, FloatingText, Ripple, MaterialType } from './types';
import { playTapSound, playBreakSound, playWinSound } from './utils/audio';

// --- Level Configuration ---
// Total Worry Goal: 5,201,314
interface LevelConfig {
  hp: number;
  regenRate: number; // Percent per second
  baseDamage: number;
  comboMultiplier: number; // Damage += combo * multiplier
  material: MaterialType;
  difficultyText: string;
}

// Strictly Hard Mode Configuration
const LEVEL_CONFIGS: LevelConfig[] = [
  { 
    // Level 1: HP 1,314. Regen 0.
    // Goal: Tutorial. Easy.
    hp: 1314, 
    regenRate: 0, 
    baseDamage: 5, 
    comboMultiplier: 1, 
    material: MaterialType.WOOD,
    difficultyText: '入门'
  },
  { 
    // Level 2: HP 52,000. Regen 11.5% (6,000/s).
    // Goal: Filter (30% Pass).
    // Base 1, Multiplier 6.
    hp: 52000, 
    regenRate: 0.115, 
    baseDamage: 1, 
    comboMultiplier: 6, 
    material: MaterialType.COPPER,
    difficultyText: '困难'
  },
  { 
    // Level 3: HP 520,000. Regen 17% (88,400/s).
    // Goal: Filter (20% Pass).
    // Base 1, Multiplier 25.
    hp: 520000, 
    regenRate: 0.17, 
    baseDamage: 1, 
    comboMultiplier: 25, 
    material: MaterialType.IRON,
    difficultyText: '极难'
  },
  { 
    // Level 4: HP 1,314,000. Regen 25% (328,500/s).
    // Goal: Hell (5% Pass).
    // Base 1, Multiplier 60.
    hp: 1314000, 
    regenRate: 0.25, 
    baseDamage: 1, 
    comboMultiplier: 60, 
    material: MaterialType.STEEL,
    difficultyText: '地狱'
  },
  { 
    // Level 5: HP 3,314,000. Regen 35% (1,159,900/s).
    // Goal: Impossible (1% Pass).
    // Base 1, Multiplier 120.
    hp: 3314000, 
    regenRate: 0.35, 
    baseDamage: 1, 
    comboMultiplier: 120, 
    material: MaterialType.DIAMOND,
    difficultyText: '非人'
  }
];

const REGEN_DELAY_MS = 1000; 
const COMBO_TIMEOUT_MS = 250; // Strict 250ms window

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    currentHp: LEVEL_CONFIGS[0].hp,
    maxHp: LEVEL_CONFIGS[0].hp,
    combo: 0,
    tapCount: 0,
    isPlaying: false,
    levelStartTime: null,
    lastTapTime: 0,
    maxComboThisLevel: 0,
    damageDealtThisLevel: 0,
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [gameHistory, setGameHistory] = useState<LevelStats[]>([]);
  const [isHit, setIsHit] = useState(false); // Visual recoil state
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStats | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Use a ref to track if level 5 completion has triggered "Game Complete" modal
  const [showGameComplete, setShowGameComplete] = useState(false);
  // Add state to control Level Complete Modal visibility (delayed)
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const comboTimeoutRef = useRef<number | undefined>(undefined);
  const pauseStartTimeRef = useRef<number>(0);

  // --- Derived State Helpers ---
  const getCurrentConfig = () => LEVEL_CONFIGS[gameState.level - 1] || LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1];

  // --- Helpers ---
  const spawnFloatingText = (x: number, y: number, text: string) => {
    const id = Date.now() + Math.random();
    const rotation = (Math.random() - 0.5) * 40; // -20 to 20 degrees
    setFloatingTexts(prev => [...prev, { id, x, y, text, opacity: 1, rotation }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const spawnRipple = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, 500); // Ripple duration
  };

  // --- Timer Effect ---
  useEffect(() => {
    let interval: number;
    if (gameStatus === GameStatus.PLAYING && gameState.levelStartTime) {
      interval = window.setInterval(() => {
        setElapsedTime((Date.now() - gameState.levelStartTime!) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStatus, gameState.levelStartTime]);

  // --- Victory Check Effect ---
  useEffect(() => {
    if (gameState.currentHp <= 0 && gameStatus !== GameStatus.VICTORY) {
      // Clear combo timer on victory
      if (comboTimeoutRef.current) {
        window.clearTimeout(comboTimeoutRef.current);
      }
      
      playBreakSound();
      
      // Delay victory sound slightly
      setTimeout(() => {
        playWinSound();
      }, 600);

      setGameStatus(GameStatus.VICTORY);
      
      const now = Date.now();
      const startTime = gameState.levelStartTime || now;
      const timeTaken = Math.max(0.1, (now - startTime) / 1000); 
      
      // Calculate total damage dealt
      const damageDealt = gameState.damageDealtThisLevel;

      const currentStats: LevelStats = {
        level: gameState.level,
        tapCount: gameState.tapCount,
        maxCombo: gameState.maxComboThisLevel,
        timeTaken,
        totalDamage: damageDealt, 
        damageHistory: [],
      };

      setLevelStats(currentStats);
      
      // Always show Level Complete Modal first, even for level 5
      setTimeout(() => setShowLevelComplete(true), 1200); 
      
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [gameState.currentHp, gameState.levelStartTime, gameState.level, gameState.tapCount, gameState.maxComboThisLevel, gameState.damageDealtThisLevel, gameStatus]);


  // --- Game Loop (Regeneration) ---
  const update = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      
      setGameState(prev => {
        if (gameStatus !== GameStatus.PLAYING || prev.currentHp <= 0) return prev;
        
        const config = LEVEL_CONFIGS[prev.level - 1] || LEVEL_CONFIGS[0];
        const timeSinceTap = Date.now() - prev.lastTapTime;
        
        if (timeSinceTap > REGEN_DELAY_MS && prev.currentHp < prev.maxHp) {
            const regenAmount = (prev.maxHp * config.regenRate * deltaTime) / 1000;
            const newHp = Math.min(prev.maxHp, prev.currentHp + regenAmount);
            return { ...prev, currentHp: newHp };
        }
        return prev;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }, [gameStatus]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // --- Pause Logic ---
  const pauseGame = () => {
    // Allow pausing in both PLAYING and IDLE states
    if (gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.IDLE) {
      setGameStatus(GameStatus.PAUSED);
      if (gameState.isPlaying) {
        pauseStartTimeRef.current = Date.now();
      }
      if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
    }
  };

  const resumeGame = () => {
    if (gameStatus === GameStatus.PAUSED) {
      if (gameState.isPlaying) {
        // Resume playing
        const now = Date.now();
        const pauseDuration = now - pauseStartTimeRef.current;
        
        setGameState(prev => ({
          ...prev,
          levelStartTime: prev.levelStartTime ? prev.levelStartTime + pauseDuration : null,
          lastTapTime: prev.lastTapTime + pauseDuration
        }));
        setGameStatus(GameStatus.PLAYING);
      } else {
        // Was IDLE, go back to IDLE
        setGameStatus(GameStatus.IDLE);
      }
    }
  };

  // --- Navigation Logic ---
  const prevLevel = () => {
    setGameState(prev => {
      const prevLevelIndex = Math.max(1, prev.level - 1);
      const config = LEVEL_CONFIGS[prevLevelIndex - 1];
      
      setGameHistory(history => {
          return history.filter(h => h.level < prevLevelIndex);
      });

      return {
        level: prevLevelIndex,
        maxHp: config.hp,
        currentHp: config.hp,
        combo: 0,
        tapCount: 0,
        isPlaying: false,
        levelStartTime: null,
        lastTapTime: 0,
        maxComboThisLevel: 0,
        damageDealtThisLevel: 0,
      };
    });
    setGameStatus(GameStatus.IDLE);
    setElapsedTime(0);
    setShowLevelComplete(false); // Reset modal
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
  };

  const nextLevel = () => {
    if (levelStats) {
       setGameHistory(prev => {
           // Avoid duplicates if nextLevel called multiple times
           if (prev.find(p => p.level === levelStats.level)) return prev;
           return [...prev, levelStats];
       });
    }

    // Check if we have completed the final level (Level 5)
    // If so, transition to Game Complete Modal instead of next level
    if (gameState.level >= LEVEL_CONFIGS.length) {
        setShowLevelComplete(false);
        setShowGameComplete(true);
        return;
    }

    setGameState(prev => {
      const nextLevel = prev.level + 1;
      const nextConfig = LEVEL_CONFIGS[nextLevel - 1] || LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1];
      
      return {
        level: nextLevel,
        maxHp: nextConfig.hp,
        currentHp: nextConfig.hp,
        combo: 0,
        tapCount: 0,
        isPlaying: false,
        levelStartTime: null,
        lastTapTime: 0,
        maxComboThisLevel: 0,
        damageDealtThisLevel: 0,
      };
    });
    setGameStatus(GameStatus.IDLE);
    setLevelStats(null);
    setElapsedTime(0);
    setShowLevelComplete(false); // Reset modal
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
  };

  const retryLevel = () => {
     setGameState(prev => {
      const config = LEVEL_CONFIGS[prev.level - 1];
      return {
        level: prev.level,
        maxHp: config.hp,
        currentHp: config.hp,
        combo: 0,
        tapCount: 0,
        isPlaying: false,
        levelStartTime: null,
        lastTapTime: 0,
        maxComboThisLevel: 0,
        damageDealtThisLevel: 0,
      };
    });
    setGameStatus(GameStatus.IDLE);
    setLevelStats(null);
    setElapsedTime(0);
    setShowLevelComplete(false); // Reset modal
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
  };

  const restartGame = () => {
    setGameState({
      level: 1,
      maxHp: LEVEL_CONFIGS[0].hp,
      currentHp: LEVEL_CONFIGS[0].hp,
      combo: 0,
      tapCount: 0,
      isPlaying: false,
      levelStartTime: null,
      lastTapTime: 0,
      maxComboThisLevel: 0,
      damageDealtThisLevel: 0,
    });
    setGameStatus(GameStatus.IDLE);
    setLevelStats(null);
    setGameHistory([]);
    setElapsedTime(0);
    setShowGameComplete(false);
    setShowLevelComplete(false); // Reset modal
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
  };

  // --- Debug / Cheat Function ---
  const debugInstantWin = () => {
    if (gameStatus === GameStatus.VICTORY) return;
    
    setGameState(prev => {
      const remainingHp = Math.max(0, prev.currentHp);
      const tapsToAdd = 50; 
      
      return {
        ...prev,
        currentHp: 0, 
        maxComboThisLevel: 999,
        combo: 999,
        tapCount: prev.tapCount + tapsToAdd,
        damageDealtThisLevel: prev.damageDealtThisLevel + remainingHp,
        levelStartTime: Date.now() - 500 
      };
    });
  };

  // --- Interactions ---
  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameStatus === GameStatus.VICTORY || gameStatus === GameStatus.PAUSED) return;

    const now = Date.now();
    const config = getCurrentConfig();
    playTapSound(config.material);
    
    if (comboTimeoutRef.current) {
        window.clearTimeout(comboTimeoutRef.current);
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(15); 
    }
    
    setIsHit(true);
    setTimeout(() => setIsHit(false), 80); 

    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    if (e.clientX !== undefined && e.clientY !== undefined) {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    spawnRipple(clientX, clientY);

    setGameState(prev => {
      if (prev.currentHp <= 0) return prev;

      let newIsPlaying = prev.isPlaying;
      let newLevelStartTime = prev.levelStartTime;
      
      if (!prev.isPlaying || gameStatus === GameStatus.IDLE) {
        newIsPlaying = true;
        newLevelStartTime = now;
        setGameStatus(GameStatus.PLAYING);
      }

      const timeDiff = now - prev.lastTapTime;
      let newCombo = prev.combo;
      
      // Tighten timing window for maintaining combo
      if (timeDiff < COMBO_TIMEOUT_MS) { 
        newCombo += 1;
      } else {
        newCombo = 1;
      }

      // Dynamic Damage Calculation
      const damage = config.baseDamage + (newCombo * config.comboMultiplier);
      const newHp = prev.currentHp - damage;

      const newMaxCombo = Math.max(prev.maxComboThisLevel, newCombo);
      
      const spreadX = (Math.random() - 0.5) * 160; 
      const spreadY = (Math.random() - 0.5) * 100 - 30; 
      
      spawnFloatingText(clientX + spreadX, clientY + spreadY, `烦恼值 -${Math.floor(damage)}`);

      return {
        ...prev,
        currentHp: newHp,
        combo: newCombo,
        tapCount: prev.tapCount + 1,
        maxComboThisLevel: newMaxCombo,
        lastTapTime: now,
        isPlaying: newIsPlaying,
        levelStartTime: newLevelStartTime,
        damageDealtThisLevel: prev.damageDealtThisLevel + damage,
      };
    });

    comboTimeoutRef.current = window.setTimeout(() => {
        setGameState(prev => ({ ...prev, combo: 0 }));
    }, COMBO_TIMEOUT_MS);
  };

  const materialNameMap: Record<MaterialType, string> = {
    [MaterialType.WOOD]: "木质",
    [MaterialType.COPPER]: "铜质",
    [MaterialType.IRON]: "铁质",
    [MaterialType.STEEL]: "钢质",
    [MaterialType.DIAMOND]: "钻石"
  };

  const currentConfig = getCurrentConfig();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 overflow-hidden relative touch-none">
      
      {/* HUD - Pause & Info */}
      <div className="w-full max-w-md mt-4 flex justify-between items-start select-none z-10 relative">
        {/* Pause Button (Left Top) */}
        <button 
           onClick={pauseGame}
           className="absolute top-0 left-0 p-2 bg-white rounded-lg border-2 border-gray-300 hover:bg-gray-100 shadow-sm active:scale-95 transition-transform"
           title="菜单 / 更多"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        {/* Level Info (Centered relative to container layout usually, but here strict flex) */}
        <div className="flex flex-col space-y-2 ml-14">
          {/* Level Title */}
          <span className="text-4xl font-bold tracking-wide">第 {gameState.level} 关</span>
          
          <div className="flex flex-col items-start space-y-1">
             {/* Material Badge */}
             <span className="text-xl text-gray-800 font-bold px-3 py-1 bg-gray-200 rounded-lg border-2 border-gray-300 shadow-sm">
                {materialNameMap[currentConfig.material]}
             </span>
             
             {/* Worry (HP) Text */}
             <div className="flex items-baseline space-x-2 mt-1">
                 <span className="text-xl font-bold text-gray-600">烦恼值:</span>
                 <span className="text-2xl font-black text-gray-800">
                    {Math.max(0, Math.floor(gameState.currentHp))} <span className="text-lg text-gray-500 font-normal">/ {gameState.maxHp}</span>
                 </span>
             </div>
          </div>

          {/* Time Display */}
          <span className="text-xl text-gray-700 font-bold font-mono">时间: {elapsedTime.toFixed(1)}s</span>
          
          {gameState.level >= 2 && (
              <span className="text-sm text-red-600 font-bold animate-pulse border border-red-200 bg-red-50 px-2 py-0.5 rounded w-max">
                  难度: {currentConfig.difficultyText}
              </span>
          )}
        </div>

        {/* Combo Counter */}
        <div className="flex flex-col items-end pt-2">
          <span className={`text-5xl font-black transition-all duration-100 ${gameState.combo > 1 ? 'scale-110 text-red-600 drop-shadow-md' : 'text-gray-300'}`}>
            x{gameState.combo}
          </span>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">连击</span>
        </div>
      </div>

      {/* HP Bar - Thicker */}
      <div className="w-full max-w-md h-8 border-4 border-black rounded-full mt-4 relative bg-white overflow-hidden select-none z-10 shadow-md">
        <div 
          className="h-full bg-red-500 transition-all duration-200 ease-out"
          style={{ width: `${(Math.max(0, gameState.currentHp) / gameState.maxHp) * 100}%` }}
        />
      </div>

      {/* Center Game Area */}
      <div className="flex-1 flex items-center justify-center w-full relative z-0">
        <div className={gameStatus === GameStatus.VICTORY ? 'animate-shake' : ''}>
           <WoodenFish 
              hpPercentage={(gameState.currentHp / gameState.maxHp) * 100} 
              onClick={handleTap}
              isHit={isHit}
              material={currentConfig.material}
           />
        </div>

        {/* Floating Combat Text */}
        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className="fixed pointer-events-none z-50" 
            style={{
              left: ft.x,
              top: ft.y,
              transform: `rotate(${ft.rotation}deg)`, 
            }}
          >
            <div className="text-4xl font-black text-red-600 animate-float-up drop-shadow-md whitespace-nowrap">
               {ft.text}
            </div>
          </div>
        ))}

        {/* Ripples */}
        {ripples.map(r => (
            <div
                key={r.id}
                className="fixed pointer-events-none rounded-full border-4 border-gray-400 animate-ripple z-50"
                style={{
                    left: r.x,
                    top: r.y,
                    width: '20px', 
                    height: '20px',
                }}
            />
        ))}
        
        {/* Helper Text */}
        {gameStatus === GameStatus.IDLE && gameState.level === 1 && (
           <div className="absolute bottom-10 text-gray-400 animate-pulse text-2xl font-bold select-none">
             点击开始消除烦恼
           </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="w-full max-w-md mb-8 grid grid-cols-2 gap-4 text-center text-gray-700 text-base font-bold select-none z-10">
         <div className="border-2 border-black p-3 rounded-lg bg-white shadow-sm">
            敲击数: {gameState.tapCount}
         </div>
         <div className="border-2 border-black p-3 rounded-lg bg-white shadow-sm">
            最高连击: {gameState.maxComboThisLevel}
         </div>
      </div>

      {/* Debug Instant Win Button */}
      <button 
        onClick={debugInstantWin}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1 px-3 rounded shadow-lg opacity-50 hover:opacity-100 z-50 transition-opacity"
        title="测试用：一键完美通关"
      >
        一键通关 (测试)
      </button>

      {/* Modals */}
      {gameStatus === GameStatus.PAUSED && (
         <PauseModal 
            onResume={resumeGame}
            onRestartLevel={retryLevel}
            onPrevLevel={prevLevel}
            showPrevLevel={gameState.level > 1}
         />
      )}

      {showGameComplete ? (
        <GameCompleteModal 
           history={gameHistory}
           onRestart={restartGame}
        />
      ) : (
        gameStatus === GameStatus.VICTORY && levelStats && showLevelComplete && (
          <LevelCompleteModal 
              stats={levelStats} 
              onNextLevel={nextLevel} 
              onRetry={retryLevel}
          />
        )
      )}
    </div>
  );
};

export default App;

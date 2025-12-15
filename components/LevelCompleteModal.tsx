
import React, { useMemo } from 'react';
import { LevelStats } from '../types';

interface LevelCompleteModalProps {
  stats: LevelStats;
  onNextLevel: () => void;
  onRetry: () => void;
}

const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({ stats, onNextLevel, onRetry }) => {
  
  // 计算成就和评价
  const { rank, levelTitle } = useMemo(() => {
    const time = stats.timeTaken || 1; 
    const cps = stats.tapCount / time; 
    
    // 关卡称号映射
    const titles = [
        '尘缘未了', // Level 1
        '渐入佳境', // Level 2
        '烦恼皆空', // Level 3
        '六根清净', // Level 4
        '大彻大悟'  // Level 5
    ];
    const titleIndex = Math.min(Math.max(0, stats.level - 1), titles.length - 1);
    const lTitle = titles[titleIndex];
    
    // --- 评分逻辑 (C - SSS) ---
    let score = 0;

    // 1. 狠度 (CPS)
    if (cps > 10) score += 5;       
    else if (cps > 8) score += 4;   
    else if (cps > 6) score += 3;   
    else if (cps > 4) score += 1;   

    // 2. 稳度 (连击)
    if (stats.maxCombo > 80) score += 5;     
    else if (stats.maxCombo > 50) score += 4; 
    else if (stats.maxCombo > 30) score += 2; 
    else if (stats.maxCombo > 15) score += 1; 

    // 评级判定
    let r = 'C';
    if (score >= 9) r = 'SSS';
    else if (score >= 7) r = 'SS';
    else if (score >= 6) r = 'S';
    else if (score >= 4) r = 'A';
    else if (score >= 2) r = 'B';

    return { rank: r, levelTitle: lTitle };
  }, [stats]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#fdfbf7] border-4 border-black rounded-lg w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-bounce-in relative overflow-hidden text-gray-800">
        
        {/* 装饰性背景纹理 */}
        <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-black opacity-10"></div>

        {/* 头部 - 只有关卡称号 */}
        <div className="p-8 text-center border-b-4 border-black border-dashed bg-gray-50 flex flex-col items-center justify-center relative">
          <h2 className="text-3xl font-black tracking-widest text-gray-900">
             第 {stats.level} 关 · {levelTitle}
          </h2>
          
          {/* 评分印章 - 仅显示字母 */}
          <div className="absolute right-4 transform rotate-12 border-4 border-red-600 rounded-full w-16 h-16 flex items-center justify-center opacity-90 animate-pulse bg-white shadow-lg">
              <span className="text-3xl font-black text-red-600 leading-none pt-1">{rank}</span>
          </div>
        </div>

        {/* 核心数据网格 */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-[#f4f1ea]">
          <div className="flex flex-col items-center p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-xs text-gray-500 font-bold mb-1">耗时</span>
            <span className="text-xl font-bold text-black">
              {typeof stats.timeTaken === 'number' ? stats.timeTaken.toFixed(1) : '0.0'}s
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-xs text-gray-500 font-bold mb-1">击碎次数</span>
            <span className="text-xl font-bold text-black">
              {stats.tapCount ?? 0}
            </span>
          </div>
          <div className="col-span-2 flex flex-col items-center p-2 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-xs text-gray-500 font-bold mb-1">最高暴击连击</span>
            <span className="text-3xl font-black text-red-600">
              {stats.maxCombo ?? 0}
            </span>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 pt-4 flex space-x-3 bg-[#fdfbf7]">
          <button
            onClick={onRetry}
            className="flex-1 bg-white text-black text-lg font-bold py-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
          >
            再试一次
          </button>
          <button
            onClick={onNextLevel}
            className="flex-[2] bg-black text-white text-lg font-bold py-3 rounded-lg hover:bg-gray-800 transition-all active:scale-95 active:shadow-none shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] flex items-center justify-center space-x-2"
          >
            <span>继续修行</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;
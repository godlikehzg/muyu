
import React, { useState, useRef } from 'react';
import { LevelStats } from '../types';
import html2canvas from 'html2canvas';
import Loader from './Loader';

interface GameCompleteModalProps {
  history: LevelStats[];
  onRestart: () => void;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({ history, onRestart }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Aggregated Stats
  const totalTime = history.reduce((acc, curr) => acc + curr.timeTaken, 0);
  const totalTaps = history.reduce((acc, curr) => acc + curr.tapCount, 0);
  // Use enemiesKilled instead of totalDamage as it is tracked in LevelStats
  const totalEnemiesKilled = history.reduce((acc, curr) => acc + (curr.enemiesKilled || 0), 0);
  const maxComboOverall = Math.max(...history.map(h => h.maxCombo), 0);
  const avgCPS = totalTime > 0 ? totalTaps / totalTime : 0;

  // Final Rank Logic
  let title = "初入佛门";
  let desc = "修行之路才刚刚开始";
  
  if (avgCPS > 9 && maxComboOverall > 100) {
    title = "斗战胜佛";
    desc = "天上地下，唯我独尊！烦恼已灰飞烟灭！";
  } else if (avgCPS > 7 && maxComboOverall > 60) {
    title = "功德无量";
    desc = "你的功德金光照亮了整个宇宙。";
  } else if (avgCPS > 5) {
    title = "大彻大悟";
    desc = "内心澄澈，再无一丝杂念。";
  } else {
    title = "心如止水";
    desc = "平平淡淡才是真。";
  }

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    
    try {
        // Wait a bit for layout to settle if needed
        await new Promise(resolve => setTimeout(resolve, 800)); // Increased slight delay for loader visibility

        const canvas = await html2canvas(cardRef.current, {
            useCORS: true,
            scale: 2, // High resolution
            backgroundColor: '#fff7ed', // Set explicit background color to prevent gray transparency artifacts
            ignoreElements: (element) => {
                // Optionally ignore the share button itself in the screenshot if desired
                return false;
            },
            onclone: (clonedDoc) => {
                // 1. Expand height to fit everything including footer
                const clonedCard = clonedDoc.getElementById('game-complete-card');
                if (clonedCard) {
                    clonedCard.style.maxHeight = 'none';
                    clonedCard.style.overflow = 'visible';
                    clonedCard.style.height = 'auto';
                    clonedCard.style.paddingBottom = '60px'; // Extra padding for watermark
                    
                    // Remove shadows and animations to prevent gray overlay artifacts
                    clonedCard.style.boxShadow = 'none';
                    clonedCard.style.animation = 'none';
                    clonedCard.classList.remove('animate-bounce-in');
                    clonedCard.classList.remove('shadow-[0_0_50px_rgba(234,179,8,0.5)]');
                }

                // Dual Title Strategy:
                // 1. Hide the gradient title
                const originalTitle = clonedDoc.querySelector('.original-title') as HTMLElement;
                if (originalTitle) {
                    originalTitle.style.display = 'none';
                }

                // 2. Show the snapshot title
                const snapshotTitle = clonedDoc.querySelector('.snapshot-title') as HTMLElement;
                if (snapshotTitle) {
                    snapshotTitle.style.display = 'flex'; // Use flex to center properly
                    snapshotTitle.classList.remove('hidden');
                    
                    // Force removing any transform/rotation styles that might linger
                    snapshotTitle.style.transform = 'none';
                    const h1 = snapshotTitle.querySelector('h1');
                    if (h1) {
                         h1.style.transform = 'none';
                         // Strip gradient background classes just in case
                         h1.style.backgroundImage = 'none';
                         h1.style.backgroundClip = 'border-box';
                         h1.style.webkitBackgroundClip = 'border-box';
                         h1.style.color = '#ffffff'; // Force white text
                         h1.style.backgroundColor = '#dc2626'; // Force red background
                    }
                }

                // Make watermark visible in the clone
                const watermark = clonedDoc.querySelector('.show-in-capture') as HTMLElement;
                if (watermark) {
                    watermark.style.opacity = '1';
                    watermark.style.position = 'absolute';
                    watermark.style.bottom = '20px'; // Position it nicely at the bottom
                    watermark.style.width = '100%';
                    watermark.style.textAlign = 'center';
                }
            }
        });

        const image = canvas.toDataURL("image/png");
        setShareImage(image);
    } catch (err) {
        console.error("Generating screenshot failed", err);
        alert("生成图片失败，请手动截图分享");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Show Full Screen Loader during generation */}
      {isGenerating && <Loader text="生成法贴中..." className="bg-black/40 backdrop-blur-sm !bg-opacity-40" />}

      {/* Background Overlay with Blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      {/* Rotating Light Rays Background */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0deg,white_20deg,transparent_40deg,white_60deg,transparent_80deg,white_100deg,transparent_120deg,white_140deg,transparent_160deg,white_180deg,transparent_200deg,white_220deg,transparent_240deg,white_260deg,transparent_280deg,white_300deg,transparent_320deg,white_340deg,transparent_360deg)] animate-spin-slow"></div>
      </div>

      {/* Main Card Frame (Fixed Height, Overflow Hidden) */}
      <div 
        id="game-complete-card" 
        ref={cardRef} 
        className="relative bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-yellow-800 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-bounce-in overflow-hidden border-sketchy"
      >
        
        {/* Top Decorator (Fixed) */}
        <div className="absolute top-0 left-0 w-full h-3 bg-yellow-400 z-20 border-b-2 border-black/20"></div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-8 flex flex-col items-center text-center w-full relative z-10 scrollbar-hide">
            
            {/* Title Section */}
            <div className="mb-6 relative w-full flex flex-col items-center">
                <div className="text-yellow-800 text-sm font-bold tracking-[0.5em] mb-4 uppercase">FINAL CLEAR</div>
                
                {/* 1. Original Title */}
                <div className="original-title mb-2">
                    <h1 className="text-5xl font-black text-white bg-red-600 px-10 py-4 border-4 border-yellow-300 shadow-md inline-flex items-center justify-center transform -rotate-2 border-sketchy-md leading-none tracking-widest min-w-[260px] whitespace-nowrap">
                        {title}
                    </h1>
                </div>

                {/* 2. Snapshot Title: Solid styling for Screenshot (Hidden normally) */}
                <div className="snapshot-title hidden mb-2 w-full flex justify-center">
                    <h1 className="text-5xl font-black text-white bg-red-600 px-12 py-6 border-4 border-yellow-300 flex items-center justify-center mx-auto tracking-widest min-w-[260px] whitespace-nowrap leading-none border-sketchy-md">
                        {title}
                    </h1>
                </div>
                
                <div className="mt-4 text-yellow-800 font-bold text-lg px-4">{desc}</div>
            </div>

            {/* Stats Grid - 2x2 Layout */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/80 p-3 border-2 border-yellow-800 shadow-sm border-sketchy-sm transform rotate-1">
                    <div className="text-xs text-gray-600 font-bold mb-1">总耗时</div>
                    <div className="text-2xl font-black text-gray-900">{totalTime.toFixed(1)}s</div>
                </div>
                <div className="bg-white/80 p-3 border-2 border-yellow-800 shadow-sm border-sketchy-sm transform -rotate-1">
                    <div className="text-xs text-gray-600 font-bold mb-1">总敲击数</div>
                    <div className="text-2xl font-black text-gray-900">{totalTaps}</div>
                </div>
                <div className="bg-white/80 p-3 border-2 border-yellow-800 shadow-sm border-sketchy-sm transform -rotate-1">
                    <div className="text-xs text-gray-600 font-bold mb-1">消除烦恼</div>
                    <div className="text-2xl font-black text-gray-900">{totalEnemiesKilled.toLocaleString()}</div>
                </div>
                <div className="bg-white/80 p-3 border-2 border-yellow-800 shadow-sm border-sketchy-sm transform rotate-1">
                    <div className="text-xs text-gray-600 font-bold mb-1">最高连击</div>
                    <div className="text-2xl font-black text-red-600">{maxComboOverall}</div>
                </div>
            </div>

            {/* Level Details Toggle */}
            <div className="w-full mb-6">
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-yellow-700 text-sm font-bold underline hover:text-yellow-900 mb-2 decoration-wavy decoration-2"
                    data-html2canvas-ignore
                >
                    {showDetails ? "收起每关详情" : "查看每关详情"}
                </button>
                
                {showDetails && (
                    <div className="w-full bg-white rounded-lg p-2 text-xs md:text-sm border-2 border-yellow-300 animate-fade-in shadow-inner overflow-x-auto border-sketchy-sm">
                        <table className="w-full text-left min-w-[300px] text-gray-900">
                            <thead>
                                <tr className="border-b-2 border-yellow-300 text-yellow-900">
                                    <th className="py-2 pl-2">关卡</th>
                                    <th className="py-2 text-center">耗时</th>
                                    <th className="py-2 text-center">敲击</th>
                                    <th className="py-2 text-center">连击</th>
                                    <th className="py-2 pr-2 text-right">烦恼值</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h.level} className="border-b border-yellow-100 last:border-0 hover:bg-yellow-50 text-gray-900">
                                        <td className="py-2 pl-2 font-bold">第{h.level}关</td>
                                        <td className="py-2 text-center font-bold">{h.timeTaken.toFixed(1)}s</td>
                                        <td className="py-2 text-center font-bold">{h.tapCount}</td>
                                        <td className="py-2 text-center text-red-600 font-bold">{h.maxCombo}</td>
                                        <td className="py-2 pr-2 text-right font-bold text-gray-800">{h.enemiesKilled.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3 mt-auto">
            <button 
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-4 border-2 border-yellow-800 shadow-md transform transition active:scale-95 flex items-center justify-center space-x-2 border-sketchy-btn"
                data-html2canvas-ignore
            >
                <span className="text-lg">✨ 炫耀一下 (生成海报)</span>
            </button>
            
            <button 
                onClick={onRestart}
                className="w-full bg-white border-2 border-yellow-800 text-yellow-800 font-bold py-3 hover:bg-yellow-50 transition active:scale-95 border-sketchy-btn"
                data-html2canvas-ignore
            >
                重新修行
            </button>
            </div>
            
            {/* Watermark only visible in screenshot */}
             <div className="mt-8 text-sm text-yellow-700 font-bold opacity-0 show-in-capture" style={{opacity: 0}}>
                禅意木鱼 · 消除烦恼
            </div>
        </div>

        {/* Bottom Decorator (Fixed) */}
        <div className="absolute bottom-0 left-0 w-full h-3 bg-yellow-400 z-20 border-t-2 border-black/20"></div>

      </div>

      {/* Share Overlay */}
      {shareImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
             <div className="text-white text-lg font-bold mb-4 animate-bounce">
                长按下方图片保存或发送给朋友
             </div>
             
             <img 
               src={shareImage} 
               alt="Achievement" 
               className="w-full max-w-sm border-4 border-white shadow-2xl max-h-[80vh] object-contain border-sketchy-sm"
             />

             <button 
                onClick={() => setShareImage(null)}
                className="mt-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
        </div>
      )}
    </div>
  );
};

export default GameCompleteModal;

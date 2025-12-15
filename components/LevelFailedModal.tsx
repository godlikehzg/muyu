
import React from 'react';

interface LevelFailedModalProps {
  level: number;
  onRetry: () => void;
  onExit: () => void;
}

const LevelFailedModal: React.FC<LevelFailedModalProps> = ({ level, onRetry, onExit }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#fdfbf7] border-2 border-black w-full max-w-sm overflow-hidden animate-bounce-in shadow-xl border-sketchy transform rotate-1">
        <div className="bg-black p-6 text-center border-b-2 border-black relative">
            <h2 className="text-4xl font-black text-white mb-1 tracking-widest relative z-10">道心破碎</h2>
            <div className="text-gray-400 text-sm font-bold uppercase tracking-wide relative z-10">第 {level} 关 · 挑战失败</div>
            <div className="absolute inset-0 bg-white/5 opacity-50 transform skew-y-6"></div>
        </div>
        
        <div className="p-8 text-center relative">
            <div className="mb-6 relative z-10">
                <div className="text-lg text-gray-800 font-bold mb-2">本次修行击败了</div>
                <div className="text-7xl font-black text-black leading-none transform -rotate-2">0.1<span className="text-3xl">%</span></div>
                <div className="text-sm text-gray-500 font-bold mt-2 bg-gray-100 inline-block px-3 py-1 border border-black/20 border-sketchy-sm">的全球玩家</div>
            </div>
            
            <p className="text-gray-800 italic mb-8 font-serif font-bold text-lg border-l-4 border-gray-300 pl-4 text-left">
              "施主，心魔太强，<br/>还是太年轻了..."
            </p>

            <div className="space-y-4 relative z-10">
                <button 
                    onClick={onRetry}
                    className="w-full bg-red-600 text-white text-lg font-black py-4 border-2 border-black shadow-md border-sketchy-btn hover:scale-105 transition-transform"
                >
                    重整旗鼓
                </button>
                <button 
                    onClick={onExit}
                    className="w-full text-gray-500 font-bold py-2 text-sm hover:text-black hover:underline decoration-wavy decoration-2 underline-offset-4 transition-all"
                >
                    回第一关虐菜
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LevelFailedModal;

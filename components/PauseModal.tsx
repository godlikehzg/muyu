
import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestartLevel: () => void;
  onPrevLevel: () => void;
  onGiveUp: () => void; // New prop
  showPrevLevel: boolean;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestartLevel, onPrevLevel, onGiveUp, showPrevLevel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdfbf7] border-2 border-black w-full max-w-sm p-8 border-sketchy animate-bounce-in text-center relative shadow-lg">
        
        {/* Corner decors */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-black/10 rounded-tl-xl"></div>
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-black/10 rounded-br-xl"></div>

        <h2 className="text-5xl font-black text-gray-900 mb-2 tracking-widest transform -rotate-2">休整</h2>
        <div className="w-16 h-1.5 bg-black/80 mx-auto mb-8 rounded-full transform rotate-1"></div>
        
        <div className="space-y-4">
          <button 
            onClick={onResume}
            className="w-full bg-black text-white text-xl font-black py-4 border-2 border-black border-sketchy-btn shadow-md hover:scale-105 transition-transform"
          >
            继续修行
          </button>
          
          <button 
            onClick={onRestartLevel}
            className="w-full bg-white text-black font-bold py-3 border-2 border-black border-sketchy-btn hover:bg-gray-50 active:scale-95 transition-all"
          >
            重玩本关
          </button>
          
          {showPrevLevel && (
            <button 
              onClick={onPrevLevel}
              className="w-full bg-white text-gray-800 font-bold py-3 border-2 border-black border-sketchy-btn hover:bg-gray-50 active:scale-95 transition-all"
            >
              返回上一关
            </button>
          )}

          <div className="pt-4 border-t-2 border-dashed border-gray-300 mt-2">
            <button 
                onClick={onGiveUp}
                className="w-full bg-white text-red-600 font-black py-3 border-2 border-red-600 border-sketchy-btn hover:bg-red-50 active:scale-95 transition-all"
            >
                我心已乱 (放弃挑战)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseModal;


import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestartLevel: () => void;
  onPrevLevel: () => void;
  showPrevLevel: boolean;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestartLevel, onPrevLevel, showPrevLevel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdfbf7] border-4 border-gray-800 rounded-xl w-full max-w-sm p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] animate-bounce-in text-center relative">
        
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-gray-300"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-gray-300"></div>

        <h2 className="text-4xl font-black text-gray-800 mb-2 tracking-widest">暂停</h2>
        <div className="w-16 h-1 bg-gray-800 mx-auto mb-6 rounded-full"></div>
        
        <div className="space-y-4">
          <button 
            onClick={onResume}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-white text-lg font-bold py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>继续修行</span>
          </button>
          
          <button 
            onClick={onRestartLevel}
            className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg border-2 border-gray-800 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重玩本关</span>
          </button>
          
          {showPrevLevel && (
            <button 
              onClick={onPrevLevel}
              className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-200 shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <span>返回上一关</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PauseModal;

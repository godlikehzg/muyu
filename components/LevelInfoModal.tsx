
import React from 'react';
import { WAVE_CONFIGS, MATERIAL_NAME_MAP } from '../gameConfig';

interface LevelInfoModalProps {
  onClose: () => void;
}

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#fdfbf7] border-2 border-black w-full max-w-5xl max-h-[90vh] p-4 md:p-8 shadow-2xl animate-bounce-in relative flex flex-col border-sketchy" 
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 bg-red-500 text-white border-2 border-black p-2 shadow-sm hover:scale-110 transition-transform z-20 border-sketchy-sm transform rotate-3"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-4 md:mb-6 flex-shrink-0 pt-2">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-widest bg-yellow-300 inline-block px-6 py-2 border-2 border-black border-sketchy-sm shadow-sm transform -rotate-1">
                心魔塔防 · 修行指南
            </h2>
            <p className="text-gray-600 mt-4 font-bold text-xs md:text-base bg-white/50 inline-block p-2 border-sketchy-sm">
              木鱼即本心。烦恼(敌人)将从四面八方涌来。<br/>
              <span className="text-yellow-700 font-black">木鱼会自动攻击</span>，<span className="text-red-700 font-black">点击木鱼</span>可手动发射金光并击退敌人。
            </p>
        </div>
        
        <div className="w-full overflow-auto border-2 border-black bg-white flex-1 min-h-0 relative border-sketchy-sm shadow-inner">
          <table className="min-w-full text-center whitespace-nowrap border-collapse">
             <thead className="bg-gray-100 sticky top-0 z-10 text-gray-900">
                <tr className="text-xs md:text-base border-b-2 border-black">
                   <th className="py-3 px-2 bg-yellow-100 border-r-2 border-black">波次</th>
                   <th className="py-3 px-2 bg-orange-100 border-r-2 border-black">材质</th>
                   <th className="py-3 px-2 bg-gray-100 border-r-2 border-black">心魔数量</th>
                   <th className="py-3 px-2 bg-gray-200 border-r-2 border-black">心魔强度</th>
                   <th className="py-3 px-2 bg-red-100">难度</th>
                </tr>
             </thead>
             <tbody className="text-gray-800 text-xs md:text-base font-bold">
                {WAVE_CONFIGS.map((config, index) => {
                    return (
                        <tr key={index} className="hover:bg-yellow-50 border-b-2 border-black/10 last:border-b-0">
                            <td className="py-3 px-2 font-black border-r-2 border-black">第 {index + 1} 劫</td>
                            <td className="py-3 px-2 text-gray-700 border-r-2 border-black">{MATERIAL_NAME_MAP[config.material]}</td>
                            <td className="py-3 px-2 font-mono border-r-2 border-black">{config.totalEnemies}</td>
                            <td className="py-3 px-2 text-red-700 border-r-2 border-black">{config.enemyHp} HP / {config.enemySpeed} 速</td>
                            <td className="py-3 px-2 text-gray-900 italic">{config.difficultyText}</td>
                        </tr>
                    );
                })}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LevelInfoModal;

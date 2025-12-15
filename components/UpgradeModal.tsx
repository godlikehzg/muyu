
import React, { useEffect, useState } from 'react';
import { UPGRADES } from '../gameConfig';
import { UpgradeOption } from '../types';

interface UpgradeModalProps {
  onSelect: (upgrade: UpgradeOption) => void;
  level: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onSelect, level }) => {
  const [options, setOptions] = useState<UpgradeOption[]>([]);

  useEffect(() => {
    // Randomly select 3 unique upgrades
    const shuffled = [...UPGRADES].sort(() => 0.5 - Math.random());
    setOptions(shuffled.slice(0, 3));
  }, []);

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 border-gray-400';
      case 'RARE': return 'bg-blue-50 border-blue-400';
      case 'EPIC': return 'bg-purple-50 border-purple-500';
      case 'LEGENDARY': return 'bg-yellow-50 border-yellow-500';
      default: return 'bg-white border-black';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white tracking-widest text-shadow-red mb-2 transform -rotate-2">顿悟时刻</h2>
          <p className="text-yellow-300 font-bold text-xl">第 {level} 劫已度，请选择法门</p>
        </div>

        <div className="grid gap-4">
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onSelect(option)}
              className={`relative p-6 border-2 text-left transition-all hover:scale-105 active:scale-95 ${getRarityStyle(option.rarity)} border-sketchy shadow-md group`}
              style={{ transform: `rotate(${(index - 1) * 1.5}deg)` }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-black">{option.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 border-2 border-black bg-white border-sketchy-sm`}>
                  {option.rarity === 'COMMON' ? '凡品' : option.rarity === 'RARE' ? '稀有' : '史诗'}
                </span>
              </div>
              <p className="text-gray-700 font-bold group-hover:text-gray-900">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

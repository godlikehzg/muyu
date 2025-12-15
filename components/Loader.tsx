
import React from 'react';

interface LoaderProps {
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "心境调律中...", className = "" }) => {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fdfbf7] text-black transition-opacity duration-500 ${className}`}>
      <div className="relative w-32 h-32">
        {/* Hand-drawn sketchy circles with CSS animation */}
        <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
           {/* Outer Circle Sketch */}
           <path 
             d="M 50 10 A 40 40 0 1 1 49 10"
             fill="none" 
             stroke="#000" 
             strokeWidth="3" 
             strokeLinecap="round"
             strokeDasharray="180 50"
           />
           {/* Inner Circle Sketch (Offset) */}
           <path 
             d="M 50 15 A 35 35 0 1 0 51 15"
             fill="none" 
             stroke="#666" 
             strokeWidth="2" 
             strokeLinecap="round"
             strokeDasharray="100 120"
             transform="rotate(180 50 50)"
           />
        </svg>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
            {/* Wooden Fish Icon */}
            <span className="text-4xl filter drop-shadow-sm select-none">🪵</span>
        </div>
      </div>
      
      {/* Loading Text Container */}
      <div className="mt-8 px-6 py-2 border-2 border-black border-sketchy-sm bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transform -rotate-1">
        <span className="text-lg font-black text-gray-900 tracking-[0.2em] animate-pulse">
            {text}
        </span>
      </div>
    </div>
  );
};

export default Loader;

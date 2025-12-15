
import React from 'react';
import { MaterialType } from '../types';

interface WoodenFishProps {
  hpPercentage: number;
  onClick: (e: React.PointerEvent<HTMLDivElement>) => void;
  isHit: boolean;
  material: MaterialType;
}

const WoodenFish: React.FC<WoodenFishProps> = ({ hpPercentage, onClick, isHit, material }) => {
  // 计算损伤进度 (0.0 到 1.0)
  const damage = Math.max(0, Math.min(1, (100 - hpPercentage) / 100));

  // 动态计算各损伤层级的透明度
  const scratchOpacity = Math.min(1, damage * 2.5); 
  const crackMinorOpacity = Math.max(0, Math.min(1, (damage - 0.4) * 5));
  const crackMajorOpacity = Math.max(0, Math.min(1, (damage - 0.7) * 5));
  const holeOpacity = Math.max(0, Math.min(1, (damage - 0.9) * 10));

  const isBroken = hpPercentage <= 0;

  // 材质样式配置
  const getMaterialStyle = (type: MaterialType) => {
    switch (type) {
      case MaterialType.DIAMOND:
        return {
          fill: '#b9f2ff', // 浅青/钻石色
          stroke: '#0077b6', // 深蓝
          detail: '#90e0ef', // 细节青色
          textureColor: '#00b4d8', // 纹理色
          shatterFill: '#caf0f8', // 破碎内部色
          // 木棒样式 - 钻石锤
          stickRod: '#023e8a', // 棒身深蓝
          stickHead: '#b9f2ff', // 锤头钻石色
          stickDetail: '#ffffff' // 亮白高光
        };
      case MaterialType.COPPER:
        return {
          fill: '#d98758', // 铜色
          stroke: '#5c3a21', // 深铜色
          detail: '#8c5a3c',
          textureColor: '#5c3a21',
          shatterFill: '#c77d52',
          // 木棒样式 - 铜锤
          stickRod: '#5c3a21', 
          stickHead: '#d98758',
          stickDetail: '#f0b490'
        };
      case MaterialType.IRON:
        return {
          fill: '#7a7a7a', // 铁灰色
          stroke: '#2b2b2b', // 深铁色
          detail: '#4a4a4a',
          textureColor: '#2b2b2b',
          shatterFill: '#6e6e6e',
          // 木棒样式 - 铁锤
          stickRod: '#2b2b2b',
          stickHead: '#7a7a7a',
          stickDetail: '#9e9e9e'
        };
      case MaterialType.STEEL:
        return {
          fill: '#c0c0c0', // 银色/钢色
          stroke: '#404040', // 深钢色
          detail: '#808080',
          textureColor: '#404040',
          shatterFill: '#b0b0b0',
          // 木棒样式 - 钢锤
          stickRod: '#404040',
          stickHead: '#c0c0c0',
          stickDetail: '#ffffff'
        };
      case MaterialType.WOOD:
      default:
        return {
          fill: '#e8d5b5', // 原木色
          stroke: '#2d2d2a', // 深木色
          detail: '#4a4036',
          textureColor: '#2d2d2a',
          shatterFill: '#d1c4b2',
          // 木棒样式 - 木槌
          stickRod: '#5c4033',
          stickHead: '#d2b48c',
          stickDetail: '#e8d5b5'
        };
    }
  };

  const style = getMaterialStyle(material);

  return (
    <div 
      className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none" 
      onPointerDown={onClick}
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full transition-transform origin-bottom ${
            isHit && !isBroken
            ? 'scale-x-110 scale-y-90 duration-50 ease-out' // 增强弹性挤压效果：更扁(90%)更宽(110%)，速度更快(50ms)
            : 'scale-100 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
        }`}
        style={{
            // 视觉闪烁：击打时显著增加亮度(1.2)和饱和度(1.4)，阴影压得更低，提供强烈的视觉反馈
            filter: isBroken 
                ? "none" 
                : isHit 
                    ? "drop-shadow(1px 1px 0px rgba(0,0,0,0.3)) brightness(1.2) saturate(1.4)" 
                    : "drop-shadow(5px 5px 0px rgba(0,0,0,0.1))"
        }}
      >
        {/* --- 完好状态 (Alive State) --- */}
        {!isBroken && (
          <g>
            {/* 木鱼主体 */}
            <path
              d="M100 20 
                 C 150 20, 180 60, 180 110
                 C 180 160, 140 190, 100 190
                 C 60 190, 20 160, 20 110
                 C 20 60, 50 20, 100 20 Z"
              fill={style.fill} 
              stroke={style.stroke}
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition-colors duration-500"
            />
            
            {/* 原始装饰纹理 */}
            <path
              d="M40 110 Q 60 140 100 140 Q 140 140 160 110"
              fill="none"
              stroke={style.textureColor}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* 木鱼嘴 */}
            <path
              d="M30 110 Q 100 130 170 110"
              fill="none"
              stroke={style.stroke}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M30 110 Q 100 130 170 110"
              fill="none"
              stroke={style.detail}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* 顶部手柄 */}
            <path
               d="M85 25 Q 100 5 115 25"
               fill="none"
               stroke={style.stroke}
               strokeWidth="6"
               strokeLinecap="round"
            />

            {/* --- 动态损伤层 --- */}
            {/* Layer 0: 表面划痕 */}
            <g style={{ opacity: scratchOpacity }} className="transition-opacity duration-300">
               <path d="M60 50 L 70 60" stroke="#5e5e5e" strokeWidth="2" strokeLinecap="round" />
               <path d="M140 40 L 130 55" stroke="#5e5e5e" strokeWidth="2" strokeLinecap="round" />
               <path d="M120 160 L 115 170" stroke="#5e5e5e" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Layer 1: 部分裂缝 */}
            <g style={{ opacity: crackMinorOpacity }} className="transition-opacity duration-300">
               <path d="M100 50 L 95 70 L 105 85" fill="none" stroke={style.stroke} strokeWidth="3" />
               <path d="M160 100 L 150 115" fill="none" stroke={style.stroke} strokeWidth="3" />
               <path d="M40 130 L 55 140" fill="none" stroke={style.stroke} strokeWidth="3" />
            </g>

            {/* Layer 2: 更多裂缝 */}
            <g style={{ opacity: crackMajorOpacity }} className="transition-opacity duration-300">
               <path d="M105 85 L 100 120 L 75 135" fill="none" stroke={style.stroke} strokeWidth="3.5" />
               <path d="M150 70 L 130 90 L 140 105" fill="none" stroke={style.stroke} strokeWidth="3.5" />
               <path d="M55 140 L 70 150" fill="none" stroke={style.stroke} strokeWidth="3.5" />
               <path d="M110 30 L 120 50" stroke={style.stroke} strokeWidth="2" />
            </g>

            {/* Layer 3: 严重破损/破洞 */}
            <g style={{ opacity: holeOpacity }} className="transition-opacity duration-300">
               <path d="M175 90 Q 160 100 175 110" fill={style.stroke} stroke="none" />
               <path d="M90 100 Q 100 110 110 100 Q 100 90 90 100" fill={style.stroke} stroke="none" />
               <path d="M75 135 L 60 150 L 80 160" fill="none" stroke={style.stroke} strokeWidth="4" />
            </g>
          </g>
        )}

        {/* --- 破碎状态 (Shattered State) --- */}
        {isBroken && (
          <g>
            {/* 左半块碎片 */}
            <path
              className="animate-shatter-left"
              d="M100 20 C 50 20 20 60 20 110 C 20 160 60 190 90 190 L 80 120 L 100 80 Z"
              fill={style.shatterFill}
              stroke={style.stroke}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* 裂纹细节 (左) */}
            <path className="animate-shatter-left" d="M40 130 L 55 140" stroke={style.stroke} strokeWidth="2" />

            {/* 右半块碎片 */}
            <path
              className="animate-shatter-right"
              d="M100 20 C 150 20 180 60 180 110 C 180 160 140 190 110 190 L 120 120 L 100 80 Z"
              fill={style.shatterFill}
              stroke={style.stroke}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* 裂纹细节 (右) */}
            <path className="animate-shatter-right" d="M160 100 L 150 115" stroke={style.stroke} strokeWidth="2" />

            {/* 中间崩塌的碎屑 */}
            <g className="animate-crumble">
                <circle cx="100" cy="100" r="5" fill={style.stroke} />
                <circle cx="110" cy="120" r="3" fill={style.stroke} />
                <circle cx="90" cy="130" r="4" fill={style.stroke} />
                <path d="M95 150 L 105 160" stroke={style.stroke} strokeWidth="3" />
            </g>

            {/* 手柄掉落 */}
            <path
               className="animate-crumble"
               d="M85 25 Q 100 5 115 25"
               fill="none"
               stroke={style.stroke}
               strokeWidth="6"
               strokeLinecap="round"
            />
          </g>
        )}
      </svg>
      
      {/* 木鱼棒覆盖层 - 优化后的动画 */}
      <div 
        className={`absolute top-[-90px] right-[-60px] w-44 h-44 pointer-events-none transition-transform
            ${isHit && !isBroken 
                ? 'rotate-[-40deg] translate-y-[-10px] translate-x-[-30px] duration-50 ease-out' // 击打：点到即止，不穿模，极速
                : 'rotate-[20deg] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]' // 回弹：高高举起
            }`}
        style={{ transformOrigin: '85% 85%' }}
      >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter">
             {/* 棒身 - 动态颜色 */}
             <line x1="85" y1="15" x2="25" y2="75" stroke={style.stickRod} strokeWidth="8" strokeLinecap="round" />
             {/* 棒头 - 动态颜色，增加高光 */}
             <circle cx="25" cy="75" r="14" fill={style.stickHead} stroke={style.stickRod} strokeWidth="3" />
             <circle cx="22" cy="72" r="4" fill={style.stickDetail} opacity="0.6" /> 
          </svg>
      </div>
    </div>
  );
};

export default WoodenFish;
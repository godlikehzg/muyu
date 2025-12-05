
import { MaterialType } from '../types';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // Safari fallback
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playTapSound = (material: MaterialType = MaterialType.WOOD) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (material) {
      case MaterialType.DIAMOND:
        // 钻石: 极高频，纯净的正弦波，类似水晶/玻璃的清脆敲击声
        osc.type = 'sine';
        const diamondFreq = 2000 + (Math.random() * 200 - 100);
        osc.frequency.setValueAtTime(diamondFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.001); // 极快起音
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6); // 长余音
        break;

      case MaterialType.COPPER:
        // 铜: 较高频，正弦波，类似钟声，有延音
        osc.type = 'sine';
        // Base freq around 800-900Hz
        const copperFreq = 850 + (Math.random() * 50 - 25);
        osc.frequency.setValueAtTime(copperFreq, t);
        // Slightly longer decay for metal ring
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); // Longer tail
        break;

      case MaterialType.IRON:
        // 铁: 低频，三角波/锯齿波混合感，沉闷
        osc.type = 'triangle';
        const ironFreq = 350 + (Math.random() * 30 - 15);
        osc.frequency.setValueAtTime(ironFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // Short thud
        break;

      case MaterialType.STEEL:
        // 钢: 高频，尖锐，清脆
        osc.type = 'sine';
        const steelFreq = 1200 + (Math.random() * 100 - 50);
        osc.frequency.setValueAtTime(steelFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.002); // Sharp attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4); // Ringing
        break;

      case MaterialType.WOOD:
      default:
        // 木: 中频，正弦波，圆润短促
        osc.type = 'sine';
        const woodFreq = 600 + (Math.random() * 40 - 20);
        osc.frequency.setValueAtTime(woodFreq, t);
        osc.frequency.exponentialRampToValueAtTime(woodFreq * 0.9, t + 0.1);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        break;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8); // Ensure stop handles longest decay
  } catch (e) {
    console.error("Tap audio playback failed", e);
  }
};

export const playBreakSound = () => {
   try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const t = ctx.currentTime;
    
    // Low rumble for breaking
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);

    // Envelope for crunch sound
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  } catch (e) {
    console.error("Break audio playback failed", e);
  }
};

export const playWinSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const t = ctx.currentTime;
    
    // Create a master gain for the win sound
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, t);
    masterGain.connect(ctx.destination);

    // Play a sequence of notes: C5, E5, G5, C6 (Major chord arpeggio)
    // 模拟一种“结算分数”或“升级”的上升音效
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'triangle'; // Clear but slightly rich
      osc.frequency.setValueAtTime(freq, t + index * 0.12); // Staggered start
      
      // Envelope
      const startTime = t + index * 0.12;
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(1, startTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });

  } catch (e) {
    console.error("Win audio playback failed", e);
  }
};

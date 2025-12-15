
import { MaterialType } from '../types';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // Safari fallback
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// New helper to unlock audio context on user interaction
export const initAudio = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.error("Audio resume failed", e);
    }
  }
};

export const playTapSound = (material: MaterialType = MaterialType.WOOD) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (material) {
      case MaterialType.DIAMOND:
        osc.type = 'sine';
        const diamondFreq = 2000 + (Math.random() * 200 - 100);
        osc.frequency.setValueAtTime(diamondFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        break;

      case MaterialType.COPPER:
        osc.type = 'sine';
        const copperFreq = 850 + (Math.random() * 50 - 25);
        osc.frequency.setValueAtTime(copperFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        break;

      case MaterialType.IRON:
        osc.type = 'triangle';
        const ironFreq = 350 + (Math.random() * 30 - 15);
        osc.frequency.setValueAtTime(ironFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        break;

      case MaterialType.STEEL:
        osc.type = 'sine';
        const steelFreq = 1200 + (Math.random() * 100 - 50);
        osc.frequency.setValueAtTime(steelFreq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        break;

      case MaterialType.WOOD:
      default:
        // Enhanced Wood Sound for Temple Feel
        // Use a mix of sine wave with a quick pitch drop to simulate resonance
        osc.type = 'sine';
        // Slightly lower pitch for a larger temple block feel
        const woodFreq = 550 + (Math.random() * 40 - 20); 
        osc.frequency.setValueAtTime(woodFreq, t);
        osc.frequency.exponentialRampToValueAtTime(woodFreq * 0.8, t + 0.15);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        break;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8);
  } catch (e) {
    console.error("Tap audio playback failed", e);
  }
};

export const playBreakSound = () => {
   try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);

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
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, t);
    masterGain.connect(ctx.destination);

    // Pentatonic ascent for win (G, A, D, E)
    const frequencies = [392.00, 440.00, 587.33, 659.25];
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + index * 0.12);
      
      const startTime = t + index * 0.12;
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(1, startTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8); // Longer decay
      
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 1.0);
    });

  } catch (e) {
    console.error("Win audio playback failed", e);
  }
};

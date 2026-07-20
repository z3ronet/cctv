/**
 * Siren sound synthesizer using Web Audio API
 */

let audioContext: AudioContext | null = null;
let sirenInterval: any = null;

export const playSiren = () => {
  if (sirenInterval) return; // Already playing

  try {
    // Initialize audio context lazily
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    audioContext = new AudioContextClass();
    
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.value = 440; // Frequency in Hz
    osc2.frequency.value = 2;   // LFO Frequency in Hz (rate of siren wobble)

    // LFO modulation of pitch
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 150; // Pitch swing range

    osc2.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Initial quiet volume to not shock the user
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);

    osc1.start();
    osc2.start();

    // Alternate frequency sweeps for that double-tone alarm feel
    let count = 0;
    sirenInterval = setInterval(() => {
      if (!audioContext) return;
      count++;
      if (count % 2 === 0) {
        gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      } else {
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
      }
    }, 500);

    // Store nodes to stop them later
    (sirenInterval as any).osc1 = osc1;
    (sirenInterval as any).osc2 = osc2;
    (sirenInterval as any).gainNode = gainNode;
  } catch (e) {
    console.warn("Web Audio API not supported or user gesture needed.", e);
  }
};

export const stopSiren = () => {
  if (!sirenInterval) return;

  try {
    clearInterval(sirenInterval);
    const { osc1, osc2 } = sirenInterval as any;
    if (osc1) osc1.stop();
    if (osc2) osc2.stop();
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  } catch (e) {
    console.warn("Error stopping siren:", e);
  } finally {
    sirenInterval = null;
  }
};

/**
 * Audio Synthesizer for Sorting Visualizer
 * Uses Web Audio API to produce frequencies proportional to bar values.
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.volume = 0.12;
    this.minFreq = 160;
    this.maxFreq = 950;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNote(val, minVal, maxVal, duration = 60, type = 'sine') {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const normalized = (val - minVal) / (maxVal - minVal || 1);
      const freq = this.minFreq + normalized * (this.maxFreq - this.minFreq);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type; // 'sine', 'triangle'
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      const durSec = Math.max(0.03, duration / 1000);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + durSec);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  playSwapNote(val1, val2, minVal, maxVal, duration = 80) {
    this.playNote(Math.max(val1, val2), minVal, maxVal, duration, 'triangle');
  }

  async playVictorySweep(notesCount = 8) {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    const baseFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    for (let i = 0; i < baseFreqs.length; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreqs[i], now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      await new Promise(r => setTimeout(r, 65));
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

window.soundEngine = new SoundEngine();

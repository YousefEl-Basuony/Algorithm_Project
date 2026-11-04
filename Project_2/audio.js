/**
 * Futuristic Audio Synthesizer for Sorting Visualizer
 * Uses Web Audio API with harmonics and envelope shaping.
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.volume = 0.14;
    this.minFreq = 180;
    this.maxFreq = 920;
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

  playNote(val, minVal, maxVal, duration = 80, type = 'sine') {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const normalized = (val - minVal) / (maxVal - minVal || 1);
      const freq = this.minFreq + normalized * (this.maxFreq - this.minFreq);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      const durSec = Math.max(0.04, duration / 1000);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(this.volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + durSec);
    } catch (e) {
      // Audio context policy
    }
  }

  playSwapNote(val1, val2, minVal, maxVal) {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const highVal = Math.max(val1, val2);
      const normalized = (highVal - minVal) / (maxVal - minVal || 1);
      const freq = this.minFreq + normalized * (this.maxFreq - this.minFreq);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 0.75, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, this.audioCtx.currentTime + 0.09);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 1.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playPivotChime(val, minVal, maxVal) {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const normalized = (val - minVal) / (maxVal - minVal || 1);
      const freq = this.minFreq + normalized * (this.maxFreq - this.minFreq);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 1.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  async playVictorySweep() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    const chords = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    for (let i = 0; i < chords.length; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(chords[i], now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.9, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      await new Promise(r => setTimeout(r, 60));
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

window.soundEngine = new SoundEngine();

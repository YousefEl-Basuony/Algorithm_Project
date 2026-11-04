/**
 * Audio Synthesizer for Graph Visualizer
 * Uses Web Audio API - zero external sound files, works offline.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.25;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.12, gainMultiplier = 1.0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = this.volume * gainMultiplier;
      gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Tactile click when adding node
  nodeAdd() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Smooth connector whoosh for edge
  edgeAdd() {
    this.playTone(320, 'triangle', 0.1, 0.3);
    setTimeout(() => this.playTone(480, 'sine', 0.12, 0.4), 40);
  }

  // Node visited sound (pitch scales with step index)
  visitNode(index = 0) {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    const freq = scale[index % scale.length];
    this.playTone(freq, 'sine', 0.18, 0.45);
  }

  // Enqueue / Push tone (rising)
  enqueue() {
    this.playTone(392, 'triangle', 0.1, 0.3);
    setTimeout(() => this.playTone(523.25, 'triangle', 0.12, 0.35), 40);
  }

  // Dequeue / Pop tone (crisp downward tick)
  dequeue() {
    this.playTone(523.25, 'sine', 0.08, 0.35);
    setTimeout(() => this.playTone(392, 'sine', 0.09, 0.3), 35);
  }

  // Backtrack tone for DFS
  backtrack() {
    this.playTone(220, 'sawtooth', 0.14, 0.2);
  }

  // Traversal complete fanfare chord
  complete() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.35, 0.4);
      }, i * 70);
    });
  }

  // Delete node/edge sound
  delete() {
    this.playTone(180, 'square', 0.08, 0.2);
  }
}

window.soundEngine = new SoundEngine();


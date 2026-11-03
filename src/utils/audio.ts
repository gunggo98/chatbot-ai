// Web Audio API Synthesizer for futuristic cyber UI and acoustic melodies

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Futuristic blip when sending message
  playSend() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  // Futuristic gentle chime when AI responds
  playReceive() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.2);
      });
    } catch {
      // Ignore audio failure
    }
  }

  // Harmonic acoustic simulation inspired by "Shape of My Heart" chords (F#m - E - D - C#m)
  playShapeOfMyHeartMelody() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Arpeggio notes representing acoustic guitar picking
      const arpeggio = [
        { f: 370.0, d: 0.25 }, // F#4
        { f: 440.0, d: 0.25 }, // A4
        { f: 554.37, d: 0.4 }, // C#5
        { f: 440.0, d: 0.25 }, // A4
        { f: 329.63, d: 0.25 }, // E4
        { f: 392.0, d: 0.25 }, // G4
        { f: 493.88, d: 0.4 }, // B4
        { f: 293.66, d: 0.3 }, // D4
        { f: 370.0, d: 0.3 }, // F#4
        { f: 440.0, d: 0.5 }, // A4
      ];

      let curTime = this.ctx.currentTime + 0.05;
      arpeggio.forEach(({ f, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Warm acoustic-like sound using soft sine + lowpass filter
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, curTime);

        gain.gain.setValueAtTime(0.09, curTime);
        gain.gain.exponentialRampToValueAtTime(0.001, curTime + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(curTime);
        osc.stop(curTime + d);
        curTime += d * 0.75;
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundFX();

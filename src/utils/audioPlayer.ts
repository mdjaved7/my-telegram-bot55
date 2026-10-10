// Web Audio synthesizer for realistic audio episode playback preview

class EpisodeAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private gainNode: GainNode | null = null;

  public start(seed = 1) {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
      this.isPlaying = true;

      // Play a warm cinematic pad + gentle narrative cadence pulses
      const baseFreqs = [110, 146.83, 164.81, 220, 293.66];
      const base = baseFreqs[seed % baseFreqs.length];

      const playChordNote = (freq: number, duration: number) => {
        if (!this.ctx || !this.gainNode || !this.isPlaying) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + duration);
      };

      let step = 0;
      playChordNote(base, 1.4);
      this.intervalId = window.setInterval(() => {
        if (!this.isPlaying) return;
        const ratios = [1, 1.25, 1.5, 1.333, 1.125];
        const ratio = ratios[(step + seed) % ratios.length];
        playChordNote(base * ratio, 1.1);
        step++;
      }, 950);
    } catch {
      // Ignore if browser blocks audio without gesture
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

export const audioEngine = new EpisodeAudioEngine();

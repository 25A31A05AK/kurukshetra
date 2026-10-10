import { SoundscapeType } from '../types';

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentNodes: {
    stop?: () => void;
  } = {};
  private isPlaying = false;
  private currentType: SoundscapeType | null = null;
  private currentVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public stopSoundscape() {
    if (this.currentNodes.stop) {
      try {
        this.currentNodes.stop();
      } catch (e) {
        // Safe tear down
      }
      this.currentNodes = {};
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public startSoundscape(type: SoundscapeType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.currentType === type) {
      return;
    }

    this.stopSoundscape();

    if (type === 'rain') {
      this.startRainSynth();
    } else if (type === 'synth') {
      this.startCyberSynthDrone();
    } else if (type === 'theta') {
      this.startThetaBinaural();
    } else if (type === 'cafe') {
      this.startCafeHum();
    }

    this.isPlaying = true;
    this.currentType = type;
  }

  public toggleSoundscape(type: SoundscapeType): boolean {
    if (this.isPlaying && this.currentType === type) {
      this.stopSoundscape();
      return false;
    } else {
      this.startSoundscape(type);
      return true;
    }
  }

  public getStatus(): { isPlaying: boolean; type: SoundscapeType | null } {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }

  // 1. Procedural Pink Noise Cyber Rain
  private startRainSynth() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Generate 5 seconds of buffer pink noise
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = buffer;
    whiteNoiseSource.loop = true;

    // Filter to simulate warm rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    // Subtle LFO modulation for rain wind swell
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.8, ctx.currentTime);

    whiteNoiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoiseSource.start();
    lfo.start();

    this.currentNodes = {
      stop: () => {
        try {
          whiteNoiseSource.stop();
          lfo.stop();
          whiteNoiseSource.disconnect();
          filter.disconnect();
          rainGain.disconnect();
        } catch (e) {
          // ignore
        }
      },
    };
  }

  // 2. Neon Synth Drone
  private startCyberSynthDrone() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    // Minor chord / warm cyber 5th interval: 110Hz (A2), 164.8Hz (E3), 220Hz (A3)
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, ctx.currentTime);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(165.2, ctx.currentTime); // Slight detune for analog warmth

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(55, ctx.currentTime); // Sub bass

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    // LFO for slow breath
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(120, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.25, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.currentNodes = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc3.stop();
          lfo.stop();
          osc1.disconnect();
          osc2.disconnect();
          osc3.disconnect();
          filter.disconnect();
          droneGain.disconnect();
        } catch (e) {
          // ignore
        }
      },
    };
  }

  // 3. Binaural Theta Focus Waves (6Hz differential)
  private startThetaBinaural() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Left channel: 216 Hz
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(216, ctx.currentTime);

    // Right channel: 222 Hz -> Creates 6Hz theta brainwave focus
    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(222, ctx.currentTime);

    // Stereo panners
    const merger = ctx.createChannelMerger(2);
    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel

    const thetaGain = ctx.createGain();
    thetaGain.gain.setValueAtTime(0.3, ctx.currentTime);

    merger.connect(thetaGain);
    thetaGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.currentNodes = {
      stop: () => {
        try {
          oscLeft.stop();
          oscRight.stop();
          oscLeft.disconnect();
          oscRight.disconnect();
          merger.disconnect();
          thetaGain.disconnect();
        } catch (e) {
          // ignore
        }
      },
    };
  }

  // 4. Lo-Fi Cafe Ambience
  private startCafeHum() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(500, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

    const cafeGain = ctx.createGain();
    cafeGain.gain.setValueAtTime(0.4, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(cafeGain);
    cafeGain.connect(this.masterGain);

    noise.start();

    this.currentNodes = {
      stop: () => {
        try {
          noise.stop();
          noise.disconnect();
          bandpass.disconnect();
          cafeGain.disconnect();
        } catch (e) {
          // ignore
        }
      },
    };
  }

  // Play pleasant UI completion chime
  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.09);

        gain.gain.setValueAtTime(0, now + index * 0.09);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.55);
      });
    } catch (e) {
      // Audio not permitted yet
    }
  }

  // Repeating uplifting alarm greeting chime
  private alarmInterval: NodeJS.Timeout | null = null;

  public playAlarmGreeting() {
    this.stopAlarmGreeting();
    this.playSuccessChime();

    // Play repeating cheerful alarm greeting melody every 2.2 seconds
    this.alarmInterval = setInterval(() => {
      try {
        this.initContext();
        if (!this.ctx || !this.masterGain) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Joyful fanfare: E5, G#5, B5, E6
        const alarmNotes = [659.25, 830.61, 987.77, 1318.51];
        alarmNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.5);
        });
      } catch (e) {
        // ignore
      }
    }, 2200);
  }

  public stopAlarmGreeting() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  // Quick tactile click
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }

  // Alert beep for notifications & incomplete dot warnings
  public playAlertBeep() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Two quick pulsing alert tones
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + offset); // A5 note

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.2, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch (e) {
      // ignore
    }
  }

  // Rich celebration chord
  public playCelebrationChord() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Major chord fanfare: C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 0.85);
      });
    } catch (e) {
      // ignore
    }
  }
}

export const soundEngine = new ProceduralAudioEngine();

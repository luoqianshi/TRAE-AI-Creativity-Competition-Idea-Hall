// PROCEDURAL MINDFULNESS AUDIO SYNTHESIS ENGINE
// This engine uses the HTML Web Audio API to procedurally generate soundscapes in real-time,
// avoiding any heavy external static resources while achieving premium atmospheric acoustics.

class AudioEngine {
  private ctx: AudioContext | null = null;

  // Master Gain and Scene gains
  private masterGain: GainNode | null = null;
  private sceneGain: GainNode | null = null;

  // Sound channels gain nodes
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private dropletsGain: GainNode | null = null;
  private fireGain: GainNode | null = null;

  // Synthesis nodes references
  private rainSource: AudioBufferSourceNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windLFO: OscillatorNode | null = null;
  private fireSource: AudioBufferSourceNode | null = null;

  // Loop/Scheduling intervals
  private dropletIntervalId: any = null;
  private fireCrackleIntervalId: any = null;
  private sceneSoundIntervalId: any = null;

  // Active state properties
  private isPlaying: boolean = false;
  private currentSceneId: string = 'ocean';

  // Shared White Noise Buffer (lazy generated)
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Initialized on-demand
  }

  // Get or create AudioContext safely
  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Generate a 2-second loop of white noise
  private getNoiseBuffer(): AudioBuffer {
    const ctx = this.getContext();
    if (this.noiseBuffer) return this.noiseBuffer;

    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // Initialize the routing tree
  private initRouting() {
    const ctx = this.getContext();
    if (this.masterGain) return; // already initialized

    // Master Volume node
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.65, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Scene ambiance Channel Gain
    this.sceneGain = ctx.createGain();
    this.sceneGain.gain.setValueAtTime(0.5, ctx.currentTime);
    this.sceneGain.connect(this.masterGain);

    // Micro environment mixer channels
    this.rainGain = ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, ctx.currentTime);
    this.rainGain.connect(this.masterGain);

    this.windGain = ctx.createGain();
    this.windGain.gain.setValueAtTime(0.0, ctx.currentTime);
    this.windGain.connect(this.masterGain);

    this.dropletsGain = ctx.createGain();
    this.dropletsGain.gain.setValueAtTime(0.0, ctx.currentTime);
    this.dropletsGain.connect(this.masterGain);

    this.fireGain = ctx.createGain();
    this.fireGain.gain.setValueAtTime(0.0, ctx.currentTime);
    this.fireGain.connect(this.masterGain);
  }

  // Master starts or resumes sound engine
  public start() {
    this.isPlaying = true;
    const ctx = this.getContext();
    this.initRouting();

    // Re-create generators if stopped
    this.startRainSynth();
    this.startWindSynth();
    this.startDropletsSchedule();
    this.startFireSynth();
    this.startSceneGenerativeLoop();
  }

  // Master suspends sound engine
  public stop() {
    this.isPlaying = false;
    this.stopRainSynth();
    this.stopWindSynth();
    this.stopDropletsSchedule();
    this.stopFireSynth();
    this.stopSceneGenerativeLoop();

    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  // Set master mixer volume (0 to 100)
  public setMasterVolume(vol: number) {
    this.isPlaying = true;
    this.initRouting();
    const ctx = this.getContext();
    const target = vol / 100;
    this.masterGain?.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
  }

  // Helper to adjust secondary channel volumes
  public setChannelVolume(channel: 'rain' | 'wind' | 'droplet' | 'fire' | 'scene', vol: number, active: boolean) {
    this.initRouting();
    const ctx = this.getContext();
    const gainValue = active ? (vol / 100) : 0.0;
    
    let targetNode: GainNode | null = null;
    if (channel === 'rain') targetNode = this.rainGain;
    else if (channel === 'wind') targetNode = this.windGain;
    else if (channel === 'droplet') targetNode = this.dropletsGain;
    else if (channel === 'fire') targetNode = this.fireGain;
    else if (channel === 'scene') targetNode = this.sceneGain;

    if (targetNode) {
      targetNode.gain.setTargetAtTime(gainValue * 0.8, ctx.currentTime, 0.15);
    }
  }

  // ==========================================
  // PROCEDURAL CHANNEL GENERATORS
  // ==========================================

  // Synthesize rain using filtered white noise
  private startRainSynth() {
    if (!this.isPlaying) return;
    this.stopRainSynth();

    const ctx = this.getContext();
    const noise = this.getNoiseBuffer();

    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;

    // Filter to make it sound like rain (shaping high & mid band spectrum)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2200, ctx.currentTime);

    // Dynamic wave gain to make rain sound gusty and alive
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.85, ctx.currentTime);

    // Simple LFO to fluctuate rain volume slightly
    const rainLFO = ctx.createOscillator();
    rainLFO.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow swell
    const rainLFOGain = ctx.createGain();
    rainLFOGain.gain.setValueAtTime(0.15, ctx.currentTime);

    rainLFO.connect(rainLFOGain);
    rainLFOGain.connect(waveGain.gain);

    // Hook up channels
    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(waveGain);
    if (this.rainGain) {
      waveGain.connect(this.rainGain);
    }

    source.start(0);
    rainLFO.start(0);

    this.rainSource = source;
  }

  private stopRainSynth() {
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch (e) {}
      this.rainSource = null;
    }
  }

  // Synthesize sweeping organic wind
  private startWindSynth() {
    if (!this.isPlaying) return;
    this.stopWindSynth();

    const ctx = this.getContext();
    const noise = this.getNoiseBuffer();

    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;

    // Narrow resonant bandpass filter swooshes through frequencies
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(400, ctx.currentTime);
    windFilter.Q.setValueAtTime(5.5, ctx.currentTime); // High resonance gives the hollow wind whistle howl

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, ctx.currentTime);

    // LFO to swing wind filter frequency back and forth
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.07, ctx.currentTime); // 13 seconds sweeps
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(280, ctx.currentTime); // swing 280Hz above and below base

    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    // Feed and build path
    source.connect(windFilter);
    windFilter.connect(lowpass);
    if (this.windGain) {
      lowpass.connect(this.windGain);
    }

    source.start(0);
    lfo.start(0);

    this.windSource = source;
    this.windLFO = lfo;
  }

  private stopWindSynth() {
    if (this.windSource) {
      try { this.windSource.stop(); } catch (e) {}
      this.windSource = null;
    }
    if (this.windLFO) {
      try { this.windLFO.stop(); } catch (e) {}
      this.windLFO = null;
    }
  }

  // Periodic random droplets synthesis scheduler
  private startDropletsSchedule() {
    this.stopDropletsSchedule();
    if (!this.isPlaying) return;

    // Periodically trigger a drop of water sound procedurally
    const triggerDrop = () => {
      if (!this.isPlaying) return;
      const ctx = this.getContext();
      this.initRouting();

      const time = ctx.currentTime;
      // Quick pitch swept oscillator
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      
      // Bloop sweep: 1500Hz down to 280Hz in 0.12 seconds
      osc.frequency.setValueAtTime(1550, time);
      osc.frequency.exponentialRampToValueAtTime(320, time + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.6, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1600, time);

      osc.connect(gain);
      gain.connect(lowpass);
      if (this.dropletsGain) {
        lowpass.connect(this.dropletsGain);
      }

      osc.start(time);
      osc.stop(time + 0.2);

      // Re-schedule randomly (every 1.5 to 5.5 seconds)
      const nextDelay = 1500 + Math.random() * 4000;
      this.dropletIntervalId = setTimeout(triggerDrop, nextDelay);
    };

    triggerDrop();
  }

  private stopDropletsSchedule() {
    if (this.dropletIntervalId) {
      clearTimeout(this.dropletIntervalId);
      this.dropletIntervalId = null;
    }
  }

  // Procedural wood campfire burning + roaring glowing embers
  private startFireSynth() {
    if (!this.isPlaying) return;
    this.stopFireSynth();

    const ctx = this.getContext();
    const noise = this.getNoiseBuffer();

    // Element 1: Glowing warm ember rumble
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = noise;
    rumbleSource.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(85, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(1.2, ctx.currentTime);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    if (this.fireGain) {
      rumbleGain.connect(this.fireGain);
    }

    rumbleSource.start(0);
    this.fireSource = rumbleSource;

    // Element 2: Quick random crackling pops
    const triggerCrackle = () => {
      if (!this.isPlaying) return;
      
      const time = ctx.currentTime;
      // Synthesize micro snap pop
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 2500, time);

      // Super high pass filtered impulse buffer as an option, or just a tiny resonant spike
      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0, time);
      popGain.gain.linearRampToValueAtTime(Math.random() * 0.16 + 0.05, time + 0.001);
      popGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(4000, time);

      osc.connect(popGain);
      popGain.connect(highpass);
      if (this.fireGain) {
        highpass.connect(this.fireGain);
      }

      osc.start(time);
      osc.stop(time + 0.03);

      // Crackle rate fluctuates organic: (50ms - 350ms)
      const nextCrackle = 40 + Math.random() * 280;
      this.fireCrackleIntervalId = setTimeout(triggerCrackle, nextCrackle);
    };

    triggerCrackle();
  }

  private stopFireSynth() {
    if (this.fireSource) {
      try { this.fireSource.stop(); } catch (e) {}
      this.fireSource = null;
    }
    if (this.fireCrackleIntervalId) {
      clearTimeout(this.fireCrackleIntervalId);
      this.fireCrackleIntervalId = null;
    }
  }

  // ==========================================
  // GENERATIVE SCENE MUSIC BACKGROUNDS
  // Plays stylized resonant, soothing, infinite chords & drones matching the scenes
  // ==========================================
  public transitionToScene(sceneId: string) {
    this.currentSceneId = sceneId;
    if (!this.isPlaying) return;

    // Restart the scene loop to reflect new tone instantly
    this.startSceneGenerativeLoop();
  }

  private startSceneGenerativeLoop() {
    this.stopSceneGenerativeLoop();
    if (!this.isPlaying) return;

    const ctx = this.getContext();
    this.initRouting();

    // Generatively play tranquil elements based on scene
    const playNotesForScene = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // Select scales / frequency sets
      let frequencies: number[] = [220, 275, 330, 440]; // Base A minor / pentatonic set
      let waveType: OscillatorType = 'sine';
      let delayNext = 4000;
      let noteVolume = 0.15;
      let noteDuration = 3.5;

      if (this.currentSceneId === 'ocean') {
        // Deep Sea: Oceanic swelling 5ths and 7ths, very slow, smooth
        frequencies = [110, 165, 220, 293.66, 329.63, 440]; 
        waveType = 'sine';
        delayNext = 4500 + Math.random() * 2000;
        noteVolume = 0.18;
        noteDuration = 5.0;
      } 
      else if (this.currentSceneId === 'rain') {
        // Rainy Night: melancholic, dark ambient vibes
        frequencies = [146.83, 196.00, 220.00, 261.63, 293.66, 392.00]; // G minor
        waveType = 'triangle';
        delayNext = 3000 + Math.random() * 1500;
        noteVolume = 0.08;
        noteDuration = 3.0;
      }
      else if (this.currentSceneId === 'forest') {
        // Ancient Forest: resonant tibetan singing bowls
        frequencies = [174.61, 261.63, 349.23, 523.25]; // Resonances of F
        waveType = 'sine';
        delayNext = 6000 + Math.random() * 3000;
        noteVolume = 0.22;
        noteDuration = 8.0;
      }
      else if (this.currentSceneId === 'moonlight') {
        // Moonlight water: sparkling major, pure silver hues
        frequencies = [196.00, 246.94, 293.66, 392.00, 493.88, 587.33]; // G major
        waveType = 'sine';
        delayNext = 2800 + Math.random() * 1200;
        noteVolume = 0.11;
        noteDuration = 3.2;
      }
      else if (this.currentSceneId === 'kyoto') {
        // Kyoto Echoes: Japanese pentatonic scales (In-sen or Hon-kumoi-joshi)
        frequencies = [146.83, 155.56, 220.00, 233.08, 293.66, 311.13, 440.00]; 
        waveType = 'sine';
        delayNext = 5000 + Math.random() * 3000;
        noteVolume = 0.20;
        noteDuration = 6.0;

        // Schedule an occasional deep zen bell strike
        if (Math.random() < 0.35) {
          this.triggerKyotoBell(now);
        }
      }
      else if (this.currentSceneId === 'ether-sleep') {
        // Golden 528Hz Solfeggio Love freq
        frequencies = [132, 264, 528]; 
        waveType = 'sine';
        delayNext = 3500 + Math.random() * 1000;
        noteVolume = 0.25;
        noteDuration = 5.0;
      }
      else {
        // Default warm relaxing colors
        frequencies = [196.00, 220.00, 261.63, 329.63, 392.00];
        waveType = 'sine';
        delayNext = 4000;
        noteVolume = 0.12;
        noteDuration = 3.5;
      }

      // Procedurally spawn one or two random chord notes
      const playNote = (pitch: number, startDelay: number) => {
        const osc = ctx.createOscillator();
        osc.type = waveType;
        osc.frequency.setValueAtTime(pitch, now + startDelay);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, now + startDelay);
        // Soft slow swell attack
        noteGain.gain.linearRampToValueAtTime(noteVolume, now + startDelay + 1.2);
        // Exponetial decay release
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + noteDuration);

        // Lowpass filter to ensure absolute warm, rounded, non-piercing high tones
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now + startDelay);

        osc.connect(noteGain);
        noteGain.connect(filter);
        if (this.sceneGain) {
          filter.connect(this.sceneGain);
        }

        osc.start(now + startDelay);
        osc.stop(now + startDelay + noteDuration + 0.5);
      };

      // Play 1st note
      const rndPitch1 = frequencies[Math.floor(Math.random() * frequencies.length)];
      playNote(rndPitch1, 0);

      // Play 2nd harmonious octave or 5th note soon after
      if (Math.random() < 0.65) {
        const rndPitch2 = frequencies[Math.floor(Math.random() * frequencies.length)];
        if (rndPitch2 !== rndPitch1) {
          playNote(rndPitch2, Math.random() * 0.8 + 0.3);
        }
      }

      this.sceneSoundIntervalId = setTimeout(playNotesForScene, delayNext);
    };

    playNotesForScene();
  }

  // Deep resonant Kyoto temple bell synthesis
  private triggerKyotoBell(time: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.initRouting();

    // Combine fundamental bell frequency (88Hz) and several harmonics for rich metal ring
    const harmonics = [88, 176.3, 264.5, 353, 442, 620, 880];
    const gains = [0.4, 0.25, 0.18, 0.12, 0.08, 0.04, 0.02];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      // Decisive punchy attack
      gain.gain.linearRampToValueAtTime(gains[idx] * 0.5, time + 0.02);
      // Long metallic ring decay
      gain.gain.exponentialRampToValueAtTime(0.001, time + 9.5 - (idx * 0.8));

      osc.connect(gain);
      if (this.sceneGain) {
        gain.connect(this.sceneGain);
      }

      osc.start(time);
      osc.stop(time + 10.0);
    });
  }

  private stopSceneGenerativeLoop() {
    if (this.sceneSoundIntervalId) {
      clearTimeout(this.sceneSoundIntervalId);
      this.sceneSoundIntervalId = null;
    }
  }
}

// Export safe singleton audio engine
export const ambientAudioEngine = new AudioEngine();

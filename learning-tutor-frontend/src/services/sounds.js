/**
 * Ambient Sounds Service
 * Provides background sounds for focused coding sessions
 * Uses Web Audio API to generate reliable ambient sounds
 */

// Audio context
let audioContext = null;
let currentNodes = [];
let masterGain = null;
let currentSound = null;
let volume = 0.5;
let isPlaying = false;

// Sound configurations - Forest and Ocean only
const AMBIENT_SOUNDS = {
  forest: {
    name: 'Forest',
    icon: '🌲',
    description: 'Birds and nature sounds',
    generator: createForestSound
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    description: 'Waves on the shore',
    generator: createOceanSound
  }
};

/**
 * Initialize audio context
 */
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = volume;
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Create noise buffer
 */
function createNoiseBuffer(duration = 2) {
  const ctx = initAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Create filtered noise
 */
function createFilteredNoise(filterType, frequency, Q = 1) {
  const ctx = initAudioContext();
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(2);
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = frequency;
  filter.Q.value = Q;

  noise.connect(filter);
  return { source: noise, output: filter };
}

// === SOUND GENERATORS ===

function createRainSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Light rain - high frequency filtered noise
  const lightRain = createFilteredNoise('highpass', 8000, 0.5);
  const lightGain = ctx.createGain();
  lightGain.gain.value = 0.15;
  lightRain.output.connect(lightGain);
  lightGain.connect(masterGain);
  lightRain.source.start();
  nodes.push(lightRain.source, lightGain);

  // Heavy rain - mid frequency
  const heavyRain = createFilteredNoise('bandpass', 3000, 0.8);
  const heavyGain = ctx.createGain();
  heavyGain.gain.value = 0.1;
  heavyRain.output.connect(heavyGain);
  heavyGain.connect(masterGain);
  heavyRain.source.start();
  nodes.push(heavyRain.source, heavyGain);

  return nodes;
}

function createForestSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Wind through leaves
  const wind = createFilteredNoise('bandpass', 400, 2);
  const windGain = ctx.createGain();
  windGain.gain.value = 0.08;
  wind.output.connect(windGain);
  windGain.connect(masterGain);
  wind.source.start();
  nodes.push(wind.source, windGain);

  // Bird chirps using oscillators
  function createBirdChirp() {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2000 + Math.random() * 2000;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();

    // Random chirping
    setInterval(() => {
      if (isPlaying && Math.random() > 0.7) {
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.frequency.setValueAtTime(1800 + Math.random() * 2500, now);
      }
    }, 500);

    return osc;
  }

  nodes.push(createBirdChirp(), createBirdChirp());
  return nodes;
}

function createCafeSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Background chatter - filtered noise
  const chatter = createFilteredNoise('bandpass', 800, 1.5);
  const chatterGain = ctx.createGain();
  chatterGain.gain.value = 0.12;
  chatter.output.connect(chatterGain);
  chatterGain.connect(masterGain);
  chatter.source.start();
  nodes.push(chatter.source, chatterGain);

  // Occasional clinks
  const clink = ctx.createOscillator();
  const clinkGain = ctx.createGain();
  clink.type = 'sine';
  clink.frequency.value = 3000;
  clinkGain.gain.value = 0;
  clink.connect(clinkGain);
  clinkGain.connect(masterGain);
  clink.start();

  setInterval(() => {
    if (isPlaying && Math.random() > 0.85) {
      const now = ctx.currentTime;
      clinkGain.gain.setValueAtTime(0.03, now);
      clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    }
  }, 800);

  nodes.push(clink, clinkGain);
  return nodes;
}

function createFireSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Crackle base
  const crackle = createFilteredNoise('lowpass', 2000, 0.5);
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.15;
  crackle.output.connect(crackleGain);
  crackleGain.connect(masterGain);
  crackle.source.start();
  nodes.push(crackle.source, crackleGain);

  // Pops
  const pop = createFilteredNoise('bandpass', 800, 3);
  const popGain = ctx.createGain();
  popGain.gain.value = 0;
  pop.output.connect(popGain);
  popGain.connect(masterGain);
  pop.source.start();

  setInterval(() => {
    if (isPlaying && Math.random() > 0.8) {
      const now = ctx.currentTime;
      popGain.gain.setValueAtTime(0.2, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }
  }, 200);

  nodes.push(pop.source, popGain);
  return nodes;
}

function createOceanSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Constant wave sound
  const waves = createFilteredNoise('lowpass', 500, 0.7);
  const wavesGain = ctx.createGain();
  wavesGain.gain.value = 0.2;
  waves.output.connect(wavesGain);
  wavesGain.connect(masterGain);
  waves.source.start();
  nodes.push(waves.source, wavesGain);

  // Wave crashes - modulated
  const crash = createFilteredNoise('bandpass', 1000, 1);
  const crashGain = ctx.createGain();
  crashGain.gain.value = 0;
  crash.output.connect(crashGain);
  crashGain.connect(masterGain);
  crash.source.start();

  // Simulate waves coming in
  let phase = 0;
  setInterval(() => {
    if (isPlaying) {
      phase += 0.1;
      const waveIntensity = (Math.sin(phase) + 1) / 2 * 0.15;
      crashGain.gain.setTargetAtTime(waveIntensity, ctx.currentTime, 0.5);
    }
  }, 100);

  nodes.push(crash.source, crashGain);
  return nodes;
}

function createThunderSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Rain base
  const rain = createFilteredNoise('highpass', 5000, 0.5);
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.12;
  rain.output.connect(rainGain);
  rainGain.connect(masterGain);
  rain.source.start();
  nodes.push(rain.source, rainGain);

  // Thunder rumble
  const thunder = createFilteredNoise('lowpass', 100, 1);
  const thunderGain = ctx.createGain();
  thunderGain.gain.value = 0;
  thunder.output.connect(thunderGain);
  thunderGain.connect(masterGain);
  thunder.source.start();

  setInterval(() => {
    if (isPlaying && Math.random() > 0.92) {
      const now = ctx.currentTime;
      thunderGain.gain.setValueAtTime(0.4, now);
      thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 3);
    }
  }, 1000);

  nodes.push(thunder.source, thunderGain);
  return nodes;
}

function createWindSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Main wind
  const wind = createFilteredNoise('bandpass', 300, 1);
  const windGain = ctx.createGain();
  windGain.gain.value = 0.15;
  wind.output.connect(windGain);
  windGain.connect(masterGain);
  wind.source.start();
  nodes.push(wind.source, windGain);

  // Gusts - modulated amplitude
  let gustPhase = 0;
  setInterval(() => {
    if (isPlaying) {
      gustPhase += 0.05;
      const gustIntensity = 0.1 + (Math.sin(gustPhase) + Math.sin(gustPhase * 0.7)) / 4 * 0.1;
      windGain.gain.setTargetAtTime(gustIntensity, ctx.currentTime, 0.3);
    }
  }, 100);

  return nodes;
}

function createNightSound() {
  const ctx = initAudioContext();
  const nodes = [];

  // Cricket base
  const cricket1 = ctx.createOscillator();
  const cricket1Gain = ctx.createGain();
  cricket1.type = 'sine';
  cricket1.frequency.value = 4500;
  cricket1Gain.gain.value = 0;
  cricket1.connect(cricket1Gain);
  cricket1Gain.connect(masterGain);
  cricket1.start();

  // Cricket chirping pattern
  setInterval(() => {
    if (isPlaying) {
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        cricket1Gain.gain.setValueAtTime(0.03, now + i * 0.08);
        cricket1Gain.gain.setValueAtTime(0, now + i * 0.08 + 0.04);
      }
    }
  }, 400);

  // Second cricket
  const cricket2 = ctx.createOscillator();
  const cricket2Gain = ctx.createGain();
  cricket2.type = 'sine';
  cricket2.frequency.value = 5000;
  cricket2Gain.gain.value = 0;
  cricket2.connect(cricket2Gain);
  cricket2Gain.connect(masterGain);
  cricket2.start();

  setInterval(() => {
    if (isPlaying && Math.random() > 0.5) {
      const now = ctx.currentTime;
      cricket2Gain.gain.setValueAtTime(0.025, now);
      cricket2Gain.gain.setValueAtTime(0, now + 0.05);
    }
  }, 300);

  // Ambient night air
  const air = createFilteredNoise('lowpass', 200, 0.5);
  const airGain = ctx.createGain();
  airGain.gain.value = 0.05;
  air.output.connect(airGain);
  airGain.connect(masterGain);
  air.source.start();

  nodes.push(cricket1, cricket1Gain, cricket2, cricket2Gain, air.source, airGain);
  return nodes;
}

// === PUBLIC API ===

/**
 * Get all available sounds
 */
export function getAvailableSounds() {
  return Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => ({
    id: key,
    name: sound.name,
    icon: sound.icon,
    description: sound.description
  }));
}

/**
 * Play a specific ambient sound
 */
export function playSound(soundId) {
  const sound = AMBIENT_SOUNDS[soundId];
  if (!sound) {
    console.error(`Sound not found: ${soundId}`);
    return false;
  }

  // Stop current sound if playing
  stopSound();

  try {
    initAudioContext();
    currentNodes = sound.generator();
    currentSound = soundId;
    isPlaying = true;
    console.log(`Playing: ${sound.name}`);
    return true;
  } catch (err) {
    console.error('Error creating sound:', err);
    return false;
  }
}

/**
 * Stop the current sound
 */
export function stopSound() {
  currentNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {
      // Node might already be stopped
    }
  });
  currentNodes = [];
  currentSound = null;
  isPlaying = false;
}

/**
 * Toggle sound play/pause
 */
export function toggleSound() {
  if (!currentSound) return false;

  if (isPlaying) {
    stopSound();
    return false;
  }
  return true;
}

/**
 * Set volume (0-1)
 */
export function setVolume(newVolume) {
  volume = Math.max(0, Math.min(1, newVolume));
  if (masterGain) {
    masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
  }
  return volume;
}

/**
 * Get current volume
 */
export function getVolume() {
  return volume;
}

/**
 * Check if sound is playing
 */
export function isSoundPlaying() {
  return isPlaying;
}

/**
 * Get current sound id
 */
export function getCurrentSound() {
  return currentSound;
}

/**
 * Get current sound info
 */
export function getCurrentSoundInfo() {
  if (!currentSound) return null;
  const sound = AMBIENT_SOUNDS[currentSound];
  return {
    id: currentSound,
    name: sound.name,
    icon: sound.icon,
    description: sound.description,
    isPlaying,
    volume
  };
}

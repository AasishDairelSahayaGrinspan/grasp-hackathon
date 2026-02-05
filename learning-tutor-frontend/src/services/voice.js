/**
 * Voice Service
 * Text-to-speech using Web Speech API with female voice
 */

let selectedVoice = null;

/**
 * Initialize voices (must be called after voices are loaded)
 */
export function initVoices() {
  return new Promise((resolve) => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();

      // Prefer female voices - look for common female voice names
      const femaleVoiceNames = ['samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'female', 'woman'];

      // Try to find a female English voice
      selectedVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        return voice.lang.startsWith('en') &&
               femaleVoiceNames.some(fn => name.includes(fn));
      });

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }

      // Last fallback - any voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      resolve(selectedVoice);
    };

    // Chrome loads voices async
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  });
}

/**
 * Speak text using female voice
 */
export function speak(text) {
  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.1; // Slightly higher pitch
  utterance.volume = 1;

  speechSynthesis.speak(utterance);

  return utterance;
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
  speechSynthesis.cancel();
}

/**
 * Check if currently speaking
 */
export function isSpeaking() {
  return speechSynthesis.speaking;
}

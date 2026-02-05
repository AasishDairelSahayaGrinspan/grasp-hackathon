/**
 * Progress Storage Hook
 * Stores learning progress in localStorage
 */

// Storage key
const STORAGE_KEY = 'learning_tutor_progress';

/**
 * Get progress from localStorage
 */
export function getProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }

  // Default progress structure
  return {
    totalAnalyses: 0,
    hintsUsed: 0,
    timeSpent: 0, // in seconds
    languageStats: {
      python: { analyses: 0, hintsUsed: 0 },
      c: { analyses: 0, hintsUsed: 0 },
      cpp: { analyses: 0, hintsUsed: 0 },
      java: { analyses: 0, hintsUsed: 0 }
    },
    levelProgress: {
      basic: 0,
      moderate: 0,
      complex: 0
    },
    lastSession: null
  };
}

/**
 * Save progress to localStorage
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

/**
 * Update progress after an analysis
 */
export function updateProgress(language, level, hintLevel) {
  const progress = getProgress();

  progress.totalAnalyses += 1;
  progress.hintsUsed += hintLevel;
  progress.languageStats[language].analyses += 1;
  progress.languageStats[language].hintsUsed += hintLevel;
  progress.levelProgress[level] += 1;
  progress.lastSession = new Date().toISOString();

  saveProgress(progress);
  return progress;
}

/**
 * Add time spent
 */
export function addTimeSpent(seconds) {
  const progress = getProgress();
  progress.timeSpent += seconds;
  saveProgress(progress);
  return progress;
}

/**
 * Format time as readable string
 */
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Reset all progress
 */
export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return getProgress();
}

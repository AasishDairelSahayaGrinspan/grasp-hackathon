/**
 * Progress & Learning State Storage
 * Stores learning progress and pedagogical state in localStorage
 *
 * Learning State tracks:
 * - Concepts the student has struggled with
 * - Concepts the student has mastered
 * - Session-specific hints and errors
 * - Previous explanations for context
 */

// Storage keys
const STORAGE_KEY = 'learning_tutor_progress';
const LEARNING_STATE_KEY = 'learning_tutor_state';

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
 * Get learning state from localStorage
 * This tracks pedagogical information for better tutoring
 */
export function getLearningState() {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load learning state:', e);
  }

  // Default learning state structure
  return {
    strugglingConcepts: [],        // Concepts student has had trouble with
    masteredConcepts: [],          // Concepts student has shown understanding of
    hintsGivenThisSession: 0,      // Hints requested in current session
    sameErrorRepeated: false,      // Flag for repeated errors
    previousExplanations: [],      // Last few explanations for context
    lastErrorType: null,           // Track if same error type repeats
    currentUnderstanding: 'learning', // 'struggling', 'learning', 'confident'
    sessionStartTime: new Date().toISOString(),
    errorHistory: []               // Recent error types for pattern detection
  };
}

/**
 * Save learning state to localStorage
 */
export function saveLearningState(state) {
  try {
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save learning state:', e);
  }
}

/**
 * Update learning state after AI response
 * @param {Object} response - The AI response containing conceptsTaught, etc.
 * @param {string} errorType - Type of error if detected
 * @param {boolean} wasHintRequest - Whether user asked for a hint
 */
export function updateLearningState(response, errorType = null, wasHintRequest = false) {
  const state = getLearningState();

  // Track hint requests
  if (wasHintRequest) {
    state.hintsGivenThisSession += 1;
  }

  // Track error patterns
  if (errorType) {
    state.errorHistory.push(errorType);
    // Keep only last 10 errors
    if (state.errorHistory.length > 10) {
      state.errorHistory.shift();
    }

    // Check if same error is repeating
    if (state.lastErrorType === errorType) {
      state.sameErrorRepeated = true;
      // Add to struggling concepts if repeating
      if (!state.strugglingConcepts.includes(errorType)) {
        state.strugglingConcepts.push(errorType);
      }
    } else {
      state.sameErrorRepeated = false;
    }
    state.lastErrorType = errorType;
  }

  // Track concepts taught by AI
  if (response?.conceptsTaught && Array.isArray(response.conceptsTaught)) {
    response.conceptsTaught.forEach(concept => {
      // If concept was in struggling, move to mastered after multiple exposures
      const strugglingIndex = state.strugglingConcepts.indexOf(concept);
      if (strugglingIndex > -1) {
        // Count how many times this concept has been explained
        const explanationCount = state.previousExplanations.filter(e =>
          e.toLowerCase().includes(concept.toLowerCase())
        ).length;

        if (explanationCount >= 3) {
          // Student has seen this concept multiple times, might be mastering it
          state.strugglingConcepts.splice(strugglingIndex, 1);
          if (!state.masteredConcepts.includes(concept)) {
            state.masteredConcepts.push(concept);
          }
        }
      }
    });
  }

  // Store summary of explanation for context
  if (response?.reply) {
    const summary = response.reply.substring(0, 100) + '...';
    state.previousExplanations.push(summary);
    // Keep only last 5 explanations
    if (state.previousExplanations.length > 5) {
      state.previousExplanations.shift();
    }
  }

  // Update understanding level based on patterns
  if (state.hintsGivenThisSession > 5 || state.sameErrorRepeated) {
    state.currentUnderstanding = 'struggling';
  } else if (state.masteredConcepts.length > state.strugglingConcepts.length) {
    state.currentUnderstanding = 'confident';
  } else {
    state.currentUnderstanding = 'learning';
  }

  saveLearningState(state);
  return state;
}

/**
 * Reset session-specific learning state (keep mastered concepts)
 */
export function resetSessionState() {
  const state = getLearningState();
  state.hintsGivenThisSession = 0;
  state.sameErrorRepeated = false;
  state.previousExplanations = [];
  state.lastErrorType = null;
  state.errorHistory = [];
  state.sessionStartTime = new Date().toISOString();
  saveLearningState(state);
  return state;
}

/**
 * Mark a concept as mastered (user confirmed they understand)
 */
export function markConceptMastered(concept) {
  const state = getLearningState();
  if (!state.masteredConcepts.includes(concept)) {
    state.masteredConcepts.push(concept);
  }
  // Remove from struggling if present
  const index = state.strugglingConcepts.indexOf(concept);
  if (index > -1) {
    state.strugglingConcepts.splice(index, 1);
  }
  saveLearningState(state);
  return state;
}

/**
 * Get a summary of learning state for display
 */
export function getLearningStateSummary() {
  const state = getLearningState();
  return {
    understanding: state.currentUnderstanding,
    hintsThisSession: state.hintsGivenThisSession,
    strugglingCount: state.strugglingConcepts.length,
    masteredCount: state.masteredConcepts.length,
    topStruggle: state.strugglingConcepts[0] || null
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

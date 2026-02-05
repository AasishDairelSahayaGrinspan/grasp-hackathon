/**
 * Request Validators
 *
 * Validates incoming requests to ensure they have correct data
 */

// Supported languages
const SUPPORTED_LANGUAGES = ['python', 'c', 'cpp', 'java'];

// Difficulty levels
const SUPPORTED_LEVELS = ['basic', 'moderate', 'complex'];

// Maximum hint level
const MAX_HINT_LEVEL = 5;

/**
 * Validates the analyze request body
 * Returns { valid: boolean, errors: string[] }
 */
function validateAnalyzeRequest(body) {
  const errors = [];

  // Check if code exists and is a string
  if (!body.code) {
    errors.push('code is required');
  } else if (typeof body.code !== 'string') {
    errors.push('code must be a string');
  } else if (body.code.trim().length === 0) {
    errors.push('code cannot be empty');
  }

  // Check if language is valid
  if (!body.language) {
    errors.push('language is required');
  } else if (!SUPPORTED_LANGUAGES.includes(body.language.toLowerCase())) {
    errors.push(`language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  // Check if level is valid
  if (!body.level) {
    errors.push('level is required');
  } else if (!SUPPORTED_LEVELS.includes(body.level.toLowerCase())) {
    errors.push(`level must be one of: ${SUPPORTED_LEVELS.join(', ')}`);
  }

  // Check hint level if provided
  if (body.hintLevel !== undefined) {
    const hint = parseInt(body.hintLevel);
    if (isNaN(hint) || hint < 1 || hint > MAX_HINT_LEVEL) {
      errors.push(`hintLevel must be between 1 and ${MAX_HINT_LEVEL}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normalizes language names to standard format
 * e.g., "Python" -> "python", "C++" -> "cpp"
 */
function normalizeLanguage(language) {
  const languageMap = {
    'python': 'python',
    'py': 'python',
    'c': 'c',
    'cpp': 'cpp',
    'c++': 'cpp',
    'java': 'java'
  };

  return languageMap[language.toLowerCase()] || language.toLowerCase();
}

module.exports = {
  validateAnalyzeRequest,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LEVELS,
  MAX_HINT_LEVEL
};

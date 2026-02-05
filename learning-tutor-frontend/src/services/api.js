/**
 * API Service
 * Handles all communication with the backend
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check if backend is running
 */
export async function checkHealth() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend is not running');
  }
}

/**
 * Analyze code - the main tutoring function
 * @param {Object} params - { code, language, level, hintLevel, userQuestion }
 */
export async function analyzeCode({ code, language, level, hintLevel, userQuestion }) {
  try {
    const response = await api.post('/analyze', {
      code,
      language,
      level,
      hintLevel,
      userQuestion
    });
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Analysis failed');
    }
    throw new Error('Failed to connect to tutor backend');
  }
}

export default api;

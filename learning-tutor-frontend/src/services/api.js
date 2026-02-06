/**
 * API Service
 * Handles all communication with the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://grasp-hackathon.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
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
 * @param {Object} params - { code, language, level, hintLevel, userQuestion, learningState }
 * learningState includes: strugglingConcepts, masteredConcepts, hintsGivenThisSession, etc.
 */
export async function analyzeCode({ code, language, level, hintLevel, userQuestion, learningState }) {
  try {
    console.log('🔍 Making API call to:', API_BASE_URL + '/analyze');
    console.log('📤 Request data:', { code, language, level, hintLevel, userQuestion, learningState });

    const response = await api.post('/analyze', {
      code,
      language,
      level,
      hintLevel,
      userQuestion,
      learningState
    });

    console.log('✅ API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    if (error.response?.data) {
      console.error('❌ Response data:', error.response.data);
      throw new Error(error.response.data.error || 'Analysis failed');
    }
    console.error('❌ Network error:', error.message);
    throw new Error('Failed to connect to tutor backend: ' + error.message);
  }
}

/**
 * Run code - execute code and get output
 * @param {Object} params - { code, language, input }
 */
export async function runCode({ code, language, input }) {
  try {
    const response = await api.post('/run', {
      code,
      language,
      input
    });
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Execution failed');
    }
    throw new Error('Failed to execute code');
  }
}

/**
 * Check available compilers
 */
export async function checkCompilers() {
  try {
    const response = await api.get('/run/compilers');
    return response.data;
  } catch (error) {
    throw new Error('Failed to check compilers');
  }
}

/**
 * Analyze a problem screenshot
 * @param {File} imageFile
 * @param {string} level
 */
export async function analyzeProblemImage(imageFile, level = 'basic') {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('level', level);

    const response = await api.post('/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Image analysis failed');
    }
    throw new Error('Failed to analyze image');
  }
}

export default api;

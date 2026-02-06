/**
 * Image Analyzer
 *
 * Uses OCR to extract text from a problem screenshot,
 * then cleans up UI noise and returns meaningful problem text.
 */

const Tesseract = require('tesseract.js');

const MAX_TEXT_LENGTH = 2000;

// Common UI elements to filter out from OCR results
const UI_NOISE_PATTERNS = [
  // Browser UI
  /\b(chrome|firefox|safari|edge|browser)\b/gi,
  /\b(tab|tabs|bookmark|bookmarks)\b/gi,
  /\b(register|login|sign\s*in|sign\s*up|logout)\b/gi,
  /\b(premium|subscribe|upgrade)\b/gi,
  // LeetCode specific UI
  /\b(submit|run\s*code|testcase|accepted|wrong\s*answer)\b/gi,
  /\b(problem\s*list|solutions?|discuss|editorial)\b/gi,
  /\b(easy|medium|hard)\s*(problem)?\b/gi,
  // Common symbols and fragments
  /[©®™@]/g,
  /\b(www\.|\.com|\.org|\.io|http|https)\b/gi,
  // Random short fragments (likely OCR noise)
  /\b[a-z]{1,2}\b/gi,
  // Multiple spaces/special chars
  /[<>|\\\/]{2,}/g,
];

// Keywords that indicate actual problem content
const PROBLEM_KEYWORDS = [
  'given', 'return', 'find', 'determine', 'calculate', 'check',
  'array', 'string', 'integer', 'number', 'list', 'matrix',
  'input', 'output', 'example', 'constraint', 'note',
  'sorted', 'ascending', 'descending', 'maximum', 'minimum',
  'sum', 'product', 'count', 'index', 'element', 'value',
  'true', 'false', 'boolean', 'valid', 'invalid'
];

/**
 * Clean OCR text by removing UI noise and keeping problem content
 */
function cleanOCRText(rawText) {
  let text = rawText;

  // Apply noise filters
  for (const pattern of UI_NOISE_PATTERNS) {
    text = text.replace(pattern, ' ');
  }

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Check if remaining text has problem-like content
  const lowerText = text.toLowerCase();
  const hasProblemContent = PROBLEM_KEYWORDS.some(keyword =>
    lowerText.includes(keyword)
  );

  // If text is too short or lacks problem keywords, it's probably noise
  if (text.length < 50 || !hasProblemContent) {
    return '';
  }

  return text.slice(0, MAX_TEXT_LENGTH);
}

/**
 * Extract and clean text from image buffer
 */
async function extractTextFromImage(buffer) {
  console.log('[imageAnalyzer] Starting OCR...');

  const result = await Tesseract.recognize(buffer, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`[imageAnalyzer] OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  const rawText = result.data.text || '';
  console.log('[imageAnalyzer] Raw OCR text length:', rawText.length);
  console.log('[imageAnalyzer] Raw OCR preview:', rawText.slice(0, 200));

  const cleanedText = cleanOCRText(rawText);
  console.log('[imageAnalyzer] Cleaned text length:', cleanedText.length);

  return cleanedText;
}

module.exports = {
  extractTextFromImage
};

/**
 * Image Analyzer
 *
 * Uses OCR to extract text from screenshots,
 * handles both problem statements AND code screenshots.
 * Filters out UI noise from coding platforms like LeetCode, GFG, etc.
 */

const Tesseract = require('tesseract.js');

const MAX_TEXT_LENGTH = 3000;

// UI elements to completely remove (very aggressive filtering)
const UI_NOISE_EXACT = [
  // LeetCode specific
  'leetcode', 'problemlist', 'submit', 'register', 'login', 'premium',
  'description', 'editorial', 'solutions', 'submissions', 'code',
  'auto', 'testcase', 'test result', 'accepted', 'wrong answer',
  'topics', 'companies', 'hint', 'online', 'run', 'console',
  'acceptance rate', 'constraints', 'topics', 'hint1', 'hint2', 'hint3',
  // Browser/UI
  'chrome', 'firefox', 'safari', 'bookmark', 'tab', 'tabs',
  // Common noise
  'sign up', 'sign in', 'log in', 'register', 'subscribe', 'upgrade',
  // Random symbols that OCR picks up
  '®', '©', '™', '@', '¥', '«', '»', '•'
];

// Regex patterns for UI noise
const UI_NOISE_PATTERNS = [
  // URLs and domains
  /https?:\/\/[^\s]+/gi,
  /\b\w+\.(com|org|io|net|co)\b/gi,
  // LeetCode specific patterns
  /\d+\.\s*(easy|medium|hard)/gi,
  /accepted\s*[\d,]+/gi,
  /acceptance\s*rate\s*[\d.%]+/gi,
  /\d+[km]?\s*(online|views|submissions)/gi,
  // Navigation elements
  /[<>]\s*\d+\s*[<>]/g,
  // Random character sequences (OCR artifacts)
  /[®©™@¥«»•◦○●□■◆◇]/g,
  /\b[A-Z]{1,2}\b(?!\s*[=:.])/g, // Single/double capital letters alone
  // Button-like text
  /\b(click|tap|press|submit|run|test)\b/gi,
  // Time/stats
  /\d+:\d+:\d+/g,
  /\d+\s*(ms|sec|min|hr)/gi,
];

// Keywords that indicate actual problem content
const PROBLEM_KEYWORDS = [
  'given', 'return', 'find', 'determine', 'calculate', 'check',
  'array', 'string', 'integer', 'number', 'list', 'matrix',
  'input', 'output', 'example', 'explanation',
  'sorted', 'ascending', 'descending', 'maximum', 'minimum',
  'sum', 'product', 'count', 'index', 'element', 'value',
  'substring', 'palindrome', 'palindromic', 'longest', 'shortest',
  'binary', 'tree', 'node', 'graph', 'linked', 'stack', 'queue'
];

// Keywords/patterns that indicate CODE content
const CODE_PATTERNS = [
  // Python
  /\bdef\s+\w+\s*\(/i,
  /\bclass\s+\w+.*:/i,
  /\bimport\s+\w+/i,
  /\bfrom\s+\w+\s+import/i,
  /\bprint\s*\(/i,
  /\bif\s+.*:/i,
  /\bfor\s+\w+\s+in\s+/i,
  /\bwhile\s+.*:/i,
  /\breturn\s+/i,
  // Java
  /\bpublic\s+(static\s+)?(void|int|String|boolean|class)/i,
  /\bSystem\.out\.print/i,
  /\bstatic\s+void\s+main/i,
  // C/C++
  /\#include\s*[<"]/i,
  /\bint\s+main\s*\(/i,
  /\bprintf\s*\(/i,
  /\bcout\s*<</i,
  /\bstd::/i,
  // General
  /\w+\s*\[\s*\w+\s*\]/,
  /[{};]\s*$/m,
];

/**
 * Check if text appears to be code
 */
function isCodeContent(text) {
  let codeScore = 0;

  for (const pattern of CODE_PATTERNS) {
    if (pattern.test(text)) {
      codeScore++;
    }
  }

  const lines = text.split('\n');
  let indentedLines = 0;
  let bracketCount = 0;

  for (const line of lines) {
    if (/^\s{2,}/.test(line)) indentedLines++;
    bracketCount += (line.match(/[{}()\[\]]/g) || []).length;
  }

  if (indentedLines > 2) codeScore += 2;
  if (bracketCount > 5) codeScore += 2;

  return codeScore >= 3;
}

/**
 * Detect programming language from code text
 */
function detectLanguage(text) {
  if (/\bdef\s+\w+\s*\(/.test(text) || /:\s*$/.test(text)) return 'python';
  if (/\bpublic\s+(static\s+)?class/.test(text) || /System\.out/.test(text)) return 'java';
  if (/\#include\s*</.test(text) || /\bcout\s*<</.test(text)) return 'cpp';
  if (/\#include\s*<stdio/.test(text) || /\bprintf\s*\(/.test(text)) return 'c';
  return 'unknown';
}

/**
 * Extract problem statement from noisy OCR text
 */
function extractProblemStatement(rawText) {
  let text = rawText;

  // Convert to lowercase for matching, but keep original for output
  const lowerText = text.toLowerCase();

  // Remove exact UI noise words
  for (const noise of UI_NOISE_EXACT) {
    const regex = new RegExp(`\\b${noise}\\b`, 'gi');
    text = text.replace(regex, ' ');
  }

  // Remove pattern-based noise
  for (const pattern of UI_NOISE_PATTERNS) {
    text = text.replace(pattern, ' ');
  }

  // Try to find the actual problem content
  const lines = text.split('\n');
  const cleanLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip very short lines (likely noise)
    if (trimmed.length < 5) continue;

    // Skip lines that are mostly non-alphanumeric
    const alphanumeric = trimmed.replace(/[^a-zA-Z0-9]/g, '');
    if (alphanumeric.length < trimmed.length * 0.4) continue;

    // Skip lines that look like navigation/UI
    if (/^[<>0-9\s]+$/.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;

    cleanLines.push(trimmed);
  }

  text = cleanLines.join('\n');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\s*([.,;:!?])\s*/g, '$1 ');

  // Try to extract just the problem part (between "Given" and "Constraints" or "Example")
  const givenMatch = text.match(/given[^]*?(?=constraints|example\s*\d|$)/i);
  if (givenMatch && givenMatch[0].length > 50) {
    text = givenMatch[0].trim();
  }

  return text.slice(0, MAX_TEXT_LENGTH);
}

/**
 * Clean OCR text - different handling for code vs problem text
 */
function cleanOCRText(rawText, isCode) {
  if (isCode) {
    // For code, preserve structure
    let text = rawText;
    text = text.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.slice(0, MAX_TEXT_LENGTH);
  } else {
    // For problem statements, extract clean content
    return extractProblemStatement(rawText);
  }
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

  // Detect if this is code
  const isCode = isCodeContent(rawText);
  const language = isCode ? detectLanguage(rawText) : null;

  console.log('[imageAnalyzer] Is code:', isCode, '| Language:', language);

  const cleanedText = cleanOCRText(rawText, isCode);
  console.log('[imageAnalyzer] Cleaned text length:', cleanedText.length);
  console.log('[imageAnalyzer] Cleaned preview:', cleanedText.slice(0, 300));

  return {
    text: cleanedText,
    isCode,
    language,
    raw: rawText
  };
}

module.exports = {
  extractTextFromImage,
  isCodeContent,
  detectLanguage
};

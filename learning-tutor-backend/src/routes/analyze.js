/**
 * Analyze Routes
 *
 * POST /analyze - Main endpoint for code analysis
 * This is where students' code gets analyzed WITHOUT giving away answers
 */

const express = require('express');
const router = express.Router();
const { analyzeCode } = require('../services/aiService');
const { validateAnalyzeRequest } = require('../utils/validators');

/**
 * POST /analyze
 *
 * Input:
 * {
 *   code: string,
 *   language: "python" | "c" | "cpp" | "java",
 *   level: "basic" | "moderate" | "complex",
 *   hintLevel: number (1-5),
 *   userQuestion: string (optional - specific question from user)
 * }
 *
 * Output:
 * {
 *   explanation: string,    // What's wrong (conceptually)
 *   analogy: string,        // Real-world comparison to help understand
 *   hint: string,           // Progressive hint based on hintLevel
 *   hintLevel: number       // Current hint level (for tracking)
 * }
 */
router.post('/', async (req, res) => {
  try {
    // Validate the incoming request
    const validation = validateAnalyzeRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.errors
      });
    }

    const { code, language, level, hintLevel, userQuestion } = req.body;

    console.log(`[Analyze] Language: ${language}, Level: ${level}, Hint: ${hintLevel}`);
    console.log(`[Analyze] Code length: ${code.length} chars`);
    if (userQuestion) {
      console.log(`[Analyze] User question: ${userQuestion}`);
    }

    // Call the AI service to analyze the code
    const result = await analyzeCode({
      code,
      language,
      level,
      hintLevel: hintLevel || 1,
      userQuestion
    });

    // Return the analysis (NEVER contains complete code)
    res.json(result);

  } catch (error) {
    console.error('[Analyze] Error:', error);
    res.status(500).json({
      error: 'Failed to analyze code',
      hint: 'Please try again in a moment'
    });
  }
});

module.exports = router;

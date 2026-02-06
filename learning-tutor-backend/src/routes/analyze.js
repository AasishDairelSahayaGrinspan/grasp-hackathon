/**
 * Analyze Routes
 *
 * POST /analyze - Main endpoint for code analysis
 * This is where students' code gets analyzed WITHOUT giving away answers
 *
 * Now includes learning state for pedagogical effectiveness
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
 *   userQuestion: string (optional - specific question from user),
 *   learningState: {                    // Optional - for pedagogical awareness
 *     strugglingConcepts: string[],     // Concepts student has struggled with
 *     masteredConcepts: string[],       // Concepts student has shown understanding of
 *     hintsGivenThisSession: number,    // Number of hints given this session
 *     sameErrorRepeated: boolean,       // If student is repeating same error
 *     previousExplanations: string[],   // Recent explanations given
 *     currentUnderstanding: string      // Current understanding level
 *   }
 * }
 *
 * Output:
 * {
 *   explanation: string,      // What's wrong (conceptually)
 *   analogy: string,          // Real-world comparison to help understand
 *   hint: string,             // Progressive hint based on hintLevel
 *   hintLevel: number,        // Current hint level (for tracking)
 *   conceptsTaught: string[], // Concepts covered in this response
 *   suggestedNextConcept: string // What they should learn next
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

    const { code, language, level, hintLevel, userQuestion, learningState } = req.body;

    console.log(`[Analyze] Language: ${language}, Level: ${level}, Hint: ${hintLevel}`);
    if (code && typeof code === 'string') {
      console.log(`[Analyze] Code length: ${code.length} chars`);
    } else {
      console.log('[Analyze] No code provided (general question mode)');
    }
    if (userQuestion) {
      console.log(`[Analyze] User question: ${userQuestion}`);
    }
    if (learningState) {
      console.log(`[Analyze] Learning state: struggling=${learningState.strugglingConcepts?.length || 0}, mastered=${learningState.masteredConcepts?.length || 0}, hints=${learningState.hintsGivenThisSession || 0}`);
    }

    // Wrap the analysis in a timeout (10 seconds max)
    const analysisPromise = analyzeCode({
      code,
      language,
      level,
      hintLevel: hintLevel || 1,
      userQuestion,
      learningState
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timeout')), 10000)
    );

    const result = await Promise.race([analysisPromise, timeoutPromise]);

    // Return the analysis (NEVER contains complete code)
    res.json(result);

  } catch (error) {
    console.error('[Analyze] Error:', error.message);

    // Send a friendly error response
    res.status(500).json({
      error: 'Analysis failed - trying fallback',
      explanation: 'There was an issue with the AI analysis. But don\'t worry - I can still help!',
      analogy: 'Like when your phone\'s connection is slow, but you can still use some features.',
      hint: 'Try asking a simpler question or analyzing shorter code.'
    });
  }
});

module.exports = router;

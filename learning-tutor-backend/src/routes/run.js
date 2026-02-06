/**
 * Run Code Routes
 *
 * POST /run - Execute code and return output
 */

const express = require('express');
const router = express.Router();
const { runCode, checkCompilers } = require('../services/compilerService');

/**
 * POST /run
 * Execute code in the specified language
 *
 * Input:
 * {
 *   code: string,
 *   language: "python" | "c" | "cpp" | "java",
 *   input: string (optional - stdin input)
 * }
 *
 * Output:
 * {
 *   success: boolean,
 *   output: string,
 *   error: string,
 *   executionTime: number
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // Validate request
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Language is required'
      });
    }

    const supportedLanguages = ['python', 'c', 'cpp', 'java'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    console.log(`[Run] Executing ${language} code (${code.length} chars)`);

    const startTime = Date.now();
    const result = await runCode(code, language, input || '');
    const executionTime = Date.now() - startTime;

    console.log(`[Run] Completed in ${executionTime}ms, success: ${result.success}`);

    if (result.timedOut) {
      return res.json({
        success: false,
        output: result.stdout,
        error: 'Execution timed out (5 second limit)',
        executionTime
      });
    }

    res.json({
      success: result.success,
      output: result.stdout,
      error: result.stderr,
      executionTime,
      exitCode: result.exitCode
    });

  } catch (error) {
    console.error('[Run] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute code: ' + error.message
    });
  }
});

/**
 * GET /run/compilers
 * Check which compilers are available on the system
 */
router.get('/compilers', async (req, res) => {
  try {
    const compilers = await checkCompilers();
    res.json({
      available: compilers,
      message: 'Compiler availability check complete'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check compilers'
    });
  }
});

module.exports = router;

/**
 * Compiler Service (Piston API Version)
 * 
 * Executes code using the Piston Execution API (https://github.com/engineer-man/piston)
 * This avoids the need for local compilers (gcc, python, etc.) on the Render server.
 */

const axios = require('axios');

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping: Frontend Language -> Piston Language Configuration
const LANGUAGE_CONFIG = {
  python: { language: 'python', version: '3.10.0' },
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  javascript: { language: 'javascript', version: '18.15.0' }
};

/**
 * Execute code using Piston API
 */
async function runCode(code, language, input = '') {
  try {
    const langKey = language.toLowerCase();
    const config = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG.python; // Default to python

    // Java requires the filename to match the class name, but Piston handles basic execution.
    // However, Piston usually runs "main.extension".
    // For Java, ensuring the class is "Main" is safest, or Piston runs it anyway if it compiles.

    console.log(`[Compiler] Sending ${config.language} code to Piston API...`);

    const response = await axios.post(`${PISTON_API}/execute`, {
      language: config.language,
      version: config.version,
      files: [
        {
          content: code
        }
      ],
      stdin: input,
      run_timeout: 5000,
      compile_timeout: 10000
    });

    const { run, compile } = response.data;

    // Handle compilation error
    if (compile && compile.code !== 0) {
      return {
        success: false,
        stdout: '',
        stderr: compile.stderr || compile.stdout || 'Compilation failed',
        exitCode: compile.code,
        compilationError: true
      };
    }

    // Handle runtime result
    return {
      success: run.code === 0,
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      timedOut: run.signal === 'SIGKILL' // Piston kills process on timeout
    };

  } catch (error) {
    console.error('[Compiler] Piston API Error:', error.message);
    if (error.response) {
      console.error('[Compiler] Response:', error.response.data);
    }

    return {
      success: false,
      stdout: '',
      stderr: 'Failed to execute code via remote compiler service. ' + error.message,
      exitCode: -1
    };
  }
}

/**
 * Check compilers - For Piston, we just check if API is reachable
 */
async function checkCompilers() {
  try {
    await axios.get(`${PISTON_API}/runtimes`);
    return {
      python: true,
      c: true,
      cpp: true,
      java: true,
      note: 'Using Piston API'
    };
  } catch (error) {
    console.error('Piston API unreachable');
    return {
      python: false,
      c: false,
      cpp: false,
      java: false,
      error: 'Remote compiler unreachable'
    };
  }
}

module.exports = { runCode, checkCompilers };

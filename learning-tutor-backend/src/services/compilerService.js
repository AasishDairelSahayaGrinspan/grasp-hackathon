/**
 * Compiler Service
 *
 * Executes code in Python, C, C++, and Java
 * Uses child_process to run compilers safely with timeout
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const util = require('util');

const execPromise = util.promisify(exec);

// Execution timeout (5 seconds)
const EXECUTION_TIMEOUT = 5000;

// Max output size (prevent memory issues)
const MAX_OUTPUT_SIZE = 10000;

/**
 * Generate a unique temporary directory for code execution
 */
async function createTempDir() {
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join(os.tmpdir(), `code-runner-${uniqueId}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
async function cleanupTempDir(tempDir) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Failed to cleanup temp dir:', err);
  }
}

/**
 * Execute a command with timeout
 */
async function executeCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: options.cwd,
      timeout: EXECUTION_TIMEOUT,
      maxBuffer: MAX_OUTPUT_SIZE
    });

    return {
      success: true,
      stdout: stdout.slice(0, MAX_OUTPUT_SIZE),
      stderr: stderr.slice(0, MAX_OUTPUT_SIZE),
      exitCode: 0,
      timedOut: false
    };
  } catch (error) {
    if (error.killed) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: 'Execution timed out (5 second limit)',
        exitCode: -1,
        timedOut: true
      };
    }

    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || -1,
      timedOut: false
    };
  }
}

/**
 * Run Python code
 */
async function runPython(code) {
  const tempDir = await createTempDir();
  const filePath = path.join(tempDir, 'main.py');

  try {
    await fs.writeFile(filePath, code);
    let result = await executeCommand(`python3 "${filePath}"`, { cwd: tempDir });

    if (!result.success && result.stderr.includes('not found')) {
      result = await executeCommand(`python "${filePath}"`, { cwd: tempDir });
    }

    return result;
  } finally {
    await cleanupTempDir(tempDir);
  }
}

/**
 * Run C code
 */
async function runC(code) {
  const tempDir = await createTempDir();
  const sourcePath = path.join(tempDir, 'main.c');
  const outputPath = path.join(tempDir, 'main');

  try {
    await fs.writeFile(sourcePath, code);

    const compileResult = await executeCommand(
      `gcc "${sourcePath}" -o "${outputPath}" -Wall`,
      { cwd: tempDir }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stdout: '',
        stderr: `Compilation Error:\n${compileResult.stderr}`,
        exitCode: compileResult.exitCode,
        compilationError: true
      };
    }

    return await executeCommand(`"${outputPath}"`, { cwd: tempDir });
  } finally {
    await cleanupTempDir(tempDir);
  }
}

/**
 * Run C++ code
 */
async function runCpp(code) {
  const tempDir = await createTempDir();
  const sourcePath = path.join(tempDir, 'main.cpp');
  const outputPath = path.join(tempDir, 'main');

  try {
    await fs.writeFile(sourcePath, code);

    const compileResult = await executeCommand(
      `g++ "${sourcePath}" -o "${outputPath}" -Wall -std=c++17`,
      { cwd: tempDir }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stdout: '',
        stderr: `Compilation Error:\n${compileResult.stderr}`,
        exitCode: compileResult.exitCode,
        compilationError: true
      };
    }

    return await executeCommand(`"${outputPath}"`, { cwd: tempDir });
  } finally {
    await cleanupTempDir(tempDir);
  }
}

/**
 * Run Java code
 */
async function runJava(code) {
  const tempDir = await createTempDir();

  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  const sourcePath = path.join(tempDir, `${className}.java`);

  try {
    await fs.writeFile(sourcePath, code);

    const compileResult = await executeCommand(`javac "${sourcePath}"`, { cwd: tempDir });

    if (!compileResult.success) {
      return {
        success: false,
        stdout: '',
        stderr: `Compilation Error:\n${compileResult.stderr}`,
        exitCode: compileResult.exitCode,
        compilationError: true
      };
    }

    return await executeCommand(`java ${className}`, { cwd: tempDir });
  } finally {
    await cleanupTempDir(tempDir);
  }
}

/**
 * Main function to run code based on language
 */
async function runCode(code, language) {
  const lang = language.toLowerCase();
  console.log(`[Compiler] Running ${lang} code (${code.length} chars)`);

  try {
    let result;

    switch (lang) {
      case 'python':
      case 'py':
        result = await runPython(code);
        break;
      case 'c':
        result = await runC(code);
        break;
      case 'cpp':
      case 'c++':
        result = await runCpp(code);
        break;
      case 'java':
        result = await runJava(code);
        break;
      default:
        result = {
          success: false,
          stdout: '',
          stderr: `Unsupported language: ${language}`,
          exitCode: -1
        };
    }

    console.log(`[Compiler] Result: success=${result.success}`);
    return result;
  } catch (error) {
    console.error('[Compiler Service] Error:', error);
    return {
      success: false,
      stdout: '',
      stderr: `Execution error: ${error.message}`,
      exitCode: -1
    };
  }
}

/**
 * Check if compilers are available
 */
async function checkCompilers() {
  const compilers = { python: false, c: false, cpp: false, java: false };

  try {
    const pythonCheck = await executeCommand('python3 --version');
    compilers.python = pythonCheck.success;
  } catch (e) { compilers.python = false; }

  try {
    const gccCheck = await executeCommand('gcc --version');
    compilers.c = gccCheck.success;
  } catch (e) { compilers.c = false; }

  try {
    const gppCheck = await executeCommand('g++ --version');
    compilers.cpp = gppCheck.success;
  } catch (e) { compilers.cpp = false; }

  try {
    const javacCheck = await executeCommand('javac -version');
    compilers.java = javacCheck.success;
  } catch (e) { compilers.java = false; }

  return compilers;
}

module.exports = { runCode, checkCompilers };

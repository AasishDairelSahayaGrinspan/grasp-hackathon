/**
 * Complexity Analyzer
 *
 * Estimates time complexity based on code structure (loop counting heuristics)
 * This is a simplified heuristic-based approach, not a full static analysis
 */

/**
 * Analyzes code and estimates time complexity
 * Returns { best, worst, average } complexity strings
 */
function analyzeComplexity(code, language) {
  // Normalize the code (remove strings to avoid false positives)
  const cleanCode = removeStrings(code);

  // Count different loop patterns
  const loopPatterns = detectLoopPatterns(cleanCode, language);

  // Detect recursion
  const hasRecursion = detectRecursion(cleanCode, language);

  // Calculate complexity based on patterns
  return calculateComplexity(loopPatterns, hasRecursion);
}

/**
 * Removes string literals to avoid false pattern matches
 */
function removeStrings(code) {
  // Remove double-quoted strings
  let clean = code.replace(/"[^"]*"/g, '""');
  // Remove single-quoted strings
  clean = clean.replace(/'[^']*'/g, "''");
  // Remove template literals (for JS-like syntax)
  clean = clean.replace(/`[^`]*`/g, '``');
  return clean;
}

/**
 * Detects loop patterns in code
 */
function detectLoopPatterns(code, language) {
  const patterns = {
    simpleLoops: 0,      // O(n) loops
    nestedLoops: 0,      // O(n²) or more
    halvingLoops: 0,     // O(log n) loops (dividing by 2)
    multiplyingLoops: 0  // O(log n) loops (multiplying)
  };

  // Language-specific loop keywords
  const forRegex = /\b(for)\s*\(/gi;
  const whileRegex = /\b(while)\s*\(/gi;

  // Count for loops
  const forMatches = code.match(forRegex) || [];
  // Count while loops
  const whileMatches = code.match(whileRegex) || [];

  const totalLoops = forMatches.length + whileMatches.length;

  // Check for nested loops by looking at indentation or brace depth
  const nestedLoopRegex = /(for|while)\s*\([^)]*\)\s*\{[^}]*(for|while)\s*\(/gi;
  const nestedMatches = code.match(nestedLoopRegex) || [];

  // Check for halving patterns (i /= 2, i = i / 2, etc.)
  const halvingRegex = /\/=\s*2|\/\s*2|>>=\s*1/g;
  const halvingMatches = code.match(halvingRegex) || [];

  // Check for multiplying patterns (i *= 2, i = i * 2, etc.)
  const multiplyRegex = /\*=\s*2|\*\s*2|<<=\s*1/g;
  const multiplyMatches = code.match(multiplyRegex) || [];

  patterns.simpleLoops = Math.max(0, totalLoops - nestedMatches.length);
  patterns.nestedLoops = nestedMatches.length;
  patterns.halvingLoops = halvingMatches.length;
  patterns.multiplyingLoops = multiplyMatches.length;

  return patterns;
}

/**
 * Detects potential recursion in code
 */
function detectRecursion(code, language) {
  // Look for function definitions and calls to the same function name
  // This is a simplified heuristic

  // Python function pattern
  const pythonFuncRegex = /def\s+(\w+)\s*\([^)]*\):/g;
  // C/C++/Java function pattern
  const cFuncRegex = /\b\w+\s+(\w+)\s*\([^)]*\)\s*\{/g;

  let match;
  const functionNames = [];

  while ((match = pythonFuncRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
  }

  while ((match = cFuncRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
  }

  // Check if any function name appears inside its own body (recursion indicator)
  for (const funcName of functionNames) {
    const funcCallRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
    const calls = code.match(funcCallRegex) || [];
    // If function is called more than once (definition + recursive call)
    if (calls.length > 1) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates complexity based on detected patterns
 */
function calculateComplexity(patterns, hasRecursion) {
  const { simpleLoops, nestedLoops, halvingLoops, multiplyingLoops } = patterns;

  // No loops at all
  if (simpleLoops === 0 && nestedLoops === 0 && halvingLoops === 0 && multiplyingLoops === 0 && !hasRecursion) {
    return {
      best: 'O(1)',
      worst: 'O(1)',
      average: 'O(1)',
      explanation: 'No loops or recursion detected - constant time operations'
    };
  }

  // Has halving/logarithmic patterns
  if (halvingLoops > 0 || multiplyingLoops > 0) {
    if (nestedLoops > 0) {
      return {
        best: 'O(n log n)',
        worst: 'O(n log n)',
        average: 'O(n log n)',
        explanation: 'Nested loop with logarithmic pattern (like merge sort)'
      };
    }
    return {
      best: 'O(log n)',
      worst: 'O(log n)',
      average: 'O(log n)',
      explanation: 'Loop divides/multiplies by 2 each iteration (logarithmic)'
    };
  }

  // Has nested loops
  if (nestedLoops > 0) {
    const depth = nestedLoops + 1;
    const complexityStr = depth === 2 ? 'O(n²)' : `O(n^${depth})`;
    return {
      best: complexityStr,
      worst: complexityStr,
      average: complexityStr,
      explanation: `${depth} levels of nested loops detected`
    };
  }

  // Simple loops only
  if (simpleLoops > 0) {
    return {
      best: 'O(n)',
      worst: 'O(n)',
      average: 'O(n)',
      explanation: `${simpleLoops} linear loop(s) detected`
    };
  }

  // Has recursion but no clear loop pattern
  if (hasRecursion) {
    return {
      best: 'O(n)',
      worst: 'O(2^n)',
      average: 'O(n) to O(2^n)',
      explanation: 'Recursion detected - complexity depends on the recursion pattern'
    };
  }

  return {
    best: 'O(1)',
    worst: 'O(n)',
    average: 'O(n)',
    explanation: 'Unable to determine exact complexity'
  };
}

module.exports = {
  analyzeComplexity
};

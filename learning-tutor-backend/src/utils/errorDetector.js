/**
 * Error Detector
 *
 * Detects common programming errors using heuristics (no compiler needed)
 * This helps provide targeted educational feedback
 */

/**
 * Detects potential errors in code based on language
 * Returns array of { type, description, line (approximate) }
 */
function detectErrors(code, language) {
  const errors = [];
  const lines = code.split('\n');

  // Common errors across all languages
  errors.push(...detectCommonErrors(code, lines));

  // Language-specific errors
  switch (language.toLowerCase()) {
    case 'python':
      errors.push(...detectPythonErrors(code, lines));
      break;
    case 'c':
    case 'cpp':
      errors.push(...detectCErrors(code, lines));
      break;
    case 'java':
      errors.push(...detectJavaErrors(code, lines));
      break;
  }

  return errors;
}

/**
 * Common errors across all languages
 */
function detectCommonErrors(code, lines) {
  const errors = [];

  // Check for unbalanced brackets/braces/parentheses
  const bracketBalance = checkBracketBalance(code);
  if (!bracketBalance.balanced) {
    errors.push({
      type: 'syntax',
      description: `Unbalanced ${bracketBalance.type}: ${bracketBalance.message}`,
      severity: 'error'
    });
  }

  // Check for common typos
  const typos = [
    { pattern: /\bpirnt\b/gi, fix: 'print', type: 'typo' },
    { pattern: /\bretrun\b/gi, fix: 'return', type: 'typo' },
    { pattern: /\bfunciton\b/gi, fix: 'function', type: 'typo' },
    { pattern: /\bvraible\b/gi, fix: 'variable', type: 'typo' },
    { pattern: /\blenght\b/gi, fix: 'length', type: 'typo' },
    { pattern: /\bwidht\b/gi, fix: 'width', type: 'typo' }
  ];

  for (const typo of typos) {
    if (typo.pattern.test(code)) {
      errors.push({
        type: 'typo',
        description: `Possible typo: Did you mean '${typo.fix}'?`,
        severity: 'warning'
      });
    }
  }

  // Check for potential infinite loops
  lines.forEach((line, index) => {
    // while(true) or while(1) without break nearby
    if (/while\s*\(\s*(true|1|True)\s*\)/.test(line)) {
      // Check if there's a break in the next few lines
      const nextLines = lines.slice(index, index + 10).join('\n');
      if (!/\bbreak\b/.test(nextLines)) {
        errors.push({
          type: 'logic',
          description: 'Potential infinite loop: while(true) without visible break statement',
          line: index + 1,
          severity: 'warning'
        });
      }
    }
  });

  return errors;
}

/**
 * Check bracket balance
 */
function checkBracketBalance(code) {
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const stack = [];

  // Remove string contents to avoid false positives
  const cleanCode = code.replace(/"[^"]*"|'[^']*'/g, '""');

  for (const char of cleanCode) {
    if (pairs[char]) {
      stack.push({ char, expected: pairs[char] });
    } else if (Object.values(pairs).includes(char)) {
      if (stack.length === 0) {
        return { balanced: false, type: 'bracket', message: `Unexpected '${char}'` };
      }
      const last = stack.pop();
      if (last.expected !== char) {
        return { balanced: false, type: 'bracket', message: `Expected '${last.expected}' but found '${char}'` };
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.map(s => s.char).join(', ');
    return { balanced: false, type: 'bracket', message: `Unclosed: ${unclosed}` };
  }

  return { balanced: true };
}

/**
 * Python-specific errors
 */
function detectPythonErrors(code, lines) {
  const errors = [];

  lines.forEach((line, index) => {
    // Missing colon after if/for/while/def/class
    if (/^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b[^:]*$/.test(line) &&
        !line.trim().endsWith(':') &&
        !line.includes('#')) {
      errors.push({
        type: 'syntax',
        description: 'Python requires a colon (:) at the end of this statement',
        line: index + 1,
        severity: 'error'
      });
    }

    // Using = instead of == in condition
    if (/\b(if|elif|while)\s+.*[^=!<>]=(?!=)/.test(line)) {
      errors.push({
        type: 'logic',
        description: 'Are you assigning (=) when you meant to compare (==)?',
        line: index + 1,
        severity: 'warning'
      });
    }

    // Using print without parentheses (Python 3)
    if (/\bprint\s+[^(]/.test(line) && !/\bprint\s*$/.test(line)) {
      errors.push({
        type: 'syntax',
        description: 'In Python 3, print is a function: use print() with parentheses',
        line: index + 1,
        severity: 'error'
      });
    }

    // Incorrect indentation check (tabs vs spaces mix)
    if (/^\t+ /.test(line) || /^ +\t/.test(line)) {
      errors.push({
        type: 'style',
        description: 'Mixing tabs and spaces for indentation can cause issues',
        line: index + 1,
        severity: 'warning'
      });
    }
  });

  return errors;
}

/**
 * C/C++ specific errors
 */
function detectCErrors(code, lines) {
  const errors = [];

  lines.forEach((line, index) => {
    // Missing semicolon (heuristic: statement without semicolon or brace)
    const trimmed = line.trim();
    if (trimmed &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(':') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !/^\s*(if|else|for|while|switch|do)\s*/.test(trimmed) &&
        /\w+\s*[=+\-*/]/.test(trimmed)) {
      errors.push({
        type: 'syntax',
        description: 'This line might be missing a semicolon',
        line: index + 1,
        severity: 'warning'
      });
    }

    // Using = instead of == in condition
    if (/\b(if|while)\s*\([^)]*[^=!<>]=(?!=)[^=]/.test(line)) {
      errors.push({
        type: 'logic',
        description: 'Using assignment (=) instead of comparison (==) in condition',
        line: index + 1,
        severity: 'warning'
      });
    }

    // Array index out of bounds pattern (array[size])
    const arrayDecl = code.match(/\w+\s*\[\s*(\d+)\s*\]/);
    if (arrayDecl) {
      const size = parseInt(arrayDecl[1]);
      const sizeAccessRegex = new RegExp(`\\[\\s*${size}\\s*\\]`, 'g');
      if (sizeAccessRegex.test(line)) {
        errors.push({
          type: 'logic',
          description: `Array index ${size} is out of bounds for array of size ${size} (valid indices: 0 to ${size - 1})`,
          line: index + 1,
          severity: 'error'
        });
      }
    }
  });

  // Check for missing main function
  if (!/#include/.test(code) && code.length > 50) {
    // Only check for main if it looks like a complete program
    if (!/\bmain\s*\(/.test(code)) {
      errors.push({
        type: 'structure',
        description: 'C/C++ programs need a main() function as the entry point',
        severity: 'info'
      });
    }
  }

  return errors;
}

/**
 * Java-specific errors
 */
function detectJavaErrors(code, lines) {
  const errors = [];

  lines.forEach((line, index) => {
    // String comparison with ==
    if (/String\s+\w+/.test(code) && /==\s*"/.test(line)) {
      errors.push({
        type: 'logic',
        description: 'In Java, compare Strings using .equals() not ==',
        line: index + 1,
        severity: 'error'
      });
    }

    // Missing semicolon (similar to C)
    const trimmed = line.trim();
    if (trimmed &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('@') &&
        !/^\s*(if|else|for|while|switch|do|try|catch|finally|class|interface|enum)\s*/.test(trimmed) &&
        !/^\s*(public|private|protected|static|final|abstract)\s+(class|interface|enum)/.test(trimmed) &&
        /\w+\s*[=+\-*/]/.test(trimmed)) {
      errors.push({
        type: 'syntax',
        description: 'This line might be missing a semicolon',
        line: index + 1,
        severity: 'warning'
      });
    }
  });

  // Check for class structure
  if (!/\bclass\s+\w+/.test(code) && code.length > 50) {
    errors.push({
      type: 'structure',
      description: 'Java code must be inside a class',
      severity: 'info'
    });
  }

  // Check for main method
  if (/\bclass\s+\w+/.test(code) && !/public\s+static\s+void\s+main/.test(code)) {
    errors.push({
      type: 'structure',
      description: 'Java programs need a main method: public static void main(String[] args)',
      severity: 'info'
    });
  }

  return errors;
}

module.exports = {
  detectErrors
};

/**
 * AI Service
 *
 * The brain of the tutor system. Handles all AI interactions.
 * Uses Groq API when available, falls back to heuristic responses when not.
 *
 * CRITICAL: This service NEVER returns complete code solutions.
 */

const OpenAI = require('openai');
const { SYSTEM_PROMPT, buildAnalysisPrompt } = require('../prompts/analysisPrompts');
const { detectErrors } = require('../utils/errorDetector');
const { normalizeLanguage } = require('../utils/validators');

// Initialize Groq client (uses OpenAI-compatible API)
let groqClient = null;
const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

if (process.env.GROQ_API_KEY) {
  groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  console.log(`[AI Service] Groq client initialized with model: ${AI_MODEL}`);
} else {
  console.log('[AI Service] No GROQ_API_KEY found - using fallback responses');
  console.log('[AI Service] Get your free key at: https://console.groq.com/keys');
}

/**
 * Main analysis function
 * Analyzes code and returns educational feedback (NO code solutions!)
 */
async function analyzeCode({ code, language, level, hintLevel, userQuestion }) {
  // Normalize the language
  const normalizedLang = normalizeLanguage(language);

  // Detect errors using heuristics
  const detectedErrors = detectErrors(code, normalizedLang);

  // Try AI-powered analysis first, fall back to heuristics
  let aiResponse;
  if (groqClient) {
    aiResponse = await getAIAnalysis({
      code,
      language: normalizedLang,
      level,
      hintLevel,
      detectedErrors,
      userQuestion
    });
  } else {
    aiResponse = getFallbackAnalysis({
      code,
      language: normalizedLang,
      level,
      hintLevel,
      detectedErrors,
      userQuestion
    });
  }

  return {
    ...aiResponse,
    hintLevel
  };
}

/**
 * Get AI-powered analysis from Groq
 */
async function getAIAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion }) {
  try {
    const prompt = buildAnalysisPrompt({
      code,
      language,
      level,
      hintLevel,
      detectedErrors,
      userQuestion
    });

    const response = await groqClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Safety check: ensure no code leaked through
    const result = sanitizeResponse(parsed);

    return result;
  } catch (error) {
    console.error('[AI Service] Groq error:', error.message);
    // Fall back to heuristic response on error
    return getFallbackAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion });
  }
}

/**
 * Fallback analysis when AI is not available
 * Uses detected errors to generate helpful responses
 */
function getFallbackAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion }) {
  // If user asked a specific question, try to address it
  if (userQuestion) {
    return generateQuestionResponse(userQuestion, code, language, level, hintLevel);
  }

  // Build response based on detected errors
  if (detectedErrors.length === 0) {
    return {
      explanation: "Your code looks structurally sound! Let's think about the logic together. Consider: What should happen at each step? Are you handling all edge cases?",
      analogy: "Like proofreading a letter - the spelling might be correct, but does the message make sense?",
      hint: getGenericHint(hintLevel, level)
    };
  }

  // Get the most significant error
  const mainError = detectedErrors[0];

  return {
    explanation: getExplanationForError(mainError, language, level),
    analogy: getAnalogyForError(mainError, level),
    hint: getHintForError(mainError, hintLevel, level)
  };
}

/**
 * Generate response for user's specific question
 */
function generateQuestionResponse(question, code, language, level, hintLevel) {
  const lowerQ = question.toLowerCase();

  // Check what the user is asking about
  if (lowerQ.includes('analyze') || lowerQ.includes('issue') || lowerQ.includes('wrong')) {
    return {
      explanation: "Let me help you find any issues. I'll guide you through understanding what's happening in your code step by step.",
      analogy: "Think of debugging like being a detective - we look for clues and piece together what's really happening.",
      hint: "Start by reading your code line by line. What does each line do? Does it match what you intended?"
    };
  }

  if (lowerQ.includes('explain') || lowerQ.includes('what') || lowerQ.includes('does')) {
    return {
      explanation: "I'll help you understand what this code does. Let's break it down logically without just giving you the answer.",
      analogy: "Understanding code is like understanding a recipe - we need to see what each step accomplishes and how they work together.",
      hint: "Try tracing through your code mentally. What happens first? Then what? What are the values of variables at each step?"
    };
  }

  if (lowerQ.includes('hint')) {
    return {
      explanation: "I'll give you a hint to guide your thinking in the right direction.",
      analogy: "Like a teacher giving you a nudge towards the answer rather than telling you directly.",
      hint: getGenericHint(hintLevel, level)
    };
  }

  if (lowerQ.includes('logic')) {
    return {
      explanation: "Let's think about the logic of your code. What are you trying to accomplish? Does each step make sense towards that goal?",
      analogy: "Writing code is like writing instructions for someone who follows them literally - you need to be very precise.",
      hint: "Ask yourself: If you followed these instructions exactly as written, would you get the result you want?"
    };
  }

  // Default response
  return {
    explanation: "Great question! Let me help you understand this better. The key to learning is thinking through the problem yourself.",
    analogy: "Learning to code is like learning to ride a bike - I can guide you, but you need to build the muscle memory yourself.",
    hint: "Look closely at your code. What stands out to you? Trust your instincts and let's explore together."
  };
}

/**
 * Generate explanation based on error type
 */
function getExplanationForError(error, language, level) {
  const explanations = {
    syntax: {
      basic: "There's a small grammar mistake in your code. Just like English has rules about periods and commas, programming languages have rules about certain symbols.",
      moderate: "There's a syntax error in your code. The computer needs certain symbols to understand where statements begin and end.",
      complex: "Syntax error detected. The parser expects specific tokens at certain positions in your code."
    },
    logic: {
      basic: "The code will run, but it might not do what you expect! It's like following a recipe but mixing up 'teaspoon' and 'tablespoon'.",
      moderate: "There's a logical issue here. The code executes, but the behavior may not match your intent.",
      complex: "Logic error identified. The semantics of your code differ from the likely intended behavior."
    },
    typo: {
      basic: "Oops! Looks like there might be a spelling mistake. Computers are very picky about exact spelling!",
      moderate: "There appears to be a typo. Programming languages require exact keyword spelling.",
      complex: "Potential identifier typo detected. Verify your keyword and function name spellings."
    },
    structure: {
      basic: "Your code is missing some important building blocks. Think of it like a house - you need a foundation before you can add the rooms!",
      moderate: "The code structure is incomplete. Most programs need certain required elements to work.",
      complex: "Structural element missing. Ensure your code has the required program entry point and declarations."
    },
    style: {
      basic: "Your code will work, but it could be cleaner! Good style makes code easier to read and find mistakes.",
      moderate: "Style issue detected. While not breaking functionality, clean code prevents future bugs.",
      complex: "Code style inconsistency. Maintaining consistent formatting aids maintainability."
    }
  };

  return explanations[error.type]?.[level] || explanations.logic[level];
}

/**
 * Generate analogy based on error type
 */
function getAnalogyForError(error, level) {
  const analogies = {
    syntax: "It's like forgetting a period at the end of a sentence. The reader (computer) gets confused about where one thought ends and another begins.",
    logic: "Imagine giving someone directions to your house, but accidentally telling them to turn left when you meant right. They'll follow your directions perfectly... to the wrong place!",
    typo: "Like writing 'recieve' instead of 'receive' - you know what you meant, but spell-check doesn't!",
    structure: "Think of building with LEGO - you need the base plate before you can stack blocks on top.",
    style: "Like having a messy room - you can still find things, but it's much harder than if everything was organized."
  };

  return analogies[error.type] || analogies.logic;
}

/**
 * Generate progressive hints based on error and hint level
 */
function getHintForError(error, hintLevel, level) {
  // Hint progressions for different error types
  const hintProgressions = {
    syntax: [
      "Look carefully at the end of your lines...",
      "Some statements need specific punctuation to end properly.",
      "Check if you're missing any required symbols after your statements.",
      "In this language, certain keywords require specific characters afterward.",
      "Look for missing semicolons, colons, or brackets at the end of statements."
    ],
    logic: [
      "Think about what your code actually does vs. what you want it to do.",
      "Walk through your code line by line - what value does each variable have?",
      "Consider: is there a difference between assigning a value and comparing values?",
      "Check your operators carefully - are you using the right one for the job?",
      "You might be using a single equals when you need a double equals, or vice versa."
    ],
    typo: [
      "Read your code out loud - does everything sound right?",
      "Check your spelling of function and variable names.",
      "Compare your keywords with the official documentation spelling.",
      "Look for common letter swaps in your keywords.",
      "There's a misspelling - check words that look similar to common keywords."
    ],
    structure: [
      "Think about what pieces every program in this language needs.",
      "Most programs need a starting point - where does yours begin?",
      "Check if your code has all the required components for this language.",
      "In this language, there's a specific function that runs first.",
      "You may be missing the main function or class structure."
    ]
  };

  const hints = hintProgressions[error.type] || hintProgressions.logic;
  const index = Math.min(hintLevel - 1, hints.length - 1);

  return hints[index];
}

/**
 * Generic hints when no specific errors detected
 */
function getGenericHint(hintLevel, level) {
  const hints = [
    "Start by reading your code from the top. Does each line make sense?",
    "Think about the inputs and outputs. What goes in? What should come out?",
    "Consider edge cases. What happens with empty input? Very large numbers?",
    "Trace through your code with a specific example. Does it produce the right result?",
    "Break the problem into smaller steps. Which step isn't working correctly?"
  ];

  return hints[Math.min(hintLevel - 1, hints.length - 1)];
}

/**
 * Safety function to ensure no code leaks into response
 * Strips anything that looks like code blocks
 */
function sanitizeResponse(response) {
  const codePatterns = [
    /```[\s\S]*?```/g,      // Code blocks
    /`[^`]+`/g,             // Inline code
    /def \w+\(.*\):/g,      // Python function definitions
    /function \w+\(.*\)/g,  // JS function definitions
    /\bfor\s*\(.*;.*;.*\)/g, // For loops
    /\bwhile\s*\(.*\)\s*\{/g // While loops with braces
  ];

  let sanitized = { ...response };

  for (const pattern of codePatterns) {
    if (sanitized.explanation) {
      sanitized.explanation = sanitized.explanation.replace(pattern, '[code removed]');
    }
    if (sanitized.hint) {
      sanitized.hint = sanitized.hint.replace(pattern, '[code removed]');
    }
    if (sanitized.analogy) {
      sanitized.analogy = sanitized.analogy.replace(pattern, '[code removed]');
    }
  }

  return sanitized;
}

module.exports = {
  analyzeCode
};

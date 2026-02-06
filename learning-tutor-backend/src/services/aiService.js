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
 * Now includes learning state for pedagogical effectiveness
 */
async function analyzeCode({ code, language, level, hintLevel, userQuestion, learningState }) {
  // Normalize the language
  const normalizedLang = normalizeLanguage(language);

  const codeText = typeof code === 'string' ? code.trim() : '';
  const hasCode = codeText.length > 0;
  const hasQuestion = typeof userQuestion === 'string' && userQuestion.trim().length > 0;

  // Check for simple greetings first
  if (hasQuestion && !isCodeRelatedQuestion(userQuestion)) {
    const greeting = buildGeneralResponse(userQuestion);
    if (greeting) return greeting;
  }

  // Detect errors using heuristics
  const detectedErrors = hasCode ? detectErrors(codeText, normalizedLang) : [];

  // Try AI-powered analysis first, fall back to heuristics
  let aiResponse;
  if (groqClient) {
    aiResponse = await getAIAnalysis({
      code: codeText,
      language: normalizedLang,
      level,
      hintLevel,
      detectedErrors,
      userQuestion,
      learningState
    });
  } else {
    aiResponse = getFallbackAnalysis({
      code: codeText,
      language: normalizedLang,
      level,
      hintLevel,
      detectedErrors,
      userQuestion,
      learningState
    });
  }

  return {
    ...aiResponse,
    hintLevel
  };
}

function isCodeRelatedQuestion(question) {
  const q = question.toLowerCase().trim();
  // Only simple greetings should skip AI - everything else goes to Groq
  const simpleGreetings = ['hi', 'hello', 'hey', 'hi!', 'hello!', 'hey!'];
  return !simpleGreetings.includes(q);
}

function buildGeneralResponse(question) {
  const lower = question.trim().toLowerCase();

  // Only handle simple greetings locally
  if (/^(hi|hello|hey)!?$/i.test(lower)) {
    return {
      mode: 'general',
      reply: "Hey! 👋 I'm your coding mentor. What are you working on today?\n\n• Paste code and I'll explain it\n• Ask for help with a problem\n• Request hints when stuck\n\nWhat would you like to learn?",
      explanation: '',
      analogy: '',
      hint: '',
      syntax: '',
      nextStep: ''
    };
  }

  // Return null to let AI handle everything else
  return null;
}

/**
 * Get AI-powered analysis from Groq
 * Includes learning state for personalized teaching
 */
async function getAIAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion, learningState }) {
  try {
    const prompt = buildAnalysisPrompt({
      code,
      language,
      level,
      hintLevel,
      detectedErrors,
      userQuestion,
      learningState
    });

    console.log('[AI Service] Calling Groq API...');

    // Use Promise.race with a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Groq API timeout - 5 seconds exceeded')), 5000)
    );

    const apiPromise = groqClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Safety check: ensure no code leaked through
    const result = sanitizeResponse(parsed);

    console.log('[AI Service] Groq response successful');
    return result;
  } catch (error) {
    console.error('[AI Service] Groq error:', error.message);
    console.log('[AI Service] Falling back to heuristic analysis');
    // Fall back to heuristic response on error
    return getFallbackAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion, learningState });
  }
}

/**
 * Fallback analysis when AI is not available
 * Uses detected errors to generate helpful responses
 * Considers learning state for better pedagogical approach
 */
function getFallbackAnalysis({ code, language, level, hintLevel, detectedErrors, userQuestion, learningState }) {
  // If user asked a specific question, try to address it
  if (userQuestion) {
    const base = generateQuestionResponse(userQuestion, code, language, level, hintLevel, learningState);
    return {
      ...base,
      syntax: getSyntaxGuidance('general', language),
      nextStep: getNextStep('general', level),
      conceptsTaught: ['general-guidance'],
      suggestedNextConcept: 'problem-decomposition'
    };
  }

  // Build response based on detected errors
  if (detectedErrors.length === 0) {
    // Consider learning state for more personalized feedback
    let explanation = "Your code looks structurally sound! Let's think about the logic together.";
    if (learningState?.strugglingConcepts?.length > 0) {
      explanation += ` Since you've been working on ${learningState.strugglingConcepts[0]}, let's make sure that part is working correctly.`;
    } else {
      explanation += " Consider: What should happen at each step? Are you handling all edge cases?";
    }

    return {
      explanation,
      analogy: "Like proofreading a letter - the spelling might be correct, but does the message make sense?",
      hint: getGenericHint(hintLevel, level),
      syntax: getSyntaxGuidance('general', language),
      nextStep: getNextStep('general', level),
      conceptsTaught: ['code-review', 'logic-analysis'],
      suggestedNextConcept: 'edge-cases'
    };
  }

  // Get the most significant error
  const mainError = detectedErrors[0];

  return {
    explanation: getExplanationForError(mainError, language, level),
    analogy: getAnalogyForError(mainError, level),
    hint: getHintForError(mainError, hintLevel, level),
    syntax: getSyntaxGuidance(mainError.type, language),
    nextStep: getNextStep(mainError.type, level),
    conceptsTaught: [mainError.type],
    suggestedNextConcept: getNextConceptFromError(mainError.type)
  };
}

function getNextConceptFromError(errorType) {
  const conceptMap = {
    syntax: 'language-syntax-rules',
    logic: 'debugging-techniques',
    typo: 'code-reading-skills',
    structure: 'program-organization'
  };
  return conceptMap[errorType] || 'fundamentals';
}

function getSyntaxGuidance(errorType, language) {
  const lang = language.toLowerCase();
  const common = {
    general: "Review statement boundaries and required symbols for this language.",
    syntax: "Check required punctuation and block delimiters for this construct.",
    logic: "Syntax may be correct, but verify operators and conditions match intent.",
    typo: "Keywords and identifiers must be spelled exactly.",
    structure: "Confirm required program structure for this language."
  };

  const languageSpecific = {
    python: {
      syntax: "Python blocks require consistent indentation and a colon after statements.",
      structure: "Functions and classes must be indented consistently under their headers."
    },
    c: {
      syntax: "C statements typically end with semicolons; blocks use braces.",
      structure: "C programs require a main entry point."
    },
    cpp: {
      syntax: "C++ statements typically end with semicolons; blocks use braces.",
      structure: "C++ programs require a main entry point."
    },
    java: {
      syntax: "Java statements typically end with semicolons; blocks use braces.",
      structure: "Java code must be inside a class; entry point is a main method."
    }
  };

  return languageSpecific[lang]?.[errorType] || common[errorType] || common.general;
}

function getNextStep(errorType, level) {
  const steps = {
    general: [
      "Trace the flow with a small example and describe each step in words.",
      "Write down what the code should do at each step, then compare it to what it does.",
      "Identify the first point where actual behavior diverges from expected behavior."
    ],
    syntax: [
      "Find the exact line where the parser would stop and confirm the required token.",
      "Check the line end and block delimiters around the error area.",
      "Verify the statement format against the language's standard pattern."
    ],
    logic: [
      "Pick a sample input and simulate each step, noting variable values.",
      "Compare your intended condition with the operator you used.",
      "List the expected output for a simple case and verify the path matches."
    ],
    typo: [
      "Compare each keyword with the official spelling in the docs.",
      "Scan for near-miss spellings of functions or variables.",
      "Search for repeated identifiers and confirm they match exactly."
    ],
    structure: [
      "List the required structural elements and check which one is missing.",
      "Confirm the entry point signature for this language.",
      "Ensure the code is wrapped in the required container (function/class)."
    ]
  };

  const candidates = steps[errorType] || steps.general;
  return candidates[Math.min(level === 'complex' ? 1 : 0, candidates.length - 1)];
}

/**
 * Generate response for user's specific question
 * Considers learning state for personalized guidance
 */
function generateQuestionResponse(question, code, language, level, hintLevel, learningState) {
  const lowerQ = question.toLowerCase();

  // Check what the user is asking about
  if (lowerQ.includes('analyze') || lowerQ.includes('issue') || lowerQ.includes('wrong')) {
    let response = "Alright, let me take a look at what's happening here. I'll walk you through this step by step.";
    if (learningState?.previousExplanations?.length > 0) {
      response += " Building on what we discussed before...";
    }
    response += " Start by reading through your code line by line - what does each line actually do? Does it match up with what you're trying to accomplish?";
    return { reply: response };
  }

  if (lowerQ.includes('explain') || lowerQ.includes('what') || lowerQ.includes('does')) {
    let response = "Sure, let's break this down together. Instead of just telling you what it does, let me guide you through understanding it.";
    if (learningState?.masteredConcepts?.length > 0) {
      response += ` You already understand ${learningState.masteredConcepts[0]}, so let's build on that.`;
    }
    response += " Try tracing through the code mentally - what happens first? Then what? What are the values at each step?";
    return { reply: response };
  }

  if (lowerQ.includes('hint')) {
    const hints = [
      "Here's something to think about - read your code from the top. Does each line make sense in the context of what you're trying to do?",
      "Think about the inputs and outputs. What goes in? What should come out? Are you handling that correctly?",
      "Consider the edge cases. What happens with empty input? Very large numbers? Unexpected values?",
      "Try tracing through your code with a specific example. Does it actually produce what you expect?",
      "Break the problem into smaller steps. Which step isn't quite working the way you want?"
    ];
    let hint = hints[Math.min(hintLevel - 1, hints.length - 1)];
    if (learningState?.sameErrorRepeated) {
      hint = "Let's try a different approach. " + hint + " Sometimes stepping back and thinking about the problem differently helps.";
    }
    return { reply: hint };
  }

  if (lowerQ.includes('logic')) {
    return { reply: "Let's think about the logic together. What are you actually trying to accomplish? Now look at your code - does each step make sense towards that goal? Sometimes it helps to write out in plain English what you want to happen, then compare that to what your code actually does." };
  }

  // Default response - personalized based on learning state
  let response = "Great question! Let me help you think through this. The key to really learning this is working through it yourself.";
  if (learningState?.hintsGivenThisSession > 2) {
    response += " I notice you've asked for a few hints already - that's totally fine! Let's approach this from a different angle.";
  }
  response += " What's your initial thought about what's happening here? Let's talk through it together.";
  return { reply: response };
}

/**
 * Build a natural conversational error response
 */
function buildNaturalErrorResponse(error, language, level, hintLevel) {
  const errorType = error.type;

  if (errorType === 'syntax') {
    if (level === 'basic') {
      return "I spotted a small grammar hiccup in your code. Just like when we write in English, programming languages have rules about certain symbols and punctuation. Take a close look at the end of your lines - are you missing anything that the language expects to see there?";
    }
    return "There's a syntax issue here. The parser is expecting specific tokens in certain places. Check your statement endings and block delimiters - something's not quite matching what the language expects.";
  }

  if (errorType === 'logic') {
    if (level === 'basic') {
      return "Your code will run, but I don't think it's doing quite what you want. It's like following a recipe but accidentally mixing up teaspoon and tablespoon - everything works, but the result isn't right. Walk through what you expect to happen, then trace what actually happens line by line.";
    }
    return "The logic here isn't quite matching your intent. The code will execute, but the behavior might surprise you. Think about what you're actually asking the computer to do versus what you want it to do.";
  }

  if (errorType === 'typo') {
    return "Looks like there might be a spelling issue somewhere. Computers are super picky about exact spelling - even one letter off and they get confused. Double-check your keywords and function names against what the language actually uses.";
  }

  if (errorType === 'structure') {
    if (level === 'basic') {
      return "Your code is missing some important building blocks. Think of it like a house - you need a foundation before you can add the rooms! What does every program in this language need to have?";
    }
    return "The structure isn't complete. Most programs need certain required elements to work properly. What's the entry point for this language? Make sure you have all the necessary components.";
  }

  return "Let me help you figure out what's going on here. Take a look at your code and tell me - what do you think might be causing the issue? Let's work through this together.";
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
function getAnalogyForError(error) {
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
function getHintForError(error, hintLevel) {
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
function getGenericHint(hintLevel) {
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
 * Safety function to ensure no COMPLETE code solutions leak into response
 * ALLOWS: partial syntax with blanks (___), small snippets for learning
 * BLOCKS: complete function implementations, full solutions
 */
function sanitizeResponse(response) {
  let sanitized = { ...response };

  if (sanitized.reply) {
    // DON'T remove code blocks - we want syntax examples!
    // Only check if a response contains suspiciously complete code

    // Patterns that indicate COMPLETE solutions (not just syntax hints)
    const completeSolutionPatterns = [
      // Complete function with actual logic (not blanks)
      /def \w+\([^)]*\):\s*\n(\s+.+\n){5,}/g,  // Python function with 5+ lines
      /function \w+\([^)]*\)\s*\{[\s\S]{200,}\}/g,  // JS function with lots of code
      /public\s+(static\s+)?\w+\s+\w+\([^)]*\)\s*\{[\s\S]{200,}\}/g,  // Java method
    ];

    let hasCompleteSolution = false;
    for (const pattern of completeSolutionPatterns) {
      if (pattern.test(sanitized.reply)) {
        hasCompleteSolution = true;
        break;
      }
    }

    // Only sanitize if we detect a complete solution
    if (hasCompleteSolution) {
      sanitized.reply = sanitized.reply.replace(/```[\s\S]*?```/g,
        '```\n[Complete solution removed - try writing it yourself!]\n```');
    }
  }

  return sanitized;
}

module.exports = {
  analyzeCode
};

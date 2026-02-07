/**
 * Analyze Image Route
 *
 * POST /analyze-image - Analyze a screenshot (problem or code) and return extracted text
 * For code screenshots, automatically provides analysis
 * For problem screenshots, extracts clean problem statement
 */

const express = require('express');
const multer = require('multer');
const { extractTextFromImage } = require('../services/imageAnalyzer');
const { analyzeCode } = require('../services/aiService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log('[analyze-image] Request received');

  try {
    if (!req.file) {
      console.log('[analyze-image] Error: No file provided');
      return res.status(400).json({
        error: 'Image file is required',
        extractedText: '',
        message: 'Please select an image file to upload.'
      });
    }

    console.log('[analyze-image] File received:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract text from image (now returns object with isCode flag)
    const result = await extractTextFromImage(req.file.buffer);

    // Handle both old string format and new object format
    const extractedText = typeof result === 'string' ? result : result.text;
    const isCode = typeof result === 'object' ? result.isCode : false;
    const detectedLanguage = typeof result === 'object' ? result.language : null;

    if (!extractedText || extractedText.length < 10) {
      console.log('[analyze-image] Could not extract meaningful text');
      return res.json({
        extractedText: '',
        isCode: false,
        message: 'I couldn\'t read the content from this image clearly.\n\n**Tips for better results:**\n• Crop the screenshot to show only the problem or code\n• Make sure the text is clear and not blurry\n• Avoid capturing browser tabs, buttons, or menus\n\nTry uploading a cleaner screenshot!'
      });
    }

    console.log('[analyze-image] Successfully extracted text, length:', extractedText.length, 'isCode:', isCode);

    // If it's code, automatically analyze it
    if (isCode) {
      console.log('[analyze-image] Detected code in image, auto-analyzing...');

      try {
        const analysis = await analyzeCode({
          code: extractedText,
          language: detectedLanguage || 'python',
          level: 'moderate',
          hintLevel: 1,
          userQuestion: 'Please analyze this code from the screenshot. Explain what it does, identify any errors or bugs, and provide guidance on fixing issues.',
          conversationHistory: []
        });

        return res.json({
          extractedText: extractedText,
          isCode: true,
          language: detectedLanguage,
          message: analysis.reply || 'I found code in your image! Here\'s my analysis...',
          analysis: analysis
        });
      } catch (aiError) {
        console.error('[analyze-image] AI analysis failed:', aiError);
        return res.json({
          extractedText: extractedText,
          isCode: true,
          language: detectedLanguage,
          message: `I found ${detectedLanguage || ''} code in your image. What would you like help with?\n\n• Explain what this code does\n• Find bugs or errors\n• Help improve it`
        });
      }
    }

    // For problem statements - provide a clean summary
    // Check if we extracted a meaningful problem
    const hasProblemContent = /\b(given|return|find|array|string|input|output|example)\b/i.test(extractedText);

    if (hasProblemContent) {
      // Try to get AI to summarize/understand the problem
      try {
        const analysis = await analyzeCode({
          code: '',
          language: 'python',
          level: 'moderate',
          hintLevel: 1,
          userQuestion: `I uploaded a problem screenshot. Here's the extracted text:\n\n"${extractedText}"\n\nPlease briefly summarize what this problem is asking (2-3 sentences max), then ask what kind of help I need.`,
          conversationHistory: []
        });

        return res.json({
          extractedText: extractedText,
          isCode: false,
          message: analysis.reply || 'Got it! I can see the problem. What would you like help with?',
          analysis: analysis
        });
      } catch (aiError) {
        console.error('[analyze-image] AI summary failed:', aiError);
      }
    }

    // Default response for problem statements
    res.json({
      extractedText: extractedText,
      isCode: false,
      message: 'Got it! I can see the problem from your screenshot.\n\n**How can I help?**\n• Explain what the problem is asking\n• Give hints on how to approach it\n• Help you understand the examples\n\nJust ask!'
    });

  } catch (error) {
    console.error('[analyze-image] Error:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      extractedText: '',
      message: 'Something went wrong while reading the image. Please try again with a different screenshot.'
    });
  }
});

module.exports = router;

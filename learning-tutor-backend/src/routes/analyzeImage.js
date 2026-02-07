/**
 * Analyze Image Route - Uses AI Vision
 *
 * POST /analyze-image - Analyze a screenshot using AI Vision (Groq)
 * Uses Llama 4 Scout multimodal model for image understanding
 */

const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Groq client for vision
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  console.log('[Image Analyzer] Groq Vision client initialized');
} else {
  console.log('[Image Analyzer] No GROQ_API_KEY - image analysis will not work');
}

// Current working vision models (as of Feb 2026)
const VISION_MODELS = [
  'meta-llama/llama-4-scout-17b-16e-instruct',  // Llama 4 multimodal
  'meta-llama/llama-4-maverick-17b-128e-instruct', // Alternative Llama 4
];

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

    if (!groqClient) {
      console.log('[analyze-image] No Groq client available');
      return res.status(500).json({
        error: 'AI Vision not configured',
        extractedText: '',
        message: 'Image analysis is not configured. Please set up the GROQ_API_KEY.'
      });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('[analyze-image] Sending to AI Vision...');

    // Try each model until one works
    let aiResponse = null;
    let lastError = null;

    for (const model of VISION_MODELS) {
      try {
        console.log(`[analyze-image] Trying model: ${model}`);

        const response = await groqClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image. If it contains code, explain what the code does and identify any bugs or issues. If it contains a programming problem (like from LeetCode), summarize what the problem is asking and suggest an approach to solve it.

Be helpful and provide complete explanations. Format your response nicely with:
- **Headers** for sections
- Code blocks with \`\`\` for any code examples
- Clear step-by-step explanations

Start your response with either "📝 **Code Analysis:**" if it's code, or "📋 **Problem:**" if it's a problem statement.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });

        aiResponse = response.choices[0]?.message?.content || '';
        console.log('[analyze-image] AI response received, length:', aiResponse.length);
        break; // Success, exit loop

      } catch (modelError) {
        console.log(`[analyze-image] Model ${model} failed:`, modelError.message);
        lastError = modelError;
        continue; // Try next model
      }
    }

    if (!aiResponse) {
      // All models failed - throw the last error
      throw lastError || new Error('All vision models failed');
    }

    // Determine if it's code or a problem based on AI response
    const isCode = aiResponse.includes('Code Analysis') ||
      aiResponse.toLowerCase().includes('this code') ||
      aiResponse.toLowerCase().includes('function') ||
      aiResponse.toLowerCase().includes('def ') ||
      aiResponse.toLowerCase().includes('class ');

    return res.json({
      extractedText: aiResponse,
      isCode: isCode,
      message: aiResponse,
      analysis: {
        reply: aiResponse
      }
    });

  } catch (error) {
    console.error('[analyze-image] Error:', error);

    res.status(500).json({
      error: 'Failed to analyze image',
      extractedText: '',
      message: 'Hmm, I had trouble with that image. Failed to analyze image\n\nTips for better results:\n• Make sure text/code is clear and readable\n• Crop to show only the relevant content\n• Ensure good contrast and lighting'
    });
  }
});

module.exports = router;

/**
 * Analyze Image Route
 *
 * POST /analyze-image - Analyze a problem screenshot and return extracted text
 * The actual problem guidance is handled by the /analyze endpoint when user asks questions
 */

const express = require('express');
const multer = require('multer');
const { extractTextFromImage } = require('../services/imageAnalyzer');

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

    // Extract text from image
    const extractedText = await extractTextFromImage(req.file.buffer);

    if (!extractedText || extractedText.length < 20) {
      console.log('[analyze-image] Could not extract meaningful text');
      return res.json({
        extractedText: '',
        message: 'I couldn\'t read the problem from this image. Tips:\n\n• Crop the screenshot to show only the problem statement\n• Make sure the text is clear and not blurry\n• Avoid capturing browser tabs or UI elements\n\nTry uploading a cleaner screenshot!'
      });
    }

    console.log('[analyze-image] Successfully extracted text, length:', extractedText.length);

    res.json({
      extractedText: extractedText,
      message: 'Got it! I can see the problem. Now ask me what you\'d like help with - I can explain the problem, give you hints on how to approach it, or help you understand specific parts.'
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

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateMovieSearch } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');
const { AIService } = require('../services/aiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

const aiService = new AIService();

/**
 * @swagger
 * components:
 *   schemas:
 *     MovieResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         year:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [movie, series]
 *         genre:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *         duration:
 *           type: string
 *         description:
 *           type: string
 *         poster:
 *           type: string
 *         backdrop:
 *           type: string
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *         director:
 *           type: string
 *         confidence:
 *           type: number
 *         platforms:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *               available:
 *                 type: boolean
 *               link:
 *                 type: string
 *               subscription:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/ai/identify:
 *   post:
 *     summary: Identify movie or series using AI
 *     tags: [AI Identification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, actor]
 *                 example: text
 *               query:
 *                 type: string
 *                 example: "A movie about a hacker in a simulated reality"
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Content identified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovieResult'
 *                 processingTime:
 *                   type: number
 *                 confidence:
 *                   type: number
 *                 provider:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: AI processing error
 */
router.post('/identify', optionalAuth, upload.single('file'), validateMovieSearch, asyncHandler(async (req, res) => {
  const { type, query } = req.body;
  const file = req.file;

  // Validate input
  if (!type || (type === 'text' && !query) || ((type === 'image' || type === 'video') && !file)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input. Please provide appropriate data for the selected search type.'
    });
  }

  let processedFile = null;
  if (file) {
    // Process image files
    if (file.mimetype.startsWith('image/')) {
      processedFile = await sharp(file.buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      processedFile = file.buffer;
    }
  }

  // Prepare AI input
  const aiInput = {
    type,
    content: processedFile || query,
    query,
    metadata: {
      originalFilename: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size
    }
  };

  // Process with AI
  const startTime = Date.now();
  const aiResponse = await aiService.identifyContent(aiInput);
  const processingTime = Date.now() - startTime;

  // Save search history if user is authenticated
  if (req.user && aiResponse.success) {
    db.addSearchHistory(req.user.id, {
      type,
      query: query || 'File upload',
      results: aiResponse.results.length,
      confidence: aiResponse.confidence,
      processingTime
    });
  }

  // Save identified movies to database
  if (aiResponse.success) {
    aiResponse.results.forEach(movie => {
      const existingMovies = db.getMovies();
      const exists = existingMovies.find(m => 
        m.title.toLowerCase() === movie.title.toLowerCase() && m.year === movie.year
      );
      
      if (!exists) {
        db.addMovie(movie);
      }
    });
  }

  res.json({
    success: aiResponse.success,
    results: aiResponse.results,
    processingTime,
    confidence: aiResponse.confidence,
    provider: aiService.getCurrentProvider(),
    error: aiResponse.error
  });
}));

/**
 * @swagger
 * /api/ai/providers:
 *   get:
 *     summary: Get available AI providers
 *     tags: [AI Identification]
 *     responses:
 *       200:
 *         description: Available providers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 current:
 *                   type: string
 */
router.get('/providers', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    providers: aiService.getAvailableProviders(),
    current: aiService.getCurrentProvider()
  });
}));

/**
 * @swagger
 * /api/ai/config:
 *   post:
 *     summary: Configure AI provider settings
 *     tags: [AI Identification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 example: openai
 *               apiKey:
 *                 type: string
 *                 example: sk-...
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Invalid configuration
 */
router.post('/config', asyncHandler(async (req, res) => {
  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({
      success: false,
      message: 'Provider and API key are required'
    });
  }

  try {
    aiService.setApiKey(provider, apiKey);
    aiService.setProvider(provider);

    res.json({
      success: true,
      message: 'AI configuration updated successfully',
      provider: aiService.getCurrentProvider()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid configuration',
      error: error.message
    });
  }
}));

module.exports = router;
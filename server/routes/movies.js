const express = require('express');
const { db } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies with optional filtering
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series]
 *         description: Filter by content type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 movies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovieResult'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    genre,
    year,
    type,
    search,
    limit = 20,
    offset = 0
  } = req.query;

  let movies = db.getMovies();

  // Apply filters
  if (genre) {
    movies = movies.filter(movie => 
      movie.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  if (year) {
    movies = movies.filter(movie => movie.year === parseInt(year));
  }

  if (type) {
    movies = movies.filter(movie => movie.type === type);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    movies = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchLower) ||
      movie.description.toLowerCase().includes(searchLower) ||
      movie.cast.some(actor => actor.toLowerCase().includes(searchLower)) ||
      movie.director.toLowerCase().includes(searchLower)
    );
  }

  // Sort by rating (highest first) and then by year (newest first)
  movies.sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.year - a.year;
  });

  // Pagination
  const total = movies.length;
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMovies = movies.slice(startIndex, endIndex);

  res.json({
    success: true,
    movies: paginatedMovies,
    total,
    page: Math.floor(startIndex / limit) + 1,
    totalPages: Math.ceil(total / limit),
    filters: {
      genre,
      year,
      type,
      search
    }
  });
}));

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 movie:
 *                   $ref: '#/components/schemas/MovieResult'
 *       404:
 *         description: Movie not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const movies = db.getMovies();
  const movie = movies.find(m => m.id === id);

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: 'Movie not found'
    });
  }

  res.json({
    success: true,
    movie
  });
}));

/**
 * @swagger
 * /api/movies/genres:
 *   get:
 *     summary: Get all available genres
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Genres retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 genres:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/meta/genres', asyncHandler(async (req, res) => {
  const movies = db.getMovies();
  const genresSet = new Set();

  movies.forEach(movie => {
    movie.genre.forEach(genre => genresSet.add(genre));
  });

  const genres = Array.from(genresSet).sort();

  res.json({
    success: true,
    genres
  });
}));

/**
 * @swagger
 * /api/movies/stats:
 *   get:
 *     summary: Get movie database statistics
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalMovies:
 *                       type: integer
 *                     totalSeries:
 *                       type: integer
 *                     totalGenres:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     yearRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                         max:
 *                           type: integer
 */
router.get('/meta/stats', asyncHandler(async (req, res) => {
  const movies = db.getMovies();
  
  const stats = {
    totalMovies: movies.filter(m => m.type === 'movie').length,
    totalSeries: movies.filter(m => m.type === 'series').length,
    totalGenres: new Set(movies.flatMap(m => m.genre)).size,
    averageRating: movies.length > 0 
      ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
      : 0,
    yearRange: {
      min: movies.length > 0 ? Math.min(...movies.map(m => m.year)) : 0,
      max: movies.length > 0 ? Math.max(...movies.map(m => m.year)) : 0
    }
  };

  res.json({
    success: true,
    stats
  });
}));

module.exports = router;
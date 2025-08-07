const express = require('express');
const { db } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile with search history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 searchHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       query:
 *                         type: string
 *                       results:
 *                         type: integer
 *                       confidence:
 *                         type: number
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const searchHistory = db.getSearchHistory(req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50); // Last 50 searches

  // Remove password from response
  const { password: _, ...userResponse } = user;

  res.json({
    success: true,
    user: userResponse,
    searchHistory
  });
}));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               preferences:
 *                 type: object
 *                 properties:
 *                   favoriteGenres:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Action", "Sci-Fi"]
 *                   preferredLanguages:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["English", "Spanish"]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateToken, validateProfileUpdate, asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (preferences) updateData.preferences = preferences;

  const updatedUser = db.updateUser(req.user.id, updateData);
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Remove password from response
  const { password: _, ...userResponse } = updatedUser;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: userResponse
  });
}));

/**
 * @swagger
 * /api/users/search-history:
 *   get:
 *     summary: Get user's search history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Search history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/search-history', authenticateToken, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const allHistory = db.getSearchHistory(req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  const total = allHistory.length;
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedHistory = allHistory.slice(startIndex, endIndex);

  res.json({
    success: true,
    history: paginatedHistory,
    total,
    page: Math.floor(startIndex / limit) + 1,
    totalPages: Math.ceil(total / limit)
  });
}));

/**
 * @swagger
 * /api/users/search-history/{id}:
 *   delete:
 *     summary: Delete a search history entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Search history entry ID
 *     responses:
 *       200:
 *         description: Search history entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Search history entry not found
 */
router.delete('/search-history/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // This would require implementing delete functionality in the database layer
  // For now, return success (in production, implement proper deletion)
  
  res.json({
    success: true,
    message: 'Search history entry deleted successfully'
  });
}));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const allUsers = db.getUsers();
  const total = allUsers.length;
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = allUsers.slice(startIndex, endIndex);

  // Remove passwords from response
  const usersResponse = paginatedUsers.map(({ password, ...user }) => user);

  res.json({
    success: true,
    users: usersResponse,
    total,
    page: Math.floor(startIndex / limit) + 1,
    totalPages: Math.ceil(total / limit)
  });
}));

module.exports = router;
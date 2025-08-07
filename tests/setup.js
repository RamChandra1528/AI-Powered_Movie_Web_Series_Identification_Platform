// Test setup file
const { db } = require('../server/config/database');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';

// Clean up database before each test
beforeEach(() => {
  // Clean database for each test
  db.saveUsers([]);
  db.saveMovies([]);
  db.writeFile(db.searchHistoryFile, []);
});

// Global test utilities
global.testUtils = {
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!',
    ...overrides
  }),

  createTestMovie: (overrides = {}) => ({
    title: 'Test Movie',
    year: 2023,
    type: 'movie',
    genre: ['Action'],
    rating: 8.0,
    duration: '120 min',
    description: 'A test movie',
    cast: ['Test Actor'],
    director: 'Test Director',
    confidence: 90,
    ...overrides
  })
};
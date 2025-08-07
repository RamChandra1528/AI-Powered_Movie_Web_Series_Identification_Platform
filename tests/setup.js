// Test setup file
const { db } = require('../server/config/database');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';

// Clean up database before each test
beforeEach(() => {
  // Reset test data
  const testUsers = [
    {
      id: 'test-user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: '$2a$12$rOvHPGkwxaXGwxkOVHMoUeQs7QGWqNVOa8T5fKMxEQGwxaXGwxkOV', // password: test123
      role: 'user',
      preferences: {
        favoriteGenres: ['Action'],
        preferredLanguages: ['English']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  db.saveUsers(testUsers);
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
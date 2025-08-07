const request = require('supertest');
const app = require('../server/index');
const { db } = require('../server/config/database');

describe('Movies Endpoints', () => {
  beforeEach(() => {
    // Start with empty movie database - movies will be added via AI identification
    db.saveMovies([]);
  });

  describe('GET /api/movies', () => {
    it('should get all movies', async () => {
      // Add test movies for this specific test
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1', title: 'Test Movie 1' }),
        global.testUtils.createTestMovie({ id: 'movie-2', title: 'Test Movie 2', type: 'series' })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should filter movies by genre', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1', genre: ['Sci-Fi', 'Action'] })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies?genre=Sci-Fi')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].genre).toContain('Sci-Fi');
    });

    it('should filter movies by type', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'series-1', type: 'series' })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies?type=series')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].type).toBe('series');
    });

    it('should filter movies by year', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1', year: 1999 })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies?year=1999')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].year).toBe(1999);
    });

    it('should search movies by title', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1', title: 'The Matrix Test' })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies?search=matrix')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].title.toLowerCase()).toContain('matrix');
    });

    it('should paginate results', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1' }),
        global.testUtils.createTestMovie({ id: 'movie-2' })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies?limit=1&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/movies/:id', () => {
    it('should get movie by ID', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ id: 'movie-1', title: 'Test Movie' })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies/movie-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movie.title).toBe('Test Movie');
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(app)
        .get('/api/movies/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Movie not found');
    });
  });

  describe('GET /api/movies/meta/genres', () => {
    it('should get all available genres', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ genre: ['Sci-Fi', 'Action'] }),
        global.testUtils.createTestMovie({ genre: ['Drama', 'Crime'] })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies/meta/genres')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.genres).toContain('Sci-Fi');
      expect(response.body.genres).toContain('Action');
      expect(response.body.genres).toContain('Drama');
      expect(response.body.genres).toContain('Crime');
    });
  });

  describe('GET /api/movies/meta/stats', () => {
    it('should get movie database statistics', async () => {
      const testMovies = [
        global.testUtils.createTestMovie({ type: 'movie', year: 1999 }),
        global.testUtils.createTestMovie({ type: 'series', year: 2008 })
      ];
      db.saveMovies(testMovies);

      const response = await request(app)
        .get('/api/movies/meta/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.totalMovies).toBe(1);
      expect(response.body.stats.totalSeries).toBe(1);
      expect(response.body.stats.totalGenres).toBeGreaterThan(0);
      expect(response.body.stats.yearRange.min).toBe(1999);
      expect(response.body.stats.yearRange.max).toBe(2008);
    });
  });
});
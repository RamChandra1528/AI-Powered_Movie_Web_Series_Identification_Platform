const request = require('supertest');
const app = require('../server/index');
const { db } = require('../server/config/database');

describe('Movies Endpoints', () => {
  beforeEach(() => {
    // Add test movies
    const testMovies = [
      {
        id: 'movie-1',
        title: 'The Matrix',
        year: 1999,
        type: 'movie',
        genre: ['Sci-Fi', 'Action'],
        rating: 8.7,
        duration: '136 min',
        description: 'A computer programmer discovers reality is a simulation.',
        cast: ['Keanu Reeves', 'Laurence Fishburne'],
        director: 'The Wachowskis',
        confidence: 95,
        platforms: []
      },
      {
        id: 'series-1',
        title: 'Breaking Bad',
        year: 2008,
        type: 'series',
        genre: ['Drama', 'Crime'],
        rating: 9.5,
        duration: '47 min/episode',
        description: 'A chemistry teacher becomes a meth manufacturer.',
        cast: ['Bryan Cranston', 'Aaron Paul'],
        director: 'Vince Gilligan',
        confidence: 98,
        platforms: []
      }
    ];

    db.saveMovies(testMovies);
  });

  describe('GET /api/movies', () => {
    it('should get all movies', async () => {
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should filter movies by genre', async () => {
      const response = await request(app)
        .get('/api/movies?genre=Sci-Fi')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].title).toBe('The Matrix');
    });

    it('should filter movies by type', async () => {
      const response = await request(app)
        .get('/api/movies?type=series')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].title).toBe('Breaking Bad');
    });

    it('should filter movies by year', async () => {
      const response = await request(app)
        .get('/api/movies?year=1999')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].title).toBe('The Matrix');
    });

    it('should search movies by title', async () => {
      const response = await request(app)
        .get('/api/movies?search=matrix')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movies).toHaveLength(1);
      expect(response.body.movies[0].title).toBe('The Matrix');
    });

    it('should paginate results', async () => {
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
      const response = await request(app)
        .get('/api/movies/movie-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.movie.title).toBe('The Matrix');
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
      const response = await request(app)
        .get('/api/movies/meta/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.totalMovies).toBe(1);
      expect(response.body.stats.totalSeries).toBe(1);
      expect(response.body.stats.totalGenres).toBe(4);
      expect(response.body.stats.yearRange.min).toBe(1999);
      expect(response.body.stats.yearRange.max).toBe(2008);
    });
  });
});
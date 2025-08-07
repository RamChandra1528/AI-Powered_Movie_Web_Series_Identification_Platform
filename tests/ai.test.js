const request = require('supertest');
const app = require('../server/index');

describe('AI Endpoints', () => {
  describe('POST /api/ai/identify', () => {
    it('should identify content from text query', async () => {
      const searchData = {
        type: 'text',
        query: 'A movie about hackers and virtual reality'
      };

      const response = await request(app)
        .post('/api/ai/identify')
        .send(searchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBeDefined();
      expect(response.body.processingTime).toBeDefined();
      expect(response.body.confidence).toBeDefined();
      expect(response.body.provider).toBeDefined();
    });

    it('should identify content from actor search', async () => {
      const searchData = {
        type: 'actor',
        query: 'Keanu Reeves'
      };

      const response = await request(app)
        .post('/api/ai/identify')
        .send(searchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBeDefined();
    });

    it('should return error for invalid search type', async () => {
      const searchData = {
        type: 'invalid',
        query: 'test'
      };

      const response = await request(app)
        .post('/api/ai/identify')
        .send(searchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return error for missing query in text search', async () => {
      const searchData = {
        type: 'text'
      };

      const response = await request(app)
        .post('/api/ai/identify')
        .send(searchData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/providers', () => {
    it('should get available AI providers', async () => {
      const response = await request(app)
        .get('/api/ai/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.providers).toBeDefined();
      expect(response.body.current).toBeDefined();
    });
  });

  describe('POST /api/ai/config', () => {
    it('should configure AI provider', async () => {
      const configData = {
        provider: 'openai',
        apiKey: 'test-api-key'
      };

      const response = await request(app)
        .post('/api/ai/config')
        .send(configData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.provider).toBe('openai');
    });

    it('should return error for missing configuration', async () => {
      const configData = {
        provider: 'openai'
        // Missing apiKey
      };

      const response = await request(app)
        .post('/api/ai/config')
        .send(configData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Provider and API key are required');
    });
  });
});
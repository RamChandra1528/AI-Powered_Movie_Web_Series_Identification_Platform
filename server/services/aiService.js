const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Enhanced AI Service for movie identification
 */
class AIService {
  constructor() {
    this.providers = new Map();
    this.currentProvider = 'openai';
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize providers with environment variables or fallback
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey) {
      this.providers.set('openai', new OpenAIProvider(openaiKey));
    }

    if (geminiKey) {
      this.providers.set('gemini', new GeminiProvider(geminiKey));
    }
  }

  setProvider(providerName) {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
    } else {
      throw new Error(`Provider ${providerName} not available`);
    }
  }

  setApiKey(provider, apiKey) {
    if (provider === 'openai') {
      this.providers.set('openai', new OpenAIProvider(apiKey));
    } else if (provider === 'gemini') {
      this.providers.set('gemini', new GeminiProvider(apiKey));
    }
  }

  async identifyContent(input) {
    const provider = this.providers.get(this.currentProvider);
    
    if (!provider) {
      return this.getFallbackResponse(input);
    }

    try {
      const response = await provider.identify(input);
      
      if (response.success) {
        response.results = await this.enhanceResults(response.results);
      }
      
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(input);
    }
  }

  async enhanceResults(results) {
    return results.map(result => ({
      ...result,
      platforms: this.getStreamingPlatforms(result.title, result.year)
    }));
  }

  getStreamingPlatforms(title, year) {
    // Mock streaming platform data
    const platforms = [
      { name: 'Netflix', logo: '🎬', available: Math.random() > 0.5, subscription: true },
      { name: 'Amazon Prime', logo: '📺', available: Math.random() > 0.4, subscription: true },
      { name: 'Disney+', logo: '🏰', available: Math.random() > 0.6, subscription: true },
      { name: 'HBO Max', logo: '🎭', available: Math.random() > 0.5, subscription: true },
      { name: 'Hulu', logo: '📱', available: Math.random() > 0.6, subscription: true },
      { name: 'Apple TV+', logo: '🍎', available: Math.random() > 0.7, subscription: true }
    ];

    return platforms.filter(p => p.available).map(p => ({
      ...p,
      link: p.available ? `#watch-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined
    }));
  }

  getFallbackResponse(input) {
    // No fallback data - require real AI providers
    return {
      success: false,
      results: [],
      processingTime: 0,
      confidence: 0,
      error: 'No AI provider configured. Please configure OpenAI or Gemini API keys.'
    };
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  getCurrentProvider() {
    return this.currentProvider;
  }
}

/**
 * OpenAI GPT-4 Vision Provider
 */
class OpenAIProvider {
  constructor(apiKey) {
    this.name = 'OpenAI GPT-4 Vision';
    this.client = new OpenAI({ apiKey });
  }

  async identify(input) {
    const startTime = Date.now();
    
    try {
      let prompt = this.buildPrompt(input);
      let messages = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        }
      ];

      if (input.type === 'image' && Buffer.isBuffer(input.content)) {
        const base64Image = input.content.toString('base64');
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:${input.metadata?.mimeType || 'image/jpeg'};base64,${base64Image}` 
              } 
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt
        });
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages,
        max_tokens: 2000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const parsedResponse = JSON.parse(content);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        results: parsedResponse.results.map(result => ({
          ...result,
          id: this.generateId(),
          poster: this.generatePosterUrl(result.title),
          backdrop: this.generateBackdropUrl(result.title)
        })),
        processingTime,
        confidence: parsedResponse.results[0]?.confidence || 85
      };

    } catch (error) {
      return {
        success: false,
        results: [],
        processingTime: Date.now() - startTime,
        confidence: 0,
        error: error.message
      };
    }
  }

  buildPrompt(input) {
    switch (input.type) {
      case 'text':
        return `Identify movies or TV series based on this description: "${input.content}". Return detailed information including title, year, genre, cast, director, and streaming platforms.`;
      case 'image':
        return 'Analyze this image and identify the movie or TV series. Look for actors, scenes, logos, or any visual clues. Provide detailed information about the identified content.';
      case 'actor':
        return `Find movies and TV series featuring the actor/actress: "${input.content}". Include their most popular and recent works with detailed information.`;
      case 'video':
        return 'This is a video clip from a movie or TV series. Analyze the visual content, actors, scenes, and dialogue to identify the source material.';
      default:
        return 'Identify the movie or TV series from the provided content.';
    }
  }

  getSystemPrompt() {
    return `You are an expert movie and TV series identification AI. Always respond with a JSON object containing an array of identified content with the following structure:
    {
      "results": [
        {
          "title": "Movie/Series Title",
          "year": 2023,
          "type": "movie" or "series",
          "genre": ["Action", "Drama"],
          "rating": 8.5,
          "duration": "120 min" or "45 min/episode",
          "description": "Brief description",
          "cast": ["Actor 1", "Actor 2"],
          "director": "Director Name",
          "confidence": 95
        }
      ]
    }`;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  generatePosterUrl(title) {
    return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400';
  }

  generateBackdropUrl(title) {
    return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
}

/**
 * Google Gemini Vision Provider
 */
class GeminiProvider {
  constructor(apiKey) {
    this.name = 'Google Gemini Vision';
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async identify(input) {
    const startTime = Date.now();
    
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      let prompt = this.buildPrompt(input);
      let parts = [prompt];

      if (input.type === 'image' && Buffer.isBuffer(input.content)) {
        parts.push({
          inlineData: {
            data: input.content.toString('base64'),
            mimeType: input.metadata?.mimeType || 'image/jpeg'
          }
        });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      const parsedResponse = this.parseGeminiResponse(text);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        results: parsedResponse,
        processingTime,
        confidence: 88
      };

    } catch (error) {
      return {
        success: false,
        results: [],
        processingTime: Date.now() - startTime,
        confidence: 0,
        error: error.message
      };
    }
  }

  buildPrompt(input) {
    switch (input.type) {
      case 'text':
        return `Identify movies or TV series based on this description: "${input.content}". Provide detailed JSON response with title, year, genre, cast, director, and streaming availability.`;
      case 'image':
        return 'Analyze this image to identify the movie or TV series. Look for actors, scenes, text, or visual elements that can help identify the content.';
      case 'actor':
        return `Find movies and TV series featuring: "${input.content}". Include popular works with detailed information in JSON format.`;
      default:
        return 'Identify the movie or TV series from the provided content and return detailed information in JSON format.';
    }
  }

  parseGeminiResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.results || [parsed];
      }
    } catch (e) {
      // Fallback parsing logic
    }
    
    return [{
      id: Math.random().toString(36).substr(2, 9),
      title: 'Content Identified',
      year: 2023,
      type: 'movie',
      genre: ['Unknown'],
      rating: 7.0,
      duration: '120 min',
      description: text.substring(0, 200) + '...',
      poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
      backdrop: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      cast: ['Unknown'],
      director: 'Unknown',
      confidence: 75
    }];
  }
}

module.exports = { AIService, OpenAIProvider, GeminiProvider };
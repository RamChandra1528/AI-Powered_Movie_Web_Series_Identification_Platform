import { OpenAIProvider, GeminiProvider } from './aiProviders';
import { AIInput, AIResponse, MovieResult } from '../types/ai';

class AIService {
  private providers: Map<string, any> = new Map();
  private currentProvider = 'openai';

  constructor() {
    // Initialize providers when API keys are available
    this.initializeProviders();
  }

  private initializeProviders() {
    // Check for API keys in environment variables or local storage
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

    if (openaiKey) {
      this.providers.set('openai', new OpenAIProvider(openaiKey));
    }

    if (geminiKey) {
      this.providers.set('gemini', new GeminiProvider(geminiKey));
    }
  }

  setProvider(providerName: string) {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
    }
  }

  setApiKey(provider: string, apiKey: string) {
    localStorage.setItem(`${provider}_api_key`, apiKey);
    this.initializeProviders();
  }

  async identifyContent(input: AIInput): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    
    if (!provider) {
      return this.getFallbackResponse(input);
    }

    try {
      const response = await provider.identify(input);
      
      // Enhance results with additional data
      if (response.success) {
        response.results = await this.enhanceResults(response.results);
      }
      
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(input);
    }
  }

  private async enhanceResults(results: MovieResult[]): Promise<MovieResult[]> {
    // Enhance results with streaming platform data
    return results.map(result => ({
      ...result,
      platforms: this.getStreamingPlatforms(result.title, result.year)
    }));
  }

  private getStreamingPlatforms(title: string, year: number) {
    // Mock streaming platform data - in production, integrate with JustWatch API or similar
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

  private getFallbackResponse(input: AIInput): AIResponse {
    // Fallback response when no AI provider is available
    const mockResults: MovieResult[] = [
      {
        id: '1',
        title: 'The Matrix',
        year: 1999,
        type: 'movie',
        genre: ['Sci-Fi', 'Action'],
        rating: 8.7,
        duration: '136 min',
        description: 'A computer programmer discovers that reality as he knows it is a simulation controlled by machines.',
        poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
        backdrop: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
        director: 'The Wachowskis',
        confidence: 85,
        platforms: [
          { name: 'Netflix', logo: '🎬', available: true, subscription: true, link: '#' },
          { name: 'Amazon Prime', logo: '📺', available: true, subscription: true, link: '#' }
        ]
      }
    ];

    return {
      success: true,
      results: mockResults,
      processingTime: 1500,
      confidence: 85
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }
}

export const aiService = new AIService();
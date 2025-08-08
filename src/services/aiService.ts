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

    if (openaiKey && this.isValidApiKey('openai', openaiKey)) {
      this.providers.set('openai', new OpenAIProvider(openaiKey));
    }

    if (geminiKey && this.isValidApiKey('gemini', geminiKey)) {
      this.providers.set('gemini', new GeminiProvider(geminiKey));
    }
  }

  private isValidApiKey(provider: string, apiKey: string): boolean {
    // Check for placeholder values and basic format validation
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('here') || apiKey.includes('***')) {
      return false;
    }

    if (provider === 'openai') {
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    }

    if (provider === 'gemini') {
      return apiKey.startsWith('AIza') && apiKey.length > 20;
    }

    return false;
  }

  setProvider(providerName: string) {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
    }
  }

  setApiKey(provider: string, apiKey: string) {
    if (this.isValidApiKey(provider, apiKey)) {
      localStorage.setItem(`${provider}_api_key`, apiKey);
      this.initializeProviders();
      return true;
    }
    return false;
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
    // No fallback data - require real AI providers
    return {
      success: false,
      results: [],
      processingTime: 0,
      confidence: 0,
      error: 'No AI provider configured. Please configure OpenAI or Gemini API keys in settings.'
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
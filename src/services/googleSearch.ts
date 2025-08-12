import { GoogleSearchResult } from '../types/ai';

class GoogleSearchService {
  private apiKey: string | null = null;
  private searchEngineId: string | null = null;

  constructor() {
    // Initialize with environment variables if available
    this.apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || null;
    this.searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || null;
  }

  setCredentials(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
    
    // Store in localStorage for persistence
    localStorage.setItem('google_search_api_key', apiKey);
    localStorage.setItem('google_search_engine_id', searchEngineId);
  }

  private loadCredentials() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('google_search_api_key');
    }
    if (!this.searchEngineId) {
      this.searchEngineId = localStorage.getItem('google_search_engine_id');
    }
  }

  async searchMovies(query: string): Promise<GoogleSearchResult[]> {
    this.loadCredentials();

    if (!this.apiKey || !this.searchEngineId) {
      return [];
    }

    try {
      // Enhance query for better movie/series results
      const enhancedQuery = `${query} movie OR series OR film site:imdb.com OR site:rottentomatoes.com OR site:metacritic.com`;
      
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('cx', this.searchEngineId);
      url.searchParams.set('q', enhancedQuery);
      url.searchParams.set('num', '6');
      url.searchParams.set('safe', 'active');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src
      }));

    } catch (error) {
      console.error('Google Search error:', error);
      return [];
    }
  }

  isConfigured(): boolean {
    this.loadCredentials();
    return !!(this.apiKey && this.searchEngineId);
  }
}

export const googleSearchService = new GoogleSearchService();
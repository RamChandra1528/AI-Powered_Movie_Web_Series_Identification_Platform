export interface AIProvider {
  name: string;
  identify: (input: AIInput) => Promise<AIResponse>;
}

export interface AIInput {
  type: 'text' | 'image' | 'video' | 'actor';
  content: string | File;
  query?: string;
}

export interface AIResponse {
  success: boolean;
  results: MovieResult[];
  googleResults?: GoogleSearchResult[];
  processingTime: number;
  confidence: number;
  error?: string;
}

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  thumbnail?: string;
}

export interface MovieResult {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'series';
  genre: string[];
  rating: number;
  duration: string;
  description: string;
  poster: string;
  backdrop: string;
  cast: string[];
  director: string;
  confidence: number;
  platforms: StreamingPlatform[];
}

export interface StreamingPlatform {
  name: string;
  logo: string;
  available: boolean;
  link?: string;
  subscription?: boolean;
  price?: string;
}
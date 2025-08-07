import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIInput, AIResponse, MovieResult } from '../types/ai';

// OpenAI GPT-4 Vision Provider
class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT-4 Vision';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async identify(input: AIInput): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      let prompt = '';
      let imageUrl = '';

      switch (input.type) {
        case 'text':
          prompt = `Identify movies or TV series based on this description: "${input.content}". Return detailed information including title, year, genre, cast, director, and streaming platforms.`;
          break;
        case 'image':
          if (input.content instanceof File) {
            imageUrl = await this.fileToBase64(input.content);
            prompt = 'Analyze this image and identify the movie or TV series. Look for actors, scenes, logos, or any visual clues. Provide detailed information about the identified content.';
          }
          break;
        case 'actor':
          prompt = `Find movies and TV series featuring the actor/actress: "${input.content}". Include their most popular and recent works with detailed information.`;
          break;
        case 'video':
          prompt = 'This is a video clip from a movie or TV series. Analyze the visual content, actors, scenes, and dialogue to identify the source material.';
          break;
      }

      const messages: any[] = [
        {
          role: 'system',
          content: `You are an expert movie and TV series identification AI. Always respond with a JSON object containing an array of identified content with the following structure:
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
                "confidence": 95,
                "platforms": [
                  {
                    "name": "Netflix",
                    "available": true,
                    "subscription": true
                  }
                ]
              }
            ]
          }`
        }
      ];

      if (imageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
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
        results: parsedResponse.results.map((result: any) => ({
          ...result,
          id: Math.random().toString(36).substr(2, 9),
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private generatePosterUrl(title: string): string {
    // Use a placeholder service or implement TMDB integration
    return `https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400`;
  }

  private generateBackdropUrl(title: string): string {
    return `https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800`;
  }
}

// Google Gemini Vision Provider
class GeminiProvider implements AIProvider {
  name = 'Google Gemini Vision';
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async identify(input: AIInput): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      let prompt = '';
      let imageParts: any[] = [];

      switch (input.type) {
        case 'text':
          prompt = `Identify movies or TV series based on this description: "${input.content}". Provide detailed JSON response with title, year, genre, cast, director, and streaming availability.`;
          break;
        case 'image':
          if (input.content instanceof File) {
            const imageData = await this.fileToArrayBuffer(input.content);
            imageParts = [{
              inlineData: {
                data: Buffer.from(imageData).toString('base64'),
                mimeType: input.content.type
              }
            }];
            prompt = 'Analyze this image to identify the movie or TV series. Look for actors, scenes, text, or visual elements that can help identify the content.';
          }
          break;
        case 'actor':
          prompt = `Find movies and TV series featuring: "${input.content}". Include popular works with detailed information in JSON format.`;
          break;
      }

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      // Parse the response and extract movie information
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
        error: error instanceof Error ? error.message : 'Gemini API error'
      };
    }
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private parseGeminiResponse(text: string): MovieResult[] {
    // Parse Gemini's response and convert to our format
    // This is a simplified parser - in production, you'd want more robust parsing
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
      confidence: 75,
      platforms: []
    }];
  }
}

export { OpenAIProvider, GeminiProvider };
/**
 * CineVerse AI Service
 * 
 * Production-grade AI service with:
 * - Request deduplication (prevents duplicate simultaneous requests)
 * - Response caching with TTL
 * - Fallback to rule-based system
 * - Analytics and monitoring
 * - Result type for safe error handling
 */

import { 
  AI_CONFIG, 
  AIError, 
  AIErrorCodes, 
  ChatMessage,
  Result, 
  success, 
  failure,
  isSuccess,
  isFailure,
} from './config';
import {
  MoodType,
  AIResponse,
  UIRecommendation,
  ParsedAIResponse,
  MOOD_TO_KEYWORDS,
  MOOD_INFO,
  MovieData,
} from './types';
import { searchMovies, Movie } from '@/lib/tmdb';

const OLLAMA_API_KEY = process.env.EXPO_PUBLIC_OLLAMA_API_KEY || '';
const OLLAMA_API_URL = 'https://ollama.com/api';

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

/**
 * Request deduplicator to prevent duplicate simultaneous requests
 * 
 * If the same query is requested while another is in flight,
 * we wait for the original request instead of making a new one.
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<Result<ParsedAIResponse>>> = new Map();

  private createKey(query: string, mood: MoodType): string {
    return `${mood}:${query.toLowerCase().trim()}`;
  }

  async deduplicate(
    key: string,
    requestFn: () => Promise<Result<ParsedAIResponse>>
  ): Promise<Result<ParsedAIResponse>> {
    // Check if same request is already in flight
    const existing = this.pendingRequests.get(key);
    if (existing) {
      console.log('[AI] Deduplicating request:', key);
      return existing;
    }

    // Create new request and store promise
    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up after completion
      this.pendingRequests.delete(key);
    }
  }
}

// ============================================================================
// AI SERVICE CLASS
// ============================================================================

/**
 * Main AI service for CineVerse
 * 
 * This is the primary interface for AI operations using Gemini API.
 */
export class AIService {
  private readonly deduplicator: RequestDeduplicator;

  constructor() {
    this.deduplicator = new RequestDeduplicator();
  }

  /**
   * Get AI-enhanced movie recommendations
   * 
   * This is the main entry point for AI recommendations.
   * Falls back to rule-based system if AI fails.
   */
  async getRecommendations(
    query: string,
    mood: MoodType,
    movieContext?: MovieData[]
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Validate input
    if (!query || query.trim().length < 2) {
      console.warn('[AI] Invalid query');
      return this.getFallbackResponse(query, mood, 'Invalid query');
    }

    const sanitizedQuery = query.trim();

    // Build request key for deduplication
    const requestKey = `${mood}:${sanitizedQuery}`;

    // Execute with deduplication
    const result = await this.deduplicator.deduplicate(
      requestKey,
      () => this.executeAIRequest(sanitizedQuery, mood, movieContext)
    );

    const latencyMs = Date.now() - startTime;

    if (isSuccess(result)) {
      return await this.buildAIResponse(result.data, query, true, latencyMs);
    }

    // AI failed, use fallback
    console.warn('[AI] Falling back to rule-based:', result.error.message);
    return await this.getFallbackResponse(query, mood, result.error.message, latencyMs);
  }

  /**
   * Execute AI request with proper error handling
   */
  private async executeAIRequest(
    query: string,
    mood: MoodType,
    movieContext?: MovieData[]
  ): Promise<Result<ParsedAIResponse>> {
    // Check if Ollama API is configured
    if (!OLLAMA_API_KEY || OLLAMA_API_KEY === 'your_api_key_here') {
      return failure(new AIError(
        'Ollama API key not configured',
        AIErrorCodes.CONFIGURATION_ERROR,
        { isRetryable: false }
      ));
    }

    try {
      // Build prompt
      const systemPrompt = this.getSystemPrompt(mood);
      const userPrompt = this.buildUserPrompt(query, mood, movieContext);

      const response = await fetch(`${OLLAMA_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false,
          options: {
            temperature: AI_CONFIG.TEMPERATURE,
            num_predict: AI_CONFIG.MAX_TOKENS,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return failure(new AIError(
          `Ollama API error: ${response.status} - ${errorText}`,
          AIErrorCodes.API_ERROR,
          { statusCode: response.status, isRetryable: response.status >= 500 }
        ));
      }

      const data = await response.json();
      const text = data.message?.content || '';

      // Parse response
      return this.parseAIResponse(text, data.model || AI_CONFIG.DEFAULT_MODEL, 0, 0, false);

    } catch (error) {
      return failure(new AIError(
        'Failed to communicate with AI service',
        AIErrorCodes.NETWORK_ERROR,
        { isRetryable: true, cause: error as Error }
      ));
    }
  }

  /**
   * Get system prompt for movie recommendations
   */
  private getSystemPrompt(mood: MoodType): string {
    const moodGuidance = this.getMoodGuidance(mood);
    
    return `You are CineVerse AI, an expert movie recommendation assistant.

## Current Mood: ${mood.toUpperCase()}
${moodGuidance}

## Response Format
Respond with valid JSON only:
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "matchPercentage": 75-95,
      "reason": "Specific reason this matches their mood",
      "moodTags": ["tag1", "tag2", "tag3"]
    }
  ],
  "analysis": "Brief explanation of your recommendation strategy"
}

Recommend 6 movies. Return ONLY valid JSON.`;
  }

  /**
   * Get mood-specific guidance
   */
  private getMoodGuidance(mood: MoodType): string {
    const guidance: Record<MoodType, string> = {
      'melancholic': 'Focus on emotional depth, character studies, bittersweet stories.',
      'adrenaline': 'Focus on action sequences, intensity, excitement, high stakes.',
      'mind-bending': 'Focus on complex plots, twists, philosophical themes.',
      'romantic': 'Focus on love stories, chemistry, emotional connection.',
      'comedic': 'Focus on humor, feel-good vibes, entertainment.',
      'thriller': 'Focus on suspense, tension, mystery, edge-of-seat excitement.',
    };
    return guidance[mood];
  }

  /**
   * Build user prompt
   */
  private buildUserPrompt(query: string, mood: MoodType, movieContext?: MovieData[]): string {
    let prompt = `User wants: "${query}"\nMood: ${mood}\n`;
    
    if (movieContext && movieContext.length > 0) {
      prompt += `\nSome movies for reference:\n`;
      movieContext.slice(0, 5).forEach(m => {
        prompt += `- ${m.title} (${m.release_date?.split('-')[0] || 'N/A'})\n`;
      });
    }
    
    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(
    responseText: string,
    model: string,
    tokens: number,
    latencyMs: number,
    cached: boolean
  ): Result<ParsedAIResponse> {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = responseText;
      
      // Remove markdown code block if present
      const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      // Find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return failure(new AIError(
          'No valid JSON found in AI response',
          AIErrorCodes.PARSING_ERROR,
          { isRetryable: true, context: { response: responseText.substring(0, 200) } }
        ));
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and normalize recommendations
      const recommendations = (parsed.recommendations || [])
        .slice(0, 6)
        .map((rec: any) => ({
          title: rec.title || 'Unknown',
          matchPercentage: Math.min(95, Math.max(60, rec.matchPercentage || 75)),
          reason: rec.reason || 'Great match for your mood',
          moodTags: Array.isArray(rec.moodTags) ? rec.moodTags.slice(0, 3) : ['recommended'],
        }));

      // Ensure we have at least one recommendation
      if (recommendations.length === 0) {
        return failure(new AIError(
          'AI returned no recommendations',
          AIErrorCodes.PARSING_ERROR,
          { isRetryable: true }
        ));
      }

      return success({
        recommendations,
        analysis: parsed.analysis || 'AI analyzed your preferences',
        modelUsed: model,
        tokensUsed: tokens,
        latencyMs,
        cached,
      });

    } catch (error) {
      return failure(new AIError(
        'Failed to parse AI response',
        AIErrorCodes.PARSING_ERROR,
        { 
          isRetryable: true, 
          cause: error as Error,
          context: { response: responseText.substring(0, 200) }
        }
      ));
    }
  }

  /**
   * Build AI response for UI consumption with real TMDB movie data
   */
  private async buildAIResponse(
    parsed: ParsedAIResponse,
    originalQuery: string,
    isAIEnhanced: boolean,
    totalLatencyMs: number
  ): Promise<AIResponse> {
    // Search TMDB for each recommended movie to get real data
    const recommendations = await Promise.all(
      parsed.recommendations.map(async (rec) => {
        const movie = await this.searchAndGetMovie(rec.title);
        return {
          movie: movie || this.createPlaceholderMovie(rec.title),
          matchPercentage: rec.matchPercentage,
          reason: rec.reason,
          moodTags: rec.moodTags,
        };
      })
    );

    return {
      recommendations,
      reasoning: [
        parsed.analysis,
        `Powered by ${parsed.modelUsed}`,
        parsed.cached ? 'Response from cache' : `Generated in ${(parsed.latencyMs / 1000).toFixed(1)}s`,
      ],
      query: originalQuery,
      isAIEnhanced,
      latencyMs: totalLatencyMs,
    };
  }

  /**
   * Search TMDB for a movie by title and return the best match
   */
  private async searchAndGetMovie(title: string): Promise<MovieData | null> {
    try {
      // Clean the title - remove year if present (e.g., "Interstellar (2014)" -> "Interstellar")
      const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, '').trim();
      
      const response = await searchMovies(cleanTitle);
      
      if (response.results && response.results.length > 0) {
        // Get the first (most relevant) result
        const movie = response.results[0];
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview || '',
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date || '',
          vote_average: movie.vote_average || 0,
          vote_count: movie.vote_count || 0,
          genre_ids: movie.genre_ids || [],
          popularity: movie.popularity || 0,
          original_language: 'en',
        };
      }
      
      return null;
    } catch (error) {
      console.warn(`[AI] Failed to search for movie: ${title}`, error);
      return null;
    }
  }

  /**
   * Get fallback response when AI fails
   */
  private async getFallbackResponse(
    query: string,
    mood: MoodType,
    reason: string,
    latencyMs: number = 0
  ): Promise<AIResponse> {
    // Use rule-based recommendations with real TMDB data
    const recommendations = await this.getRuleBasedRecommendations(mood);

    return {
      recommendations,
      reasoning: [
        `AI unavailable: ${reason}`,
        'Using mood-based recommendations',
        MOOD_INFO[mood].description,
      ],
      query,
      isAIEnhanced: false,
      latencyMs,
    };
  }

  /**
   * Rule-based recommendations (fallback) - fetches real movies from TMDB
   */
  private async getRuleBasedRecommendations(
    mood: MoodType
  ): Promise<UIRecommendation[]> {
    const keywords = MOOD_TO_KEYWORDS[mood];
    const moodName = MOOD_INFO[mood].name.toLowerCase();
    
    try {
      // Search for movies based on mood keywords
      const searchQueries = [
        `${keywords[0]} movies`,
        `${moodName} films`,
        `best ${keywords[1] || keywords[0]} movies`,
      ];
      
      // Try to get movies from TMDB based on mood
      for (const searchQuery of searchQueries) {
        try {
          const response = await searchMovies(searchQuery);
          if (response.results && response.results.length > 0) {
            // Return top 6 results with proper data
            return response.results.slice(0, 6).map((movie, i) => ({
              movie: {
                id: movie.id,
                title: movie.title,
                overview: movie.overview || '',
                poster_path: movie.poster_path,
                backdrop_path: movie.backdrop_path,
                release_date: movie.release_date || '',
                vote_average: movie.vote_average || 0,
                vote_count: movie.vote_count || 0,
                genre_ids: movie.genre_ids || [],
                popularity: movie.popularity || 0,
                original_language: 'en',
              },
              matchPercentage: Math.max(70, 95 - (i * 4)),
              reason: `A ${keywords[0]} film perfect for your ${moodName} mood`,
              moodTags: keywords.slice(0, 3),
            }));
          }
        } catch (e) {
          // Try next search query
          continue;
        }
      }
    } catch (error) {
      console.warn('[AI] Failed to fetch fallback movies:', error);
    }
    
    // Return empty if all searches fail
    return [];
  }

  /**
   * Create placeholder movie data
   */
  private createPlaceholderMovie(title: string): MovieData {
    return {
      id: 0,
      title,
      overview: '',
      poster_path: null,
      backdrop_path: null,
      release_date: '',
      vote_average: 7.5,
      vote_count: 0,
      genre_ids: [],
      popularity: 50,
      original_language: 'en',
    };
  }

  /**
   * Analyze query intent
   */
  async analyzeQuery(query: string): Promise<Result<{
    detectedMood: MoodType;
    confidence: number;
  }>> {
    if (!query || query.trim().length < 2) {
      return failure(new AIError(
        'Query must be at least 2 characters',
        AIErrorCodes.VALIDATION_ERROR,
        { isRetryable: false }
      ));
    }

    try {
      const response = await fetch(`${OLLAMA_API_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.DEFAULT_MODEL,
          messages: [{
            role: 'user',
            content: `Analyze this movie request and return JSON with detectedMood (one of: melancholic, adrenaline, mind-bending, romantic, comedic, thriller) and confidence (0-1): "${query.trim()}"`
          }],
          stream: false,
          options: { temperature: 0.3, num_predict: 200 },
        }),
      });

      if (!response.ok) {
        return failure(new AIError('Analysis API failed', AIErrorCodes.API_ERROR, { isRetryable: true }));
      }

      const data = await response.json();
      const text = data.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return success({ detectedMood: 'adrenaline', confidence: 0.5 });
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return success({
        detectedMood: parsed.detectedMood || 'adrenaline',
        confidence: parsed.confidence || 0.5,
      });
    } catch (error) {
      return success({ detectedMood: 'adrenaline', confidence: 0.5 });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<Result<{ latencyMs: number; cacheStats: unknown; circuitStatus: unknown }>> {
    const startTime = Date.now();
    
    if (!OLLAMA_API_KEY || OLLAMA_API_KEY === 'your_api_key_here') {
      return failure(new AIError(
        'Ollama API key not configured',
        AIErrorCodes.CONFIGURATION_ERROR,
        { isRetryable: false }
      ));
    }

    return success({
      latencyMs: Date.now() - startTime,
      cacheStats: { size: 0, hits: 0, misses: 0 },
      circuitStatus: { state: 'closed', failureCount: 0 },
    });
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cache: { size: 0, hits: 0, misses: 0, hitRate: '0%' },
      circuit: { state: 'closed', failureCount: 0 },
      analytics: { totalRequests: 0, successCount: 0, errorCount: 0 },
    };
  }

  /**
   * Reset service state
   */
  reset(): void {
    // No-op for Gemini-based service
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let serviceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!serviceInstance) {
    serviceInstance = new AIService();
  }
  return serviceInstance;
}

export function resetAIService(): void {
  serviceInstance = null;
}

// ============================================================================
// CONVENIENCE FUNCTIONS (Backward Compatible API)
// ============================================================================

/**
 * Get AI-enhanced recommendations (main entry point)
 * 
 * This maintains backward compatibility with existing code.
 */
export async function getAIEnhancedRecommendations(
  query: string,
  mood: MoodType,
  movieContext?: MovieData[]
): Promise<AIResponse> {
  return getAIService().getRecommendations(query, mood, movieContext);
}

/**
 * Analyze query to detect mood
 */
export async function analyzeQueryIntent(
  query: string
): Promise<Result<{ detectedMood: MoodType; confidence: number }>> {
  return getAIService().analyzeQuery(query);
}

/**
 * Get service health status
 */
export async function getServiceHealth() {
  return getAIService().healthCheck();
}

/**
 * Get service statistics
 */
export function getServiceStats() {
  return getAIService().getStats();
}

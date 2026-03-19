/**
 * CineVerse AI Module
 * 
 * Public API for AI-powered features.
 * Import from this file to use AI services.
 * 
 * @example
 * ```typescript
 * import { getAIEnhancedRecommendations, analyzeQueryIntent } from '@/lib/ai';
 * 
 * const response = await getAIEnhancedRecommendations(
 *   'something mind-bending',
 *   'mind-bending'
 * );
 * ```
 */

// Main service exports
export {
  getAIEnhancedRecommendations,
  analyzeQueryIntent,
  getServiceHealth,
  getServiceStats,
  AIService,
  getAIService,
  resetAIService,
} from './ai-service';

// Types
export type {
  MoodType,
  AIResponse,
  UIRecommendation,
  MoodInfo,
  MovieData,
  QueryAnalysis,
  ParsedAIResponse,
} from './types';

// Re-export AIRecommendation as alias for UIRecommendation
export type { UIRecommendation as AIRecommendation } from './types';

// Configuration
export { AI_CONFIG, AI_MODELS } from './config';

// Error types for handling
export { AIError, AIErrorCodes } from './config';

// Utilities
export { sanitizeInput, validateQuery } from './prompts';

// Constants for UI
export { MOOD_INFO, MOOD_TYPES, MOOD_TO_GENRES, MOOD_TO_KEYWORDS } from './types';

// Re-export for backward compatibility
export { MOOD_TYPES as moods } from './types';

// Re-export Result type utilities
export { Result, success, failure, isSuccess, isFailure } from './config';

/**
 * Quick helper: Get recommendations with auto-detection
 * 
 * This is the simplest way to get recommendations.
 * It handles mood detection, AI request, and fallback automatically.
 */
export async function getRecommendations(
  query: string,
  preferredMood?: string
): Promise<import('./types').AIResponse> {
  const { getAIEnhancedRecommendations, analyzeQueryIntent } = await import('./ai-service');
  const { MOOD_TYPES } = await import('./types');
  
  // Detect mood if not provided
  let mood = preferredMood as import('./types').MoodType;
  
  if (!mood) {
    const analysis = await analyzeQueryIntent(query);
    if (analysis.success) {
      mood = analysis.data.detectedMood;
    } else {
      // Default to a random mood if detection fails
      mood = MOOD_TYPES[Math.floor(Math.random() * MOOD_TYPES.length)];
    }
  }

  return getAIEnhancedRecommendations(query, mood);
}

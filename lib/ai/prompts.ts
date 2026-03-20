/**
 * CineVerse AI - Prompt Templates
 * 
 * Production-grade prompt management with:
 * - Input sanitization to prevent injection
 * - Few-shot examples for better AI responses
 * - Structured output validation
 * - Dynamic context building
 */

import { MoodType } from './types';
import { AI_CONFIG, AIError, AIErrorCodes, ChatMessage, Result, success, failure } from './config';

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/** Characters that could indicate prompt injection attempts */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /new\s+(role|persona|character)\s*:/i,
  /system\s*:\s*you/i,
  /\[INST\]|\[\/INST\]/i,
  /<<SYS>>|<\/SYS>>/i,
];

/**
 * Sanitize user input to prevent prompt injection
 * 
 * Security Note: Never trust user input in LLM prompts
 */
export function sanitizeInput(input: string): string {
  let sanitized = input;

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn('[Security] Suspicious input pattern detected, sanitizing');
      sanitized = sanitized.replace(pattern, '[filtered]');
    }
  }

  // Remove potential control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim excessive whitespace
  sanitized = sanitized.replace(/\s{3,}/g, ' ').trim();

  // Limit length
  if (sanitized.length > AI_CONFIG.MAX_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, AI_CONFIG.MAX_QUERY_LENGTH);
  }

  return sanitized;
}

/**
 * Validate user query before processing
 */
export function validateQuery(query: string): Result<string, AIError> {
  if (!query || typeof query !== 'string') {
    return failure(new AIError(
      'Query must be a non-empty string',
      AIErrorCodes.VALIDATION_ERROR,
      { isRetryable: false }
    ));
  }

  const trimmed = query.trim();
  
  if (trimmed.length < 2) {
    return failure(new AIError(
      'Query is too short. Please provide more details.',
      AIErrorCodes.VALIDATION_ERROR,
      { isRetryable: false }
    ));
  }

  if (trimmed.length > AI_CONFIG.MAX_QUERY_LENGTH) {
    return failure(new AIError(
      `Query exceeds maximum length of ${AI_CONFIG.MAX_QUERY_LENGTH} characters`,
      AIErrorCodes.VALIDATION_ERROR,
      { isRetryable: false }
    ));
  }

  return success(sanitizeInput(trimmed));
}

// ============================================================================
// FEW-SHOT EXAMPLES
// ============================================================================

/**
 * Few-shot examples to guide AI responses
 * 
 * Learning: Including examples dramatically improves output quality
 */
const FEW_SHOT_EXAMPLES = [
  {
    input: 'I want something mind-bending like Inception',
    mood: 'mind-bending' as MoodType,
    exampleResponse: `{
  "recommendations": [
    {
      "title": "Interstellar",
      "matchPercentage": 88,
      "reason": "Features the same blend of emotional depth and complex scientific concepts as Inception",
      "moodTags": ["thought-provoking", "visually stunning", "emotional"]
    },
    {
      "title": "Shutter Island",
      "matchPercentage": 85,
      "reason": "Twists your perception of reality with an unreliable narrator",
      "moodTags": ["psychological", "mysterious", "gripping"]
    }
  ],
  "analysis": "These recommendations focus on films with complex narratives that challenge your perception, similar to Inception's layered dream structure."
}`,
  },
  {
    input: 'I need to laugh, something light-hearted',
    mood: 'comedic' as MoodType,
    exampleResponse: `{
  "recommendations": [
    {
      "title": "The Grand Budapest Hotel",
      "matchPercentage": 92,
      "reason": "Witty dialogue and quirky characters deliver consistent laughs",
      "moodTags": ["whimsical", "visually delightful", "charming"]
    }
  ],
  "analysis": "Focusing on films with sharp humor and feel-good vibes to brighten your mood."
}`,
  },
];

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * System prompt for movie recommendations
 * Enhanced with clear instructions and output format
 */
export const getMovieRecommendationSystemPrompt = (mood: MoodType): string => {
  const moodGuidance = getMoodGuidance(mood);
  const fewShotExample = FEW_SHOT_EXAMPLES.find(e => e.mood === mood) || FEW_SHOT_EXAMPLES[0];

  return `You are CineVerse AI, an expert movie recommendation assistant with deep knowledge of cinema.

## Your Role
You analyze user mood and preferences to recommend perfect movie matches.

## Current User Mood: ${mood.toUpperCase()}
${moodGuidance}

## Example Interaction
User: "${fewShotExample.input}"
Your Response:
${fewShotExample.exampleResponse}

## Your Task
Analyze the user's request and recommend 6 movies. Consider:
1. The specified mood and any specific preferences mentioned
2. Movie quality (prefer highly-rated films)
3. Variety in your recommendations

## Response Format
IMPORTANT: Respond with valid JSON only. No additional text outside the JSON.

\`\`\`json
{
  "recommendations": [
    {
      "title": "Exact Movie Title (year)",
      "matchPercentage": 75-95,
      "reason": "Specific reason this matches their mood/preference (1-2 sentences)",
      "moodTags": ["tag1", "tag2", "tag3"]
    }
  ],
  "analysis": "Brief explanation of your recommendation strategy (2-3 sentences)"
}
\`\`\`

## Guidelines
- Match percentages should be realistic (60-95%, rarely 100%)
- Provide specific, personalized reasons (avoid generic phrases)
- Use 2-3 mood tags from: emotional, thrilling, mysterious, romantic, funny, intense, thought-provoking, visually stunning, suspenseful, heartwarming, dark, uplifting
- Include a mix of well-known and lesser-known quality films
- Focus on movies available on major streaming platforms`;
};

/**
 * Get mood-specific guidance
 */
function getMoodGuidance(mood: MoodType): string {
  const guidance: Record<MoodType, string> = {
    'melancholic': `
- Focus on: Emotional depth, character studies, bittersweet stories
- Examples: The Shawshank Redemption, Eternal Sunshine of the Spotless Mind
- Avoid: Overly cheerful or frivolous content`,

    'adrenaline': `
- Focus on: Action sequences, intensity, excitement, high stakes
- Examples: Mad Max: Fury Road, John Wick, The Dark Knight
- Avoid: Slow-paced, contemplative films`,

    'mind-bending': `
- Focus on: Complex plots, twists, philosophical themes, reality-bending
- Examples: Inception, Primer, Memento, Arrival
- Avoid: Straightforward narratives`,

    'romantic': `
- Focus on: Love stories, chemistry, emotional connection, relationships
- Examples: Before Sunrise, The Notebook, La La Land
- Avoid: Action-heavy or overly dark content`,

    'comedic': `
- Focus on: Humor, feel-good vibes, entertainment, wit
- Examples: The Big Lebowski, Superbad, Groundhog Day
- Avoid: Heavy dramatic content`,

    'thriller': `
- Focus on: Suspense, tension, mystery, edge-of-seat excitement
- Examples: Se7en, Gone Girl, Zodiac, Prisoners
- Avoid: Light comedies or romance`,
  };

  return guidance[mood];
}

/**
 * Build user prompt with context
 */
export function buildUserPrompt(
  query: string,
  mood: MoodType,
  movieContext?: string[]
): string {
  let prompt = `## User's Current Mood: ${mood}\n`;
  prompt += `## Their Request: "${query}"\n\n`;

  if (movieContext && movieContext.length > 0) {
    prompt += `## Popular Movies (for reference)\n`;
    prompt += movieContext.slice(0, AI_CONFIG.MAX_CONTEXT_MOVIES).join('\n');
    prompt += '\n\n';
  }

  prompt += `Based on the mood and request above, recommend 6 movies with detailed explanations.`;

  return prompt;
}

/**
 * Build complete message array for AI
 */
export function buildPromptMessages(
  query: string,
  mood: MoodType,
  movieContext?: string[]
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: getMovieRecommendationSystemPrompt(mood),
    },
    {
      role: 'user',
      content: buildUserPrompt(query, mood, movieContext),
    },
  ];
}

/**
 * Build query analysis prompt for intent detection
 */
export function buildAnalysisMessages(query: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a movie preference analyzer. Extract intent from user queries.

Analyze the user's request and provide a JSON response:

\`\`\`json
{
  "detectedMood": "melancholic|adrenaline|mind-bending|romantic|comedic|thriller",
  "confidence": 0.0-1.0,
  "genres": ["genre1", "genre2"],
  "themes": ["theme1", "theme2"],
  "similarMovies": ["Movie 1", "Movie 2"]
}
\`\`\`

Consider emotional keywords, genre preferences, and similar movie references.`,
    },
    {
      role: 'user',
      content: `Analyze this request: "${sanitizeInput(query)}"`,
    },
  ];
}

// ============================================================================
// PROMPT UTILITIES
// ============================================================================

/**
 * Format movie list for prompt context
 */
export function formatMovieContext(
  movies: Array<{ 
    title: string; 
    genre_ids?: number[]; 
    genres?: Array<{ id: number; name: string }>;
    vote_average: number;
    release_date?: string;
  }>
): string[] {
  return movies
    .slice(0, AI_CONFIG.MAX_CONTEXT_MOVIES)
    .map(movie => {
      const year = movie.release_date?.split('-')[0] || '';
      const rating = movie.vote_average.toFixed(1);
      const yearStr = year ? ` (${year})` : '';
      return `- ${movie.title}${yearStr} - Rating: ${rating}/10`;
    });
}

/**
 * Create a simple prompt for quick generation
 */
export function buildSimplePrompt(query: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a helpful movie recommendation assistant. Respond in JSON format:
{
  "recommendations": [{"title": "", "matchPercentage": 80, "reason": "", "moodTags": []}],
  "analysis": ""
}`,
    },
    {
      role: 'user',
      content: sanitizeInput(query),
    },
  ];
}

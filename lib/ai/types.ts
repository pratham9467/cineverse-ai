/**
 * CineVerse AI - Shared Types
 * 
 * Common type definitions used across AI modules.
 */

/** Mood types for movie recommendations */
export type MoodType = 'melancholic' | 'adrenaline' | 'mind-bending' | 'romantic' | 'comedic' | 'thriller';

/** All valid mood types as array for iteration */
export const MOOD_TYPES: MoodType[] = [
  'melancholic',
  'adrenaline',
  'mind-bending',
  'romantic',
  'comedic',
  'thriller',
];

/** Mood display information */
export interface MoodInfo {
  id: MoodType;
  name: string;
  description: string;
  icon: string;
}

/** Mood display configuration */
export const MOOD_INFO: Record<MoodType, MoodInfo> = {
  'melancholic': { 
    id: 'melancholic',
    name: 'Melancholic', 
    description: 'Deep, emotional stories',
    icon: '🎭',
  },
  'adrenaline': { 
    id: 'adrenaline',
    name: 'Adrenaline', 
    description: 'Action-packed thrills',
    icon: '⚡',
  },
  'mind-bending': { 
    id: 'mind-bending',
    name: 'Mind-Bending', 
    description: 'Twists & turns',
    icon: '🧠',
  },
  'romantic': { 
    id: 'romantic',
    name: 'Romantic', 
    description: 'Love & connection',
    icon: '❤️',
  },
  'comedic': { 
    id: 'comedic',
    name: 'Comedic', 
    description: 'Laughter & joy',
    icon: '😂',
  },
  'thriller': { 
    id: 'thriller',
    name: 'Thriller', 
    description: 'Suspense & mystery',
    icon: '😱',
  },
};

/** Movie data structure (compatible with TMDB Movie type) */
export interface MovieData {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

/** Movie recommendation from AI (for UI consumption) */
export interface AIRecommendation {
  movie: MovieData;
  matchPercentage: number;
  reason: string;
  moodTags: string[];
}

/** Raw AI recommendation from parsed JSON (before TMDB lookup) */
export interface RawAIRecommendation {
  title: string;
  matchPercentage: number;
  reason: string;
  moodTags: string[];
}

/** Parsed AI response */
export interface ParsedAIResponse {
  recommendations: RawAIRecommendation[];
  analysis: string;
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  cached: boolean;
}

/** AI service response for UI */
export interface AIResponse {
  recommendations: AIRecommendation[];
  reasoning: string[];
  query: string;
  isAIEnhanced: boolean;
  latencyMs: number;
}

/** Query analysis result */
export interface QueryAnalysis {
  detectedMood: MoodType;
  confidence: number;
  genres: string[];
  themes: string[];
  similarMovies: string[];
}

/** Mood to TMDB genre mapping */
export const MOOD_TO_GENRES: Record<MoodType, number[]> = {
  'melancholic': [18, 36, 878],     // Drama, History, Sci-Fi
  'adrenaline': [28, 12, 53],       // Action, Adventure, Thriller
  'mind-bending': [878, 9648, 53],  // Sci-Fi, Mystery, Thriller
  'romantic': [10749, 18, 35],      // Romance, Drama, Comedy
  'comedic': [35, 10751, 16],       // Comedy, Family, Animation
  'thriller': [53, 80, 9648],       // Thriller, Crime, Mystery
};

/** Mood to keywords mapping */
export const MOOD_TO_KEYWORDS: Record<MoodType, string[]> = {
  'melancholic': ['emotional', 'touching', 'poignant', 'bittersweet', 'reflective'],
  'adrenaline': ['action-packed', 'intense', 'explosive', 'fast-paced', 'exciting'],
  'mind-bending': ['complex', 'twist', 'psychological', 'mind-bending', 'thought-provoking'],
  'romantic': ['love', 'romantic', 'heartwarming', 'chemistry', 'passionate'],
  'comedic': ['funny', 'hilarious', 'laugh', 'comedy', 'entertaining'],
  'thriller': ['suspense', 'tense', 'mystery', 'dark', 'gripping'],
};

/** TMDB genre ID to name mapping */
export const GENRE_NAMES: Record<number, string> = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'history',
  27: 'horror',
  10402: 'music',
  9648: 'mystery',
  10749: 'romance',
  878: 'science fiction',
  10770: 'TV movie',
  53: 'thriller',
  10752: 'war',
  37: 'western',
};

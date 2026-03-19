import { Movie, getPopularMovies, searchMovies, getTrendingMovies, getImageUrl } from './tmdb';

export type MoodType = 'melancholic' | 'adrenaline' | 'mind-bending' | 'romantic' | 'comedic' | 'thriller';

export interface AIRecommendation {
  movie: Movie;
  matchPercentage: number;
  reason: string;
  moodTags: string[];
}

export interface AIResponse {
  recommendations: AIRecommendation[];
  reasoning: string[];
  query: string;
}

// Mood to TMDB genre mapping
const moodToGenres: Record<MoodType, number[]> = {
  'melancholic': [18, 36, 878], // Drama, History, Sci-Fi
  'adrenaline': [28, 12, 53], // Action, Adventure, Thriller
  'mind-bending': [878, 9648, 53], // Sci-Fi, Mystery, Thriller
  'romantic': [10749, 18, 35], // Romance, Drama, Comedy
  'comedic': [35, 10751, 16], // Comedy, Family, Animation
  'thriller': [53, 80, 9648], // Thriller, Crime, Mystery
};

// Mood to keywords for better recommendations
const moodToKeywords: Record<MoodType, string[]> = {
  'melancholic': ['emotional', 'touching', 'poignant', 'bittersweet', 'reflective'],
  'adrenaline': ['action-packed', 'intense', 'explosive', 'fast-paced', 'exciting'],
  'mind-bending': ['complex', 'twist', 'psychological', 'mind-bending', 'thought-provoking'],
  'romantic': ['love', 'romantic', 'heartwarming', 'chemistry', 'passionate'],
  'comedic': ['funny', 'hilarious', 'laugh', 'comedy', 'hilarious'],
  'thriller': ['suspense', 'tense', 'mystery', 'dark', 'gripping'],
};

// AI reasoning templates
const reasoningTemplates: Record<MoodType, string[]> = {
  'melancholic': [
    'Based on your {mood} mood, I recommend films that explore deep emotions.',
    'These selections match your preference for {genre} stories.',
    'Perfect for moments of reflection and emotional depth.',
  ],
  'adrenaline': [
    'Time to get your heart pumping with these {mood} picks!',
    'High-octane {genre} films that will keep you on the edge.',
    'Adrenaline-fueled adventures await!',
  ],
  'mind-bending': [
    'These films will challenge your perception of reality.',
    'Prepare for {genre} stories that twist and turn.',
    'Movies that make you think outside the box.',
  ],
  'romantic': [
    'Love is in the air with these {mood} selections.',
    'Heartwarming {genre} stories about connection.',
    'Perfect for those who believe in love.',
  ],
  'comedic': [
    'Get ready to laugh with these {mood} picks!',
    'Light-hearted {genre} films to brighten your day.',
    'Laughter is the best medicine!',
  ],
  'thriller': [
    'These {mood} films will keep you guessing.',
    'Edge-of-your-seat {genre} experiences.',
    'Prepare for suspense and intrigue.',
  ],
};

// Map common query terms to moods
const queryToMood: Record<string, MoodType> = {
  'sad': 'melancholic',
  'emotional': 'melancholic',
  'cry': 'melancholic',
  'happy': 'comedic',
  'funny': 'comedic',
  'laugh': 'comedic',
  'action': 'adrenaline',
  'exciting': 'adrenaline',
  'intense': 'adrenaline',
  'scary': 'thriller',
  'horror': 'thriller',
  'suspense': 'thriller',
  'love': 'romantic',
  'romance': 'romantic',
  'date': 'romantic',
  'thinking': 'mind-bending',
  'complex': 'mind-bending',
  'twist': 'mind-bending',
};

export const detectMoodFromQuery = (query: string): MoodType | null => {
  const lowerQuery = query.toLowerCase();
  for (const [keyword, mood] of Object.entries(queryToMood)) {
    if (lowerQuery.includes(keyword)) {
      return mood;
    }
  }
  return null;
};

export const getRecommendationsByMood = async (
  mood: MoodType,
  page: number = 1
): Promise<AIRecommendation[]> => {
  try {
    const genreIds = moodToGenres[mood].join(',');
    const data = await getPopularMovies(page);
    
    // Filter and sort by genre match
    const recommendations: AIRecommendation[] = data.results
      .filter(movie => movie.vote_average > 5.0)
      .slice(0, 6)
      .map(movie => {
        const matchingGenres = movie.genre_ids.filter(id => moodToGenres[mood].includes(id));
        const matchPercentage = Math.min(98, Math.round(60 + (matchingGenres.length * 15) + (movie.vote_average * 2)));
        
        return {
          movie,
          matchPercentage,
          reason: getReasonForMood(mood, matchingGenres.length > 0),
          moodTags: moodToKeywords[mood].slice(0, 3),
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

export const searchRecommendations = async (
  query: string,
  mood?: MoodType
): Promise<AIRecommendation[]> => {
  try {
    const detectedMood = mood || detectMoodFromQuery(query);
    
    // Try to search for movies based on query
    const searchTerms = extractMovieKeywords(query);
    let movies: Movie[] = [];
    
    if (searchTerms) {
      const searchData = await searchMovies(searchTerms);
      movies = searchData.results;
    }
    
    if (movies.length < 3) {
      // Fallback to mood-based recommendations
      const moodRecs = await getRecommendationsByMood(detectedMood || 'adrenaline');
      return moodRecs;
    }
    
    return movies.slice(0, 6).map(movie => ({
      movie,
      matchPercentage: Math.round(70 + (movie.vote_average * 3)),
      reason: `Matches your interest in "${searchTerms}"`,
      moodTags: detectedMood ? moodToKeywords[detectedMood].slice(0, 2) : ['recommended'],
    }));
  } catch (error) {
    console.error('Error searching recommendations:', error);
    return [];
  }
};

export const getAIResponse = async (
  query: string,
  selectedMood: MoodType
): Promise<AIResponse> => {
  const detectedMood = detectMoodFromQuery(query) || selectedMood;
  const recommendations = await searchRecommendations(query, detectedMood);
  
  const reasoning = reasoningTemplates[detectedMood].map(template =>
    template
      .replace('{mood}', detectedMood)
      .replace('{genre}', getGenreName(moodToGenres[detectedMood][0]))
  );

  return {
    recommendations,
    reasoning,
    query,
  };
};

// Helper functions
const getReasonForMood = (mood: MoodType, hasGenreMatch: boolean): string => {
  const reasons: Record<MoodType, string[]> = {
    'melancholic': ['Perfect for a reflective evening', 'Deeply emotional storytelling'],
    'adrenaline': ['Heart-pounding action sequences', 'Edge-of-your-seat excitement'],
    'mind-bending': ['Will challenge your perception', 'Complex narrative structure'],
    'romantic': ['Chemistry that sparkles', 'Heartwarming love story'],
    'comedic': ['Guaranteed to make you laugh', 'Light-hearted fun'],
    'thriller': ['Keeps you guessing till the end', 'Tense and gripping'],
  };
  
  const options = reasons[mood];
  return options[hasGenreMatch ? 0 : 1];
};

const extractMovieKeywords = (query: string): string => {
  // Remove common words and extract meaningful keywords
  const stopWords = ['i', 'want', 'to', 'watch', 'see', 'movie', 'film', 'something', 'like', 'a', 'an', 'the', 'for', 'me'];
  const words = query.toLowerCase().split(' ').filter(w => !stopWords.includes(w) && w.length > 2);
  return words.slice(0, 3).join(' ');
};

const getGenreName = (genreId: number): string => {
  const genreNames: Record<number, string> = {
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
    878: 'sci-fi',
    10770: 'TV movie',
    53: 'thriller',
    10752: 'war',
    37: 'western',
  };
  return genreNames[genreId] || 'cinema';
};

// Get mood display info
export const getMoodInfo = (mood: MoodType): { name: string; description: string } => {
  const moodInfo: Record<MoodType, { name: string; description: string }> = {
    'melancholic': { name: 'Melancholic', description: 'Deep, emotional stories' },
    'adrenaline': { name: 'Adrenaline', description: 'Action-packed thrills' },
    'mind-bending': { name: 'Mind-Bending', description: 'Twists & turns' },
    'romantic': { name: 'Romantic', description: 'Love & connection' },
    'comedic': { name: 'Comedic', description: 'Laughter & joy' },
    'thriller': { name: 'Thriller', description: 'Suspense & mystery' },
  };
  return moodInfo[mood];
};

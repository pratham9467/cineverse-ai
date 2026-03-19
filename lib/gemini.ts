import { Movie, searchMovies, getPopularMovies, getImageUrl } from './tmdb';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface AIRecommendation {
  movie: Movie;
  matchPercentage: number;
  reason: string;
  moodTags: string[];
}

export interface AIResponse {
  recommendations: AIRecommendation[];
  reasoning: string;
  query: string;
}

// System prompt for Gemini to understand it's a movie recommendation AI
const SYSTEM_PROMPT = `You are CineVerse AI, an expert movie recommendation assistant. Your job is to understand what the user wants to watch and return EXACTLY 5-7 movie recommendations.

When a user describes what they want to watch:
1. Understand their mood, preferences, and what kind of experience they're looking for
2. Return movie recommendations in this EXACT JSON format:

{
  "movies": [
    {"title": "Movie Title", "year": 2023, "reason": "Why this movie fits their request"},
    {"title": "Another Movie", "year": 2020, "reason": "Brief reason"}
  ],
  "summary": "A brief 1-2 sentence summary of why these movies were chosen"
}

Rules:
- Return EXACTLY 5-7 movies (no more, no less)
- Include the year the movie was released
- Give a brief reason for each recommendation
- Focus on well-known, highly-rated movies that likely exist in TMDB
- Consider the user's emotional state and what they're looking for
- If they mention a specific movie, recommend similar ones
- Only return the JSON, no other text`;

// Fallback recommendations based on mood keywords
const fallbackByMood: Record<string, { titles: string[], tags: string[] }> = {
  sad: { titles: ['The Pursuit of Happyness', 'Forrest Gump', 'The Shawshank Redemption', 'Dead Poets Society', 'Good Will Hunting'], tags: ['uplifting', 'emotional', 'hopeful'] },
  happy: { titles: ['The Grand Budapest Hotel', 'Amélie', 'The Intouchables', 'La La Land', 'The Secret Life of Walter Mitty'], tags: ['feel-good', 'joyful', 'uplifting'] },
  action: { titles: ['Mad Max: Fury Road', 'John Wick', 'The Dark Knight', 'Inception', 'Gladiator'], tags: ['action-packed', 'thrilling', 'intense'] },
  scary: { titles: ['Get Out', 'A Quiet Place', 'Hereditary', 'The Conjuring', 'It Follows'], tags: ['horror', 'suspense', 'terrifying'] },
  romantic: { titles: ['The Notebook', 'Pride and Prejudice', 'Titanic', 'La La Land', 'Before Sunrise'], tags: ['romantic', 'love', 'heartwarming'] },
  comedy: { titles: ['Superbad', 'The Hangover', 'Bridesmaids', 'Step Brothers', 'Hot Fuzz'], tags: ['funny', 'hilarious', 'comedy'] },
  thriller: { titles: ['Gone Girl', 'Se7en', 'Zodiac', 'Prisoners', 'Shutter Island'], tags: ['suspense', 'mystery', 'gripping'] },
  scifi: { titles: ['Interstellar', 'Blade Runner 2049', 'Arrival', 'Ex Machina', 'The Matrix'], tags: ['sci-fi', 'futuristic', 'mind-bending'] },
  default: { titles: ['Inception', 'The Dark Knight', 'Parasite', 'Everything Everywhere All at Once', 'The Shawshank Redemption'], tags: ['must-watch', 'acclaimed', 'masterpiece'] },
};

const detectMoodKeywords = (text: string): string | null => {
  const lower = text.toLowerCase();
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('emotional')) return 'sad';
  if (lower.includes('happy') || lower.includes('feel good') || lower.includes('uplifting')) return 'happy';
  if (lower.includes('action') || lower.includes('exciting') || lower.includes('adventure')) return 'action';
  if (lower.includes('scary') || lower.includes('horror') || lower.includes('terrif')) return 'scary';
  if (lower.includes('romance') || lower.includes('love') || lower.includes('date')) return 'romantic';
  if (lower.includes('funny') || lower.includes('comedy') || lower.includes('laugh')) return 'comedy';
  if (lower.includes('thriller') || lower.includes('suspense') || lower.includes('mystery')) return 'thriller';
  if (lower.includes('sci-fi') || lower.includes('sci fi') || lower.includes('future') || lower.includes('space')) return 'scifi';
  return null;
};

export const getAIRecommendations = async (userQuery: string): Promise<AIResponse> => {
  // First try Gemini API if available
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
    try {
      return await getGeminiRecommendations(userQuery);
    } catch (error) {
      console.log('Gemini API failed, using fallback:', error);
    }
  }
  
  // Fallback to local intelligence
  return getLocalRecommendations(userQuery);
};

const getGeminiRecommendations = async (userQuery: string): Promise<AIResponse> => {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `\n\nUser request: "${userQuery}"\n\nReturn your JSON response:` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse the JSON from Gemini's response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON in Gemini response');
  }

  const aiResult = JSON.parse(jsonMatch[0]);
  
  // Search TMDB for each recommended movie and build recommendations
  const recommendations: AIRecommendation[] = [];
  
  for (const movie of aiResult.movies.slice(0, 7)) {
    try {
      const searchResult = await searchMovies(movie.title);
      if (searchResult.results.length > 0) {
        const bestMatch = findBestMatch(movie.title, movie.year, searchResult.results);
        recommendations.push({
          movie: bestMatch,
          matchPercentage: Math.min(98, Math.round(70 + (bestMatch.vote_average * 3))),
          reason: movie.reason,
          moodTags: extractTags(userQuery),
        });
      }
    } catch (e) {
      console.log('Error searching for movie:', movie.title);
    }
  }

  if (recommendations.length === 0) {
    return getLocalRecommendations(userQuery);
  }

  return {
    recommendations,
    reasoning: aiResult.summary || 'Based on your preferences, here are my top picks for you.',
    query: userQuery,
  };
};

const getLocalRecommendations = async (userQuery: string): Promise<AIResponse> => {
  const mood = detectMoodKeywords(userQuery);
  const fallback = fallbackByMood[mood || 'default'];
  
  const recommendations: AIRecommendation[] = [];
  
  for (const title of fallback.titles) {
    try {
      const searchResult = await searchMovies(title);
      if (searchResult.results.length > 0) {
        recommendations.push({
          movie: searchResult.results[0],
          matchPercentage: Math.round(85 + Math.random() * 10),
          reason: `Perfect for when you're looking for ${fallback.tags.join(', ')} content`,
          moodTags: fallback.tags,
        });
      }
    } catch (e) {
      console.log('Error searching for fallback movie:', title);
    }
  }

  // If we couldn't find any movies, fall back to popular movies
  if (recommendations.length === 0) {
    return getPopularFallback(userQuery);
  }

  return {
    recommendations,
    reasoning: mood 
      ? `Based on your ${mood} mood, I've curated these picks that should hit the spot.`
      : 'Here are some highly-rated movies I think you\'ll enjoy.',
    query: userQuery,
  };
};

const getPopularFallback = async (userQuery: string): Promise<AIResponse> => {
  try {
    const popular = await getPopularMovies();
    const movies = popular.results.slice(0, 6);
    const recommendations: AIRecommendation[] = movies.map((movie, index) => ({
      movie,
      matchPercentage: Math.round(90 - index * 3),
      reason: `A highly-rated movie that's popular right now`,
      moodTags: ['popular', 'trending'],
    }));
    return {
      recommendations,
      reasoning: 'Here are some of the most popular movies right now. The AI service is temporarily unavailable, but these crowd-pleasers should satisfy your movie cravings.',
      query: userQuery,
    };
  } catch (error) {
    // If even popular movies fail, return empty (should not happen)
    console.error('Failed to fetch popular movies:', error);
    return {
      recommendations: [],
      reasoning: 'Unable to fetch recommendations at this time. Please try again later.',
      query: userQuery,
    };
  }
};

// Helper to find best matching movie from search results
const findBestMatch = (title: string, year: number, results: Movie[]): Movie => {
  const normalizedSearchTitle = title.toLowerCase().trim();
  
  // First try exact title match
  const exactMatch = results.find(m => 
    m.title.toLowerCase().trim() === normalizedSearchTitle
  );
  if (exactMatch) return exactMatch;
  
  // Then try close title match with year
  const closeMatch = results.find(m => 
    m.title.toLowerCase().includes(normalizedSearchTitle.substring(0, 10)) &&
    m.release_date?.startsWith(year.toString())
  );
  if (closeMatch) return closeMatch;
  
  // Then try just close title match
  const partialMatch = results.find(m => 
    m.title.toLowerCase().includes(normalizedSearchTitle.substring(0, 10))
  );
  if (partialMatch) return partialMatch;
  
  // Fallback to highest rated
  return results.sort((a, b) => b.vote_average - a.vote_average)[0];
};

// Extract tags from user query
const extractTags = (query: string): string[] => {
  const tags: string[] = [];
  const lower = query.toLowerCase();
  
  if (lower.includes('action')) tags.push('action');
  if (lower.includes('comedy') || lower.includes('funny')) tags.push('comedy');
  if (lower.includes('drama') || lower.includes('emotional')) tags.push('drama');
  if (lower.includes('sci-fi') || lower.includes('science fiction')) tags.push('sci-fi');
  if (lower.includes('horror') || lower.includes('scary')) tags.push('horror');
  if (lower.includes('romance') || lower.includes('love')) tags.push('romance');
  if (lower.includes('thriller') || lower.includes('suspense')) tags.push('thriller');
  
  return tags.length > 0 ? tags : ['recommended'];
};

// Get quick suggestions based on current mood/trend
export const getQuickSuggestions = (): string[] => [
  'Something mind-bending like Inception',
  'Feel-good movies for a rainy day',
  'Hidden gems I might have missed',
  'Best sci-fi of the last 5 years',
  'Movies that will make me think',
  'Action-packed with great story',
  'Romantic but not cheesy',
  'Dark and atmospheric thrillers',
];

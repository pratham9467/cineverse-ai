const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
  release_date: string;
  overview?: string;
  adult?: boolean;
  popularity?: number;
  vote_count?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetails extends Movie {
  runtime: number;
  overview: string;
  genres: Genre[];
  adult: boolean;
  tagline?: string;
  status?: string;
}

export interface Genre {
  id: number;
  name: string;
}

const fetchFromTMDB = async (endpoint: string, params: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  const queryString = queryParams.toString();
  const url = `${TMDB_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

export const getPopularMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/movie/popular', { page, language: 'en-US' });
};

export const getGenres = async (): Promise<Genre[]> => {
  const data = await fetchFromTMDB('/genre/movie/list', { language: 'en-US' });
  return data.genres;
};

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/search/movie', { query, page, language: 'en-US' });
};

export const getImageUrl = (path: string | null, size: string = 'w342'): string | null => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const formatReleaseYear = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  return dateString.split('-')[0];
};

export const getTrendingMovies = async (): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/trending/movie/day', { language: 'en-US' });
};

export const getNowPlayingMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/movie/now_playing', { page, language: 'en-US' });
};

export const getMovieDetails = async (id: string | number): Promise<MovieDetails> => {
  return fetchFromTMDB(`/movie/${id}`, { language: 'en-US' });
};

export const getMovieCredits = async (id: string | number): Promise<Credits> => {
  return fetchFromTMDB(`/movie/${id}/credits`, { language: 'en-US' });
};

export const formatRating = (rating: number): string => {
  return rating ? rating.toFixed(1) : 'N/A';
};

export const formatRuntime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// ============================================================================
// ADVANCED SEARCH
// ============================================================================

export interface AdvancedSearchParams {
  page?: number
  year?: number | null
  genreIds?: number[]
  minRating?: number
  sortBy?: string
  language?: string
  includeAdult?: boolean
}

export const discoverMovies = async (params: AdvancedSearchParams = {}): Promise<{ results: Movie[]; total_pages: number; total_results: number }> => {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    language: 'en-US',
    sort_by: params.sortBy || 'popularity.desc',
    include_adult: params.includeAdult || false,
    include_video: false
  }

  if (params.year) {
    queryParams.primary_release_year = params.year
  }

  if (params.genreIds && params.genreIds.length > 0) {
    queryParams.with_genres = params.genreIds.join(',')
  }

  if (params.minRating && params.minRating > 0) {
    queryParams.vote_average_gte = params.minRating
    queryParams.vote_count_gte = 100 // Ensure minimum vote count for relevance
  }

  if (params.language) {
    queryParams.with_original_language = params.language
  }

  return fetchFromTMDB('/discover/movie', queryParams)
}

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/discover/movie', {
    page,
    language: 'en-US',
    with_genres: genreId,
    sort_by: 'popularity.desc'
  })
}

export const getUpcomingMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/movie/upcoming', { page, language: 'en-US' })
}

export const getTopRatedMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB('/movie/top_rated', { page, language: 'en-US' })
}

export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<{ results: Movie[] }> => {
  return fetchFromTMDB(`/movie/${movieId}/similar`, { page, language: 'en-US' })
}

export const getMovieVideos = async (movieId: number): Promise<{ results: Video[] }> => {
  return fetchFromTMDB(`/movie/${movieId}/videos`, { language: 'en-US' })
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

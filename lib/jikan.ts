import Constants from 'expo-constants';
import 'react-native-url-polyfill';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getApiToken = (): string => {
  // First try app.json extra config
  const extra = Constants.expoConfig?.extra;
  if (extra?.EXPO_PUBLIC_TMDB_API_KEY) {
    return extra.EXPO_PUBLIC_TMDB_API_KEY;
  }
  // Fallback to process.env
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_TMDB_API_KEY) {
    return process.env.EXPO_PUBLIC_TMDB_API_KEY;
  }
  return '';
};

const API_TOKEN = getApiToken();

export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
};

export const getImageUrl = (
  path: string | null,
  size: string = 'w500'
): string | null => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: Genre[];
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface GenreResponse {
  genres: Genre[];
}

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  if (!API_TOKEN) {
    throw new Error('TMDB API token not configured.');
  }

  const urlParams = new URLSearchParams(params);
  const url = `${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`;
  console.log('TMDB Request:', endpoint);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TMDB API Error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Custom error class so callers can detect rate-limit failures specifically
export class JikanRateLimitError extends Error {
  isRateLimit = true;
  constructor() {
    super('Jikan API rate limit reached (429). Please wait a moment and try again.');
    this.name = 'JikanRateLimitError';
  }
}

const fetchFromJikan = async <T>(endpoint: string, retries = 3): Promise<T> => {
  const url = `${JIKAN_BASE_URL}${endpoint}`;
  console.log('Jikan Request:', endpoint);

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (response.status === 429) {
      if (attempt < retries) {
        // Exponential back-off: 1 s, 2 s, 4 s …
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.warn(`Jikan 429 – retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      // All retries exhausted
      throw new JikanRateLimitError();
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jikan API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Should never reach here
  throw new JikanRateLimitError();
};

export interface AnimeGenre {
  mal_id: number;
  type: string;
  name: string;
}

export interface AnimeImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp?: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface Aired {
  from: string;
  to: string | null;
  prop: {
    from: {
      day: number;
      month: number;
      year: number;
    };
    to: {
      day: number;
      month: number;
      year: number;
    } | null;
  };
  string: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: AnimeImages;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  duration: string | null;
  score: number | null;
  scored_by: number | null;
  year: number | null;
  synopsis: string | null;
  genres: AnimeGenre[];
  aired: Aired;
}

export const getAnimeById = async (animeId: number): Promise<Anime> => {
  const data = await fetchFromJikan<{ data: Anime }>(`/anime/${animeId}/full`);
  return data.data;
};

export const searchAnime = async (query: string, page: number = 1): Promise<{ data: Anime[]; pagination: { last_visible_page: number } }> => {
  return fetchFromJikan(`/anime?page=${page}&limit=25&q=${encodeURIComponent(query)}`);
};

export const getTopAnime = async (page: number = 1): Promise<{ data: Anime[]; pagination: { last_visible_page: number } }> => {
  return fetchFromJikan(`/top/anime?page=${page}&limit=25`);
};

export const getSeasonalAnime = async (page: number = 1): Promise<{ data: Anime[]; pagination: { last_visible_page: number } }> => {
  return fetchFromJikan(`/seasons/now?page=${page}&limit=25`);
};

export const getAnimeGenres = async (): Promise<{ mal_id: number; name: string; count: number }[]> => {
  const data = await fetchFromJikan<{ data: { mal_id: number; name: string; count: number }[] }>('/genres/anime');
  return data.data;
};

export const formatAnimeRating = (score: number | null): string => {
  if (score === null) return 'N/A';
  return score.toFixed(1);
};

export const formatAnimeYear = (anime: Anime): string => {
  if (anime.year) return anime.year.toString();
  if (anime.aired?.from) return anime.aired.from.split('-')[0];
  return 'N/A';
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/trending/movie/week');
  return data.results;
};

export const getPopularMovies = async (page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
  return fetchFromTMDB('/movie/popular', { page: page.toString() });
};

export const getTopRatedMovies = async (page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
  return fetchFromTMDB('/movie/top_rated', { page: page.toString() });
};

export const getNowPlayingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/movie/now_playing');
  return data.results;
};

export const getUpcomingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/movie/upcoming');
  return data.results;
};

export const getMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  return fetchFromTMDB<MovieDetails>(`/movie/${movieId}`);
};

export const getMovieCredits = async (movieId: string): Promise<Credits> => {
  return fetchFromTMDB<Credits>(`/movie/${movieId}/credits`);
};

export const searchMovies = async (query: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
  return fetchFromTMDB('/search/movie', { 
    query, 
    page: page.toString() 
  });
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> => {
  return fetchFromTMDB('/discover/movie', {
    with_genres: genreId.toString(),
    page: page.toString(),
  });
};

export const getGenres = async (): Promise<Genre[]> => {
  const data = await fetchFromTMDB<GenreResponse>('/genre/movie/list');
  return data.genres;
};

export const getRecommendedMovies = async (movieId: string): Promise<Movie[]> => {
  const data = await fetchFromTMDB<{ results: Movie[] }>(`/movie/${movieId}/recommendations`);
  return data.results;
};

export const getSimilarMovies = async (movieId: string): Promise<Movie[]> => {
  const data = await fetchFromTMDB<{ results: Movie[] }>(`/movie/${movieId}/similar`);
  return data.results;
};

export const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatReleaseYear = (releaseDate: string): string => {
  if (!releaseDate) return 'N/A';
  return releaseDate.split('-')[0];
};

export const formatRating = (rating: number | null): string => {
   if (rating === null) return 'N/A';
   return rating.toFixed(1);
};

export const getGenreNames = (genreIds: number[], genres: Genre[]): string => {
  return genreIds
    .map(id => genres.find(g => g.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

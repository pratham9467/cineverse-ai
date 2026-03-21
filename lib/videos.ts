import { getMovieVideos, getEpisodeVideos, Video } from './tmdb';

// YouTube base URLs
const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';
const YOUTUBE_THUMBNAIL_BASE_URL = 'https://img.youtube.com/vi/';

/**
 * Find the best video from a list of TMDB videos
 */
const findBestVideo = (videos: Video[]): Video | null => {
  // Filter for YouTube videos only
  const youtubeVideos = videos.filter(video => video.site === 'YouTube');
  
  if (youtubeVideos.length === 0) return null;
  
  // Prefer official trailers
  const officialTrailer = youtubeVideos.find(
    video => video.official && video.type === 'Trailer'
  );
  if (officialTrailer) return officialTrailer;
  
  // Then any official video
  const officialVideo = youtubeVideos.find(video => video.official);
  if (officialVideo) return officialVideo;
  
  // Then any trailer
  const trailer = youtubeVideos.find(video => video.type === 'Trailer');
  if (trailer) return trailer;
  
  // Then any teaser
  const teaser = youtubeVideos.find(video => video.type === 'Teaser');
  if (teaser) return teaser;
  
  // Return first available YouTube video
  return youtubeVideos[0];
};

/**
 * Get the best trailer for a movie
 */
export const getBestTrailer = async (movieId: number): Promise<Video | null> => {
  try {
    const { results } = await getMovieVideos(movieId);
    return findBestVideo(results);
  } catch (error) {
    console.error('Error fetching trailer:', error);
    return null;
  }
};

/**
 * Get the best trailer for a TV episode
 */
export const getBestEpisodeTrailer = async (seriesId: number, seasonNumber: number, episodeNumber: number): Promise<Video | null> => {
  try {
    const { results } = await getEpisodeVideos(seriesId, seasonNumber, episodeNumber);
    return findBestVideo(results);
  } catch (error) {
    console.error('Error fetching episode trailer:', error);
    return null;
  }
};

/**
 * Get all trailers for a movie
 */
export const getTrailers = async (movieId: number): Promise<Video[]> => {
  try {
    const { results } = await getMovieVideos(movieId);
    return results.filter(video => 
      video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
  } catch (error) {
    console.error('Error fetching trailers:', error);
    return [];
  }
};

/**
 * Get alternative trailers for a movie (if first one fails)
 */
export const getAlternativeTrailers = async (movieId: number, excludeKey?: string): Promise<Video[]> => {
  try {
    const trailers = await getTrailers(movieId);
    if (excludeKey) {
      return trailers.filter(video => video.key !== excludeKey);
    }
    return trailers;
  } catch (error) {
    console.error('Error fetching alternative trailers:', error);
    return [];
  }
};

/**
 * Check if a video is likely to be embeddable
 * Some YouTube videos are blocked from embedding
 */
export const isEmbeddable = async (videoKey: string): Promise<boolean> => {
  // In a real app, you might check the YouTube Data API
  // For now, we'll assume most videos are embeddable
  // Users can fall back to YouTube app if needed
  return true;
};

/**
 * Get video thumbnail as fallback image
 */
export const getVideoThumbnail = (videoKey: string): string => {
  return `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
};

/**
 * Get YouTube URL from video key
 */
export const getYouTubeUrl = (videoKey: string): string => {
  return `${YOUTUBE_BASE_URL}${videoKey}`;
};

/**
 * Get YouTube thumbnail URL from video key
 */
export const getYouTubeThumbnail = (videoKey: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string => {
  return `${YOUTUBE_THUMBNAIL_BASE_URL}${videoKey}/${quality}.jpg`;
};

/**
 * Get YouTube embed URL from video key
 * Uses simple string concatenation for React Native compatibility
 */
export const getYouTubeEmbedUrl = (videoKey: string, origin?: string): string => {
  const baseUrl = `https://www.youtube.com/embed/${videoKey}`;
  const originUrl = origin || 'https://www.youtube.com';
  const params = [
    'autoplay=1',
    'controls=1',
    'modestbranding=1',
    'rel=0',
    'showinfo=0',
    'strict-origin-when-cross-origin',
    'iv_load_policy=3',
    'fs=1',
    'enablejsapi=1',
    `origin=${encodeURIComponent(originUrl)}`,
    `widget_referrer=${encodeURIComponent(originUrl)}`,
  ].join('&');
  return `${baseUrl}?${params}`;
};

/**
 * Get YouTube app URL (for fallback)
 */
export const getYouTubeAppUrl = (videoKey: string): string => {
  return `https://www.youtube.com/watch?v=${videoKey}`;
};

/**
 * Get YouTube mobile URL (for browsers)
 */
export const getYouTubeMobileUrl = (videoKey: string): string => {
  return `https://m.youtube.com/watch?v=${videoKey}`;
};

/**
 * Extract video key from YouTube URL
 */
export const extractVideoKey = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Check if a video is suitable for autoplay (not age-restricted, etc.)
 */
export const isAutoplaySuitable = (video: Video): boolean => {
  // In a real app, you might want to check more properties
  // For now, we'll assume all official videos are suitable
  return video.official;
};

/**
 * Get video duration in formatted string (MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get available video qualities (mock - in real app this would come from YouTube API)
 */
export const getAvailableQualities = (): string[] => {
  return ['360p', '480p', '720p', '1080p'];
};

/**
 * Get playback speed options
 */
export const getPlaybackSpeeds = (): number[] => {
  return [0.5, 0.75, 1, 1.25, 1.5, 2];
};
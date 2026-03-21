/**
 * YouTube Player Utility
 * 
 * This utility handles YouTube video playback with multiple fallback strategies
 * to handle embedding restrictions (error 153) that are common with movie trailers.
 * 
 * Strategy:
 * 1. Try to play in app using react-native-youtube-iframe
 * 2. If embedding fails (error 153), provide "Watch on YouTube" fallback
 * 3. Show video thumbnail with play button as last resort
 */

import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/**
 * Open YouTube video in external app/browser
 * This bypasses embedding restrictions
 */
export const openYouTubeExternal = async (videoKey: string): Promise<boolean> => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;
  const youtubeAppUrl = Platform.select({
    ios: `youtube://${videoKey}`,
    android: `vnd.youtube://${videoKey}`,
    default: youtubeUrl,
  });

  try {
    // Try to open in YouTube app first
    const canOpenApp = await Linking.canOpenURL(youtubeAppUrl!);
    if (canOpenApp) {
      await Linking.openURL(youtubeAppUrl!);
      return true;
    }
    
    // Fall back to browser
    await WebBrowser.openBrowserAsync(youtubeUrl);
    return true;
  } catch (error) {
    console.error('Error opening YouTube:', error);
    
    // Last resort: open in system browser
    try {
      await Linking.openURL(youtubeUrl);
      return true;
    } catch (e) {
      console.error('Error opening browser:', e);
      return false;
    }
  }
};

/**
 * Check if YouTube app is installed
 */
export const isYouTubeAppInstalled = async (): Promise<boolean> => {
  const youtubeAppUrl = Platform.select({
    ios: 'youtube://',
    android: 'vnd.youtube://',
    default: 'https://youtube.com',
  });

  try {
    return await Linking.canOpenURL(youtubeAppUrl!);
  } catch {
    return false;
  }
};

/**
 * Get optimal video quality based on network
 */
export const getOptimalQuality = (): 'high' | 'medium' | 'low' => {
  // In a real app, you'd check network status
  // For now, default to high
  return 'high';
};

/**
 * Video player state
 */
export enum VideoPlayerState {
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error',
}

/**
 * Error types for video playback
 */
export enum VideoErrorType {
  EMBEDDING_RESTRICTED = 'embedding_restricted', // Error 153
  NETWORK_ERROR = 'network_error',
  VIDEO_NOT_FOUND = 'video_not_found',
  UNKNOWN = 'unknown',
}

/**
 * Determine error type from error message
 */
export const getErrorType = (errorMessage: string): VideoErrorType => {
  if (errorMessage.includes('153') || 
      errorMessage.includes('embedding') ||
      errorMessage.includes('restricted')) {
    return VideoErrorType.EMBEDDING_RESTRICTED;
  }
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return VideoErrorType.NETWORK_ERROR;
  }
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return VideoErrorType.VIDEO_NOT_FOUND;
  }
  return VideoErrorType.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (errorType: VideoErrorType): string => {
  switch (errorType) {
    case VideoErrorType.EMBEDDING_RESTRICTED:
      return 'This video cannot be played in the app due to embedding restrictions. Please watch on YouTube.';
    case VideoErrorType.NETWORK_ERROR:
      return 'Network error. Please check your internet connection.';
    case VideoErrorType.VIDEO_NOT_FOUND:
      return 'Video not found. It may have been removed.';
    default:
      return 'An error occurred while loading the video.';
  }
};
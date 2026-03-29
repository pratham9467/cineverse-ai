import { CONFIG, databases } from "./appwrite";
import Constants from "expo-constants";

const getCollectionId = (): string => {
  const extra = Constants.expoConfig?.extra;
  if (extra?.EXPO_PUBLIC_APPWRITE_WATCH_HISTORY_COLLECTION_ID) {
    return extra.EXPO_PUBLIC_APPWRITE_WATCH_HISTORY_COLLECTION_ID;
  }
  return (
    process.env.EXPO_PUBLIC_APPWRITE_WATCH_HISTORY_COLLECTION_ID || "watch_history"
  );
};

const WATCH_HISTORY_COLLECTION_ID = getCollectionId();

export interface WatchHistoryItem {
  $id: string;
  $createdAt?: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieBackdrop: string;
  watchedAt: string; // ISO date string
  durationWatched: number; // seconds
  totalDuration: number; // seconds (if known)
  completed: boolean; // watched more than 80%
  source: 'trailer' | 'full_movie';
  videoUrl: string; // YouTube URL or video key
  playbackSpeed: number;
  quality: string;
}

/**
 * Add an item to watch history
 */
export const addToWatchHistory = async (
  userId: string,
  movieId: number,
  movieTitle: string,
  moviePoster: string,
  movieBackdrop: string,
  durationWatched: number,
  totalDuration: number = 0,
  source: 'trailer' | 'full_movie' = 'trailer',
  videoUrl: string = '',
  playbackSpeed: number = 1,
  quality: string = '720p'
): Promise<WatchHistoryItem | null> => {
  try {
    const data = {
      userId,
      movieId: String(movieId),
      movieTitle,
      moviePoster: moviePoster || "",
      movieBackdrop: movieBackdrop || "",
      watchedAt: new Date().toISOString(),
      durationWatched,
      totalDuration,
      completed: totalDuration > 0 ? (durationWatched / totalDuration) >= 0.8 : false,
      source,
      videoUrl,
      playbackSpeed,
      quality,
    };

    const response = await databases.createDocument(
      CONFIG.databaseId,
      WATCH_HISTORY_COLLECTION_ID,
      "unique()",
      data,
    );

    return response as unknown as WatchHistoryItem;
  } catch (error: any) {
    console.error("Error adding to watch history:", error?.message || error);
    return null;
  }
};

/**
 * Get watch history for a user
 */
export const getWatchHistory = async (
  userId: string,
  limit: number = 50
): Promise<WatchHistoryItem[]> => {
  try {
    const response = await databases.listDocuments(
      CONFIG.databaseId,
      WATCH_HISTORY_COLLECTION_ID,
    );
    
    const filteredDocs = response.documents
      .filter((doc: any) => doc.userId === userId)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.watchedAt || a.$createdAt).getTime();
        const dateB = new Date(b.watchedAt || b.$createdAt).getTime();
        return dateB - dateA; // Most recent first
      })
      .slice(0, limit)
      .map((doc: any) => ({
        ...doc,
        movieId: doc.movieId,
        durationWatched: doc.durationWatched || 0,
        totalDuration: doc.totalDuration || 0,
        completed: doc.completed || false,
        source: doc.source || 'trailer',
        playbackSpeed: doc.playbackSpeed || 1,
        quality: doc.quality || '720p',
      }));

    return filteredDocs as unknown as WatchHistoryItem[];
  } catch (error: any) {
    console.error("Error getting watch history:", error?.message || error);
    return [];
  }
};

/**
 * Update watch progress for an existing history item
 */
export const updateWatchProgress = async (
  historyItemId: string,
  durationWatched: number,
  totalDuration: number
): Promise<boolean> => {
  try {
    const completed = totalDuration > 0 ? (durationWatched / totalDuration) >= 0.8 : false;
    
    await databases.updateDocument(
      CONFIG.databaseId,
      WATCH_HISTORY_COLLECTION_ID,
      historyItemId,
      {
        durationWatched,
        totalDuration,
        completed,
        watchedAt: new Date().toISOString(),
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return false;
  }
};

/**
 * Clear watch history for a user
 */
export const clearWatchHistory = async (userId: string): Promise<boolean> => {
  try {
    const history = await getWatchHistory(userId, 1000); // Get all items
    
    for (const item of history) {
      await databases.deleteDocument(
        CONFIG.databaseId,
        WATCH_HISTORY_COLLECTION_ID,
        item.$id
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing watch history:", error);
    return false;
  }
};

/**
 * Check if a movie has been watched before
 */
export const hasWatched = async (
  userId: string,
  movieId: number
): Promise<{ watched: boolean; lastWatched: string | null; progress: number }> => {
  try {
    const history = await getWatchHistory(userId, 100);
    const movieHistory = history.find(item => item.movieId === String(movieId));
    
    if (movieHistory) {
      const progress = movieHistory.totalDuration > 0 
        ? (movieHistory.durationWatched / movieHistory.totalDuration) * 100
        : 0;
      
      return {
        watched: true,
        lastWatched: movieHistory.watchedAt,
        progress: Math.min(progress, 100),
      };
    }
    
    return { watched: false, lastWatched: null, progress: 0 };
  } catch (error) {
    console.error("Error checking watch status:", error);
    return { watched: false, lastWatched: null, progress: 0 };
  }
};

/**
 * Get recently watched movies (for recommendations)
 */
export const getRecentlyWatched = async (
  userId: string,
  limit: number = 10
): Promise<WatchHistoryItem[]> => {
  try {
    const history = await getWatchHistory(userId, limit * 2);
    
    // Group by movieId and get the most recent watch for each movie
    const movieMap = new Map<string, WatchHistoryItem>();
    
    for (const item of history) {
      const existing = movieMap.get(item.movieId);
      if (!existing || new Date(item.watchedAt) > new Date(existing.watchedAt)) {
        movieMap.set(item.movieId, item);
      }
    }
    
    return Array.from(movieMap.values())
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recently watched:", error);
    return [];
  }
};
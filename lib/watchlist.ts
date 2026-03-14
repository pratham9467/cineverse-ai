import Constants from "expo-constants";
import { CONFIG, databases } from "./appwrite";

const getCollectionId = (): string => {
  const extra = Constants.expoConfig?.extra;
  if (extra?.EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID) {
    return extra.EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID;
  }
  return (
    process.env.EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID || "watchlist"
  );
};

const WATCHLIST_COLLECTION_ID = getCollectionId();

export interface WatchlistItem {
  $id: string;
  $createdAt?: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieBackdrop: string;
  movieRating: number;
  movieReleaseDate: string;
  type: 'movie' | 'anime';
}

// Debug function to check what attributes exist
export const debugCollection = async () => {
  try {
    const response = await databases.listDocuments(
      CONFIG.databaseId,
      WATCHLIST_COLLECTION_ID,
    );
    if (response.documents.length > 0) {
      console.log("Existing attributes:", Object.keys(response.documents[0]));
    } else {
      console.log("No documents found, getting collection schema...");
    }
  } catch (error: any) {
    console.error("Debug error:", error?.message || error);
  }
};

export const getWatchlist = async (
  userId: string,
): Promise<WatchlistItem[]> => {
  try {
    const response = await databases.listDocuments(
      CONFIG.databaseId,
      WATCHLIST_COLLECTION_ID,
    );
    console.log("Found documents:", response.documents.length);
    const filteredDocs = response.documents
      .filter((doc: any) => doc.userId === userId)
      .map((doc: any) => {
        // Determine type based on poster URL - anime images come from myanimelist.net
        const isAnime = doc.moviePoster?.includes('myanimelist.net') || doc.movieBackdrop?.includes('myanimelist.net');
        
        console.log("Watchlist item debug:", {
          movieId: doc.movieId,
          movieTitle: doc.movieTitle,
          moviePoster: doc.moviePoster,
          movieBackdrop: doc.movieBackdrop,
          isAnime,
        });
        return {
          ...doc,
          type: isAnime ? 'anime' : 'movie',
          addedAt: doc.$createdAt ? new Date(doc.$createdAt).getTime() : 0,
        };
      });
    console.log("User documents:", filteredDocs.length);
    return filteredDocs as unknown as WatchlistItem[];
  } catch (error: any) {
    console.error("Error getting watchlist:", error?.message || error);
    return [];
  }
};

export const addToWatchlist = async (
  userId: string,
  movieId: number,
  movieTitle: string,
  moviePoster: string,
  movieBackdrop: string,
  movieRating: number,
  movieReleaseDate: string,
): Promise<WatchlistItem | null> => {
  try {
    const allItems = await getWatchlist(userId);
    const movieIdStr = String(movieId);
    const existing = allItems.find((item: any) => item.movieId === movieIdStr);

    if (existing) {
      console.log("Movie already in watchlist");
      return existing;
    }

    // Create document with all data at once
    const data = {
      userId,
      movieId: String(movieId),
      movieTitle,
      moviePoster: moviePoster || "",
      movieBackdrop: movieBackdrop || "",
      movieRating: movieRating || 0,
      movieReleaseDate: movieReleaseDate || "",
    };

    const response = await databases.createDocument(
      CONFIG.databaseId,
      WATCHLIST_COLLECTION_ID,
      "unique()",
      data,
    );

    console.log("Document created successfully with all fields");
    console.log("Response:", JSON.stringify(response, null, 2));
    
    return response as unknown as WatchlistItem;
  } catch (error: any) {
    console.error("Error adding to watchlist:", error?.message || error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return null;
  }
};

export const removeFromWatchlist = async (itemId: string): Promise<boolean> => {
  try {
    await databases.deleteDocument(
      CONFIG.databaseId,
      WATCHLIST_COLLECTION_ID,
      itemId,
    );
    return true;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
};

export const isInWatchlist = async (
  userId: string,
  movieId: number,
): Promise<{ inWatchlist: boolean; itemId: string | null }> => {
  try {
    const allItems = await getWatchlist(userId);
    const movieIdStr = String(movieId);
    const existing = allItems.find((item) => item.movieId === movieIdStr);
    if (existing) {
      return { inWatchlist: true, itemId: existing.$id };
    }
    return { inWatchlist: false, itemId: null };
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return { inWatchlist: false, itemId: null };
  }
};
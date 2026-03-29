import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getBestTrailer, getYouTubeAppUrl } from '@/lib/videos';
import { getMovieDetails, MovieDetails } from '@/lib/tmdb';
import { addToWatchHistory, updateWatchProgress } from '@/lib/watchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const PlayerScreen = () => {
  const { id, title, poster, backdrop } = useLocalSearchParams<{
    id: string;
    title: string;
    poster: string;
    backdrop: string;
  }>();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [watchStartTime, setWatchStartTime] = useState<number>(Date.now());
  const [historyItemId, setHistoryItemId] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  const loadPlayerData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Loading player data for movie ID:', id);

      // Load movie details and trailer
      const [movieData, trailer] = await Promise.all([
        getMovieDetails(id),
        getBestTrailer(parseInt(id)),
      ]);

      setMovie(movieData);
      console.log('Movie loaded:', movieData?.title);
      
      if (trailer) {
        console.log('Trailer found:', trailer.key, 'Type:', trailer.type, 'Official:', trailer.official);
        // Validate trailer key (should be 11 characters)
        if (trailer.key && trailer.key.length === 11) {
          setTrailerKey(trailer.key);
        } else {
          console.log('Invalid trailer key:', trailer.key);
          setError('Invalid trailer format');
        }
      } else {
        console.log('No trailer found for movie');
        setError('No trailer available for this movie');
      }
    } catch (err: any) {
      console.error('Error loading player data:', err);
      setError(err.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
  };

  const openInYouTube = async () => {
    if (!trailerKey) return;
    
    try {
      const youtubeUrl = getYouTubeAppUrl(trailerKey);
      await WebBrowser.openBrowserAsync(youtubeUrl);
    } catch (error) {
      console.error('Error opening YouTube:', error);
      // Fallback to opening in system browser
      const youtubeUrl = getYouTubeAppUrl(trailerKey);
      Linking.openURL(youtubeUrl);
    }
  };

  const onStateChange = (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F9BBC" />
        <Text style={styles.loadingText}>Loading player...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        
        {trailerKey && (
          <>
            <Text style={styles.errorSubtext}>
              You can watch this trailer directly on YouTube:
            </Text>
            <TouchableOpacity style={styles.youtubeButton} onPress={openInYouTube}>
              <Ionicons name="logo-youtube" size={20} color="white" />
              <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity style={styles.retryButton} onPress={loadPlayerData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trailerKey) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="film" size={48} color="#666" />
        <Text style={styles.errorText}>No trailer available</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || movie?.title || 'Trailer'}
        </Text>
        <TouchableOpacity onPress={openInYouTube} style={styles.headerButton}>
          <Ionicons name="logo-youtube" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>

      {/* YouTube Player */}
      <View style={styles.playerContainer}>
        {trailerKey ? (
          <YoutubePlayer
            height={300}
            play={playing}
            videoId={trailerKey}
            onChangeState={onStateChange}
            onError={(error: string) => {
              console.error('YouTube player error:', error);
              setError('Failed to load video');
            }}
            onReady={() => {
              console.log('YouTube player ready for video:', trailerKey);
              setPlaying(true);
            }}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <Ionicons name="film-outline" size={64} color="#666" />
            <Text style={styles.noVideoText}>No trailer available</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => setPlaying(!playing)}
        >
          <Ionicons 
            name={playing ? "pause" : "play"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        {trailerKey && (
          <TouchableOpacity 
            style={styles.youtubeButtonControl}
            onPress={openInYouTube}
          >
            <Ionicons name="logo-youtube" size={20} color="white" />
            <Text style={styles.controlText}>Watch on YouTube</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Movie Info */}
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{title || movie?.title}</Text>
        {movie && (
          <Text style={styles.movieDetails}>
            {movie.release_date?.split('-')[0]} • {movie.genres?.map(g => g.name).join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  youtubeButton: {
    backgroundColor: '#ff0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#2F9BBC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 16,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 20,
  },
  youtubeButtonControl: {
    backgroundColor: '#ff0000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  movieInfo: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movieDetails: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default PlayerScreen;
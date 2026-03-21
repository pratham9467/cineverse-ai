import { useAuth } from "@/contexts/AuthContext";
import { aistarsblu, bookmarked, bookmarkOutline, playIcon, starIconLarge as starIcon, aiIcon } from "@/lib/icons";
import { router } from "expo-router";
import {
  CastMember,
  Credits,
  CrewMember,
  formatRating,
  formatRuntime,
  Genre,
  getImageUrl,
  getMovieCredits,
  getMovieDetails,
  MovieDetails,
} from "@/lib/tmdb";
import {
  addToWatchlist,
  isInWatchlist,
  removeFromWatchlist,
} from "@/lib/watchlist";
import { emitWatchlistChanged } from "@/lib/watchlistEvents";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const placeholderProfile = require("@/assets/images/denis.png");
const placeholderBackdrop = require("@/assets/images/backdrop.png");

const Details = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();

  const checkWatchlist = useCallback(async () => {
    if (!isLoggedIn || !user?.$id || !id) return;
    const { inWatchlist: exists, itemId } = await isInWatchlist(
      user.$id,
      parseInt(id),
    );
    setInWatchlist(exists);
    setWatchlistItemId(itemId);
  }, [isLoggedIn, user?.$id, id]);

  useEffect(() => {
    if (id) {
      loadMovieData(id);
    }
  }, [id]);

  useEffect(() => {
    checkWatchlist();
  }, [checkWatchlist]);

  const handleWatchlistToggle = async () => {
    if (!isLoggedIn || !user?.$id || !movie) {
      Alert.alert(
        "Login Required",
        "Please login to add movies to your watchlist",
      );
      return;
    }

    if (inWatchlist && watchlistItemId) {
      const success = await removeFromWatchlist(watchlistItemId);
      if (success) {
        setInWatchlist(false);
        setWatchlistItemId(null);
        emitWatchlistChanged("REMOVED");
      }
    } else {
      const item = await addToWatchlist(
        user.$id,
        movie.id,
        movie.title,
        movie.poster_path || "",
        movie.backdrop_path || "",
        movie.vote_average,
        movie.release_date,
      );
      if (item) {
        setInWatchlist(true);
        setWatchlistItemId(item.$id);
        emitWatchlistChanged("ADDED");
      }
    }
  };

  const loadMovieData = async (movieId: string) => {
    try {
      const [movieData, creditsData] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
      ]);
      setMovie(movieData);
      setCredits(creditsData);
    } catch (error) {
      console.error("Error loading movie data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDirector = (crew: CrewMember[]): CrewMember | undefined => {
    return crew.find((member) => member.job === "Director");
  };

  const getTopCast = (cast: CastMember[], count: number = 5): CastMember[] => {
    return cast.slice(0, count);
  };

  const getGenreNames = (genres: Genre[]): string => {
    return genres.map((g) => g.name).join(", ");
  };

  const getCertification = (): string => {
    if (!movie) return "N/A";
    if (movie.adult) return "R";
    return "PG-13";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2F9BBC" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-primary">Movie not found</Text>
      </View>
    );
  }

  const director = getDirector(credits?.crew || []);
  const topCast = getTopCast(credits?.cast || []);
  const ratingPercent = Math.round(movie.vote_average * 10);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <Image
            source={
              movie.backdrop_path
                ? {
                    uri: getImageUrl(movie.backdrop_path, "w1280") ?? undefined,
                  }
                : placeholderBackdrop
            }
            className="w-full h-[500px] rounded-none"
            resizeMode="cover"
          />

          <View className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-background" />

          <View className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <View className="flex-row items-center gap-2 bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/30 w-[130px] rounded-full px-3 py-1.5">
              <SvgXml xml={aistarsblu} width={16} height={16} />
              <Text className="text-primary font-bold text-xs tracking-wider uppercase">
                {ratingPercent}% AI Match
              </Text>
            </View>

            <Text className="text-4xl text-secondary font-bold mt-3 leading-tight">
              {movie.title}
            </Text>

            <View className="flex-row items-center gap-3 mt-2">
              <View className="border border-text-secondary rounded px-2 py-0.5">
                <Text className="text-secondary text-xs font-medium">
                  {getCertification()}
                </Text>
              </View>
              <Text className="text-secondary text-sm font-medium">
                {movie.release_date.split("-")[0]}
              </Text>
              <Text className="text-secondary">•</Text>
              <Text className="text-secondary text-sm font-medium">
                {formatRuntime(movie.runtime)}
              </Text>
              <Text className="text-secondary">•</Text>
              <Text
                className="text-secondary text-sm font-medium"
                numberOfLines={1}
              >
                {getGenreNames(movie.genres)}
              </Text>
            </View>

            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-4 shadow-lg shadow-primary/30">
                <SvgXml xml={playIcon} width={14} height={14} />
                <Text className="text-secondary font-bold text-base">
                  Watch Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`w-14 items-center justify-center rounded-xl py-4 ${inWatchlist ? "bg-primary border border-primary" : "bg-black/60 backdrop-blur-md border border-white/10"}`}
                onPress={handleWatchlistToggle}
              >
                <SvgXml xml={inWatchlist ? bookmarked : bookmarkOutline} width={18} height={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="p-6 -mt-4">
          <View className="bg-black/70 backdrop-blur-md border border-white/10 rounded-card-lg p-5">
            <Text className="text-secondary font-bold text-lg mb-2">
              Synopsis
            </Text>
            <Text className="text-text-primary text-sm leading-6">
              {movie.overview || "No synopsis available."}
            </Text>
          </View>

          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-secondary font-bold text-lg">Top Cast</Text>
              <Text className="text-primary text-sm font-medium">See all</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-ml-6 -mr-6 px-6"
            >
              <View className="flex-row gap-4">
                {topCast.map((actor) => (
                  <View key={actor.id} className="items-center gap-2">
                    <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-surface p-0.5 bg-surface">
                      <Image
                        source={
                          actor.profile_path
                            ? {
                                uri:
                                  getImageUrl(actor.profile_path, "w185") ??
                                  undefined,
                              }
                            : placeholderProfile
                        }
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      className="text-secondary text-xs text-center font-medium leading-tight w-20"
                      numberOfLines={2}
                    >
                      {actor.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Reviews Section */}
          <View className="mt-6">
            <TouchableOpacity 
              className="bg-surface/50 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
              onPress={() => router.push({
                pathname: '/reviews/[movieId]' as any,
                params: { 
                  movieId: id,
                  movieTitle: movie?.title || 'Unknown Movie',
                  moviePoster: movie?.poster_path || ''
                }
              })}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <SvgXml xml={aiIcon} width={20} height={20} />
                </View>
                <View>
                  <Text className="text-secondary font-semibold">User Reviews</Text>
                  <Text className="text-text-muted text-xs">See what others think</Text>
                </View>
              </View>
              <Text className="text-primary font-semibold">View All →</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row gap-4">
            <View className="flex-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-card p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary text-xs tracking-wider uppercase">
                  IMDb Rating
                </Text>
                <SvgXml xml={starIcon} width={16} height={16} />
              </View>
              <View className="flex-row items-baseline mt-1">
                <Text className="text-secondary font-bold text-3xl">
                  {formatRating(movie.vote_average)}
                </Text>
                <Text className="text-text-secondary text-sm">/10</Text>
              </View>
              <View className="h-1.5 bg-text-muted/50 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${ratingPercent}%` }}
                />
              </View>
            </View>

            <View className="flex-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-card p-4">
              <Text className="text-text-secondary text-xs tracking-wider uppercase mb-3">
                Director
              </Text>
              {director ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-elevated">
                    <Image
                      source={
                        director.profile_path
                          ? {
                              uri:
                                getImageUrl(director.profile_path, "w185") ??
                                undefined,
                            }
                          : placeholderProfile
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text className="text-secondary font-bold text-sm">
                      {director.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-text-muted text-sm">Unknown</Text>
              )}
              <TouchableOpacity className="mt-3">
                <Text className="text-primary font-bold text-xs uppercase tracking-wider">
                  Filmography
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-40" />
        </View>
      </ScrollView>
    </View>
  );
};

export default Details;

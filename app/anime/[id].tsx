import { useAuth } from "@/contexts/AuthContext";
import { aistarsblu, playIcon, starIconLarge as starIcon, linkIcon, bookmarkOutline, bookmarkFilled } from "@/lib/icons";
import { Anime, getAnimeById } from "@/lib/jikan";
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
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const placeholderBackdrop = require("@/assets/images/backdrop.png");

const AnimeDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
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
      loadAnimeData(id);
    }
  }, [id]);

  useEffect(() => {
    checkWatchlist();
  }, [checkWatchlist]);

  const loadAnimeData = async (animeId: string) => {
    try {
      setLoading(true);
      const animeData = await getAnimeById(parseInt(animeId));
      setAnime(animeData);
    } catch (error) {
      console.error("Error loading anime data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!isLoggedIn || !user?.$id || !anime) {
      Alert.alert(
        "Login Required",
        "Please login to add anime to your watchlist",
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
        anime.mal_id,
        anime.title_english || anime.title,
        anime.images.jpg.large_image_url || anime.images.jpg.image_url || "",
        anime.images.jpg.large_image_url || anime.images.jpg.image_url || "",
        anime.score || 0,
        anime.year?.toString() || anime.aired.from?.split("T")[0] || "",
      );
      if (item) {
        setInWatchlist(true);
        setWatchlistItemId(item.$id);
        emitWatchlistChanged("ADDED");
      }
    }
  };

  const handleOpenMAL = () => {
    if (anime?.url) {
      Linking.openURL(anime.url);
    }
  };

  const formatRating = (score: number | null): string => {
    if (!score) return "N/A";
    return score.toFixed(1);
  };

  const formatEpisodes = (episodes: number | null): string => {
    if (!episodes) return "Unknown";
    return episodes === 1 ? "1 episode" : `${episodes} episodes`;
  };

  const formatDuration = (duration: string | null): string => {
    if (!duration) return "N/A";
    return duration;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2F9BBC" />
      </View>
    );
  }

  if (!anime) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-primary">Anime not found</Text>
      </View>
    );
  }

  const ratingPercent = anime.score ? Math.round(anime.score * 10) : 0;

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
              anime.images?.jpg?.large_image_url
                ? { uri: anime.images.jpg.large_image_url }
                : placeholderBackdrop
            }
            className="w-full h-[500px]"
            resizeMode="cover"
          />

          <View className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-background" />

          <View className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <View className="flex-row items-center gap-2 bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/30 w-[130px] rounded-full px-3 py-1.5">
              <SvgXml xml={aistarsblu} width={16} height={16} />
              <Text className="text-primary font-bold text-xs tracking-wider uppercase">
                {ratingPercent}% Match
              </Text>
            </View>

            <Text className="text-4xl text-secondary font-bold mt-3 leading-tight">
              {anime.title_english || anime.title}
            </Text>

            {anime.title_japanese && (
              <Text className="text-text-muted text-sm mt-1">
                {anime.title_japanese}
              </Text>
            )}

            <View className="flex-row items-center gap-3 mt-3">
              <View className="border border-text-secondary rounded px-2 py-0.5">
                <Text className="text-secondary text-xs font-medium">
                  {anime.type || "N/A"}
                </Text>
              </View>
              <Text className="text-secondary text-sm font-medium">
                {anime.year || anime.aired?.from?.split("-")[0] || "N/A"}
              </Text>
              <Text className="text-secondary">•</Text>
              <Text className="text-secondary text-sm font-medium">
                {formatEpisodes(anime.episodes)}
              </Text>
              <Text className="text-secondary">•</Text>
              <Text className="text-secondary text-sm font-medium">
                {formatDuration(anime.duration)}
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
                <SvgXml xml={inWatchlist ? bookmarkFilled : bookmarkOutline} width={18} height={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="p-6 -mt-4">
          {anime.genres && anime.genres.length > 0 && (
            <View className="mt-6">
              <Text className="text-secondary font-bold text-lg mb-3">
                Genres
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <View
                    key={genre.mal_id}
                    className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30"
                  >
                    <Text className="text-primary text-sm font-medium">
                      {genre.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View className="mt-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-card-lg p-5">
            <Text className="text-secondary font-bold text-lg mb-2">
              Synopsis
            </Text>
            <Text className="text-text-primary text-sm leading-6">
              {anime.synopsis || "No synopsis available."}
            </Text>
          </View>

          <View className="mt-6 flex-row gap-4">
            <View className="flex-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-card p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary text-xs tracking-wider uppercase">
                  Score
                </Text>
                <SvgXml xml={starIcon} width={16} height={16} />
              </View>
              <View className="flex-row items-baseline mt-1">
                <Text className="text-secondary font-bold text-3xl">
                  {formatRating(anime.score)}
                </Text>
                <Text className="text-text-secondary text-sm">/10</Text>
              </View>
              <Text className="text-text-muted text-xs mt-1">
                {anime.scored_by?.toLocaleString() || "N/A"} users
              </Text>
              <View className="h-1.5 bg-text-muted/50 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${ratingPercent}%` }}
                />
              </View>
            </View>

            <View className="flex-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-card p-4">
              <Text className="text-text-secondary text-xs tracking-wider uppercase mb-3">
                Information
              </Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-text-muted text-sm">Type</Text>
                <Text className="text-secondary text-sm font-medium">
                  {anime.type || "N/A"}
                </Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-text-muted text-sm">Episodes</Text>
                <Text className="text-secondary text-sm font-medium">
                  {anime.episodes || "Unknown"}
                </Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-text-muted text-sm">Status</Text>
                <Text className="text-secondary text-sm font-medium">
                  {anime.status || "N/A"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-text-muted text-sm">Source</Text>
                <Text className="text-secondary text-sm font-medium">
                  {anime.source || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-40" />
        </View>
      </ScrollView>
    </View>
  );
};

export default AnimeDetails;

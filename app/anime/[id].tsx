import { useAuth } from "@/contexts/AuthContext";
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

const aistarsblu = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 8L16.75 5.25L14 4L16.75 2.75L18 0L19.25 2.75L22 4L19.25 5.25L18 8ZM18 22L16.75 19.25L14 18L16.75 16.75L18 14L19.25 16.75L22 18L19.25 19.25L18 22ZM8 19L5.5 13.5L0 11L5.5 8.5L8 3L10.5 8.5L16 11L10.5 13.5L8 19ZM8 14.15L9 12L11.15 11L9 10L8 7.85L7 10L4.85 11L7 12L8 14.15Z" fill="#2F9BBC"/>
</svg>`;

const playIcon = `<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 14V0L11 7L0 14ZM2 10.35L7.25 7L2 3.65V10.35Z" fill="white"/>
</svg>`;

const starIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 0L10.5 6L16.5 6L11.5 10L13.5 16L8.5 12L3.5 16L5.5 10L0.5 6L6.5 6L8.5 0Z" fill="#FACC15"/>
</svg>`;

const bookmark = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Zm400 160v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/></svg>`;

const bookmarkFilled = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2F9BBC"><path d="M200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Z"/></svg>`;

const linkIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33384 21.9434 7.02296C21.932 5.71209 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.2979 2.07799 16.987 2.0666C15.6761 2.0552 14.413 2.55919 13.47 3.47L11.75 5.18C11.3724 5.56702 11.0996 6.06469 10.9652 6.60327C10.8308 7.14185 10.8401 7.70183 10.9922 8.2305C11.1443 8.75916 11.4343 9.23585 11.8252 9.5991C12.2162 9.96234 12.6938 10.1977 13.2 10.28C13.6222 10.3451 14.0542 10.3203 14.4672 10.2073C14.8802 10.0943 15.2625 9.89646 15.58 9.63L17.29 7.92C17.8172 7.3613 18.1044 6.60691 18.0907 5.8198C18.077 5.03268 17.7634 4.28832 17.2245 3.74951C16.6857 3.2107 15.9414 2.89706 15.1542 2.88337C14.3671 2.86968 13.6127 3.15689 13.054 3.684L10.054 6.684C9.22174 7.55976 8.70697 8.78781 8.72367 10.0719C8.74036 11.356 9.28691 12.5673 10.142 12.417" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60707C11.7642 9.26331 11.0685 9.05886 10.3533 9.00768C9.63816 8.95646 8.92037 9.05966 8.24861 9.31023C7.57685 9.5608 6.96684 9.9529 6.46 10.46L3.46 13.46C2.54919 14.403 2.0452 15.6661 2.0566 16.977C2.06799 18.2879 2.59384 19.5421 3.52088 20.4691C4.44791 21.3961 5.7021 21.922 6.91297 21.9334C8.12384 21.9448 9.38695 21.4408 10.33 20.5298L12.05 18.81C12.4276 18.423 12.7004 17.9253 12.8348 17.3867C12.9692 16.8481 12.9599 16.2882 12.8078 15.7595C12.6556 15.2308 12.3657 14.7541 11.9747 14.3909C11.5838 14.0277 11.1062 13.7923 10.6 13.71C10.1778 13.6449 9.74581 13.6697 9.33284 13.7827C8.91986 13.8957 8.53759 14.0935 8.22 14.36L6.51 16.07C5.98281 16.6287 5.6956 17.3831 5.70929 18.1702C5.72298 18.9573 6.03662 19.7017 6.57543 20.2405C7.11424 20.7793 7.8586 21.0929 8.64572 21.1066C9.43283 21.1203 10.1872 20.8331 10.746 20.3058L13.746 17.305C14.5783 16.4292 15.093 15.2012 15.0763 13.9171C15.0596 12.6329 14.5131 11.4217 13.658 11.5718" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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
                <SvgXml xml={bookmark} width={18} height={18} />
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

import {
  Anime,
  formatAnimeRating,
  formatAnimeYear,
  getAnimeGenres,
  getTopAnime,
  searchAnime
} from "@/lib/jikan";
import {
  formatReleaseYear,
  Genre,
  getGenres,
  getImageUrl,
  getPopularMovies,
  Movie,
  searchMovies
} from "@/lib/tmdb";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const searchIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="11" cy="11" r="8" stroke="#475569" stroke-width="2"/>
<path d="M16 16L21 21" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
</svg>`;
const aistarsSvgWhite = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.5 10L20.9375 6.5625L17.5 5L20.9375 3.4375L22.5 0L24.0625 3.4375L27.5 5L24.0625 6.5625L22.5 10ZM22.5 27.5L20.9375 24.0625L17.5 22.5L20.9375 20.9375L22.5 17.5L24.0625 20.9375L27.5 22.5L24.0625 24.0625L22.5 27.5ZM10 23.75L6.875 16.875L0 13.75L6.875 10.625L10 3.75L13.125 10.625L20 13.75L13.125 16.875L10 23.75ZM10 17.6875L11.25 15L13.9375 13.75L11.25 12.5L10 9.8125L8.75 12.5L6.0625 13.75L8.75 15L10 17.6875Z" fill="white"/>
</svg>
`;

const notificationIcon = `<svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 1C4 1 1 4 1 7.5V12C1 13 0 14 0 15V17C0 17.5 0.5 18 1 18H14C14.5 18 15 17.5 15 17V15C15 14 14 13 14 12V7.5C14 4 11 1 7.5 1Z" stroke="#64748B" stroke-width="1.5" fill="none"/>
</svg>`;

const sortIcon = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1H11M1 4H11M1 7H11" stroke="#64748B" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const placeholderImages = [
  require("@/assets/images/interstellar.png"),
  require("@/assets/images/inception.png"),
  require("@/assets/images/dune2.png"),
  require("@/assets/images/cyberpunk.png"),
  require("@/assets/images/spiritedaway.png"),
  require("@/assets/images/silentpulse.png"),
];

const FilterButton = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity onPress={onPress} className={`px-4 py-2 rounded-full border ${isActive ? "bg-[#0a2a33] border-cyan-500/40" : "bg-[#061218] border-[#0a1f2a]"}`}>
    <Text className={`text-sm font-medium ${isActive ? "text-primary" : "text-text-secondary"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const MovieCard = ({
  movie,
  genres,
}: {
  movie: Movie;
  genres: Genre[];
}) => {
  const getGenreNames = (genreIds: number[]): string => {
    return genreIds
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 1)
      .join('');
  };

  return (
    <TouchableOpacity
      className="flex-1 bg-surface border border-white/10 rounded-card-xl overflow-hidden mx-1.5 mb-2"
      onPress={() => router.push(`/movies/${movie.id}` as any)}
    >
      <View className="h-[200px] relative">
        <Image
          source={movie.poster_path ? { uri: getImageUrl(movie.poster_path, 'w342') ?? undefined } : placeholderImages[movie.id % placeholderImages.length]}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
      </View>
      <View className="px-3 py-3">
        <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
          {movie.title}
        </Text>
        <Text className="text-text-muted text-xs mt-1">
          {getGenreNames(movie.genre_ids)} • {formatReleaseYear(movie.release_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const AnimeCard = ({
  animeItem,
}: {
  animeItem: Anime;
}) => {
  return (
    <TouchableOpacity
      className="flex-1 bg-surface border border-white/10 rounded-card-xl overflow-hidden mx-1.5 mb-2"
      onPress={() => router.push(`/anime/${animeItem.mal_id}` as any)}
    >
      <View className="h-[200px] relative">
        <Image
          source={animeItem.images?.jpg?.large_image_url ? { uri: animeItem.images.jpg.large_image_url } : placeholderImages[animeItem.mal_id % placeholderImages.length]}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        <View className="absolute top-1 right-1 bg-yellow-400/90 px-1.5 py-0.5 rounded">
          <Text className="text-black text-xs font-bold">
            ★ {formatAnimeRating(animeItem.score)}
          </Text>
        </View>
      </View>
      <View className="px-3 py-3">
        <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
          {animeItem.title_english || animeItem.title}
        </Text>
        <Text className="text-text-muted text-xs mt-1">
          {animeItem.type} • {formatAnimeYear(animeItem)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Discover = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [animeGenres, setAnimeGenres] = useState<{ mal_id: number; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeTab === "movies") {
      loadMoviesData();
    } else if (activeTab === "anime") {
      loadAnimeData();
    }
  }, [activeTab]);

  const loadMoviesData = async () => {
    setLoading(true);
    try {
      const [moviesData, genresData] = await Promise.all([
        getPopularMovies(1),
        getGenres(),
      ]);
      setMovies(moviesData.results);
      setGenres(genresData);
    } catch (error) {
      console.error("Error loading movies data:", error);
    } finally {
      setLoading(false);
    }
  };

   const loadAnimeData = async () => {
    setLoading(true);
    try {
      const [animeData, genresData] = await Promise.all([
        getTopAnime(1),
        getAnimeGenres(),
      ]);
      setAnime(animeData.data);
      setAnimeGenres(genresData || []);
    } catch (error) {
      console.error("Error loading anime data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      if (query.trim().length === 0) {
        if (activeTab === "movies") {
          loadMoviesData();
        } else if (activeTab === "anime") {
          loadAnimeData();
        }
      }
      return;
    }
    setLoading(true);
    try {
      if (activeTab === "movies") {
        const results = await searchMovies(query);
        setMovies(results.results);
      } else if (activeTab === "anime") {
        const results = await searchAnime(query);
        setAnime(results.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenre(genreId);
    if (genreId === null) {
      if (activeTab === "movies") {
        loadMoviesData();
      } else if (activeTab === "anime") {
        loadAnimeData();
      }
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="bg-background px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Discover</Text>
          <TouchableOpacity className="p-2">
            <SvgXml xml={notificationIcon} width={15} height={19} />
          </TouchableOpacity>
        </View>

        <View className="h-12 bg-surface border border-white/10 rounded-card-lg px-4 flex-row items-center">
          <SvgXml xml={searchIcon} width={15} height={15} />
          <TextInput
            className="flex-1 text-text-muted text-sm ml-3"
            placeholder="Search by title, director or keyword"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-4 pt-3 pb-4">
          <View className="bg-[#0a0f14] border border-white/10 rounded-lg p-0.5 flex-row gap-0">
            <TouchableOpacity
              onPress={() => setActiveTab("movies")}
              className={`px-5 py-2 rounded-md ${activeTab === "movies" ? "bg-[#0a2a33]" : ""}`}
            >
              <Text
                className={`text-xs font-bold uppercase ${activeTab === "movies" ? "text-primary" : "text-text-muted"}`}
              >
                Movies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("anime")}
              className={`px-5 py-2 rounded-md ${activeTab === "anime" ? "bg-[#0a2a33]" : ""}`}
            >
              <Text
                className={`text-xs font-bold uppercase ${activeTab === "anime" ? "text-primary" : "text-text-muted"}`}
              >
                Anime
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="flex-row items-center gap-1.5">
            <SvgXml xml={sortIcon} width={12} height={8} />
            <Text className="text-text-muted text-xs font-medium">
              Sort: Trending
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <FilterButton
                label="All"
                isActive={selectedGenre === null}
                onPress={() => handleGenreSelect(null)}
              />
              {activeTab === "movies" ? (
                genres.slice(0, 6).map((genre) => (
                  <FilterButton
                    key={genre.id}
                    label={genre.name}
                    isActive={selectedGenre === genre.id}
                    onPress={() => handleGenreSelect(genre.id)}
                  />
                ))
              ) : (
                animeGenres.slice(0, 6).map((genre) => (
                  <FilterButton
                    key={genre.mal_id}
                    label={genre.name}
                    isActive={selectedGenre === genre.mal_id}
                    onPress={() => handleGenreSelect(genre.mal_id)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {loading ? (
          <View className="h-64 items-center justify-center">
            <ActivityIndicator size="large" color="#2F9BBC" />
          </View>
        ) : activeTab === "movies" ? (
          <View className="px-3 pt-2 pb-32">
            <View className="flex-row flex-wrap">
              {movies.map((movie) => (
                <View key={movie.id} className="w-1/2">
                  <MovieCard movie={movie} genres={genres} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="px-3 pt-2 pb-32">
            <View className="flex-row flex-wrap">
              {anime.map((animeItem) => (
                <View key={animeItem.mal_id} className="w-1/2">
                  <AnimeCard animeItem={animeItem} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <AnimatedButton onPress={() => router.push("/aiscreen/aiscreen" as any)} />
    </View>
  );
};

const AnimatedButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 140,
          right: 24,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="w-16 h-16 rounded-full items-center justify-center bg-primary shadow-lg shadow-cyan-500/40"
      >
        <SvgXml xml={aistarsSvgWhite} width={28} height={28} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Discover;

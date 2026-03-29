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
  searchMovies,
  discoverMovies,
  AdvancedSearchParams
} from "@/lib/tmdb";
import { searchInputIcon as searchIcon, aistarsSvgWhite, notificationIcon, sortIcon } from "@/lib/icons";
import { FilterModal, FilterOptions } from "@/components/FilterModal";
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
import { useThemeMode } from '@/contexts/ThemeModeContext';

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
  activeColor,
  activeBg,
}: {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  activeColor?: string;
  activeBg?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={isActive ? { backgroundColor: activeBg || '#0a2a33', borderWidth: 1, borderColor: activeColor ? `${activeColor}66` : 'rgba(6,181,204,0.4)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }
      : { backgroundColor: '#061218', borderWidth: 1, borderColor: '#0a1f2a', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
  >
    <Text style={{ fontSize: 14, fontWeight: '500', color: isActive ? (activeColor || '#2F9BBC') : '#94a3b8' }}>
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

// Popular movie genres to show as chips
const POPULAR_MOVIE_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller'];

// Popular anime genres to show as chips (excluding Avant-Garde as requested)
const POPULAR_ANIME_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Supernatural'];

const Discover = () => {
  const { mode } = useThemeMode();
  const [activeTab, setActiveTab] = useState(mode === "anime" ? "anime" : "movies");

  // Sync activeTab when global mode changes
  useEffect(() => {
    setActiveTab(mode === "anime" ? "anime" : "movies");
  }, [mode]);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [animeGenres, setAnimeGenres] = useState<{ mal_id: number; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Advanced filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    year: null,
    genreIds: [],
    minRating: 0,
    maxRating: 10,
    minRuntime: null,
    maxRuntime: null,
    sortBy: 'popularity.desc',
    language: '',
    includeAdult: false
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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

  const handleGenreSelect = async (genreId: number | null) => {
    setSelectedGenre(genreId);
    setLoading(true);
    
    try {
      if (activeTab === "movies") {
        if (genreId === null) {
          // Load popular movies when "All" is selected
          const moviesData = await getPopularMovies(1);
          setMovies(moviesData.results);
        } else {
          // Filter movies by selected genre
          const params: AdvancedSearchParams = {
            page: 1,
            genreIds: [genreId],
            sortBy: 'popularity.desc'
          };
          const data = await discoverMovies(params);
          setMovies(data.results);
        }
      } else if (activeTab === "anime") {
        if (genreId === null) {
          // Load top anime when "All" is selected
          const animeData = await getTopAnime(1);
          setAnime(animeData.data);
        } else {
          // Filter anime by selected genre - we need to use search with genre filter
          // For now, we'll filter the existing anime list by genre
          // Note: Jikan API might need a different approach for genre filtering
          const filteredAnime = anime.filter(animeItem => 
            animeItem.genres?.some(genre => genre.mal_id === genreId)
          );
          setAnime(filteredAnime);
        }
      }
    } catch (error) {
      console.error("Error filtering by genre:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.year) count++;
    if (newFilters.genreIds.length > 0) count++;
    if (newFilters.minRating > 0) count++;
    if (newFilters.language) count++;
    if (newFilters.sortBy !== 'popularity.desc') count++;
    setActiveFiltersCount(count);
    
    // Apply filters for movies
    if (activeTab === "movies") {
      setLoading(true);
      try {
        const params: AdvancedSearchParams = {
          page: 1,
          year: newFilters.year,
          genreIds: newFilters.genreIds.length > 0 ? newFilters.genreIds : 
                    selectedGenre ? [selectedGenre] : undefined,
          minRating: newFilters.minRating,
          sortBy: newFilters.sortBy,
          language: newFilters.language || undefined,
          includeAdult: newFilters.includeAdult
        };
        const data = await discoverMovies(params);
        setMovies(data.results);
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      year: null,
      genreIds: [],
      minRating: 0,
      maxRating: 10,
      minRuntime: null,
      maxRuntime: null,
      sortBy: 'popularity.desc',
      language: '',
      includeAdult: false
    };
    setFilters(defaultFilters);
    setActiveFiltersCount(0);
    setSelectedGenre(null);
    if (activeTab === "movies") {
      loadMoviesData();
    } else if (activeTab === "anime") {
      loadAnimeData();
    }
  };

  const { colors: themeColors } = useThemeMode();

  return (
    <View className="flex-1 bg-background">
      <View className="bg-background px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Discover</Text>
          <TouchableOpacity className="p-2">
            <SvgXml xml={notificationIcon} width={15} height={19} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <View className="h-12 bg-surface border border-white/10 rounded-card-lg px-4 flex-row items-center">
          <SvgXml xml={searchIcon} width={15} height={15} color={themeColors.primary} />
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
              style={{
                paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6,
                backgroundColor: activeTab === 'movies' ? (themeColors.primaryRgba || '#0a2a33') : 'transparent',
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
                  color: activeTab === 'movies' ? themeColors.primary : '#64748b' }}
              >
                Movies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("anime")}
              style={{
                paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6,
                backgroundColor: activeTab === 'anime' ? (themeColors.primaryRgba || '#0a2a33') : 'transparent',
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
                  color: activeTab === 'anime' ? themeColors.primary : '#64748b' }}
              >
                Anime
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="flex-row items-center gap-1.5"
            onPress={() => setFilterModalVisible(true)}
          >
            <SvgXml xml={sortIcon} width={12} height={8} color={themeColors.primary} />
            <Text className="text-text-muted text-xs font-medium">
              {activeFiltersCount > 0 ? `${activeFiltersCount} Filters` : 'Filters'}
            </Text>
            {activeFiltersCount > 0 && (
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: themeColors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text className="text-white text-xs font-bold">{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="px-4 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <FilterButton
                label="All"
                isActive={selectedGenre === null}
                onPress={() => handleGenreSelect(null)}
                activeColor={themeColors.primary}
                activeBg={themeColors.primaryRgba}
              />
              {activeTab === "movies" ? (
                genres
                  .filter(genre => POPULAR_MOVIE_GENRES.includes(genre.name))
                  .slice(0, 6)
                  .map((genre) => (
                    <FilterButton
                      key={genre.id}
                      label={genre.name}
                      isActive={selectedGenre === genre.id}
                      onPress={() => handleGenreSelect(genre.id)}
                    />
                  ))
              ) : (
                animeGenres
                  .filter(genre => POPULAR_ANIME_GENRES.includes(genre.name))
                  .slice(0, 6)
                  .map((genre) => (
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
            <ActivityIndicator size="large" color={themeColors.primary} />
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
      <AnimatedButton color={themeColors.primary} onPress={() => router.push("/aiscreen/aiscreen" as any)} />
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        currentFilters={filters}
        genres={genres}
        contentType={activeTab as 'movies' | 'anime'}
      />
    </View>
  );
};

function AnimatedButton({ onPress, color }: { onPress: () => void; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
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
        style={{
          width: 64, height: 64, borderRadius: 32,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
        }}
      >
        <SvgXml xml={aistarsSvgWhite} width={28} height={28} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Discover;

import { formatRating, formatReleaseYear, Genre, getGenres, getImageUrl, getNowPlayingMovies, getPopularMovies, getTrendingMovies, Movie } from '@/lib/tmdb'
import { Anime, formatAnimeRating, formatAnimeYear, getTopAnime, getSeasonalAnime } from '@/lib/jikan'
import { getBestTrailer, getYouTubeEmbedUrl } from '@/lib/videos'
import { playIcon, starIcon, aistarsSvgWhite } from '@/lib/icons'
import BottomSheet from '@/lib/BottomSheet'
import { useThemeMode } from '@/contexts/ThemeModeContext'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { WebView } from 'react-native-webview'

const movieCategories = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy']
const animeCategories = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi']

// Union list item type for the FlatList
type ListItem = { kind: 'movie'; data: Movie } | { kind: 'anime'; data: Anime }

const Index = () => {
  // ── Mode toggle (synced with global theme) ──────────────────────────────
  const { mode, setMode, colors: themeColors } = useThemeMode()

  const [selectedCategory, setSelectedCategory] = useState('All')

  // ── Movie state ──────────────────────────────────────────────────────────
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [moviePage, setMoviePage] = useState(1)
  
  // ── Trailer state ─────────────────────────────────────────────────────────
  const [heroTrailerKey, setHeroTrailerKey] = useState<string | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const trailerTimerRef = useRef<any>(null)

  // ── Anime state ──────────────────────────────────────────────────────────
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([])
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([])
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [heroAnime, setHeroAnime] = useState<Anime | null>(null)
  const [animePage, setAnimePage] = useState(1)

  // ── Shared state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTrendingSheet, setShowTrendingSheet] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)
  const loadingMoreRef = useRef(false)
  const animeLoadedRef = useRef(false)

  // Load trailer for hero movie - defined before useEffects
  const loadHeroTrailer = useCallback(async () => {
    if (!heroMovie) return
    
    try {
      const trailer = await getBestTrailer(heroMovie.id)
      if (trailer) {
        setHeroTrailerKey(trailer.key)
        // Reset trailer visibility
        setShowTrailer(false)
        
        // Clear any existing timer
        if (trailerTimerRef.current) {
          clearTimeout(trailerTimerRef.current)
        }
        
        // Show trailer after 1 second delay
        trailerTimerRef.current = setTimeout(() => {
          setShowTrailer(true)
        }, 1000)
      }
    } catch (error) {
      console.error('Error loading hero trailer:', error)
    }
  }, [heroMovie])

  useEffect(() => {
    loadMovieData()
  }, [])

  useEffect(() => {
    if (mode === 'anime' && !animeLoadedRef.current) {
      loadAnimeData()
    }
    setSelectedCategory('All')
    setHasMorePages(true)
  }, [mode])

  // Fetch trailer when heroMovie changes
  useEffect(() => {
    if (heroMovie && mode === 'movies') {
      loadHeroTrailer()
    } else {
      setHeroTrailerKey(null)
      setShowTrailer(false)
    }
    
    return () => {
      if (trailerTimerRef.current) {
        clearTimeout(trailerTimerRef.current)
      }
    }
  }, [heroMovie, mode, loadHeroTrailer])

  // ── Movie data loading ───────────────────────────────────────────────────
  const loadMovieData = async () => {
    setLoading(true)
    try {
      const [trending, nowPlaying, popular, genresData] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getPopularMovies(1),
        getGenres(),
      ])

      setTrendingMovies(trending.results.slice(0, 10))
      setRecommendedMovies(popular.results.slice(0, 6))
      setPopularMovies(popular.results)
      setHeroMovie(trending.results[0] || nowPlaying.results[0] || null)
      setGenres(genresData)
      setMoviePage(1)
      setHasMorePages(true)
    } catch (err: any) {
      console.error('Error loading movie data:', err)
      setError(err.message || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }



  // ── Anime data loading ───────────────────────────────────────────────────
  const loadAnimeData = async () => {
    setLoading(true)
    try {
      const [seasonal, top] = await Promise.all([
        getSeasonalAnime(1),
        getTopAnime(1),
      ])

      setTrendingAnime(seasonal.data.slice(0, 10))
      setRecommendedAnime(top.data.slice(0, 6))
      setAllAnime(top.data)
      setHeroAnime(seasonal.data[0] || top.data[0] || null)
      setAnimePage(1)
      setHasMorePages(true)
      animeLoadedRef.current = true
    } catch (err: any) {
      console.error('Error loading anime data:', err)
      setError(err.message || 'Failed to load anime')
    } finally {
      setLoading(false)
    }
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMorePages) return
    loadingMoreRef.current = true
    setLoadingMore(true)

    try {
      if (mode === 'movies') {
        const nextPage = moviePage + 1
        const data = await getPopularMovies(nextPage)
        if (data.results.length === 0) {
          setHasMorePages(false)
        } else {
          setPopularMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMovies = data.results.filter(m => !existingIds.has(m.id))
            return [...prev, ...newMovies]
          })
          setMoviePage(nextPage)
          if (nextPage >= 20) setHasMorePages(false)
        }
      } else {
        const nextPage = animePage + 1
        const data = await getTopAnime(nextPage)
        if (data.data.length === 0) {
          setHasMorePages(false)
        } else {
          setAllAnime(prev => {
            const existingIds = new Set(prev.map(a => a.mal_id))
            const newAnime = data.data.filter(a => !existingIds.has(a.mal_id))
            return [...prev, ...newAnime]
          })
          setAnimePage(nextPage)
          if (nextPage >= 10) setHasMorePages(false)
        }
      }
    } catch (err) {
      console.error('Error loading more:', err)
    } finally {
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }, [mode, moviePage, animePage, hasMorePages])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getGenreNames = (genreIds: number[]): string => {
    return genreIds
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(', ')
  }

  const getGenreNamesForCategory = (genreIds: number[]): string => {
    const names = genreIds
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
    if (selectedCategory === 'All') return names.slice(0, 2).join(', ')
    return names.includes(selectedCategory) ? selectedCategory : names[0] || 'Movie'
  }

  const getAnimeGenreNames = (anime: Anime): string => {
    return anime.genres?.map(g => g.name).slice(0, 2).join(', ') || 'Anime'
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-red-400 text-center text-sm">{error}</Text>
        <TouchableOpacity
          style={{ backgroundColor: themeColors.primary }}
          className="mt-4 px-4 py-2 rounded-lg"
          onPress={mode === 'movies' ? loadMovieData : loadAnimeData}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredTrending = mode === 'movies'
    ? (selectedCategory === 'All'
      ? trendingMovies
      : trendingMovies.filter(m => m.genre_ids.some(id => genres.find(g => g.id === id)?.name === selectedCategory)))
    : (selectedCategory === 'All'
      ? trendingAnime
      : trendingAnime.filter(a => a.genres?.some(g => g.name === selectedCategory)))

  // Build list items for FlatList
  const listItems: ListItem[] = mode === 'movies'
    ? popularMovies.map(m => ({ kind: 'movie' as const, data: m }))
    : allAnime.map(a => ({ kind: 'anime' as const, data: a }))

  const categories = mode === 'movies' ? movieCategories : animeCategories

  // ── Render Helpers ────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View>
      {/* Mode Toggle - Movies / Anime */}
      <View style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text className="text-secondary font-bold text-2xl">
            {mode === 'movies' ? 'CineVerse' : 'AnimeVerse'}
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#0a0f14', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 3 }}>
            <TouchableOpacity
              onPress={() => setMode('movies')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor: mode === 'movies' ? '#0a2a33' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: mode === 'movies' ? '#2F9BBC' : '#64748b',
              }}>
                🎬 Movies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('anime')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor: mode === 'anime' ? '#1a0a2e' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: mode === 'anime' ? '#a855f7' : '#64748b',
              }}>
                🌸 Anime
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hero Section */}
      {mode === 'movies' ? renderMovieHero() : renderAnimeHero()}

      {/* Category Chips */}
      <View className="mt-4 px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full border ${selectedCategory === category
                  ? (mode === 'anime' ? 'bg-[#1a0a2e] border-purple-500/40' : 'bg-[#0a2a33] border-cyan-500/40')
                  : 'bg-[#061218] border-[#0a1f2a]'
                  }`}
              >
                <Text className={`text-sm font-medium ${selectedCategory === category
                  ? (mode === 'anime' ? 'text-purple-400' : 'text-primary')
                  : 'text-text-secondary'
                  }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Trending / Popular Horizontal */}
      <View className="mt-6 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-secondary font-bold text-xl">
            {mode === 'movies' ? 'Trending Now' : '🔥 This Season'}
          </Text>
          <TouchableOpacity onPress={() => setShowTrendingSheet(true)}>
            <Text className={`text-sm font-medium ${mode === 'anime' ? 'text-purple-400' : 'text-primary'}`}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {mode === 'movies'
              ? filteredTrending.map((item) => {
                  const movie = item as Movie
                  return (
                    <TouchableOpacity key={movie.id} className="w-40" onPress={() => router.push(`/movies/${movie.id}`)}>
                      <View className="w-40 h-60 rounded-card-xl overflow-hidden border border-white/10 bg-surface">
                        <Image
                          source={{ uri: getImageUrl(movie.poster_path, 'w342') ?? undefined }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                        <View className="absolute top-2 right-2 bg-[#1a1a1a] rounded-2xl px-2 py-1 flex-row items-center gap-1">
                          <SvgXml xml={starIcon} width={8} height={8} />
                          <Text className="text-yellow-400 font-bold text-xs">{formatRating(movie.vote_average)}</Text>
                        </View>
                      </View>
                      <Text className="text-secondary font-semibold text-sm mt-2" numberOfLines={1}>{movie.title}</Text>
                      <Text className="text-text-muted text-xs">
                        {formatReleaseYear(movie.release_date)} • {getGenreNamesForCategory(movie.genre_ids)}
                      </Text>
                    </TouchableOpacity>
                  )
                })
              : (filteredTrending as Anime[]).map((anime) => (
                  <TouchableOpacity key={anime.mal_id} className="w-40" onPress={() => router.push(`/anime/${anime.mal_id}` as any)}>
                    <View className="w-40 h-60 rounded-card-xl overflow-hidden border border-purple-500/20 bg-surface">
                      <Image
                        source={{ uri: anime.images?.jpg?.large_image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute top-2 right-2 bg-[#1a1a1a] rounded-2xl px-2 py-1 flex-row items-center gap-1">
                        <Text className="text-yellow-400 font-bold text-xs">★ {formatAnimeRating(anime.score)}</Text>
                      </View>
                    </View>
                    <Text className="text-secondary font-semibold text-sm mt-2" numberOfLines={1}>
                      {anime.title_english || anime.title}
                    </Text>
                    <Text className="text-text-muted text-xs">
                      {formatAnimeYear(anime)} • {anime.type || 'Anime'}
                    </Text>
                  </TouchableOpacity>
                ))
            }
          </View>
        </ScrollView>
      </View>

      {/* Recommended Section */}
      <View className="mt-8 px-4">
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-secondary font-bold text-xl">
            {mode === 'movies' ? 'Recommended For You' : 'Top Rated Anime'}
          </Text>
          <View className="w-3 h-3">
            <SvgXml xml={aistarsSvgWhite} width={13} height={13} />
          </View>
        </View>

        <View className="flex-row gap-3">
          {mode === 'movies'
            ? recommendedMovies.slice(0, 2).map((movie) => (
                <TouchableOpacity key={movie.id} className="flex-1" onPress={() => router.push(`/movies/${movie.id}`)}>
                  <View className="h-36 rounded-card-xl overflow-hidden">
                    <Image
                      source={{ uri: getImageUrl(movie.backdrop_path, 'w780') ?? undefined }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 justify-end">
                      <Text className="text-white font-bold text-base" numberOfLines={1}>{movie.title}</Text>
                      <Text className="text-white/70 text-xs">
                        {formatRating(movie.vote_average)} • {getGenreNames(movie.genre_ids)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : recommendedAnime.slice(0, 2).map((anime) => (
                <TouchableOpacity key={anime.mal_id} className="flex-1" onPress={() => router.push(`/anime/${anime.mal_id}` as any)}>
                  <View className="h-36 rounded-card-xl overflow-hidden">
                    <Image
                      source={{ uri: anime.images?.jpg?.large_image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 justify-end">
                      <Text className="text-white font-bold text-base" numberOfLines={1}>
                        {anime.title_english || anime.title}
                      </Text>
                      <Text className="text-white/70 text-xs">
                        ★ {formatAnimeRating(anime.score)} • {getAnimeGenreNames(anime)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
          }
        </View>
      </View>

      {/* Grid section title */}
      <View className="mt-8 px-4 mb-3">
        <Text className="text-secondary font-bold text-xl">
          {mode === 'movies' ? 'Popular Movies' : 'Top Anime'}
        </Text>
        <Text className="text-text-muted text-xs mt-1">
          {mode === 'movies' ? popularMovies.length : allAnime.length} {mode === 'movies' ? 'movies' : 'anime'} loaded • Scroll for more
        </Text>
      </View>
    </View>
  )

  // ── Hero sub-renderers ────────────────────────────────────────────────────

  const renderMovieHero = () => (
    <View className="h-[380px] mx-4 rounded-[28px] overflow-hidden shadow-2xl shadow-black/50">
      {showTrailer && heroTrailerKey ? (
        <WebView
          source={{ 
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; padding: 0; background: #000; }
                    iframe { width: 100%; height: 100%; border: none; }
                  </style>
                </head>
                <body>
                  <iframe 
                    src="https://www.youtube.com/embed/${heroTrailerKey}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                  </iframe>
                </body>
              </html>
            `
          }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.warn('WebView error:', nativeEvent)
            
            // If embedding fails, hide trailer and show static image
            if (nativeEvent.description?.includes('153') || 
                nativeEvent.title?.includes('153') ||
                nativeEvent.url?.includes('error=153')) {
              console.log('YouTube embedding restriction detected, falling back to static image')
              setShowTrailer(false)
            }
          }}
        />
      ) : (
        <Image
          source={heroMovie ? { uri: getImageUrl(heroMovie.backdrop_path, 'w1280') ?? undefined } : require('@/assets/images/interstellar2.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
      )}
      <View className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <View className="absolute bottom-0 left-0 right-0 p-6">
        <View className="flex-row gap-2 mb-3">
          {heroMovie && heroMovie.genre_ids.slice(0, 2).map((genreId, idx) => (
            <View key={idx} className="bg-[#0a2a33] border border-cyan-500/30 rounded-full px-3 py-1">
              <Text className="text-primary font-bold text-xs uppercase">
                {genres.find(g => g.id === genreId)?.name || 'Movie'}
              </Text>
            </View>
          ))}
        </View>
        <Text className="text-secondary font-bold text-display">{heroMovie?.title || 'Loading...'}</Text>
        <TouchableOpacity
          className="bg-primary mt-4 flex-row items-center justify-center gap-2 py-3 px-6 rounded-lg self-start shadow-lg shadow-cyan-500/25"
          onPress={() => heroMovie && router.push(`/movies/${heroMovie.id}`)}
        >
          <SvgXml xml={playIcon} width={12} height={12} />
          <Text className="text-secondary font-bold text-sm">Watch Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderAnimeHero = () => (
    <View className="h-[380px] mx-4 rounded-[28px] overflow-hidden shadow-2xl shadow-black/50">
      <Image
        source={heroAnime ? { uri: heroAnime.images?.jpg?.large_image_url } : require('@/assets/images/interstellar2.png')}
        className="w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <View className="absolute bottom-0 left-0 right-0 p-6">
        <View className="flex-row gap-2 mb-3">
          {heroAnime?.genres?.slice(0, 2).map((genre, idx) => (
            <View key={idx} className="bg-[#1a0a2e] border border-purple-500/30 rounded-full px-3 py-1">
              <Text className="text-purple-400 font-bold text-xs uppercase">{genre.name}</Text>
            </View>
          ))}
        </View>
        <Text className="text-secondary font-bold text-display">
          {heroAnime?.title_english || heroAnime?.title || 'Loading...'}
        </Text>
        <TouchableOpacity
          className="mt-4 flex-row items-center justify-center gap-2 py-3 px-6 rounded-lg self-start shadow-lg"
          style={{ backgroundColor: '#a855f7' }}
          onPress={() => heroAnime && router.push(`/anime/${heroAnime.mal_id}` as any)}
        >
          <SvgXml xml={playIcon} width={12} height={12} />
          <Text className="text-white font-bold text-sm">Watch Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // ── Grid card renderers ───────────────────────────────────────────────────

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    if (item.kind === 'movie') {
      const movie = item.data
      return (
        <TouchableOpacity
          style={{ width: '47%', marginLeft: index % 2 === 0 ? 0 : '6%' }}
          className="mb-4"
          onPress={() => router.push(`/movies/${movie.id}`)}
        >
          <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Image
              source={{ uri: getImageUrl(movie.poster_path, 'w342') ?? undefined }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <SvgXml xml={starIcon} width={8} height={8} />
              <Text style={{ color: '#facc15', fontWeight: '700', fontSize: 11 }}>{formatRating(movie.vote_average)}</Text>
            </View>
          </View>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13, marginTop: 8 }} numberOfLines={1}>{movie.title}</Text>
          <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
            {formatReleaseYear(movie.release_date)} • {getGenreNames(movie.genre_ids)}
          </Text>
        </TouchableOpacity>
      )
    } else {
      const anime = item.data
      return (
        <TouchableOpacity
          style={{ width: '47%', marginLeft: index % 2 === 0 ? 0 : '6%' }}
          className="mb-4"
          onPress={() => router.push(`/anime/${anime.mal_id}` as any)}
        >
          <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a0a2e', borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)' }}>
            <Image
              source={{ uri: anime.images?.jpg?.large_image_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: '#facc15', fontWeight: '700', fontSize: 11 }}>★ {formatAnimeRating(anime.score)}</Text>
            </View>
          </View>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13, marginTop: 8 }} numberOfLines={1}>
            {anime.title_english || anime.title}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
            {formatAnimeYear(anime)} • {anime.type || 'Anime'}
          </Text>
        </TouchableOpacity>
      )
    }
  }

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 140 }} />
    return (
      <View style={{ paddingVertical: 24, paddingBottom: 140, alignItems: 'center', gap: 8 }}>
        <ActivityIndicator size="small" color={themeColors.primary} />
        <Text style={{ color: '#64748b', fontSize: 12 }}>
          Loading more {mode === 'movies' ? 'movies' : 'anime'}...
        </Text>
      </View>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.kind === 'movie' ? `movie-${item.data.id}` : `anime-${item.data.mal_id}`
        }
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 0 }}
      />

      <AnimatedButton color={themeColors.primary} onPress={() => router.push('/aiscreen/aiscreen' as any)} />

      {/* Trending / Seasonal Bottom Sheet */}
      <BottomSheet
        visible={showTrendingSheet}
        onClose={() => setShowTrendingSheet(false)}
        title={mode === 'movies' ? 'Trending Now' : 'This Season'}
        heightPercent={0.75}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {mode === 'movies'
              ? trendingMovies.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    style={{ width: '47%' }}
                    onPress={() => {
                      setShowTrendingSheet(false)
                      setTimeout(() => router.push(`/movies/${movie.id}`), 300)
                    }}
                  >
                    <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                      <Image source={{ uri: getImageUrl(movie.poster_path, 'w342') ?? undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <SvgXml xml={starIcon} width={8} height={8} />
                        <Text style={{ color: '#facc15', fontWeight: '700', fontSize: 11 }}>{formatRating(movie.vote_average)}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13, marginTop: 8 }} numberOfLines={1}>{movie.title}</Text>
                    <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                      {formatReleaseYear(movie.release_date)} • {getGenreNames(movie.genre_ids)}
                    </Text>
                  </TouchableOpacity>
                ))
              : trendingAnime.map((anime) => (
                  <TouchableOpacity
                    key={anime.mal_id}
                    style={{ width: '47%' }}
                    onPress={() => {
                      setShowTrendingSheet(false)
                      setTimeout(() => router.push(`/anime/${anime.mal_id}` as any), 300)
                    }}
                  >
                    <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1a0a2e', borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)' }}>
                      <Image source={{ uri: anime.images?.jpg?.large_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ color: '#facc15', fontWeight: '700', fontSize: 11 }}>★ {formatAnimeRating(anime.score)}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13, marginTop: 8 }} numberOfLines={1}>
                      {anime.title_english || anime.title}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                      {formatAnimeYear(anime)} • {anime.type || 'Anime'}
                    </Text>
                  </TouchableOpacity>
                ))
            }
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  )
}

const AnimatedButton = ({ onPress, color }: { onPress: () => void; color: string }) => {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 120,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
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
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <SvgXml xml={aistarsSvgWhite} width={28} height={28} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default Index

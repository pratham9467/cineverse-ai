import { formatRating, formatReleaseYear, Genre, getGenres, getImageUrl, getNowPlayingMovies, getPopularMovies, getTrendingMovies, Movie } from '@/lib/tmdb'
import { playIcon, starIcon, aistarsSvgWhite } from '@/lib/icons'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const categories = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy']

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([])
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [trending, nowPlaying, popular, genresData] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getPopularMovies(1),
        getGenres(),
      ])

      setTrendingMovies(trending.results.slice(0, 10))
      setRecommendedMovies(popular.results.slice(0, 6))
      setHeroMovie(trending.results[0] || nowPlaying.results[0] || null)
      setGenres(genresData)
    } catch (err: any) {
      console.error('Error loading movie data:', err)
      setError(err.message || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2F9BBC" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-red-400 text-center text-sm">{error}</Text>
        <TouchableOpacity className="mt-4 bg-primary px-4 py-2 rounded-lg" onPress={loadData}>
          <Text className="text-secondary font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const filteredTrending = selectedCategory === 'All'
    ? trendingMovies
    : trendingMovies.filter(m => m.genre_ids.some(id => genres.find(g => g.id === id)?.name === selectedCategory))

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="h-[420px] rounded-[32px] overflow-hidden shadow-2xl shadow-black/50">
          <Image
            source={heroMovie ? { uri: getImageUrl(heroMovie.backdrop_path, 'w1280') ?? undefined } : require('@/assets/images/interstellar2.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
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

            <View className="flex-row items-center gap-3">
              <Text className="text-secondary font-bold text-display">
                {heroMovie?.title || 'Loading...'}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary mt-4 flex-row items-center justify-center gap-2 py-3 px-6 rounded-lg self-start shadow-lg shadow-cyan-500/25"
              onPress={() => heroMovie && router.push(`/movies/${heroMovie.id}`)}
            >
              <SvgXml xml={playIcon} width={12} height={12} />
              <Text className="text-secondary font-bold text-sm">Watch Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full border ${selectedCategory === category
                    ? 'bg-[#0a2a33] border-cyan-500/40'
                    : 'bg-[#061218] border-[#0a1f2a]'
                    }`}
                >
                  <Text className={`text-sm font-medium ${selectedCategory === category ? 'text-primary' : 'text-text-secondary'
                    }`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-6 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-secondary font-bold text-xl">Trending Now</Text>
            <Text className="text-primary text-sm font-medium">See All</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {filteredTrending.map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  className="w-40"
                  onPress={() => router.push(`/movies/${movie.id}`)}
                >
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
                  <Text className="text-secondary font-semibold text-sm mt-2" numberOfLines={1}>
                    {movie.title}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {formatReleaseYear(movie.release_date)} • {getGenreNamesForCategory(movie.genre_ids)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-8 px-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-secondary font-bold text-xl">Recommended For You</Text>
            <View className="w-3 h-3">
              <SvgXml xml={aistarsSvgWhite} width={13} height={13} />
            </View>
          </View>

          <View className="flex-row gap-3">
            {recommendedMovies.slice(0, 2).map((movie) => (
              <TouchableOpacity
                key={movie.id}
                className="flex-1"
                onPress={() => router.push(`/movies/${movie.id}`)}
              >
                <View className="h-36 rounded-card-xl overflow-hidden">
                  <Image
                    source={{ uri: getImageUrl(movie.backdrop_path, 'w780') ?? undefined }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 justify-end">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                      {movie.title}
                    </Text>
                    <Text className="text-white/70 text-xs">
                      {formatRating(movie.vote_average)} • {getGenreNames(movie.genre_ids)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-40" />
      </ScrollView>
      <AnimatedButton onPress={() => router.push('/aiscreen/aiscreen' as any)} />

    </View>
  )
}

const AnimatedButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
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
        className="w-16 h-16 rounded-full items-center justify-center bg-primary shadow-lg shadow-cyan-500/40"
      >
        <SvgXml xml={aistarsSvgWhite} width={28} height={28} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default Index

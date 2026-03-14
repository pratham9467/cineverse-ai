import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/lib/tmdb'
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/watchlist'
import { onWatchlistChanged } from '@/lib/watchlistEvents'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const searchIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="8" cy="8" r="5.5" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M12 12L16 16" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

const bookmarkIcon = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2.5H11V12.5L6.5 9.5L2 12.5V2.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`

const placeholderImages = [
  require('@/assets/images/interstellar.png'),
  require('@/assets/images/cyberpunk.png'),
  require('@/assets/images/inception.png'),
  require('@/assets/images/spiritedaway.png'),
  require('@/assets/images/dune2.png'),
  require('@/assets/images/backdrop.png'),
]

const tabs = [
  { name: 'Movies', count: 0 },
  { name: 'Anime', count: 0 },
  { name: 'Watching', count: 0 },
  { name: 'Completed', count: 0 },
]

const Watchlist = () => {
  const [selectedTab, setSelectedTab] = useState('Movies')
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const loadWatchlist = useCallback(async () => {
    if (!isLoggedIn || !user?.$id) {
      setLoading(false)
      return
    }

    try {
      const items = await getWatchlist(user.$id)
      setWatchlistItems(items)
    } catch (error) {
      console.error('Error loading watchlist:', error)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, user?.$id])

  useEffect(() => {
    loadWatchlist()
  }, [loadWatchlist])

  // Refresh watchlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWatchlist()
    }, [loadWatchlist])
  )

  // Listen for watchlist changes from other screens
  useEffect(() => {
    const unsubscribe = onWatchlistChanged(() => {
      console.log('Watchlist changed, refreshing...')
      loadWatchlist()
    })

    return unsubscribe
  }, [loadWatchlist])

  const handleRemove = async (itemId: string) => {
    const success = await removeFromWatchlist(itemId)
    if (success) {
      setWatchlistItems(prev => prev.filter(item => item.$id !== itemId))
    }
  }

  const getMovieImage = (posterPath: string | null, movieId: string, type: string) => {
    console.log('Watchlist image debug - movieId:', movieId, 'posterPath:', posterPath, 'type:', type)
    if (posterPath && posterPath.trim() !== '') {
      // If it's an anime (URL contains myanimelist), use it directly
      if (posterPath.includes('myanimelist.net')) {
        return { uri: posterPath }
      }
      // For movies, use TMDB image URL
      const imageUrl = getImageUrl(posterPath, 'w342')
      console.log('Generated image URL:', imageUrl)
      return { uri: imageUrl ?? undefined }
    }
    console.log('Using placeholder for movie:', movieId)
    const numericId = parseInt(movieId, 10) || 0
    return placeholderImages[numericId % placeholderImages.length]
  }

  const movieCount = watchlistItems.filter(item => item.type === 'movie' || !item.type).length
  const animeCount = watchlistItems.filter(item => item.type === 'anime').length

  const filteredItems = watchlistItems.filter(item => {
    if (selectedTab === 'Movies') return item.type === 'movie' || !item.type
    if (selectedTab === 'Anime') return item.type === 'anime'
    return true // For Watching and Completed, show all for now
  })

  const tabsWithCounts = tabs.map(tab => {
    if (tab.name === 'Movies') return { ...tab, count: movieCount }
    if (tab.name === 'Anime') return { ...tab, count: animeCount }
    return tab
  })

  return (
    <View className="flex-1 bg-background">
      <View className="pt-12 pb-2 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-secondary font-bold text-xl tracking-wide">My Watchlist</Text>
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center bg-cyan-500/10 rounded-full"
            onPress={() => router.push('/(tabs)/discover')}
          >
            <SvgXml xml={searchIcon} width={18} height={18} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 py-2 flex-1 w-full">
            {tabsWithCounts.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => setSelectedTab(tab.name)}
                className={`px-4 py-2 rounded-lg flex-row items-center gap-2 ${selectedTab === tab.name ? 'bg-primary' : 'border border-primary'
                  }`}
              >
                <Text className={`font-semibold text-sm ${selectedTab === tab.name ? 'text-white' : 'text-text-secondary'
                  }`}>
                  {tab.name}
                </Text>
                <View className={`px-1.5 py-0.5 rounded-md ${selectedTab === tab.name ? 'bg-white/20' : 'bg-cyan-500/20'
                  }`}>
                  <Text className={`text-micro font-semibold ${selectedTab === tab.name ? 'text-white' : 'text-primary'
                    }`}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2F9BBC" />
        </View>
      ) : !isLoggedIn ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted text-center mb-4">Please login to see your watchlist</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => router.push('/authscreen/login' as any)}
          >
            <Text className="text-secondary font-bold">Login</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted text-center mb-4">Your watchlist is empty</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text className="text-secondary font-bold">Discover Movies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="flex-row flex-wrap gap-3 justify-between">
            {filteredItems.map((item) => (
              <View key={item.$id} className="w-[48%]">
                <View className="aspect-[2/3] rounded-card overflow-hidden border border-purple-500/10 bg-surface-accent">
                  <Image
                    source={getMovieImage(item.moviePoster, item.movieId, item.type)}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <TouchableOpacity
                    className="absolute top-1 right-1 w-8 h-8 items-center justify-center border border-primary bg-primary rounded-full"
                    onPress={() => handleRemove(item.$id)}
                  >
                    <SvgXml xml={bookmarkIcon} width={13} height={13} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="absolute bottom-0 left-0 right-0 p-3"
                    onPress={() => {
                      if (item.type === 'anime') {
                        router.push(`/anime/${item.movieId}` as any)
                      } else {
                        router.push(`/movies/${item.movieId}` as any)
                      }
                    }}
                  >
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>
                      {item.movieTitle}
                    </Text>
                    <Text className="text-white/60 text-xs mt-1">
                      {item.movieRating != null ? item.movieRating.toFixed(1) : 'N/A'} • {item.movieReleaseDate?.split('-')[0] || 'N/A'}
                    </Text>
                    <Text className="text-white/40 text-xs mt-1" numberOfLines={1}>
                      {item.moviePoster ? 'Poster available' : 'No poster'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default Watchlist

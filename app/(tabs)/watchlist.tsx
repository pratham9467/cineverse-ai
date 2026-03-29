import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/lib/tmdb'
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/watchlist'
import { onWatchlistChanged } from '@/lib/watchlistEvents'
import { searchIconBlue as searchIcon, bookmarkIconBlue as bookmarkIcon } from '@/lib/icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useThemeMode } from '@/contexts/ThemeModeContext'

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
  const { colors: themeColors } = useThemeMode()

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
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: `${themeColors.primary}1A`, borderRadius: 18 }}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <SvgXml xml={searchIcon} width={18} height={18} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 py-2 flex-1 w-full">
            {tabsWithCounts.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => setSelectedTab(tab.name)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  backgroundColor: selectedTab === tab.name ? themeColors.primary : 'transparent',
                  borderWidth: selectedTab === tab.name ? 0 : 1,
                  borderColor: themeColors.primary,
                }}
              >
                <Text style={{
                  fontWeight: '600', fontSize: 14,
                  color: selectedTab === tab.name ? '#ffffff' : '#94a3b8',
                }}>
                  {tab.name}
                </Text>
                <View style={{
                  paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                  backgroundColor: selectedTab === tab.name ? 'rgba(255,255,255,0.2)' : `${themeColors.primary}33`,
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '600',
                    color: selectedTab === tab.name ? '#ffffff' : themeColors.primary,
                  }}>
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
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : !isLoggedIn ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted text-center mb-4">Please login to see your watchlist</Text>
          <TouchableOpacity
            style={{ backgroundColor: themeColors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => router.push('/authscreen/login' as any)}
          >
            <Text className="text-white font-bold">Login</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted text-center mb-4">Your watchlist is empty</Text>
          <TouchableOpacity
            style={{ backgroundColor: themeColors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text className="text-white font-bold">Discover Movies</Text>
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
                 <TouchableWithoutFeedback
                   onPress={() => {
                     if (item.type === 'anime') {
                       router.push(`/anime/${item.movieId}` as any)
                     } else {
                       router.push(`/movies/${item.movieId}` as any)
                     }
                   }}
                 >
                   <View className="aspect-[2/3] rounded-card overflow-hidden border border-purple-500/10 bg-surface-accent">
                     <Image
                       source={getMovieImage(item.moviePoster, item.movieId, item.type)}
                       className="w-full h-full"
                       resizeMode="cover"
                     />
                     <View className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                     <TouchableOpacity
                       style={{ position: 'absolute', top: 4, right: 4, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColors.primary, backgroundColor: themeColors.primary, borderRadius: 16 }}
                       onPress={() => handleRemove(item.$id)}
                     >
                       <SvgXml xml={bookmarkIcon} width={13} height={13} />
                     </TouchableOpacity>
                     <View className="absolute bottom-0 left-0 right-0 p-3">
                       <Text className="text-white font-bold text-sm" numberOfLines={1}>
                         {item.movieTitle}
                       </Text>
                       <Text className="text-white/60 text-xs mt-1">
                         {item.movieRating != null ? item.movieRating.toFixed(1) : 'N/A'} • {item.movieReleaseDate?.split('-')[0] || 'N/A'}
                       </Text>
                       <Text className="text-white/40 text-xs mt-1" numberOfLines={1}>
                         {item.moviePoster ? 'Poster available' : 'No poster'}
                       </Text>
                     </View>
                   </View>
                 </TouchableWithoutFeedback>
               </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default Watchlist

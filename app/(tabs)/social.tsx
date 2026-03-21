import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/contexts/SocialContext'
import {
  aiIcon,
  bookmarkIcon,
  heartIcon,
  homeIcon,
  notificationIcon,
  starIcon
} from '@/lib/icons'
import { Activity, ActivityType, User } from '@/lib/social'
import { getImageUrl } from '@/lib/tmdb'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'

// ============================================================================
// TYPES
// ============================================================================

interface ActivityCardProps {
  activity: Activity
  onPress?: () => void
}

interface UserSuggestionCardProps {
  user: User
  onFollow: () => void
  isFollowing: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'added_to_watchlist':
      return bookmarkIcon
    case 'rated':
      return starIcon
    case 'reviewed':
      return aiIcon
    case 'completed':
      return heartIcon
    case 'started_watching':
      return playIcon
    case 'followed_user':
      return userPlusIcon
    default:
      return starIcon
  }
}

function getActivityText(activity: Activity): string {
  switch (activity.type) {
    case 'added_to_watchlist':
      return 'added to watchlist'
    case 'rated':
      return `rated ${activity.rating}★`
    case 'reviewed':
      return 'reviewed'
    case 'completed':
      return 'completed'
    case 'started_watching':
      return 'started watching'
    case 'followed_user':
      return 'started following'
    default:
      return 'interacted with'
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
const userPlusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`

// ============================================================================
// COMPONENTS
// ============================================================================

const ActivityCard = ({ activity, onPress }: ActivityCardProps) => {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        className="flex-row items-start p-4 bg-surface/50 rounded-xl mb-3 border border-white/5"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* User Avatar */}
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center overflow-hidden mr-3">
          {activity.userAvatar ? (
            <Image source={{ uri: activity.userAvatar }} className="w-full h-full" />
          ) : (
            <Text className="text-primary font-bold text-sm">
              {activity.userName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-text-primary font-semibold text-sm mr-1" numberOfLines={1}>
              {activity.userName}
            </Text>
            <Text className="text-text-muted text-xs">
              {getActivityText(activity)}
            </Text>
          </View>

          <Text className="text-text-secondary font-medium text-sm mb-1" numberOfLines={1}>
            {activity.targetTitle}
          </Text>

          {activity.review && (
            <Text className="text-text-muted text-xs mb-2" numberOfLines={2}>{activity.review}</Text>
          )}

          <Text className="text-text-muted text-xs">
            {formatTimeAgo(activity.createdAt)}
          </Text>
        </View>

        {/* Content Image */}
        {activity.targetPoster && (
          <View className="w-16 h-24 rounded-lg overflow-hidden ml-3">
            <Image
              source={{ uri: getImageUrl(activity.targetPoster, 'w185') ?? undefined }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const UserSuggestionCard = ({ user, onFollow, isFollowing }: UserSuggestionCardProps) => {
  return (
    <View className="flex-row items-center p-3 bg-surface/30 rounded-xl mb-2 border border-white/5">
      <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center overflow-hidden mr-3">
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
        ) : (
          <Text className="text-primary font-bold">
            {user.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-sm" numberOfLines={1}>
          {user.name}
        </Text>
        {user.bio && (
          <Text className="text-text-muted text-xs" numberOfLines={1}>
            {user.bio}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className={`px-4 py-2 rounded-lg ${isFollowing ? 'bg-surface border border-primary' : 'bg-primary'}`}
        onPress={onFollow}
      >
        <Text className={`text-xs font-semibold ${isFollowing ? 'text-primary' : 'text-white'}`}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const EmptyState = ({ type }: { type: 'feed' | 'suggestions' }) => (
  <View className="flex-1 items-center justify-center py-20 px-6">
    <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
      <SvgXml xml={type === 'feed' ? homeIcon : userPlusIcon} width={32} height={32} color="#2F9BBC" />
    </View>
    <Text className="text-text-primary font-bold text-lg text-center mb-2">
      {type === 'feed' ? 'No Activity Yet' : 'No Suggestions'}
    </Text>
    <Text className="text-text-muted text-sm text-center">
      {type === 'feed'
        ? 'Follow friends to see their movie activities here'
        : 'Check back later for user suggestions'}
    </Text>
  </View>
)

// ============================================================================
// MAIN SCREEN
// ============================================================================

const SocialScreen = () => {
  const { user, isLoggedIn } = useAuth()
  const {
    activityFeed,
    isLoading,
    refreshFeed,
    followUser,
    unfollowUser,
    isFollowing,
    following,
    followers
  } = useSocial()

  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed')
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        refreshFeed()
      }
    }, [isLoggedIn, refreshFeed])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshFeed()
    setRefreshing(false)
  }

  const handleFollow = async (userId: string) => {
    if (isFollowing(userId)) {
      await unfollowUser(userId)
    } else {
      await followUser(userId)
    }
  }

  const handleActivityPress = (activity: Activity) => {
    if (activity.type === 'followed_user') {
      // Navigate to profile screen
      router.push('/(tabs)/profile')
    } else {
      // Navigate to movie or anime detail
      if (activity.targetId.startsWith('anime_')) {
        router.push(`/anime/${activity.targetId.replace('anime_', '')}` as any)
      } else {
        router.push(`/movies/${activity.targetId}` as any)
      }
    }
  }

  if (!isLoggedIn) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
          <SvgXml xml={homeIcon} width={40} height={40} color="#2F9BBC" />
        </View>
        <Text className="text-text-primary font-bold text-2xl text-center mb-2">
          Connect with Friends
        </Text>
        <Text className="text-text-muted text-center mb-6">
          Login to see what your friends are watching and share your own activity
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl"
          onPress={() => router.push('/authscreen/login')}
        >
          <Text className="text-white font-semibold">Login to Continue</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary font-bold text-2xl">Social</Text>
          <TouchableOpacity className="p-2">
            <SvgXml xml={notificationIcon} width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around py-4 bg-surface/50 rounded-xl border border-white/5 mb-4">
          <View className="items-center">
            <Text className="text-text-primary font-bold text-xl">{following.length}</Text>
            <Text className="text-text-muted text-xs">Following</Text>
          </View>
          <View className="w-px bg-white/10" />
          <View className="items-center">
            <Text className="text-text-primary font-bold text-xl">{followers.length}</Text>
            <Text className="text-text-muted text-xs">Followers</Text>
          </View>
          <View className="w-px bg-white/10" />
          <View className="items-center">
            <Text className="text-text-primary font-bold text-xl">{activityFeed.length}</Text>
            <Text className="text-text-muted text-xs">Activity</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-surface/30 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'feed' ? 'bg-primary' : ''}`}
            onPress={() => setActiveTab('feed')}
          >
            <Text className={`text-center text-sm font-semibold ${activeTab === 'feed' ? 'text-white' : 'text-text-muted'}`}>
              Activity Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'discover' ? 'bg-primary' : ''}`}
            onPress={() => setActiveTab('discover')}
          >
            <Text className={`text-center text-sm font-semibold ${activeTab === 'discover' ? 'text-white' : 'text-text-muted'}`}>
              Discover
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading && activityFeed.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2F9BBC" />
        </View>
      ) : activeTab === 'feed' ? (
        <FlatList
          data={activityFeed}
          renderItem={({ item }) => (
            <ActivityCard
              activity={item}
              onPress={() => handleActivityPress(item)}
            />
          )}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2F9BBC"
            />
          }
          ListEmptyComponent={<EmptyState type="feed" />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text className="text-text-primary font-semibold text-lg mb-4">
            Suggested for You
          </Text>

          {suggestions.length === 0 ? (
            <EmptyState type="suggestions" />
          ) : (
            suggestions.map((suggestedUser) => (
              <UserSuggestionCard
                key={suggestedUser.$id}
                user={suggestedUser}
                onFollow={() => handleFollow(suggestedUser.$id)}
                isFollowing={isFollowing(suggestedUser.$id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default SocialScreen

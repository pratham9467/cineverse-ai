import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { 
  getFollowers, 
  getFollowing, 
  getActivityFeed,
  followUser,
  unfollowUser,
  getUserProfile,
  searchUsers,
  User,
  Activity,
  FollowStats
} from '@/lib/social'

interface SocialContextType {
  // State
  followers: User[]
  following: User[]
  activityFeed: Activity[]
  isLoading: boolean
  
  // Profile
  userProfile: User | null
  followStats: FollowStats
  
  // Actions
  followUser: (userId: string) => Promise<void>
  unfollowUser: (userId: string) => Promise<void>
  refreshFeed: () => Promise<void>
  loadUserProfile: (userId: string) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
  isFollowing: (userId: string) => boolean
}

const SocialContext = createContext<SocialContextType>({} as SocialContextType)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [activityFeed, setActivityFeed] = useState<Activity[]>([])
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
    reviewsCount: 0,
    watchlistCount: 0
  })

  const refreshFeed = useCallback(async () => {
    if (!isLoggedIn || !user?.$id) return
    
    setIsLoading(true)
    try {
      const [feedData, followersData, followingData] = await Promise.all([
        getActivityFeed(user.$id),
        getFollowers(user.$id),
        getFollowing(user.$id)
      ])
      
      setActivityFeed(feedData)
      setFollowers(followersData)
      setFollowing(followingData)
      setFollowStats((prev: FollowStats) => ({
        ...prev,
        followersCount: followersData.length,
        followingCount: followingData.length
      }))
    } catch (error) {
      console.error('Error refreshing social feed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.$id])

  useEffect(() => {
    if (isLoggedIn) {
      refreshFeed()
    }
  }, [isLoggedIn, refreshFeed])

  const handleFollowUser = async (userId: string) => {
    if (!user?.$id) return
    
    try {
      await followUser(user.$id, userId)
      
      // Optimistic update
      const targetUser = await getUserProfile(userId)
      if (targetUser) {
        setFollowing((prev: User[]) => [...prev, targetUser])
        setFollowStats((prev: FollowStats) => ({
          ...prev,
          followingCount: prev.followingCount + 1
        }))
      }
    } catch (error) {
      console.error('Error following user:', error)
      throw error
    }
  }

  const handleUnfollowUser = async (userId: string) => {
    if (!user?.$id) return
    
    try {
      await unfollowUser(user.$id, userId)
      
      // Optimistic update
      setFollowing((prev: User[]) => prev.filter((u: User) => u.$id !== userId))
      setFollowStats((prev: FollowStats) => ({
        ...prev,
        followingCount: Math.max(0, prev.followingCount - 1)
      }))
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  const loadUserProfile = async (userId: string) => {
    setIsLoading(true)
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return []
    
    try {
      return await searchUsers(query)
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  const isFollowing = (userId: string): boolean => {
    return following.some(u => u.$id === userId)
  }

  const value: SocialContextType = {
    followers,
    following,
    activityFeed,
    isLoading,
    userProfile,
    followStats,
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,
    refreshFeed,
    loadUserProfile,
    searchUsers: handleSearchUsers,
    isFollowing
  }

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useSocial must be used within a SocialProvider')
  }
  return context
}

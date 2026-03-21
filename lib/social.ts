import { databases, account } from './appwrite'
import { ID, Query } from 'react-native-appwrite'

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  $id: string
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  joinedAt: string
  isPremium: boolean
}

export interface Activity {
  $id: string
  userId: string
  userName: string
  userAvatar?: string
  type: ActivityType
  targetId: string
  targetTitle: string
  targetPoster?: string
  rating?: number
  review?: string
  createdAt: string
}

export type ActivityType = 
  | 'added_to_watchlist'
  | 'rated'
  | 'reviewed'
  | 'completed'
  | 'started_watching'
  | 'followed_user'

export interface FollowStats {
  followersCount: number
  followingCount: number
  reviewsCount: number
  watchlistCount: number
}

export interface Review {
  $id: string
  userId: string
  userName: string
  userAvatar?: string
  movieId: string
  movieTitle: string
  moviePoster?: string
  rating: number
  content: string
  likes: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface FollowRelationship {
  $id: string
  followerId: string
  followingId: string
  createdAt: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || ''
const USERS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID || ''
const ACTIVITY_COLLECTION_ID = 'activities' // You'll need to create this
const REVIEWS_COLLECTION_ID = 'reviews' // You'll need to create this
const FOLLOWS_COLLECTION_ID = 'follows' // You'll need to create this

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapDocumentToUser(doc: any): User {
  return {
    $id: doc.$id,
    name: doc.name || 'Anonymous',
    email: doc.email || '',
    avatarUrl: doc.avatarUrl,
    bio: doc.bio,
    joinedAt: doc.joinedAt || doc.$createdAt,
    isPremium: doc.isPremium || false
  }
}

function mapDocumentToActivity(doc: any): Activity {
  return {
    $id: doc.$id,
    userId: doc.userId,
    userName: doc.userName || 'Anonymous',
    userAvatar: doc.userAvatar,
    type: doc.type,
    targetId: doc.targetId,
    targetTitle: doc.targetTitle,
    targetPoster: doc.targetPoster,
    rating: doc.rating,
    review: doc.review,
    createdAt: doc.$createdAt
  }
}

// ============================================================================
// USER PROFILE
// ============================================================================

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId)
    return mapDocumentToUser(doc)
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User | null> {
  try {
    const doc = await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatarUrl
    })
    return mapDocumentToUser(doc)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

export async function searchUsers(query: string): Promise<User[]> {
  try {
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.search('name', query),
      Query.limit(20)
    ])
    return response.documents.map(mapDocumentToUser)
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

// ============================================================================
// FOLLOW SYSTEM
// ============================================================================

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    // Check if collection exists first
    if (!FOLLOWS_COLLECTION_ID) {
      console.warn('FOLLOWS_COLLECTION_ID not configured')
      return false
    }
    
    await databases.createDocument(DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), {
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    })
    return true
  } catch (error: any) {
    if (error?.code === 404) {
      console.warn('Follows collection not found. Please create it in Appwrite.')
      return false
    }
    console.error('Error following user:', error)
    return false
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    if (!FOLLOWS_COLLECTION_ID) {
      return false
    }
    
    // Find the follow relationship
    const response = await databases.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION_ID, [
      Query.equal('followerId', followerId),
      Query.equal('followingId', followingId)
    ])
    
    if (response.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, FOLLOWS_COLLECTION_ID, response.documents[0].$id)
    }
    return true
  } catch (error: any) {
    if (error?.code === 404) {
      return false
    }
    console.error('Error unfollowing user:', error)
    return false
  }
}

export async function getFollowers(userId: string): Promise<User[]> {
  try {
    if (!FOLLOWS_COLLECTION_ID) {
      return []
    }
    
    // Get all follow relationships where this user is being followed
    const response = await databases.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION_ID, [
      Query.equal('followingId', userId),
      Query.limit(100)
    ])
    
    // Get user details for each follower
    const followers: User[] = []
    for (const follow of response.documents) {
      const user = await getUserProfile(follow.followerId)
      if (user) followers.push(user)
    }
    return followers
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting followers:', error)
    return []
  }
}

export async function getFollowing(userId: string): Promise<User[]> {
  try {
    if (!FOLLOWS_COLLECTION_ID) {
      return []
    }
    
    // Get all follow relationships where this user is following others
    const response = await databases.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION_ID, [
      Query.equal('followerId', userId),
      Query.limit(100)
    ])
    
    // Get user details for each following
    const following: User[] = []
    for (const follow of response.documents) {
      const user = await getUserProfile(follow.followingId)
      if (user) following.push(user)
    }
    return following
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting following:', error)
    return []
  }
}

export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    if (!FOLLOWS_COLLECTION_ID) {
      return false
    }
    
    const response = await databases.listDocuments(DATABASE_ID, FOLLOWS_COLLECTION_ID, [
      Query.equal('followerId', followerId),
      Query.equal('followingId', followingId),
      Query.limit(1)
    ])
    return response.documents.length > 0
  } catch (error: any) {
    if (error?.code === 404) {
      return false
    }
    console.error('Error checking follow status:', error)
    return false
  }
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

export async function createActivity(data: Omit<Activity, '$id' | 'createdAt'>): Promise<Activity | null> {
  try {
    if (!ACTIVITY_COLLECTION_ID) {
      console.warn('ACTIVITY_COLLECTION_ID not configured')
      return null
    }
    
    const doc = await databases.createDocument(DATABASE_ID, ACTIVITY_COLLECTION_ID, ID.unique(), {
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      type: data.type,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
      targetPoster: data.targetPoster,
      rating: data.rating,
      review: data.review,
      createdAt: new Date().toISOString()
    })
    return mapDocumentToActivity(doc)
  } catch (error: any) {
    if (error?.code === 404) {
      console.warn('Activity collection not found. Please create it in Appwrite.')
      return null
    }
    console.error('Error creating activity:', error)
    return null
  }
}

export async function getActivityFeed(userId: string, limit: number = 50): Promise<Activity[]> {
  try {
    if (!ACTIVITY_COLLECTION_ID) {
      return []
    }
    
    // Get list of users this person is following
    const following = await getFollowing(userId)
    const followingIds = following.map(u => u.$id)
    
    // Include own activities
    followingIds.push(userId)
    
    if (followingIds.length === 0) {
      return []
    }
    
    // Get activities from followed users (max 10 at a time due to Appwrite limitations)
    const allActivities: Activity[] = []
    
    // Process in batches of 10 (Appwrite query limit)
    for (let i = 0; i < followingIds.length && i < 50; i += 10) {
      const batch = followingIds.slice(i, i + 10)
      const response = await databases.listDocuments(DATABASE_ID, ACTIVITY_COLLECTION_ID, [
        Query.equal('userId', batch),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ])
      
      const batchActivities = response.documents.map(mapDocumentToActivity)
      allActivities.push(...batchActivities)
    }
    
    // Sort by date
    return allActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting activity feed:', error)
    return []
  }
}

export async function getUserActivities(userId: string, limit: number = 20): Promise<Activity[]> {
  try {
    if (!ACTIVITY_COLLECTION_ID) {
      return []
    }
    
    const response = await databases.listDocuments(DATABASE_ID, ACTIVITY_COLLECTION_ID, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit)
    ])
    return response.documents.map(mapDocumentToActivity)
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting user activities:', error)
    return []
  }
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function createReview(data: Omit<Review, '$id' | 'likes' | 'isLiked' | 'createdAt' | 'updatedAt'>): Promise<Review | null> {
  try {
    if (!REVIEWS_COLLECTION_ID) {
      console.warn('REVIEWS_COLLECTION_ID not configured')
      return null
    }
    
    const now = new Date().toISOString()
    const doc = await databases.createDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, ID.unique(), {
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      movieId: data.movieId,
      movieTitle: data.movieTitle,
      moviePoster: data.moviePoster,
      rating: data.rating,
      content: data.content,
      likes: 0,
      createdAt: now,
      updatedAt: now
    })
    return {
      ...mapDocumentToReview(doc),
      isLiked: false
    }
  } catch (error: any) {
    if (error?.code === 404) {
      console.warn('Reviews collection not found. Please create it in Appwrite.')
      return null
    }
    console.error('Error creating review:', error)
    return null
  }
}

export async function getMovieReviews(movieId: string): Promise<Review[]> {
  try {
    if (!REVIEWS_COLLECTION_ID) {
      return []
    }
    
    const response = await databases.listDocuments(DATABASE_ID, REVIEWS_COLLECTION_ID, [
      Query.equal('movieId', movieId),
      Query.orderDesc('$createdAt'),
      Query.limit(50)
    ])
    return response.documents.map(doc => ({
      ...mapDocumentToReview(doc),
      isLiked: false
    }))
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting movie reviews:', error)
    return []
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    if (!REVIEWS_COLLECTION_ID) {
      return []
    }
    
    const response = await databases.listDocuments(DATABASE_ID, REVIEWS_COLLECTION_ID, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(50)
    ])
    return response.documents.map(doc => ({
      ...mapDocumentToReview(doc),
      isLiked: false
    }))
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting user reviews:', error)
    return []
  }
}

export async function likeReview(reviewId: string): Promise<boolean> {
  try {
    if (!REVIEWS_COLLECTION_ID) {
      return false
    }
    
    const doc = await databases.getDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, reviewId)
    await databases.updateDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, reviewId, {
      likes: (doc.likes || 0) + 1
    })
    return true
  } catch (error: any) {
    if (error?.code === 404) {
      return false
    }
    console.error('Error liking review:', error)
    return false
  }
}

export async function unlikeReview(reviewId: string): Promise<boolean> {
  try {
    if (!REVIEWS_COLLECTION_ID) {
      return false
    }
    
    const doc = await databases.getDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, reviewId)
    await databases.updateDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, reviewId, {
      likes: Math.max(0, (doc.likes || 0) - 1)
    })
    return true
  } catch (error: any) {
    if (error?.code === 404) {
      return false
    }
    console.error('Error unliking review:', error)
    return false
  }
}

function mapDocumentToReview(doc: any): Review {
  return {
    $id: doc.$id,
    userId: doc.userId,
    userName: doc.userName,
    userAvatar: doc.userAvatar,
    movieId: doc.movieId,
    movieTitle: doc.movieTitle,
    moviePoster: doc.moviePoster,
    rating: doc.rating,
    content: doc.content,
    likes: doc.likes || 0,
    isLiked: false,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt || doc.$createdAt
  }
}

// ============================================================================
// DISCOVER PEOPLE
// ============================================================================

export async function getPopularUsers(limit: number = 10): Promise<User[]> {
  try {
    if (!USERS_COLLECTION_ID) {
      return []
    }
    
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.orderDesc('isPremium'),
      Query.limit(limit)
    ])
    return response.documents.map(mapDocumentToUser)
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting popular users:', error)
    return []
  }
}

export async function getSuggestedUsers(userId: string, limit: number = 5): Promise<User[]> {
  try {
    if (!USERS_COLLECTION_ID) {
      return []
    }
    
    // Get users that the current user is not following
    const following = await getFollowing(userId)
    const followingIds = following.map(u => u.$id)
    followingIds.push(userId) // Exclude self
    
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.limit(50)
    ])
    
    // Filter out already following and self
    const suggestions = response.documents
      .map(mapDocumentToUser)
      .filter(u => !followingIds.includes(u.$id))
      .slice(0, limit)
    
    return suggestions
  } catch (error: any) {
    if (error?.code === 404) {
      return []
    }
    console.error('Error getting suggested users:', error)
    return []
  }
}

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  Review,
  createReview,
  getMovieReviews,
  getUserReviews,
  likeReview,
  unlikeReview
} from '@/lib/social'
import { createActivity } from '@/lib/social'

interface ReviewsContextType {
  // State
  reviews: Review[]
  userReviews: Review[]
  isLoading: boolean
  isSubmitting: boolean
  
  // Actions
  fetchMovieReviews: (movieId: string) => Promise<void>
  fetchUserReviews: (userId: string) => Promise<void>
  submitReview: (data: SubmitReviewData) => Promise<Review | null>
  toggleLike: (reviewId: string, isLiked: boolean) => Promise<void>
  clearReviews: () => void
}

interface SubmitReviewData {
  movieId: string
  movieTitle: string
  moviePoster?: string
  rating: number
  content: string
}

const ReviewsContext = createContext<ReviewsContextType>({} as ReviewsContextType)

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMovieReviews = useCallback(async (movieId: string) => {
    setIsLoading(true)
    try {
      const data = await getMovieReviews(movieId)
      setReviews(data)
    } catch (error) {
      console.error('Error fetching movie reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUserReviews = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await getUserReviews(userId)
      setUserReviews(data)
    } catch (error) {
      console.error('Error fetching user reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitReview = async (data: SubmitReviewData): Promise<Review | null> => {
    if (!isLoggedIn || !user) {
      throw new Error('Must be logged in to submit a review')
    }

    setIsSubmitting(true)
    try {
      const review = await createReview({
        userId: user.$id,
        userName: user.name,
        userAvatar: user.avatarUrl,
        movieId: data.movieId,
        movieTitle: data.movieTitle,
        moviePoster: data.moviePoster,
        rating: data.rating,
        content: data.content
      })

      if (review) {
        // Add to local state
        setReviews(prev => [review, ...prev])
        
        // Create activity
        await createActivity({
          userId: user.$id,
          userName: user.name,
          userAvatar: user.avatarUrl,
          type: 'reviewed',
          targetId: data.movieId,
          targetTitle: data.movieTitle,
          targetPoster: data.moviePoster,
          rating: data.rating,
          review: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : '')
        })
      }

      return review
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLike = async (reviewId: string, isLiked: boolean) => {
    // Optimistic update
    setReviews(prev => prev.map(review => 
      review.$id === reviewId 
        ? { 
            ...review, 
            isLiked: !isLiked,
            likes: isLiked ? review.likes - 1 : review.likes + 1
          }
        : review
    ))

    try {
      if (isLiked) {
        await unlikeReview(reviewId)
      } else {
        await likeReview(reviewId)
      }
    } catch (error) {
      // Revert on error
      setReviews(prev => prev.map(review => 
        review.$id === reviewId 
          ? { 
              ...review, 
              isLiked,
              likes: isLiked ? review.likes + 1 : review.likes - 1
            }
          : review
      ))
      console.error('Error toggling like:', error)
    }
  }

  const clearReviews = () => {
    setReviews([])
    setUserReviews([])
  }

  const value: ReviewsContextType = {
    reviews,
    userReviews,
    isLoading,
    isSubmitting,
    fetchMovieReviews,
    fetchUserReviews,
    submitReview,
    toggleLike,
    clearReviews
  }

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return context
}

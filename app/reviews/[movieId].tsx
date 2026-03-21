import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useReviews } from '@/contexts/ReviewsContext'
import { Review } from '@/lib/social'
import { getImageUrl } from '@/lib/tmdb'
import { 
  chevronLeft, 
  starIcon, 
  starIconLarge, 
  heartIcon,
  sendIcon
} from '@/lib/icons'
import { SvgXml } from 'react-native-svg'
import Animated, { FadeInDown } from 'react-native-reanimated'

// ============================================================================
// TYPES
// ============================================================================

interface ReviewCardProps {
  review: Review
  onLike: () => void
}

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  size?: 'small' | 'large'
}

// ============================================================================
// COMPONENTS
// ============================================================================

const StarRating = ({ rating, onRate, size = 'small' }: StarRatingProps) => {
  const starSize = size === 'large' ? 28 : 18
  const [hoveredRating, setHoveredRating] = useState(0)
  
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate?.(star)}
          onPressIn={() => setHoveredRating(star)}
          onPressOut={() => setHoveredRating(0)}
          disabled={!onRate}
        >
          <View 
            className={`${(hoveredRating || rating) >= star ? 'opacity-100' : 'opacity-30'}`}
            style={{ width: starSize, height: starSize }}
          >
            <SvgXml 
              xml={size === 'large' ? starIconLarge : starIcon} 
              width={starSize} 
              height={starSize} 
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const ReviewCard = ({ review, onLike }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View className="bg-surface/50 rounded-xl p-4 mb-3 border border-white/5">
        {/* Header */}
        <View className="flex-row items-start mb-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center overflow-hidden mr-3">
            {review.userAvatar ? (
              <Image source={{ uri: review.userAvatar }} className="w-full h-full" />
            ) : (
              <Text className="text-primary font-bold text-sm">
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-text-primary font-semibold text-sm">
              {review.userName}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <StarRating rating={review.rating} />
              <Text className="text-text-muted text-xs">
                {formatDate(review.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Content */}
        <Text className="text-text-secondary text-sm leading-5 mb-3">
          {review.content}
        </Text>
        
        {/* Actions */}
        <View className="flex-row items-center justify-between pt-3 border-t border-white/5">
          <TouchableOpacity 
            className={`flex-row items-center gap-2 ${review.isLiked ? 'text-red-400' : 'text-text-muted'}`}
            onPress={onLike}
          >
            <SvgXml 
              xml={heartIcon} 
              width={16} 
              height={16} 
              color={review.isLiked ? '#EF4444' : '#64748B'}
            />
            <Text className={review.isLiked ? 'text-red-400' : 'text-text-muted'}>
              {review.likes} {review.likes === 1 ? 'like' : 'likes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="text-text-muted">
            <Text className="text-text-muted text-xs">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

const WriteReviewSection = ({ 
  movieId, 
  movieTitle, 
  moviePoster,
  onSubmit, 
  isSubmitting 
}: { 
  movieId: string
  movieTitle: string
  moviePoster?: string
  onSubmit: (rating: number, content: string) => Promise<void>
  isSubmitting: boolean
}) => {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating')
      return
    }
    if (content.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters')
      return
    }

    await onSubmit(rating, content.trim())
    setRating(0)
    setContent('')
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <TouchableOpacity 
        className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4"
        onPress={() => setIsExpanded(true)}
      >
        <Text className="text-primary text-center font-semibold">
          Write a Review
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View className="bg-surface/50 rounded-xl p-4 mb-4 border border-primary/30">
      <Text className="text-text-primary font-semibold text-lg mb-3">
        Write Your Review
      </Text>
      
      {/* Star Rating */}
      <View className="mb-4">
        <Text className="text-text-muted text-sm mb-2">Your Rating</Text>
        <StarRating rating={rating} onRate={setRating} size="large" />
      </View>
      
      {/* Review Content */}
      <View className="mb-4">
        <Text className="text-text-muted text-sm mb-2">Your Review</Text>
        <TextInput
          className="bg-background border border-white/10 rounded-xl p-3 text-text-primary min-h-[100px]"
          placeholder="Share your thoughts about this movie..."
          placeholderTextColor="#64748B"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />
      </View>
      
      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl border border-white/10"
          onPress={() => setIsExpanded(false)}
        >
          <Text className="text-text-muted text-center font-semibold">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-xl ${isSubmitting ? 'bg-primary/50' : 'bg-primary'}`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

const ReviewsScreen = () => {
  const { movieId, movieTitle, moviePoster } = useLocalSearchParams<{
    movieId: string
    movieTitle: string
    moviePoster?: string
  }>()
  
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { reviews, isLoading, isSubmitting, fetchMovieReviews, submitReview, toggleLike } = useReviews()
  
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')

  useEffect(() => {
    if (movieId) {
      fetchMovieReviews(movieId)
    }
  }, [movieId, fetchMovieReviews])

  const handleSubmitReview = async (rating: number, content: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to write a review')
      return
    }

    try {
      await submitReview({
        movieId: movieId!,
        movieTitle: movieTitle || 'Unknown Movie',
        moviePoster: moviePoster as string | undefined,
        rating,
        content
      })
      Alert.alert('Success', 'Your review has been posted!')
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.')
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="pt-12 pb-4 px-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.back()}
            >
              <SvgXml xml={chevronLeft} width={10} height={18} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-lg" numberOfLines={1}>
                Reviews
              </Text>
              {movieTitle && (
                <Text className="text-text-muted text-xs" numberOfLines={1}>
                  {movieTitle}
                </Text>
              )}
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Stats */}
          <View className="flex-row items-center justify-between py-4 px-4 bg-surface/50 rounded-xl mb-4 border border-white/5">
            <View className="items-center">
              <Text className="text-text-primary font-bold text-2xl">
                {averageRating.toFixed(1)}
              </Text>
              <View className="mt-1">
                <StarRating rating={Math.round(averageRating)} />
              </View>
            </View>
            <View className="items-center">
              <Text className="text-text-primary font-bold text-2xl">
                {reviews.length}
              </Text>
              <Text className="text-text-muted text-xs">
                {reviews.length === 1 ? 'Review' : 'Reviews'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary font-bold text-2xl">
                {reviews.filter(r => r.rating >= 4).length}
              </Text>
              <Text className="text-text-muted text-xs">
                Positive
              </Text>
            </View>
          </View>

          {/* Write Review */}
          {isLoggedIn && (
            <WriteReviewSection
              movieId={movieId!}
              movieTitle={movieTitle || 'Unknown Movie'}
              moviePoster={moviePoster as string | undefined}
              onSubmit={handleSubmitReview}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Sort Options */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary font-semibold">
              All Reviews
            </Text>
            <View className="flex-row bg-surface/30 rounded-lg p-1">
              <TouchableOpacity
                className={`px-3 py-1 rounded-md ${sortBy === 'recent' ? 'bg-primary' : ''}`}
                onPress={() => setSortBy('recent')}
              >
                <Text className={`text-xs font-semibold ${sortBy === 'recent' ? 'text-white' : 'text-text-muted'}`}>
                  Recent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-1 rounded-md ${sortBy === 'popular' ? 'bg-primary' : ''}`}
                onPress={() => setSortBy('popular')}
              >
                <Text className={`text-xs font-semibold ${sortBy === 'popular' ? 'text-white' : 'text-text-muted'}`}>
                  Popular
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews List */}
          {isLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator size="large" color="#2F9BBC" />
            </View>
          ) : sortedReviews.length === 0 ? (
            <View className="h-40 items-center justify-center">
              <Text className="text-text-muted text-center">
                No reviews yet. Be the first to review!
              </Text>
            </View>
          ) : (
            sortedReviews.map((review) => (
              <ReviewCard
                key={review.$id}
                review={review}
                onLike={() => toggleLike(review.$id, review.isLiked)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ReviewsScreen

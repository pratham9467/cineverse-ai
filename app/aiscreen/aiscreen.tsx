import { aistarsSvgWhite, sparkleIcon, sendIcon, bookmarkIcon, aiIcon } from '@/lib/icons'
import { AIRecommendation, getAIEnhancedRecommendations } from '@/lib/ai'
import { getImageUrl, Movie } from '@/lib/tmdb'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'

const placeholderImages = [
  require('@/assets/images/interstellar.png'),
  require('@/assets/images/cyberpunk.png'),
  require('@/assets/images/inception.png'),
  require('@/assets/images/spiritedaway.png'),
  require('@/assets/images/dune2.png'),
  require('@/assets/images/backdrop.png'),
]

const quickSuggestions = [
  'Something like Inception',
  'Feel-good movies',
  'Mind-bending thrillers',
  'Best sci-fi 2024',
  'Hidden gems',
  'Underrated classics',
]

const surprisePrompts = [
  "I want something that will blow my mind with unexpected plot twists",
  "Show me critically acclaimed movies most people haven't heard of",
  "I'm in the mood for a movie that will make me cry and feel alive",
  "Give me the best action movies from the last 3 years",
  "I want a feel-good movie that's not cheesy or predictable",
  "Something dark and psychological that will haunt me for days",
  "Movies with incredible cinematography that look like paintings",
  "I want to watch something uplifting and inspiring for when life feels heavy",
  "Best foreign language films that Americans should watch",
  "Give me sci-fi movies that actually make you think",
  "Movies like The Matrix but more recent",
  "Something thrilling but not horror - edge of my seat stuff",
  "Underrated 90s movies that were ahead of their time",
  "I want a movie that captures the feeling of wanderlust and adventure",
  "Dark comedies that are actually clever and funny",
]

const sanitizeAIResponse = (text: string): string => {
  // Remove any API key references or environment variable names
  const patterns = [
    /expo_public_ollama_aoi_key/gi,
    /expo_public_[a-z_]+_key/gi,
    /ollama_[a-z_]+_key/gi,
    /api_key/gi,
    /API_KEY/gi,
    /sk-[a-zA-Z0-9]+/g,
    /[a-f0-9]{32,}/g,
  ]

  let cleaned = text
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '[REDACTED]')
  }

  // If the response is just about API keys or empty after cleaning, return a fallback
  if (cleaned.includes('[REDACTED]') && cleaned.length < 100) {
    return "I'm here to help you discover great movies! What kind of film are you in the mood for?"
  }

  return cleaned
}

const AIScreen = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [aiReasoning, setAiReasoning] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadInitialRecommendations()
  }, [])

  const loadInitialRecommendations = async () => {
    setLoading(true)
    try {
      console.log('[AI Screen] Loading initial recommendations')
      const response = await getAIEnhancedRecommendations('Show me popular and highly-rated movies right now', 'adrenaline')
      console.log('[AI Screen] Initial recommendations loaded:', response.recommendations.length, 'movies')
      setRecommendations(response.recommendations)
      setAiReasoning(sanitizeAIResponse(response.reasoning.join('\n\n')))
    } catch (error) {
      console.error('[AI Screen] Error loading initial recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!query.trim() || loading) return

    const userQuery = query.trim()
    setQuery('')
    setLoading(true)
    setHasSearched(true)
    setIsAiTyping(true)

    try {
      console.log('[AI Screen] Sending query:', userQuery)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const response = await getAIEnhancedRecommendations(userQuery, 'adrenaline')
      console.log('[AI Screen] Received response:', {
        recommendationsCount: response.recommendations.length,
        isAIEnhanced: response.isAIEnhanced,
        latencyMs: response.latencyMs,
      })
      setIsAiTyping(false)
      setRecommendations(response.recommendations)
      setAiReasoning(sanitizeAIResponse(response.reasoning.join('\n\n')))
    } catch (error) {
      console.error('[AI Screen] Error getting AI response:', error)
      setIsAiTyping(false)
      Alert.alert('Error', `Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration.`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    setLoading(true)
    setHasSearched(true)
    setIsAiTyping(true)

    getAIEnhancedRecommendations(suggestion, 'adrenaline').then(response => {
      setIsAiTyping(false)
      setRecommendations(response.recommendations)
      setAiReasoning(sanitizeAIResponse(response.reasoning.join('\n\n')))
    }).catch(() => {
      setIsAiTyping(false)
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleSurpriseMe = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]

    setLoading(true)
    setHasSearched(true)
    setIsAiTyping(true)

    getAIEnhancedRecommendations(randomPrompt, 'adrenaline').then(response => {
      setIsAiTyping(false)
      setRecommendations(response.recommendations)
      setAiReasoning(sanitizeAIResponse(`Surprise: "${randomPrompt}"\n\n${response.reasoning.join('\n\n')}`))
    }).catch(() => {
      setIsAiTyping(false)
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movies/${movie.id}`)
  }

  const getMovieImage = (posterPath: string | null) => {
    if (posterPath) {
      const url = getImageUrl(posterPath, 'w342')
      if (url) return { uri: url }
    }
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)]
  }

  const renderRecommendationCard = ({ item, index }: { item: AIRecommendation; index: number }) => (
    <Animated.View entering={FadeInRight.delay(100 + index * 80).duration(400)}>
      <TouchableOpacity
        className="w-[155px] mr-3"
        onPress={() => handleMoviePress(item.movie)}
        activeOpacity={0.8}
      >
        <View className="relative">
          <Image
            source={getMovieImage(item.movie.poster_path)}
            className="w-full rounded-xl"
            style={{ height: 230 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 17, 21, 0.95)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 100, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          />
          <View className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/90">
            <Text className="text-white text-[10px] font-bold">{item.matchPercentage}% Match</Text>
          </View>
          <Pressable className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 items-center justify-center">
            <SvgXml xml={bookmarkIcon} width={12} height={12} />
          </Pressable>
          <View className="absolute bottom-0 left-0 right-0 p-2.5">
            <Text className="text-white text-sm font-bold" numberOfLines={1}>{item.movie.title}</Text>
            <Text className="text-white/60 text-[10px] mt-0.5">
              {item.movie.release_date?.split('-')[0] || 'N/A'} • {item.movie.vote_average?.toFixed(1) || 'N/A'}★
            </Text>
          </View>
        </View>
        <Text className="text-text-muted text-[10px] mt-2 leading-4" numberOfLines={2}>{item.reason}</Text>
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={['#0f1115', '#1a0b2e', '#0a1a2f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="pt-[60px] pb-2 px-4">
          <View className="flex-row items-center justify-center gap-2">
            <SvgXml xml={aistarsSvgWhite} width={22} height={22} />
            <Text
              className="text-white text-xl font-bold tracking-tight"
              style={{
                textShadowColor: 'rgba(47, 155, 188, 0.8)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              }}
            >
              CineVerse AI
            </Text>
          </View>
          <Text className="text-text-muted text-xs text-center mt-1">Tell me what you want to watch</Text>
        </View>

        {/* Input Bar - At the top to avoid keyboard overlap */}
        <View className="px-4 py-3">
          <View
            className="h-[52px] rounded-full bg-black/40 border border-primary/50 flex-row items-center px-4"
            style={{
              shadowColor: '#2F9BBC',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <TextInput
              className="flex-1 text-white text-sm"
              placeholder="Describe your perfect movie night..."
              placeholderTextColor="#64748b"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSend}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${query.trim() && !loading ? 'bg-primary' : 'bg-white/10'}`}
              disabled={!query.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <SvgXml xml={sendIcon} width={16} height={16} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI Response */}
          {(aiReasoning || isAiTyping) && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-4 mb-4">
              <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                    <SvgXml xml={aiIcon} width={14} height={14} />
                  </View>
                  <Text className="text-primary text-xs font-semibold">AI Assistant</Text>
                </View>
                {isAiTyping ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#2F9BBC" />
                    <Text className="text-text-secondary text-sm">Thinking...</Text>
                  </View>
                ) : (
                  <Text className="text-text-secondary text-sm leading-5">{aiReasoning}</Text>
                )}
              </View>
            </Animated.View>
          )}

          {/* Quick Suggestions */}
          {!hasSearched && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-4 mb-6">
              <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">Try asking...</Text>
              <View className="flex-row flex-wrap gap-2">
                {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickSuggestion(suggestion)}
                    className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-full"
                    activeOpacity={0.7}
                  >
                    <Text className="text-text-secondary text-xs">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Recommendations */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">{hasSearched ? 'Recommended For You' : 'Popular Picks'}</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <Text className="text-text-muted text-[10px]">AI Powered</Text>
              </View>
            </View>

            {loading && recommendations.length === 0 ? (
              <View className="h-[280px] items-center justify-center bg-card/50 border border-white/5 rounded-2xl">
                <ActivityIndicator size="large" color="#2F9BBC" />
                <Text className="text-text-muted text-sm mt-3">Finding perfect movies...</Text>
              </View>
            ) : recommendations.length === 0 ? (
              <View className="h-[280px] items-center justify-center bg-card/50 border border-white/5 rounded-2xl">
                <Text className="text-text-muted text-sm">No recommendations found</Text>
                <TouchableOpacity onPress={loadInitialRecommendations} className="mt-3 px-4 py-2 bg-primary/10 rounded-lg">
                  <Text className="text-primary text-sm font-medium">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={recommendations}
                renderItem={renderRecommendationCard}
                keyExtractor={(item) => item.movie.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              />
            )}
          </Animated.View>

          {/* Refresh Button */}
          {hasSearched && recommendations.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-4 mb-20">
              <TouchableOpacity
                onPress={loadInitialRecommendations}
                className="flex-row items-center justify-center gap-2 py-3 bg-white/5 rounded-xl"
              >
                <SvgXml xml={sparkleIcon} width={14} height={14} />
                <Text className="text-text-secondary text-sm">Get Different Recommendations</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>

        {/* Surprise Me Button */}
        <TouchableOpacity
          onPress={handleSurpriseMe}
          disabled={loading}
          className="absolute right-5 flex-row items-center gap-2 py-3 px-5 rounded-full overflow-hidden"
          style={{
            bottom: Platform.OS === 'ios' ? 90 : 80,
            backgroundColor: 'rgba(47, 155, 188, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(47, 155, 188, 0.35)',
            shadowColor: '#2F9BBC',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderTopLeftRadius: 100,
              borderTopRightRadius: 100,
            }}
          />
          <View className="w-5 h-5 items-center justify-center z-10">
            <SvgXml xml={sparkleIcon} width={16} height={16} />
          </View>
          <Text className="text-white text-sm font-bold z-10">Surprise Me</Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

export default AIScreen
import { getImageUrl } from '@/lib/tmdb'
import { getWatchlist, WatchlistItem } from '@/lib/watchlist'
import { onWatchlistChanged } from '@/lib/watchlistEvents'
import { aistarsblu, chevronRight, preferencesIcon, accountIcon, billingIcon, editProfile } from '@/lib/icons'
import BottomSheet from '@/lib/BottomSheet'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Easing, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeMode, ThemeColors } from '@/contexts/ThemeModeContext'

const userImage = require('@/assets/images/user.png')

const placeholderImages = [
    require('@/assets/images/interstellar.png'),
    require('@/assets/images/cyberpunk.png'),
    require('@/assets/images/inception.png'),
    require('@/assets/images/spiritedaway.png'),
    require('@/assets/images/dune2.png'),
    require('@/assets/images/backdrop.png'),
]

// ── AI Taste Engine ──────────────────────────────────────────────────────────

interface TasteCategory {
    label: string
    percentage: number
    color: string
}

// Pools of taste categories the AI can pick from
const MOOD_CATEGORIES = [
    'Dark & Intense', 'Thrilling & Suspenseful', 'Mind-Bending', 'Gritty & Raw',
    'Epic & Grand', 'Moody & Atmospheric', 'Haunting & Eerie', 'Provocative & Bold',
]
const GENRE_CATEGORIES = [
    'Sci-Fi & Futurism', 'Fantasy & Mythical', 'Action & Adrenaline', 'Drama & Emotion',
    'Horror & Supernatural', 'Mystery & Noir', 'Anime & Animation', 'Crime & Heist',
]
const VIBE_CATEGORIES = [
    'Feel Good', 'Nostalgic & Retro', 'Philosophical', 'Romantic & Heartfelt',
    'Cerebral & Complex', 'Visually Stunning', 'Cult Classic Lover', 'Indie & Art-house',
]

const AI_INSIGHTS = [
    (stats: TasteStats) => `Your affinity for ${stats.topMood.toLowerCase()} content has grown ${stats.changePercent}% this month. AI detects a shift toward more complex narratives.`,
    (stats: TasteStats) => `Based on ${stats.totalItems} titles, your taste DNA leans ${stats.dominantRatio}% toward ${stats.topMood.toLowerCase()} themes with ${stats.topGenre.toLowerCase()} undertones.`,
    (stats: TasteStats) => `CineVerse AI analyzed your collection of ${stats.totalItems} titles. Your cinematic fingerprint is uniquely ${stats.topVibe.toLowerCase()} with a ${stats.avgRating} avg rating preference.`,
    (stats: TasteStats) => `Pattern detected: you gravitate toward ${stats.topGenre.toLowerCase()} stories. ${stats.animePercent > 30 ? 'Strong anime influence detected.' : 'Primarily live-action focused.'} Taste confidence: ${stats.confidence}%`,
    (stats: TasteStats) => `Your viewing DNA shows a ${stats.changePercent}% increase in ${stats.topVibe.toLowerCase()} content. AI predicts you'll enjoy more ${stats.topGenre.toLowerCase()} next.`,
    (stats: TasteStats) => `Among ${stats.totalItems} curated titles, your ${stats.topMood.toLowerCase()} preference stands out at ${stats.dominantRatio}%. Taste evolution is actively tracked.`,
]

interface TasteStats {
    topMood: string
    topGenre: string
    topVibe: string
    totalItems: number
    avgRating: string
    animePercent: number
    dominantRatio: number
    changePercent: number
    confidence: number
}

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

function generateTasteProfile(items: WatchlistItem[], themeColors: ThemeColors): { categories: TasteCategory[], insight: string, stats: TasteStats } {
    const now = new Date()
    // Seed changes daily so the profile feels fresh each day
    const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const itemSeed = items.length * 7 + (items.reduce((sum, i) => sum + (i.movieRating || 0), 0))
    const seed = daySeed + itemSeed

    const totalItems = items.length
    const avgRating = totalItems > 0
        ? (items.reduce((sum, i) => sum + (i.movieRating || 0), 0) / totalItems).toFixed(1)
        : '0.0'
    const animeCount = items.filter(i => i.type === 'anime').length
    const animePercent = totalItems > 0 ? Math.round((animeCount / totalItems) * 100) : 0
    const avgRatingNum = parseFloat(avgRating)

    // Pick categories based on seed + user data
    const moodIdx = Math.floor(seededRandom(seed + 1) * MOOD_CATEGORIES.length)
    const genreIdx = Math.floor(seededRandom(seed + 2) * GENRE_CATEGORIES.length)
    const vibeIdx = Math.floor(seededRandom(seed + 3) * VIBE_CATEGORIES.length)

    // If user has anime, bias toward anime category
    const finalGenre = animePercent > 40
        ? 'Anime & Animation'
        : GENRE_CATEGORIES[genreIdx]

    // Calculate percentages influenced by user data
    let moodPct: number, genrePct: number, vibePct: number

    if (totalItems === 0) {
        // No data — show balanced defaults with slight randomness
        moodPct = 33 + Math.floor(seededRandom(seed + 10) * 10)
        genrePct = 33 + Math.floor(seededRandom(seed + 11) * 8)
        vibePct = 100 - moodPct - genrePct
    } else {
        // Derive from ratings: high avg rating → more intense/complex tastes
        const ratingFactor = Math.min(avgRatingNum / 10, 1)
        const baseMood = 30 + Math.floor(ratingFactor * 35) + Math.floor(seededRandom(seed + 20) * 10) - 5
        const baseGenre = 20 + Math.floor(animePercent * 0.3) + Math.floor(seededRandom(seed + 21) * 10)

        // Clamp values
        moodPct = Math.max(10, Math.min(75, baseMood))
        genrePct = Math.max(10, Math.min(60, baseGenre))
        vibePct = Math.max(5, 100 - moodPct - genrePct)

        // Normalize to 100%
        const total = moodPct + genrePct + vibePct
        moodPct = Math.round((moodPct / total) * 100)
        genrePct = Math.round((genrePct / total) * 100)
        vibePct = 100 - moodPct - genrePct
    }

    // Sort by percentage descending
    const rawCategories: TasteCategory[] = [
        { label: MOOD_CATEGORIES[moodIdx], percentage: moodPct, color: themeColors.primary },
        { label: finalGenre, percentage: genrePct, color: `${themeColors.primary}B3` },
        { label: VIBE_CATEGORIES[vibeIdx], percentage: vibePct, color: '#64748B' },
    ].sort((a, b) => b.percentage - a.percentage)

    // Assign colors by rank
    rawCategories[0].color = themeColors.primary
    rawCategories[1].color = `${themeColors.primary}B3`
    rawCategories[2].color = '#64748B99'

    const stats: TasteStats = {
        topMood: rawCategories[0].label,
        topGenre: finalGenre,
        topVibe: VIBE_CATEGORIES[vibeIdx],
        totalItems,
        avgRating,
        animePercent,
        dominantRatio: rawCategories[0].percentage,
        changePercent: 5 + Math.floor(seededRandom(seed + 30) * 20),
        confidence: totalItems > 10 ? 92 : totalItems > 5 ? 78 : totalItems > 0 ? 55 : 30,
    }

    const insightIdx = Math.floor(seededRandom(seed + 40) * AI_INSIGHTS.length)
    const insight = AI_INSIGHTS[insightIdx](stats)

    return { categories: rawCategories, insight, stats }
}

// ── Animated Bar Component ───────────────────────────────────────────────────

const AnimatedBar = ({ percentage, color, delay }: { percentage: number; color: string; delay: number }) => {
    const widthAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(widthAnim, {
                toValue: percentage,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start()
        }, delay)
        return () => clearTimeout(timer)
    }, [percentage, delay, widthAnim])

    const animatedWidth = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    })

    return (
        <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View
                style={{
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 4,
                    width: animatedWidth,
                }}
            />
        </View>
    )
}

// ── Profile Component ────────────────────────────────────────────────────────

const Profile = () => {
    const { user, logout } = useAuth()
    const router = useRouter()
    const { mode, colors: themeColors } = useThemeMode()
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showHistorySheet, setShowHistorySheet] = useState(false)

    const loadWatchlist = useCallback(async () => {
        if (!user?.$id) {
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
    }, [user?.$id])

    useEffect(() => {
        loadWatchlist()
    }, [loadWatchlist])

    useFocusEffect(
        useCallback(() => {
            loadWatchlist()
        }, [loadWatchlist])
    )

    useEffect(() => {
        const unsubscribe = onWatchlistChanged(() => {
            loadWatchlist()
        })
        return unsubscribe
    }, [loadWatchlist])

    // Dynamic AI taste profile computed from watchlist
    const tasteProfile = useMemo(() => {
        return generateTasteProfile(watchlistItems, themeColors)
    }, [watchlistItems, themeColors])

    const getMovieImage = (posterPath: string | null, movieId: string, _type: string) => {
        if (posterPath && posterPath.trim() !== '') {
            if (posterPath.includes('myanimelist.net')) {
                return { uri: posterPath }
            }
            const imageUrl = getImageUrl(posterPath, 'w342')
            return { uri: imageUrl ?? undefined }
        }
        const numericId = parseInt(movieId, 10) || 0
        return placeholderImages[numericId % placeholderImages.length]
    }

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout()
                    }
                }
            ]
        )
    }

    const getUpdatedLabel = () => {
        const hour = new Date().getHours()
        if (hour < 6) return 'UPDATED OVERNIGHT'
        if (hour < 12) return 'UPDATED THIS AM'
        if (hour < 18) return 'UPDATED TODAY'
        return 'UPDATED THIS PM'
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Profile Header */}
                <View className="pt-24 px-6 items-center">
                    <View style={{ position: 'relative' }}>
                        <View
                            style={{
                                borderRadius: 100,
                                padding: 2,
                                backgroundColor: themeColors.primary,
                                boxShadow: `0 4px 12px ${themeColors.primary}4D`,
                            }}
                        >
                            <View style={{
                                backgroundColor: '#000000',
                                borderRadius: 100,
                                padding: 4,
                            }}>
                                <Image
                                    source={userImage}
                                    style={{ width: 144, height: 144, borderRadius: 100 }}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                width: 36,
                                height: 36,
                                borderRadius: 100,
                                backgroundColor: themeColors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 100,
                                boxShadow: `0 2px 8px ${themeColors.primary}66`,
                            }}
                            onPress={() => router.push('/profile/account')}
                            activeOpacity={0.8}
                        >
                            <SvgXml xml={editProfile} width={14} height={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6 items-center">
                        <Text className="text-secondary font-bold text-3xl tracking-tight">
                            {user?.name || 'Guest'}
                        </Text>
                        <View style={{ backgroundColor: `${themeColors.primary}1A` }} className="mt-2 px-4 py-1.5 rounded-full">
                            <Text style={{ color: themeColors.primary }} className="text-xs font-semibold tracking-wide uppercase">
                                {user?.isPremium ? 'Premium Member' : 'Standard Member'}
                            </Text>
                        </View>
                        <Text className="text-text-secondary text-sm text-center mt-3 leading-6 max-w-xs">
                            Cinematic explorer & Sci-Fi enthusiast. Curating the future of storytelling since 2023.
                        </Text>
                    </View>
                </View>

                {/* AI Taste Profile Section — DYNAMIC */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <View className="flex-row items-center gap-2.5">
                            <SvgXml xml={aistarsblu} width={18} height={18} color={themeColors.primary} />
                            <Text className="text-secondary font-bold text-base">
                                {mode === 'anime' ? 'Anime Taste Profile' : 'AI Taste Profile'}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View style={{ backgroundColor: `${themeColors.primary}1A` }} className="px-3 py-1 rounded-full">
                                <Text style={{ color: themeColors.primary }} className="text-[10px] font-bold tracking-wide">
                                    {getUpdatedLabel()}
                                </Text>
                            </View>
                            {tasteProfile.stats.totalItems > 0 && (
                                <View className="px-2 py-1 bg-white/5 rounded-full">
                                    <Text className="text-text-secondary text-[10px] font-bold">
                                        {tasteProfile.stats.confidence}% ✦
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View
                        className="bg-card border border-white/5 rounded-2xl p-5"
                        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
                    >
                        {/* Stats row */}
                        {tasteProfile.stats.totalItems > 0 && (
                            <View className="flex-row justify-around mb-5 pb-4 border-b border-white/5">
                                <View className="items-center">
                                    <Text style={{ color: themeColors.primary }} className="font-bold text-lg">{tasteProfile.stats.totalItems}</Text>
                                    <Text className="text-text-muted text-[10px] mt-0.5">Titles</Text>
                                </View>
                                <View className="items-center">
                                    <Text style={{ color: themeColors.primary }} className="font-bold text-lg">{tasteProfile.stats.avgRating}★</Text>
                                    <Text className="text-text-muted text-[10px] mt-0.5">Avg Rating</Text>
                                </View>
                                <View className="items-center">
                                    <Text style={{ color: themeColors.primary }} className="font-bold text-lg">{tasteProfile.stats.animePercent}%</Text>
                                    <Text className="text-text-muted text-[10px] mt-0.5">Anime</Text>
                                </View>
                                <View className="items-center">
                                    <Text style={{ color: themeColors.primary }} className="font-bold text-lg">+{tasteProfile.stats.changePercent}%</Text>
                                    <Text className="text-text-muted text-[10px] mt-0.5">Growth</Text>
                                </View>
                            </View>
                        )}

                        {/* Taste bars */}
                        <View className="gap-5">
                            {tasteProfile.categories.map((cat, idx) => (
                                <View key={cat.label}>
                                    <View className="flex-row justify-between mb-2.5">
                                        <Text className="text-text-primary text-sm font-medium">{cat.label}</Text>
                                        <Text style={{ color: idx === 0 ? themeColors.primary : idx === 1 ? `${themeColors.primary}B3` : '#94a3b8', fontWeight: '700', fontSize: 13 }}>
                                            {cat.percentage}%
                                        </Text>
                                    </View>
                                    <AnimatedBar percentage={cat.percentage} color={cat.color} delay={idx * 200} />
                                </View>
                            ))}
                        </View>

                        {/* AI insight */}
                        <View className="border-t border-white/5 pt-4 mt-5">
                            <View className="flex-row items-start gap-2">
                                <SvgXml xml={aistarsblu} width={12} height={12} color={themeColors.primary} style={{ marginTop: 2 }} />
                                <Text className="text-text-secondary text-xs leading-5 flex-1">
                                    {tasteProfile.insight}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Viewing History Section - Synced with Watchlist */}
                <View className="mt-10 px-5">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-secondary font-bold text-base">Viewing History</Text>
                        <TouchableOpacity onPress={() => setShowHistorySheet(true)}>
                            <Text style={{ color: themeColors.primary }} className="text-sm font-medium">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="h-[180px] items-center justify-center">
                            <ActivityIndicator size="small" color={themeColors.primary} />
                        </View>
                    ) : watchlistItems.length === 0 ? (
                        <View className="h-[180px] items-center justify-center bg-card border border-white/5 rounded-2xl">
                            <Text className="text-text-muted text-sm">No items in your watchlist yet</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/discover')}
                                style={{ backgroundColor: `${themeColors.primary}1A` }}
                                className="mt-3 px-4 py-2 rounded-lg"
                            >
                                <Text style={{ color: themeColors.primary }} className="text-sm font-medium">Discover Movies</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                        >
                            {watchlistItems.slice(0, 10).map((item) => (
                                <TouchableOpacity
                                    key={item.$id}
                                    className="w-[100px]"
                                    onPress={() => {
                                        if (item.type === 'anime') {
                                            router.push(`/anime/${item.movieId}` as any)
                                        } else {
                                            router.push(`/movies/${item.movieId}` as any)
                                        }
                                    }}
                                >
                                    <View
                                        className="w-[100px] h-[150px] rounded-xl overflow-hidden bg-card"
                                        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                                    >
                                        <Image
                                            source={getMovieImage(item.moviePoster, item.movieId, item.type)}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text className="text-text-primary text-[11px] font-semibold mt-2" numberOfLines={1}>
                                        {item.movieTitle}
                                    </Text>
                                    <Text className="text-text-muted text-[9px] mt-0.5">
                                        {item.movieRating ? `${item.movieRating.toFixed(1)} ★` : 'N/A'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Settings Menu */}
                <View className="mt-10 mx-5 bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <TouchableOpacity
                        className="flex-row items-center justify-between px-5 py-4"
                        activeOpacity={0.7}
                        onPress={() => router.push('/profile/preferences')}
                    >
                        <View className="flex-row items-center gap-3.5">
                            <SvgXml xml={preferencesIcon} width={20} height={20} color={themeColors.primary} />
                            <Text className="text-secondary text-[15px] font-medium">Preferences</Text>
                        </View>
                        <SvgXml xml={chevronRight} width={8} height={14} color={themeColors.primary} />
                    </TouchableOpacity>

                    <View className="mx-5 border-t border-white/5" />

                    <TouchableOpacity
                        className="flex-row items-center justify-between px-5 py-4"
                        activeOpacity={0.7}
                        onPress={() => router.push('/profile/account')}
                    >
                        <View className="flex-row items-center gap-3.5">
                            <SvgXml xml={accountIcon} width={22} height={22} color={themeColors.primary} />
                            <Text className="text-secondary text-[15px] font-medium">Account Details</Text>
                        </View>
                        <SvgXml xml={chevronRight} width={8} height={14} color={themeColors.primary} />
                    </TouchableOpacity>

                    <View className="mx-5 border-t border-white/5" />

                    <TouchableOpacity
                        className="flex-row items-center justify-between px-5 py-4"
                        activeOpacity={0.7}
                        onPress={() => router.push('/profile/billing')}
                    >
                        <View className="flex-row items-center gap-3.5">
                            <SvgXml xml={billingIcon} width={22} height={18} color={themeColors.primary} />
                            <Text className="text-secondary text-[15px] font-medium">Billing & Subscription</Text>
                        </View>
                        <View className="flex-row items-center gap-2.5">
                            <View style={{ backgroundColor: `${themeColors.primary}1A` }} className="px-2.5 py-1 rounded-full">
                                <Text style={{ color: themeColors.primary }} className="text-[10px] font-bold">
                                    {user?.isPremium ? 'PRO' : 'BASIC'}
                                </Text>
                            </View>
                            <SvgXml xml={chevronRight} width={8} height={14} color={themeColors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="mx-5 mt-8 py-4 rounded-2xl items-center border border-red-500/20"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                    activeOpacity={0.8}
                >
                    <Text className="text-red-500 font-semibold text-sm">Sign Out</Text>
                </TouchableOpacity>

                <View className="h-24" />
            </ScrollView>

            {/* Viewing History Bottom Sheet */}
            <BottomSheet
                visible={showHistorySheet}
                onClose={() => setShowHistorySheet(false)}
                title={`Viewing History (${watchlistItems.length})`}
                heightPercent={0.75}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                >
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {watchlistItems.map((item) => (
                            <TouchableOpacity
                                key={item.$id}
                                style={{ width: '30.5%' }}
                                onPress={() => {
                                    setShowHistorySheet(false)
                                    setTimeout(() => {
                                        if (item.type === 'anime') {
                                            router.push(`/anime/${item.movieId}` as any)
                                        } else {
                                            router.push(`/movies/${item.movieId}` as any)
                                        }
                                    }, 300)
                                }}
                            >
                                <View style={{ height: 140, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                                    <Image
                                        source={getMovieImage(item.moviePoster, item.movieId, item.type)}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 11, marginTop: 6 }} numberOfLines={1}>
                                    {item.movieTitle}
                                </Text>
                                <Text style={{ color: '#64748b', fontSize: 9, marginTop: 1 }}>
                                    {item.movieRating ? `${item.movieRating.toFixed(1)} ★` : 'N/A'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </BottomSheet>
        </View>
    )
}

export default Profile
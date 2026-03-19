import { getImageUrl } from '@/lib/tmdb'
import { getWatchlist, WatchlistItem } from '@/lib/watchlist'
import { onWatchlistChanged } from '@/lib/watchlistEvents'
import { aistarsblu, chevronRight, preferencesIcon, accountIcon, billingIcon, editProfile } from '@/lib/icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useAuth } from '../../contexts/AuthContext'

const userImage = require('@/assets/images/user.png')

const placeholderImages = [
    require('@/assets/images/interstellar.png'),
    require('@/assets/images/cyberpunk.png'),
    require('@/assets/images/inception.png'),
    require('@/assets/images/spiritedaway.png'),
    require('@/assets/images/dune2.png'),
    require('@/assets/images/backdrop.png'),
]

const Profile = () => {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)

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

    const getMovieImage = (posterPath: string | null, movieId: string, type: string) => {
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
                                backgroundColor: '#2F9BBC',
                                boxShadow: '0 4px 12px rgba(47, 155, 188, 0.3)',
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
                                backgroundColor: '#2F9BBC',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 100,
                                boxShadow: '0 2px 8px rgba(47, 155, 188, 0.4)',
                            }}
                            onPress={() => router.push('/profile/account')}
                            activeOpacity={0.8}
                        >
                            <SvgXml xml={editProfile} width={14} height={14} />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6 items-center">
                        <Text className="text-secondary font-bold text-3xl tracking-tight">
                            {user?.name || 'Guest'}
                        </Text>
                        <View className="mt-2 px-4 py-1.5 bg-primary/10 rounded-full">
                            <Text className="text-primary text-xs font-semibold tracking-wide uppercase">
                                {user?.isPremium ? 'Premium Member' : 'Standard Member'}
                            </Text>
                        </View>
                        <Text className="text-text-secondary text-sm text-center mt-3 leading-6 max-w-xs">
                            Cinematic explorer & Sci-Fi enthusiast. Curating the future of storytelling since 2023.
                        </Text>
                    </View>
                </View>

                {/* AI Taste Profile Section */}
                <View className="px-5 mt-10">
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <View className="flex-row items-center gap-2.5">
                            <SvgXml xml={aistarsblu} width={18} height={18} />
                            <Text className="text-secondary font-bold text-base">AI Taste Profile</Text>
                        </View>
                        <View className="px-3 py-1 bg-primary/10 rounded-full">
                            <Text className="text-primary text-[10px] font-bold tracking-wide">UPDATED TODAY</Text>
                        </View>
                    </View>

                    <View
                        className="bg-card border border-white/5 rounded-2xl p-5"
                        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
                    >
                        <View className="gap-5">
                            <View>
                                <View className="flex-row justify-between mb-2.5">
                                    <Text className="text-text-primary text-sm font-medium">Dark & Intense</Text>
                                    <Text className="text-primary font-bold text-sm">60%</Text>
                                </View>
                                <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <View className="h-full bg-primary rounded-full w-[60%]" />
                                </View>
                            </View>

                            <View>
                                <View className="flex-row justify-between mb-2.5">
                                    <Text className="text-text-primary text-sm font-medium">Sci-Fi & Futurism</Text>
                                    <Text className="text-primary font-bold text-sm">30%</Text>
                                </View>
                                <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <View className="h-full bg-primary/70 rounded-full w-[30%]" />
                                </View>
                            </View>

                            <View>
                                <View className="flex-row justify-between mb-2.5">
                                    <Text className="text-text-primary text-sm font-medium">Feel Good</Text>
                                    <Text className="text-text-secondary font-bold text-sm">10%</Text>
                                </View>
                                <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <View className="h-full bg-text-secondary/60 rounded-full w-[10%]" />
                                </View>
                            </View>
                        </View>

                        <View className="border-t border-white/5 pt-4 mt-5">
                            <Text className="text-text-secondary text-xs leading-5">
                                {`Your preference for high-contrast cinematography and non-linear narratives has increased by 12% this month.`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Viewing History Section - Synced with Watchlist */}
                <View className="mt-10 px-5">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-secondary font-bold text-base">Viewing History</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/watchlist')}>
                            <Text className="text-primary text-sm font-medium">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="h-[180px] items-center justify-center">
                            <ActivityIndicator size="small" color="#2F9BBC" />
                        </View>
                    ) : watchlistItems.length === 0 ? (
                        <View className="h-[180px] items-center justify-center bg-card border border-white/5 rounded-2xl">
                            <Text className="text-text-muted text-sm">No items in your watchlist yet</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/discover')}
                                className="mt-3 px-4 py-2 bg-primary/10 rounded-lg"
                            >
                                <Text className="text-primary text-sm font-medium">Discover Movies</Text>
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
                                    className="w-[110px]"
                                    onPress={() => {
                                        if (item.type === 'anime') {
                                            router.push(`/anime/${item.movieId}` as any)
                                        } else {
                                            router.push(`/movies/${item.movieId}` as any)
                                        }
                                    }}
                                >
                                    <View
                                        className="w-[110px] h-[165px] rounded-xl overflow-hidden bg-card"
                                        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                                    >
                                        <Image
                                            source={getMovieImage(item.moviePoster, item.movieId, item.type)}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text className="text-text-primary text-xs font-semibold mt-2.5" numberOfLines={1}>
                                        {item.movieTitle}
                                    </Text>
                                    <Text className="text-text-muted text-[10px] mt-0.5">
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
                            <SvgXml xml={preferencesIcon} width={20} height={20} />
                            <Text className="text-secondary text-[15px] font-medium">Preferences</Text>
                        </View>
                        <SvgXml xml={chevronRight} width={8} height={14} />
                    </TouchableOpacity>

                    <View className="mx-5 border-t border-white/5" />

                    <TouchableOpacity
                        className="flex-row items-center justify-between px-5 py-4"
                        activeOpacity={0.7}
                        onPress={() => router.push('/profile/account')}
                    >
                        <View className="flex-row items-center gap-3.5">
                            <SvgXml xml={accountIcon} width={22} height={22} />
                            <Text className="text-secondary text-[15px] font-medium">Account Details</Text>
                        </View>
                        <SvgXml xml={chevronRight} width={8} height={14} />
                    </TouchableOpacity>

                    <View className="mx-5 border-t border-white/5" />

                    <TouchableOpacity
                        className="flex-row items-center justify-between px-5 py-4"
                        activeOpacity={0.7}
                        onPress={() => router.push('/profile/billing')}
                    >
                        <View className="flex-row items-center gap-3.5">
                            <SvgXml xml={billingIcon} width={22} height={18} />
                            <Text className="text-secondary text-[15px] font-medium">Billing & Subscription</Text>
                        </View>
                        <View className="flex-row items-center gap-2.5">
                            <View className="px-2.5 py-1 bg-primary/10 rounded-full">
                                <Text className="text-primary text-[10px] font-bold">
                                    {user?.isPremium ? 'PRO' : 'BASIC'}
                                </Text>
                            </View>
                            <SvgXml xml={chevronRight} width={8} height={14} />
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
        </View>
    )
}

export default Profile
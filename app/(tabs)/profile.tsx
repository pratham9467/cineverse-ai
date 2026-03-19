import { getImageUrl } from '@/lib/tmdb'
import { getWatchlist, WatchlistItem } from '@/lib/watchlist'
import { onWatchlistChanged } from '@/lib/watchlistEvents'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useAuth } from '../../contexts/AuthContext'

const aistarsblu = `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 8L16.75 5.25L14 4L16.75 2.75L18 0L19.25 2.75L22 4L19.25 5.25L18 8ZM18 22L16.75 19.25L14 18L16.75 16.75L18 14L19.25 16.75L22 18L19.25 19.25L18 22ZM8 19L5.5 13.5L0 11L5.5 8.5L8 3L10.5 8.5L16 11L10.5 13.5L8 19ZM8 14.15L9 12L11.15 11L9 10L8 7.85L7 10L4.85 11L7 12L8 14.15Z" fill="#2F9BBC"/>
</svg>`

const chevronRight = `<svg width="8" height="14" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L6 6L1 11" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const preferencesIcon = `<svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z" stroke="#2F9BBC" stroke-width="1.5"/>
<path d="M14.625 9C14.625 9.34 14.595 9.67 14.545 9.99L16.245 11.22C16.395 11.34 16.425 11.56 16.305 11.71L14.655 13.93C14.535 14.08 14.315 14.11 14.165 13.99L12.235 12.56C11.805 12.91 11.325 13.21 10.795 13.44L10.595 15.56C10.575 15.81 10.365 16 10.105 16H7.895C7.635 16 7.425 15.81 7.405 15.56L7.205 13.44C6.675 13.21 6.195 12.91 5.765 12.56L3.835 13.99C3.685 14.11 3.465 14.08 3.345 13.93L1.695 11.71C1.575 11.56 1.605 11.34 1.755 11.22L3.455 9.99C3.405 9.67 3.375 9.34 3.375 9C3.375 8.66 3.405 8.33 3.455 8.01L1.755 6.78C1.605 6.66 1.575 6.44 1.695 6.29L3.345 4.07C3.465 3.92 3.685 3.89 3.835 4.01L5.765 5.44C6.195 5.09 6.675 4.79 7.205 4.56L7.405 2.44C7.425 2.19 7.635 2 7.895 2H10.105C10.365 2 10.575 2.19 10.595 2.44L10.795 4.56C11.325 4.79 11.805 5.09 12.235 5.44L14.165 4.01C14.315 3.89 14.535 3.92 14.655 4.07L16.305 6.29C16.425 6.44 16.395 6.66 16.245 6.78L14.545 8.01C14.595 8.33 14.625 8.66 14.625 9Z" stroke="#2F9BBC" stroke-width="1.5"/>
</svg>`

const accountIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#2F9BBC"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg>`

const billingIcon = `<svg width="22" height="18" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 2H2.5C1.67 2 1 2.67 1 3.5V12.5C1 13.33 1.67 14 2.5 14H17.5C18.33 14 19 13.33 19 12.5V3.5C19 2.67 18.33 2 17.5 2Z" stroke="#2F9BBC" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M1 6H19" stroke="#2F9BBC" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`

const editProfile = `<svg width="12" height="12" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 8H1.7125L6.6 3.1125L5.8875 2.4L1 7.2875V8ZM0 9V6.875L6.6 0.2875C6.7 0.195833 6.81042 0.125 6.93125 0.075C7.05208 0.025 7.17917 0 7.3125 0C7.44583 0 7.575 0.025 7.7 0.075C7.825 0.125 7.93333 0.2 8.025 0.3L8.7125 1C8.8125 1.09167 8.88542 1.2 8.93125 1.325C8.97708 1.45 9 1.575 9 1.7C9 1.83333 8.97708 1.96042 8.93125 2.08125C8.88542 2.20208 8.8125 2.3125 8.7125 2.4125L2.125 9H0ZM8 1.7L7.3 1L8 1.7ZM6.2375 2.7625L5.8875 2.4L6.6 3.1125L6.2375 2.7625Z" fill="white"/>
</svg>`

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
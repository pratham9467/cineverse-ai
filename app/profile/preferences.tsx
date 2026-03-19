import { useAuth } from '@/contexts/AuthContext'
import { chevronLeft, chevronRight } from '@/lib/icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const Preferences = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)
  const [autoplay, setAutoplay] = useState(true)
  const [highQuality, setHighQuality] = useState(true)
  const [subtitles, setSubtitles] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <View className="flex-1 bg-background">
      <View className="pt-12 pb-4 px-5 flex-row items-center gap-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-primary/10 rounded-full"
        >
          <SvgXml xml={chevronLeft} width={10} height={18} />
        </TouchableOpacity>
        <Text className="text-secondary font-bold text-xl">Preferences</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Notifications Section */}
        <View className="mt-6">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Notifications
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Push Notifications</Text>
                <Text className="text-text-muted text-xs mt-1">Get notified about new releases</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={notifications ? '#fff' : '#9CA3AF'}
              />
            </View>
            
            <View className="mx-5 border-t border-white/5" />
            
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Email Updates</Text>
                <Text className="text-text-muted text-xs mt-1">Weekly recommendations & news</Text>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={emailUpdates ? '#fff' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Playback Section */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Playback
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Autoplay Previews</Text>
                <Text className="text-text-muted text-xs mt-1">Auto-play trailers on hover</Text>
              </View>
              <Switch
                value={autoplay}
                onValueChange={setAutoplay}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={autoplay ? '#fff' : '#9CA3AF'}
              />
            </View>
            
            <View className="mx-5 border-t border-white/5" />
            
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">High Quality Streaming</Text>
                <Text className="text-text-muted text-xs mt-1">Use more data for better quality</Text>
              </View>
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={highQuality ? '#fff' : '#9CA3AF'}
              />
            </View>
            
            <View className="mx-5 border-t border-white/5" />
            
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Always Show Subtitles</Text>
                <Text className="text-text-muted text-xs mt-1">Enable subtitles by default</Text>
              </View>
              <Switch
                value={subtitles}
                onValueChange={setSubtitles}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={subtitles ? '#fff' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Appearance
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Dark Mode</Text>
                <Text className="text-text-muted text-xs mt-1">Currently always enabled</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#374151', true: '#2F9BBC' }}
                thumbColor={darkMode ? '#fff' : '#9CA3AF'}
                disabled
              />
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Language & Region
          </Text>
          <View className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <TouchableOpacity className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Audio Language</Text>
                <Text className="text-text-muted text-xs mt-1">English</Text>
              </View>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>
            
            <View className="mx-5 border-t border-white/5" />
            
            <TouchableOpacity className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-1">
                <Text className="text-secondary text-[15px] font-medium">Subtitle Language</Text>
                <Text className="text-text-muted text-xs mt-1">English</Text>
              </View>
              <SvgXml xml={chevronRight} width={8} height={14} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default Preferences
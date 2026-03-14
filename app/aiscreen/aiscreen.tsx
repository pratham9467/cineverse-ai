import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'

const aistarsSvgWhite = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.5 10L20.9375 6.5625L17.5 5L20.9375 3.4375L22.5 0L24.0625 3.4375L27.5 5L24.0625 6.5625L22.5 10ZM22.5 27.5L20.9375 24.0625L17.5 22.5L20.9375 20.9375L22.5 17.5L24.0625 20.9375L27.5 22.5L24.0625 24.0625L22.5 27.5ZM10 23.75L6.875 16.875L0 13.75L6.875 10.625L10 3.75L13.125 10.625L20 13.75L13.125 16.875L10 23.75ZM10 17.6875L11.25 15L13.9375 13.75L11.25 12.5L10 9.8125L8.75 12.5L6.0625 13.75L8.75 15L10 17.6875Z" fill="white"/>
</svg>
`

const eyeIcon = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 2.5C4.5 2.5 2.25 4.5 1 7C2.25 9.5 4.5 11.5 7 11.5C9.5 11.5 11.75 9.5 13 7C11.75 4.5 9.5 2.5 7 2.5ZM7 9.625C5.625 9.625 4.5 8.5 4.5 7.125C4.5 5.75 5.625 4.625 7 4.625C8.375 4.625 9.5 5.75 9.5 7.125C9.5 8.5 8.375 9.625 7 9.625ZM7 5.375C6.125 5.375 5.375 6.125 5.375 7C5.375 7.875 6.125 8.625 7 8.625C7.875 8.625 8.625 7.875 8.625 7C8.625 6.125 7.875 5.375 7 5.375Z" fill="#2F9BBC"/>
</svg>`

const sparkleIcon = `<svg width="12" height="12" viewBox="0 0 14 14" fill="#2F9BBC" xmlns="http://www.w3.org/2000/svg">
<path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#2F9BBC"/>
</svg>`

const sendIcon = `<svg width="19" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 8L1.5 1.75V6.25L10.75 8L1.5 9.75V14.25L18 8Z" fill="white"/>
</svg>`

const bookmarkIcon = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 2H13V14L8 11L3 14V2Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`

const moodMelancholic = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="4" cy="7" r="2" fill="#2F9BBC"/>
<circle cx="10" cy="7" r="2" fill="#2F9BBC"/>
<path d="M4 10.5C4 10.5 5.75 12 7 12C8.25 12 10 10.5 10 10.5" stroke="#2F9BBC" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

const moodAdrenaline = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 1V13M1 7H13M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

const moodMindBending = `<svg width="9" height="12" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 0L10 7L5 14L0 7L5 0Z" fill="#94a3b8"/>
</svg>`

const neonGenesis = require('@/assets/images/neongenesys.png')
const beyondTheVoid = require('@/assets/images/beyondthevoid.png')
const silentPulse = require('@/assets/images/silentpulse.png')
const cinematicEchoes = require('@/assets/images/cinematicechoes.png')
const frameByFrame = require('@/assets/images/framebyframe.png')

const dailyPicks = [
  { title: 'Neon Genesis: Rebirth', tags: 'Atmospheric • Existential • Visual', match: '98%', image: neonGenesis },
  { title: 'Beyond The Void', tags: 'Epic • Cosmic • Mystery', match: '95%', image: beyondTheVoid },
]

const aiReasoning = [
  {
    icon: eyeIcon,
    lines: [
      "Because you watched",
      { text: "Attack on Titan", color: '#2f9bbc', bold: true },
      ", I predict",
      "you'll love the dark",
      "narrative of 'The Last",
      "Bastion'."
    ]
  },
  {
    icon: sparkleIcon,
    lines: [
      "Matching your preference",
      "for ",
      { text: "Cyberpunk Aesthetics", color: '#00f2ff', bold: true },
      "and synth-wave scores."
    ]
  },
]

const hiddenGems = [
  { title: 'The Silent Pulse', image: silentPulse },
  { title: 'Cinematic Echoes', image: cinematicEchoes },
  { title: 'Frame By Frame', image: frameByFrame },
]

const moods = [
  { name: 'Melancholic', icon: moodMelancholic, active: true },
  { name: 'Adrenaline', icon: moodAdrenaline, active: false },
  { name: 'Mind-Bending', icon: moodMindBending, active: false },
]

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`w-72 rounded-card overflow-hidden ${className}`}>
    {children}
  </View>
)

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`bg-primary/10 border border-primary/20 ${className}`}>
    {children}
  </View>
)

const AIScreen = () => {
  const [selectedMood, setSelectedMood] = React.useState('Melancholic')

  const renderReasoningText = (lines: (string | { text: string; color: string; bold: boolean })[]) => {
    return lines.map((line, index) => {
      if (typeof line === 'object') {
        return (
          <Text
            key={index}
            className={`text-caption ${line.bold ? 'font-bold' : ''}`}
            style={{ color: line.color, lineHeight: 19.5 }}
          >
            {line.text}
          </Text>
        )
      }
      return (
        <Text key={index} className="text-caption text-text-primary" style={{ lineHeight: 19.5 }}>
          {line}
        </Text>
      )
    })
  }

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#0f1115', '#1a0b2e', '#0a1a2f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        className="flex-1"
      >
        {/* Header */}
        <View className="pt-[60px] pb-4 px-4 bg-transparent">
          <View className="flex-row items-center justify-center gap-2">
            <SvgXml xml={aistarsSvgWhite} width={20} height={20} />
            <Text
              className="text-text-primary text-subtitle font-bold tracking-tight"
              style={{
                textShadowColor: 'rgba(140, 37, 244, 0.8)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}
            >
              CineVerse Ai
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Daily AI Picks */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mt-6 px-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-text-primary text-heading font-bold">Daily AI Picks</Text>
              <View className="w-4 h-4 items-center justify-center">
                <View className="w-2 h-2 rounded-full bg-success" />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 pr-4">
                {dailyPicks.map((pick, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInRight.delay(200 + index * 100).duration(400)}
                  >
                    <Card>
                      <View className="relative">
                        <Image
                          source={pick.image}
                          className="w-full"
                          style={{ height: 360 }}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(15, 17, 21, 0.9)']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 0, y: 1 }}
                          className="absolute bottom-0 left-0 right-0"
                          style={{ height: 160 }}
                        />
                        {index === 0 && (
                          <View
                            className="absolute -inset-0.5 bg-primary/30 rounded-[14px]"
                            style={{
                              shadowColor: '#2f9bbc',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.5,
                              shadowRadius: 10,
                            }}
                          />
                        )}
                        <Pressable className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface/80 items-center justify-center border border-primary-bright/30">
                          <SvgXml xml={bookmarkIcon} width={14} height={14} />
                        </Pressable>
                        <View className="absolute top-2 left-2 px-2.5 py-1.5 rounded-full bg-surface/80 border border-primary-bright/30">
                          <Text className="text-primary-bright text-caption font-bold">
                            {pick.match} Match
                          </Text>
                        </View>
                        <View className="absolute bottom-0 left-0 right-0 p-2">
                          <Text className="text-text-primary text-subtitle font-bold">{pick.title}</Text>
                          <Text className="text-text-secondary text-caption mt-1">{pick.tags}</Text>
                        </View>
                      </View>
                    </Card>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* AI Reasoning */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mt-6 px-4">
            <Text className="text-text-secondary text-caption font-semibold uppercase tracking-widest mb-3">AI Reasoning</Text>

            <View className="flex-row gap-3">
              {aiReasoning.map((reason, index) => (
                <GlassCard key={index} className="flex-1 p-3.5 rounded-card">
                  <View className="mb-2">
                    <SvgXml xml={reason.icon} width={12} height={12} />
                  </View>
                  <View className="flex-row flex-wrap">
                    {renderReasoningText(reason.lines)}
                  </View>
                </GlassCard>
              ))}
            </View>
          </Animated.View>

          {/* Hidden Gems */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mt-6 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text-primary text-title font-bold">Hidden Gems</Text>
              <Pressable>
                <Text className="text-primary text-label font-medium">View All</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {hiddenGems.map((gem, index) => (
                  <Pressable key={index} className="w-40 h-[90px] rounded-lg overflow-hidden">
                    <Image
                      source={gem.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 17, 21, 0.95)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      className="absolute bottom-0 left-0 right-0"
                      style={{ height: 50 }}
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-2">
                      <Text className="text-text-primary text-label font-medium" numberOfLines={1}>{gem.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </ScrollView>

        {/* Chat Bar */}
        <View className="absolute bottom-16 z-50 left-4 right-4 items-center">
          <View
            className="h-[50px] rounded-full bg-black/10 border border-primary flex-row items-center px-3 backdrop-blur-md"
            style={{
              width: 358,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <TextInput
              className="flex-1 text-white"
              placeholder="Ask AI for a recommendation..."
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity className="w-10 h-10 rounded-full bg-primary items-center justify-center ml-2">
              <SvgXml xml={sendIcon} width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Surprise Me Button */}
        <TouchableOpacity
          className="absolute bottom-[115px] right-2 flex-row items-center gap-2 py-3 px-5 rounded-full bg-black/50 border border-primary"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 8,
          }}
        >
          <View className="w-[16px] h-[16px] items-center justify-center">
            <SvgXml xml={sparkleIcon} width={16} height={16} />
          </View>
          <Text className="text-white text-sm font-bold">Surprise Me</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

export default AIScreen

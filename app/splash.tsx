import { playIconSplash as playIcon } from '@/lib/icons'
import React, { useEffect, useRef } from 'react'
import { Animated, Image, Text, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import * as SplashScreen from 'expo-splash-screen'
import { LinearGradient } from 'expo-linear-gradient'

// Keep the splash screen visible
SplashScreen.preventAutoHideAsync()

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Fade in logo
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start()

      // Scale logo
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start()

      // Start pulsing glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start()

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start()

      // Hide splash after 2 seconds
      setTimeout(() => {
        SplashScreen.hideAsync()
      }, 2000)
    }

    startAnimations()
  }, [])

  return (
    <View className="flex-1 bg-black items-center justify-center relative overflow-hidden">
      {/* Starfield background effect */}
      <View className="absolute inset-0">
        <View className="absolute top-20 left-10 w-1 h-1 bg-cyan-500 rounded-full opacity-60" />
        <View className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary-bright rounded-full opacity-40" />
        <View className="absolute bottom-60 left-32 w-1 h-1 bg-cyan-500 rounded-full opacity-50" />
        <View className="absolute top-60 left-1/2 w-0.5 h-0.5 bg-primary rounded-full opacity-70" />
        <View className="absolute bottom-32 right-16 w-2 h-2 bg-cyan-500 rounded-full opacity-30" />
        <View className="absolute top-1/3 right-40 w-1 h-1 bg-primary-bright rounded-full opacity-60" />
        <View className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-40" />
        <View className="absolute top-1/2 left-20 w-1 h-1 bg-primary rounded-full opacity-50" />
      </View>

      {/* Radial gradient overlay */}
      <LinearGradient
        colors={['rgba(47, 155, 188, 0.05)', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        pointerEvents="none"
      />

      {/* Logo container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Pulsing glow ring */}
        <Animated.View
          className="absolute w-48 h-48 rounded-full"
          style={{
            borderWidth: 1,
            borderColor: '#2F9BBC',
            opacity: glowAnim,
            transform: [{ scale: glowAnim }],
            shadowColor: '#00f2ff',
            shadowOpacity: 0.8,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          }}
        />

        {/* Main play icon */}
        <SvgXml xml={playIcon} width={240} height={240} />

        {/* Brand text */}
        <View className="mt-8 items-center">
          <Text className="text-white font-bold text-5xl tracking-wider">
            CINEVERSE
          </Text>
          <Text className="text-primary font-bold text-4xl tracking-wide mt-1">
            AI
          </Text>
          <Text className="text-text-muted text-sm mt-3 tracking-wide">
            Experience cinematic storytelling
          </Text>
        </View>
      </Animated.View>

      {/* Loading section at bottom */}
      <View className="absolute bottom-32 left-8 right-8 items-center">
        {/* Progress bar */}
        <View className="w-full h-0.5 bg-surface rounded-full overflow-hidden mb-3">
          <Animated.View
            className="h-full bg-primary rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              shadowColor: '#00f2ff',
              shadowOpacity: 0.8,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        </View>

        {/* Loading text */}
        <Text className="text-text-placeholder text-xs tracking-wider">
          Loading your universe...
        </Text>
      </View>
    </View>
  )
}

export default Splash
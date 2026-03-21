import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native'
import { SvgXml } from 'react-native-svg'

// Brand colors
const COLORS = {
  primary: '#2F9BBC',
  secondary: '#8C25F4',
  cyan: '#00f2ff',
  background: '#000000',
  onSurface: '#ffffff',
  onSurfaceVariant: '#bdc8ce',
}

// AI sparkle star SVG (4-point star)
const aiStarSvg = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="#00f2ff"/>
</svg>`

// Small sparkle for secondary orbit
const smallStarSvg = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="#2F9BBC"/>
</svg>`

// Tiny dot sparkle
const tinyStarSvg = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3L4 0Z" fill="#8C25F4"/>
</svg>`

const LOGO_SIZE = 160
const RING_RADIUS = 110 // orbit radius for the star

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const rotateAnim2 = useRef(new Animated.Value(0)).current
  const rotateAnim3 = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current
  const logoScale = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    // Fade in + scale logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Rotating star - continuous loop (clockwise)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    // Second star - slower, counter-clockwise
    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: -1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    // Third star - medium speed
    Animated.loop(
      Animated.timing(rotateAnim3, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    // Pulse animation for stars
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Glow ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [])

  // Rotation interpolation for the orbiting star
  const starRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const starRotation2 = rotateAnim2.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-360deg', '0deg'],
  })

  const starRotation3 = rotateAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo + Orbiting Ring Area */}
        <View style={styles.orbitContainer}>
          {/* Glow ring (subtle) */}
          <Animated.View
            style={[
              styles.glowRing,
              { opacity: glowAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing2,
              { opacity: glowAnim },
            ]}
          />

          {/* Orbiting Star 1 - Main cyan star */}
          <Animated.View
            style={[
              styles.orbitWrapper,
              { transform: [{ rotate: starRotation }] },
            ]}
          >
            <Animated.View
              style={[
                styles.starPosition,
                {
                  top: 0,
                  left: '50%',
                  marginLeft: -10,
                  marginTop: -RING_RADIUS / 2 + 10,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <SvgXml xml={aiStarSvg} width={20} height={20} />
            </Animated.View>
          </Animated.View>

          {/* Orbiting Star 2 - Teal star, counter-clockwise */}
          <Animated.View
            style={[
              styles.orbitWrapper,
              { transform: [{ rotate: starRotation2 }] },
            ]}
          >
            <Animated.View
              style={[
                styles.starPosition,
                {
                  bottom: 5,
                  left: '50%',
                  marginLeft: -6,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <SvgXml xml={smallStarSvg} width={12} height={12} />
            </Animated.View>
          </Animated.View>

          {/* Orbiting Star 3 - Purple star */}
          <Animated.View
            style={[
              styles.orbitWrapper,
              { transform: [{ rotate: starRotation3 }] },
            ]}
          >
            <Animated.View
              style={[
                styles.starPosition,
                {
                  top: '50%',
                  right: 0,
                  marginTop: -4,
                  marginRight: -4,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <SvgXml xml={tinyStarSvg} width={8} height={8} />
            </Animated.View>
          </Animated.View>

          {/* Center Logo Image */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require('@/assets/images/cineverse_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>CINEVERSE</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.subtitle}>AI</Text>
        </View>

        {/* Loading bar */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[styles.loadingProgress, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.loadingText}>
            Synthesizing Cinema Environment...
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  orbitContainer: {
    width: RING_RADIUS * 2 + 40,
    height: RING_RADIUS * 2 + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
    width: RING_RADIUS * 2 + 10,
    height: RING_RADIUS * 2 + 10,
    borderRadius: RING_RADIUS + 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  glowRing2: {
    position: 'absolute',
    width: RING_RADIUS * 2 + 40,
    height: RING_RADIUS * 2 + 40,
    borderRadius: RING_RADIUS + 20,
    borderWidth: 0.5,
    borderColor: COLORS.cyan,
  },
  orbitWrapper: {
    position: 'absolute',
    width: RING_RADIUS * 2 + 40,
    height: RING_RADIUS * 2 + 40,
  },
  starPosition: {
    position: 'absolute',
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 10,
    marginBottom: 12,
    marginTop: 10,
  },
  badgeContainer: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
    marginBottom: 60,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 12,
  },
  loadingContainer: {
    width: 200,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  loadingText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 16,
    letterSpacing: 1.5,
  },
})

export default Splash
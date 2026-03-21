import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import './global.css';
import Splash from './splash';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SocialProvider } from '../contexts/SocialContext';
import { ReviewsProvider } from '../contexts/ReviewsContext';
import { CollectionsProvider } from '../contexts/CollectionsContext';
import { ThemeModeProvider } from '../contexts/ThemeModeContext';

const CineverseTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    border: '#2d333b',
    primary: '#2F9BBC',
    notification: '#2F9BBC',
    text: '#f1f5f9',
  },
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[App] Starting splash timer - 4.5 seconds')
    
    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      console.log('[App] Splash timer complete, hiding splash')
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showSplash && !isLoading) {
      console.log('[App] Navigating - isLoggedIn:', isLoggedIn)
      // Navigate based on auth state
      if (isLoggedIn) {
        router.replace('/(tabs)')
      } else {
        router.replace('/authscreen/login')
      }
    }
  }, [showSplash, isLoading, isLoggedIn, router])

  // Show splash screen for 4.5 seconds
  if (showSplash) {
    console.log('[App] Showing splash screen')
    return <Splash />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        navigationBarColor: '#000000',
        animation: 'fade',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movies/[id]" />
      <Stack.Screen name="anime/[id]" />
      <Stack.Screen name="reviews/[movieId]" />
      <Stack.Screen name="aiscreen/aiscreen" />
      <Stack.Screen name="profile/preferences" />
      <Stack.Screen name="profile/account" />
      <Stack.Screen name="profile/billing" />
      <Stack.Screen name="authscreen/login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="authscreen/signup" />
      <Stack.Screen name="auth/google/callback" options={{ gestureEnabled: false }} />
      <Stack.Screen name="logo-demo" />
      <Stack.Screen name="adobe-logo-showcase" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={CineverseTheme}>
      <ThemeModeProvider>
        <AuthProvider>
          <SocialProvider>
            <ReviewsProvider>
              <CollectionsProvider>
                <AppContent />
              </CollectionsProvider>
            </ReviewsProvider>
          </SocialProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </ThemeProvider>
  );
}

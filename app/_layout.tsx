import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import './global.css';
import Splash from './splash';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

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
  const [appReady, setAppReady] = useState(false);
  const { isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (appReady && !isLoading) {
      // Redirect to login if not logged in
      if (!isLoggedIn) {
        router.replace('/authscreen/login');
      }
    }
  }, [appReady, isLoading, isLoggedIn, router]);

  if (!appReady) {
    return <Splash />;
  }

  if (isLoading) {
    return <Splash />;
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
      <Stack.Screen name="aiscreen/aiscreen" />
      <Stack.Screen name="profile/preferences" />
      <Stack.Screen name="profile/account" />
      <Stack.Screen name="profile/billing" />
      <Stack.Screen name="authscreen/login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="authscreen/signup" />
      <Stack.Screen name="auth/google/callback" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={CineverseTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

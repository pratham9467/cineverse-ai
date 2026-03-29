import React, { createContext, useContext, useState, useCallback } from 'react'

type ThemeMode = 'movies' | 'anime'

interface ThemeColors {
  primary: string
  primaryBg: string
  primaryBorder: string
  primaryShadow: string
  primaryRgba: string
  label: string
}

const MOVIE_COLORS: ThemeColors = {
  primary: '#2F9BBC',
  primaryBg: 'rgba(46, 153, 189, 0.8)',
  primaryBorder: 'rgba(47, 155, 188, 0.4)',
  primaryShadow: '#2E99BD',
  primaryRgba: 'rgba(47, 155, 188, 0.2)',
  label: 'CineVerse',
}

const ANIME_COLORS: ThemeColors = {
  primary: '#a855f7',
  primaryBg: 'rgba(168, 85, 247, 0.8)',
  primaryBorder: 'rgba(168, 85, 247, 0.4)',
  primaryShadow: '#a855f7',
  primaryRgba: 'rgba(168, 85, 247, 0.2)',
  label: 'AnimeVerse',
}

interface ThemeModeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  colors: ThemeColors
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'movies',
  setMode: () => {},
  colors: MOVIE_COLORS,
})

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('movies')

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
  }, [])

  const colors = mode === 'movies' ? MOVIE_COLORS : ANIME_COLORS

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, colors }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeModeContext)

export { MOVIE_COLORS, ANIME_COLORS }
export type { ThemeMode, ThemeColors }

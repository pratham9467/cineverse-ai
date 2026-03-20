import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as appwriteLogin, register as appwriteRegister, logout as appwriteLogout, getCurrentUser, googleLogin, User as AppwriteUser, initAppwrite } from '../lib/auth'
import { Alert } from 'react-native'

interface User {
  $id: string
  email: string
  name: string
  isPremium: boolean
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  isBackendAvailable: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

function mapAppwriteUserToUser(appwriteUser: AppwriteUser | null): User | null {
  if (!appwriteUser) return null
  return {
    $id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    isPremium: false,
    avatarUrl: appwriteUser.avatarUrl,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBackendAvailable, setIsBackendAvailable] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if Appwrite backend is available
        const backendStatus = await initAppwrite()
        setIsBackendAvailable(backendStatus)
        
        if (!backendStatus) {
          console.warn('⚠️ Appwrite backend is not available. App running in offline mode.')
          console.warn('Please restore your Appwrite project at: https://cloud.appwrite.io/console')
          setIsLoading(false)
          return
        }

        const appwriteUser = await getCurrentUser()
        if (appwriteUser) {
          setUser(mapAppwriteUserToUser(appwriteUser))
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
        setIsBackendAvailable(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    if (!isBackendAvailable) {
      throw new Error('Backend is unavailable. Please check your connection or restore the Appwrite project.')
    }
    
    try {
      setIsLoading(true)
      const appwriteUser = await appwriteLogin(email, password)
      setUser(mapAppwriteUserToUser(appwriteUser))
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error?.message || 'Login failed. Please check your credentials.'
      
      // Check if it's a backend connectivity issue
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        throw new Error('Cannot connect to backend. Please restore your Appwrite project.')
      }
      
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    if (!isBackendAvailable) {
      throw new Error('Backend is unavailable. Please check your connection or restore the Appwrite project.')
    }
    
    try {
      setIsLoading(true)
      await googleLogin()
    } catch (error) {
      console.error('Google login error:', error)
      throw new Error('Google login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithApple = async () => {
    throw new Error('Apple Sign In not configured. Please use email/password or Google.')
  }

  const signup = async (email: string, password: string, name: string) => {
    if (!isBackendAvailable) {
      throw new Error('Backend is unavailable. Please check your connection or restore the Appwrite project.')
    }
    
    try {
      setIsLoading(true)
      await appwriteRegister(email, password, name)
      await appwriteLogin(email, password)
      const appwriteUser = await getCurrentUser()
      setUser(mapAppwriteUserToUser(appwriteUser))
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (!isBackendAvailable) {
      // Allow logout even when backend is unavailable
      setUser(null)
      return
    }
    
    try {
      setIsLoading(true)
      await appwriteLogout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local user state even if backend logout fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    isBackendAvailable,
    login,
    loginWithGoogle,
    loginWithApple,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

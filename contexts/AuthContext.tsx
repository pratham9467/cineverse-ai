import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as appwriteLogin, register as appwriteRegister, logout as appwriteLogout, getCurrentUser, googleLogin, User as AppwriteUser } from '../lib/auth'

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const appwriteUser = await getCurrentUser()
        if (appwriteUser) {
          setUser(mapAppwriteUserToUser(appwriteUser))
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const appwriteUser = await appwriteLogin(email, password)
      setUser(mapAppwriteUserToUser(appwriteUser))
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
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
    try {
      setIsLoading(true)
      await appwriteLogout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error('Logout failed')
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
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

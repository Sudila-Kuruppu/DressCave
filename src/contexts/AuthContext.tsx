'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// Type definitions for auth parameters
interface SignUpParams {
  email: string
  password: string
  options?: {
    emailRedirectTo?: string
    data?: Record<string, unknown>
  }
}

interface SignInParams {
  email: string
  password: string
}

interface SignOutParams {
  scope?: 'global' | 'local'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (params: SignUpParams) => Promise<{ error: Error | null }>
  signIn: (params: SignInParams) => Promise<{ error: Error | null }>
  signOut: (params?: SignOutParams) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email/password
  const signUp = async (params: SignUpParams) => {
    const { error } = await supabase.auth.signUp(params)
    return { error }
  }

  // Sign in with email/password
  const signIn = async (params: SignInParams) => {
    const { error } = await supabase.auth.signInWithPassword(params)
    return { error }
  }

  // Sign out
  const signOut = async (params?: SignOutParams) => {
    const { error } = await supabase.auth.signOut(params)
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  // Refresh session
  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setUser(session?.user ?? null)
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

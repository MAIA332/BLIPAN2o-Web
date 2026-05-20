'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuário mockado para testes
const MOCK_USER: User = {
  id: '1',
  email: 'admin@aspinbots.com',
  name: 'Admin ASPINBOTS',
  role: 'admin',
}

const MOCK_PASSWORD = '123456'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      setUser(MOCK_USER)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

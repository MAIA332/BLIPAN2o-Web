'use client'

import { Loader2 } from 'lucide-react'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: string
  branchs: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Começa carregando

  useEffect(() => {
    console.log("AuthProvider: Iniciando checagem de auth...");
    try {
      const saved = localStorage.getItem('aspin_user')
      if (saved) {
        setUser(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Erro ao ler localStorage:", e)
      localStorage.removeItem('aspin_user') // Limpa se estiver corrompido
    } finally {
      setIsLoading(false) // Garante que o loading vai sumir de qualquer jeito
    }
  }, [])

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setUser(result.data); // Atualiza o estado com o objeto completo que vem do backend
        localStorage.setItem('aspin_user', JSON.stringify(result.data));
      }
    } catch (e) {
      console.error("Erro ao buscar perfil completo:", e);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazena usuário e token
        const userPayload = {
          id: data.email, // ou use um ID se vier no retorno
          email: data.email,
          name: data.name,
          role: data.role,
          branchs:null
        };

        setUser(userPayload);

        // Guardamos o token no localStorage para ser usado em futuras requests (interceptors)
        localStorage.setItem('aspin_user', JSON.stringify(userPayload));
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        await fetchUserProfile(data.access_token);

        return true;
      }

      console.error("Login failed:", data.message);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    // 1. Limpa o estado da aplicação
    setUser(null);

    // 2. Remove todos os dados sensíveis do localStorage
    localStorage.removeItem('aspin_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // 3. Opcional: Recarregar a página para limpar qualquer cache de memória
    // window.location.href = '/'; 
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout: () => { setUser(null); localStorage.removeItem('aspin_user'); }
    }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : children}
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

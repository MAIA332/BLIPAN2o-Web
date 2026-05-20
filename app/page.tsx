'use client'

import { useAuth } from '@/lib/auth'
import { LoginForm } from '@/components/login/login-form'
import { Dashboard } from '@/components/dashboard/dashboard'

export default function Home() {
  const { isAuthenticated } = useAuth()

  // O AuthProvider já injetou o estado, o useAuth pegará o valor atualizado
  return isAuthenticated ? <Dashboard /> : <LoginForm />
}
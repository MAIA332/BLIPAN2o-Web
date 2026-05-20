'use client'

import { AuthProvider, useAuth } from '@/lib/auth'
import { LoginForm } from '@/components/login/login-form'
import { Dashboard } from '@/components/dashboard/dashboard'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

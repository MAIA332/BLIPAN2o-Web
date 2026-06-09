'use client'

import { AuthProvider } from '@/lib/auth'
import { WebSocketProvider } from '@/app/contexts/WebSocketContext'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
      {/* O Toaster fica aqui para renderizar os alertas visualmente sobre toda a aplicação */}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}
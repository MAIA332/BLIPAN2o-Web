'use client'

import { Bell, Search, Calendar, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TenantSelector } from './tenant-selector'
import { useAuth } from '@/lib/auth'
import type { Tenant } from '@/lib/mock-data'

interface HeaderProps {
  tenants: Tenant[]
  currentTenant: Tenant
  onTenantChange: (tenant: Tenant) => void
  pageTitle: string
}

export function Header({
  tenants,
  currentTenant,
  onTenantChange,
  pageTitle,
}: HeaderProps) {
  const { user, logout } = useAuth()

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US'

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left */}
      <div className="flex items-center gap-4">
        <TenantSelector
          tenants={tenants}
          currentTenant={currentTenant}
          onTenantChange={onTenantChange}
        />
        <span className="text-muted-foreground">/</span>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Center */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar gráficos, relatórios..."
            className="pl-9 bg-input border-border"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-secondary border-border"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Últimos 30 dias</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Últimos 7 dias</DropdownMenuItem>
            <DropdownMenuItem>Últimos 30 dias</DropdownMenuItem>
            <DropdownMenuItem>Últimos 90 dias</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Período personalizado</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden md:block">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Ajuda</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

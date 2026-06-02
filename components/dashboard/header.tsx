'use client'

import { useState } from 'react'
import {
  Search,
  Calendar,
  ChevronDown,
  LogOut,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { TenantSelector } from './tenant-selector'
import { useAuth } from '@/lib/auth'
import type { Tenant } from '@/lib/mock-data'

export type DateFilterType =
  | '7d'
  | '30d'
  | '90d'
  | 'custom'

interface HeaderProps {
  tenants: Tenant[]
  currentTenant: Tenant
  onTenantChange: (tenant: Tenant) => void
  pageTitle: string
  dateFilter: DateFilterType
  onDateFilterChange: (value: DateFilterType) => void
  
  // Novas props para o período personalizado
  customDateRange?: { start: string; end: string }
  onCustomDateApply?: (start: string, end: string) => void
}

export function Header({
  tenants,
  currentTenant,
  onTenantChange,
  pageTitle,
  dateFilter,
  onDateFilterChange,
  customDateRange,
  onCustomDateApply,
}: HeaderProps) {
  const { user, logout } = useAuth()

  // Estados para controlar o modal de data customizada
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempStart, setTempStart] = useState(customDateRange?.start || '')
  const [tempEnd, setTempEnd] = useState(customDateRange?.end || '')

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US'

  const labelMap: Record<string, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    'custom': 'Período personalizado'
  }

  // Função segura para formatar YYYY-MM-DD em DD/MM/YYYY evitando fuso horário
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  // Define qual texto aparece no botão do filtro
  const getDisplayLabel = () => {
    if (dateFilter === 'custom' && customDateRange?.start && customDateRange?.end) {
      return `${formatDateBR(customDateRange.start)} - ${formatDateBR(customDateRange.end)}`
    }
    return labelMap[dateFilter] || 'Filtrar período'
  }

  const handleApplyCustomDates = () => {
    if (tempStart && tempEnd && onCustomDateApply) {
      onCustomDateApply(tempStart, tempEnd)
      onDateFilterChange('custom')
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <TenantSelector
            tenants={tenants}
            currentTenant={currentTenant}
            onTenantChange={onTenantChange}
          />

          <span className="text-muted-foreground">/</span>

          <h1 className="text-lg font-semibold text-foreground">
            {pageTitle}
          </h1>
        </div>

        {/* CENTER */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar gráficos, relatórios..."
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* DATE FILTER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-secondary border-border min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {getDisplayLabel()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onDateFilterChange('7d')}>
                Últimos 7 dias
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onDateFilterChange('30d')}>
                Últimos 30 dias
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onDateFilterChange('90d')}>
                Últimos 90 dias
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={() => {
                  setTempStart(customDateRange?.start || '')
                  setTempEnd(customDateRange?.end || '')
                  setIsModalOpen(true)
                }}
              >
                Período personalizado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* USER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              >
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
              <DropdownMenuLabel>
                {user?.email}
              </DropdownMenuLabel>
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

      {/* MODAL PERÍODO PERSONALIZADO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Período Personalizado</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApplyCustomDates} 
              disabled={!tempStart || !tempEnd || tempStart > tempEnd}
            >
              Aplicar Filtro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
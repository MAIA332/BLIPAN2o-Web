'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Home,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Users,
  Database,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/lib/auth'

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: 'overview', icon: Home, label: 'Visão Geral' },
  /* { id: 'bar-charts', icon: BarChart3, label: 'Gráficos de Barras' },
  { id: 'pie-charts', icon: PieChart, label: 'Gráficos de Pizza' },
  { id: 'line-charts', icon: LineChart, label: 'Gráficos de Linha' }, */
]

const dataItems = [
  /* { id: 'data-sources', icon: Database, label: 'Fontes de Dados' }, */
  { id: 'reports', icon: FileText, label: 'Relatórios' },
  { id: 'users', icon: Users, label: 'Usuários' },
]

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()

  const handleSettingsClick = () => {
    onSectionChange('settings')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b4CKWbLSnl1aYXxOlThAXHDBpbPVh.png"
            alt="ASPINBOTS Logo"
            width={collapsed ? 32 : 160}
            height={32}
            className="object-contain"
          />
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Main Menu */}
        <div className="flex-1 p-2 space-y-1">
          <div className="px-2 py-1.5">
            {!collapsed && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Visualizações
              </span>
            )}
          </div>
          {menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full justify-start gap-3 h-10',
                    collapsed && 'justify-center px-2',
                    currentSection === item.id
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}

          <div className="px-2 py-1.5 pt-4">
            {!collapsed && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dados
              </span>
            )}
          </div>
          {dataItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full justify-start gap-3 h-10',
                    collapsed && 'justify-center px-2',
                    currentSection === item.id
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleSettingsClick}
                className={cn(
                  'w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent',
                  collapsed && 'justify-center px-2',
                  currentSection === 'settings' && 'bg-sidebar-accent text-sidebar-primary'
                )}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Configurações</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Configurações</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={logout}
                className={cn(
                  'w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive',
                  collapsed && 'justify-center px-2'
                )}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Sair</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Separator className="bg-sidebar-border my-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

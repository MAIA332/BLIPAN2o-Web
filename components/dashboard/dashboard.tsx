'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { FilterPanel } from '@/components/dashboard/filter-panel'
import { ChartCard } from '@/components/dashboard/chart-card'
import { PerformancePage } from '@/components/dashboard/performance/performance-page'
import { useAuth } from '@/lib/auth' // Importante: usar o auth real
import { filterOptions, chartPages } from '@/lib/mock-data'
import { PageNavigation } from './page-navigation'

export function Dashboard() {
  const { user } = useAuth()

  // 1. Inicializa como null, garantindo que nada seja carregado
  const [currentBranch, setCurrentBranch] = useState<any | null>(null)

  const [currentPageId, setCurrentPageId] = useState(chartPages[0].id)
  const [currentSection, setCurrentSection] = useState('overview')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

  const currentPage = chartPages.find((p) => p.id === currentPageId)

  // Lista de branches vindas do usuário logado
  const availableBranches = user?.branchs || []

  const handleFilterChange = (field: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [field]: values }))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />

      <div className="flex-1 flex flex-col min-h-0">
        <Header
          tenants={availableBranches} // Passando as empresas reais do user
          currentTenant={currentBranch}
          onTenantChange={setCurrentBranch}
          pageTitle={currentPage?.name || 'Dashboard'}
        />

        <div className="flex-1 flex min-h-0">
          {/* 2. Condicional: Se não tiver branch, mostra uma tela de seleção */}
          {!currentBranch ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h2 className="text-xl font-medium">Selecione uma empresa</h2>
                <p>Escolha uma empresa no menu superior para visualizar os dados.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conteúdo do Dashboard (Charts) */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6">
                  {currentPageId === 'page-3' ? (
                    <PerformancePage activeFilters={activeFilters} />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {currentPage?.charts.map((chart) => (
                        <ChartCard key={chart.id} chart={chart} activeFilters={activeFilters} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 border-t border-border bg-card">
                  <PageNavigation
                    pages={chartPages}
                    currentPageId={currentPageId}
                    onPageChange={setCurrentPageId}
                  />
                </div>
              </div>



              <FilterPanel
                filters={filterOptions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
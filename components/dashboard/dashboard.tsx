'use client'

import { useState, useEffect, useMemo } from 'react'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { FilterPanel } from '@/components/dashboard/filter-panel'
import { ChartCard } from '@/components/dashboard/chart-card'
import { PerformancePage } from '@/components/dashboard/performance/performance-page'
import { ActiveMessagesPage } from '@/components/dashboard/active-messages-page'
import { AttendanceDashboardPage } from './attendence/AttendanceDashboardPage'
import { PageNavigation } from './page-navigation'
import { SettingsPage } from '../SettingsPage'
import { OverviewPage } from './OverviewPage'

import { useAuth } from '@/lib/auth'
import { chartPages } from '@/lib/mock-data'
import { fetchDashboardData } from '@/lib/dashboard-service'
import type { DateFilterType } from '@/components/dashboard/header'
import { AlertCircle, BarChart3, Loader2 } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()

  const [currentBranch, setCurrentBranch] = useState<any | null>(null)
  const [rawData, setRawData] = useState<any>(null)

  // Estados de Filtro de Data
  const [dateFilter, setDateFilter] = useState<DateFilterType>('30d')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })

  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentPageId, setCurrentPageId] = useState(chartPages[0].id)
  
  // Estado que controla o menu lateral
  const [currentSection, setCurrentSection] = useState('overview') 
  
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null)

  const currentPage = chartPages.find((p) => p.id === currentPageId)
  const availableBranches = user?.branchs || []

  /*
   |-------------------------------------------------------------------------- 
   | FETCH DATA
   |-------------------------------------------------------------------------- 
   */

  const getDateRange = (filter: DateFilterType) => {
    if (filter === 'custom' && customDateRange.start && customDateRange.end) {
      return {
        startDate: customDateRange.start,
        endDate: customDateRange.end,
      }
    }

    const end = new Date()
    const start = new Date()

    switch (filter) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      default:
        start.setDate(end.getDate() - 30)
        break
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }

  useEffect(() => {
    if (!currentBranch) return

    const loadData = async () => {
      setIsLoadingData(true)

      try {
        const token = localStorage.getItem('access_token') || ''
        const { startDate, endDate } = getDateRange(dateFilter)

        const result = await fetchDashboardData({
          branchId: currentBranch.id,
          token,
          startDate,
          endDate,
        })

        console.log('DADOS API:', result)
        setRawData(result)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [currentBranch, dateFilter, customDateRange.start, customDateRange.end])

  /*
   |-------------------------------------------------------------------------- 
   | NORMALIZAÇÃO DOS DATASETS E MÉTRICAS
   |-------------------------------------------------------------------------- 
   */

  // 🔹 Propriedades para a Visão Geral (OverviewPage)
  const contactsSummaryProps = useMemo(() => {
    // Altere para puxar do seu rawData conforme a estrutura da sua API
    return {
      totalContacts: rawData?.contacts?.total || 1450,
      totalContactsChange: rawData?.contacts?.change || 12.5,
      interactionRate: rawData?.contacts?.interactionRate || 85.2,
      rejectionRate: rawData?.contacts?.rejectionRate || 14.8
    }
  }, [rawData])

  const datasets = useMemo(() => {
    if (!rawData) {
      return {
        trackingRecords: [],
      }
    }

    const trackingRecords: any[] = []

    Object.entries(rawData.trackings?.data || {}).forEach(([category, items]: [string, any]) => {
      items.forEach((item: any) => {
        let action = item.action || 'Unknown'
        let isValidAction = true

        if (typeof action === 'string' && action.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(action)
            if (parsed.uri || parsed.type?.includes('/') || parsed.metadata) {
              isValidAction = false
            } else {
              action = parsed.resource?.team || parsed.name || parsed.type || 'Default'
            }
          } catch {
            isValidAction = false
          }
        }

        if (typeof action === 'string') {
          const isUUID = /^[0-9a-fA-F-]{30,}$/.test(action)
          if (isUUID) {
            action = 'Default'
          }
        }

        if (isValidAction && typeof action === 'string' && action !== 'Unknown') {
          if (action.length > 50 && (action.includes('http') || action.includes('://'))) {
            isValidAction = false
          }

          if (isValidAction) {
            trackingRecords.push({
              category,
              action,
              count: Number(item.count || 0),
            })
          }
        }
      })
    })

    return {
      trackingRecords,
    }
  }, [rawData])

  /*
   |-------------------------------------------------------------------------- 
   | DATASET POR CHART E FILTROS
   |-------------------------------------------------------------------------- 
   */

  const getChartDataset = (chartId: string) => {
    switch (chartId) {
      case 'chart-1':
        return datasets.trackingRecords
      default:
        return []
    }
  }

  const selectedChart = currentPage?.charts?.find((c) => c.id === selectedChartId) || null

  const selectedChartDataset = useMemo(() => {
    if (!selectedChart) return []
    return getChartDataset(selectedChart.id)
  }, [selectedChart, datasets])

  const activeChartFilters = useMemo(() => {
    if (!selectedChart) return []

    const fields = [selectedChart.xField, 'category']
      .filter(Boolean)
      .filter((field) => field !== 'action')
      .filter((value, index, self) => self.indexOf(value) === index)

    return fields
      .map((field) => {
        const options = Array.from(
          new Set(
            selectedChartDataset
              .map((record: any) => String(record[field]))
              .filter((v) => v && v !== 'undefined')
          )
        )

        return {
          field,
          label: field === 'category' ? 'Categoria' : field,
          options,
        }
      })
      .filter((filter) => filter.options.length > 0)
  }, [selectedChart, selectedChartDataset])

  const handleFilterChange = (field: string, values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: values,
    }))
  }

  useEffect(() => {
    setActiveFilters({})
  }, [selectedChartId])

  /*
   |-------------------------------------------------------------------------- 
   | RENDERIZAÇÃO PRINCIPAL
   |-------------------------------------------------------------------------- 
   */

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Header
          tenants={availableBranches}
          currentTenant={currentBranch}
          onTenantChange={setCurrentBranch}
          pageTitle={
            currentSection === 'settings' ? 'Configurações' : 
            currentSection === 'reports' ? 'Relatórios' :
            currentSection === 'users' ? 'Usuários' :
            currentPage?.name || 'Dashboard'
          }
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customDateRange={customDateRange}
          onCustomDateApply={(start, end) => setCustomDateRange({ start, end })}
        />

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 🔹 ROTAS BASEADAS NA SIDEBAR (currentSection) */}
          {currentSection === 'settings' ? (
            <SettingsPage />
          ) : currentSection === 'reports' ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <h2 className="text-xl">Módulo de Relatórios (Em Breve)</h2>
            </div>
          ) : currentSection === 'users' ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <h2 className="text-xl">Gestão de Usuários (Em Breve)</h2>
            </div>
          ) : !currentBranch ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <h2 className="text-xl">Selecione uma empresa para visualizar os dados</h2>
              </div>
            </div>
          ) : (
            
            /* 🔹 RENDERIZAÇÃO PADRÃO DO DASHBOARD (overview) */
            <>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6">

                  {currentPageId === 'page-2' ? (
                    <AttendanceDashboardPage
                      branchId={currentBranch.id}
                      startDate={getDateRange(dateFilter).startDate}
                      endDate={getDateRange(dateFilter).endDate}
                    />
                  ) : currentPageId === 'page-3' ? (
                    <PerformancePage
                      activeFilters={activeFilters}
                      rawData={rawData}
                      branchId={currentBranch.id}
                    />
                  ) : currentPageId === 'page-4' ? (
                    <ActiveMessagesPage
                      branchId={currentBranch.id}
                      startDate={getDateRange(dateFilter).startDate}
                      endDate={getDateRange(dateFilter).endDate}
                    />
                  ) : (
                    // PÁGINA 1 (VISÃO GERAL / GRÁFICOS PADRÃO + OVERVIEW CONTINUAÇÃO)
                    <div className="flex flex-col gap-10">
                      
                      {/* 1. SEÇÃO DE GRÁFICOS PADRÃO */}
                      <div className="grid grid-cols-1 gap-6">
                        {currentPage?.charts?.map((chart) => {
                          const dataset = getChartDataset(chart.id)
                          const isChartLoading = isLoadingData && chart.id === 'chart-1'

                          const filteredDataset = selectedChartId === chart.id
                            ? dataset.filter((record: any) => {
                              return Object.entries(activeFilters).every(([field, values]) => {
                                if (!values.length) return true
                                if (!(field in record)) return true
                                return values.includes(String(record[field]))
                              })
                            })
                            : dataset

                          const grouped = filteredDataset.reduce((acc: any, item: any) => {
                            const key = item[chart.xField]
                            const value = Number(item[chart.yField] || 0)

                            if (!key) return acc
                            if (!acc[key]) acc[key] = 0
                            acc[key] += value

                            return acc
                          }, {})

                          const chartData = Object.entries(grouped).map(([name, value]) => ({
                            name,
                            value,
                          }))

                          // FEEDBACK UI: Carregando
                          if (isChartLoading) {
                            return (
                              <div key={chart.id} className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-xl bg-card/50 animate-pulse">
                                <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Sincronizando dados...</p>
                              </div>
                            )
                          }

                          // FEEDBACK UI: Sem Dados
                          if (chartData.length === 0) {
                            return (
                              <div key={chart.id} className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-xl bg-card/50">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Sem dados disponíveis ainda</h3>
                                <p className="text-sm text-muted-foreground max-w-[300px] text-center mt-2">
                                  Estamos processando os dados solicitados, isso pode levar uns segundos...
                                </p>
                              </div>
                            )
                          }

                          // RENDERIZAÇÃO: Gráfico OK
                          return (
                            <ChartCard
                              key={chart.id}
                              chart={{
                                ...chart,
                                data: chartData,
                              }}
                              isSelected={selectedChartId === chart.id}
                              onClick={() => setSelectedChartId((prev) => (prev === chart.id ? null : chart.id))}
                            />
                          )
                        })}
                      </div>

                      {/* 2. SEÇÃO OVERVIEW COMO CONTINUAÇÃO (ABAIXO DOS GRÁFICOS) */}
                      <div className="pt-4 border-t border-border/50">
                        <OverviewPage 
                          branchId={currentBranch.id}
                          startDate={getDateRange(dateFilter).startDate}
                          endDate={getDateRange(dateFilter).endDate}
                          contactsData={contactsSummaryProps}
                        />
                      </div>

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

              {/* Oculto nas páginas Customizadas */}
              {!['page-2', 'page-3', 'page-4'].includes(currentPageId) && (
                <FilterPanel
                  filters={activeChartFilters}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
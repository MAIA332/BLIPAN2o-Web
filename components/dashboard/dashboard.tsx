'use client'

import { useState, useEffect, useMemo } from 'react'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { FilterPanel } from '@/components/dashboard/filter-panel'
import { ChartCard } from '@/components/dashboard/chart-card'
import { PerformancePage } from '@/components/dashboard/performance/performance-page'
import { PageNavigation } from './page-navigation'

import { useAuth } from '@/lib/auth'
import { chartPages } from '@/lib/mock-data'
import { fetchDashboardData } from '@/lib/dashboard-service'
import type { DateFilterType } from '@/components/dashboard/header'

export function Dashboard() {
  const { user } = useAuth()

  const [currentBranch, setCurrentBranch] =
    useState<any | null>(null)

  const [rawData, setRawData] =
    useState<any>(null)

  const [dateFilter, setDateFilter] =
    useState<DateFilterType>('30d')

  const [isLoadingData, setIsLoadingData] =
    useState(false)

  const [currentPageId, setCurrentPageId] =
    useState(chartPages[0].id)

  const [currentSection, setCurrentSection] =
    useState('overview')

  const [activeFilters, setActiveFilters] =
    useState<Record<string, string[]>>({})

  const [selectedChartId, setSelectedChartId] =
    useState<string | null>(null)

  const currentPage = chartPages.find(
    (p) => p.id === currentPageId
  )

  const availableBranches =
    user?.branchs || []

  /*
   |-------------------------------------------------------------------------- 
   | FETCH DATA
   |-------------------------------------------------------------------------- 
   */

  const getDateRange = (
    filter: DateFilterType
  ) => {
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
    }

    return {
      startDate: start
        .toISOString()
        .split('T')[0],
      endDate: end
        .toISOString()
        .split('T')[0],
    }
  }

  useEffect(() => {
    if (!currentBranch) return

    const loadData = async () => {
      setIsLoadingData(true)

      try {
        const token =
          localStorage.getItem(
            'access_token'
          ) || ''

        const {
          startDate,
          endDate,
        } = getDateRange(dateFilter)

        const result =
          await fetchDashboardData({
            branchId:
              currentBranch.id,
            token,
            startDate,
            endDate,
          })

        console.log(
          'DADOS API:',
          result
        )

        setRawData(result)
      } catch (error) {
        console.error(
          'Erro ao buscar dados:',
          error
        )
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [currentBranch, dateFilter])

  /*
   |-------------------------------------------------------------------------- 
   | NORMALIZAÇÃO DOS DATASETS
   |-------------------------------------------------------------------------- 
   */

  const datasets = useMemo(() => {
    if (!rawData) {
      return {
        trackingRecords: [],
        occurrenceRecords: [],
      }
    }

    const trackingRecords: any[] = []
    const occurrenceRecords: any[] = []

    Object.entries(
      rawData.trackings?.data || {}
    ).forEach(
      ([category, items]: [
        string,
        any
      ]) => {
        items.forEach((item: any) => {
          let action =
            item.action || 'Unknown'

          if (
            typeof action === 'string' &&
            action.startsWith('{')
          ) {
            try {
              const parsed =
                JSON.parse(action)

              action =
                parsed.resource?.team ||
                parsed.type ||
                parsed.name ||
                'Default'
            } catch {
              action = 'Unknown'
            }
          }

          if (
            typeof action === 'string'
          ) {
            const isUUID =
              /^[0-9a-fA-F-]{30,}$/.test(
                action
              )

            if (isUUID) {
              action = 'Default'
            }
          }

          trackingRecords.push({
            category,
            action,
            count: Number(
              item.count || 0
            ),
          })
        })
      }
    )

    Object.entries(
      rawData.occurrences?.data || {}
    ).forEach(
      ([_, item]: any) => {
        occurrenceRecords.push({
          state_name:
            item.state_name ||
            'Unknown',
          occurrences_count:
            Number(
              item.occurrences_count ||
              0
            ),
        })
      }
    )

    return {
      trackingRecords,
      occurrenceRecords,
    }
  }, [rawData])

  /*
   |-------------------------------------------------------------------------- 
   | DATASET POR CHART
   |-------------------------------------------------------------------------- 
   */

  const getChartDataset = (
    chartId: string
  ) => {
    switch (chartId) {
      case 'chart-1':
        return datasets.trackingRecords
      case 'chart-2':
        return datasets.occurrenceRecords
      default:
        return []
    }
  }

  const selectedChart =
    currentPage?.charts.find(
      (c) => c.id === selectedChartId
    ) || null

  const selectedChartDataset =
    useMemo(() => {
      if (!selectedChart) return []

      return getChartDataset(
        selectedChart.id
      )
    }, [selectedChart, datasets])

  /*
   |-------------------------------------------------------------------------- 
   | FILTROS
   |-------------------------------------------------------------------------- 
   */

  const activeChartFilters =
    useMemo(() => {
      if (!selectedChart)
        return []

      const fields = [
        selectedChart.xField,
        'category',
        'action',
        'state_name',
      ]

      return fields
        .filter(Boolean)
        .filter(
          (value, index, self) =>
            self.indexOf(value) ===
            index
        )
        .map((field) => {
          const options =
            Array.from(
              new Set(
                selectedChartDataset
                  .map((record: any) =>
                    String(
                      record[field]
                    )
                  )
                  .filter(
                    (v) =>
                      v &&
                      v !== 'undefined'
                  )
              )
            )

          return {
            field,
            label:
              field ===
                'state_name'
                ? 'Estado'
                : field === 'action'
                  ? 'Ação'
                  : field === 'category'
                    ? 'Categoria'
                    : field,
            options,
          }
        })
        .filter(
          (filter) =>
            filter.options.length > 0
        )
    }, [
      selectedChart,
      selectedChartDataset,
    ])

  const handleFilterChange = (
    field: string,
    values: string[]
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: values,
    }))
  }

  useEffect(() => {
    setActiveFilters({})
  }, [selectedChartId])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={
          setCurrentSection
        }
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Header
          tenants={availableBranches}
          currentTenant={currentBranch}
          onTenantChange={
            setCurrentBranch
          }
          pageTitle={
            currentPage?.name ||
            'Dashboard'
          }
          dateFilter={dateFilter}
          onDateFilterChange={
            setDateFilter
          }
        />

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {!currentBranch ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <h2 className="text-xl">
                Selecione uma empresa
              </h2>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6">
                  {currentPageId ===
                    'page-3' ? (
                    <PerformancePage
                      activeFilters={
                        activeFilters
                      }
                      rawData={rawData}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {currentPage?.charts.map(
                        (chart) => {
                          const dataset =
                            getChartDataset(
                              chart.id
                            )

                          const isChartLoading =
                            isLoadingData &&
                            chart.id ===
                            'chart-1'

                          const filteredDataset =
                            selectedChartId ===
                              chart.id
                              ? dataset.filter(
                                (
                                  record: any
                                ) => {
                                  return Object.entries(
                                    activeFilters
                                  ).every(
                                    ([
                                      field,
                                      values,
                                    ]) => {
                                      if (
                                        !values.length
                                      )
                                        return true

                                      if (
                                        !(
                                          field in
                                          record
                                        )
                                      )
                                        return true

                                      return values.includes(
                                        String(
                                          record[
                                          field
                                          ]
                                        )
                                      )
                                    }
                                  )
                                }
                              )
                              : dataset

                          const grouped =
                            filteredDataset.reduce(
                              (
                                acc: any,
                                item: any
                              ) => {
                                const key =
                                  item[
                                  chart.xField
                                  ]

                                const value =
                                  Number(
                                    item[
                                    chart.yField
                                    ] || 0
                                  )

                                if (!key)
                                  return acc

                                if (
                                  !acc[key]
                                ) {
                                  acc[key] = 0
                                }

                                acc[key] +=
                                  value

                                return acc
                              },
                              {}
                            )

                          const chartData =
                            Object.entries(
                              grouped
                            ).map(
                              ([
                                name,
                                value,
                              ]) => ({
                                name,
                                value,
                              })
                            )

                          if (isChartLoading) {
                            return (
                              <div
                                key={chart.id}
                                className="flex items-center justify-center h-[300px] border rounded-lg"
                              >
                                Carregando gráfico...
                              </div>
                            )
                          }

                          return (
                            <ChartCard
                              key={chart.id}
                              chart={{
                                ...chart,
                                data:
                                  chartData,
                              }}
                              isSelected={
                                selectedChartId ===
                                chart.id
                              }
                              onClick={() =>
                                setSelectedChartId(
                                  (
                                    prev
                                  ) =>
                                    prev ===
                                      chart.id
                                      ? null
                                      : chart.id
                                )
                              }
                            />
                          )
                        }
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 border-t border-border bg-card">
                  <PageNavigation
                    pages={chartPages}
                    currentPageId={
                      currentPageId
                    }
                    onPageChange={
                      setCurrentPageId
                    }
                  />
                </div>
              </div>

              {currentPageId !== 'page-3' && (
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
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { FilterPanel } from '@/components/dashboard/filter-panel'
import { ChartCard } from '@/components/dashboard/chart-card'
import { PageNavigation } from '@/components/dashboard/page-navigation'
import { PerformancePage } from '@/components/dashboard/performance/performance-page'
import {
  tenants,
  chartPages,
  filterOptions,
  type Tenant,
} from '@/lib/mock-data'

export function Dashboard() {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(tenants[0])
  const [currentPageId, setCurrentPageId] = useState(chartPages[0].id)
  const [currentSection, setCurrentSection] = useState('overview')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  )

  const currentPage = chartPages.find((p) => p.id === currentPageId)

  const handleFilterChange = (field: string, values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: values,
    }))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <Header
          tenants={tenants}
          currentTenant={currentTenant}
          onTenantChange={setCurrentTenant}
          pageTitle={currentPage?.name || 'Dashboard'}
        />

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Charts Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Content */}
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

            {/* Page Navigation - Fixed at bottom */}
            <div className="flex-shrink-0">
              <PageNavigation
                pages={chartPages}
                currentPageId={currentPageId}
                onPageChange={setCurrentPageId}
              />
            </div>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  )
}

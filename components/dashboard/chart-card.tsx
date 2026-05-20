'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Maximize2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chart as ChartType } from '@/lib/mock-data'

interface ChartCardProps {
  chart: ChartType
  activeFilters?: Record<string, string[]>
  onClick?: () => void
}

export function ChartCard({ chart, activeFilters = {}, onClick }: ChartCardProps) {
  const chartData = useMemo(() => {
    let filtered = chart.data

    // Apply action filter
    if (activeFilters.action && activeFilters.action.length > 0 && chart.xField === 'action') {
      filtered = filtered.filter((d) =>
        activeFilters.action.some(
          (action) => d.name.toLowerCase().includes(action.toLowerCase())
        )
      )
    }

    // Apply state filter
    if (activeFilters.state_name && activeFilters.state_name.length > 0 && chart.xField === 'state_name') {
      filtered = filtered.filter((d) =>
        activeFilters.state_name.some(
          (state) => d.name.toLowerCase().includes(state.toLowerCase())
        )
      )
    }

    // Apply category filter
    if (activeFilters.category && activeFilters.category.length > 0) {
      filtered = filtered.filter((d) =>
        activeFilters.category.some(
          (cat) => d.category?.toLowerCase().includes(cat.toLowerCase()) || d.name.toLowerCase().includes(cat.toLowerCase())
        )
      )
    }

    return filtered.map((d) => ({
      name: d.name,
      value: d.value,
    }))
  }, [chart.data, chart.xField, activeFilters])

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: -10, bottom: 0 },
    }

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-1)', r: 4 }}
              activeDot={{ r: 6, fill: 'var(--chart-1)' }}
            />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
            />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <Card
      className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {chart.title}
        </CardTitle>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

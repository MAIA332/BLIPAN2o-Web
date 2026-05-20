'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Info, Download, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContactsData {
  totalContacts: number
  totalContactsChange: number
  noResponse: number
  noResponseChange: number
  withInteraction: number
  withInteractionChange: number
  rejectionRate: number
  interactionRate: number
  chartData: { date: string; comInteracao: number; semResposta: number }[]
}

interface ContactsCardProps {
  data: ContactsData
  dateRange: string
}

export function ContactsCard({ data, dateRange }: ContactsCardProps) {
  const formatChange = (value: number) => {
    const isNegative = value < 0
    return (
      <span className={`flex items-center gap-1 text-xs ${isNegative ? 'text-destructive' : 'text-green-500'}`}>
        {isNegative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
        {isNegative ? '' : '+'}{value}%
      </span>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Contatos
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Métricas de contatos do chatbot</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Acompanhe as métricas relativas aos contatos que conversaram com o seu chatbot.
        </p>
        <p className="text-xs text-muted-foreground mb-4">{dateRange}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left stats */}
          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de contatos únicos</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{data.totalContacts}</span>
                  {formatChange(data.totalContactsChange)}
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contatos que não responderam</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-foreground">{data.noResponse}</span>
                  {formatChange(data.noResponseChange)}
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contatos com interação</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-foreground">{data.withInteraction}</span>
                  {formatChange(data.withInteractionChange)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="comInteracao"
                  name="Com interação"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="semResposta"
                  name="Sem resposta"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Right stats */}
          <div className="space-y-3">
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Taxa de rejeição</span>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">{data.rejectionRate.toFixed(2)}%</span>
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full"
                  style={{ width: `${data.rejectionRate}%` }}
                />
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Taxa de interação</span>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">{data.interactionRate.toFixed(2)}%</span>
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${data.interactionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface TransitionData {
  fromBlock: string
  toBlock: string
  probability: number
}

interface TransitionProbabilityCardProps {
  data: TransitionData[]
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function TransitionProbabilityCard({ data }: TransitionProbabilityCardProps) {
  // Group by fromBlock for better visualization
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.fromBlock]) {
      acc[item.fromBlock] = []
    }
    acc[item.fromBlock].push(item)
    return acc
  }, {} as Record<string, TransitionData[]>)

  const chartData = Object.entries(groupedData).map(([fromBlock, transitions]) => {
    const result: Record<string, string | number> = { name: fromBlock }
    transitions.forEach((t) => {
      result[t.toBlock] = t.probability
    })
    return result
  })

  // Get all unique destination blocks
  const allDestinations = [...new Set(data.map((d) => d.toBlock))]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Probabilidade de Transição de States
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Probabilidade de cada bloco levar para outro bloco específico. Mostra a tendência do cliente de seguir determinados caminhos.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Essa informação mostra em termos de média geral que quando um cliente cai em um bloco, qual é a chance de que esse cliente siga para algum dos blocos possíveis.
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
              {allDestinations.map((dest, index) => (
                <Bar
                  key={dest}
                  dataKey={dest}
                  name={dest}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  radius={index === allDestinations.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {allDestinations.map((dest, index) => (
            <div key={dest} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">{dest}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

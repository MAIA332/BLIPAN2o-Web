'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  chart: any
  onClick?: () => void
  isSelected?: boolean
}

export function ChartCard({
  chart,
  onClick,
  isSelected,
}: ChartCardProps) {
  const chartData = chart.data || []

  return (
    <Card
      onClick={onClick}
      className={cn(
        'bg-card border-border transition-all cursor-pointer hover:border-blue-400',
        isSelected &&
          'border-blue-500 shadow-[0_0_0_1px_rgb(59_130_246)]'
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {chart.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                />

                <XAxis
                  dataKey="name"
                  fontSize={11}
                />

                <YAxis fontSize={11} />

                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.1)' }} // Deixa o fundo da barra em hover mais sutil
                  contentStyle={{ 
                    backgroundColor: '#18181b', // Fundo escuro (zinc-900)
                    borderColor: '#27272a',     // Borda sutil (zinc-800)
                    borderRadius: '6px',
                    color: '#e4e4e7'            // Cor do texto geral
                  }}
                  labelStyle={{ 
                    color: '#f4f4f5',           // Cor do título/nome da barra mais destacada
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}
                  itemStyle={{ 
                    color: '#0ea5e9'            // Mantém o azul para o valor numérico
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Sem dados disponíveis ainda...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
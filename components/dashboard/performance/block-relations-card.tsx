'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BlockRelation {
  source: string
  target: string
  value: number
}

interface BlockRelationsCardProps {
  relations: BlockRelation[]
  blocks: string[]
}

export function BlockRelationsCard({ relations, blocks }: BlockRelationsCardProps) {
  // Create a simple flow visualization
  const flowData = useMemo(() => {
    // Group relations by source
    const grouped = relations.reduce((acc, rel) => {
      if (!acc[rel.source]) {
        acc[rel.source] = []
      }
      acc[rel.source].push(rel)
      return acc
    }, {} as Record<string, BlockRelation[]>)

    return grouped
  }, [relations])

  // Find max value for scaling
  const maxValue = Math.max(...relations.map((r) => r.value), 1)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Relação entre Blocos
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Relação direta e causal entre os blocos do fluxo. Identifica os caminhos mais acessados pelos clientes.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Visualização dos caminhos mais acessados pelos clientes de forma direta. A espessura das linhas indica a frequência de transição.
        </p>

        {/* Flow diagram */}
        <div className="relative bg-secondary/30 rounded-lg p-6 overflow-x-auto">
          <div className="flex flex-col gap-4 min-w-[600px]">
            {Object.entries(flowData).map(([source, targets], sourceIndex) => (
              <div key={source} className="flex items-center gap-4">
                {/* Source block */}
                <div className="flex-shrink-0 w-40">
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <span className="text-sm font-medium text-foreground truncate block">
                      {source}
                    </span>
                  </div>
                </div>

                {/* Arrows and targets */}
                <div className="flex-1 flex flex-col gap-2">
                  {targets.map((rel, idx) => {
                    const width = Math.max(2, (rel.value / maxValue) * 8)
                    const opacity = 0.3 + (rel.value / maxValue) * 0.7
                    
                    return (
                      <div key={`${rel.source}-${rel.target}-${idx}`} className="flex items-center gap-2">
                        {/* Arrow line */}
                        <div className="flex-1 flex items-center">
                          <div
                            className="h-px flex-1"
                            style={{
                              height: `${width}px`,
                              backgroundColor: `oklch(0.7 0.15 180 / ${opacity})`,
                            }}
                          />
                          {/* Arrow head */}
                          <div
                            className="w-0 h-0"
                            style={{
                              borderTop: `${width + 4}px solid transparent`,
                              borderBottom: `${width + 4}px solid transparent`,
                              borderLeft: `${width + 6}px solid oklch(0.7 0.15 180 / ${opacity})`,
                            }}
                          />
                        </div>

                        {/* Target block */}
                        <div className="flex-shrink-0 w-40">
                          <div className="bg-card border border-primary/30 rounded-lg p-3 text-center shadow-sm">
                            <span className="text-sm font-medium text-foreground truncate block">
                              {rel.target}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {rel.value} transições
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-foreground">{blocks.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Blocos únicos</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-foreground">{relations.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Conexões</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-foreground">
              {relations.reduce((acc, r) => acc + r.value, 0)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Total de transições</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
